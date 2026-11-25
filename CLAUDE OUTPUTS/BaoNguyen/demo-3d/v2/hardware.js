/*
 * hardware.js (v2) — Dữ liệu phần cứng của demo: cấu hình IGV, trạm 5G và mô hình độ trễ,
 * cảm biến / thiết bị dẫn hướng trên bãi. Thuần dữ liệu + vài hàm tính, không phụ thuộc Three.js.
 * Chạy được trong trình duyệt (window.YardHW) và Node (require). Toạ độ cùng hệ với sim-core.js (mét,
 * gốc góc trên trái ảnh mặt bằng PDF concept, x sang đông, z sang nam).
 *
 * LƯU Ý: PDF concept KHÔNG ghi thông số phần cứng. Mọi số trong file này là GIẢ ĐỊNH hợp lý theo thực tế
 * ngành cảng / xe tự hành, nhằm minh hoạ; phải thay bằng datasheet khi chốt thiết bị. Không chứa giá hay
 * thông tin hợp đồng. Chi tiết và lý do từng giả định: README.md mục "Phần cứng, 5G, cảm biến".
 */
(function (root, factory) {
  const mod = factory();
  if (typeof module === 'object' && module.exports) module.exports = mod;
  else root.YardHW = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ------------------------------------------------------------------ 1) IGV (Intelligent Guided Vehicle)
  // Xe đầu kéo điện tự hành + sơ mi rơ moóc 40 ft, khớp kích thước đã dùng trong mô phỏng (sim-core: TRACTOR_LEN 6,2 m,
  // rộng 2,5 m, moóc 12,5 m, vmax 14 km/h trong bãi).
  const IGV = {
    name: 'IGV · đầu kéo điện tự hành',
    intro: 'Xe đầu kéo điện không người lái, kéo sơ mi rơ moóc 40 ft, chạy theo làn IGV và vào làn nhà chuyển tải. Điều khiển từ xa qua 5G, nhận lệnh nhiệm vụ từ SIVIP.',
    groups: [
      { title: 'Khung gầm & truyền động', rows: [
        ['Kiểu xe', 'Đầu kéo 4×2 điện, tự hành cấp 4 trong vùng giới hạn (geofence)'],
        ['Kích thước', 'Dài đầu kéo 6,2 m · rộng 2,5 m · cả đoàn xe ~15,5 m (moóc 12,5 m)'],
        ['Tải trọng', '1 container 40 ft (tổng khối lượng ≤ 40 t)'],
        ['Tốc độ', '≤ 14 km/h trong bãi (mức B); 5 km/h trong nhà chuyển tải và khi vào vùng giao cắt'],
        ['Bán kính quay', '~10 m (tối thiểu theo mô phỏng)'],
        ['Phanh / lái', 'Phanh khí nén + tái sinh; lái điện dự phòng kép (drive-by-wire), phanh khẩn cấp độc lập bộ điều khiển chính'],
      ] },
      { title: 'Pin & sạc', rows: [
        ['Pin', 'LFP ~280 kWh, điện áp danh định ~600 V (giả định)'],
        ['Mức tiêu thụ', '~1,6 kWh/km khi đầy tải (dùng để tính % pin trong demo)'],
        ['Sạc', 'DC nhanh tới 350 kW, đầu sạc theo chuẩn xe thị trường Trung Quốc (GB/T); sạc cơ hội ~20 phút nâng thêm ~30% pin'],
        ['Ngưỡng điều phối', 'Pin < 25%: SIVIP không nhận nhiệm vụ mới, đưa xe về khu sạc. Pin < 10%: dừng an toàn'],
        ['Khu sạc', '4 vị trí sạc DC đặt trong vòng IGV (giả định, demo chưa mô phỏng luồng xe đi sạc)'],
      ] },
      { title: 'Cảm biến trên xe', rows: [
        ['LiDAR chính', '1 × 128 kênh trên nóc, tầm ~150 m, quét 360°'],
        ['LiDAR điểm mù', '4 × LiDAR bán dẫn tầm ngắn (~40 m): 2 trước, 2 sau góc xe'],
        ['Camera', '6 × 8 MP (trước 2, hai bên 2, sau 1, 1 camera nhìn mã container); HDR, có sưởi kính'],
        ['Radar', '2 × radar sóng mm 77 GHz (trước, sau) cho sương mù / mưa lớn'],
        ['GNSS / RTK', 'Bộ thu 2 anten (định hướng) hỗ trợ RTK, độ chính xác ~2 cm khi có sóng hiệu chỉnh'],
        ['IMU', 'Quán tính 6 trục cấp công nghiệp + encoder bánh xe: dẫn đường dự phòng khi mất GNSS (dưới mái nhà chuyển tải)'],
        ['Siêu âm', '12 mắt quanh xe, tầm ~5 m, dùng khi vào ô sát container'],
        ['Cảm biến từ', 'Đầu đọc nam châm sàn (magnetic marker) đặt trước mũi xe: định vị bám tim làn'],
      ] },
      { title: 'Điều khiển & truyền thông', rows: [
        ['Bộ điều khiển', 'Máy tính tự lái (domain controller) ~500 TOPS + MCU an toàn ASIL-D tách riêng, giám sát chéo'],
        ['Phần mềm', 'Nhận thức → định vị → lập đường → điều khiển; chỉ chạy tuyến do SIVIP cấp, kiểm tra lại va chạm cục bộ'],
        ['Modem 5G', 'SA, băng n78, 2 SIM (APN riêng, geofence); ăng-ten MIMO 4×4 trên nóc'],
        ['Đường dữ liệu', 'Điều khiển/telemetry ≤ 20 ms một vòng; video hỗ trợ từ xa ~4 × 8 Mbps lên'],
        ['V2X dự phòng', 'C-V2X PC5 nói chuyện trực tiếp với đèn tín hiệu / trụ giao cắt khi mất 5G'],
        ['An toàn', 'Nút dừng khẩn trên xe, đèn báo trạng thái trên nóc (xanh: tự hành, vàng: giảm tốc, đỏ: dừng/sự cố)'],
      ] },
      { title: 'Chế độ theo độ trễ 5G (đã mô phỏng)', rows: [
        ['≤ 20 ms', 'Bình thường: đủ tốc độ 14 km/h'],
        ['20–50 ms', 'Giảm tốc còn 80%'],
        ['50–100 ms', 'Giảm tốc còn 50%, tăng khoảng cách dừng 2 m'],
        ['> 100 ms', 'Chỉ chạy bò 30% tốc độ, tăng khoảng cách dừng 2 m, chờ người giám sát'],
        ['Mất sóng', 'Chạy dự phòng ~15% tốc độ (≈ 2 km/h) bằng IMU + nam châm sàn cho tới khi có sóng; không dừng giữa vùng giao cắt'],
      ] },
    ],
    // dùng trong mô phỏng
    batteryKWh: 280, kWhPerKm: 1.6, lowSoc: 0.25,
    lidarRangeM: 150, lidarShortM: 40,
  };

  // % pin giả lập (không dùng rng của mô phỏng để không đổi kết quả kịch bản): pin ban đầu 55–95% theo id xe.
  function socOf(id, distM) {
    const soc0 = 0.55 + (((id * 2654435761) >>> 0) % 41) / 100;
    return Math.max(0, soc0 - (distM / 1000) * IGV.kWhPerKm / IGV.batteryKWh);
  }

  // ------------------------------------------------------------------ 2) 5G: trạm và mô hình độ trễ
  // Mỗi trạm có 3 bán kính: r1 (độ trễ tốt, < 20 ms), r2 (khá, < 50 ms), r3 (biên, tới ~120 ms); xa hơn r3 là mất sóng.
  // Độ trễ ở đây là thời gian một vòng điều khiển xe ↔ máy chủ biên tại VN (đã gồm mã hoá, kết thúc tại VN).
  const CELLS = [
    { id: '5G-01', name: 'Trụ 5G-01 · cổng trung tâm', x: 190.5, z: 210, h: 20, type: 'macro', r: [58, 98, 145],
      note: 'Phủ làn IGV vào/ra và cổng kiểm soát OCR + RFID; bàn giao điều khiển tại Km0 ở phía nam.' },
    { id: '5G-02', name: 'Trụ 5G-02 · phía nam nhà chuyển tải', x: 96, z: 168, h: 20, type: 'macro', r: [58, 98, 145],
      note: 'Phủ đoạn IGV vào nhà chuyển tải từ phía tây và khu sạc.' },
    { id: '5G-03', name: 'Trụ 5G-03 · bãi chờ phía bắc', x: 140, z: 80, h: 20, type: 'macro', r: [58, 98, 145],
      note: 'Phủ làn xe nội địa, trạm cân và lối ra phía bắc.' },
    { id: '5G-04', name: 'Trụ 5G-04 · cổng nhập khẩu', x: 172, z: 34, h: 20, type: 'macro', r: [56, 95, 140],
      note: 'Phủ cổng đông bắc và đường ra phía VN.' },
    { id: '5G-05', name: 'Trụ 5G-05 · khu kiểm hoá', x: 40, z: 200, h: 20, type: 'macro', r: [56, 95, 140],
      note: 'Phủ vòng IGV phía tây nam và khu kiểm hoá Hải quan.' },
    { id: '5G-06', name: 'Trụ 5G-06 · đường tiếp cận Km0', x: 190, z: 265, h: 25, type: 'macro', r: [75, 115, 165],
      note: 'Phủ đoạn đường từ Km0 vào cổng, nơi xe tự hành TQ được bàn giao điều khiển.' },
    { id: '5G-08', name: 'Trạm nhỏ 5G-08 · cạnh làn IGV ra', x: 206.5, z: 162, h: 12, type: 'small', r: [48, 80, 115],
      note: 'Bù vùng bóng sóng sau khối cổng trung tâm (nhà hai bên che trụ 5G-01 và 5G-02) để làn IGV vào/ra không bị yếu.' },
    { id: '5G-07', name: 'Trạm nhỏ 5G-07 · trong nhà chuyển tải', x: 108.6, z: 123.2, h: 12, type: 'indoor', r: [38, 62, 90], inside: 'shed',
      note: 'Trạm trong nhà dưới mái: sóng ngoài trời bị mái thép và cầu trục che, dưới mái dựa vào trạm này.' },
  ];
  // Vật cản làm suy hao: đường thẳng từ trạm tới điểm xuyên qua hình chữ nhật thì "dài thêm" pen mét (mô hình đơn giản).
  const OBSTACLES = [
    { id: 'shed', name: 'Nhà chuyển tải (mái thép)', rect: [90.6, 126.6, 87.8, 160.0], pen: 85 },
    { id: 'blockL', name: 'Khối cổng trung tâm trái', rect: [155.8, 192.0, 172.0, 199.2], pen: 70 },
    { id: 'blockR', name: 'Khối cổng trung tâm phải', rect: [238.6, 274.7, 172.0, 199.2], pen: 70 },
    { id: 'bridge', name: 'Cầu nối tầng 3 + đảo giữa', rect: [192.0, 238.6, 176.0, 195.5], pen: 55 },
  ];

  function segHitsRect(ax, az, bx, bz, r) {
    let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
    for (const [p, q] of [[-dx, ax - r[0]], [dx, r[1] - ax], [-dz, az - r[2]], [dz, r[3] - az]]) {
      if (Math.abs(p) < 1e-12) { if (q < 0) return false; continue; }
      const t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return t0 <= t1;
  }
  const inRect = (x, z, r) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];

  // Độ trễ (ms) từ một trạm tới điểm (x, z); Infinity nếu ngoài vùng phủ.
  function cellLatency(c, x, z) {
    let d = Math.hypot(x - c.x, z - c.z);
    for (const o of OBSTACLES) {
      if (inRect(c.x, c.z, o.rect)) continue;           // trạm đặt trong vật cản đó thì không bị che
      if (segHitsRect(c.x, c.z, x, z, o.rect)) d += o.pen;
    }
    const [r1, r2, r3] = c.r;
    if (d <= r1) return 9 + 11 * (d / r1);
    if (d <= r2) return 20 + 30 * (d - r1) / (r2 - r1);
    if (d <= r3) return 50 + 70 * (d - r2) / (r3 - r2);
    return Infinity;
  }
  // Trạm phục vụ tốt nhất tại điểm. dead: tập id trạm đang hỏng.
  function serving(x, z, dead) {
    let best = Infinity, cell = null;
    for (const c of CELLS) {
      if (dead && dead[c.id]) continue;
      const l = cellLatency(c, x, z);
      if (l < best) { best = l; cell = c; }
    }
    return { lat: best, cell };
  }
  // Hệ số tốc độ của IGV theo độ trễ; khoảng dừng thêm (m).
  function speedFactor(lat) {
    if (lat <= 20) return 1;
    if (lat <= 50) return 0.8;
    if (lat <= 100) return 0.5;
    if (lat < Infinity) return 0.3;
    return 0.15;
  }
  const extraGap = (lat) => (lat > 50 ? 2 : 0);
  function latClass(lat) { return lat <= 20 ? 'tot' : lat <= 50 ? 'kha' : lat <= 100 ? 'yeu' : lat < Infinity ? 'rat-yeu' : 'mat'; }

  // ------------------------------------------------------------------ 3) Cảm biến & thiết bị dẫn hướng cố định
  // kind: cam (camera), lidar (LiDAR cố định), rfid (cổng RFID/OCR), rtk (trạm gốc RTK), uwb (neo UWB),
  // tl (đèn tín hiệu giao cắt), mag (nam châm sàn; xem magneticMarkers), 5g (xem CELLS).
  // zone: số vùng giao cắt (1–7) mà đèn / LiDAR phụ trách, để gắn trạng thái vùng vào đèn.
  const DEVICES = [
    // --- Camera giám sát + nhận dạng
    { id: 'CAM-01', kind: 'cam', name: 'Camera toàn cảnh cổng trung tâm', x: 205.5, z: 168, h: 9, fov: 'PTZ 4K, zoom 30×', role: 'Giám sát làn IGV vào/ra, đọc biển số xe thông quan thường.' },
    { id: 'CAM-02', kind: 'cam', name: 'Camera cổng IGV', x: 198.7, z: 222, h: 6.5, fov: '2 × 8 MP cố định', role: 'Chụp xe và container tại cổng kiểm soát IGV, đối chiếu OCR.' },
    { id: 'CAM-03', kind: 'cam', name: 'Camera lối vào nhà chuyển tải (tây)', x: 87, z: 142, h: 9, fov: 'PTZ 4K', role: 'Quan sát 4 làn IGV khi xe vào; hình ảnh cho người giám sát từ xa.' },
    { id: 'CAM-04', kind: 'cam', name: 'Camera nhà chuyển tải (tây-bắc)', x: 87, z: 104, h: 9, fov: 'PTZ 4K', role: 'Quan sát 4 làn xe nội địa.' },
    { id: 'CAM-05', kind: 'cam', name: 'Camera cầu trục phía đông', x: 129.5, z: 124, h: 11, fov: '4 × 8 MP', role: 'Nhìn xuống ô chờ container, đọc mã container, phát hiện người vào vùng nâng hạ.' },
    { id: 'CAM-06', kind: 'cam', name: 'Camera cổng xuất khẩu (tây bắc)', x: 56, z: -2, h: 7, fov: '2 × 8 MP', role: 'Đọc biển số, mã container xe VN chở hàng xuất.' },
    { id: 'CAM-07', kind: 'cam', name: 'Camera cổng nhập khẩu (đông bắc)', x: 193, z: 6, h: 7, fov: '2 × 8 MP', role: 'Đọc biển số xe VN đến nhận hàng nhập.' },
    { id: 'CAM-08', kind: 'cam', name: 'Camera trạm cân', x: 195.5, z: 52, h: 6, fov: '2 × 5 MP', role: 'Ghi hình xe và seal khi cân.' },
    { id: 'CAM-09', kind: 'cam', name: 'Camera khu kiểm hoá', x: 95, z: 205, h: 8, fov: 'PTZ 4K', role: 'Giám sát khu kiểm hoá Hải quan (giả định đặt ở bãi 11 ô tây nam).' },
    { id: 'CAM-10', kind: 'cam', name: 'Camera vòng IGV phía tây', x: 52, z: 170, h: 9, fov: 'PTZ 4K', role: 'Quan sát góc vòng IGV phía tây nam.' },
    { id: 'CAM-11', kind: 'cam', name: 'Camera ranh giới phía nam', x: 150, z: 227, h: 9, fov: 'PTZ nhiệt + ánh sáng', role: 'Giám sát ranh giới phía nam, phát hiện xâm nhập ban đêm.' },
    { id: 'CAM-12', kind: 'cam', name: 'Camera khu bãi chờ phía bắc', x: 100, z: 30, h: 8, fov: 'PTZ 4K', role: 'Quan sát 32 ô đỗ chờ và đường nội bộ phía bắc.' },
    // --- LiDAR cố định tại vùng giao cắt (nhìn từ trên cột, cho xe tự hành thêm "mắt thứ hai")
    { id: 'LID-01', kind: 'lidar', zone: 1, name: 'LiDAR vùng giao cắt 1 (nhập làn cổng xuất khẩu)', x: 82, z: 22, h: 10, fov: '360°, tầm 80 m', role: 'Thấy xe/người trong vùng giao cắt để SIVIP khoá vùng chính xác, bổ sung cho xe.' },
    { id: 'LID-02', kind: 'lidar', zone: 2, name: 'LiDAR vùng giao cắt 2 (nhập làn ra cổng nhập khẩu)', x: 178, z: 32, h: 10, fov: '360°, tầm 80 m', role: 'Giám sát chỗ nhập làn có hàng và làn xe rỗng.' },
    { id: 'LID-03', kind: 'lidar', zone: 3, name: 'LiDAR vùng giao cắt 3 (rẽ vào làn nội địa)', x: 43, z: 118, h: 10, fov: '360°, tầm 80 m', role: 'Giám sát chỗ rẽ vào 4 làn xe nội địa.' },
    { id: 'LID-04', kind: 'lidar', zone: 4, name: 'LiDAR vùng giao cắt 4 (ra nhà chuyển tải, nội địa)', x: 160, z: 126, h: 10, fov: '360°, tầm 80 m', role: 'Giám sát lối ra của xe nội địa sau khi xếp dỡ.' },
    { id: 'LID-05', kind: 'lidar', zone: 5, name: 'LiDAR vùng giao cắt 5 (rẽ vào làn IGV)', x: 43, z: 150, h: 10, fov: '360°, tầm 80 m', role: 'Giám sát chỗ IGV rẽ vào 4 làn nhà chuyển tải.' },
    { id: 'LID-06', kind: 'lidar', zone: 6, name: 'LiDAR vùng giao cắt 6 (ra nhà chuyển tải, IGV)', x: 140, z: 128, h: 10, fov: '360°, tầm 80 m', role: 'Giám sát lối ra làn IGV; bổ sung cho xe khi GNSS yếu gần mái nhà.' },
    { id: 'LID-07', kind: 'lidar', zone: 7, name: 'LiDAR vùng giao cắt 7 (nhập làn sau kiểm hoá)', x: 44, z: 198, h: 10, fov: '360°, tầm 80 m', role: 'Giám sát chỗ nhập vòng IGV sau khu kiểm hoá.' },
    // --- Cổng RFID / OCR
    { id: 'RFID-01', kind: 'rfid', name: 'Cổng IGV vào · OCR + RFID', x: 193.0, z: 216, h: 6.5, fov: 'Đọc 20–35 s', role: 'Đọc mã container, biển số, thẻ RFID IGV; đối chiếu lệnh SIVIP rồi mở barie.' },
    { id: 'RFID-02', kind: 'rfid', name: 'Cổng IGV ra · OCR + RFID', x: 204.4, z: 216, h: 6.5, fov: 'Đọc 20–35 s', role: 'Kiểm soát xe TQ rời bãi, đối chiếu container đã giao nhận.' },
    { id: 'RFID-03', kind: 'rfid', name: 'Cổng nhập khẩu · OCR biển số', x: 199.0, z: 1, h: 6, fov: 'Đọc < 3 s', role: 'Nhận dạng xe VN được SIVIP gọi, mở barie đông bắc.' },
    { id: 'RFID-04', kind: 'rfid', name: 'Cổng xuất khẩu · OCR + tờ khai', x: 56.8, z: -6, h: 6, fov: 'Đọc < 3 s', role: 'Nhận dạng xe VN chở hàng xuất, đối chiếu tờ khai.' },
    { id: 'RFID-05', kind: 'rfid', name: 'Trạm cân ra · OCR seal', x: 194.4, z: 44, h: 5.5, fov: 'Đọc < 5 s', role: 'Cân xe và kiểm tra seal container trước khi ra.' },
    // --- Trạm gốc RTK (tăng độ chính xác GNSS cho IGV ngoài trời)
    { id: 'RTK-01', kind: 'rtk', name: 'Trạm gốc RTK-01 · mái khối cổng trái', x: 174, z: 185, h: 25, fov: 'GNSS đa hệ, phủ ~10 km', role: 'Phát số hiệu chỉnh RTK cho IGV; đặt nơi thoáng trời, nền chắc.' },
    { id: 'RTK-02', kind: 'rtk', name: 'Trạm gốc RTK-02 · mái nhà chuyển tải', x: 93, z: 90, h: 19.5, fov: 'GNSS đa hệ, phủ ~10 km', role: 'Trạm dự phòng thứ hai, hai trạm so chéo để phát hiện lệch.' },
    // --- Neo UWB dưới mái nhà chuyển tải (GNSS bị che)
    ...[[90.6, 87.8], [108.6, 87.8], [126.6, 87.8], [90.6, 123.8], [126.6, 123.8], [90.6, 159.8], [108.6, 159.8], [126.6, 159.8]].map(([x, z], i) => ({
      id: 'UWB-0' + (i + 1), kind: 'uwb', name: 'Neo UWB-0' + (i + 1) + ' · cột nhà chuyển tải', x, z, h: 8, fov: 'Tầm ~60 m, ±10 cm',
      role: 'Định vị IGV dưới mái khi GNSS bị che; kết hợp IMU và nam châm sàn.' })),
    // --- Đèn tín hiệu tại vùng giao cắt (đỏ khi vùng đang bị một xe giữ, xanh khi trống)
    { id: 'TL-01', kind: 'tl', zone: 1, name: 'Đèn tín hiệu vùng giao cắt 1', x: 34, z: 8, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Báo cho tài xế / IGV: đỏ khi SIVIP đang khoá vùng cho xe khác.' },
    { id: 'TL-02', kind: 'tl', zone: 2, name: 'Đèn tín hiệu vùng giao cắt 2', x: 175, z: 24, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Như trên, vùng nhập làn ra cổng nhập khẩu.' },
    { id: 'TL-03', kind: 'tl', zone: 3, name: 'Đèn tín hiệu vùng giao cắt 3', x: 44, z: 92, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Như trên, chỗ rẽ vào làn xe nội địa.' },
    { id: 'TL-04', kind: 'tl', zone: 4, name: 'Đèn tín hiệu vùng giao cắt 4', x: 197.5, z: 100, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Như trên, lối ra nhà chuyển tải phía xe nội địa.' },
    { id: 'TL-05', kind: 'tl', zone: 5, name: 'Đèn tín hiệu vùng giao cắt 5', x: 47, z: 130, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Như trên, chỗ rẽ vào làn IGV.' },
    { id: 'TL-06', kind: 'tl', zone: 6, name: 'Đèn tín hiệu vùng giao cắt 6', x: 208, z: 128, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Như trên, lối ra nhà chuyển tải phía IGV.' },
    { id: 'TL-07', kind: 'tl', zone: 7, name: 'Đèn tín hiệu vùng giao cắt 7', x: 50, z: 214.5, h: 5, fov: 'Đèn 3 màu + V2X', role: 'Như trên, chỗ nhập vòng IGV sau kiểm hoá.' },
  ];

  // Nam châm sàn + transponder: tính từ các tuyến IGV (sim-core.routes) khi dựng. Mô tả chung ở đây.
  const MAG = {
    name: 'Nam châm sàn (magnetic marker)',
    spacingM: 6,
    role: 'Nam châm nhỏ chôn dưới mặt đường dọc tim làn IGV, cách ~6 m. Đầu đọc từ dưới mũi xe đo vị trí ngang ±1 cm, không bị che bởi mái hay thời tiết; là lớp định vị dự phòng khi GNSS/UWB yếu.',
  };
  const TAG = {
    name: 'Transponder (thẻ RFID chôn sàn)',
    role: 'Thẻ RFID thụ động tại vị trí dừng của 8 làn nhà chuyển tải: xe đọc để biết đã đúng vị trí dừng ±5 cm trước khi cầu trục hạ/nâng container.',
  };

  const KIND_INFO = {
    cam: { name: 'Camera', color: '#7fd1ff' }, lidar: { name: 'LiDAR cố định', color: '#a78bfa' }, rfid: { name: 'Cổng RFID/OCR', color: '#f5a524' },
    rtk: { name: 'Trạm gốc RTK', color: '#4cc38a' }, uwb: { name: 'Neo UWB', color: '#ff7ab6' }, tl: { name: 'Đèn tín hiệu', color: '#f2c14e' },
    mag: { name: 'Nam châm sàn / transponder', color: '#d9e2ea' }, '5g': { name: 'Trụ 5G', color: '#3cc8e6' },
  };

  // Vật cố định có thân trụ trên mặt đất (xe phải chừa khoảng hở). Neo UWB gắn trên cột nhà, trạm RTK trên mái: không tính.
  function solids() {
    const out = CELLS.map(c => ({ id: c.id, x: c.x, z: c.z, r: c.type === 'indoor' ? 0.2 : 0.5 }));
    for (const d of DEVICES) if (d.kind !== 'uwb' && d.kind !== 'rtk') out.push({ id: d.id, x: d.x, z: d.z, r: 0.25 });
    return out;
  }

  return { IGV, socOf, solids, CELLS, OBSTACLES, cellLatency, serving, speedFactor, extraGap, latClass, DEVICES, MAG, TAG, KIND_INFO, segHitsRect, inRect };
});
