/*
 * sim-core.js — Lõi mô phỏng bãi container Bảo Nguyên (không phụ thuộc Three.js).
 * Chạy được trong trình duyệt (window.YardSim) và trong Node (require).
 *
 * Cơ chế chống va chạm (2 lớp):
 *  1) AN TOÀN — đặt chỗ ô lưới (cell reservation): mặt bằng chia ô 1 m x 1 m. Mỗi bước
 *     thời gian, mỗi xe giữ các ô dưới thân xe (phình thêm biên an toàn) và đặt trước các ô
 *     trên quãng đường phanh phía trước. Xe chỉ được tiến vào vùng ô mình đã đặt; một ô chỉ
 *     có một chủ. Vì vậy thân hai xe không thể giao nhau.
 *  2) KHÔNG KẸT (deadlock) — vùng giao cắt độc quyền: chỗ nhập làn, khu đổi đầu kéo... là
 *     "vùng" chỉ một xe được vào. Xe chỉ khóa vùng khi đặt được ô xuyên qua vùng và thêm
 *     một khoảng thoát (dài thân xe + 3 m) phía sau vùng: không bao giờ dừng giữa giao cắt.
 *     Thêm giới hạn số xe trong bãi, đặt chỗ ô đổi đầu kéo / vị trí xếp dỡ / kiểm hóa
 *     trước khi cho xe qua cổng.
 *  Bộ kiểm tra độc lập (checkCollisions) dùng phép thử SAT chính xác trên hình chữ nhật thân xe
 *  ở mọi bước để xác nhận không có hai xe giao nhau.
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module.exports) module.exports = mod;
  else root.YardSim = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

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
  const CELL = 1.0;            // kích thước ô lưới (m)
  const MARGIN = 0.6;          // biên an toàn phình thân xe khi đặt chỗ (m)
  const CLAIM_MARGIN = 1.0;    // biên phình khi đặt chỗ phía trước (lớn hơn để phủ các tư thế xen giữa hai mẫu)
  const GX0 = -230, GZ0 = -40, GW = 620, GH = 340; // lưới bao toàn khu vực
  const HALF_DIAG = CELL * Math.SQRT2 / 2;
  const EXIT_CLEAR = 3;        // khoảng thoát thêm sau vùng giao cắt (m)

  // Kích thước phương tiện (m) — giả định theo xe đầu kéo + rơ-moóc 40 ft phổ biến
  const TRACTOR_LEN = 6.2, TRACTOR_W = 2.5;
  const FIFTH_WHEEL = 4.2;     // mâm kéo cách đầu xe
  const CAB_LEN = 3.0;         // phần đầu kéo lộ ra khi đã kéo moóc
  const KINGPIN_FRONT = 1.2;   // đầu moóc phía trước chốt kéo
  const TRAILER_LEN = 12.5, TRAILER_W = 2.6;
  const TRAILER_AXIS = 8.0;    // khoảng chốt kéo → trục sau (để tính góc moóc)
  const RS_HL = 3.5, RS_HW = 2.0; // xe nâng chụp (reach stacker)
  const TRUCK_TOTAL = CAB_LEN + TRAILER_LEN; // 15.5 m

  // ------------------------------------------------------------------ bố trí mặt bằng (giả định, xem README)
  const LAYOUT = {
    fence: { x0: -40, x1: 240, z0: 0, z1: 150 },
    ring: { W: 14, E: 226, N: 14, S: 136 },
    km0X: -110,
    westSpawnX: -170, westDespawnX: -178,
    approachZ: 53, inZ: [50, 56], inStopX: -22,          // cổng nhập Km0: 2 làn, cân 120 t
    outWZ: 24, outWStopX: -28,                          // làn ra trả xe TQ về Km0
    eastSpawnX: 345, einZ: 34, einStopX: 262,           // cổng nội địa (vào): đầu kéo VN
    outSX: [84, 76], outSStopZ: 176, southDespawnZ: 285, // cổng xuất nội địa: 2 làn
    bayX: [50, 59, 68, 77, 86, 95], bayFrontZ: 66, swapZ: 82, connX: 110,
    yardX: 118, yardZ: 80, yardHoldZ: 56, yardSt: [160, 196], rsZ: 70, rsX0: 124, rsX1: 214,
    stackCols: [136, 149.5, 163, 176.5, 190, 203.5], stackRows: [63.5, 60.6, 57.7], stackTiers: 3,
    insZ: 106, insTurnX: 146, insSt: [162, 192],        // làn kiểm hóa: 2 trạm nối tiếp
  };

  // Vùng giao cắt độc quyền (hình chữ nhật [x0,x1) x [z0,z1))
  const ZONE_RECTS = [
    { name: 'Nhập làn cổng Km0', r: [2, 26, 34, 66] },
    { name: 'Nhập làn từ khu đổi đầu kéo', r: [2, 26, 68, 96] },
    { name: 'Khu đổi đầu kéo (lùi ghép moóc)', r: [26, 104, 68, 90] },
    { name: 'Nhập làn cổng nội địa', r: [212, 242, 16, 52] },
    { name: 'Nhập làn từ bãi xếp', r: [204, 242, 66, 100] },
    { name: 'Nhập làn sau kiểm hóa', r: [120, 156, 118, 148] },
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
      let a1 = Math.atan2(t1[1] - c[1], t1[0] - c[0]);
      let a2 = Math.atan2(t2[1] - c[1], t2[0] - c[0]);
      let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const nArc = Math.max(4, Math.ceil(Math.abs(da) * r / 0.2));
      for (let k = 0; k <= nArc; k++) {
        const a = a1 + da * k / nArc;
        pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
      }
    }
    pts.push([wps[wps.length - 1][0], wps[wps.length - 1][1]]);
    // lấy mẫu lại đều DS
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
    // hướng tại hai đầu (dùng để ngoại suy)
    const h0 = norm(X[1] - X[0], Z[1] - Z[0]);
    const h1 = norm(X[n - 1] - X[n - 2], Z[n - 1] - Z[n - 2]);
    // giới hạn tốc độ theo độ cong + khu vực
    const cap = new Float32Array(n);
    const hd = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
      hd[i] = Math.atan2(Z[b] - Z[a], X[b] - X[a]);
    }
    const W = 16; // cửa sổ ±4 m
    for (let i = 0; i < n; i++) {
      const a = Math.max(0, i - W), b = Math.min(n - 1, i + W);
      let dh = hd[b] - hd[a]; while (dh > Math.PI) dh -= 2 * Math.PI; while (dh < -Math.PI) dh += 2 * Math.PI;
      const k = Math.abs(dh) / Math.max(DS, (b - a) * DS);
      let c = k > 1e-4 ? Math.sqrt(1.1 / k) : 99;
      const inside = X[i] > LAYOUT.fence.x0 && X[i] < LAYOUT.fence.x1 && Z[i] > LAYOUT.fence.z0 && Z[i] < LAYOUT.fence.z1;
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

  // Trả về danh sách OBB của phương tiện tại vị trí s trên bước lái `st`
  function bodiesAt(veh, st, s, out) {
    const p = st.path, dir = st.dir;
    if (veh.kind === 'rs') {
      ptAt(p, s - RS_HL, _p2); ptAt(p, s + RS_HL, _p1);
      obbFromPts(_p1[0], _p1[1], _p2[0], _p2[1], RS_HW, out[0]); return out.one;
    }
    ptAt(p, s, _p1);                       // đầu xe
    ptAt(p, s - dir * TRACTOR_LEN, _p2);   // đuôi đầu kéo
    let hx = _p1[0] - _p2[0], hz = _p1[1] - _p2[1]; const hl = Math.hypot(hx, hz) || 1;
    // dir<0 (lùi): đường đi theo hướng chuyển động, đuôi xe nằm phía trước theo chiều chuyển động
    let fx = _p1[0], fz = _p1[1], rx = _p2[0], rz = _p2[1];
    if (!veh.trailer) {
      obbFromPts(fx, fz, rx, rz, TRACTOR_W / 2, out[0]); return out.one;
    }
    // có moóc: thân đầu kéo chỉ phần cabin (khung sau nằm dưới moóc)
    const ux = (fx - rx) / hl, uz = (fz - rz) / hl;
    obbFromPts(fx, fz, fx - ux * CAB_LEN, fz - uz * CAB_LEN, TRACTOR_W / 2, out[0]);
    ptAt(p, s - dir * FIFTH_WHEEL, _p2);                 // chốt kéo
    ptAt(p, s - dir * (FIFTH_WHEEL + TRAILER_AXIS), _p3); // trục sau moóc
    const t = norm(_p2[0] - _p3[0], _p2[1] - _p3[1]);
    obbFromPts(_p2[0] + t[0] * KINGPIN_FRONT, _p2[1] + t[1] * KINGPIN_FRONT,
      _p2[0] - t[0] * (TRAILER_LEN - KINGPIN_FRONT), _p2[1] - t[1] * (TRAILER_LEN - KINGPIN_FRONT), TRAILER_W / 2, out[1]);
    return out.two;
  }

  // SAT cho 2 OBB; trả về true nếu giao nhau (chạm thực sự, sai số 1e-6)
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
  const SCENARIOS = [
    { id: 'normal', name: 'Vận hành bình thường',
      desc: 'Xe TQ từ Km0 vào cổng nhập 2 làn (OCR + cân 120 tấn), hạ moóc ở khu đổi đầu kéo; đầu kéo VN vào ghép moóc, đưa hàng ra cổng xuất nội địa. Một phần hàng hạ bãi / lấy từ bãi bằng xe nâng chụp, ~20% bị Hải quan chỉ định kiểm hóa.',
      rates: { tqSwap: 26, tqYard: 5, vnYard: 5 }, cap: 22, inspect: 0.2, events: [] },
    { id: 'peak', name: 'Cao điểm mùa vụ (gấp 2,5 lần)',
      desc: 'Lưu lượng gấp ~2,5 lần (mùa nông sản). Hàng chờ hình thành trên đường Km0; SIVIP giới hạn số xe trong bãi, chỉ mở barie khi đã đặt được ô đổi đầu kéo / vị trí xếp dỡ.',
      rates: { tqSwap: 60, tqYard: 10, vnYard: 10 }, cap: 30, inspect: 0.2, events: [] },
    { id: 'laneFail', name: 'Sự cố: làn nhập 1 hỏng OCR/barie',
      desc: 'Phút thứ 8, làn nhập 1 lỗi camera OCR, chuyển xử lý thủ công (chậm gấp 5). SIVIP điều hướng xe mới sang làn 2. Phút thứ 38 làn 1 được khôi phục.',
      rates: { tqSwap: 40, tqYard: 6, vnYard: 6 }, cap: 24, inspect: 0.2,
      events: [{ t: 480, type: 'laneFail', lane: 0 }, { t: 2280, type: 'laneRestore', lane: 0 }] },
    { id: 'breakdown', name: 'Sự cố: xe hỏng trên đường nội bộ',
      desc: 'Phút thứ 6, một xe chở hàng chết máy trên đường vành đai. Xe phía sau tự dừng giữ khoảng cách (không đặt được ô phía trước); vùng giao cắt không bị chiếm. Sau 5 phút xe cứu hộ kéo đi, giao thông tự giải tỏa.',
      rates: { tqSwap: 30, tqYard: 5, vnYard: 5 }, cap: 22, inspect: 0.2,
      events: [{ t: 360, type: 'breakdown', dur: 300 }] },
    { id: 'inspection', name: 'Hải quan tăng kiểm hóa (60%)',
      desc: '60% lô hàng bị chỉ định kiểm hóa. Làn kiểm hóa 2 trạm nối tiếp; xe chỉ rời khu đổi đầu kéo khi đã đặt được trạm, nên không ùn ra đường vành đai.',
      rates: { tqSwap: 30, tqYard: 4, vnYard: 4 }, cap: 22, inspect: 0.6, events: [] },
    { id: 'av', name: 'Mức B: xe tự hành TQ đến khu đổi đầu kéo',
      desc: 'Xe đầu kéo tự hành TQ (màu trắng) nhận bàn giao điều khiển tại Km0, chạy chậm hơn (14 km/h), chỉ được vào khu đổi đầu kéo (geofence). Tài xế VN nhận moóc như bình thường.',
      rates: { tqSwap: 30, tqYard: 0, vnYard: 5 }, cap: 22, inspect: 0.2, av: 1, events: [] },
    { id: 'weather', name: 'Mưa lớn / sương mù',
      desc: 'Tốc độ tối đa giảm 40%, khoảng cách dừng xe tăng thêm 4 m. Thông lượng giảm nhưng vẫn không có xung đột.',
      rates: { tqSwap: 26, tqYard: 5, vnYard: 5 }, cap: 22, inspect: 0.2, weather: 1, events: [] },
    { id: 'stress', name: 'Kiểm thử áp lực (quá tải)',
      desc: 'Đầu vào gấp 5 lần năng lực. Dùng để chứng minh cơ chế điều phối: hàng chờ dài nhưng không va chạm và không kẹt cứng trong bãi.',
      rates: { tqSwap: 130, tqYard: 25, vnYard: 25 }, cap: 34, inspect: 0.3, events: [] },
  ];

  // ------------------------------------------------------------------ mô phỏng
  function Sim(scenarioId, seed) {
    this.sc = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    this.rng = mulberry32(seed == null ? 12345 : seed);
    this.t = 0; this.tick = 0;
    this.nextId = 1;
    this.owner = new Int32Array(GW * GH);
    this.zoneOf = new Int16Array(GW * GH);
    this.stampArr = new Int32Array(GW * GH); this.stamp = 1;
    this.vehicles = []; this.trailers = []; this.vmap = new Map();
    this.zones = [null];
    this.events = [];
    this.log = [];
    this.stats = { collisions: 0, minClear: Infinity, minClearPair: null, invariant: 0, maxWait: 0, maxWaitId: 0,
      swaps: 0, tqOut: 0, yardIn: 0, yardOut: 0, inspected: 0, spawned: 0, zoneWaits: 0, despawned: 0, turnaround: [] };
    this.backlog = { west: [], east: [] };
    this.lanes = [
      { id: 0, name: 'Làn nhập 1', failed: false, openUntil: 0, busy: 0, assigned: 0 },
      { id: 1, name: 'Làn nhập 2', failed: false, openUntil: 0, busy: 0, assigned: 0 },
    ];
    this.gates = { outW: { openUntil: 0 }, ein: { openUntil: 0 }, outS: [{ openUntil: 0 }, { openUntil: 0 }] };
    this.outSNext = 0;
    this.bays = LAYOUT.bayX.map((x, i) => ({ i, x, state: 'free', trailer: null, by: 0 }));
    this.yard = { count: 0, pendingPick: 0, st: LAYOUT.yardSt.map((x, i) => ({ i, x, by: 0, occupied: false })) };
    this.ins = { st: LAYOUT.insSt.map((x, i) => ({ i, x, by: 0, occupied: false })) };
    this.stack = []; // stack[col][row] = [containerId...]
    this.containers = new Map();
    this.inside = 0;
    this.weather = this.sc.weather ? 0.6 : 1;
    this.gapExtra = this.sc.weather ? 4 : 0;
    this.version = 0; // tăng khi kho bãi đổi (để renderer dựng lại)
    this._bodies = mkPool();
    this._cells = [];
    this.initZones();
    this.initPaths();
    this.initYard();
    this.initRS();
    this.schedule();
  }

  Sim.prototype.logEv = function (msg, kind) {
    this.log.push({ t: this.t, msg, kind: kind || 'info' });
    if (this.log.length > 200) this.log.shift();
  };
  Sim.prototype.newId = function () { return this.nextId++; };

  Sim.prototype.initZones = function () {
    ZONE_RECTS.forEach((zr, k) => {
      const id = k + 1; const [x0, x1, z0, z1] = zr.r;
      this.zones.push({ id, name: zr.name, rect: zr.r, lockedBy: 0, locks: 0 });
      for (let iz = 0; iz < GH; iz++) {
        const cz = GZ0 + (iz + 0.5) * CELL; if (cz < z0 || cz >= z1) continue;
        for (let ix = 0; ix < GW; ix++) {
          const cx = GX0 + (ix + 0.5) * CELL; if (cx < x0 || cx >= x1) continue;
          this.zoneOf[iz * GW + ix] = id;
        }
      }
    });
  };

  // Các tuyến đường cố định (waypoint), góc bo R=10 m
  Sim.prototype.initPaths = function () {
    const L = LAYOUT, R = L.ring;
    const P = {};
    // vào từ Km0 tới barie (theo làn)
    P.westIn = L.inZ.map(z => buildPath([[L.westSpawnX, L.approachZ], [-80, L.approachZ], [-64, z], [L.inStopX, z]], 10, { name: 'westIn' }));
    // xe ra về Km0: bắt đầu tại barie ra
    P.outW = buildPath([[L.outWStopX, L.outWZ], [L.westDespawnX, L.outWZ]], 10);
    P.eastIn = buildPath([[L.eastSpawnX, L.einZ], [L.einStopX, L.einZ]], 10);
    P.outS = L.outSX.map(x => buildPath([[x, L.outSStopZ], [x, L.southDespawnZ]], 10));
    this.P = P;
    // tuyến hiển thị mặt đường (renderer dùng)
    const bays = L.bayX;
    this.roadPolys = [
      [[R.W, R.N], [R.E, R.N], [R.E, R.S], [R.W, R.S], [R.W, R.N]],
      [[L.westSpawnX - 60, L.approachZ], [-80, L.approachZ], [-64, L.inZ[0]], [R.W, L.inZ[0]], [R.W, L.inZ[0] - 12]],
      [[-80, L.approachZ], [-64, L.inZ[1]], [R.W, L.inZ[1]], [R.W, L.inZ[1] - 12]],
      [[R.W, L.outWZ + 12], [R.W, L.outWZ], [L.westDespawnX - 60, L.outWZ]],
      [[L.eastSpawnX + 60, L.einZ], [R.E, L.einZ], [R.E, L.einZ + 12]],
      ...L.outSX.map(x => [[x + 12, R.S], [x, R.S], [x, L.southDespawnZ + 40]]),
      [[L.connX + 12, R.S], [L.connX, R.S], [L.connX, L.swapZ], [R.W, L.swapZ], [R.W, L.swapZ - 12]],
      ...bays.map(x => [[x - 12, R.N], [x, R.N], [x, L.swapZ], [x - 12, L.swapZ]]),
      [[L.yardX - 12, R.N], [L.yardX, R.N], [L.yardX, L.yardZ], [R.E, L.yardZ], [R.E, L.yardZ + 12]],
      [[R.E, L.insZ - 12], [R.E, L.insZ], [L.insTurnX, L.insZ], [L.insTurnX, R.S], [L.insTurnX - 12, R.S]],
    ];
  };

  Sim.prototype.initYard = function () {
    const L = LAYOUT; const r = this.rng;
    const colors = ['#c0392b', '#2471a3', '#1e8449', '#d68910', '#7d3c98', '#5d6d7e', '#a04000', '#117a65'];
    this.colors = colors;
    for (let c = 0; c < L.stackCols.length; c++) {
      this.stack.push([]);
      for (let rr = 0; rr < L.stackRows.length; rr++) {
        const pile = []; const h = Math.floor(r() * 3);
        for (let k = 0; k < h; k++) { const id = this.newContainer(); pile.push(id); }
        this.stack[c].push(pile);
      }
    }
    // 2 moóc đã nằm sẵn ở khu đổi đầu kéo, chờ đầu kéo VN
    [1, 4].forEach(bi => this.placeTrailerInBay(this.bays[bi], this.newContainer()));
  };
  Sim.prototype.newContainer = function () {
    const id = this.newId();
    this.containers.set(id, { id, color: this.colors[Math.floor(this.rng() * this.colors.length)], where: 'none', pos: null });
    return id;
  };
  Sim.prototype.stockCount = function () { let n = 0; for (const col of this.stack) for (const p of col) n += p.length; return n; };

  Sim.prototype.placeTrailerInBay = function (bay, cont) {
    const L = LAYOUT; const p = buildPath([[bay.x, L.bayFrontZ - 30], [bay.x, L.bayFrontZ]], 10);
    const tr = { id: this.newId(), obb: mkObb(), container: cont, parked: true, cells: [], bay: bay.i };
    // vị trí như khi đầu kéo hạ moóc với đầu xe tại bayFrontZ
    const fake = { kind: 'truck', trailer: tr };
    const b = bodiesAt(fake, { path: p, dir: 1 }, p.len, mkPool());
    Object.assign(tr.obb, b[1]);
    this.trailers.push(tr); this.claimTrailer(tr);
    bay.state = 'trailer'; bay.trailer = tr;
    this.callVN(bay, 30 + this.rng() * 90);
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
  Sim.prototype.claimTrailer = function (tr) {
    const out = []; this.stamp++; this.cellsOfObb(tr.obb, MARGIN, out);
    for (const c of out) { if (this.owner[c] === 0) { this.owner[c] = tr.id; tr.cells.push(c); } else if (this.owner[c] !== tr.id) this.stats.invariant++; }
  };
  Sim.prototype.releaseCells = function (o) {
    const ow = this.owner;
    for (const c of o.cells) if (ow[c] === o.id) ow[c] = 0;
    o.cells.length = 0;
  };
  // 0 = được; 1 = vướng ô xe khác; 2 = vướng vùng giao cắt chưa khóa
  Sim.prototype.checkCells = function (veh, cells) {
    const ow = this.owner, zo = this.zoneOf;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i]; const o = ow[c];
      if (o !== 0 && o !== veh.id && o !== veh.friend) { this._blk = { type: 1, cell: c, owner: o }; return 1; }
      const z = zo[c];
      if (z !== 0 && this.zones[z].lockedBy !== veh.id) { this._blk = { type: 2, zone: z, cell: c }; return 2; }
    }
    return 0;
  };
  Sim.prototype.bodyConflict = function (veh, cells) {
    const ow = this.owner;
    for (let i = 0; i < cells.length; i++) { const o = ow[cells[i]]; if (o !== 0 && o !== veh.id && o !== veh.friend) { if (!this.firstInv) this.firstInv = { t: this.t, v: veh.id, o, cx: GX0 + (cells[i] % GW) + 0.5, cz: GZ0 + Math.floor(cells[i] / GW) + 0.5, step: veh.steps[veh.si] && (veh.steps[veh.si].name || veh.steps[veh.si].type), ownerStep: this.vmap.get(o) && (this.vmap.get(o).steps[this.vmap.get(o).si] || {}).name }; return true; } }
    return false;
  };
  Sim.prototype.markCells = function (veh, cells) {
    const ow = this.owner;
    for (let i = 0; i < cells.length; i++) { const c = cells[i]; if (ow[c] === 0) { ow[c] = veh.id; veh.cells.push(c); } }
  };

  // Khóa vùng + đặt ô xuyên vùng và khoảng thoát. Trả về s đạt được hoặc -1 nếu thất bại (đã hoàn tác).
  Sim.prototype.tryAcquire = function (veh, st, sFrom, sStop) {
    const mark = veh.cells.length; const locked = [];
    const z0 = this._blk.zone;
    const zones = this.zones;
    if (zones[z0].lockedBy !== 0) return -1;
    zones[z0].lockedBy = veh.id; locked.push(z0);
    const total = veh.trailer ? TRUCK_TOTAL : (veh.kind === 'rs' ? RS_HL * 2 : TRACTOR_LEN);
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
      if (++guard > 400) { ok = false; break; }
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
      cells: [], zones: [], clearTo: -1, friend: 0, trailer: null, task: null, blocked: null,
      waitT: 0, totalWait: 0, born: this.t, broken: 0, av: false, state: 'drive', label: '', lane: -1, flags: {} };
    Object.assign(v, opts || {});
    return v;
  };
  Sim.prototype.curStep = function (v) { return v.steps[v.si]; };

  // thử đưa xe vào thế giới (chỉ khi ô thân xe trống)
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

  // ---- tạo xe theo loại công việc
  Sim.prototype.makeWestArrival = function (job) {
    // chọn làn nhập: làn không hỏng, ít xe đã chọn nhất
    const lanes = this.lanes.filter(l => !l.failed);
    const pool = lanes.length ? lanes : this.lanes;
    let lane = pool[0]; for (const l of pool) if (l.assigned < lane.assigned) lane = l;
    const av = job === 'tqSwap' && this.sc.av && this.rng() < this.sc.av;
    const v = this.makeVehicle(av ? 'av' : 'tq', job, [], { vmax: av ? 3.9 : 5.5, av, lane: lane.id });
    v.trailer = { id: this.newId(), obb: mkObb(), container: this.newContainer(), parked: false, cells: [] };
    const p = this.P.westIn[lane.id];
    v.steps.push(drive(p, 0, p.len));
    v.steps.push(task('gateIn', (veh) => this.taskGateIn(veh)));
    return v;
  };
  Sim.prototype.makeEastArrival = function (job, bay) {
    const v = this.makeVehicle(job === 'vnSwap' ? 'vn' : 'vnTruck', job, [], { vmax: 5.5, bay: bay ? bay.i : -1 });
    if (job === 'vnYard') v.trailer = { id: this.newId(), obb: mkObb(), container: 0, parked: false, cells: [] };
    v.steps.push(drive(this.P.eastIn, 0, this.P.eastIn.len));
    v.steps.push(task('gateIn', (veh) => this.taskGateInEast(veh)));
    return v;
  };

  // ------------------------------------------------------------------ nhiệm vụ tại điểm dừng
  Sim.prototype.taskGateIn = function (v) {
    const lane = this.lanes[v.lane];
    const svc = (25 + this.rng() * 20) * (lane.failed ? 5 : 1);
    return { dwell: svc, label: lane.failed ? 'Xử lý thủ công' : 'OCR + cân',
      then: () => ({ wait: () => this.dispatchWest(v), label: 'Chờ đặt chỗ',
        then: () => { lane.openUntil = this.t + 10; lane.assigned = Math.max(0, lane.assigned - 1); } }) };
  };
  Sim.prototype.taskGateInEast = function (v) {
    return { dwell: 15 + this.rng() * 10, label: 'OCR',
      then: () => ({ wait: () => this.dispatchEast(v), label: 'Chờ đặt chỗ', then: () => { this.gates.ein.openUntil = this.t + 10; } }) };
  };

  Sim.prototype.ringFromWestGate = function (z) { const R = LAYOUT.ring; return [[LAYOUT.inStopX, z], [R.W, z], [R.W, R.N]]; };

  Sim.prototype.dispatchWest = function (v) {
    const L = LAYOUT, R = L.ring;
    if (this.inside >= this.sc.cap) return false;
    const z = L.inZ[v.lane];
    if (v.job === 'tqSwap') {
      const bay = this.bays.find(b => b.state === 'free'); if (!bay) return false;
      bay.state = 'reservedTQ'; bay.by = v.id; v.bay = bay.i;
      const p = buildPath([...this.ringFromWestGate(z), [bay.x, R.N], [bay.x, L.bayFrontZ]], 10);
      v.steps.push(drive(p, 0, p.len));
      v.steps.push(task('uncouple', (veh) => this.taskUncouple(veh, bay)));
    } else {
      if (this.yard.count >= 3) return false;
      this.yard.count++;
      this.pushYardRoute(v, this.ringFromWestGate(z), 'west');
    }
    this.inside++; v.inside = true; v.admitted = true;
    return true;
  };
  Sim.prototype.dispatchEast = function (v) {
    const L = LAYOUT, R = L.ring;
    if (this.inside >= this.sc.cap) return false;
    const pre = [[L.einStopX, L.einZ], [R.E, L.einZ], [R.E, R.S]];
    if (v.job === 'vnSwap') {
      const bay = this.bays[v.bay];
      const p = buildPath([...pre, [L.connX, R.S], [L.connX, L.swapZ], [bay.x - 16, L.swapZ]], 10);
      v.steps.push(drive(p, 0, p.len));
      const rp = buildPath([[bay.x - 16, L.swapZ], [bay.x, L.swapZ], [bay.x, L.bayFrontZ]], 10);
      v.steps.push(drive(rp, 0, rp.len, -1, { friend: bay.trailer.id, reverse: true }));
      v.steps.push(task('couple', (veh) => this.taskCouple(veh, bay)));
    } else {
      if (this.yard.count >= 3) return false;
      if (this.stockCount() - this.yard.pendingPick < 1) return false;
      this.yard.count++; this.yard.pendingPick++;
      this.pushYardRoute(v, [...pre, [R.W, R.S], [R.W, R.N]], 'east');
    }
    this.inside++; v.inside = true; v.admitted = true;
    return true;
  };

  // Tuyến vào bãi xếp: tới điểm chờ → (gán vị trí) → xếp dỡ → ra
  Sim.prototype.pushYardRoute = function (v, pre, side) {
    const L = LAYOUT, R = L.ring;
    const exitTail = side === 'west'
      ? [[R.E, R.S], [R.W, R.S], [R.W, L.outWZ], [L.outWStopX, L.outWZ]]
      : null;
    let wps = [...pre, [L.yardX, R.N], [L.yardX, L.yardZ], [R.E, L.yardZ]];
    let outIdx = -1;
    if (side === 'west') wps = wps.concat(exitTail);
    else { outIdx = this.pickOutS(); const ox = L.outSX[outIdx]; wps = wps.concat([[R.E, R.S], [ox, R.S], [ox, L.outSStopZ]]); }
    const p = buildPath(wps, 10);
    const sHold = sNear(p, L.yardX, L.yardHoldZ);
    v.yardPath = p; v.outIdx = outIdx;
    v.steps.push(drive(p, 0, sHold));
    v.steps.push(task('yardHold', (veh) => ({ wait: () => this.assignYard(veh), label: 'Chờ vị trí xếp dỡ', then: () => {} })));
  };
  Sim.prototype.assignYard = function (v) {
    const st = this.yard.st; const L = LAYOUT;
    // trạm 2 (hạ lưu) chỉ vào được nếu trạm 1 không có xe đứng
    let pick = null;
    if (!st[1].by && !st[0].occupied && !st[0].by) pick = st[1];
    else if (!st[0].by) pick = st[0];
    if (!pick) return false;
    pick.by = v.id;
    const p = v.yardPath; const sHold = v.steps[v.si - 1].s1;
    const sSt = sNear(p, pick.x, L.yardZ);
    const rest = [drive(p, sHold, sSt),
      task('rs', (veh) => { pick.occupied = true; return this.taskRS(veh, pick); }),
    ];
    const sEnd = p.len;
    rest.push(drive(p, sSt, sEnd, 1, { onStart: () => { pick.occupied = false; pick.by = 0; this.yard.count--; } }));
    if (v.outIdx < 0) rest.push(task('gateOutW', (veh) => this.taskGateOutW(veh)));
    else rest.push(task('gateOutS', (veh) => this.taskGateOutS(veh)));
    v.steps.splice(v.si + 1, 0, ...rest);
    return true;
  };

  Sim.prototype.pickOutS = function () { this.outSNext = (this.outSNext + 1) % 2; return this.outSNext; };

  Sim.prototype.taskGateOutW = function (v) {
    return { dwell: 8 + this.rng() * 6, label: 'OCR ra', then: () => {
      this.gates.outW.openUntil = this.t + 8; this.leaveInside(v);
      v.steps.push(drive(this.P.outW, 0, this.P.outW.len));
      v.steps.push(task('despawn', (veh) => this.despawn(veh)));
    } };
  };
  Sim.prototype.taskGateOutS = function (v) {
    return { dwell: 20 + this.rng() * 15, label: 'Kiểm tra seal / tờ khai', then: () => {
      this.gates.outS[v.outIdx].openUntil = this.t + 8; this.leaveInside(v);
      const p = this.P.outS[v.outIdx];
      v.steps.push(drive(p, 0, p.len));
      v.steps.push(task('despawn', (veh) => this.despawn(veh)));
    } };
  };
  Sim.prototype.leaveInside = function (v) { if (v.inside) { v.inside = false; this.inside--; } };

  Sim.prototype.taskUncouple = function (v, bay) {
    return { dwell: 60 + this.rng() * 40, label: 'Hạ moóc', then: () => {
      const L = LAYOUT, R = L.ring;
      const tr = v.trailer; const bs = bodiesAt(v, this.curStepPrev(v), v.s, this._bodies);
      Object.assign(tr.obb, bs[1]);
      // chuyển quyền ô: xe → moóc
      this.releaseCells(v); tr.parked = true; tr.bay = bay.i; this.trailers.push(tr); this.claimTrailer(tr);
      v.trailer = null; v.friend = tr.id;
      bay.state = 'trailer'; bay.trailer = tr; bay.by = 0;
      this.callVN(bay, 40 + this.rng() * 120);
      const p = buildPath([[bay.x, L.bayFrontZ], [bay.x, L.swapZ], [R.W, L.swapZ], [R.W, L.outWZ], [L.outWStopX, L.outWZ]], 10);
      v.steps.push(drive(p, 0, p.len));
      v.steps.push(task('gateOutW', (veh) => this.taskGateOutW(veh)));
      // đặt lại ô thân xe đầu kéo (bỏ qua ô của moóc bạn)
      const cells = this.sampleCells(v, v.steps[v.si + 1], 0); this.markCells(v, cells);
    } };
  };
  Sim.prototype.curStepPrev = function (v) { for (let i = v.si; i >= 0; i--) if (v.steps[i].type === 'drive') return v.steps[i]; return null; };

  Sim.prototype.callVN = function (bay, delay) {
    bay.state = 'called';
    this.addEvent({ t: this.t + delay, type: 'spawnVN', bay: bay.i });
  };

  Sim.prototype.taskCouple = function (v, bay) {
    return { dwell: 70 + this.rng() * 50, label: 'Ghép moóc', then: () => ({ wait: () => this.routeAfterCouple(v, bay), label: 'Chờ lịch kiểm hóa', then: () => {} }) };
  };
  Sim.prototype.routeAfterCouple = function (v, bay) {
    const L = LAYOUT, R = L.ring;
    let inspect = v.flags.inspect;
    if (inspect == null) { inspect = v.flags.inspect = this.rng() < this.sc.inspect; }
    let st = null;
    if (inspect) {
      const s = this.ins.st; // s[1] thượng lưu (x lớn), s[0] hạ lưu
      if (!s[0].by && !s[1].by) st = s[0];
      else if (!s[1].by) st = s[1];
      if (!st) return false;
      st.by = v.id;
    }
    const tr = bay.trailer;
    // ghép: moóc thành một phần của xe
    if (!v.trailer) {
      this.releaseCells(tr); this.trailers.splice(this.trailers.indexOf(tr), 1);
      tr.parked = false; v.trailer = tr; v.friend = 0;
      bay.state = 'free'; bay.trailer = null; bay.by = 0;
    }
    const outIdx = this.pickOutS(); v.outIdx = outIdx; const ox = L.outSX[outIdx];
    const head = [[bay.x, L.bayFrontZ], [bay.x, L.swapZ], [R.W, L.swapZ], [R.W, R.N], [R.E, R.N]];
    let p;
    if (st) p = buildPath([...head, [R.E, L.insZ], [L.insTurnX, L.insZ], [L.insTurnX, R.S], [ox, R.S], [ox, L.outSStopZ]], 10);
    else p = buildPath([...head, [R.E, R.S], [ox, R.S], [ox, L.outSStopZ]], 10);
    this.releaseCells(v);
    const st0 = drive(p, 0, p.len);
    if (st) {
      const sS = sNear(p, st.x, L.insZ);
      v.steps.push(drive(p, 0, sS));
      v.steps.push(task('inspect', () => { st.occupied = true; return { dwell: 180 + this.rng() * 180, label: 'Kiểm hóa', then: () => { this.stats.inspected++; } }; }));
      v.steps.push(drive(p, sS, p.len, 1, { onStart: () => { st.occupied = false; st.by = 0; } }));
    } else v.steps.push(st0);
    v.steps.push(task('gateOutS', (veh) => this.taskGateOutS(veh)));
    const cells = this.sampleCells(v, v.steps[v.si + 1], 0);
    if (this.bodyConflict(v, cells)) this.stats.invariant++;
    this.markCells(v, cells);
    return true;
  };

  // ------------------------------------------------------------------ xe nâng chụp (RS)
  Sim.prototype.initRS = function () {
    const L = LAYOUT;
    const p = buildPath([[L.rsX0, L.rsZ], [L.rsX1, L.rsZ]], 10);
    const rs = this.makeVehicle('rs', 'rs', [drive(p, 0, sNear(p, 170, L.rsZ))], { vmax: 2.5, a: 0.6, b: 1.2 });
    rs.queue = []; rs.boom = 0; rs.carry = null; rs.aislePath = p;
    rs.steps[0].s1 = rs.steps[0].s0 = sNear(p, 170, L.rsZ);
    this.trySpawn(rs); this.rs = rs; rs.state = 'idle';
  };
  Sim.prototype.taskRS = function (truck, station) {
    const job = { truck, station, done: false };
    this.rs.queue.push(job);
    return { wait: () => job.done, label: 'Xe nâng chụp đang xếp dỡ', then: () => {
      if (truck.job === 'tqYard') this.stats.yardIn++; else this.stats.yardOut++;
    } };
  };
  Sim.prototype.updateRS = function () {
    const rs = this.rs; const L = LAYOUT;
    if (rs.state === 'idle') {
      if (!rs.queue.length) return;
      rs.cur = rs.queue.shift();
      const tx = rs.cur.station.x - FIFTH_WHEEL - (TRAILER_LEN / 2 - KINGPIN_FRONT);
      const curX = this.rsX();
      if (Math.abs(tx - curX) < 0.3) { rs.state = 'lift'; rs.t0 = this.t; this.beginTransfer(); return; }
      const p = buildPath([[curX, L.rsZ], [tx, L.rsZ]], 10);
      rs.steps = [drive(p, 0, p.len)]; rs.si = 0; rs.s = 0; rs.state = 'drive';
      return;
    }
    if (rs.state === 'lift') {
      const T = 55; const f = clamp((this.t - rs.t0) / T, 0, 1);
      rs.boom = Math.sin(f * Math.PI);
      if (rs.carry) rs.carry.f = f;
      if (f >= 1) this.endTransfer();
    }
  };
  Sim.prototype.rsX = function () { const rs = this.rs; const st = rs.steps[rs.si] || rs.steps[rs.steps.length - 1]; ptAt(st.path, rs.s, _p1); return _p1[0]; };
  Sim.prototype.beginTransfer = function () {
    const rs = this.rs; const job = rs.cur; const tr = job.truck.trailer; const L = LAYOUT;
    let col = 0, row = 0, from, to, cid;
    // điểm trên moóc
    const ob = bodiesAt(job.truck, this.curStepPrev(job.truck), job.truck.s, mkPool())[1];
    const onTr = { x: ob.cx, y: 2.9, z: ob.cz, h: Math.atan2(ob.uz, ob.ux) };
    if (job.truck.job === 'tqYard') {
      // hạ container xuống chồng thấp nhất gần nhất
      let best = null;
      for (let c = 0; c < L.stackCols.length; c++) for (let r = 0; r < L.stackRows.length; r++) {
        const h = this.stack[c][r].length; if (h >= L.stackTiers) continue;
        const d = Math.abs(L.stackCols[c] - ob.cx) + h * 20 + r * 3;
        if (!best || d < best.d) best = { c, r, d };
      }
      if (!best) best = { c: 0, r: 0 };
      col = best.c; row = best.r; cid = tr.container; tr.container = 0;
      const h = this.stack[col][row].length;
      from = onTr; to = { x: L.stackCols[col], y: 1.3 + h * 2.6, z: L.stackRows[row], h: 0 };
      rs.carry = { cid, from, to, f: 0, col, row, down: true };
    } else {
      let best = null;
      for (let c = 0; c < L.stackCols.length; c++) for (let r = 0; r < L.stackRows.length; r++) {
        const h = this.stack[c][r].length; if (!h) continue;
        const d = Math.abs(L.stackCols[c] - ob.cx) - h * 5 + r * 3;
        if (!best || d < best.d) best = { c, r, d };
      }
      col = best.c; row = best.r; cid = this.stack[col][row].pop(); this.version++;
      const h = this.stack[col][row].length;
      from = { x: L.stackCols[col], y: 1.3 + h * 2.6, z: L.stackRows[row], h: 0 }; to = onTr;
      rs.carry = { cid, from, to, f: 0, col, row, down: false };
      this.yard.pendingPick--;
    }
  };
  Sim.prototype.endTransfer = function () {
    const rs = this.rs; const c = rs.carry; const job = rs.cur;
    if (c.down) { this.stack[c.col][c.row].push(c.cid); this.version++; }
    else job.truck.trailer.container = c.cid;
    rs.carry = null; rs.boom = 0; job.done = true; rs.cur = null; rs.state = 'idle';
  };

  // ------------------------------------------------------------------ vòng lặp
  Sim.prototype.schedule = function () {
    // tạo trước lịch đến (Poisson) cho 4 giờ
    const r = this.sc.rates; const H = 4 * 3600;
    const gen = (rate, fn) => { if (!rate) return; let t = 2 + this.rng() * 20; while (t < H) { this.events.push({ t, type: 'arrive', fn }); t += -Math.log(1 - this.rng()) * 3600 / rate; } };
    gen(r.tqSwap, 'tqSwap'); gen(r.tqYard, 'tqYard'); gen(r.vnYard, 'vnYard');
    for (const e of this.sc.events) this.events.push(Object.assign({}, e));
    this.events.sort((a, b) => a.t - b.t);
  };
  Sim.prototype.addEvent = function (e) {
    let i = this.events.length; while (i > 0 && this.events[i - 1].t > e.t) i--;
    this.events.splice(i, 0, e);
  };
  Sim.prototype.handleEvents = function () {
    while (this.events.length && this.events[0].t <= this.t) {
      const e = this.events.shift();
      if (e.type === 'arrive') {
        if (e.fn === 'vnYard') this.backlog.east.push(() => this.makeEastArrival('vnYard'));
        else this.backlog.west.push(() => this.makeWestArrival(e.fn));
      } else if (e.type === 'spawnVN') {
        const bay = this.bays[e.bay];
        this.backlog.east.push(() => this.makeEastArrival('vnSwap', bay));
      } else if (e.type === 'laneFail') {
        this.lanes[e.lane].failed = true; this.logEv(`${this.lanes[e.lane].name} lỗi OCR/barie → xử lý thủ công, SIVIP điều hướng xe mới sang làn còn lại`, 'warn');
      } else if (e.type === 'laneRestore') {
        this.lanes[e.lane].failed = false; this.logEv(`${this.lanes[e.lane].name} đã khôi phục`, 'ok');
      } else if (e.type === 'breakdown') {
        const R = LAYOUT.ring;
        const cand = this.vehicles.filter(v => v.kind !== 'rs' && v.trailer && v.state === 'drive' && !v.zones.length && v.v > 1 && (() => { ptAt(this.curStep(v).path, v.s, _p1); return Math.abs(_p1[1] - R.N) < 2 && _p1[0] > 130 && _p1[0] < 200 || Math.abs(_p1[0] - R.E) < 2 && _p1[1] > 108 && _p1[1] < 124 || Math.abs(_p1[1] - R.S) < 2 && _p1[0] > 160; })());
        if (cand.length) { const v = cand[0]; v.broken = this.t + e.dur; this.logEv(`Xe #${v.id} chết máy trên đường vành đai, các xe sau tự dừng giữ khoảng cách`, 'warn'); }
        else { e.t = this.t + 5; this.events.unshift(e); break; }
      }
    }
  };
  Sim.prototype.trySpawns = function () {
    for (const key of ['west', 'east']) {
      const q = this.backlog[key]; if (!q.length) continue;
      if (!q[0].veh) q[0].veh = q[0]();
      const v = q[0].veh;
      if (this.trySpawn(v)) {
        q.shift();
        if (v.lane >= 0) this.lanes[v.lane].assigned++;
        if (v.av) v.label = 'Tự hành';
      }
    }
  };

  Sim.prototype.step = function () {
    this.t += DT; this.tick++;
    this.handleEvents();
    this.trySpawns();
    this.updateRS();
    // xe cũ ưu tiên trước (thứ tự id)
    const vs = this.vehicles;
    for (let i = 0; i < vs.length; i++) this.updateVehicle(vs[i]);
    // dọn xe đã ra
    if (this._dead) { this.vehicles = this.vehicles.filter(v => !v.dead); this._dead = false; }
    this.checkCollisions();
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
        if (st.type === 'drive') { v.s = st.s0; if (st.onStart) st.onStart(); if (st.friend) v.friend = st.friend; v.state = 'drive'; }
        else return;
      } else return;
    }
    if (v.kind === 'rs' && v.state !== 'drive') return;
    this.driveVehicle(v, st);
  };

  Sim.prototype.driveVehicle = function (v, st) {
    // xe đứng yên & vật cản vẫn còn → bỏ qua tính lại
    if (v.blocked && v.v === 0) {
      const b = v.blocked; let still = false;
      if (b.type === 1) { const o = this.owner[b.cell]; still = o !== 0 && o !== v.id && o !== v.friend; }
      else if (b.type === 2) { const z = this.zones[b.zone]; still = z.lockedBy !== 0 && z.lockedBy !== v.id; }
      else if (b.type === 3) still = this.t < v.broken;
      if (still) { v.waitT += DT; v.totalWait += DT; this.noteWait(v); return; }
    }
    this.releaseCells(v);
    // 1) thân xe
    const body = this.sampleCells(v, st, v.s);
    if (this.bodyConflict(v, body)) this.stats.invariant++;
    this.markCells(v, body);
    // nhả vùng không còn dính
    this.releaseZones(v);
    // 2) đặt chỗ phía trước
    const wf = this.weather; const vmax = v.vmax * wf;
    const look = vmax * vmax / (2 * v.b) + 3 + this.gapExtra;
    let target = Math.min(st.s1, v.s + look);
    if (v.zones.length) target = Math.max(target, Math.min(v.clearTo, st.s1));
    let ss = v.s; v.blocked = null;
    if (v.broken && this.t < v.broken) { v.blocked = { type: 3 }; target = v.s; }
    else if (v.broken) { v.broken = 0; this.logEv(`Xe #${v.id} đã được cứu hộ, giao thông giải tỏa`, 'ok'); }
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
    // 3) tốc độ
    const avail = ss - v.s;
    const gap = v.blocked ? this.gapExtra : 0;
    let vAllow = Math.sqrt(Math.max(0, 2 * v.b * (avail - gap - 0.05)));
    let vc = vmax;
    for (let s2 = v.s; s2 <= ss; s2 += 2) vc = Math.min(vc, Math.sqrt(capAt(st.path, s2) ** 2 * wf * wf + 2 * v.b * (s2 - v.s)));
    if (st.dir < 0) vc = Math.min(vc, 1.3);
    let nv = Math.min(v.v + v.a * DT, vAllow, vc);
    if (nv < 0) nv = 0;
    let ds = Math.min(nv * DT, Math.max(0, avail - (v.blocked ? gap : 0)));
    if (!v.blocked && ss >= st.s1 - 1e-9 && st.s1 - v.s < 0.06) ds = st.s1 - v.s; // chạm điểm dừng
    v.s += ds; v.v = ds / DT;
    if (v.v < 0.02 && v.blocked) { v.v = 0; v.waitT += DT; v.totalWait += DT; this.noteWait(v); }
    else if (v.v > 0.05) v.waitT = 0;
    // 4) tới cuối bước lái
    if (v.s >= st.s1 - 1e-6) {
      v.s = st.s1; v.v = 0; v.si++; v.clearTo = -1;
      const nx = v.steps[v.si];
      if (v.kind === 'rs') {
        if (v.state === 'drive') { v.state = 'lift'; v.t0 = this.t; v.steps = [drive(st.path, st.s1, st.s1)]; v.si = 0; v.s = st.s1; this.beginTransfer(); }
        return;
      }
      if (nx && nx.type === 'drive') { v.s = nx.s0; if (nx.onStart) nx.onStart(); if (nx.friend) v.friend = nx.friend; }
    }
    // bỏ cờ "bạn" (moóc vừa tách) khi thân đầu kéo đã rời hẳn moóc
    if (v.friend && !v.trailer) {
      const cur = v.steps[v.si];
      if (cur && cur.type === 'drive' && !cur.friend) {
        const tr = this.trailers.find(t => t.id === v.friend);
        if (!tr) v.friend = 0;
        else {
          const bs = bodiesAt(v, cur, v.s, this._bodies); let ov = false;
          // chỉ bỏ khi vùng đệm (ô phình) của hai bên đã tách hẳn
          for (let i = 0; i < bs.length; i++) if (obbDistance(bs[i], tr.obb) < 2 * (MARGIN + HALF_DIAG) + CELL + 0.2) ov = true;
          if (!ov) v.friend = 0;
        }
      }
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
    this.stats.despawned++;
    if (v.job === 'tqSwap') { this.stats.tqOut++; this.stats.turnaround.push(this.t - v.born); }
    if (v.job === 'vnSwap') this.stats.swaps++;
    if (v.trailer && v.trailer.container) this.containers.delete(v.trailer.container);
    return { dwell: 0 };
  };

  // ------------------------------------------------------------------ kiểm tra va chạm độc lập
  Sim.prototype.allBodies = function () {
    const out = [];
    for (const v of this.vehicles) {
      if (v.dead) continue;
      const st = v.steps[v.si] && v.steps[v.si].type === 'drive' ? v.steps[v.si] : this.curStepPrev(v);
      if (!st) continue;
      const bs = bodiesAt(v, st, v.s, mkPool());
      bs.forEach((b, k) => out.push({ o: b, vid: v.id, part: k, friend: v.friend, trailerId: v.trailer ? v.trailer.id : 0 }));
    }
    for (const t of this.trailers) out.push({ o: t.obb, vid: t.id, part: 0, friend: 0, trailerId: 0, parkedTrailer: true });
    return out;
  };
  Sim.prototype.checkCollisions = function () {
    const B = this.allBodies(); let minC = this.stats.minClear;
    for (let i = 0; i < B.length; i++) {
      const a = B[i]; const ra = a.o.hl + a.o.hw;
      for (let j = i + 1; j < B.length; j++) {
        const b = B[j];
        if (a.vid === b.vid) continue;
        if ((a.friend && a.friend === b.vid) || (b.friend && b.friend === a.vid)) continue; // ghép/tách moóc có chủ đích
        const rb = b.o.hl + b.o.hw; const dx = a.o.cx - b.o.cx, dz = a.o.cz - b.o.cz;
        if (dx * dx + dz * dz > (ra + rb + 4) ** 2) continue;
        if (obbOverlap(a.o, b.o)) {
          this.stats.collisions++;
          if (this.stats.collisions <= 5) this.logEv(`VA CHẠM giữa #${a.vid} và #${b.vid}`, 'err');
          minC = 0;
        } else {
          const d = obbDistance(a.o, b.o);
          if (d < minC) { minC = d; this.stats.minClearPair = [a.vid, b.vid, this.t]; }
        }
      }
    }
    this.stats.minClear = minC;
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
      let hx = bs[0].ux, hz = bs[0].uz;
      if (v.kind === 'rs') { vs.push({ id: v.id, kind: 'rs', x: bs[0].cx, z: bs[0].cz, h: Math.atan2(hz, hx), boom: v.boom || 0, state: v.state }); continue; }
      const tr = v.trailer ? { cx: bs[1].cx, cz: bs[1].cz, h: Math.atan2(bs[1].uz, bs[1].ux), container: v.trailer.container, color: v.trailer.container ? (this.containers.get(v.trailer.container) || {}).color : null } : null;
      vs.push({ id: v.id, kind: v.kind, job: v.job, fx: front[0], fz: front[1], h: Math.atan2(hz, hx), trailer: tr,
        state: v.state, label: v.label, blocked: !!v.blocked && v.v === 0, broken: v.broken && this.t < v.broken, zones: v.zones.slice(), av: v.av, wait: v.waitT, reverse: st.dir < 0 });
    }
    const trs = this.trailers.map(t => ({ id: t.id, cx: t.obb.cx, cz: t.obb.cz, h: Math.atan2(t.obb.uz, t.obb.ux), container: t.container, color: t.container ? (this.containers.get(t.container) || {}).color : null }));
    const rs = this.rs;
    let carry = null;
    if (rs.carry) {
      const c = rs.carry; const f = c.f; const e = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2;
      carry = { color: (this.containers.get(c.cid) || {}).color || '#888', x: c.from.x + (c.to.x - c.from.x) * e, z: c.from.z + (c.to.z - c.from.z) * e,
        y: c.from.y + (c.to.y - c.from.y) * e + Math.sin(f * Math.PI) * 5, h: c.from.h + (c.to.h - c.from.h) * e };
    }
    return { t: this.t, vehicles: vs, trailers: trs, carry };
  };
  Sim.prototype.summary = function () {
    const s = this.stats;
    const queueW = this.backlog.west.length + this.vehicles.filter(v => !v.dead && (v.kind === 'tq' || v.kind === 'av') && !v.admitted).length;
    const queueE = this.backlog.east.length + this.vehicles.filter(v => !v.dead && (v.kind === 'vn' || v.kind === 'vnTruck') && !v.admitted).length;
    const tA = s.turnaround.length ? s.turnaround.reduce((a, b) => a + b, 0) / s.turnaround.length : 0;
    return { t: this.t, inside: this.inside, onMap: this.vehicles.length - 1, queueW, queueE, backlogW: this.backlog.west.length, backlogE: this.backlog.east.length,
      swaps: s.swaps, tqOut: s.tqOut, yardIn: s.yardIn, yardOut: s.yardOut, inspected: s.inspected, collisions: s.collisions, minClear: s.minClear,
      invariant: s.invariant, maxWait: s.maxWait, zoneWaits: s.zoneWaits, avgTurn: tA, stock: this.stockCount(),
      zonesLocked: this.zones.slice(1).filter(z => z.lockedBy).length,
      bays: this.bays.map(b => b.state) };
  };
  // ô đang được đặt chỗ (để vẽ lớp phủ) — trả về [ownerId, cellIdx...] gọn
  Sim.prototype.claimedCells = function (limit) {
    const res = []; const ow = this.owner;
    for (const v of this.vehicles) { for (const c of v.cells) { if (ow[c] === v.id) res.push(c, v.id); if (res.length > limit * 2) return res; } }
    for (const t of this.trailers) for (const c of t.cells) { res.push(c, t.id); }
    return res;
  };

  return {
    Sim, SCENARIOS, LAYOUT, ZONE_RECTS, DT, CELL, GX0, GZ0, GW, GH, buildPath, ptAt,
    dims: { TRACTOR_LEN, TRACTOR_W, TRAILER_LEN, TRAILER_W, CAB_LEN, FIFTH_WHEEL, KINGPIN_FRONT, RS_HL, RS_HW },
  };
});
