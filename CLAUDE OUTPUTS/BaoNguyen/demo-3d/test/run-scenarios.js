/*
 * Kiểm thử tự động: chạy mọi kịch bản, kiểm tra ở MỖI bước mô phỏng (0,1 s) rằng
 * không có hai phương tiện nào giao nhau (phép thử SAT trên hình chữ nhật thân xe),
 * và hệ thống không kẹt cứng (có xe ra khỏi bãi, không xe nào chờ quá ngưỡng).
 * Chạy: node test/run-scenarios.js [số phút mô phỏng, mặc định 90] [seed...]
 */
'use strict';
const path = require('path');
const { Sim, SCENARIOS } = require(path.join(__dirname, '..', 'sim-core.js'));

const minutes = +process.argv[2] || 90;
const seeds = process.argv.slice(3).map(Number);
if (!seeds.length) seeds.push(1, 2);
const MAX_WAIT = 20 * 60; // không xe nào được đứng chờ liên tục quá 20 phút
const MIN_CLEAR = 0.3;    // khoảng hở tối thiểu giữa hai thân xe (m)

let failed = 0;
const rows = [];
for (const sc of SCENARIOS) {
  for (const seed of seeds) {
    const sim = new Sim(sc.id, seed);
    const t0 = Date.now();
    const steps = Math.round(minutes * 60 / 0.1);
    for (let i = 0; i < steps; i++) sim.step();
    const s = sim.summary();
    const errs = [];
    if (s.collisions > 0) errs.push(`${s.collisions} lần giao nhau`);
    if (s.invariant > 0) errs.push(`${s.invariant} vi phạm bất biến ô lưới ${JSON.stringify(sim.firstInv)}`);
    if (s.minClear < MIN_CLEAR) errs.push(`khoảng hở nhỏ nhất ${s.minClear.toFixed(2)} m < ${MIN_CLEAR}`);
    if (s.maxWait > MAX_WAIT) errs.push(`xe #${sim.stats.maxWaitId} chờ ${Math.round(s.maxWait)} s`);
    const done = s.tqOut + s.swaps + s.yardIn + s.yardOut;
    if (done < minutes / 6) errs.push(`thông lượng quá thấp (${done} lượt)`);
    if (errs.length) failed++;
    rows.push({ 'kịch bản': sc.id, seed, 'phút': minutes, 'va chạm': s.collisions, 'hở min (m)': s.minClear.toFixed(2),
      'đổi đầu kéo': s.swaps, 'xe TQ ra': s.tqOut, 'hạ/lấy bãi': `${s.yardIn}/${s.yardOut}`, 'kiểm hóa': s.inspected,
      'chờ lâu nhất (s)': Math.round(s.maxWait), 'hàng chờ Km0': s.queueW, 'ms': Date.now() - t0, 'kết quả': errs.length ? 'LỖI: ' + errs.join('; ') : 'ĐẠT' });
  }
}
console.table(rows);
if (failed) { console.error(`\n${failed} lượt chạy KHÔNG ĐẠT`); process.exit(1); }
console.log('\nTất cả kịch bản ĐẠT: không có hai xe nào giao nhau ở bất kỳ bước mô phỏng nào.');
