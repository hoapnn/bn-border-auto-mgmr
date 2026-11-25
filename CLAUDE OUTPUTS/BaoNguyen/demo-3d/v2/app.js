/*
 * app.js (v2) — Giao diện 3D (Three.js) cho mô phỏng bãi Bảo Nguyên theo layout PDF concept.
 * Lõi mô phỏng ở sim-core.js (window.YardSim); ảnh mặt bằng gốc ở plan-image.js (window.PLAN_IMG).
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
  const L = Y.LAYOUT; const D = Y.dims; const LANES = Y.LANES;

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
  scene.fog = new THREE.Fog('#0a121b', 520, 1100);
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 3000);
  const controls = new OrbitControls(camera, labelR.domElement);
  controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.48; controls.minDistance = 20; controls.maxDistance = 900;
  scene.add(new THREE.HemisphereLight('#d2e4f3', '#2a3440', 1.25));
  const sun = new THREE.DirectionalLight('#ffffff', 1.15); sun.position.set(-90, 260, 220); scene.add(sun);

  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h); labelR.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  const VIEWS = {
    all: { p: [150, 250, 370], t: [140, 0, 125] },
    gate: { p: [278, 62, 268], t: [208, 0, 190] },
    shed: { p: [38, 70, 200], t: [110, 0, 124] },
    igv: { p: [150, 140, 330], t: [115, 0, 175] },
    vn: { p: [105, 120, -95], t: [120, 0, 55] },
    top: { p: [140, 520, 129], t: [140, 0, 128] },
  };
  function setView(k) { const v = VIEWS[k]; camera.position.set(...v.p); controls.target.set(...v.t); controls.update(); }

  // ------------------------------------------------------------ vật liệu
  const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const B = (c, o) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o || {}));
  const mat = {
    ground: M('#0d1620'), green: M('#25482f'), green2: M('#1b4a2a'), pave: M('#243649'), road: M('#33495f'), lot: M('#2c4156'),
    igv: M('#2d6178'), igvLight: M('#285468'), white: M('#d9e2ea'), dark: M('#1b232c'), steel: M('#5b6b7a'), line: B('#5d7c93'),
    markY: B('#f2c14e'), markW: B('#cfd9e2'), fenceLine: new THREE.LineBasicMaterial({ color: '#ef5350' }),
    canopy: M('#2a3a4a'), glass: M('#3cc8e6', { transparent: true, opacity: 0.35 }), roof: M('#9fb3c4', { transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
    beige: M('#e6d6b8'), beige2: M('#d8c6a3'), roofTile: M('#545a66'), scale: M('#364554'),
    tq: M('#d64541'), av: M('#eef3f7'), vn: M('#2e86de'), vnTruck: M('#e6892e'), thru: M('#7f8c99'), chassis: M('#2a2f36'),
    crane: M('#f2c14e'), parked: M('#3a4a5a'),
  };
  const contMats = new Map();
  const contMat = (c) => { if (!contMats.has(c)) contMats.set(c, M(c)); return contMats.get(c); };
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const add = (o, x, y, z) => { o.position.set(x, y, z); scene.add(o); return o; };

  // ------------------------------------------------------------ hình phẳng
  function flat(pts, y, m) {
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ShapeGeometry(sh); const me = new THREE.Mesh(g, m); me.rotation.x = -Math.PI / 2; me.position.y = y; scene.add(me); return me;
  }
  const rect = (x0, x1, z0, z1, y, m) => flat([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y, m);
  function ribbon(pts, width, m, y) {
    const pos = []; const idx = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      pos.push(pts[i][0] - dz * width / 2, y, pts[i][1] + dx * width / 2, pts[i][0] + dz * width / 2, y, pts[i][1] - dx * width / 2);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const me = new THREE.Mesh(g, m); me.material.side = THREE.DoubleSide; scene.add(me); return me;
  }
  function smooth(wps, r) { const p = Y.buildPath(wps, r || 10); const pts = []; for (let i = 0; i < p.n; i += 4) pts.push([p.X[i], p.Z[i]]); pts.push([p.X[p.n - 1], p.Z[p.n - 1]]); return pts; }
  const road = (wps, w, m, y) => ribbon(smooth(wps), w, m || mat.road, y == null ? 0.02 : y);
  function lineXZ(pts, m, y) { const g = new THREE.BufferGeometry().setFromPoints(pts.map(([x, z]) => new THREE.Vector3(x, y || 0.05, z))); const l = new THREE.Line(g, m); scene.add(l); return l; }

  // ------------------------------------------------------------ mặt bằng tĩnh (theo PDF)
  const groundM = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1200), mat.ground); groundM.rotation.x = -Math.PI / 2; add(groundM, 140, -0.06, 120);
  const siteGroup = new THREE.Group(); // các lớp mặt bằng tự vẽ (ẩn khi bật bản vẽ PDF)
  const _add = scene.add.bind(scene);
  scene.add = (o) => { siteGroup.add(o); return scene; }; // gom hình phẳng vào siteGroup
  flat(L.fence, 0.0, mat.green);
  rect(0, 194.7, 229.4, 237.6, 0.005, mat.green2); rect(235.3, 330, 229.4, 237.6, 0.005, mat.green2);
  flat([[47, 12.5], [195.1, 12.5], [195.1, 165], [47, 165]], 0.01, mat.pave);
  flat([[45, 160], [195.1, 160], [195.1, 226], [45, 226]], 0.01, mat.pave);
  flat([[230, 160], [300, 160], [300, 226], [230, 226]], 0.01, mat.pave);
  rect(L.topLot[0], L.topLot[1], L.topLot[2], L.topLot[3], 0.015, mat.lot);
  // đường nội bộ xe nội địa
  road([[47.3, 21.5], [195.1, 21.5]], 8.4);
  road([[54.6, -140], [54.6, 21.5]], 14.2);
  road([[60.2, 21.5], [60.2, 124]], 8.2);
  road([[50.3, 40], [50.3, 226]], 6);
  road([[185.5, 21.5], [185.5, 124]], 18);
  road([[47, 222.5], [195, 222.5]], 6);
  rect(56, 90.6, 86, 122, 0.02, mat.road); rect(126.6, 195.1, 86, 122, 0.02, mat.road);
  // đường trục chính + cổng trung tâm
  rect(L.road[0], L.road[1], -150, 340, 0.012, mat.road);
  // làn IGV (màu xanh xám như bản vẽ)
  rect(L.igvStrip[0], L.igvStrip[1], 125, 340, 0.022, mat.igv);
  const sim0 = new Y.Sim('normal', 1);
  ribbon(smooth(sim0.routes.igvIn), 6.5, mat.igv, 0.024);
  ribbon(smooth(sim0.routes.igvIns), 5, mat.igvLight, 0.023);
  rect(54, 90.6, 123, 160, 0.024, mat.igv);
  flat([[126.6, 123], [195.1, 123], [203.5, 131], [203.5, 152], [152, 152], [140, 147], [126.6, 160]], 0.024, mat.igv);
  // vạch làn trục chính
  for (const x of [L.igvStrip[1], ...L.seps]) lineXZ([[x, -150], [x, 340]], mat.line, 0.04);
  for (const x of L.seps) rect(x - 0.4, x + 0.4, 176, 196, 0.06, mat.white);
  // bãi đỗ phía bắc (32 ô) + xe đỗ trang trí
  const ST = L.stallsTop; const parkedG = new THREE.BoxGeometry(2.6, 3.2, 14);
  const parked = new THREE.InstancedMesh(parkedG, mat.parked, 80); let pk = 0; const m4 = new THREE.Matrix4();
  const prng = (() => { let a = 11; return () => (a = (a * 9301 + 49297) % 233280) / 233280; })();
  for (const [z0, z1] of ST.rows) for (let i = 0; i <= ST.n; i++) {
    const x = ST.x0 + i * ST.w; lineXZ([[x, z0], [x, z1]], mat.line, 0.04);
    if (i < ST.n && prng() < 0.55) { m4.makeTranslation(x + ST.w / 2, 1.6, (z0 + z1) / 2); parked.setMatrixAt(pk++, m4); }
  }
  // bãi 11 ô phía tây nam (giả định: khu kiểm hoá)
  const SW = L.stallsSW;
  for (let i = 0; i <= SW.n; i++) lineXZ([[SW.x0 + i * SW.w, SW.z0], [SW.x0 + i * SW.w, SW.z1]], mat.line, 0.04);
  // bãi đỗ xe ngoài ranh giới (phía đông đường trục) — trang trí theo bản vẽ
  for (const [x, z0, n] of [[258, 18, 10], [258, 62, 11], [290, 62, 11]]) for (let i = 0; i < n; i++) {
    if (prng() < 0.6) { const mm = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(x, 1.6, z0 + i * 4.5); parked.setMatrixAt(pk++, mm); }
  }
  parked.count = pk; scene.add(parked);
  scene.add = _add; scene.add(siteGroup);
  // hàng rào ranh giới
  { const pts = L.fence.map(([x, z]) => new THREE.Vector3(x, 0.15, z)); const g = new THREE.BufferGeometry().setFromPoints(pts); scene.add(new THREE.LineLoop(g, mat.fenceLine)); }

  // lớp nền bản vẽ PDF
  let planMesh = null;
  if (window.PLAN_IMG) {
    const tex = new THREE.TextureLoader().load(window.PLAN_IMG); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const W = L.planW * L.px, H = L.planH * L.px;
    planMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: tex }));
    planMesh.rotation.x = -Math.PI / 2; add(planMesh, W / 2, 0.03, H / 2); planMesh.visible = false;
  }

  // ------------------------------------------------------------ nhà chuyển tải 8 làn + 2 cầu trục
  const S = L.shed;
  rect(S.x0, S.x1, S.z0, S.z1, 0.03, mat.lot);
  for (let i = 0; i < LANES.length; i++) {
    const l = LANES[i];
    const zb = i === 3 ? S.zSplit[0] : i === 7 ? S.z1 : (l.zc + LANES[i + 1].zc) / 2;
    if (i !== 7 && i !== 3) rect(S.x0, S.x1, zb - 0.12, zb + 0.12, 0.05, mat.markW);
    // ô chờ container (vạch vàng)
    const cx = l.cx, sz = l.sz;
    for (const [a, b, c, d] of [[cx - 6.4, cx + 6.4, sz - 1.45, sz - 1.3], [cx - 6.4, cx + 6.4, sz + 1.3, sz + 1.45], [cx - 6.4, cx - 6.25, sz - 1.45, sz + 1.45], [cx + 6.25, cx + 6.4, sz - 1.45, sz + 1.45]]) rect(a, b, c, d, 0.055, mat.markY);
  }
  rect(S.x0, S.x1, S.zSplit[0], S.zSplit[1], 0.06, mat.white);
  for (let z = S.z0; z < S.z1; z += 3) rect(S.xm - 0.1, S.xm + 0.1, z, z + 1.5, 0.05, mat.markW);
  // khung nhà: cột, dầm ray cầu trục, mái trong suốt
  const H_RAIL = 14.5;
  for (const x of [S.x0, S.xm, S.x1]) {
    for (let z = S.z0; z <= S.z1 + 0.1; z += (S.z1 - S.z0) / 8) add(box(0.6, H_RAIL, 0.6, mat.steel), x, H_RAIL / 2, z);
    add(box(0.8, 0.9, S.z1 - S.z0, mat.steel), x, H_RAIL, (S.z0 + S.z1) / 2);
  }
  const roof = box(S.x1 - S.x0 + 2, 0.2, S.z1 - S.z0 + 2, mat.roof); add(roof, (S.x0 + S.x1) / 2, 17.5, (S.z0 + S.z1) / 2);
  const craneObjs = [0, 1].map((k) => {
    const x0 = k === 0 ? S.x0 : S.xm, x1 = k === 0 ? S.xm : S.x1;
    const g = new THREE.Group();
    const br = box(x1 - x0, 1.1, 1.4, mat.crane); br.position.set((x0 + x1) / 2, H_RAIL + 1, -1.2); g.add(br);
    const br2 = br.clone(); br2.position.z = 1.2; g.add(br2);
    const trolley = box(3, 1.2, 4, mat.steel); g.add(trolley);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1, 4), mat.dark); g.add(cable);
    const spreader = box(D.CONT_LEN, 0.35, D.CONT_W + 0.2, mat.steel); g.add(spreader);
    const carry = new THREE.Mesh(new THREE.BoxGeometry(D.CONT_LEN, D.CONT_H, D.CONT_W), mat.white); carry.visible = false; g.add(carry);
    scene.add(g);
    return { g, trolley, cable, spreader, carry };
  });
  const CG = new THREE.BoxGeometry(D.CONT_LEN, D.CONT_H, D.CONT_W);
  const slotMesh = new THREE.InstancedMesh(CG, M('#ffffff'), 32); slotMesh.count = 0; scene.add(slotMesh);
  let slotVer = -1;
  function syncSlots(sim) {
    if (sim.version === slotVer) return; slotVer = sim.version;
    const arr = sim.slotContainers(); const mm = new THREE.Matrix4(); let k = 0;
    for (const c of arr) { mm.makeTranslation(c.x, c.y, c.z); slotMesh.setMatrixAt(k, mm); slotMesh.setColorAt(k, new THREE.Color(c.color)); k++; }
    slotMesh.count = k; slotMesh.instanceMatrix.needsUpdate = true; if (slotMesh.instanceColor) slotMesh.instanceColor.needsUpdate = true;
  }

  // ------------------------------------------------------------ toà nhà cổng (2 khối 3 tầng + cầu nối tầng 3)
  function hipRoof(x0, x1, z0, z1, y, h, m) {
    const g = new THREE.ConeGeometry(1, 1, 4, 1); g.rotateY(Math.PI / 4);
    const r = new THREE.Mesh(g, m); r.scale.set((x1 - x0) * 0.74, h, (z1 - z0) * 0.74); add(r, (x0 + x1) / 2, y + h / 2, (z0 + z1) / 2); return r;
  }
  for (const [x0, x1, z0, z1] of [L.blockL, L.blockR]) {
    add(box(x1 - x0 - 2.7, 13.75, z1 - z0, mat.beige), (x0 + x1) / 2, 13.75 / 2, (z0 + z1) / 2);
    add(box(x1 - x0 - 2.7, 1.6, z1 - z0 + 0.2, mat.glass), (x0 + x1) / 2, 9.5, (z0 + z1) / 2);
    add(box(x1 - x0 - 2.7, 1.6, z1 - z0 + 0.2, mat.glass), (x0 + x1) / 2, 3.5, (z0 + z1) / 2);
    hipRoof(x0, x1, z0, z1, 13.75, 4.2, mat.roofTile);
  }
  { const x0 = L.blockL[1] - 6, x1 = L.blockR[0] + 6, z0 = 176, z1 = 195.5;
    add(box(x1 - x0, 5.85, z1 - z0, mat.beige2), (x0 + x1) / 2, 13.75 + 2.9, (z0 + z1) / 2);
    add(box(x1 - x0 + 0.2, 1.8, z1 - z0 + 0.2, mat.glass), (x0 + x1) / 2, 16.3, (z0 + z1) / 2);
    hipRoof(x0, x1, z0, z1, 19.6, 3.5, mat.roofTile);
    const I = L.island; add(box(I[1] - I[0], 13.75, 6, mat.beige), (I[0] + I[1]) / 2, 13.75 / 2, L.gateZ);
    rect(I[0], I[1], I[2], I[3], 0.07, mat.white);
    for (const z of [174, 178, 193, 197]) add(box(1.8, 2.6, 1.8, mat.glass), (I[0] + I[1]) / 2, 1.3, z);
  }

  // ------------------------------------------------------------ trạm cân, barie, kiểm hoá
  add(box(L.scaleNE[1] - L.scaleNE[0], 0.25, L.scaleNE[3] - L.scaleNE[2], mat.scale), (L.scaleNE[0] + L.scaleNE[1]) / 2, 0.12, (L.scaleNE[2] + L.scaleNE[3]) / 2);
  add(box(L.scaleNW[1] - L.scaleNW[0], 0.25, L.scaleNW[3] - L.scaleNW[2], mat.scale), (L.scaleNW[0] + L.scaleNW[1]) / 2, 0.12, (L.scaleNW[2] + L.scaleNW[3]) / 2);
  const barriers = {};
  function barrier(key, x, z, rotY) {
    const g = new THREE.Group(); g.position.set(x, 1.1, z);
    g.add(box(0.6, 2.2, 0.6, mat.steel));
    const arm = new THREE.Group(); const a = box(0.25, 0.25, 6.5, M('#f2f2f2')); a.position.z = 3.25; arm.add(a);
    const s1 = box(0.27, 0.27, 0.8, B('#ef5350')); s1.position.z = 2; arm.add(s1); const s2 = s1.clone(); s2.position.z = 4.5; arm.add(s2);
    arm.position.y = 0.9; g.add(arm); g.rotation.y = rotY; scene.add(g); barriers[key] = { arm, open: 0 };
  }
  barrier('igvIn', L.igvIn - 2.9, L.igvInStopZ - 1.5, Math.PI / 2);
  barrier('igvOut', L.igvOut + 2.9, L.igvOutStopZ + 1.5, -Math.PI / 2);
  barrier('ne', L.neInX + 2.9, L.neStopZ + 1.5, -Math.PI / 2);
  barrier('nw', L.vnS + 3, L.nwStopZ + 1.5, -Math.PI / 2);
  barrier('scale', L.exitImpX + 2.9, L.scaleStopZ - 1.5, -Math.PI / 2);
  barrier('b0', L.island[0], L.boothS + 1.2, -Math.PI / 2);
  barrier('b1', L.island[1], L.boothS + 1.2, Math.PI / 2);
  barrier('b2', L.seps[1], L.boothN - 1.2, Math.PI / 2);
  barrier('b3', L.seps[2], L.boothN - 1.2, Math.PI / 2);
  for (const [x0, x1] of [[L.igvIn - 1.6, L.igvIn + 1.6], [L.igvOut - 1.6, L.igvOut + 1.6]]) { add(box(0.4, 6.5, 0.4, mat.steel), x0 - 0.8, 3.25, 218); add(box(0.4, 6.5, 0.4, mat.steel), x1 + 0.8, 3.25, 218); }
  add(box(L.igvOut - L.igvIn + 6, 0.6, 0.8, mat.steel), (L.igvIn + L.igvOut) / 2, 6.5, 218);
  for (const x of L.insFront) { add(box(18, 0.5, 8, mat.canopy), x + 7.75, 6.5, L.insZ); for (const dx of [-0.5, 16]) for (const dz of [-3.8, 3.8]) add(box(0.4, 6.5, 0.4, mat.steel), x + dx, 3.25, L.insZ + dz); }

  // ------------------------------------------------------------ nhãn
  function label(text, x, y, z, cls) { const d = document.createElement('div'); d.className = 'lbl ' + (cls || ''); d.textContent = text; const o = new CSS2DObject(d); o.position.set(x, y, z); scene.add(o); return o; }
  label('Nhà chuyển tải · 8 làn · 2 cầu trục', 108.6, 21, 124);
  label('Làn 1–4: xe nội địa', 72, 4, 104, 'muted');
  label('Làn 5–8: IGV / xe TQ', 72, 4, 141, 'muted');
  label('Cổng trung tâm · cầu nối tầng 3', 215, 27, 186);
  label('Làn IGV vào / ra', 198.7, 4, 226, 'muted');
  label('Cổng IGV · OCR + RFID', 198.7, 9, 218);
  label('Cổng xe nhập khẩu', 196, 8, -2);
  label('Cổng xe xuất khẩu', 58, 8, -10);
  label('Trạm cân ra', 191, 5, 55, 'muted');
  label('Bãi đỗ chờ xe nội địa · 32 ô', 120, 5, 58, 'muted');
  label('Khu kiểm hoá (giả định) · 2 trạm', 95, 9, 198);
  label('Vòng IGV một chiều', 100, 3, 211, 'muted');
  label('Hướng đi Việt Nam ↑', 225, 3, 60, 'muted');
  label('Hướng đi Trung Quốc ↓', 207, 3, 262, 'red');
  label('Bãi đỗ xe hiện trạng (ngoài ranh giới)', 280, 4, 40, 'muted');
  label('Đường nội bộ khối văn phòng', 120, 3, 222.5, 'muted');

  // vùng giao cắt
  const zoneMeshes = Y.ZONE_RECTS.map((z) => {
    const parts = z.r.map(([x0, x1, z0, z1]) => {
      const m2 = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ color: '#f2c14e', transparent: true, opacity: 0.07, depthWrite: false }));
      m2.rotation.x = -Math.PI / 2; m2.position.set((x0 + x1) / 2, 0.08, (z0 + z1) / 2); scene.add(m2);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(x1 - x0, 0.01, z1 - z0)), new THREE.LineBasicMaterial({ color: '#f2c14e', transparent: true, opacity: 0.5 }));
      edge.position.copy(m2.position); scene.add(edge);
      return { m: m2, edge };
    });
    const [x0, x1, z0, z1] = z.r[0];
    const lb = label('', (x0 + x1) / 2, 2, (z0 + z1) / 2, 'zone');
    return { parts, lb, name: z.name };
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
  const vObjs = new Map();
  function syncVehicles(snap) {
    const seen = new Set();
    for (const v of snap.vehicles) {
      seen.add(v.id);
      let o = vObjs.get(v.id);
      if (!o) {
        o = { g: makeTractor(v.kind), tr: makeTrailer() };
        const d = document.createElement('div'); d.className = 'vtag'; o.tag = new CSS2DObject(d); o.tag.position.set(0, 5.5, 0); o.g.add(o.tag); o.tagEl = d;
        vObjs.set(v.id, o);
      }
      o.g.position.set(v.fx, 0, v.fz); o.g.rotation.y = -v.h;
      o.tr.position.set(v.trailer.cx, 0, v.trailer.cz); o.tr.rotation.y = -v.trailer.h;
      o.tr.userData.cont.visible = !!v.trailer.container; if (v.trailer.color) o.tr.userData.cont.material = contMat(v.trailer.color);
      const bea = o.g.userData.beacon;
      bea.visible = v.broken || v.blocked || v.zones.length > 0;
      bea.material.color.set(v.broken ? '#ef5350' : v.zones.length ? '#3cc8e6' : '#f5a524');
      let tag = '';
      if (showTags && v.kind !== 'thru') {
        if (v.broken) tag = 'Chết máy'; else if (v.label) tag = v.label;
        else if (v.blocked && v.wait > 20) tag = 'Giữ khoảng cách'; else if (v.zones.length) tag = 'Đang qua vùng giao cắt';
        if (v.av && !tag) tag = 'IGV tự hành';
      }
      o.tagEl.textContent = tag; o.tagEl.className = 'vtag' + (v.broken ? ' err' : v.blocked ? ' warn' : '');
      o.tag.visible = !!tag;
    }
    for (const [id, o] of vObjs) if (!seen.has(id)) { scene.remove(o.g); scene.remove(o.tr); o.g.remove(o.tag); vObjs.delete(id); }
    snap.cranes.forEach((c, k) => {
      const o = craneObjs[k]; o.g.position.set(0, 0, c.z);
      o.trolley.position.set(c.x, H_RAIL + 1.8, 0);
      const top = H_RAIL + 1.2, sy = c.sy + D.CONT_H / 2 + 0.2;
      o.cable.scale.y = Math.max(0.1, top - sy); o.cable.position.set(c.x, (top + sy) / 2, 0);
      o.spreader.position.set(c.x, sy, 0);
      o.carry.visible = !!c.carry; if (c.carry) { o.carry.material = contMat(c.carry); o.carry.position.set(c.x, c.sy, 0); }
    });
  }

  // ------------------------------------------------------------ giao diện
  let sim = null; let running = true; let speed = 5; let showCells = false; let showZones = true; let showTags = true;
  const sel = $('scenario');
  Y.SCENARIOS.forEach((s, i) => { const o = document.createElement('option'); o.value = s.id; o.textContent = `${i + 1}. ${s.name}`; sel.appendChild(o); });
  function reset() {
    for (const [, o] of vObjs) { scene.remove(o.g); scene.remove(o.tr); }
    vObjs.clear(); slotVer = -1;
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
  $('optPlan').addEventListener('change', e => { if (planMesh) { planMesh.visible = e.target.checked; siteGroup.visible = !e.target.checked; } });
  $('optRoof').addEventListener('change', e => { roof.visible = e.target.checked; });
  $('btnPanel').addEventListener('click', () => document.body.classList.toggle('panel-closed'));

  const fmtT = (t) => { const s = Math.floor(t) + 6 * 3600; const h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, ss = s % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; };
  let lastLog = 0;
  const LANE_TXT = { free: 'Trống', reserved: 'Xe đang vào', busy: 'Đang xếp dỡ', failed: 'Hỏng · khoá' };
  function updatePanel() {
    const s = sim.summary();
    $('mClock').textContent = fmtT(s.t);
    $('mInside').textContent = `${s.inside} / ${sim.sc.cap}`;
    $('mQIGV').textContent = s.queueIGV; $('mQVN').textContent = `${s.queueNE} / ${s.queueNW}`;
    $('mImp').textContent = s.imp; $('mExp').textContent = s.exp; $('mTQ').textContent = s.tqOut; $('mVN').textContent = s.vnOut;
    $('mMoves').textContent = s.moves; $('mIns').textContent = s.inspected;
    $('mTurn').textContent = s.avgTurn ? (s.avgTurn / 60).toFixed(1) + ' phút' : '–';
    $('mStock').textContent = s.stock;
    $('mCol').textContent = s.collisions; $('cardCol').classList.toggle('bad', s.collisions > 0);
    $('mClear').textContent = isFinite(s.minClear) ? s.minClear.toFixed(2) + ' m' : '–';
    $('mClearS').textContent = isFinite(s.minStatic) ? s.minStatic.toFixed(2) + ' m' : '–';
    $('mZoneW').textContent = s.zonesLocked + ' đang khoá';
    $('lanes').innerHTML = s.lanes.map((st, i) => {
      const sl = s.slots[i]; const sTxt = sl.n ? ` · ô chờ ${sl.n} ${sl.dir === 'imp' ? 'nhập' : 'xuất'}` : '';
      return `<span class="chip ${st}" title="${LANE_TXT[st]}">Làn ${i + 1}: ${LANE_TXT[st]}${sTxt}</span>`;
    }).join('');
    const logs = sim.log;
    for (let i = lastLog; i < logs.length; i++) { const li = document.createElement('li'); li.className = logs[i].kind; li.innerHTML = `<time>${fmtT(logs[i].t)}</time> ${logs[i].msg}`; $('log').prepend(li); }
    lastLog = logs.length;
  }
  function updateOverlays() {
    zoneMeshes.forEach((z, i) => {
      const zz = sim.zones[i + 1]; const locked = !!zz.lockedBy;
      for (const p of z.parts) { p.m.visible = p.edge.visible = showZones; p.m.material.opacity = locked ? 0.28 : 0.07; p.m.material.color.set(locked ? '#3cc8e6' : '#f2c14e'); }
      z.lb.visible = showZones && locked; z.lb.element.textContent = locked ? `Khoá bởi xe #${zz.lockedBy}` : '';
    });
    if (!showCells) { cellMesh.count = 0; return; }
    const arr = sim.claimedCells(MAXC); const mm = new THREE.Matrix4(); let k = 0;
    for (let i = 0; i < arr.length && k < MAXC; i += 2) {
      const c = arr[i]; const x = Y.GX0 + (c % Y.GW) + 0.5, z = Y.GZ0 + Math.floor(c / Y.GW) + 0.5;
      mm.makeTranslation(x, 0.09, z); cellMesh.setMatrixAt(k, mm); cellMesh.setColorAt(k, hue(arr[i + 1])); k++;
    }
    cellMesh.count = k; cellMesh.instanceMatrix.needsUpdate = true; if (cellMesh.instanceColor) cellMesh.instanceColor.needsUpdate = true;
  }
  function animateBarriers() {
    const t = sim.t, G = sim.gates;
    const setB = (b, open) => { b.open += ((open ? 1 : 0) - b.open) * 0.15; b.arm.rotation.x = -b.open * 1.35; };
    setB(barriers.igvIn, G.igvIn > t); setB(barriers.igvOut, G.igvOut > t); setB(barriers.ne, G.ne > t); setB(barriers.nw, G.nw > t); setB(barriers.scale, G.scale > t);
    for (let k = 0; k < 4; k++) setB(barriers['b' + k], G.booth[k] > t);
  }

  // ------------------------------------------------------------ vòng lặp
  reset(); resize(); setView(window.innerWidth < 700 ? 'shed' : 'all');
  $('loading').hidden = true;
  let last = performance.now(); let acc = 0; let panelT = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (running) {
      acc += dt * speed; let n = 0;
      while (acc >= Y.DT && n < 600) { sim.step(); acc -= Y.DT; n++; }
      if (n >= 600) acc = 0;
    }
    syncVehicles(sim.snapshot()); syncSlots(sim); updateOverlays(); animateBarriers();
    panelT += dt; if (panelT > 0.25) { updatePanel(); panelT = 0; }
    controls.update(); renderer.render(scene, camera); labelR.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__yard = { get sim() { return sim; }, setView };
})();
