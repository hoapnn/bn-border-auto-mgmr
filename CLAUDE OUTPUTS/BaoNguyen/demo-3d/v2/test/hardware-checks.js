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
// cổng RFID/OCR đặt đúng cạnh các tim cổng của layout
const rf = (id) => HW.DEVICES.find(d => d.id === id);
ok(Math.abs(rf('RFID-01').z - LAYOUT.igvInStopZ) < 6, 'RFID-01 xa vạch dừng làn IGV vào');
ok(Math.abs(rf('RFID-02').z - LAYOUT.igvOutStopZ) < 8, 'RFID-02 xa vạch dừng làn IGV ra');

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
