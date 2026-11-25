/*
 * Kiểm tra dữ liệu phần cứng (hardware.js) và mô hình 5G: chạy nhanh, không cần mô phỏng.
 * Chạy: node test/hardware-checks.js
 */
'use strict';
const path = require('path');
const HW = require(path.join(__dirname, '..', 'hardware.js'));
const { Sim, LAYOUT } = require(path.join(__dirname, '..', 'sim-core.js'));
let bad = 0;
const ok = (c, msg) => { if (!c) { bad++; console.error('LỖI: ' + msg); } };

// 1) Mã thiết bị duy nhất, loại hợp lệ, nằm trong khung bản vẽ mở rộng (gồm đường tiếp cận Km0)
const ids = new Set();
for (const d of [...HW.CELLS, ...HW.DEVICES]) {
  ok(!ids.has(d.id), `trùng mã ${d.id}`); ids.add(d.id);
  ok(Number.isFinite(d.x) && Number.isFinite(d.z) && d.x > -10 && d.x < 340 && d.z > -30 && d.z < 335, `${d.id} ngoài khung`);
}
for (const d of HW.DEVICES) ok(HW.KIND_INFO[d.kind], `${d.id} loại lạ ${d.kind}`);
// mỗi vùng giao cắt (7) có 1 đèn tín hiệu và 1 LiDAR
for (let z = 1; z <= 7; z++) {
  ok(HW.DEVICES.filter(d => d.kind === 'tl' && d.zone === z).length === 1, `vùng ${z} thiếu / thừa đèn tín hiệu`);
  ok(HW.DEVICES.filter(d => d.kind === 'lidar' && d.zone === z).length === 1, `vùng ${z} thiếu / thừa LiDAR`);
}
// Trạm kiểm soát VVS: 17 trạm, camera + RFID cùng cột, không còn đầu đọc RFID đứng riêng
ok(HW.CHECKPOINTS.length === 17, `phải có 17 trạm kiểm soát, được ${HW.CHECKPOINTS.length}`);
ok(!HW.DEVICES.some(d => d.kind === 'rfid'), 'còn đầu đọc RFID đứng riêng (phải gộp vào cột trạm kiểm soát)');
const cpIds = new Set();
for (const c of HW.CHECKPOINTS) {
  ok(!cpIds.has(c.id) && !ids.has(c.id), `trùng mã trạm ${c.id}`); cpIds.add(c.id);
  ok(Number.isFinite(c.x) && Number.isFinite(c.z) && c.x > -10 && c.x < 340 && c.z > -30 && c.z < 335, `${c.id} ngoài khung`);
  ok(c.trig && c.trig.length === 3 && c.barrier, `${c.id} thiếu vùng kích hoạt / barie`);
}
ok(HW.CHECKPOINTS.filter(c => /^CP-L\d$/.test(c.id)).length === 8, 'phải có 8 trạm ở 8 làn nhà chuyển tải');
ok(HW.CHECKPOINTS.filter(c => /^CP-XB/.test(c.id)).length === 4, 'phải có 4 trạm ở đường qua biên');
ok(HW.CHECKPOINTS.some(c => c.id === 'CP-TQ1') && HW.CHECKPOINTS.some(c => c.id === 'CP-TQ2') && HW.CHECKPOINTS.some(c => c.id === 'CP-VN3'), 'thiếu trạm cổng TQ / cân');
const tqIn = HW.CHECKPOINTS.find(c => c.id === 'CP-TQ1');
ok(Math.abs(tqIn.z - LAYOUT.igvInStopZ) < 6, 'CP-TQ1 xa vạch dừng làn IGV vào');
// định dạng biển LED và mô hình giờ
const idle = HW.ledFormat(null, 0, 'idle'), rd = HW.ledFormat('GX A5934Z', 75, 'read'), op = HW.ledFormat('GX A5934Z', 75, 'open');
ok(idle.l1 === 'SẴN SÀNG', 'LED rảnh phải hiện SẴN SÀNG');
ok(rd.l1 === 'GX A5934Z' && /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}$/.test(rd.l2), 'LED phải có biển số và ngày giờ');
ok(op.l3 === 'MỜI QUA', 'LED mở barie phải hiện MỜI QUA');
ok(HW.ledTime(75) === '06:01:15', 'giờ mô phỏng bắt đầu 06:00:00');

// 2) Mô hình độ trễ: đơn điệu theo khoảng cách, đúng ngưỡng, mất sóng ngoài biên
const c0 = HW.CELLS[0];
let prev = 0;
for (let d = 0; d <= c0.r[2] + 10; d += 5) {
  const l = HW.cellLatency(c0, c0.x - d, c0.z);  // hướng tây: không qua vật cản nào
  if (d <= c0.r[2]) ok(l >= prev - 1e-9, `độ trễ không đơn điệu tại ${d} m`);
  if (d <= c0.r[2]) prev = l;
}
ok(HW.cellLatency(c0, c0.x, c0.z - 1) < 12, 'sát trụ phải < 12 ms');
ok(HW.cellLatency(c0, c0.x - c0.r[0], c0.z) <= 20.01, 'biên r1 phải ≤ 20 ms');
ok(HW.cellLatency(c0, c0.x - c0.r[2] - 5, c0.z) === Infinity, 'ngoài r3 phải mất sóng');
ok(HW.speedFactor(15) === 1 && HW.speedFactor(30) === 0.8 && HW.speedFactor(70) === 0.5 && HW.speedFactor(110) === 0.3 && HW.speedFactor(Infinity) === 0.15, 'bảng hệ số tốc độ');

// 3) Toàn bộ tuyến IGV được phủ sóng, không có đoạn mất sóng khi mọi trạm hoạt động
const sim = new Sim('av', 1);
const { buildPath } = require(path.join(__dirname, '..', 'sim-core.js'));
for (const key of ['igvIn', 'igvIns', 'igvOut']) {
  const P = buildPath(sim.routes[key], 10); let worst = 0;
  for (let i = 0; i < P.n; i += 4) worst = Math.max(worst, HW.serving(P.X[i], P.Z[i], {}).lat);
  ok(worst <= 50, `tuyến ${key}: độ trễ xấu nhất ${worst.toFixed(0)} ms > 50 ms khi đủ trạm`);
}
// 4) Mất trạm 5G-07 (trong nhà): dưới mái nhà chuyển tải phải xấu đi rõ rệt (> 50 ms), có trạm thì ≤ 20 ms
const inShed = [[100, 95], [100, 130], [120, 140], [108, 155]];
for (const [x, z] of inShed) {
  const a = HW.serving(x, z, {}).lat, b = HW.serving(x, z, { '5G-07': true }).lat;
  ok(a <= 20, `trong nhà (${x},${z}) có trạm nhỏ phải ≤ 20 ms, được ${a.toFixed(0)}`);
  ok(b > 50, `trong nhà (${x},${z}) mất trạm nhỏ phải > 50 ms, được ${b.toFixed(0)}`);
}
// 5) Phần trăm pin trong khoảng hợp lý và giảm theo quãng đường
ok(HW.socOf(7, 0) >= 0.55 && HW.socOf(7, 0) <= 0.95 && HW.socOf(7, 10000) < HW.socOf(7, 0), 'mô hình pin');

if (bad) { console.error(`\n${bad} kiểm tra phần cứng KHÔNG ĐẠT`); process.exit(1); }
console.log(`Kiểm tra phần cứng ĐẠT: ${HW.CELLS.length} trạm 5G, ${HW.DEVICES.length} thiết bị cố định, độ trễ và vùng yếu đúng mô hình.`);
