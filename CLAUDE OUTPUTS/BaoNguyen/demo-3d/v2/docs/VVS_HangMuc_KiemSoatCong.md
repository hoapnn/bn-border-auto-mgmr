# Hạng mục VVS: kiểm soát cổng và làn (LED, camera, RFID, barie)

Tài liệu kỹ thuật kèm demo 3D v2. Có thể dùng lại làm phụ lục kỹ thuật cho hồ sơ đề xuất VVS.
**Không có giá, điều khoản hợp đồng hay tên nhà cung cấp thiết bị.** Mọi thông số là giả định minh hoạ, chưa phải datasheet thiết bị.

## 1. Tổng quan

17 **trạm kiểm soát** đặt ở các điểm xe ra vào. Mỗi trạm là **một cột thép cao 7 m** mang chung:

- **camera kiểm soát** (đọc biển số, ảnh bằng chứng),
- **đầu đọc RFID** (đọc thẻ xe / IGV / container), đặt cùng cột và cùng vị trí với camera để một vị trí cho cả hai nguồn nhận dạng và đối chiếu chéo,
- **biển LED** hiện biển số, ngày giờ, trạng thái khi xe tới,
- **barie** tay đòn ở vạch dừng; ở cổng đã có barie trong bản vẽ thì dùng lại barie đó.

Nhận dạng kép (biển số + thẻ RFID) rồi đối chiếu với lệnh của SIVIP; chỉ khi SIVIP đã giữ được ô / làn / vị trí cho xe thì barie mới mở.

## 2. Vị trí (toạ độ mặt bằng demo, mét)

| Mã | Vị trí | x | z | Barie |
|---|---|---|---|---|
| CP-TQ1 | Cổng IGV vào (cổng TQ) | 193,0 | 216 | làn IGV vào |
| CP-TQ2 | Cổng IGV ra (cổng TQ) | 204,4 | 216 | làn IGV ra |
| CP-VN1 | Cổng nhập khẩu (đông bắc) | 199,0 | 1 | cổng đông bắc |
| CP-VN2 | Cổng xuất khẩu (tây bắc) | 56,8 | -6 | cổng tây bắc |
| CP-VN3 | Trạm cân ra | 194,4 | 44 | barie trạm cân |
| CP-XB1 / XB2 | Đường xuyên biên giới, làn 1–2 (VN → TQ) | 213,3 / 217,0 | 191,6 | 1 barie / làn |
| CP-XB3 / XB4 | Đường xuyên biên giới, làn 3–4 (TQ → VN) | 222,6 / 231,2 | 176,8 | 1 barie / làn |
| CP-L1 … L8 | 8 làn nhà chuyển tải (L1–4 xe nội địa, L5–8 IGV / xe TQ) | 88,3 | 86,7 / 95,6 / 104,1 / 112,5 / 123,4 / 131,9 / 140,2 / 148,7 | 1 barie / làn (đầu làn) |

Cột đặt ngoài tim làn; khoảng hở nhỏ nhất giữa thân xe và cột được bộ kiểm thử đo mỗi 0,5 s.

## 3. Thông số từng thiết bị (giả định)

| Thiết bị | Thông số |
|---|---|
| Cột | Thép mạ kẽm cao 7 m, bệ bê tông; IP66, chống sét lan truyền, tiếp địa ≤ 4 Ω |
| Camera | 1 camera ALPR + 1 camera tổng quan, 8 MP, đèn hồng ngoại, HDR; lắp cao 6,8 m hướng xuống làn; xuất luồng RTSP và sự kiện đọc biển số (JSON) |
| RFID | UHF 860–960 MHz, EPC Gen2, 4 cổng ăng-ten phân cực tròn; lắp cao 6,0 m; tầm đọc 6–12 m, đọc xe chạy ≤ 20 km/h; thẻ dán kính xe VN, thẻ IGV, thẻ container nếu có |
| Biển LED | Full-color ngoài trời P10, 3,0 × 1,0 m, ≥ 5 000 cd/m², tự chỉnh sáng; lắp cao 4,5–5,5 m (trên container cao 4,05 m) |
| Barie | Tay đòn điện 4,5–6,5 m, mở/đóng ~1,5 s, vòng từ + chùm tia chống đập xe |

## 4. Nội dung biển LED

| Dòng | Nội dung |
|---|---|
| 1 | Biển số xe (hoặc "SẴN SÀNG" khi không có xe) |
| 2 | Ngày giờ (demo: bắt đầu 25/03/2027 06:00:00) |
| 3 | Trạng thái: ĐANG ĐỌC · DỪNG / MỜI QUA |

Mất kết nối với SIVIP: biển hiện "DỪNG – CHỜ NHÂN VIÊN", barie giữ đóng.

## 5. Kết nối

```
Camera ─┐
RFID  ──┼─ PoE+ switch (tủ cổng) ── cáp quang ── phòng máy ── SIVIP
LED  ───┤                                         
Barie ──┴─ I/O module + vòng từ
```

- Cáp quang từ tủ cổng về phòng máy; trong tủ: switch công nghiệp PoE+ (camera, RFID), I/O module (barie, vòng từ), bộ điều khiển LED.
- VLAN riêng cho thiết bị kiểm soát cổng, tách khỏi mạng 5G của IGV.
- Giao thức: ONVIF/RTSP (camera), LLRP (RFID), Modbus-TCP hoặc dry contact (barie), API SIVIP (sự kiện, lệnh).
- Nguồn: điện lưới + UPS 30 phút tại tủ cổng.

## 6. Quy trình một lượt xe

1. Xe vào vùng kích hoạt của trạm (6–12 m trước vạch dừng).
2. Camera đọc biển số, RFID đọc thẻ; LED hiện biển số + ngày giờ + "ĐANG ĐỌC · DỪNG".
3. Trạm gửi sự kiện (biển số, EPC, thời điểm) lên SIVIP và đối chiếu với lệnh điều phối.
4. **Barie chỉ mở khi SIVIP đã đặt được ô / làn / vị trí cho xe** (cùng logic đặt ô đã dùng chống va chạm). LED đổi sang "MỜI QUA".
5. Barie giữ mở đến khi xe được cấp đã qua vạch, rồi tự đóng.

Trong demo, bộ kiểm thử kiểm tra: không xe nào đi qua vạch khi tay đòn đang đóng (`barrierViol = 0`), và tay đòn không chạm thân xe.

## 7. Giả định và điểm cần xác nhận

- Vị trí cột là giả định theo mặt bằng PDF, cần khảo sát hiện trường.
- Camera và RFID dùng chung một cột nên cần tính nhiễu RF với camera / biển LED khi lắp thật.
- Đường xuyên biên giới có 4 làn barie là giả định theo bản vẽ concept.
- Ngày giờ trên LED là giờ mô phỏng, không phải giờ thật.
- Thông số thiết bị (độ phân giải, tầm đọc, độ sáng) là giá trị điển hình, chưa gắn nhà sản xuất.
