# Demo 3D v2 — Bến xe Bảo Nguyên theo layout PDF concept

Bản v2 dựng lại mặt bằng theo **`261102-PIVN_BN_ConceptPresentation_2026_V2.pdf`** (PI-VN, 08.2026),
trang 2–3 "Mặt bằng định vị / tổng thể", trang 6–8 (mặt đứng, mặt cắt). Bản v1 (thư mục cha) dựng từ deck
pptx không có kích thước nên mặt bằng là giả định; v1 được giữ nguyên để so sánh.

Lõi chống va chạm giữ nguyên v1 (đặt chỗ ô lưới 1 m, vùng giao cắt độc quyền có khoảng thoát, SIVIP đặt chỗ
trước khi mở barie, kiểm tra SAT độc lập mọi cặp xe ở mỗi bước 0,1 s). Phần thay đổi là mặt bằng, tuyến đường,
và cách chuyển hàng: **cầu trục chuyển container trong nhà chuyển tải 8 làn** đúng như bản vẽ, thay cho khu đổi
đầu kéo của v1.

## Cách chạy

- Mở `BaoNguyen_Demo3D_v2.html` bằng Chrome/Edge/Firefox (cần Internet để tải Three.js từ unpkg.com).
- Bật **"Bản vẽ PDF làm nền"** trong bảng bên phải để thấy mặt bằng gốc nằm đúng dưới mô hình 3D (đối chiếu vị trí).
- Góc nhìn: Toàn cảnh, Cổng trung tâm, Nhà chuyển tải, Vòng IGV, Cổng nội địa, Nhìn từ trên, **Phủ sóng 5G** (bật bản đồ độ trễ), **Cảm biến** (bật mọi lớp thiết bị).
- Bấm vào bất kỳ trụ 5G, cảm biến, đèn tín hiệu, nam châm sàn hoặc xe để xem chú thích (xem mục "Phần cứng, 5G, cảm biến").

Kiểm thử tự động (Node.js 18+, không cần cài gói):

```bash
cd "CLAUDE OUTPUTS/BaoNguyen/demo-3d/v2"
npm test                                   # kiểm tra phần cứng + 9 kịch bản × 2 seed × 60 phút mô phỏng
node test/run-scenarios.js 240 1 2 3       # chạy dài hơn
npm run test:long                          # 180 phút × seed 3, 4 (~10 phút)
ONLY=peak,stress node test/run-scenarios.js 60 7
```

Sửa `sim-core.js`, `app.js` hoặc `page.html` xong thì chạy `node build.js` để đóng gói lại file HTML
(GitHub Actions so khớp file đóng gói với mã nguồn).

## Lấy gì từ PDF

Toạ độ trong mô phỏng là mét, gốc ở góc trên trái ảnh mặt bằng; 1 px ảnh gốc (2817 × 1995 px, 200 dpi) = 0,1285 m,
hiệu chỉnh theo các kích thước ghi trên bản vẽ (36 220 / 40 600 / 46 600 / 27 200 / 30 000 / 8 000 / 6 000 mm),
sai lệch giữa các kích thước khoảng ±3%. Mọi số nằm trong `LAYOUT` ở đầu `sim-core.js`.

| Hạng mục | Theo PDF | Trong mô hình |
|---|---|---|
| Ranh giới dự án | đường đỏ | đa giác `fence`, ~4,9 ha |
| Cổng trung tâm | lòng đường 40,6 m (gồm dải IGV), 2 khối 36,22 × 27,2 m cách nhau 46,6 m, cách ranh giới 30 m; cầu nối tầng 3 (+13,75 → +19,6 m, mái +23,1 m) | dựng đúng kích thước, đảo giữa có chốt kiểm soát |
| Làn IGV | dải ~9 m bên trái cổng, "Làn IGV nhập" / "Làn IGV xuất" | 2 làn một chiều trong dải 194,7–203,5 m |
| Vòng IGV | dải xanh xám đi vòng bãi 11 ô phía tây nam, vào nhà chuyển tải từ phía tây | tuyến một chiều theo đúng dải này |
| Nhà chuyển tải | 8 làn: 4 "lối cho xe nội địa nhập container và chuyển container" + 4 "Làn IGV nhập", mũi tên đi từ tây sang đông, mỗi làn 1 vị trí xe + 1 ô "CONTAINER" | ~36 × 72 m, làn ~8,4 m, vị trí xe và ô chờ đo theo bản vẽ (nửa đông/tây như hình) |
| Lối xe xuất khẩu / nhập khẩu "theo mô hình thông minh" | 2 cổng có barie ở góc tây bắc và đông bắc | cổng xe VN chở hàng xuất (tây bắc) và xe VN nhận hàng nhập (đông bắc) |
| Bãi đỗ 32 ô phía bắc, bãi 11 ô phía tây nam, bãi xe hiện trạng phía đông | có vẽ | dựng theo vị trí; xe đỗ là trang trí |
| Dải cây xanh 8 m, đường nội bộ khối văn phòng 6 m | có ghi | dựng theo vị trí |

## Phần cứng, 5G, cảm biến

Bản này thêm ba nhóm chi tiết lên mặt bằng v2. **PDF concept không ghi thông số phần cứng nào**, nên toàn bộ số liệu dưới đây là
giả định hợp lý theo thực tế ngành cảng / xe tự hành, gom trong `hardware.js` để thay bằng datasheet khi chốt thiết bị.
Không có giá, hợp đồng hay thông tin nhạy cảm trong demo (repo công khai).

> **Về chữ "IGV":** trong PDF và trong ngành cảng, IGV là *Intelligent Guided Vehicle* (xe dẫn đường thông minh, xe tự hành chở container).
> Yêu cầu ban đầu viết "intergrated graphic vehicle"; demo hiểu theo nghĩa ngành cảng. Nếu ý khác, báo lại để chỉnh `IGV` trong `hardware.js`.

### 1) Phần cứng IGV

Bấm vào một IGV (chọn kịch bản 6 "Mức B" hoặc 7) để xem thẻ số liệu trực tiếp: tốc độ, trạm 5G đang bám, độ trễ, hệ số tốc độ, % pin, quãng đã chạy;
vòng tím quanh xe là tầm LiDAR (40 m LiDAR góc xe, 150 m LiDAR nóc). Bảng đầy đủ nằm ở mục "Cấu hình phần cứng IGV" trong bảng bên phải:

| Nhóm | Nội dung (giả định) |
|---|---|
| Khung gầm | Đầu kéo 4×2 điện, tự hành cấp 4 trong geofence; 6,2 m × 2,5 m, kéo moóc 40 ft; ≤ 14 km/h trong bãi |
| Pin & sạc | LFP ~280 kWh, ~1,6 kWh/km đầy tải; sạc DC tới 350 kW; pin < 25% thì SIVIP không giao nhiệm vụ mới. Khu sạc 4 vị trí là giả định, **demo chưa mô phỏng luồng xe đi sạc** (chỉ hiển thị % pin giảm theo quãng đường) |
| Cảm biến trên xe | LiDAR 128 kênh nóc + 4 LiDAR tầm ngắn góc xe, 6 camera 8 MP, 2 radar 77 GHz, GNSS/RTK 2 anten, IMU + encoder, 12 siêu âm, đầu đọc nam châm sàn |
| Điều khiển | Máy tính tự lái ~500 TOPS + MCU an toàn ASIL-D tách riêng, lái / phanh dự phòng kép, nút dừng khẩn |
| Truyền thông | Modem 5G SA (n78), 2 SIM (APN riêng, geofence), C-V2X dự phòng; điều khiển ≤ 20 ms một vòng, video hỗ trợ từ xa ~4 × 8 Mbps lên |

Trên mô hình 3D, IGV có LiDAR nóc, 2 LiDAR góc trước, camera, ăng-ten và **thanh đèn trạng thái** (xanh: ≤ 50 ms, vàng: 50–100 ms, đỏ: > 100 ms hoặc sự cố).

### 2) Vùng phủ 5G và ảnh hưởng tới xe

Tám trạm đặt quanh bãi (mã `5G-01` … `5G-08`), tất cả là giả định về vị trí:

| Trạm | Vị trí | Vai trò |
|---|---|---|
| 5G-01 | cổng trung tâm (190,5; 210) | làn IGV vào/ra, cổng kiểm soát OCR + RFID |
| 5G-02 | phía nam nhà chuyển tải (96; 168) | đoạn IGV vào nhà chuyển tải từ phía tây |
| 5G-03 | bãi chờ phía bắc (140; 80) | làn xe nội địa, trạm cân |
| 5G-04 | cổng nhập khẩu (172; 34) | cổng đông bắc, đường ra |
| 5G-05 | khu kiểm hoá (40; 200) | vòng IGV tây nam |
| 5G-06 | đường tiếp cận Km0 (190; 265) | nơi bàn giao điều khiển xe tự hành TQ |
| 5G-07 | trạm nhỏ **trong nhà chuyển tải** (108,6; 123,2) | sóng ngoài trời bị mái thép che, dưới mái dựa vào trạm này |
| 5G-08 | trạm nhỏ cạnh làn IGV ra (206,5; 162) | bù vùng bóng sóng sau khối cổng trung tâm |

**Mô hình độ trễ** (đơn giản, minh hoạ): mỗi trạm có 3 bán kính danh định; độ trễ một vòng điều khiển xe ↔ máy chủ biên tại VN tăng dần theo khoảng cách:
≤ r1: 9–20 ms · r1–r2: 20–50 ms · r2–r3: 50–120 ms · xa hơn: mất sóng. Vật cản (nhà chuyển tải, hai khối cổng trung tâm, cầu nối) làm đường truyền
"dài thêm" 55–85 m nếu nằm giữa trạm và xe; trạm đặt trong vật cản đó thì không bị che. Xe bám trạm có độ trễ thấp nhất.

**Ảnh hưởng tới IGV** (chỉ ở kịch bản có IGV; xe có tài xế không bị ảnh hưởng):

| Độ trễ | Hành vi |
|---|---|
| ≤ 20 ms | Đủ tốc độ |
| 20–50 ms | 80% tốc độ |
| 50–100 ms | 50% tốc độ, thêm 2 m khoảng dừng |
| > 100 ms | 30% tốc độ, thêm 2 m khoảng dừng |
| Mất sóng | Chạy dự phòng ~15% tốc độ bằng IMU + nam châm sàn, không dừng giữa vùng giao cắt |

Độ trễ chỉ làm xe **chậm hơn**, không đụng tới cơ chế đặt chỗ ô, nên không ảnh hưởng ràng buộc không va chạm (đã kiểm thử, xem dưới).
Chọn kịch bản 7 để xem sự cố: phút 10 trạm 5G-07 mất nguồn, IGV trong nhà chuyển tải rơi xuống ~50–100 ms và chậm lại; cũng có thể bấm vào bất kỳ trụ 5G
trên mô hình rồi "Giả lập mất nguồn trạm này" ở mọi kịch bản. Bảng bên phải có số trạm đang chạy, độ trễ trung bình và số IGV-giây ở sóng yếu / mất sóng.

Bật lớp **Vùng phủ 5G** (hoặc bấm nút "Phủ sóng 5G"): xanh ≤ 20 ms, vàng 20–50, cam 50–100, đỏ > 100, tím mất sóng; **Bán kính phủ danh định** vẽ 3 vòng quanh mỗi trụ.
Kết quả mô hình khi đủ trạm, trong ranh giới dự án (~4,9 ha): 65% diện tích ≤ 20 ms, 21% ở 20–50 ms, 10% ở 50–100 ms, ~4,6% yếu hơn hoặc mất sóng — vùng yếu tập trung ở bãi xe hiện trạng
phía đông đường trục (sau khối cổng phải, không có IGV). Mọi tuyến IGV đều ≤ 43 ms. Khi mất 5G-07, 98% diện tích dưới mái nhà chuyển tải rơi lên trên 50 ms.

### 3) Cảm biến và thiết bị dẫn hướng trên bãi (41 thiết bị cố định)

| Loại | SL | Đặt ở đâu | Dùng để |
|---|---|---|---|
| Camera | 12 | cổng trung tâm, cổng IGV, 2 góc nhà chuyển tải, cầu trục, 2 cổng VN, trạm cân, khu kiểm hoá, vòng IGV, ranh giới nam, bãi chờ | giám sát, đọc biển số / mã container, hình ảnh cho giám sát từ xa |
| LiDAR cố định | 7 | một cột cạnh mỗi vùng giao cắt | "mắt thứ hai" để SIVIP khoá vùng chính xác và thấy người / vật lạ |
| Cổng RFID / OCR | 5 | cổng IGV vào, cổng IGV ra, cổng nhập khẩu, cổng xuất khẩu, trạm cân ra | đọc biển số / mã container / seal rồi mới mở barie |
| Trạm gốc RTK | 2 | mái khối cổng trái, mái nhà chuyển tải | số hiệu chỉnh GNSS cho IGV ngoài trời (hai trạm so chéo) |
| Neo UWB | 8 | cột nhà chuyển tải | định vị dưới mái khi GNSS bị che |
| Đèn tín hiệu | 7 | một đèn mỗi vùng giao cắt | **đổi màu theo trạng thái vùng**: đỏ khi một xe đang giữ vùng, xanh khi trống |
| Nam châm sàn | 106 | dọc tim làn IGV vào / ra, cách 6 m | định vị ngang ±1 cm, dự phòng khi GNSS / UWB yếu |
| Transponder | 8 | điểm dừng của 8 làn nhà chuyển tải | xe biết đã đúng vị trí dừng ±5 cm trước khi cầu trục thao tác |

Mỗi lớp bật / tắt trong "Lớp phần cứng"; nam châm sàn mặc định tắt cho đỡ rối. Mọi vị trí là giả định theo mặt bằng PDF (đặt ngoài tim làn, cạnh vùng giao cắt hoặc cổng);
bản vẽ không thể hiện các thiết bị này. Bộ kiểm thử kiểm tra khoảng hở giữa thân xe và **mọi trụ / thiết bị cố định** mỗi 0,5 s: nhỏ nhất ≥ 0,79 m ở cả 9 kịch bản.

## Chỗ PDF thiếu thông tin và giả định đã dùng

| # | PDF thiếu / chưa rõ | Giả định trong v2 |
|---|---|---|
| 1 | Không ghi thiết bị chuyển container giữa làn IGV và làn nội địa (chỉ vẽ ô "CONTAINER" cạnh xe) | 2 cầu trục chạy dọc nhà (mỗi nửa đông/tây một chiếc), di chuyển 1,5 m/s, nâng hoặc hạ 16 s; ô chờ chồng tối đa 2 tầng. Mỗi container đi 2 lượt: xe → ô chờ → xe |
| 2 | Hướng đi làn IGV mâu thuẫn: nhãn chữ ngoài cổng ghi làn trái là "nhập", mũi tên nhỏ trong sân cổng vẽ làn trái đi ra | Theo nhãn chữ và hình học: làn trái rẽ vào vòng phía tây nam rồi vào nhà chuyển tải từ phía tây (khớp mũi tên → trong nhà); làn phải là làn ra. Cách này không có giao cắt giữa hai làn |
| 3 | Hai làn IGV trên bản vẽ cách nhau ~4,5 m tim-tim | Mô hình đặt 6,6 m (vẫn nằm trong dải 9 m, lệch tối đa 0,6 m) vì lưới đặt chỗ 1 m cần ≥ 6 m giữa hai làn song song ngược chiều để chứng minh không chạm |
| 4 | Không có kích thước nhà chuyển tải, làn, vị trí dừng | Đo theo tỷ lệ: nhà 36 × 72 m, làn ~8,4 m, xe dừng nửa đông (đầu xe x = 124 m) hoặc nửa tây (x = 107 m) như hình |
| 5 | Hai cổng góc bắc đều ghi "lối ra vào"; đường phía bắc chỉ rộng ~8,4 m | Xe vào được ở cả hai cổng; xe ra đều qua cổng đông bắc (làn qua trạm cân cho xe có hàng, làn riêng cho xe rỗng) để không có xe ngược chiều trên đường phía bắc |
| 6 | Hai hình chữ nhật ~6 × 30 m cạnh 2 cổng không có chú thích | Hiểu là trạm cân. Trạm đông bắc nằm trên làn ra: xe có hàng dừng cân + kiểm tra seal. Trạm tây bắc nằm ngoài lòng đường nên chỉ vẽ; xe chở hàng xuất làm OCR + tờ khai tại barie |
| 7 | Không có khu kiểm hoá Hải quan | Đặt ở bãi 11 ô phía tây nam (trong vòng IGV), 2 trạm nối tiếp trên làn kiểm hoá riêng, 3–6 phút mỗi lô |
| 8 | Không thể hiện Km0, trạm OCR/RFID cho IGV | Cổng kiểm soát IGV (OCR + RFID, 20–35 s) đặt trong ranh giới, ngay sau dải cây xanh; Km0 nằm ngoài khung bản vẽ về phía nam |
| 9 | Công năng bãi 32 ô phía bắc chưa ghi | Coi là bãi chờ xe nội địa (trang trí); trong mô phỏng xe chờ ở ngoài cổng, SIVIP gọi vào khi có hàng |
| 10 | Cổng trung tâm có ~6 làn xe thường, không thuộc bãi | Mô phỏng 2 làn mỗi chiều cho xe thông quan thường (trang trí, vẫn tính trong kiểm tra va chạm) |
| 11 | Không có số liệu vận hành | Giữ như v1: 20 km/h trong bãi, xe tự hành 14 km/h, bán kính quay 10 m, đầu kéo 6,2 m + moóc 40 ft 12,5 m; lưu lượng theo bảng kịch bản |

**Khác với quyết định đã chốt số 2** (đổi đầu kéo tại khu chuyển giao): bản vẽ PDF thể hiện chuyển container
bằng thiết bị nâng giữa làn IGV và làn nội địa, không có khu đổi đầu kéo. v2 làm theo bản vẽ. Nguyên tắc vẫn giữ:
xe TQ chỉ vào làn IGV và nhà chuyển tải, xe có tài xế VN làm phần phía VN; xe tự hành TQ là mức B.

## 9 kịch bản

| # | Kịch bản | Điều được minh hoạ |
|---|---|---|
| 1 | Vận hành bình thường | Xe TQ chở hàng nhập vào làn IGV, đi vòng phía tây nam vào 1 trong 4 làn IGV; cầu trục đặt container xuống ô chờ; SIVIP gọi xe VN vào cổng đông bắc nhận hàng, ra qua trạm cân. Xe VN chở hàng xuất vào cổng tây bắc; xe TQ về được ghép chuyến chở hàng xuất. ~20% lô hàng nhập bị kiểm hoá |
| 2 | Cao điểm mùa vụ | Lưu lượng gấp ~2,3 lần; cầu trục là nút thắt, hàng chờ nằm ngoài cổng |
| 3 | Làn IGV số 5 hỏng | Phút 8 khoá làn 5, xe mới sang làn 6–8; phút 38 khôi phục |
| 4 | Xe hỏng trên làn IGV | Một xe chết máy 5 phút trên vòng IGV; xe sau tự dừng, không chiếm giao cắt |
| 5 | Hải quan kiểm hoá 60% | 2 trạm kiểm hoá nối tiếp; xe chỉ qua barie khi đã đặt được trạm |
| 6 | Mức B: IGV tự hành TQ | Toàn bộ xe TQ là IGV (màu trắng), 14 km/h, chỉ trong làn IGV và nhà chuyển tải; tốc độ từng xe phụ thuộc độ trễ 5G tại vị trí xe |
| 7 | Mức B + sự cố 5G trong nhà chuyển tải | Như mức B; phút 10 trạm nhỏ 5G-07 mất nguồn, dưới mái chỉ còn sóng xuyên từ ngoài (50–100 ms) nên IGV giảm tốc; phút 40 khôi phục |
| 8 | Mưa lớn / sương mù | Giảm 40% tốc độ, tăng 4 m khoảng cách dừng |
| 9 | Kiểm thử áp lực | Đầu vào gấp ~5 lần, chứng minh không va chạm, không kẹt cứng |

## Vùng giao cắt (mỗi vùng chỉ một xe, xe phải giữ được chỗ thoát phía sau)

1. Nhập làn cổng xuất khẩu (tây bắc): xe vào từ hai cổng gặp nhau.
2. Nhập làn ra cổng nhập khẩu (đông bắc): làn xe có hàng (sau trạm cân) và làn xe rỗng nhập vào.
3. Rẽ vào 4 làn xe nội địa.
4. Ra khỏi nhà chuyển tải phía xe nội địa (4 làn nhập về 2 làn ra).
5. Rẽ vào 4 làn IGV.
6. Ra khỏi nhà chuyển tải phía IGV (gồm cả góc vòng IGV sát lối ra làn 8, để xe ra không phải chờ xe trên vòng).
7. Nhập làn sau kiểm hoá.

## Kết quả kiểm thử

60 phút mô phỏng, seed 1 và 2 (`npm test`, chạy kèm kiểm tra phần cứng):

| Kịch bản | Seed | Va chạm | Hở xe–xe (m) | Hở xe–cont (m) | Hở xe–thiết bị (m) | Cont nhập | Cont xuất | Xe TQ ra | Xe VN ra | Lượt cầu trục | Kiểm hoá | Chờ lâu nhất (s) | Chờ cổng IGV cuối | Kết quả |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| normal | 1 | 0 | 2.73 | 0.88 | 0.85 | 22 | 7 | 29 | 30 | 63 | 6 | 306 | 1 | ĐẠT |
| normal | 2 | 0 | 3.20 | 0.88 | 0.85 | 23 | 14 | 32 | 32 | 71 | 6 | 179 | 2 | ĐẠT |
| peak | 1 | 0 | 2.73 | 0.88 | 0.85 | 25 | 18 | 35 | 41 | 93 | 6 | 286 | 30 | ĐẠT |
| peak | 2 | 0 | 2.73 | 0.88 | 0.85 | 31 | 15 | 39 | 44 | 97 | 3 | 271 | 16 | ĐẠT |
| laneFail | 1 | 0 | 2.73 | 0.88 | 0.85 | 18 | 11 | 24 | 25 | 63 | 5 | 437 | 17 | ĐẠT |
| laneFail | 2 | 0 | 2.73 | 0.88 | 0.85 | 26 | 12 | 36 | 33 | 76 | 4 | 280 | 4 | ĐẠT |
| breakdown | 1 | 0 | 2.73 | 0.88 | 0.85 | 21 | 10 | 28 | 29 | 65 | 10 | 333 | 5 | ĐẠT |
| breakdown | 2 | 0 | 3.20 | 0.88 | 0.85 | 24 | 9 | 31 | 32 | 69 | 8 | 386 | 4 | ĐẠT |
| inspection | 1 | 0 | 2.73 | 0.88 | 0.85 | 22 | 6 | 24 | 27 | 61 | 12 | 329 | 9 | ĐẠT |
| inspection | 2 | 0 | 2.73 | 0.88 | 0.85 | 22 | 7 | 26 | 27 | 58 | 11 | 305 | 7 | ĐẠT |
| av | 1 | 0 | 2.62 | 0.88 | 0.85 | 23 | 8 | 29 | 30 | 64 | 8 | 411 | 2 | ĐẠT |
| av | 2 | 0 | 2.62 | 0.88 | 0.85 | 22 | 10 | 30 | 30 | 69 | 8 | 381 | 2 | ĐẠT |
| av5g | 1 | 0 | 2.62 | 0.88 | 0.85 | 27 | 8 | 34 | 29 | 73 | 7 | 225 | 0 | ĐẠT |
| av5g | 2 | 0 | 2.62 | 0.88 | 0.85 | 23 | 10 | 30 | 31 | 65 | 7 | 224 | 5 | ĐẠT |
| weather | 1 | 0 | 2.01 | 0.88 | 0.79 | 16 | 6 | 23 | 24 | 51 | 6 | 257 | 9 | ĐẠT |
| weather | 2 | 0 | 2.01 | 0.88 | 0.79 | 21 | 11 | 28 | 29 | 67 | 9 | 323 | 4 | ĐẠT |
| stress | 1 | 0 | 2.73 | 0.88 | 0.85 | 25 | 19 | 34 | 44 | 97 | 6 | 294 | 94 | ĐẠT |
| stress | 2 | 0 | 2.73 | 0.88 | 0.85 | 26 | 19 | 36 | 45 | 100 | 3 | 353 | 86 | ĐẠT |

18/18 lượt đạt.

Lượt dài 180 phút mô phỏng, seed 3 và 4 (`npm run test:long`):

| Kịch bản | Seed | Va chạm | Hở xe–xe (m) | Hở xe–cont (m) | Hở xe–thiết bị (m) | Cont nhập | Cont xuất | Xe TQ ra | Xe VN ra | Lượt cầu trục | Kiểm hoá | Chờ lâu nhất (s) | Chờ cổng IGV cuối | Kết quả |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| normal | 3 | 0 | 3.20 | 0.88 | 0.85 | 71 | 30 | 92 | 93 | 201 | 12 | 220 | 0 | ĐẠT |
| normal | 4 | 0 | 3.20 | 0.88 | 0.85 | 66 | 21 | 81 | 80 | 173 | 14 | 324 | 1 | ĐẠT |
| peak | 3 | 0 | 2.73 | 0.88 | 0.85 | 86 | 50 | 116 | 123 | 280 | 19 | 467 | 69 | ĐẠT |
| peak | 4 | 0 | 2.73 | 0.88 | 0.85 | 88 | 47 | 116 | 123 | 276 | 23 | 347 | 54 | ĐẠT |
| laneFail | 3 | 0 | 2.73 | 0.88 | 0.85 | 83 | 45 | 119 | 113 | 255 | 18 | 271 | 0 | ĐẠT |
| laneFail | 4 | 0 | 2.73 | 0.88 | 0.85 | 79 | 30 | 106 | 99 | 222 | 17 | 275 | 2 | ĐẠT |
| breakdown | 3 | 0 | 2.73 | 0.88 | 0.85 | 80 | 30 | 103 | 101 | 221 | 10 | 300 | 0 | ĐẠT |
| breakdown | 4 | 0 | 3.20 | 0.88 | 0.85 | 75 | 25 | 96 | 89 | 197 | 15 | 300 | 1 | ĐẠT |
| inspection | 3 | 0 | 2.73 | 0.88 | 0.85 | 69 | 24 | 87 | 88 | 186 | 43 | 340 | 10 | ĐẠT |
| inspection | 4 | 0 | 2.73 | 0.88 | 0.85 | 64 | 15 | 76 | 77 | 161 | 43 | 407 | 9 | ĐẠT |
| av | 3 | 0 | 2.62 | 0.88 | 0.85 | 74 | 32 | 96 | 95 | 212 | 13 | 331 | 0 | ĐẠT |
| av | 4 | 0 | 2.83 | 0.88 | 0.85 | 70 | 22 | 89 | 86 | 186 | 8 | 233 | 1 | ĐẠT |
| av5g | 3 | 0 | 2.62 | 0.88 | 0.85 | 72 | 31 | 98 | 97 | 207 | 11 | 283 | 4 | ĐẠT |
| av5g | 4 | 0 | 2.62 | 0.88 | 0.85 | 67 | 21 | 86 | 83 | 178 | 16 | 331 | 4 | ĐẠT |
| weather | 3 | 0 | 2.01 | 0.88 | 0.79 | 68 | 30 | 90 | 88 | 197 | 19 | 388 | 1 | ĐẠT |
| weather | 4 | 0 | 2.01 | 0.88 | 0.79 | 65 | 21 | 83 | 78 | 171 | 18 | 273 | 1 | ĐẠT |
| stress | 3 | 0 | 2.73 | 0.88 | 0.85 | 51 | 100 | 122 | 146 | 312 | 19 | 421 | 312 | ĐẠT |
| stress | 4 | 0 | 2.73 | 0.88 | 0.85 | 56 | 72 | 107 | 124 | 264 | 18 | 493 | 248 | ĐẠT |

18/18 lượt đạt. Tổng cộng 36/36 lượt, 0 va chạm.

Lỗi kẹt chỉ lộ ở lượt dài (đã sửa từ trước khi thêm phần cứng):

- **Hai xe nối đuôi khoá nhau**: vùng phồng lookahead của xe trước lấn ra sau đuôi, chạm ô xe sau đã giữ. Sửa: ô nằm hẳn sau đuôi xe hiện tại (quá 0,5 m) không chặn xe đó, vì xe chỉ tiến lên. Bộ kiểm tra va chạm độc lập vẫn chạy mỗi bước.
- **Xe có hàng chặn đầu hàng chờ ngoài cổng**: các ô chờ đầy hàng xuất, xe TQ rỗng đến lấy hàng lại xếp sau một xe TQ chở hàng nhập đang chờ chỗ trống. Sửa: SIVIP chỉ gọi xe có hàng từ bãi chờ ngoài cổng vào khi đã giữ trước được ô chờ container; xe rỗng đến nhận hàng luôn được gọi. Đây là giả định vận hành (đặt chỗ trước), cần xác nhận với quy trình SIVIP thật.
- Sự kiện xe chết máy khi chưa có xe phù hợp từng chặn cả hàng đợi sự kiện; nay chỉ tự hẹn lại sau 5 s.

Các kịch bản không có IGV cho số liệu giống hệt bản trước khi thêm phần cứng; chỉ kịch bản 6 và 7 đổi vì tốc độ IGV nay phụ thuộc độ trễ 5G.

Tiêu chí đạt: 0 lần giao nhau giữa hai xe và giữa xe với container ở ô chờ, 0 vi phạm bất biến ô lưới,
khoảng hở nhỏ nhất ≥ 0,3 m (kể cả xe–trụ thiết bị cố định), không xe nào chờ liên tục quá 20 phút, có sản lượng ra khỏi bãi.
Khoảng hở xe–container luôn là 0,88 m: đó là khoảng cách thiết kế giữa xe đang dừng và ô chờ cùng làn (đo trên bản vẽ).

## Cấu trúc thư mục

| File | Vai trò |
|---|---|
| `BaoNguyen_Demo3D_v2.html` | Bản đóng gói một file, mở trực tiếp |
| `sim-core.js` | Lõi mô phỏng: mặt bằng theo PDF, tuyến đường, đặt chỗ ô, vùng giao cắt, ô chờ, cầu trục, kịch bản, kiểm tra va chạm, ảnh hưởng độ trễ 5G lên tốc độ IGV |
| `hardware.js` | Dữ liệu phần cứng: cấu hình IGV, 8 trạm 5G + mô hình độ trễ, 41 cảm biến / thiết bị dẫn hướng cố định |
| `app.js` | Vẽ 3D bằng Three.js 0.160 và giao diện |
| `page.html` | Khung trang và CSS |
| `plan-image.js` | Ảnh mặt bằng trang 3 của PDF (thu nhỏ) làm lớp nền đối chiếu |
| `build.js` | Ghép các file trên thành file HTML |
| `test/run-scenarios.js` | Kiểm thử tự động mọi kịch bản (va chạm xe–xe, xe–container, xe–trụ thiết bị) |
| `test/hardware-checks.js` | Kiểm tra dữ liệu phần cứng và mô hình độ trễ 5G (chạy trước kịch bản) |
