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
- Góc nhìn: Toàn cảnh, Cổng trung tâm, Nhà chuyển tải, Vòng IGV, Cổng nội địa, Nhìn từ trên.

Kiểm thử tự động (Node.js 18+, không cần cài gói):

```bash
cd "CLAUDE OUTPUTS/BaoNguyen/demo-3d/v2"
npm test                                   # 8 kịch bản × 2 seed × 60 phút mô phỏng
node test/run-scenarios.js 240 1 2 3       # chạy dài hơn
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

## 8 kịch bản

| # | Kịch bản | Điều được minh hoạ |
|---|---|---|
| 1 | Vận hành bình thường | Xe TQ chở hàng nhập vào làn IGV, đi vòng phía tây nam vào 1 trong 4 làn IGV; cầu trục đặt container xuống ô chờ; SIVIP gọi xe VN vào cổng đông bắc nhận hàng, ra qua trạm cân. Xe VN chở hàng xuất vào cổng tây bắc; xe TQ về được ghép chuyến chở hàng xuất. ~20% lô hàng nhập bị kiểm hoá |
| 2 | Cao điểm mùa vụ | Lưu lượng gấp ~2,3 lần; cầu trục là nút thắt, hàng chờ nằm ngoài cổng |
| 3 | Làn IGV số 5 hỏng | Phút 8 khoá làn 5, xe mới sang làn 6–8; phút 38 khôi phục |
| 4 | Xe hỏng trên làn IGV | Một xe chết máy 5 phút trên vòng IGV; xe sau tự dừng, không chiếm giao cắt |
| 5 | Hải quan kiểm hoá 60% | 2 trạm kiểm hoá nối tiếp; xe chỉ qua barie khi đã đặt được trạm |
| 6 | Mức B: IGV tự hành TQ | Toàn bộ xe TQ là IGV (màu trắng), 14 km/h, chỉ trong làn IGV và nhà chuyển tải |
| 7 | Mưa lớn / sương mù | Giảm 40% tốc độ, tăng 4 m khoảng cách dừng |
| 8 | Kiểm thử áp lực | Đầu vào gấp ~5 lần, chứng minh không va chạm, không kẹt cứng |

## Vùng giao cắt (mỗi vùng chỉ một xe, xe phải giữ được chỗ thoát phía sau)

1. Nhập làn cổng xuất khẩu (tây bắc): xe vào từ hai cổng gặp nhau.
2. Nhập làn ra cổng nhập khẩu (đông bắc): làn xe có hàng (sau trạm cân) và làn xe rỗng nhập vào.
3. Rẽ vào 4 làn xe nội địa.
4. Ra khỏi nhà chuyển tải phía xe nội địa (4 làn nhập về 2 làn ra).
5. Rẽ vào 4 làn IGV.
6. Ra khỏi nhà chuyển tải phía IGV (gồm cả góc vòng IGV sát lối ra làn 8, để xe ra không phải chờ xe trên vòng).
7. Nhập làn sau kiểm hoá.

## Kết quả kiểm thử

60 phút mô phỏng, seed 1 và 2 (`npm test`):

| Kịch bản | Seed | Va chạm | Hở xe–xe (m) | Hở xe–cont (m) | Cont nhập | Cont xuất | Xe TQ ra | Xe VN ra | Lượt cầu trục | Kiểm hoá | Chờ lâu nhất (s) | Chờ cổng IGV cuối | Kết quả |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| normal | 1 | 0 | 3.20 | 0.88 | 27 | 9 | 34 | 33 | 72 | 8 | 166 | 0 | ĐẠT |
| normal | 2 | 0 | 3.20 | 0.88 | 23 | 12 | 30 | 30 | 69 | 4 | 203 | 1 | ĐẠT |
| peak | 1 | 0 | 2.73 | 0.88 | 31 | 17 | 42 | 47 | 106 | 4 | 390 | 22 | ĐẠT |
| peak | 2 | 0 | 2.73 | 0.88 | 31 | 17 | 39 | 45 | 101 | 8 | 266 | 17 | ĐẠT |
| laneFail | 1 | 0 | 2.73 | 0.88 | 26 | 12 | 37 | 36 | 82 | 7 | 228 | 5 | ĐẠT |
| laneFail | 2 | 0 | 2.73 | 0.88 | 30 | 12 | 39 | 37 | 86 | 6 | 175 | 0 | ĐẠT |
| breakdown | 1 | 0 | 3.20 | 0.88 | 30 | 12 | 34 | 37 | 80 | 6 | 300 | 0 | ĐẠT |
| breakdown | 2 | 0 | 2.73 | 0.88 | 25 | 9 | 34 | 32 | 73 | 9 | 316 | 1 | ĐẠT |
| inspection | 1 | 0 | 2.73 | 0.88 | 19 | 6 | 20 | 27 | 54 | 13 | 412 | 12 | ĐẠT |
| inspection | 2 | 0 | 3.20 | 0.88 | 27 | 8 | 30 | 31 | 68 | 10 | 266 | 1 | ĐẠT |
| av | 1 | 0 | 2.83 | 0.88 | 29 | 10 | 34 | 34 | 76 | 6 | 87 | 0 | ĐẠT |
| av | 2 | 0 | 2.83 | 0.88 | 23 | 11 | 29 | 30 | 66 | 6 | 283 | 4 | ĐẠT |
| weather | 1 | 0 | 2.01 | 0.88 | 24 | 8 | 32 | 29 | 70 | 5 | 273 | 0 | ĐẠT |
| weather | 2 | 0 | 2.65 | 0.88 | 22 | 13 | 32 | 29 | 69 | 6 | 161 | 2 | ĐẠT |
| stress | 1 | 0 | 2.46 | 0.88 | 28 | 12 | 36 | 45 | 90 | 6 | 895 | 97 | ĐẠT |
| stress | 2 | 0 | 2.46 | 0.88 | 29 | 16 | 34 | 47 | 100 | 8 | 341 | 87 | ĐẠT |

16/16 lượt đạt. Thêm lượt dài 180 phút seed 3 và 4 cho cả 8 kịch bản: xem mô tả pull request.
Tiêu chí đạt: 0 lần giao nhau giữa hai xe và giữa xe với container ở ô chờ, 0 vi phạm bất biến ô lưới,
khoảng hở nhỏ nhất ≥ 0,3 m, không xe nào chờ liên tục quá 20 phút, có sản lượng ra khỏi bãi.
Khoảng hở xe–container luôn là 0,88 m: đó là khoảng cách thiết kế giữa xe đang dừng và ô chờ cùng làn (đo trên bản vẽ).

## Cấu trúc thư mục

| File | Vai trò |
|---|---|
| `BaoNguyen_Demo3D_v2.html` | Bản đóng gói một file, mở trực tiếp |
| `sim-core.js` | Lõi mô phỏng: mặt bằng theo PDF, tuyến đường, đặt chỗ ô, vùng giao cắt, ô chờ, cầu trục, kịch bản, kiểm tra va chạm |
| `app.js` | Vẽ 3D bằng Three.js 0.160 và giao diện |
| `page.html` | Khung trang và CSS |
| `plan-image.js` | Ảnh mặt bằng trang 3 của PDF (thu nhỏ) làm lớp nền đối chiếu |
| `build.js` | Ghép các file trên thành file HTML |
| `test/run-scenarios.js` | Kiểm thử tự động mọi kịch bản |
