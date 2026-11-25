/*
 * app.js — Giao diện 3D (Three.js) cho mô phỏng bãi container Bảo Nguyên.
 * Lõi mô phỏng nằm ở sim-core.js (window.YardSim); file này chỉ vẽ và điều khiển.
 */
(async function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  let THREE, OrbitControls, CSS2DRenderer, CSS2DObject;
  try {
    THREE = await import('three');
    ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
    ({ CSS2DRenderer, CSS2DObject } = await import('three/addons/renderers/CSS2DRenderer.js'));
  } catch (e) {
    $('loading').textContent = 'Không tải được thư viện Three.js từ CDN (unpkg.com). Kiểm tra kết nối mạng rồi mở lại trang.';
    return;
  }
  const Y = window.YardSim;
  const L = Y.LAYOUT; const D = Y.dims;

  // ------------------------------------------------------------ renderer
  const wrap = $('view');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrap.appendChild(renderer.domElement);
  const labelR = new CSS2DRenderer();
  labelR.domElement.className = 'labels';
  wrap.appendChild(labelR.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a121b');
  scene.fog = new THREE.Fog('#0a121b', 420, 900);
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 3000);
  const controls = new OrbitControls(camera, labelR.domElement);
  controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.48; controls.minDistance = 25; controls.maxDistance = 900;
  scene.add(new THREE.HemisphereLight('#bcd6ee', '#1a222b', 0.9));
  const sun = new THREE.DirectionalLight('#ffffff', 1.2); sun.position.set(-120, 260, 140); scene.add(sun);

  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h); labelR.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  const VIEWS = {
    all: { p: [60, 230, 330], t: [90, 0, 80] },
    gate: { p: [-95, 60, 120], t: [-20, 0, 45] },
    swap: { p: [20, 70, 150], t: [72, 0, 60] },
    yard: { p: [210, 80, 170], t: [165, 0, 75] },
    top: { p: [92, 520, 95], t: [92, 0, 94] },
  };
  function setView(k) { const v = VIEWS[k]; camera.position.set(...v.p); controls.target.set(...v.t); controls.update(); }

  // ------------------------------------------------------------ vật liệu
  const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const mat = {
    ground: M('#0d1620'), pad: M('#142130'), road: M('#26394b'), mark: new THREE.MeshBasicMaterial({ color: '#3cc8e6' }),
    markY: new THREE.MeshBasicMaterial({ color: '#f2c14e' }), white: M('#d9e2ea'), dark: M('#1b232c'), steel: M('#5b6b7a'),
    fence: new THREE.MeshBasicMaterial({ color: '#3cc8e6', transparent: true, opacity: 0.18, side: THREE.DoubleSide }),
    scale: M('#364554'), canopy: M('#2a3a4a'), glass: M('#3cc8e6', { transparent: true, opacity: 0.35 }),
    tq: M('#d64541'), av: M('#eef3f7'), vn: M('#2e86de'), vnTruck: M('#e6892e'), rs: M('#f2c14e'), chassis: M('#2a2f36'),
    km0: new THREE.MeshBasicMaterial({ color: '#ef5350' }), china: M('#1a1416'),
  };
  const contMats = new Map();
  const contMat = (c) => { if (!contMats.has(c)) contMats.set(c, M(c)); return contMats.get(c); };
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

  // ------------------------------------------------------------ mặt bằng tĩnh
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 900), mat.ground); ground.rotation.x = -Math.PI / 2; ground.position.set(90, -0.05, 100); scene.add(ground);
  const chinaSide = new THREE.Mesh(new THREE.PlaneGeometry(400, 900), mat.china); chinaSide.rotation.x = -Math.PI / 2; chinaSide.position.set(L.km0X - 200, -0.04, 100); scene.add(chinaSide);
  const F = L.fence;
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(F.x1 - F.x0, F.z1 - F.z0), mat.pad); pad.rotation.x = -Math.PI / 2; pad.position.set((F.x0 + F.x1) / 2, -0.02, (F.z0 + F.z1) / 2); scene.add(pad);

  function ribbon(pts, width, m, y) {
    const pos = []; const idx = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      pos.push(pts[i][0] - dz * width / 2, y, pts[i][1] + dx * width / 2, pts[i][0] + dz * width / 2, y, pts[i][1] - dx * width / 2);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m2 = new THREE.Mesh(g, m); m2.material.side = THREE.DoubleSide; scene.add(m2); return m2;
  }
  const sim0 = new Y.Sim('normal', 1);
  for (const poly of sim0.roadPolys) {
    const p = Y.buildPath(poly, 10); const pts = [];
    for (let i = 0; i < p.n; i += 4) pts.push([p.X[i], p.Z[i]]); pts.push([p.X[p.n - 1], p.Z[p.n - 1]]);
    ribbon(pts, 7.5, mat.road, 0.01);
    // vạch dẫn hướng mảnh
    const dash = []; for (let i = 0; i < pts.length; i++) dash.push(pts[i]);
    ribbon(dash, 0.18, new THREE.MeshBasicMaterial({ color: '#2b6f84' }), 0.03);
  }
  // hàng rào (tường mờ) có khe cổng
  function wall(x0, z0, x1, z1) { const l = Math.hypot(x1 - x0, z1 - z0); const w = new THREE.Mesh(new THREE.PlaneGeometry(l, 2.4), mat.fence); w.position.set((x0 + x1) / 2, 1.2, (z0 + z1) / 2); w.rotation.y = -Math.atan2(z1 - z0, x1 - x0); scene.add(w); }
  wall(F.x0, F.z0, F.x1, F.z0); wall(F.x1, F.z0, F.x1, 26); wall(F.x1, 42, F.x1, F.z1);
  wall(F.x0, F.z1, 70, F.z1); wall(90, F.z1, F.x1, F.z1); wall(F.x0, F.z0, F.x0, 18); wall(F.x0, 30, F.x0, 44); wall(F.x0, 62, F.x0, F.z1);

  // Km0
  const km0 = box(0.8, 0.1, 120, mat.km0); km0.position.set(L.km0X, 0.05, 50); scene.add(km0);
  const km0b = box(1.2, 4, 1.2, mat.white); km0b.position.set(L.km0X, 2, 70); scene.add(km0b);

  // cổng nhập Km0: cân 120 t + mái + barie
  const barriers = [];
  function barrier(x, z, axis, lenSide) {
    const g = new THREE.Group(); g.position.set(x, 1.1, z);
    const post = box(0.6, 2.2, 0.6, mat.steel); post.position.y = -0.0; g.add(post);
    const arm = new THREE.Group(); const a = box(0.25, 0.25, 6.5, M('#f2f2f2')); a.position.z = 3.25 * lenSide; arm.add(a);
    const s1 = box(0.27, 0.27, 0.8, mat.km0); s1.position.z = 2 * lenSide; arm.add(s1); const s2 = s1.clone(); s2.position.z = 4.5 * lenSide; arm.add(s2);
    arm.position.y = 0.9; g.add(arm); g.rotation.y = axis; scene.add(g); barriers.push({ arm, open: 0 }); return barriers[barriers.length - 1];
  }
  const bIn = L.inZ.map(z => { const sc = box(24, 0.25, 3.6, mat.scale); sc.position.set(L.inStopX - 11, 0.12, z); scene.add(sc); return barrier(L.inStopX + 1.5, z - 3.3, 0, 1); });
  const canopyW = box(16, 0.8, 26, mat.canopy); canopyW.position.set(L.inStopX - 6, 7.5, 40); scene.add(canopyW);
  for (const [x, z] of [[L.inStopX - 13, 28], [L.inStopX + 1, 28], [L.inStopX - 13, 53], [L.inStopX + 1, 53]]) { const p = box(0.6, 7.5, 0.6, mat.steel); p.position.set(x, 3.75, z); scene.add(p); }
  for (const z of [L.inZ[0] + 3.2, L.inZ[1] + 3.2]) { const b = box(2.4, 2.8, 1.6, mat.glass); b.position.set(L.inStopX - 6, 1.4, z); scene.add(b); }
  const bOutW = barrier(L.outWStopX - 1.5, L.outWZ + 3.3, Math.PI, 1);
  const bEin = barrier(L.einStopX - 1.5, L.einZ + 3.3, Math.PI, 1);
  const bOutS = L.outSX.map(x => barrier(x - 3.3, L.outSStopZ + 1.5, -Math.PI / 2, -1));
  const canopyS = box(20, 0.8, 12, mat.canopy); canopyS.position.set(80, 7.5, L.outSStopZ - 3); scene.add(canopyS);
  const canopyE = box(12, 0.8, 10, mat.canopy); canopyE.position.set(L.einStopX + 4, 7.5, L.einZ); scene.add(canopyE);

  // ô đổi đầu kéo: vạch sơn
  for (const x of L.bayX) { const m1 = box(0.25, 0.03, 30, mat.markY); m1.position.set(x - 4.5, 0.03, 52); scene.add(m1); }
  { const m1 = box(0.25, 0.03, 30, mat.markY); m1.position.set(L.bayX[5] + 4.5, 0.03, 52); scene.add(m1); }
  // trạm kiểm hóa: mái
  for (const x of L.insSt) { const c = box(24, 0.6, 9, mat.canopy); c.position.set(x + 10, 6.5, L.insZ); scene.add(c); }
  // nhà điều hành + trạm Viettel + cột camera
  const hq = box(18, 9, 10, M('#1f3346')); hq.position.set(-14, 4.5, 92); scene.add(hq);
  const hqG = box(18.2, 2, 10.2, mat.glass); hqG.position.set(-14, 6.5, 92); scene.add(hqG);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.4, 34, 6), mat.steel); tower.position.set(-24, 17, 118); scene.add(tower);
  for (const [x, z] of [[F.x0 + 2, 2], [F.x1 - 2, 2], [F.x1 - 2, F.z1 - 2], [F.x0 + 2, F.z1 - 2], [110, 2], [110, F.z1 - 2], [F.x1 - 2, 75], [F.x0 + 2, 75]]) {
    const p = box(0.4, 10, 0.4, mat.steel); p.position.set(x, 5, z); scene.add(p); const c = box(1.2, 0.6, 0.6, mat.white); c.position.set(x, 10, z); scene.add(c);
  }

  // container trong bãi: khối trang trí phía bắc + khối động
  const CG = new THREE.BoxGeometry(12.2, 2.6, 2.44);
  const deco = new THREE.InstancedMesh(CG, M('#ffffff'), 200); scene.add(deco);
  { let k = 0; const m4 = new THREE.Matrix4(); const rng = (() => { let a = 7; return () => (a = (a * 9301 + 49297) % 233280) / 233280; })();
    const cols = ['#8e2c25', '#1f5f8b', '#1b6e42', '#b5770f', '#6a3584', '#4c5a69', '#8a3a0d'];
    for (const x of L.stackCols) for (let r = 0; r < 6; r++) { const h = 1 + Math.floor(rng() * 3); for (let t = 0; t < h; t++) {
      m4.makeTranslation(x, 1.3 + t * 2.6, 30 + r * 2.8); deco.setMatrixAt(k, m4); deco.setColorAt(k, new THREE.Color(cols[Math.floor(rng() * cols.length)])); k++; } }
    deco.count = k; deco.instanceMatrix.needsUpdate = true; deco.instanceColor.needsUpdate = true; }
  const stackMesh = new THREE.InstancedMesh(CG, M('#ffffff'), 80); stackMesh.count = 0; scene.add(stackMesh);
  let stackVer = -1;
  function syncStack(sim) {
    if (sim.version === stackVer && stackMesh.count) return; stackVer = sim.version;
    const m4 = new THREE.Matrix4(); let k = 0;
    sim.stack.forEach((col, c) => col.forEach((pile, r) => pile.forEach((cid, t) => {
      m4.makeTranslation(L.stackCols[c], 1.3 + t * 2.6, L.stackRows[r]); stackMesh.setMatrixAt(k, m4);
      stackMesh.setColorAt(k, new THREE.Color((sim.containers.get(cid) || {}).color || '#777')); k++;
    })));
    stackMesh.count = k; stackMesh.instanceMatrix.needsUpdate = true; if (stackMesh.instanceColor) stackMesh.instanceColor.needsUpdate = true;
  }

  // nhãn khu vực
  function label(text, x, y, z, cls) { const d = document.createElement('div'); d.className = 'lbl ' + (cls || ''); d.textContent = text; const o = new CSS2DObject(d); o.position.set(x, y, z); scene.add(o); return o; }
  const areaLabels = [
    label('Km0 · Biên giới VN | TQ', L.km0X, 6, 66, 'red'),
    label('Phía Trung Quốc (Pò Chài)', L.km0X - 45, 3, 30, 'muted'),
    label('Cổng nhập Km0 · 2 làn · OCR + cân 120 t', L.inStopX - 6, 10, 40),
    label('Làn trả xe TQ về Km0', -60, 3, L.outWZ - 3, 'muted'),
    label('Khu đổi đầu kéo · 6 ô', 72, 8, 40),
    label('Bãi xếp container · xe nâng chụp', 168, 10, 40),
    label('Khu kiểm hóa Hải quan · 2 trạm', 178, 9, L.insZ),
    label('Cổng xuất nội địa · 2 làn', 80, 10, L.outSStopZ - 3),
    label('Cổng vào đầu kéo VN', L.einStopX + 4, 10, L.einZ),
    label('Nhà điều hành SIVIP', -14, 12, 92, 'muted'),
    label('Trạm Viettel 5G (APN riêng)', -24, 36, 118, 'muted'),
  ];

  // vùng giao cắt
  const zoneMeshes = Y.ZONE_RECTS.map((z, i) => {
    const [x0, x1, z0, z1] = z.r;
    const m2 = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ color: '#f2c14e', transparent: true, opacity: 0.07, depthWrite: false }));
    m2.rotation.x = -Math.PI / 2; m2.position.set((x0 + x1) / 2, 0.06, (z0 + z1) / 2); scene.add(m2);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(x1 - x0, 0.01, z1 - z0)), new THREE.LineBasicMaterial({ color: '#f2c14e', transparent: true, opacity: 0.5 }));
    edge.position.copy(m2.position); scene.add(edge);
    const lb = label('', (x0 + x1) / 2, 2, (z0 + z1) / 2, 'zone');
    return { m: m2, edge, lb, name: z.name };
  });

  // lớp phủ ô đặt chỗ
  const MAXC = 16000;
  const cellMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.92, 0.92).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, depthWrite: false }), MAXC);
  cellMesh.count = 0; scene.add(cellMesh);
  const hue = (id) => new THREE.Color().setHSL(((id * 0.6180339) % 1), 0.75, 0.55);

  // ------------------------------------------------------------ phương tiện
  const TG = { cab: new THREE.BoxGeometry(2.3, 2.9, 2.5), ch: new THREE.BoxGeometry(D.TRACTOR_LEN, 0.5, 2.2), bed: new THREE.BoxGeometry(D.TRAILER_LEN, 0.35, 2.5), wheel: new THREE.BoxGeometry(1.1, 1.0, 2.6) };
  function makeTractor(kind) {
    const g = new THREE.Group();
    const cab = new THREE.Mesh(TG.cab, mat[kind] || mat.tq); cab.position.set(-1.25, 2.15, 0); g.add(cab);
    const win = box(0.1, 1.0, 2.2, M('#0e1a24')); win.position.set(-0.08, 2.9, 0); g.add(win);
    const ch = new THREE.Mesh(TG.ch, mat.chassis); ch.position.set(-D.TRACTOR_LEN / 2, 0.85, 0); g.add(ch);
    for (const x of [-1.4, -4.6, -5.6]) { const w = new THREE.Mesh(TG.wheel, mat.dark); w.position.set(x, 0.5, 0); g.add(w); }
    if (kind === 'av') { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.45, 12), M('#3cc8e6')); l.position.set(-1.0, 3.85, 0); g.add(l); }
    const bea = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshBasicMaterial({ color: '#f5a524' })); bea.position.set(-1.8, 4.1, 0); bea.visible = false; g.add(bea);
    g.userData.beacon = bea;
    scene.add(g); return g;
  }
  function makeTrailer() {
    const g = new THREE.Group();
    const bed = new THREE.Mesh(TG.bed, mat.chassis); bed.position.y = 1.25; g.add(bed);
    for (const x of [-4.2, -5.4]) { const w = new THREE.Mesh(TG.wheel, mat.dark); w.position.set(x, 0.5, 0); g.add(w); }
    const c = new THREE.Mesh(CG, mat.white); c.position.y = 2.75; g.add(c); g.userData.cont = c;
    scene.add(g); return g;
  }
  function makeRS() {
    const g = new THREE.Group();
    const b = box(7, 2.2, 3.8, mat.rs); b.position.y = 1.6; g.add(b);
    const cab = box(1.8, 2.2, 1.8, mat.glass); cab.position.set(-0.5, 3.6, -0.8); g.add(cab);
    const boom = new THREE.Group(); boom.position.set(2.5, 2.8, 0); const bm = box(1, 1, 12, mat.rs); bm.position.z = -6; boom.add(bm); g.add(boom);
    const spreader = box(6, 0.4, 2.4, mat.steel); spreader.position.z = -12; boom.add(spreader);
    g.userData.boom = boom; scene.add(g); return g;
  }
  const vObjs = new Map(); const tObjs = new Map();
  let carryMesh = null;

  function syncVehicles(snap) {
    const seen = new Set();
    for (const v of snap.vehicles) {
      seen.add(v.id);
      let o = vObjs.get(v.id);
      if (!o) {
        o = v.kind === 'rs' ? { g: makeRS() } : { g: makeTractor(v.kind), tr: null };
        const d = document.createElement('div'); d.className = 'vtag'; o.tag = new CSS2DObject(d); o.tag.position.set(0, 5.5, 0); o.g.add(o.tag); o.tagEl = d;
        vObjs.set(v.id, o);
      }
      if (v.kind === 'rs') {
        o.g.position.set(v.x, 0, v.z); o.g.rotation.y = -v.h;
        o.g.userData.boom.rotation.x = -0.25 * v.boom; o.tagEl.textContent = ''; continue;
      }
      o.g.position.set(v.fx, 0, v.fz); o.g.rotation.y = -v.h;
      if (v.trailer) {
        if (!o.tr) o.tr = makeTrailer();
        o.tr.visible = true; o.tr.position.set(v.trailer.cx, 0, v.trailer.cz); o.tr.rotation.y = -v.trailer.h;
        o.tr.userData.cont.visible = !!v.trailer.container; if (v.trailer.color) o.tr.userData.cont.material = contMat(v.trailer.color);
      } else if (o.tr) o.tr.visible = false;
      const bea = o.g.userData.beacon;
      bea.visible = v.broken || v.blocked || v.zones.length > 0 || v.reverse;
      bea.material.color.set(v.broken ? '#ef5350' : v.zones.length ? '#3cc8e6' : v.reverse ? '#ffffff' : '#f5a524');
      let tag = '';
      if (showTags) {
        if (v.broken) tag = 'Chết máy'; else if (v.label) tag = v.label; else if (v.reverse) tag = 'Lùi ghép moóc';
        else if (v.blocked && v.wait > 20) tag = 'Giữ khoảng cách'; else if (v.zones.length) tag = 'Đang qua vùng giao cắt';
        if (v.av && !tag) tag = 'Xe tự hành';
      }
      o.tagEl.textContent = tag; o.tagEl.className = 'vtag' + (v.broken ? ' err' : v.blocked ? ' warn' : '');
      o.tag.visible = !!tag;
    }
    for (const [id, o] of vObjs) if (!seen.has(id)) { scene.remove(o.g); if (o.tr) scene.remove(o.tr); o.g.remove(o.tag); vObjs.delete(id); }
    const tseen = new Set();
    for (const t of snap.trailers) {
      tseen.add(t.id); let g = tObjs.get(t.id);
      if (!g) { g = makeTrailer(); tObjs.set(t.id, g); }
      g.position.set(t.cx, 0, t.cz); g.rotation.y = -t.h; g.userData.cont.visible = !!t.container; if (t.color) g.userData.cont.material = contMat(t.color);
    }
    for (const [id, g] of tObjs) if (!tseen.has(id)) { scene.remove(g); tObjs.delete(id); }
    if (snap.carry) {
      if (!carryMesh) { carryMesh = new THREE.Mesh(CG, mat.white); scene.add(carryMesh); }
      carryMesh.visible = true; carryMesh.material = contMat(snap.carry.color); carryMesh.position.set(snap.carry.x, snap.carry.y, snap.carry.z); carryMesh.rotation.y = -snap.carry.h;
    } else if (carryMesh) carryMesh.visible = false;
  }

  // ------------------------------------------------------------ giao diện
  let sim = null; let running = true; let speed = 5; let showCells = false; let showZones = true; let showTags = true;
  const sel = $('scenario');
  Y.SCENARIOS.forEach((s, i) => { const o = document.createElement('option'); o.value = s.id; o.textContent = `${i + 1}. ${s.name}`; sel.appendChild(o); });
  function reset() {
    for (const [, o] of vObjs) { scene.remove(o.g); if (o.tr) scene.remove(o.tr); }
    for (const [, g] of tObjs) scene.remove(g);
    vObjs.clear(); tObjs.clear(); stackVer = -1;
    sim = new Y.Sim(sel.value, 1 + Math.floor(Math.random() * 1000));
    $('scDesc').textContent = sim.sc.desc; lastLog = 0; $('log').innerHTML = '';
  }
  sel.addEventListener('change', reset);
  $('btnPlay').addEventListener('click', () => { running = !running; $('btnPlay').textContent = running ? 'Tạm dừng' : 'Chạy tiếp'; });
  $('btnReset').addEventListener('click', reset);
  document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
    speed = +b.dataset.speed; document.querySelectorAll('[data-speed]').forEach(x => x.classList.toggle('on', x === b));
  }));
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  $('optCells').addEventListener('change', e => { showCells = e.target.checked; });
  $('optZones').addEventListener('change', e => { showZones = e.target.checked; });
  $('optTags').addEventListener('change', e => { showTags = e.target.checked; });
  $('btnPanel').addEventListener('click', () => document.body.classList.toggle('panel-closed'));

  const fmtT = (t) => { const s = Math.floor(t) + 6 * 3600; const h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, ss = s % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; };
  let lastLog = 0;
  const BAY_TXT = { free: 'Trống', reservedTQ: 'Xe TQ đang vào', trailer: 'Có moóc', called: 'Chờ đầu kéo VN' };
  function updatePanel() {
    const s = sim.summary();
    $('mClock').textContent = fmtT(s.t);
    $('mInside').textContent = `${s.inside} / ${sim.sc.cap}`;
    $('mQW').textContent = s.queueW; $('mQE').textContent = s.queueE;
    $('mSwap').textContent = s.swaps; $('mTQ').textContent = s.tqOut; $('mYard').textContent = `${s.yardIn} / ${s.yardOut}`; $('mIns').textContent = s.inspected;
    $('mTurn').textContent = s.avgTurn ? (s.avgTurn / 60).toFixed(1) + ' phút' : '–';
    $('mCol').textContent = s.collisions; $('cardCol').classList.toggle('bad', s.collisions > 0);
    $('mClear').textContent = isFinite(s.minClear) ? s.minClear.toFixed(2) + ' m' : '–';
    $('mZoneW').textContent = s.zonesLocked + ' đang khóa';
    $('bays').innerHTML = s.bays.map((b, i) => `<span class="chip ${b}" title="${BAY_TXT[b] || b}">Ô ${i + 1}: ${BAY_TXT[b] || b}</span>`).join('');
    $('lanes').innerHTML = sim.lanes.map(l => `<span class="chip ${l.failed ? 'failed' : 'free'}">${l.name}: ${l.failed ? 'Lỗi · thủ công' : 'Hoạt động'}</span>`).join('');
    const logs = sim.log;
    for (let i = lastLog; i < logs.length; i++) { const li = document.createElement('li'); li.className = logs[i].kind; li.innerHTML = `<time>${fmtT(logs[i].t)}</time> ${logs[i].msg}`; $('log').prepend(li); }
    lastLog = logs.length;
  }

  function updateOverlays() {
    zoneMeshes.forEach((z, i) => {
      const zz = sim.zones[i + 1]; const locked = !!zz.lockedBy;
      z.m.visible = z.edge.visible = showZones; z.lb.visible = showZones && locked;
      z.m.material.opacity = locked ? 0.28 : 0.07; z.m.material.color.set(locked ? '#3cc8e6' : '#f2c14e');
      z.lb.element.textContent = locked ? `Khóa bởi xe #${zz.lockedBy}` : '';
    });
    if (!showCells) { cellMesh.count = 0; return; }
    const arr = sim.claimedCells(MAXC); const m4 = new THREE.Matrix4(); let k = 0;
    for (let i = 0; i < arr.length && k < MAXC; i += 2) {
      const c = arr[i]; const x = Y.GX0 + (c % Y.GW) + 0.5, z = Y.GZ0 + Math.floor(c / Y.GW) + 0.5;
      m4.makeTranslation(x, 0.09, z); cellMesh.setMatrixAt(k, m4); cellMesh.setColorAt(k, hue(arr[i + 1])); k++;
    }
    cellMesh.count = k; cellMesh.instanceMatrix.needsUpdate = true; if (cellMesh.instanceColor) cellMesh.instanceColor.needsUpdate = true;
  }

  function animateBarriers() {
    const t = sim.t;
    const setB = (b, open) => { b.open += ((open ? 1 : 0) - b.open) * 0.15; b.arm.rotation.x = 0; b.arm.rotation.z = 0; b.arm.rotation.x = -b.open * 1.35; };
    bIn.forEach((b, i) => setB(b, sim.lanes[i].openUntil > t));
    setB(bOutW, sim.gates.outW.openUntil > t); setB(bEin, sim.gates.ein.openUntil > t);
    bOutS.forEach((b, i) => setB(b, sim.gates.outS[i].openUntil > t));
  }

  // ------------------------------------------------------------ vòng lặp
  reset(); resize(); setView(window.innerWidth < 700 ? 'swap' : 'all');
  $('loading').hidden = true;
  let last = performance.now(); let acc = 0; let panelT = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (running) {
      acc += dt * speed; let n = 0;
      while (acc >= Y.DT && n < 600) { sim.step(); acc -= Y.DT; n++; }
      if (n >= 600) acc = 0;
    }
    syncVehicles(sim.snapshot()); syncStack(sim); updateOverlays(); animateBarriers();
    panelT += dt; if (panelT > 0.25) { updatePanel(); panelT = 0; }
    controls.update(); renderer.render(scene, camera); labelR.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__yard = { get sim() { return sim; } };
})();
