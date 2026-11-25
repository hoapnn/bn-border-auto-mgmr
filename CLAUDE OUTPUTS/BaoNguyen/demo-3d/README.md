# Demo 3D bãi container Bảo Nguyên — điều phối xe không va chạm

Mô phỏng 3D chạy trên trình duyệt cho bãi container thông minh cửa khẩu Bảo Nguyên, dựa trên deck
"Bản Thiết Kế Điều Hành Bãi Container Tự Động" (slide 3: cổng thông minh 2+2 làn, trạm cân 120 tấn,
SIVIP, CCTV, mạng Viettel, cổng kết nối Hải quan) và các quyết định đã chốt trong `HANDOFF.md`
(tài xế VN đổi đầu kéo tại khu chuyển giao; xe tự hành TQ là mức B, có điều kiện).

## Cách chạy

**Cách nhanh nhất:** mở file `BaoNguyen_Demo3D_v1.html` bằng Chrome/Edge/Firefox (nhấp đúp).
Cần Internet để tải Three.js từ unpkg.com; không cần cài gì thêm.

Trên trang:
- chọn **Kịch bản** ở thanh trên, **Tốc độ** 1× đến 40×, **Chạy lại** để bắt đầu lại với dòng xe ngẫu nhiên mới;
- nút góc dưới trái đổi góc nhìn (Toàn cảnh, Cổng Km0, Khu đổi đầu kéo, Bãi xếp, Nhìn từ trên); kéo chuột để xoay, cuộn để thu phóng;
- bảng bên phải: số va chạm phát hiện (luôn phải là 0), khoảng hở nhỏ nhất giữa hai thân xe, xe trong bãi, hàng chờ, sản lượng, trạng thái từng làn cổng và từng ô đổi đầu kéo, nhật ký sự cố;
- bật **Ô lưới xe đang đặt chỗ** để thấy từng ô 1 m mà mỗi xe đang giữ (mỗi xe một màu).

**Kiểm thử tự động** (Node.js 18 trở lên, không cần cài gói):

```bash
cd "CLAUDE OUTPUTS/BaoNguyen/demo-3d"
npm test                                # 8 kịch bản × 2 seed × 60 phút mô phỏng
node test/run-scenarios.js 240 1 2 3    # chạy dài hơn: 240 phút, 3 seed
```

Sửa `sim-core.js`, `app.js` hoặc `page.html` xong thì chạy `node build.js` để đóng gói lại file HTML.
GitHub Actions (`.github/workflows/demo-3d.yml`) chạy kiểm thử mỗi khi thư mục này thay đổi.

## 8 kịch bản

| # | Kịch bản | Điều được minh họa |
|---|---|---|
| 1 | Vận hành bình thường | Luồng chính: xe TQ qua cổng nhập (OCR + cân), hạ moóc ở khu đổi đầu kéo, về Km0; đầu kéo VN lùi ghép moóc, ra cổng xuất nội địa. Có hạ bãi / lấy bãi bằng xe nâng chụp, ~20% kiểm hóa |
| 2 | Cao điểm mùa vụ | Lưu lượng gấp ~2,5 lần; hàng chờ nằm ngoài cổng, trong bãi vẫn thông |
| 3 | Làn nhập 1 hỏng OCR/barie | Phút 8 làn 1 chuyển xử lý thủ công (chậm gấp 5), xe mới được điều sang làn 2; phút 38 khôi phục |
| 4 | Xe hỏng trên đường nội bộ | Một xe chết máy 5 phút trên đường vành đai; xe sau tự dừng, không chiếm giao cắt |
| 5 | Hải quan tăng kiểm hóa 60% | Làn kiểm hóa 2 trạm nối tiếp; xe chỉ rời khu đổi đầu kéo khi đã có trạm trống |
| 6 | Mức B: xe tự hành TQ | Xe tự hành (màu trắng) nhận bàn giao tại Km0, chạy 14 km/h, chỉ được vào khu đổi đầu kéo |
| 7 | Mưa lớn / sương mù | Giảm 40% tốc độ, tăng 4 m khoảng cách dừng |
| 8 | Kiểm thử áp lực | Đầu vào gấp 5 lần năng lực, để chứng minh không va chạm và không kẹt cứng trong bãi |

## Cơ chế chống va chạm

Hai lớp, tách bạch giữa *an toàn* và *không kẹt*:

1. **Đặt chỗ ô lưới (an toàn).** Toàn khu vực chia ô 1 m × 1 m. Ở mỗi bước 0,1 s, mỗi xe giữ các ô
   dưới thân xe (phình thêm 0,6 m) và đặt trước các ô trên quãng phanh phía trước (phình 1,0 m).
   Một ô chỉ có một chủ; xe chỉ tiến vào phần đường mình đã đặt và tự tính tốc độ để dừng kịp trước
   ô của xe khác. Vì vậy thân hai xe không thể chồng lên nhau, kể cả khi vào cua (moóc được mô hình
   riêng, đi theo chốt kéo).
2. **Vùng giao cắt độc quyền (không kẹt).** 6 vùng: nhập làn ở cổng Km0, nhập làn từ khu đổi đầu kéo,
   khu đổi đầu kéo (nơi đầu kéo VN lùi ghép moóc), nhập làn ở cổng nội địa, nhập làn từ bãi xếp,
   nhập làn sau kiểm hóa. Mỗi vùng chỉ một xe. Xe chỉ khóa vùng khi đặt được ô xuyên qua vùng **và**
   thêm một khoảng thoát (dài thân xe + 3 m) phía sau, nên không xe nào dừng giữa giao cắt.
3. **Điều phối SIVIP.** Barie chỉ mở khi đã đặt được ô đổi đầu kéo (xe TQ) hoặc vị trí xếp dỡ;
   giới hạn số xe trong bãi; xe cần kiểm hóa chỉ rời ô khi có trạm trống; làn hỏng thì xe mới được
   điều sang làn còn lại.

**Kiểm tra độc lập:** ở mọi bước mô phỏng, `checkCollisions` thử từng cặp thân xe bằng phép SAT trên
hình chữ nhật thật (không phình), ghi số lần giao nhau và khoảng hở nhỏ nhất. Ngoại lệ duy nhất là
đầu kéo với chính chiếc moóc nó đang ghép hoặc vừa tách (tiếp xúc có chủ đích). Kiểm thử còn đếm
"vi phạm bất biến" (xe đứng trên ô không thuộc mình) và thời gian chờ liên tục dài nhất để bắt kẹt cứng.

Tiêu chí đạt: 0 lần giao nhau, 0 vi phạm bất biến, khoảng hở nhỏ nhất ≥ 0,3 m, không xe nào chờ
liên tục quá 20 phút, có sản lượng ra khỏi bãi.

## Kết quả kiểm thử (60 phút mô phỏng, seed 1 và 2)

| Kịch bản | Seed | Phút | Va chạm | Hở min (m) | Đổi đầu kéo | Xe TQ ra | Hạ/lấy bãi | Kiểm hóa | Chờ lâu nhất (s) | Hàng chờ Km0 cuối | Kết quả |
|---|---|---|---|---|---|---|---|---|---|---|---|
| normal | 1 | 60 | 0 | 2.50 | 20 | 21 | 9/5 | 5 | 338 | 1 | ĐẠT |
| normal | 2 | 60 | 0 | 2.91 | 15 | 18 | 4/7 | 7 | 88 | 0 | ĐẠT |
| peak | 1 | 60 | 0 | 2.00 | 26 | 31 | 8/7 | 5 | 405 | 22 | ĐẠT |
| peak | 2 | 60 | 0 | 2.00 | 24 | 28 | 11/14 | 5 | 633 | 20 | ĐẠT |
| laneFail | 1 | 60 | 0 | 2.48 | 27 | 29 | 7/4 | 9 | 349 | 0 | ĐẠT |
| laneFail | 2 | 60 | 0 | 2.79 | 22 | 27 | 8/4 | 7 | 306 | 0 | ĐẠT |
| breakdown | 1 | 60 | 0 | 2.50 | 23 | 22 | 8/7 | 2 | 300 | 1 | ĐẠT |
| breakdown | 2 | 60 | 0 | 2.80 | 19 | 20 | 9/4 | 3 | 314 | 1 | ĐẠT |
| inspection | 1 | 60 | 0 | 2.81 | 21 | 22 | 5/6 | 9 | 195 | 2 | ĐẠT |
| inspection | 2 | 60 | 0 | 2.81 | 19 | 20 | 6/6 | 6 | 146 | 1 | ĐẠT |
| av | 1 | 60 | 0 | 2.81 | 22 | 22 | 0/8 | 4 | 277 | 0 | ĐẠT |
| av | 2 | 60 | 0 | 2.83 | 18 | 20 | 0/9 | 5 | 92 | 1 | ĐẠT |
| weather | 1 | 60 | 0 | 2.65 | 17 | 19 | 9/5 | 6 | 858 | 2 | ĐẠT |
| weather | 2 | 60 | 0 | 2.65 | 14 | 16 | 4/7 | 4 | 244 | 1 | ĐẠT |
| stress | 1 | 60 | 0 | 2.00 | 15 | 19 | 6/23 | 4 | 934 | 134 | ĐẠT |
| stress | 2 | 60 | 0 | 2.00 | 20 | 25 | 8/23 | 9 | 551 | 110 | ĐẠT |

16/16 lượt chạy đạt: 0 lần giao nhau, 0 vi phạm bất biến ô lưới, khoảng hở nhỏ nhất 2,0 m.


## Giả định (bản vẽ không có kích thước)

Deck chỉ có hình phối cảnh, không ghi kích thước, nên các số dưới đây là giả định hợp lý; sửa trong
`LAYOUT` ở đầu `sim-core.js` khi có bản vẽ mặt bằng thật.

| Hạng mục | Giả định |
|---|---|
| Khu bãi (trong hàng rào) | ~280 m × 150 m (~4,2 ha), đường vành đai một chiều theo chiều kim đồng hồ, góc cua bán kính 10 m |
| Cổng nhập phía Km0 | 2 làn vào, mỗi làn có cân 120 tấn dài 24 m + OCR + barie; 1 làn ra trả xe TQ về Km0 (bản vẽ không thể hiện) |
| Cổng nội địa | 1 làn vào cho đầu kéo VN, 2 làn xuất ra đường nội địa (cổng "2+2" hiểu là 2 làn nhập + 2 làn xuất) |
| Km0 | cách cổng nhập ~90 m |
| Khu đổi đầu kéo | 6 ô song song, cách nhau 9 m; xe TQ vào thẳng, hạ moóc, đầu kéo đi tiếp; đầu kéo VN lùi vào ghép |
| Bãi xếp | 6 cột × 3 hàng × 3 tầng container 40 ft cho 1 xe nâng chụp, 2 vị trí xếp dỡ nối tiếp; khối phía bắc là hàng tồn (trang trí) |
| Kiểm hóa | 2 trạm nối tiếp trên làn riêng, 3 đến 6 phút mỗi lô |
| Xe | đầu kéo 6,2 m × 2,5 m; moóc 40 ft 12,5 m × 2,6 m; xe nâng chụp 7 m × 4 m |
| Tốc độ | 20 km/h trong bãi, 29 km/h ngoài cổng, giảm theo bán kính cua; lùi 4,7 km/h; xe tự hành 14 km/h |
| Thời gian | qua cổng nhập 25–45 s; hạ moóc 60–100 s; ghép moóc 70–120 s; xe nâng chụp ~55 s mỗi lần nhấc; cổng xuất 20–35 s |
| Lưu lượng | bình thường 26 lượt đổi đầu kéo/giờ + 10 lượt bãi/giờ; các kịch bản khác nhân theo bảng trên |

Năng lực khu đổi đầu kéo bị giới hạn bởi vùng giao cắt chung trước 6 ô (khoảng 25–30 lượt/giờ):
ở kịch bản cao điểm và áp lực, hàng chờ dồn ra đường Km0 chứ không vào bãi. Muốn tăng năng lực thật
thì cần tách khu đổi đầu kéo thành hai cụm có làn ra riêng; đây là gợi ý thiết kế, chưa mô phỏng.

## Cấu trúc thư mục

| File | Vai trò |
|---|---|
| `BaoNguyen_Demo3D_v1.html` | Bản đóng gói một file, mở trực tiếp |
| `sim-core.js` | Lõi mô phỏng: mặt bằng, đường đi, đặt chỗ ô, vùng giao cắt, điều phối, kịch bản, kiểm tra va chạm |
| `app.js` | Vẽ 3D bằng Three.js 0.160 và giao diện |
| `page.html` | Khung trang và CSS |
| `build.js` | Ghép ba file trên thành file HTML |
| `test/run-scenarios.js` | Kiểm thử tự động mọi kịch bản |
