/*
 * Kiểm thử tự động (v2): chạy mọi kịch bản, kiểm tra ở MỖI bước mô phỏng (0,1 s) rằng
 * không có hai phương tiện nào giao nhau, không xe nào chạm container đang nằm ở ô chờ
 * (phép thử SAT trên hình chữ nhật thân xe), và hệ thống không kẹt cứng.
 * Chạy: node test/run-scenarios.js [số phút mô phỏng, mặc định 60] [seed...]
 */
'use strict';
const path = require('path');
const { Sim, SCENARIOS } = require(path.join(__dirname, '..', 'sim-core.js'));

const minutes = +process.argv[2] || 60;
const seeds = process.argv.slice(3).map(Number);
if (!seeds.length) seeds.push(1, 2);
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const MAX_WAIT = 20 * 60; // không xe nào được đứng chờ liên tục quá 20 phút
const MIN_CLEAR = 0.3;    // khoảng hở tối thiểu giữa hai thân xe / giữa xe và container ở ô chờ (m)

let failed = 0;
const rows = [];
for (const sc of SCENARIOS) {
  if (only && !only.includes(sc.id)) continue;
  for (const seed of seeds) {
    const sim = new Sim(sc.id, seed);
    const t0 = Date.now();
    const steps = Math.round(minutes * 60 / 0.1);
    for (let i = 0; i < steps; i++) sim.step();
    const s = sim.summary();
    const errs = [];
    if (s.collisions > 0) errs.push(`${s.collisions} lần giao nhau`);
    if (s.invariant > 0) errs.push(`${s.invariant} vi phạm bất biến ô lưới ${JSON.stringify(sim.firstInv)}`);
    if (s.minClear < MIN_CLEAR) errs.push(`khoảng hở xe–xe nhỏ nhất ${s.minClear.toFixed(2)} m < ${MIN_CLEAR}`);
    if (s.minStatic < MIN_CLEAR) errs.push(`khoảng hở xe–container nhỏ nhất ${s.minStatic.toFixed(2)} m < ${MIN_CLEAR}`);
    if (s.minHw < MIN_CLEAR) errs.push(`khoảng hở xe–thiết bị cố định nhỏ nhất ${s.minHw.toFixed(2)} m < ${MIN_CLEAR} (${s.minHwId})`);
    if (s.maxWait > MAX_WAIT) errs.push(`xe #${sim.stats.maxWaitId} chờ ${Math.round(s.maxWait)} s`);
    const done = s.tqOut + s.vnOut;
    if (done < minutes / 4) errs.push(`thông lượng quá thấp (${done} lượt)`);
    if (errs.length) failed++;
    rows.push({ 'kịch bản': sc.id, seed, 'phút': minutes, 'va chạm': s.collisions, 'hở xe–xe (m)': s.minClear.toFixed(2),
      'hở xe–cont (m)': s.minStatic.toFixed(2), 'hở xe–thiết bị (m)': s.minHw.toFixed(2), 'cont nhập': s.imp, 'cont xuất': s.exp, 'xe TQ ra': s.tqOut, 'xe VN ra': s.vnOut,
      'lượt cầu trục': s.moves, 'kiểm hoá': s.inspected, 'chờ lâu nhất (s)': Math.round(s.maxWait), 'chờ IGV': s.queueIGV,
      'ms': Date.now() - t0, 'kết quả': errs.length ? 'LỖI: ' + errs.join('; ') : 'ĐẠT' });
  }
}
console.table(rows);
if (failed) { console.error(`\n${failed} lượt chạy KHÔNG ĐẠT`); process.exit(1); }
console.log('\nTất cả kịch bản ĐẠT: không có hai xe nào giao nhau, không xe nào chạm container ở ô chờ, ở bất kỳ bước mô phỏng nào.');
