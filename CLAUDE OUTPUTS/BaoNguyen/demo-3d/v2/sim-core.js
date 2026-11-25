/*
 * sim-core.js (v2) — Lõi mô phỏng bãi Bảo Nguyên theo layout PDF
 * "261102-PIVN_BN_ConceptPresentation_2026_V2" (trang 2–3, mặt bằng tổng thể).
 * Không phụ thuộc Three.js; chạy được trong trình duyệt (window.YardSim) và Node (require).
 *
 * Toạ độ: mét, gốc ở góc trên trái ảnh mặt bằng trong PDF, x sang phải (đông),
 * z xuống dưới (nam, phía Trung Quốc). 1 px ảnh gốc (2817 × 1995 px) = 0,1285 m,
 * hiệu chỉnh theo các kích thước ghi trên bản vẽ (36 220 / 40 600 / 46 600 / 27 200 / 30 000 / 8 000 / 6 000).
 *
 * Cơ chế chống va chạm giữ nguyên v1 (2 lớp):
 *  1) AN TOÀN — đặt chỗ ô lưới 1 m: mỗi xe giữ ô dưới thân (phình biên an toàn) và đặt trước
 *     ô trên quãng phanh phía trước; một ô chỉ một chủ.
 *  2) KHÔNG KẸT — vùng giao cắt độc quyền: chỉ khoá vùng khi đặt được ô xuyên vùng + khoảng
 *     thoát (dài thân xe + 3 m) phía sau; SIVIP chỉ mở barie khi đã đặt làn trong nhà chuyển tải
 *     và vị trí container (hoặc container cần lấy).
 *  Bộ kiểm tra độc lập (checkCollisions) dùng SAT trên hình chữ nhật thân xe ở mọi bước.
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module.exports) module.exports = mod;
  else root.YardSim = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  // Dữ liệu phần cứng (5G, IGV, cảm biến) nằm ở hardware.js; trình duyệt nạp trước file này (window.YardHW).
  const HW = typeof require === 'function' ? require('./hardware.js') : globalThis.YardHW;

  // ------------------------------------------------------------------ tiện ích
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  // ------------------------------------------------------------------ hằng số
  const DT = 0.1;              // bước mô phỏng (s)
  const DS = 0.25;             // bước lấy mẫu đường đi (m)
  const SAMPLE = 1.0;          // bước đặt chỗ ô dọc đường (m)
  const CELL = 1.0;            // ô lưới (m)
  const MARGIN = 0.6;          // biên an toàn thân xe khi đặt chỗ (m)
  const CLAIM_MARGIN = 1.0;    // biên khi đặt chỗ phía trước
  const REAR_TOL = 0.5;        // ô cách đuôi xe quá ngưỡng này (m) coi là phía sau, không chặn xe
  const GX0 = -10, GZ0 = -120, GW = 260, GH = 445; // lưới bao: x -10..250, z -120..325
  const HALF_DIAG = CELL * Math.SQRT2 / 2;
  const EXIT_CLEAR = 3;

  const TRACTOR_LEN = 6.2, TRACTOR_W = 2.5;
  const FIFTH_WHEEL = 4.2, CAB_LEN = 3.0, KINGPIN_FRONT = 1.2;
  const TRAILER_LEN = 12.5, TRAILER_W = 2.6, TRAILER_AXIS = 8.0;
  const CONT_LEN = 12.2, CONT_W = 2.44, CONT_H = 2.6;
  const TRUCK_TOTAL = CAB_LEN + TRAILER_LEN;          // 15,5 m
  const CONT_BACK = FIFTH_WHEEL + TRAILER_LEN / 2 - KINGPIN_FRONT; // đầu xe → tâm container: 9,25 m
  const TIERS = 2;             // số tầng container tại mỗi ô chờ trong nhà chuyển tải (giả định)
  const CRANE_REST_Y = 10.5, CRANE_SPEED = 1.5, HOIST_T = 16; // cầu trục (giả định)
  const TRUCK_CONT_Y = 2.75;   // tâm container khi nằm trên moóc

  // ------------------------------------------------------------------ mặt bằng (theo PDF, xem README)
  const PX = 0.1285;
  const LAYOUT = {
    px: PX, planW: 2817, planH: 1995,
    // ranh giới dự án (đường đỏ trên bản vẽ)
    fence: [[33.2, 12.5], [195.1, 12.5], [195.1, 124.0], [326.4, 124.0], [321.3, 187.0], [314.8, 202.4], [301.3, 228.7],
      [20.9, 229.4], [5.1, 187.6], [33.7, 170.3], [45.0, 129.8], [32.8, 100.2]],
    site: { x0: 30, x1: 196, z0: 12, z1: 230 },
    // --- xe nội địa (VN)
    topZ: 19.5,                    // đường phía bắc, chiều vào (từ cổng nhập khẩu sang tây)
    vnS: 60,                       // đường phía tây, chiều xuống nhà chuyển tải
    nwStopZ: -4, northZ: -95,      // cổng xuất khẩu (tây bắc): xe vào từ phía bắc
    neInX: 196.5, neStopZ: 4,      // cổng nhập khẩu (đông bắc): xe chờ trên đường trục chính
    exitZ: 28, exitX: 205.0,       // làn ra cổng đông bắc, nhập đường trục chính đi lên phía VN
    exitImpX: 190.8, exitExpX: 181, scaleStopZ: 40, // làn ra qua trạm cân (xe có hàng) / làn ra xe rỗng
    scaleNE: [187.9, 193.8, 38.5, 70.0], scaleNW: [38.5, 44.3, 25.7, 54.0],
    topLot: [64.3, 176.0, 25.7, 90.0],
    stallsTop: { x0: 91.9, w: 4.42, n: 16, rows: [[41.4, 56.2], [61.3, 75.8]] },
    // --- nhà chuyển tải 8 làn (4 làn xe nội địa ở trên, 4 làn IGV ở dưới)
    shed: { x0: 90.6, x1: 126.6, z0: 87.8, z1: 160.0, xm: 108.6, zSplit: [121.9, 124.2] },
    laneZc: [92.4, 101.3, 109.8, 118.2, 129.1, 137.6, 145.9, 154.4],
    laneHalf: ['E', 'E', 'W', 'W', 'E', 'E', 'W', 'W'],
    stopFront: { E: 124.0, W: 107.0 },
    // --- làn IGV (xe TQ) theo bản vẽ: vào làn trái, đi vòng quanh bãi đỗ phía tây nam, vào nhà chuyển tải từ phía tây
    igvStrip: [194.7, 203.5],
    igvIn: 195.4, igvOut: 202.0, igvInStopZ: 214, igvOutStopZ: 222, southZ: 300,
    bandZ: 155.3, bandX: 137.2, bandBotZ: 207.5, bandWX: 58.5, apronZ: 137,
    insZ: 198, insFront: [83, 106],          // khu kiểm hoá (giả định: bãi 11 ô phía tây nam)
    stallsSW: { x0: 75.4, w: 4.45, n: 11, z0: 175.4, z1: 190.8 },
    // --- cổng trung tâm (thông quan xe thường, không thuộc phạm vi điều phối của bãi)
    road: [194.7, 235.3], thruS: [211.0, 219.7], thruN: [226.5, 233.5], boothS: 193.5, boothN: 178,
    island: [213.3, 217.8, 171.8, 199.6], seps: [208.6, 222.6, 231.2],
    blockL: [155.8, 192.0, 172.0, 199.2], blockR: [238.6, 274.7, 172.0, 199.2],
    gateZ: 185.7,
  };
  const LANES = LAYOUT.laneZc.map((zc, i) => {
    const half = LAYOUT.laneHalf[i]; const front = LAYOUT.stopFront[half];
    return { i, no: i + 1, type: i < 4 ? 'vn' : 'tq', half, zc, tz: zc - 1.5, sz: zc + 1.9, front, cx: front - CONT_BACK };
  });

  // Vùng giao cắt độc quyền: mỗi vùng là 1 hoặc nhiều hình chữ nhật [x0,x1,z0,z1]
  const ZONE_RECTS = [
    { name: 'Nhập làn cổng xuất khẩu (tây bắc)', r: [[36, 80, 2, 40]] },
    { name: 'Nhập làn ra cổng nhập khẩu (đông bắc)', r: [[176, 200, 23, 37]] },
    { name: 'Rẽ vào làn xe nội địa', r: [[44, 89, 82, 122]] },
    { name: 'Ra khỏi nhà chuyển tải (xe nội địa)', r: [[127, 197, 80, 123]] },
    { name: 'Rẽ vào làn IGV', r: [[48, 89, 122, 172]] },
    { name: 'Ra khỏi nhà chuyển tải (IGV)', r: [[127, 206, 123, 151], [127, 151, 151, 172]] },
    { name: 'Nhập làn sau kiểm hoá', r: [[48, 81, 183, 214]] },
  ];

  // ------------------------------------------------------------------ đường đi
  function buildPath(wps, radius, opts) {
    radius = radius || 10;
    const pts = [[wps[0][0], wps[0][1]]];
    for (let i = 1; i < wps.length - 1; i++) {
      const p0 = wps[i - 1], p1 = wps[i], p2 = wps[i + 1];
      let ax = p0[0] - p1[0], az = p0[1] - p1[1]; const la = Math.hypot(ax, az); ax /= la; az /= la;
      let bx = p2[0] - p1[0], bz = p2[1] - p1[1]; const lb = Math.hypot(bx, bz); bx /= lb; bz /= lb;
      const theta = Math.acos(clamp(ax * bx + az * bz, -1, 1));
      if (Math.PI - theta < 1e-3) { pts.push([p1[0], p1[1]]); continue; }
      let t = radius / Math.tan(theta / 2);
      const tmax = Math.min(la * (i === 1 ? 1 : 0.5), lb * (i === wps.length - 2 ? 1 : 0.5));
      if (t > tmax) t = tmax;
      const r = t * Math.tan(theta / 2);
      const t1 = [p1[0] + ax * t, p1[1] + az * t], t2 = [p1[0] + bx * t, p1[1] + bz * t];
      let mx = ax + bx, mz = az + bz; const lm = Math.hypot(mx, mz); mx /= lm; mz /= lm;
      const d = r / Math.sin(theta / 2);
      const c = [p1[0] + mx * d, p1[1] + mz * d];
      const a1 = Math.atan2(t1[1] - c[1], t1[0] - c[0]);
      const a2 = Math.atan2(t2[1] - c[1], t2[0] - c[0]);
      let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const nArc = Math.max(4, Math.ceil(Math.abs(da) * r / 0.2));
      for (let k = 0; k <= nArc; k++) {
        const a = a1 + da * k / nArc;
        pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
      }
    }
    pts.push([wps[wps.length - 1][0], wps[wps.length - 1][1]]);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = cum[cum.length - 1];
    const n = Math.max(2, Math.ceil(L / DS) + 1);
    const X = new Float64Array(n), Z = new Float64Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const s = Math.min(i * DS, L);
      while (j < pts.length - 2 && cum[j + 1] < s) j++;
      const seg = cum[j + 1] - cum[j] || 1e-9;
      const f = clamp((s - cum[j]) / seg, 0, 1);
      X[i] = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f;
      Z[i] = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f;
    }
    const h0 = norm(X[1] - X[0], Z[1] - Z[0]);
    const h1 = norm(X[n - 1] - X[n - 2], Z[n - 1] - Z[n - 2]);
    const cap = new Float32Array(n);
    const hd = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      hd[i] = Math.atan2(Z[b] - Z[a], X[b] - X[a]);
    }
    const W = 16, S = LAYOUT.site;
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - W), b = Math.min(n - 1, i + W);
      let dh = hd[b] - hd[a]; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
      const k = Math.abs(dh) / Math.max(DS, (b - a) * DS);
      let c = k > 1e-4 ? Math.sqrt(1.1 / k) : 99;
      const inside = X[i] > S.x0 && X[i] < S.x1 && Z[i] > S.z0 && Z[i] < S.z1;
      c = Math.min(c, inside ? 5.5 : 8.0);
      cap[i] = c;
    }
    return { X, Z, n, len: L, h0, h1, cap, wps, name: opts && opts.name };
  }
  function norm(x, z) { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; }
  function ptAt(p, s, out) {
    if (s <= 0) { out[0] = p.X[0] + p.h0[0] * s; out[1] = p.Z[0] + p.h0[1] * s; return out; }
    if (s >= p.len) { const e = s - p.len; out[0] = p.X[p.n - 1] + p.h1[0] * e; out[1] = p.Z[p.n - 1] + p.h1[1] * e; return out; }
    const fi = s / DS; const i = Math.floor(fi); const f = fi - i;
    const i2 = Math.min(i + 1, p.n - 1);
    out[0] = p.X[i] + (p.X[i2] - p.X[i]) * f; out[1] = p.Z[i] + (p.Z[i2] - p.Z[i]) * f; return out;
  }
  function capAt(p, s) { const i = clamp(Math.round(s / DS), 0, p.n - 1); return p.cap[i]; }
  function sNear(p, x, z) {
    let best = 1e18, bi = 0;
    for (let i = 0; i < p.n; i++) { const d = (p.X[i] - x) ** 2 + (p.Z[i] - z) ** 2; if (d < best) { best = d; bi = i; } }
    return Math.min(bi * DS, p.len);
  }

  // ------------------------------------------------------------------ hình học thân xe (OBB)
  function obbFromPts(fx, fz, rx, rz, hw, out) {
    const ux = fx - rx, uz = fz - rz; const l = Math.hypot(ux, uz) || 1;
    out.cx = (fx + rx) / 2; out.cz = (fz + rz) / 2; out.ux = ux / l; out.uz = uz / l; out.hl = l / 2; out.hw = hw; return out;
  }
  function mkObb() { return { cx: 0, cz: 0, ux: 1, uz: 0, hl: 1, hw: 1 }; }
  function mkPool() { const p = [mkObb(), mkObb()]; p.one = [p[0]]; p.two = [p[0], p[1]]; return p; }
  const _p1 = [0, 0], _p2 = [0, 0], _p3 = [0, 0];

  function bodiesAt(veh, st, s, out) {
    const p = st.path, dir = st.dir;
    ptAt(p, s, _p1);
    ptAt(p, s - dir * TRACTOR_LEN, _p2);
    const hx = _p1[0] - _p2[0], hz = _p1[1] - _p2[1]; const hl = Math.hypot(hx, hz) || 1;
    const fx = _p1[0], fz = _p1[1], rx = _p2[0], rz = _p2[1];
    if (!veh.trailer) { obbFromPts(fx, fz, rx, rz, TRACTOR_W / 2, out[0]); return out.one; }
    const ux = (fx - rx) / hl, uz = (fz - rz) / hl;
    obbFromPts(fx, fz, fx - ux * CAB_LEN, fz - uz * CAB_LEN, TRACTOR_W / 2, out[0]);
    ptAt(p, s - dir * FIFTH_WHEEL, _p2);
    ptAt(p, s - dir * (FIFTH_WHEEL + TRAILER_AXIS), _p3);
    const t = norm(_p2[0] - _p3[0], _p2[1] - _p3[1]);
    obbFromPts(_p2[0] + t[0] * KINGPIN_FRONT, _p2[1] + t[1] * KINGPIN_FRONT,
      _p2[0] - t[0] * (TRAILER_LEN - KINGPIN_FRONT), _p2[1] - t[1] * (TRAILER_LEN - KINGPIN_FRONT), TRAILER_W / 2, out[1]);
    return out.two;
  }
  function obbOverlap(a, b) {
    const axes = [[a.ux, a.uz], [-a.uz, a.ux], [b.ux, b.uz], [-b.uz, b.ux]];
    const dx = b.cx - a.cx, dz = b.cz - a.cz;
    for (const [ax, az] of axes) {
      const ra = a.hl * Math.abs(a.ux * ax + a.uz * az) + a.hw * Math.abs(-a.uz * ax + a.ux * az);
      const rb = b.hl * Math.abs(b.ux * ax + b.uz * az) + b.hw * Math.abs(-b.uz * ax + b.ux * az);
      if (Math.abs(dx * ax + dz * az) > ra + rb - 1e-6) return false;
    }
    return true;
  }
  function corners(o) {
    const vx = -o.uz, vz = o.ux; const r = [];
    for (const [a, b] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) r.push([o.cx + o.ux * o.hl * a + vx * o.hw * b, o.cz + o.uz * o.hl * a + vz * o.hw * b]);
    return r;
  }
  function segDist(px, pz, ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az; const l2 = dx * dx + dz * dz || 1e-12;
    const t = clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1);
    return Math.hypot(px - ax - dx * t, pz - az - dz * t);
  }
  function obbDistance(a, b) {
    if (obbOverlap(a, b)) return 0;
    const ca = corners(a), cb = corners(b); let d = 1e9;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const b1 = cb[j], b2 = cb[(j + 1) % 4], a1 = ca[j], a2 = ca[(j + 1) % 4];
      d = Math.min(d, segDist(ca[i][0], ca[i][1], b1[0], b1[1], b2[0], b2[1]), segDist(cb[i][0], cb[i][1], a1[0], a1[1], a2[0], a2[1]));
    }
    return d;
  }

  // ------------------------------------------------------------------ kịch bản
  // rates: lượt/giờ. tqImp = xe TQ chở hàng nhập vào nhà chuyển tải; vnExp = xe VN chở hàng xuất;
  // thru = xe thông quan thường qua cổng trung tâm (mỗi chiều). Xe VN nhận hàng nhập và xe TQ rỗng
  // nhận hàng xuất được SIVIP gọi khi container đã nằm ở ô chờ.
  const SCENARIOS = [
    { id: 'normal', name: 'Vận hành bình thường',
      desc: 'Xe TQ chở hàng nhập vào làn IGV ở cổng trung tâm, đi vòng phía tây nam, vào 1 trong 4 làn IGV của nhà chuyển tải. Cầu trục đặt container xuống ô chờ; SIVIP gọi xe VN vào cổng đông bắc nhận hàng, ra qua trạm cân. Xe VN chở hàng xuất vào cổng tây bắc; xe TQ về rỗng được ghép chuyến chở hàng xuất. ~20% lô hàng nhập bị chỉ định kiểm hoá.',
      rates: { tqImp: 24, vnExp: 10, thru: 30 }, cap: 24, inspect: 0.2, events: [] },
    { id: 'peak', name: 'Cao điểm mùa vụ (gấp 2,3 lần)',
      desc: 'Lưu lượng gấp ~2,3 lần (mùa nông sản). SIVIP chỉ mở barie khi đã đặt làn và ô chờ container, nên hàng chờ nằm ngoài cổng; trong bãi vẫn thông.',
      rates: { tqImp: 55, vnExp: 22, thru: 50 }, cap: 30, inspect: 0.2, events: [] },
    { id: 'laneFail', name: 'Sự cố: làn IGV số 5 hỏng',
      desc: 'Phút thứ 8, làn 5 (làn IGV đầu tiên) của nhà chuyển tải lỗi cảm biến định vị, SIVIP khoá làn và điều xe mới sang làn 6–8. Phút thứ 38 làn 5 được khôi phục.',
      rates: { tqImp: 32, vnExp: 12, thru: 30 }, cap: 24, inspect: 0.2,
      events: [{ t: 480, type: 'laneFail', lane: 4 }, { t: 2280, type: 'laneRestore', lane: 4 }] },
    { id: 'breakdown', name: 'Sự cố: xe hỏng trên làn IGV',
      desc: 'Phút thứ 6, một xe chết máy trên làn IGV vòng phía tây nam. Xe phía sau tự dừng giữ khoảng cách (không đặt được ô phía trước), vùng giao cắt không bị chiếm. Sau 5 phút xe cứu hộ kéo đi.',
      rates: { tqImp: 28, vnExp: 10, thru: 30 }, cap: 24, inspect: 0.2,
      events: [{ t: 360, type: 'breakdown', dur: 300 }] },
    { id: 'inspection', name: 'Hải quan tăng kiểm hoá (60%)',
      desc: '60% lô hàng nhập bị chỉ định kiểm hoá. Khu kiểm hoá (giả định đặt ở bãi 11 ô phía tây nam) có 2 trạm nối tiếp; xe chỉ được mở barie khi đã đặt được trạm, nên không ùn trên làn IGV.',
      rates: { tqImp: 28, vnExp: 8, thru: 30 }, cap: 24, inspect: 0.6, events: [] },
    { id: 'av', name: 'Mức B: xe tự hành TQ (IGV)',
      desc: 'Toàn bộ xe TQ là xe tự hành (màu trắng), nhận bàn giao điều khiển tại Km0, chạy 14 km/h, chỉ được vào làn IGV và nhà chuyển tải (geofence). Xe VN có tài xế như bình thường.',
      rates: { tqImp: 26, vnExp: 10, thru: 30 }, cap: 24, inspect: 0.2, av: 1, events: [] },
    { id: 'av5g', name: 'Mức B + sự cố 5G trong nhà chuyển tải',
      desc: 'Như mức B, nhưng phút thứ 10 trạm nhỏ 5G-07 (trong nhà chuyển tải) mất nguồn: dưới mái chỉ còn sóng yếu xuyên từ ngoài nên độ trễ tăng, IGV tự giảm tốc theo bảng chế độ (hoặc chạy bò bằng IMU + nam châm sàn). Phút thứ 40 khôi phục. Bật lớp "Vùng phủ 5G" để xem vùng yếu lan ra.',
      rates: { tqImp: 26, vnExp: 10, thru: 30 }, cap: 24, inspect: 0.2, av: 1,
      events: [{ t: 600, type: 'cellFail', cell: '5G-07' }, { t: 2400, type: 'cellRestore', cell: '5G-07' }] },
    { id: 'weather', name: 'Mưa lớn / sương mù',
      desc: 'Tốc độ tối đa giảm 40%, khoảng cách dừng tăng thêm 4 m. Thông lượng giảm nhưng không có xung đột.',
      rates: { tqImp: 24, vnExp: 10, thru: 30 }, cap: 24, inspect: 0.2, weather: 1, events: [] },
    { id: 'stress', name: 'Kiểm thử áp lực (quá tải)',
      desc: 'Đầu vào gấp ~5 lần năng lực. Dùng để chứng minh cơ chế điều phối: hàng chờ dài ngoài cổng nhưng không va chạm và không kẹt cứng trong bãi.',
      rates: { tqImp: 120, vnExp: 50, thru: 60 }, cap: 34, inspect: 0.3, events: [] },
  ];

  // ------------------------------------------------------------------ mô phỏng
  function Sim(scenarioId, seed) {
    this.sc = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    this.rng = mulberry32(seed == null ? 12345 : seed);
    this.t = 0; this.tick = 0; this.nextId = 1;
    this.owner = new Int32Array(GW * GH);
    this.zoneOf = new Int16Array(GW * GH);
    this.stampArr = new Int32Array(GW * GH); this.stamp = 1;
    this.vehicles = []; this.trailers = []; this.vmap = new Map();
    this.zones = [null]; this.events = []; this.log = [];
    this.stats = { collisions: 0, minClear: Infinity, minClearPair: null, minStatic: Infinity, minHw: Infinity, minHwId: '', invariant: 0, maxWait: 0, maxWaitId: 0,
      tqOut: 0, vnOut: 0, imp: 0, exp: 0, moves: 0, backhaul: 0, doubleCycle: 0, inspected: 0, thruOut: 0,
      spawned: 0, zoneWaits: 0, despawned: 0, turnaround: [] };
    this.backlog = { igv: [], ne: [], nw: [], thru: [[], [], [], []] };
    this.enRoute = { vnImp: 0, tqExp: 0 };
    this.lanes = LANES.map(l => Object.assign({}, l, { by: 0, occ: 0, failed: false, uses: 0 }));
    this.slots = LANES.map(l => ({ i: l.i, half: l.half, x: l.cx, z: l.sz, stack: [], dir: null, inRes: 0, outRes: 0 }));
    this.cranes = ['W', 'E'].map(h => ({ half: h, x: (h === 'W' ? LAYOUT.stopFront.W : LAYOUT.stopFront.E) - CONT_BACK,
      z: 124, sy: CRANE_REST_Y, queue: [], cur: null, phase: '', t0: 0, carry: 0, swapped: false, lowY: 0 }));
    this.ins = { st: LAYOUT.insFront.map((x, i) => ({ i, x, by: 0, occupied: false })) };
    this.gates = { igvIn: 0, igvOut: 0, ne: 0, nw: 0, scale: 0, booth: [0, 0, 0, 0] };
    this.containers = new Map();
    this.inside = 0;
    this.deadCells = {}; this.netVer = 0;
    this.avStats = { samples: 0, sumLat: 0, maxLat: 0, weakT: 0, deadT: 0, slowT: 0 };
    this.weather = this.sc.weather ? 0.6 : 1;
    this.gapExtra = this.sc.weather ? 4 : 0;
    this.version = 0;
    this._bodies = mkPool(); this._cells = []; this._rearObb = mkObb(); this._rear = null;
    this.colors = ['#c0392b', '#2471a3', '#1e8449', '#d68910', '#7d3c98', '#5d6d7e', '#a04000', '#117a65'];
    this.initZones();
    this.initPaths();
    this.initStock();
    this.schedule();
  }

  Sim.prototype.logEv = function (msg, kind) {
    this.log.push({ t: this.t, msg, kind: kind || 'info' });
    if (this.log.length > 200) this.log.shift();
  };
  Sim.prototype.newId = function () { return this.nextId++; };

  Sim.prototype.initZones = function () {
    ZONE_RECTS.forEach((zr, k) => {
      const id = k + 1;
      this.zones.push({ id, name: zr.name, rects: zr.r, lockedBy: 0, locks: 0 });
      for (const [x0, x1, z0, z1] of zr.r) {
        for (let iz = 0; iz < GH; iz++) {
          const cz = GZ0 + (iz + 0.5) * CELL; if (cz < z0 || cz >= z1) continue;
          for (let ix = 0; ix < GW; ix++) {
            const cx = GX0 + (ix + 0.5) * CELL; if (cx < x0 || cx >= x1) continue;
            this.zoneOf[iz * GW + ix] = id;
          }
        }
      }
    });
  };

  Sim.prototype.initPaths = function () {
    const L = LAYOUT;
    this.P = {
      igvIn: buildPath([[L.igvIn, L.southZ], [L.igvIn, L.igvInStopZ]]),
      igvOutTail: buildPath([[L.igvOut, L.igvOutStopZ], [L.igvOut, L.southZ]]),
      neIn: buildPath([[L.neInX, L.northZ], [L.neInX, L.neStopZ]]),
      nwIn: buildPath([[L.vnS, L.northZ], [L.vnS, L.nwStopZ]]),
      exitTail: buildPath([[L.exitImpX, L.scaleStopZ], [L.exitImpX, L.exitZ], [L.exitX, L.exitZ], [L.exitX, L.northZ]]),
      thru: [
        buildPath([[L.thruS[0], L.northZ], [L.thruS[0], L.boothS]]), buildPath([[L.thruS[1], L.northZ], [L.thruS[1], L.boothS]]),
        buildPath([[L.thruN[0], L.southZ], [L.thruN[0], L.boothN]]), buildPath([[L.thruN[1], L.southZ], [L.thruN[1], L.boothN]]),
      ],
      thruTail: [
        buildPath([[L.thruS[0], L.boothS], [L.thruS[0], L.southZ]]), buildPath([[L.thruS[1], L.boothS], [L.thruS[1], L.southZ]]),
        buildPath([[L.thruN[0], L.boothN], [L.thruN[0], L.northZ]]), buildPath([[L.thruN[1], L.boothN], [L.thruN[1], L.northZ]]),
      ],
    };
    // tuyến tham chiếu để vẽ (renderer): [waypoints, bề rộng, loại]
    const lane = this.lanes;
    this.routes = {
      igvIn: [[L.igvIn, L.southZ], [L.igvIn, L.bandZ], [L.bandX, L.bandZ], [L.bandX, L.bandBotZ], [L.bandWX, L.bandBotZ], [L.bandWX, lane[4].tz]],
      igvIns: [[L.bandX, 170], [L.bandX, L.insZ], [L.bandWX, L.insZ], [L.bandWX, 180]],
      igvOut: [[126.6, lane[5].tz], [132, lane[5].tz], [147, L.apronZ], [194, L.apronZ], [L.igvOut, 145], [L.igvOut, L.southZ]],
      vnIn: [[L.neInX, L.northZ], [L.neInX, L.topZ], [L.vnS, L.topZ], [L.vnS, lane[3].tz]],
      nwIn: [[L.vnS, L.northZ], [L.vnS, L.topZ]],
      vnOut: [[126.6, lane[1].tz], [L.exitExpX, lane[1].tz], [L.exitExpX, L.exitZ], [L.exitX, L.exitZ], [L.exitX, L.northZ]],
      vnOutImp: [[150, lane[0].tz], [L.exitImpX, lane[0].tz], [L.exitImpX, L.exitZ], [L.exitX, L.exitZ]],
    };
  };

  Sim.prototype.newContainer = function (dir) {
    const id = this.newId();
    this.containers.set(id, { id, dir, color: this.colors[Math.floor(this.rng() * this.colors.length)] });
    return id;
  };
  Sim.prototype.initStock = function () {
    // trạng thái đầu ca: vài container đang nằm ở ô chờ
    const put = (lane, dir) => { const s = this.slots[lane]; s.dir = dir; s.stack.push(this.newContainer(dir)); this.onPlaced(s, 20 + this.rng() * 80); };
    put(0, 'imp'); put(2, 'imp'); put(4, 'imp'); put(6, 'exp');
  };
  Sim.prototype.stockCount = function () { let n = 0; for (const s of this.slots) n += s.stack.length; return n; };

  // ------------------------------------------------------------------ ô chờ container trong nhà chuyển tải
  Sim.prototype.canIn = function (s, dir) { return (s.dir === null || s.dir === dir) && s.stack.length + s.inRes < TIERS; };
  Sim.prototype.canReserveIn = function (half, dir) { return this.slots.some(s => (!half || s.half === half) && this.canIn(s, dir)); };
  Sim.prototype.reserveIn = function (half, dir) {
    let best = null;
    for (const s of this.slots) {
      if ((half && s.half !== half) || !this.canIn(s, dir)) continue;
      const score = (s.dir === dir ? 0 : 10) + s.stack.length;
      if (!best || score < best.score) best = { s, score };
    }
    if (!best) return null;
    best.s.dir = dir; best.s.inRes++; return best.s;
  };
  Sim.prototype.availOut = function (half, dir) {
    let n = 0; for (const s of this.slots) if ((!half || s.half === half) && s.dir === dir) n += s.stack.length - s.outRes; return n;
  };
  Sim.prototype.reserveOut = function (half, dir) {
    let best = null;
    for (const s of this.slots) {
      if (s.half !== half || s.dir !== dir) continue;
      const a = s.stack.length - s.outRes; if (a <= 0) continue;
      if (!best || a > best.a) best = { s, a };
    }
    if (!best) return null;
    best.s.outRes++; return best.s;
  };
  Sim.prototype.unclaimed = function (dir) { return this.availOut(null, dir) - (dir === 'imp' ? this.enRoute.vnImp : this.enRoute.tqExp); };
  Sim.prototype.freeSlotDir = function (s) { if (!s.stack.length && !s.inRes && !s.outRes) s.dir = null; };
  // container vừa nằm ở ô chờ → SIVIP gọi xe nhận
  Sim.prototype.onPlaced = function (s, delay) {
    const c = this.containers.get(s.stack[s.stack.length - 1]);
    this.addEvent({ t: this.t + (delay == null ? 30 + this.rng() * 90 : delay), type: c && c.dir === 'exp' ? 'callTqExp' : 'callVnImp' });
  };

  // ------------------------------------------------------------------ ô lưới
  Sim.prototype.cellsOfObb = function (o, infl, out) {
    const e = infl + HALF_DIAG; const hl = o.hl + e, hw = o.hw + e;
    const ex = Math.abs(o.ux) * hl + Math.abs(o.uz) * hw, ez = Math.abs(o.uz) * hl + Math.abs(o.ux) * hw;
    const ix0 = Math.max(0, Math.floor((o.cx - ex - GX0) / CELL)), ix1 = Math.min(GW - 1, Math.floor((o.cx + ex - GX0) / CELL));
    const iz0 = Math.max(0, Math.floor((o.cz - ez - GZ0) / CELL)), iz1 = Math.min(GH - 1, Math.floor((o.cz + ez - GZ0) / CELL));
    const st = this.stamp; const sa = this.stampArr;
    for (let iz = iz0; iz <= iz1; iz++) {
      const dz = GZ0 + (iz + 0.5) * CELL - o.cz;
      for (let ix = ix0; ix <= ix1; ix++) {
        const dx = GX0 + (ix + 0.5) * CELL - o.cx;
        if (Math.abs(dx * o.ux + dz * o.uz) > hl) continue;
        if (Math.abs(-dx * o.uz + dz * o.ux) > hw) continue;
        const c = iz * GW + ix; if (sa[c] === st) continue; sa[c] = st; out.push(c);
      }
    }
  };
  Sim.prototype.sampleCells = function (veh, st, s, infl) {
    const out = this._cells; out.length = 0; this.stamp++;
    const bs = bodiesAt(veh, st, s, this._bodies);
    for (let i = 0; i < bs.length; i++) this.cellsOfObb(bs[i], infl == null ? MARGIN : infl, out);
    return out;
  };
  Sim.prototype.releaseCells = function (o) {
    const ow = this.owner;
    for (const c of o.cells) if (ow[c] === o.id) ow[c] = 0;
    o.cells.length = 0;
  };
  Sim.prototype.checkCells = function (veh, cells) {
    const ow = this.owner, zo = this.zoneOf;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i]; const o = ow[c];
      if (o !== 0 && o !== veh.id) {
        // Ô nằm hẳn phía sau đuôi xe hiện tại: xe chỉ tiến lên nên không bao giờ quét tới ô đó.
        // Bỏ qua để tránh hai xe nối đuôi khoá nhau (vùng phồng lookahead của xe trước chạm ô xe sau đã giữ).
        const r = this._rear;
        if (r && r.vid === veh.id) {
          const dx = GX0 + (c % GW) + 0.5 - r.cx, dz = GZ0 + Math.floor(c / GW) + 0.5 - r.cz;
          if (dx * r.ux + dz * r.uz < -r.hl - REAR_TOL) continue;
        }
        this._blk = { type: 1, cell: c, owner: o }; return 1;
      }
      const z = zo[c];
      if (z !== 0 && this.zones[z].lockedBy !== veh.id) { this._blk = { type: 2, zone: z, cell: c }; return 2; }
    }
    return 0;
  };
  Sim.prototype.bodyConflict = function (veh, cells) {
    const ow = this.owner;
    for (let i = 0; i < cells.length; i++) {
      const o = ow[cells[i]];
      if (o !== 0 && o !== veh.id) {
        if (!this.firstInv) this.firstInv = { t: this.t, v: veh.id, o, cx: GX0 + (cells[i] % GW) + 0.5, cz: GZ0 + Math.floor(cells[i] / GW) + 0.5 };
        return true;
      }
    }
    return false;
  };
  Sim.prototype.markCells = function (veh, cells) {
    const ow = this.owner;
    for (let i = 0; i < cells.length; i++) { const c = cells[i]; if (ow[c] === 0) { ow[c] = veh.id; veh.cells.push(c); } }
  };

  Sim.prototype.tryAcquire = function (veh, st, sFrom, sStop) {
    const mark = veh.cells.length; const locked = [];
    const z0 = this._blk.zone; const zones = this.zones;
    if (zones[z0].lockedBy !== 0) return -1;
    zones[z0].lockedBy = veh.id; locked.push(z0);
    const total = veh.trailer ? TRUCK_TOTAL : TRACTOR_LEN;
    let clearUntil = sFrom + total + EXIT_CLEAR;
    let s = sFrom; let ok = true; let guard = 0;
    while (true) {
      const cells = this.sampleCells(veh, st, s, CLAIM_MARGIN);
      const r = this.checkCells(veh, cells);
      if (r === 1) { ok = false; break; }
      if (r === 2) {
        const z = this._blk.zone;
        if (zones[z].lockedBy === 0) { zones[z].lockedBy = veh.id; locked.push(z); continue; }
        ok = false; break;
      }
      this.markCells(veh, cells);
      let touch = false;
      for (let i = 0; i < cells.length; i++) { const z = this.zoneOf[cells[i]]; if (z && zones[z].lockedBy === veh.id) { touch = true; break; } }
      if (touch) clearUntil = s + total + EXIT_CLEAR + this.gapExtra;
      if (s >= clearUntil || s >= sStop - 1e-9) break;
      s = Math.min(s + SAMPLE, sStop);
      if (++guard > 500) { ok = false; break; }
    }
    if (!ok) {
      const blk = this._blk;
      for (let i = mark; i < veh.cells.length; i++) { const c = veh.cells[i]; if (this.owner[c] === veh.id) this.owner[c] = 0; }
      veh.cells.length = mark;
      for (const z of locked) zones[z].lockedBy = 0;
      this._blk = blk;
      return -1;
    }
    for (const z of locked) { zones[z].locks++; if (!veh.zones.includes(z)) veh.zones.push(z); }
    veh.clearTo = Math.max(veh.clearTo, Math.min(clearUntil, sStop));
    return s;
  };

  // ------------------------------------------------------------------ phương tiện
  Sim.prototype.makeVehicle = function (kind, job, steps, opts) {
    const v = { id: this.newId(), kind, job, steps, si: 0, s: 0, v: 0, a: 1.0, b: 2.0, vmax: 5.5,
      cells: [], zones: [], clearTo: -1, trailer: null, task: null, blocked: null,
      waitT: 0, totalWait: 0, born: this.t, broken: 0, av: false, state: 'drive', label: '', lane: -1, flags: {},
      inSlot: null, outSlot: null, ins: null, inside: false, admitted: false };
    Object.assign(v, opts || {});
    v.trailer = { id: this.newId(), obb: mkObb(), container: 0, cells: [] };
    return v;
  };
  Sim.prototype.trySpawn = function (v) {
    const st = v.steps[0]; v.s = st.s0;
    const cells = this.sampleCells(v, st, v.s);
    if (this.checkCells(v, cells) !== 0) return false;
    this.markCells(v, cells);
    this.vehicles.push(v); this.vmap.set(v.id, v); this.stats.spawned++;
    return true;
  };
  function drive(path, s0, s1, dir, extra) { return Object.assign({ type: 'drive', path, s0, s1: s1 == null ? path.len : s1, dir: dir || 1 }, extra || {}); }
  function task(name, fn) { return { type: 'task', name, fn }; }
  const isTQ = (v) => v.job === 'tqImp' || v.job === 'tqExp';
  const isVN = (v) => v.job === 'vnImp' || v.job === 'vnExp';

  Sim.prototype.makeTQ = function (job) {
    const av = !!this.sc.av;
    const v = this.makeVehicle(av ? 'av' : 'tq', job, [], { vmax: av ? 3.9 : 5.5, av });
    if (job === 'tqImp') { v.trailer.container = this.newContainer('imp'); v.flags.inspect = this.rng() < this.sc.inspect; }
    v.steps.push(drive(this.P.igvIn, 0, this.P.igvIn.len));
    v.steps.push(task('gateIGV', (veh) => ({ dwell: 20 + this.rng() * 15, label: 'OCR + RFID cổng IGV',
      then: () => ({ wait: () => this.dispatchTQ(veh), label: 'Chờ SIVIP xếp làn', then: () => { this.gates.igvIn = this.t + 8; } }) })));
    return v;
  };
  Sim.prototype.makeVN = function (job, gate) {
    const v = this.makeVehicle(job === 'vnImp' ? 'vn' : 'vnTruck', job, [], { vmax: 5.5, gate });
    if (job === 'vnExp') v.trailer.container = this.newContainer('exp');
    const p = gate === 'ne' ? this.P.neIn : this.P.nwIn;
    v.steps.push(drive(p, 0, p.len));
    v.steps.push(task('gateVN', (veh) => ({ dwell: gate === 'ne' ? 15 + this.rng() * 10 : 25 + this.rng() * 15,
      label: gate === 'ne' ? 'OCR cổng nhập khẩu' : 'OCR + tờ khai xuất',
      then: () => ({ wait: () => this.dispatchVN(veh), label: 'Chờ SIVIP xếp làn', then: () => { this.gates[gate] = this.t + 8; } }) })));
    return v;
  };
  Sim.prototype.makeThru = function (k) {
    const v = this.makeVehicle('thru', 'thru', [], { vmax: 6.5, thruLane: k });
    if (this.rng() < 0.7) v.trailer.container = this.newContainer('thru');
    v.steps.push(drive(this.P.thru[k], 0, this.P.thru[k].len));
    v.steps.push(task('booth', (veh) => ({ dwell: 15 + this.rng() * 20, label: '', then: () => {
      this.gates.booth[k] = this.t + 6;
      veh.steps.push(drive(this.P.thruTail[k], 0, this.P.thruTail[k].len));
      veh.steps.push(task('despawn', (x) => this.despawn(x)));
    } })));
    return v;
  };

  // chọn làn trống (không hỏng, chưa giữ chỗ) theo thứ tự ít dùng nhất
  Sim.prototype.freeLanes = function (type) {
    return this.lanes.filter(l => l.type === type && !l.failed && !l.by).sort((a, b) => a.uses - b.uses || a.i - b.i);
  };

  Sim.prototype.dispatchTQ = function (v) {
    const L = LAYOUT;
    if (this.inside >= this.sc.cap) return false;
    let st = null;
    if (v.flags.inspect) {
      const s = this.ins.st; // s[0] hạ lưu (x nhỏ), s[1] thượng lưu
      if (!s[0].by && !s[1].by) st = s[0]; else if (!s[1].by) st = s[1];
      if (!st) return false;
    }
    let lane = null;
    for (const l of this.freeLanes('tq')) {
      if (v.job === 'tqImp' ? l.half === v.inSlot.half : this.availOut(l.half, 'exp') > 0) { lane = l; break; }
    }
    if (!lane) return false;
    lane.by = v.id; lane.uses++; v.lane = lane.i;
    if (v.job !== 'tqImp') { v.outSlot = this.reserveOut(lane.half, 'exp'); this.enRoute.tqExp--; }
    const head = [[L.igvIn, L.igvInStopZ], [L.igvIn, L.bandZ], [L.bandX, L.bandZ]];
    const tail = [[L.bandWX, lane.tz], [lane.front, lane.tz]];
    if (st) {
      st.by = v.id; v.ins = st;
      const p = buildPath([...head, [L.bandX, L.insZ], [L.bandWX, L.insZ], ...tail]);
      const sS = sNear(p, st.x, L.insZ);
      v.steps.push(drive(p, 0, sS));
      v.steps.push(task('inspect', () => { st.occupied = true; return { dwell: 180 + this.rng() * 180, label: 'Hải quan kiểm hoá', then: () => { this.stats.inspected++; } }; }));
      v.steps.push(drive(p, sS, p.len, 1, { onStart: () => { st.occupied = false; st.by = 0; v.ins = null; } }));
    } else {
      const p = buildPath([...head, [L.bandX, L.bandBotZ], [L.bandWX, L.bandBotZ], ...tail]);
      v.steps.push(drive(p, 0, p.len));
    }
    v.steps.push(task('shed', (veh) => this.taskShed(veh)));
    this.inside++; v.inside = true; v.admitted = true;
    return true;
  };

  Sim.prototype.dispatchVN = function (v) {
    const L = LAYOUT;
    if (this.inside >= this.sc.cap) return false;
    let lane = null;
    for (const l of this.freeLanes('vn')) {
      if (v.job === 'vnExp' ? l.half === v.inSlot.half : this.availOut(l.half, 'imp') > 0) { lane = l; break; }
    }
    if (!lane) return false;
    lane.by = v.id; lane.uses++; v.lane = lane.i;
    if (v.job !== 'vnExp') { v.outSlot = this.reserveOut(lane.half, 'imp'); this.enRoute.vnImp--; }
    const wps = v.gate === 'ne'
      ? [[L.neInX, L.neStopZ], [L.neInX, L.topZ], [L.vnS, L.topZ], [L.vnS, lane.tz], [lane.front, lane.tz]]
      : [[L.vnS, L.nwStopZ], [L.vnS, lane.tz], [lane.front, lane.tz]];
    const p = buildPath(wps);
    v.steps.push(drive(p, 0, p.len));
    v.steps.push(task('shed', (veh) => this.taskShed(veh)));
    this.inside++; v.inside = true; v.admitted = true;
    return true;
  };

  // ------------------------------------------------------------------ nhà chuyển tải + cầu trục
  Sim.prototype.craneOf = function (half) { return this.cranes[half === 'W' ? 0 : 1]; };
  Sim.prototype.craneReq = function (type, v, slot, lane) {
    const rq = { type, v, slot, lane, done: false };
    this.craneOf(lane.half).queue.push(rq); return rq;
  };
  Sim.prototype.taskShed = function (v) {
    const lane = this.lanes[v.lane]; lane.occ = v.id;
    const afterUnload = () => {
      if (!v.outSlot) this.tryBackhaul(v, lane);
      if (v.outSlot) {
        const rq = this.craneReq('load', v, v.outSlot, lane);
        return { wait: () => rq.done, label: 'Cầu trục xếp container lên xe', then: () => { v.outSlot = null; this.routeExit(v, lane); return null; } };
      }
      this.routeExit(v, lane); return null;
    };
    if (v.trailer.container && v.inSlot) {
      const rq = this.craneReq('unload', v, v.inSlot, lane);
      return { wait: () => rq.done, label: 'Cầu trục dỡ container', then: () => { v.inSlot = null; return afterUnload(); } };
    }
    return { dwell: 3, label: 'Định vị trong làn', then: afterUnload };
  };
  // ghép chuyến: xe TQ về rỗng nhận hàng xuất; xe VN vừa dỡ hàng xuất nhận hàng nhập
  Sim.prototype.tryBackhaul = function (v, lane) {
    const dir = isTQ(v) ? 'exp' : 'imp';
    if (this.unclaimed(dir) > 0 && this.availOut(lane.half, dir) > 0) {
      v.outSlot = this.reserveOut(lane.half, dir);
      if (isTQ(v)) this.stats.backhaul++; else this.stats.doubleCycle++;
    }
  };
  Sim.prototype.routeExit = function (v, lane) {
    const L = LAYOUT;
    lane.by = 0; lane.occ = 0;
    if (isTQ(v)) {
      const p = buildPath([[lane.front, lane.tz], [132, lane.tz], [147, L.apronZ], [194, L.apronZ], [L.igvOut, 145], [L.igvOut, L.igvOutStopZ]]);
      v.steps.push(drive(p, 0, p.len));
      v.steps.push(task('gateOut', (veh) => ({ dwell: 8 + this.rng() * 6, label: 'OCR ra', then: () => {
        this.gates.igvOut = this.t + 8; this.leaveInside(veh);
        veh.steps.push(drive(this.P.igvOutTail, 0, this.P.igvOutTail.len));
        veh.steps.push(task('despawn', (x) => this.despawn(x)));
      } })));
    } else if (v.trailer.container) {
      const p = buildPath([[lane.front, lane.tz], [L.exitImpX, lane.tz], [L.exitImpX, L.scaleStopZ]]);
      v.steps.push(drive(p, 0, p.len));
      v.steps.push(task('scale', (veh) => ({ dwell: 20 + this.rng() * 15, label: 'Cân + kiểm tra seal', then: () => {
        this.gates.scale = this.t + 8; this.leaveInside(veh);
        veh.steps.push(drive(this.P.exitTail, 0, this.P.exitTail.len));
        veh.steps.push(task('despawn', (x) => this.despawn(x)));
      } })));
    } else {
      const p = buildPath([[lane.front, lane.tz], [L.exitExpX, lane.tz], [L.exitExpX, L.exitZ], [L.exitX, L.exitZ], [L.exitX, L.northZ]]);
      v.steps.push(drive(p, 0, p.len));
      v.steps.push(task('despawn', (x) => this.despawn(x)));
    }
  };
  Sim.prototype.leaveInside = function (v) { if (v.inside) { v.inside = false; this.inside--; } };

  Sim.prototype.updateCranes = function () {
    for (const c of this.cranes) {
      if (!c.cur) {
        if (!c.queue.length) { c.sy = CRANE_REST_Y; continue; }
        const r = c.cur = c.queue.shift();
        r.srcZ = r.type === 'unload' ? r.lane.tz : r.slot.z;
        r.dstZ = r.type === 'unload' ? r.slot.z : r.lane.tz;
        c.phase = 'toSrc'; c.swapped = false;
      }
      const r = c.cur;
      if (c.phase === 'toSrc' || c.phase === 'toDst') {
        const target = c.phase === 'toSrc' ? r.srcZ : r.dstZ; const d = target - c.z; const sp = CRANE_SPEED * DT;
        if (Math.abs(d) <= sp) {
          c.z = target; c.t0 = this.t; c.swapped = false;
          if (c.phase === 'toSrc') { c.phase = 'pick'; c.lowY = r.type === 'unload' ? TRUCK_CONT_Y : 1.3 + CONT_H * (r.slot.stack.length - 1); }
          else { c.phase = 'drop'; c.lowY = r.type === 'unload' ? 1.3 + CONT_H * r.slot.stack.length : TRUCK_CONT_Y; }
        } else c.z += Math.sign(d) * sp;
        continue;
      }
      const f = Math.min(1, (this.t - c.t0) / HOIST_T);
      c.sy = CRANE_REST_Y - (CRANE_REST_Y - c.lowY) * Math.sin(Math.PI * f);
      if (f >= 0.5 && !c.swapped) {
        c.swapped = true;
        if (c.phase === 'pick') {
          if (r.type === 'unload') { c.carry = r.v.trailer.container; r.v.trailer.container = 0; }
          else { c.carry = r.slot.stack.pop(); }
        } else {
          if (r.type === 'unload') { r.slot.stack.push(c.carry); r.slot.inRes--; this.onPlaced(r.slot); }
          else { r.v.trailer.container = c.carry; r.slot.outRes--; this.freeSlotDir(r.slot); }
          c.carry = 0;
        }
        this.version++;
      }
      if (f >= 1) {
        if (c.phase === 'pick') { c.phase = 'toDst'; }
        else { r.done = true; c.cur = null; c.phase = ''; this.stats.moves++; }
      }
    }
  };

  // ------------------------------------------------------------------ vòng lặp
  Sim.prototype.schedule = function () {
    const r = this.sc.rates; const H = 4 * 3600;
    const gen = (rate, fn) => { if (!rate) return; let t = 2 + this.rng() * 20; while (t < H) { this.events.push({ t, type: 'arrive', fn }); t += -Math.log(1 - this.rng()) * 3600 / rate; } };
    gen(r.tqImp, 'tqImp'); gen(r.vnExp, 'vnExp'); gen(r.thru, 'thruS'); gen(r.thru, 'thruN');
    for (const e of this.sc.events) this.events.push(Object.assign({}, e));
    this.events.sort((a, b) => a.t - b.t);
  };
  // Bật/tắt sự cố một trạm 5G (từ kịch bản hoặc bấm trên giao diện).
  Sim.prototype.setCellDead = function (id, dead) {
    if (!!this.deadCells[id] === !!dead || !HW.CELLS.some(c => c.id === id)) return;
    if (dead) this.deadCells[id] = true; else delete this.deadCells[id];
    this.netVer++;
    this.logEv(dead ? `Trạm ${id} mất nguồn → vùng quanh trạm chỉ còn sóng yếu từ trạm lân cận; IGV tự giảm tốc theo độ trễ` : `Trạm ${id} đã khôi phục, độ trễ trở lại bình thường`, dead ? 'warn' : 'ok');
  };
  Sim.prototype.addEvent = function (e) {
    let i = this.events.length; while (i > 0 && this.events[i - 1].t > e.t) i--;
    this.events.splice(i, 0, e);
  };
  Sim.prototype.handleEvents = function () {
    while (this.events.length && this.events[0].t <= this.t) {
      const e = this.events.shift();
      if (e.type === 'arrive') {
        if (e.fn === 'tqImp') this.backlog.igv.push(this.bk('tqImp', () => this.makeTQ('tqImp')));
        else if (e.fn === 'vnExp') this.backlog.nw.push(this.bk('vnExp', () => this.makeVN('vnExp', 'nw')));
        else { const k = (e.fn === 'thruS' ? 0 : 2) + (this.rng() < 0.5 ? 0 : 1); this.backlog.thru[k].push(() => this.makeThru(k)); }
      } else if (e.type === 'callVnImp') {
        if (this.unclaimed('imp') > 0) { this.enRoute.vnImp++; this.backlog.ne.push(this.bk('vnImp', () => this.makeVN('vnImp', 'ne'))); }
      } else if (e.type === 'callTqExp') {
        if (this.unclaimed('exp') > 0) { this.enRoute.tqExp++; this.backlog.igv.push(this.bk('tqExp', () => this.makeTQ('tqExp'))); }
      } else if (e.type === 'laneFail') {
        this.lanes[e.lane].failed = true; this.logEv(`Làn ${e.lane + 1} lỗi cảm biến định vị → SIVIP khoá làn, điều xe mới sang làn IGV còn lại`, 'warn');
      } else if (e.type === 'cellFail') { this.setCellDead(e.cell, true);
      } else if (e.type === 'cellRestore') { this.setCellDead(e.cell, false);
      } else if (e.type === 'laneRestore') {
        this.lanes[e.lane].failed = false; this.logEv(`Làn ${e.lane + 1} đã khôi phục`, 'ok');
      } else if (e.type === 'breakdown') {
        const L = LAYOUT;
        const cand = this.vehicles.filter(v => isTQ(v) && v.state === 'drive' && !v.zones.length && v.v > 1 && (() => {
          ptAt(this.curStep(v).path, v.s, _p1);
          return (Math.abs(_p1[0] - L.bandX) < 1.5 && _p1[1] > 178 && _p1[1] < 196) || (Math.abs(_p1[1] - L.bandBotZ) < 1.5 && _p1[0] > 90 && _p1[0] < 125);
        })());
        if (cand.length) { const v = cand[0]; v.broken = this.t + e.dur; this.logEv(`Xe #${v.id} chết máy trên làn IGV, các xe sau tự dừng giữ khoảng cách`, 'warn'); }
        else { this.addEvent(Object.assign({}, e, { t: this.t + 5 })); } // chưa có xe phù hợp: thử lại sau 5 s, không chặn các sự kiện khác
      }
    }
  };
  Sim.prototype.curStep = function (v) { return v.steps[v.si]; };
  Sim.prototype.trySpawns = function () {
    const qs = [this.backlog.igv, this.backlog.ne, this.backlog.nw, ...this.backlog.thru];
    for (const q of qs) {
      if (!q.length) continue;
      // Bãi chờ ngoài cổng: SIVIP chỉ gọi xe có hàng vào khi đã giữ được ô chờ container cho nó
      // (đặt chỗ trước). Xe rỗng đến nhận hàng luôn được gọi. Nhờ vậy hàng xe trước cổng không
      // bao giờ bị một xe có hàng nhưng hết chỗ chặn đầu (kẹt vòng: xe rỗng đi giải phóng chỗ
      // lại xếp sau nó).
      let k = -1;
      for (let i = 0; i < q.length; i++) {
        const j = q[i].job;
        if (!j || j === 'tqExp' || j === 'vnImp' || this.canReserveIn(null, j === 'tqImp' ? 'imp' : 'exp')) { k = i; break; }
      }
      if (k < 0) continue;
      const e = q[k];
      if (!e.veh) e.veh = e();
      const v = e.veh;
      if (this.trySpawn(v)) {
        q.splice(k, 1); if (v.av) v.label = '';
        if (v.job === 'tqImp') v.inSlot = this.reserveIn(null, 'imp');
        else if (v.job === 'vnExp') v.inSlot = this.reserveIn(null, 'exp');
      }
    }
  };
  Sim.prototype.bk = function (job, fn) { fn.job = job; return fn; };

  Sim.prototype.step = function () {
    this.t += DT; this.tick++;
    this.handleEvents();
    this.trySpawns();
    this.updateCranes();
    const vs = this.vehicles;
    for (let i = 0; i < vs.length; i++) this.updateVehicle(vs[i]);
    if (this._dead) { this.vehicles = this.vehicles.filter(v => !v.dead); this._dead = false; }
    this.checkCollisions();
    if (this.tick % 5 === 0) this.checkHardware();
  };
  // Khoảng hở nhỏ nhất giữa thân xe và các trụ / thiết bị cố định (kiểm tra mỗi 0,5 s).
  Sim.prototype.checkHardware = function () {
    const sol = this._solids || (this._solids = HW.solids());
    let m = this.stats.minHw;
    for (const b of this.allBodies()) {
      const o = b.o;
      for (const d of sol) {
        const dx = d.x - o.cx, dz = d.z - o.cz;
        if (dx > 20 || dx < -20 || dz > 20 || dz < -20) continue;
        const lx = dx * o.ux + dz * o.uz, lz = -dx * o.uz + dz * o.ux;
        const gap = Math.hypot(Math.max(Math.abs(lx) - o.hl, 0), Math.max(Math.abs(lz) - o.hw, 0)) - d.r;
        if (gap < m) { m = gap; this.stats.minHwId = d.id; }
      }
    }
    this.stats.minHw = m;
  };

  Sim.prototype.updateVehicle = function (v) {
    if (v.dead) return;
    let st = v.steps[v.si];
    if (!st) return;
    if (st.type === 'task') {
      if (!v.task) { v.task = st.fn(v) || { dwell: 0 }; v.taskT = 0; v.state = v.task.wait ? 'wait' : 'dwell'; v.label = v.task.label || ''; }
      const tk = v.task; v.taskT += DT;
      let done = false;
      if (tk.wait) { if (this.tick % 5 === 0 && tk.wait()) done = true; }
      else if (v.taskT >= (tk.dwell || 0)) done = true;
      if (done) {
        const nxt = tk.then ? tk.then() : null;
        if (nxt && (nxt.wait || nxt.dwell != null)) { v.task = nxt; v.taskT = 0; v.state = nxt.wait ? 'wait' : 'dwell'; v.label = nxt.label || ''; return; }
        v.task = null; v.label = ''; v.si++;
        if (v.dead) return;
        st = v.steps[v.si];
        if (!st) return;
        if (st.type === 'drive') { v.s = st.s0; if (st.onStart) st.onStart(); v.state = 'drive'; }
        else return;
      } else return;
    }
    this.driveVehicle(v, st);
  };

  Sim.prototype.driveVehicle = function (v, st) {
    if (v.blocked && v.v === 0) {
      const b = v.blocked; let still = false;
      if (b.type === 1) { const o = this.owner[b.cell]; still = o !== 0 && o !== v.id; }
      else if (b.type === 2) { const z = this.zones[b.zone]; still = z.lockedBy !== 0 && z.lockedBy !== v.id; }
      else if (b.type === 3) still = this.t < v.broken;
      if (still) { v.waitT += DT; v.totalWait += DT; this.noteWait(v); return; }
    }
    this.releaseCells(v);
    const body = this.sampleCells(v, st, v.s);
    if (this.bodyConflict(v, body)) this.stats.invariant++;
    this.markCells(v, body);
    { const bs = this._bodies, rb = bs[v.trailer ? 1 : 0], r = this._rearObb;
      r.cx = rb.cx; r.cz = rb.cz; r.ux = rb.ux; r.uz = rb.uz; r.hl = rb.hl; r.vid = v.id; this._rear = r; }
    this.releaseZones(v);
    // IGV: độ trễ 5G tại vị trí xe quyết định tốc độ tối đa và khoảng dừng thêm (chỉ làm xe CHẬM hơn,
    // không đổi cơ chế đặt chỗ ô nên không ảnh hưởng an toàn va chạm).
    let wf = this.weather; let gapE = this.gapExtra;
    if (v.av) {
      ptAt(st.path, v.s, _p1); const sv = HW.serving(_p1[0], _p1[1], this.deadCells);
      v.lat = sv.lat; v.cell = sv.cell ? sv.cell.id : null;
      const f = HW.speedFactor(sv.lat); wf *= f; gapE += HW.extraGap(sv.lat);
      const a = this.avStats; a.samples++; if (sv.lat < Infinity) { a.sumLat += sv.lat; if (sv.lat > a.maxLat) a.maxLat = sv.lat; }
      if (sv.lat > 50) a.weakT += DT; if (sv.lat === Infinity) a.deadT += DT; if (f < 1) a.slowT += DT;
    }
    const vmax = v.vmax * wf;
    const look = vmax * vmax / (2 * v.b) + 3 + gapE;
    let target = Math.min(st.s1, v.s + look);
    if (v.zones.length) target = Math.max(target, Math.min(v.clearTo, st.s1));
    let ss = v.s; v.blocked = null;
    if (v.broken && this.t < v.broken) { v.blocked = { type: 3 }; target = v.s; }
    else if (v.broken) { v.broken = 0; this.logEv(`Xe #${v.id} đã được cứu hộ, giao thông giải toả`, 'ok'); }
    while (ss < target - 1e-9) {
      const nx = Math.min(Math.floor(ss / SAMPLE + 1e-6) * SAMPLE + SAMPLE, target);
      const cells = this.sampleCells(v, st, nx, CLAIM_MARGIN);
      const r = this.checkCells(v, cells);
      if (r === 0) { this.markCells(v, cells); ss = nx; continue; }
      if (r === 2 && this.zones[this._blk.zone].lockedBy === 0) {
        const got = this.tryAcquire(v, st, nx, st.s1);
        if (got >= 0) { ss = got; target = Math.max(target, Math.min(v.clearTo, st.s1)); continue; }
      }
      v.blocked = this._blk; if (this._blk.type === 2) this.stats.zoneWaits++;
      break;
    }
    const avail = ss - v.s;
    const gap = v.blocked ? gapE : 0;
    const vAllow = Math.sqrt(Math.max(0, 2 * v.b * (avail - gap - 0.05)));
    let vc = vmax;
    for (let s2 = v.s; s2 <= ss; s2 += 2) vc = Math.min(vc, Math.sqrt(capAt(st.path, s2) ** 2 * wf * wf + 2 * v.b * (s2 - v.s)));
    let nv = Math.min(v.v + v.a * DT, vAllow, vc);
    if (nv < 0) nv = 0;
    let ds = Math.min(nv * DT, Math.max(0, avail - (v.blocked ? gap : 0)));
    if (!v.blocked && ss >= st.s1 - 1e-9 && st.s1 - v.s < 0.06) ds = st.s1 - v.s;
    v.s += ds; v.v = ds / DT; v.dist = (v.dist || 0) + ds;
    if (v.v < 0.02 && v.blocked) { v.v = 0; v.waitT += DT; v.totalWait += DT; this.noteWait(v); }
    else if (v.v > 0.05) v.waitT = 0;
    if (v.s >= st.s1 - 1e-6) {
      v.s = st.s1; v.v = 0; v.si++; v.clearTo = -1;
      const nx = v.steps[v.si];
      if (nx && nx.type === 'drive') { v.s = nx.s0; if (nx.onStart) nx.onStart(); }
    }
  };
  Sim.prototype.noteWait = function (v) {
    if (v.waitT > this.stats.maxWait) { this.stats.maxWait = v.waitT; this.stats.maxWaitId = v.id; }
  };
  Sim.prototype.releaseZones = function (v) {
    if (!v.zones.length) return;
    const zo = this.zoneOf;
    for (let k = v.zones.length - 1; k >= 0; k--) {
      const z = v.zones[k]; let touch = false;
      for (let i = 0; i < v.cells.length; i++) if (zo[v.cells[i]] === z) { touch = true; break; }
      if (!touch) { this.zones[z].lockedBy = 0; v.zones.splice(k, 1); }
    }
    if (!v.zones.length) v.clearTo = -1;
  };

  Sim.prototype.despawn = function (v) {
    this.releaseCells(v);
    for (const z of v.zones) this.zones[z].lockedBy = 0;
    v.zones.length = 0; v.dead = true; this._dead = true; this.vmap.delete(v.id);
    this.leaveInside(v);
    this.stats.despawned++;
    const c = v.trailer && v.trailer.container;
    if (isTQ(v)) { this.stats.tqOut++; this.stats.turnaround.push(this.t - v.born); if (c) this.stats.exp++; }
    else if (isVN(v)) { this.stats.vnOut++; if (c) this.stats.imp++; }
    else this.stats.thruOut++;
    if (c) this.containers.delete(c);
    return { dwell: 0 };
  };

  // ------------------------------------------------------------------ kiểm tra va chạm độc lập
  Sim.prototype.curStepPrev = function (v) { for (let i = v.si; i >= 0; i--) if (v.steps[i].type === 'drive') return v.steps[i]; return null; };
  Sim.prototype.allBodies = function () {
    const out = [];
    for (const v of this.vehicles) {
      if (v.dead) continue;
      const st = v.steps[v.si] && v.steps[v.si].type === 'drive' ? v.steps[v.si] : this.curStepPrev(v);
      if (!st) continue;
      const bs = bodiesAt(v, st, v.s, mkPool());
      bs.forEach((b, k) => out.push({ o: b, vid: v.id, part: k }));
    }
    return out;
  };
  Sim.prototype.staticBodies = function () {
    if (this._staticVer === this.version && this._static) return this._static;
    const out = [];
    for (const s of this.slots) if (s.stack.length) out.push({ o: { cx: s.x, cz: s.z, ux: 1, uz: 0, hl: CONT_LEN / 2, hw: CONT_W / 2 }, vid: -1 - s.i, part: 0, fixed: true });
    this._static = out; this._staticVer = this.version; return out;
  };
  Sim.prototype.checkCollisions = function () {
    const B = this.allBodies(); const S = this.staticBodies(); let minC = this.stats.minClear, minS = this.stats.minStatic;
    for (let i = 0; i < B.length; i++) {
      const a = B[i]; const ra = a.o.hl + a.o.hw;
      for (let j = i + 1; j < B.length + S.length; j++) {
        const b = j < B.length ? B[j] : S[j - B.length];
        if (a.vid === b.vid) continue;
        const rb = b.o.hl + b.o.hw; const dx = a.o.cx - b.o.cx, dz = a.o.cz - b.o.cz;
        if (dx * dx + dz * dz > (ra + rb + 4) ** 2) continue;
        if (obbOverlap(a.o, b.o)) {
          this.stats.collisions++;
          if (this.stats.collisions <= 5) this.logEv(`VA CHẠM giữa #${a.vid} và ${b.fixed ? 'container ở ô chờ' : '#' + b.vid}`, 'err');
          if (b.fixed) minS = 0; else minC = 0;
        } else {
          const d = obbDistance(a.o, b.o);
          if (b.fixed) { if (d < minS) minS = d; }
          else if (d < minC) { minC = d; this.stats.minClearPair = [a.vid, b.vid, this.t]; }
        }
      }
    }
    this.stats.minClear = minC; this.stats.minStatic = minS;
  };

  // ------------------------------------------------------------------ dữ liệu cho hiển thị
  Sim.prototype.snapshot = function () {
    const vs = [];
    for (const v of this.vehicles) {
      if (v.dead) continue;
      const st = v.steps[v.si] && v.steps[v.si].type === 'drive' ? v.steps[v.si] : this.curStepPrev(v);
      if (!st) continue;
      const bs = bodiesAt(v, st, v.s, mkPool());
      const front = ptAt(st.path, v.s, [0, 0]);
      const cont = v.trailer.container; const cc = cont ? (this.containers.get(cont) || {}).color : null;
      vs.push({ id: v.id, kind: v.kind, job: v.job, fx: front[0], fz: front[1], h: Math.atan2(bs[0].uz, bs[0].ux),
        trailer: { cx: bs[1].cx, cz: bs[1].cz, h: Math.atan2(bs[1].uz, bs[1].ux), container: cont, color: cc },
        state: v.state, label: v.label, blocked: !!v.blocked && v.v === 0, broken: v.broken && this.t < v.broken, zones: v.zones.slice(), av: v.av, wait: v.waitT,
        spd: v.v, lat: v.av ? v.lat : null, cell: v.av ? v.cell : null, dist: v.dist || 0 });
    }
    const cranes = this.cranes.map(c => ({ x: c.x, z: c.z, sy: c.sy, carry: c.carry ? (this.containers.get(c.carry) || {}).color || '#888' : null, busy: !!c.cur }));
    return { t: this.t, vehicles: vs, cranes };
  };
  Sim.prototype.slotContainers = function () {
    const out = [];
    for (const s of this.slots) s.stack.forEach((cid, k) => out.push({ x: s.x, z: s.z, y: 1.3 + CONT_H * k, color: (this.containers.get(cid) || {}).color || '#777', dir: s.dir }));
    return out;
  };
  Sim.prototype.summary = function () {
    const s = this.stats;
    const notIn = (pred) => this.vehicles.filter(v => !v.dead && pred(v) && !v.admitted).length;
    const tA = s.turnaround.length ? s.turnaround.reduce((a, b) => a + b, 0) / s.turnaround.length : 0;
    return { t: this.t, inside: this.inside,
      queueIGV: this.backlog.igv.length + notIn(isTQ), queueNE: this.backlog.ne.length + notIn(v => v.gate === 'ne'), queueNW: this.backlog.nw.length + notIn(v => v.gate === 'nw'),
      tqOut: s.tqOut, vnOut: s.vnOut, imp: s.imp, exp: s.exp, moves: s.moves, backhaul: s.backhaul, doubleCycle: s.doubleCycle, inspected: s.inspected, thruOut: s.thruOut,
      collisions: s.collisions, minHw: s.minHw, minHwId: s.minHwId, minClear: s.minClear, minStatic: s.minStatic, invariant: s.invariant, maxWait: s.maxWait, zoneWaits: s.zoneWaits, avgTurn: tA,
      av: Object.assign({}, this.avStats, { avgLat: this.avStats.samples ? this.avStats.sumLat / this.avStats.samples : 0 }),
      deadCells: Object.keys(this.deadCells), netVer: this.netVer,
      stock: this.stockCount(), zonesLocked: this.zones.slice(1).filter(z => z.lockedBy).length,
      lanes: this.lanes.map(l => l.failed ? 'failed' : l.occ ? 'busy' : l.by ? 'reserved' : 'free'),
      slots: this.slots.map(sl => ({ n: sl.stack.length, dir: sl.dir })) };
  };
  Sim.prototype.claimedCells = function (limit) {
    const res = []; const ow = this.owner;
    for (const v of this.vehicles) { for (const c of v.cells) { if (ow[c] === v.id) res.push(c, v.id); if (res.length > limit * 2) return res; } }
    return res;
  };

  return {
    Sim, HW, SCENARIOS, LAYOUT, LANES, ZONE_RECTS, DT, CELL, GX0, GZ0, GW, GH, buildPath, ptAt,
    dims: { TRACTOR_LEN, TRACTOR_W, TRAILER_LEN, TRAILER_W, CAB_LEN, FIFTH_WHEEL, KINGPIN_FRONT, CONT_LEN, CONT_W, CONT_H, CRANE_REST_Y, TIERS },
  };
});
