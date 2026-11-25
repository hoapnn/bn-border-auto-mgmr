# Chi tiết các hạng mục SIVIP có thể nhận thầu — Bãi container thông minh Bảo Nguyên

> Phiên bản 1 · 25/11/2026 · Tài liệu nội bộ liên doanh VVS (giai đoạn đấu thầu)
> Căn cứ: Đề xuất VVS đưa bãi vào vận hành giữa Q2/2027 (bản v2 đã áp 7 chỗ sửa, xem `BaoNguyen-DeXuat_Report_v2.md`), Phản biện từ góc nhìn chủ đầu tư, Bản thiết kế điều hành (deck), HANDOFF.md.
> Mọi chi phí là **ước tính tham khảo, chưa VAT**, dùng đơn giá nhân công giả định. Phải thay bằng báo giá thật của SIVIP trước khi nộp hồ sơ.

Thang ảnh hưởng dùng xuyên suốt: 🔴4 nghiêm trọng (mất demo, không vận hành được 17/05, VVS lỗ) · 🟠3 cao (thiếu chức năng chính, chậm 2–4 tuần) · 🟡2 trung bình (chậm dưới 2 tuần, chi phí +3–10%) · 🟢1 thấp (xử lý trong vận hành).

---

## 0. Tóm tắt cho anh Hòa

- SIVIP có thể nhận **8 hạng mục**, chia 3 nhóm: **cam kết** (S1, S2, S3, S6, S7, S8: bắt buộc cho ngày vận hành), **có điều kiện** (S4, S5: chỉ làm khi xe tự hành TQ được phép vào bãi), và **dịch vụ sau bàn giao** (S8).
- Giá trị phần SIVIP theo phương án Tối ưu: **khoảng 5,8 tỷ cam kết** (24% gói VVS 24,3 tỷ) + **0,8 tỷ có điều kiện** + bảo trì **0,32 tỷ/năm** từ năm thứ 2.
- Khối lượng nhân công: **khoảng 117 người-tháng** cho phần cam kết, đỉnh **khoảng 20 người** trong tháng 1 và tháng 3/2027.
- **Điều kiện tiên quyết:** SIVIP phải có **sản phẩm phần mềm bãi làm nền** (tái sử dụng được 50–70%). Nếu viết mới từ đầu, khối lượng tăng lên khoảng 180–200 người-tháng và **không kịp demo 25/03** → đây là **điểm chết thứ 5 (🔴4)**. Cần SIVIP xác nhận trước 07/12.
- Ba việc phải làm ngay: (1) SIVIP xác nhận sản phẩm nền và dự án tham chiếu; (2) xin tài liệu chuẩn kết nối của Hải quan và của Pò Chài; (3) ký thỏa thuận VVS – SIVIP về phạm vi, giá, sở hữu mã nguồn, chia phạt.

---

## 1. Danh mục hạng mục SIVIP

| Mã | Hạng mục | Nằm trong khoản nào của đề xuất | Loại | Mốc cần có | Giá trị SIVIP (tỷ) | Ảnh hưởng nếu thiếu |
|---|---|---|---|---|---|---|
| S1 | Phần mềm quản lý bãi (YMS) — 10 phân hệ | C2 (4,0) | Cam kết | GĐ1: 25/03 · GĐ2: 12/04 | 4,00 | 🔴4 |
| S2 | Phần mềm điều khiển cổng (gate middleware): OCR, barie, LED, cân | Một phần C3 (2,2) và C8 (0,9) | Cam kết | 28/02 (mở cổng) | 0,35 | 🔴4 |
| S3 | Kết nối hệ thống Hải quan | Một phần C6 (1,0) | Cam kết | Thủ tục từ 01/2027 · chạy thật 04/2027 | 0,50 | 🔴4 |
| S4 | Phần mềm máy chủ trung chuyển dữ liệu xe tự hành | O4 (có điều kiện) | Có điều kiện | Chỉ khi có giấy phép | 0,18 (bản demo) · 0,57 (bản O4) | 🟠3 (mất Mức B) |
| S5 | Bộ chuyển đổi API với FMS/TOS phía TQ | Sau vận hành (Q3) | Có điều kiện | Môi trường thử trước 17/05 | 0,22 | 🟢1 |
| S6 | Tích hợp CCTV với giao dịch cổng, màn hình phòng điều hành | Một phần C4 (2,0) và C9 (0,8) | Cam kết | 03/2027 | 0,15 | 🟠3 |
| S7 | Tích hợp hệ thống, kiểm thử, đào tạo, hồ sơ, hỗ trợ tại chỗ | Một phần C5 (2,0) | Cam kết | 01/03 → 14/05, trực 8 tuần sau 17/05 | 0,80 | 🟠3 |
| S8 | Bảo hành phần mềm 24 tháng + bảo trì có SLA | Sau nghiệm thu | Dịch vụ | Từ 17/05/2027 | Năm 1: 0 · Năm 2 trở đi: 0,32/năm | 🟡2 |
| | **Cộng phần cam kết (S1, S2, S3, S6, S7)** | | | | **5,80** | |
| | **Cộng có điều kiện (S4 bản O4, S5)** | | | | **0,79** | |

Ghi chú về chia tiền: S2, S3, S6, S7 là **phần phần mềm và nhân công tích hợp** trong các khoản C3, C4, C5, C6, C8, C9 của đề xuất. Phần thiết bị (camera, barie, cân, đường truyền, màn hình) vẫn do VVS mua. Tổng gói VVS không đổi, chỉ chia lại giữa VVS và SIVIP.

Những gì SIVIP **không** nhận: xây lắp, thiết bị cổng và CCTV (phần cứng), mạng Viettel, cân, xe nâng, đầu kéo, xe tự hành và nền tảng đám mây phía TQ (chỉ kết nối API), thủ tục pháp lý của chủ đầu tư (SIVIP chỉ cung cấp hồ sơ kỹ thuật phần mềm).

---

## 2. Giả định nền và đơn giá

| Giả định | Giá trị | Cần ai xác nhận |
|---|---|---|
| Đơn giá nhân công bình quân SIVIP (gồm lương, bảo hiểm, quản lý, lợi nhuận) | **44 triệu đồng/người-tháng** | SIVIP |
| Tỷ lệ tái sử dụng sản phẩm nền | 50–70% cho S1; 30% cho S2 | SIVIP |
| Ký hợp đồng | 31/12/2026 (thư chấp thuận 21/12) | Chủ đầu tư |
| Sản lượng thiết kế | 350–480 xe/12 giờ với 2 làn nhập, 2 làn xuất (30–40 xe/giờ/làn, dưới 60 giây/xe) | Chủ đầu tư (sản lượng 2027–2029) |
| Hạ tầng máy chủ | Đặt tại phòng điều hành ở bãi (tại Việt Nam), phần cứng do VVS mua trong C9 | VVS |
| Xe tự hành TQ | Không vào bãi khi vận hành 17/05; bãi chạy bằng tài xế VN, đổi đầu kéo tại khu chuyển giao | Đã chốt |
| Ngôn ngữ giao diện | Tiếng Việt, tiếng Anh; nhãn tiếng Trung cho màn hình LED và phiếu in ở cổng | Chủ đầu tư |

---

## 3. S1 — Phần mềm quản lý bãi (YMS)

### 3.1 Mục tiêu và phạm vi

Bộ não điều hành bãi phía Việt Nam: biết container nào đang ở đâu, được phép vào/ra không, ai làm việc gì, thu bao nhiêu tiền, và báo cáo cho Hải quan. Làm theo 3 giai đoạn khớp với 3 mốc.

| Giai đoạn | Mốc | Phạm vi |
|---|---|---|
| GĐ1 | Demo 25/03 (đóng băng mã 01/03) | M1, M2 cơ bản, M3, M4, M5 cơ bản, M6, M9 cơ bản. Màn hình nhập tay trạng thái thông quan. Tính phí ở mức 0 đồng |
| GĐ2 | Hoàn thiện 12/04, chạy có tải 19/04 | M5 đầy đủ, M7 (hóa đơn thật), M8, M9 đầy đủ, nối S3 Hải quan |
| GĐ3 | Q3/2027 | M10 tối ưu xếp bãi, nối S5 FMS/TOS chạy thật |

### 3.2 Mười phân hệ và chức năng chi tiết

**M1. Danh mục và cấu hình bãi** (GĐ1)
- Sơ đồ bãi số hóa theo khối – hàng – cột – tầng (block/bay/row/tier), vùng chức năng: bãi chờ thông quan, khu kiểm hóa, khu đổi đầu kéo, bãi hàng lạnh có ổ cắm điện (nếu có), bãi rỗng.
- Danh mục: khách hàng (doanh nghiệp xuất nhập khẩu, đại lý hải quan), hãng/chủ container, loại container theo mã ISO 6346 (20GP, 40HC, 45R1…), hãng vận tải, đầu kéo và rơ-moóc, tài xế.
- Quy tắc kiểm tra số container theo chữ số kiểm tra ISO 6346 (phát hiện OCR đọc sai).
- Cấu hình ca làm việc, ngày nghỉ, giờ mở cổng.

**M2. Đặt hẹn và khai báo trước (pre-advice)** (GĐ1 cơ bản, GĐ2 đầy đủ)
- Cổng web cho doanh nghiệp, đại lý: khai báo container sắp vào/ra, số tờ khai, biển số đầu kéo, rơ-moóc, tài xế.
- Đặt khung giờ theo sức chứa từng làn (slot), nhận mã hẹn dạng QR gửi qua SMS hoặc Zalo OA.
- API nhận khai báo hàng loạt từ phía TQ hoặc hãng vận tải (JSON qua HTTPS, có khóa API riêng từng đối tác).
- Đổi, hủy hẹn; phạt hoặc hạ ưu tiên khi lỡ hẹn (cấu hình được, mặc định tắt).

**M3. Bộ luật cổng (gate rules engine)** (GĐ1) — trái tim của bãi
- Với mỗi lượt xe tại làn: đối chiếu biển số đầu kéo + biển số rơ-moóc + số container + số chì niêm phong + lịch hẹn + trạng thái hải quan + kết quả cân.
- Ra quyết định trong dưới 3 giây: **mở barie**, **từ chối** (kèm lý do hiện trên LED), **chuyển kiểm hóa**, hoặc **chờ xử lý tay**.
- Luật cấu hình bằng bảng, không cần sửa mã: ví dụ lệch tải trọng quá 5% so với khai báo thì chuyển kiểm hóa; container có cờ tạm giữ của Hải quan thì không cho ra.
- Màn hình xử lý ngoại lệ cho nhân viên cổng: xem ảnh OCR, sửa tay số đọc sai, ghi lý do (mọi lần sửa tay đều vào nhật ký kiểm toán).
- Chế độ dự phòng khi mất kết nối máy chủ: S2 tại làn giữ danh sách hẹn đã tải trước và cho qua theo luật rút gọn, đồng bộ lại khi có mạng.

**M4. Quản lý tồn bãi** (GĐ1)
- Vị trí từng container theo thời gian thực, trạng thái: đã vào cổng, chờ thông quan, chờ kiểm hóa, đang kiểm hóa, tạm giữ, được phép xuất, đã ra.
- Lịch sử đầy đủ từng container: ai di chuyển, lúc nào, từ đâu đến đâu, ảnh tại cổng.
- Kiểm kê định kỳ: đối chiếu tồn trên hệ thống với kiểm đếm thực tế bằng máy tính bảng.
- Cảnh báo quá thời gian lưu bãi, container nằm sai vùng.

**M5. Lệnh việc cho xe nâng và đầu kéo nội bãi** (GĐ1 cơ bản, GĐ2 đầy đủ)
- Tự sinh lệnh việc khi xe qua cổng: hạ container xuống vị trí X; khi có lệnh xuất: nâng từ vị trí Y lên xe Z.
- Ứng dụng Android trên máy tính bảng gắn xe nâng chụp và trên điện thoại tài xế đầu kéo: nhận lệnh, quét mã container, xác nhận hoàn thành; chạy được khi mất sóng ngắn hạn.
- **Quy trình đổi đầu kéo tại khu chuyển giao**: đầu kéo TQ đưa rơ-moóc đến điểm giao → hệ thống ghi nhận bàn giao (ảnh, giờ, tình trạng chì) → gán đầu kéo VN và tài xế VN → lệnh kéo vào bãi. Chiều xuất làm ngược lại.
- Gợi ý vị trí hạ đơn giản ở GĐ1 (theo vùng và loại container); tối ưu thật để ở M10.

**M6. Hàng đợi và điều hướng** (GĐ1)
- Hàng đợi tại bãi chờ trước cổng, gọi xe theo thứ tự hẹn rồi đến lượt vãng lai.
- Nội dung LED tại làn và bãi chờ: số xe, làn được gọi, lý do từ chối (tiếng Việt và tiếng Trung).
- Hiển thị thời gian chờ ước tính trên cổng web.

**M7. Tính phí và hóa đơn điện tử** (GĐ1 tính phí 0 đồng, GĐ2 hóa đơn thật)
- Biểu phí cấu hình được: lưu bãi theo ngày và loại container, nâng hạ, đổi đầu kéo, cân, dịch vụ kiểm hóa, phí lưu quá hạn.
- Tự tính phí theo sự kiện thật trong M3, M4, M5; công nợ theo khách hàng; thanh toán trước bằng ví tài khoản hoặc chuyển khoản có mã đối soát.
- Nối với nhà cung cấp hóa đơn điện tử chủ đầu tư chọn (ví dụ Viettel, VNPT, MISA) qua API; phát hành hóa đơn theo lượt hoặc gộp theo kỳ.
- Trong vận hành thử, phí tính ở mức 0 đồng (theo phương án L10 của đề xuất).

**M8. Báo cáo, bảng điều khiển phòng điều hành, báo cáo Hải quan** (GĐ2)
- Bảng điều khiển: số lượt qua cổng theo giờ, thời gian trung bình mỗi lượt, tồn bãi theo trạng thái, công suất xe nâng, container quá hạn.
- Báo cáo nhập – xuất – tồn theo mẫu Hải quan yêu cầu đối với địa điểm kiểm tra, giám sát (mẫu cụ thể chờ Cục Hải quan tỉnh cung cấp, xem S3).
- Xuất Excel, PDF; gửi báo cáo tự động theo lịch.

**M9. Phân quyền, bảo mật, nhật ký kiểm toán** (GĐ1 cơ bản, GĐ2 đầy đủ)
- Phân quyền theo vai trò: nhân viên cổng, điều độ bãi, tài xế, kế toán, Hải quan (chỉ xem), Biên phòng (chỉ xem nếu được yêu cầu), quản trị.
- Đăng nhập hai lớp cho quản trị và kế toán; khóa tài khoản khi đăng nhập sai nhiều lần.
- Nhật ký kiểm toán không sửa được cho mọi thao tác thay đổi dữ liệu.
- Dữ liệu lưu tại Việt Nam, mã hóa khi lưu và khi truyền; sao lưu hằng ngày, giữ bản sao ngoài máy chủ chính.
- Hồ sơ phục vụ đánh giá tác động xử lý dữ liệu cá nhân (biển số, ảnh tài xế, số điện thoại) theo Luật Bảo vệ dữ liệu cá nhân 2025.

**M10. Tối ưu xếp bãi** (GĐ3, Q3/2027 — ngoài phạm vi 17/05)
- Gợi ý vị trí hạ tránh đảo chuyển, dựa trên ngày xuất dự kiến và trạng thái thông quan; mô phỏng sức chứa.

### 3.3 Kiến trúc kỹ thuật đề xuất

| Lớp | Đề xuất | Lý do |
|---|---|---|
| Triển khai | Tại chỗ (on-premise) trong phòng điều hành ở bãi; 2 máy chủ ứng dụng + 2 máy chủ cơ sở dữ liệu chạy song song, 1 máy chủ sao lưu | Dữ liệu ở VN, không phụ thuộc đường truyền ra ngoài để cổng chạy |
| Ứng dụng | Kiến trúc mô-đun, giao tiếp qua REST và hàng đợi sự kiện | Cho phép GĐ2, GĐ3 thêm phân hệ không đụng GĐ1 |
| Cơ sở dữ liệu | PostgreSQL (hoặc nền SIVIP đang dùng) | Không mất phí bản quyền |
| Thiết bị tại làn | Máy tính công nghiệp chạy S2, có bộ nhớ đệm khi mất mạng | Cổng không chết khi máy chủ có sự cố |
| Di động | Android (máy tính bảng chống va đập cho xe nâng) | Thiết bị phổ biến, rẻ |
| Môi trường | 3 môi trường: phát triển, kiểm thử (có giả lập thiết bị), chạy thật | Phát triển từ tháng 12 khi chưa có thiết bị thật |

### 3.4 Khối lượng và chi phí (có sản phẩm nền)

| Hạng mục công việc | Người-tháng | Thành tiền (tỷ) |
|---|---|---|
| Phân tích nghiệp vụ, thiết kế tổng thể và chi tiết | 8 | 0,35 |
| M1 Danh mục, sơ đồ bãi | 4 | 0,18 |
| M2 Đặt hẹn, cổng web, API khai báo | 7 | 0,31 |
| M3 Bộ luật cổng, màn hình ngoại lệ | 8 | 0,35 |
| M4 Tồn bãi, kiểm kê | 7 | 0,31 |
| M5 Lệnh việc, ứng dụng Android, quy trình đổi đầu kéo | 9 | 0,40 |
| M6 Hàng đợi, LED | 3 | 0,13 |
| M7 Tính phí, hóa đơn điện tử | 6 | 0,26 |
| M8 Báo cáo, bảng điều khiển, báo cáo Hải quan | 6 | 0,26 |
| M9 Phân quyền, bảo mật, nhật ký | 4 | 0,18 |
| Bộ giả lập thiết bị (OCR, barie, cân) để phát triển trước khi có thiết bị | 3 | 0,13 |
| Kiểm thử chức năng, hiệu năng, bảo mật | 8 | 0,35 |
| Triển khai, vận hành hạ tầng, cơ sở dữ liệu | 3 | 0,13 |
| **Cộng nhân công** | **76** | **3,34** |
| Bản quyền phần mềm hệ thống, công cụ, chứng thư | | 0,36 |
| Quản lý rủi ro, dự phòng nội bộ SIVIP (khoảng 8%) | | 0,30 |
| **Cộng S1** | | **4,00** |

Nếu **không có sản phẩm nền**: khối lượng khoảng 140–150 người-tháng cho riêng S1, tức khoảng 6,5 tỷ, và cần 25–28 người trong 3 tháng đầu. Không khả thi cho demo 25/03 (🔴4).

### 3.5 Tiêu chí nghiệm thu

| Chỉ tiêu | Mức cam kết | Cách đo |
|---|---|---|
| Thời gian hệ thống ra quyết định tại cổng | Dưới 3 giây cho 95% lượt | Nhật ký hệ thống, 2 tuần chạy có tải |
| Tổng thời gian một lượt qua cổng (không ngoại lệ) | Dưới 60 giây | Bấm giờ mẫu 200 lượt |
| Độ chính xác tồn bãi | 100% khớp kiểm kê cuối tuần chạy có tải | Kiểm kê đối chiếu |
| Thời gian hoạt động | 99,5%/tháng (không tính bảo trì có báo trước) | Giám sát hệ thống |
| Chạy dự phòng khi mất máy chủ | Cổng vẫn cho qua theo luật rút gọn ít nhất 4 giờ | Thử ngắt máy chủ có kịch bản |
| Khôi phục sau sự cố | Mất tối đa 15 phút dữ liệu, chạy lại trong 2 giờ | Diễn tập khôi phục |
| Bảo mật | Không còn lỗi mức cao trở lên khi kiểm thử xâm nhập | Báo cáo kiểm thử độc lập |

### 3.6 Rủi ro riêng S1

| Rủi ro | Ảnh hưởng | Phương án |
|---|---|---|
| SIVIP chưa có sản phẩm nền | 🔴4 | Xác nhận trước 07/12; nếu chưa có, VVS tìm sản phẩm bãi trong nước để mua bản quyền và SIVIP chỉ tùy biến |
| Nghiệp vụ Hải quan cho địa điểm giám sát chưa rõ | 🟠3 | Làm việc với Cục Hải quan tỉnh tuần 15/12, lấy mẫu báo cáo và luồng nghiệp vụ |
| Thiết bị thật về muộn sau Tết | 🟠3 | Phát triển trên bộ giả lập từ 04/01; tích hợp thật dồn vào 15/02–28/02 |
| Thay đổi yêu cầu sau khi đóng băng 01/03 | 🟡2 | Thay đổi sau 01/03 chuyển sang GĐ2, trừ lỗi chặn demo |
| Quyền sở hữu mã nguồn | 🟡2 | Chủ đầu tư sở hữu phần viết riêng; SIVIP giữ phần nền và cấp quyền dùng vĩnh viễn; ký thỏa thuận VVS – SIVIP trước khi nộp thầu |

---

## 4. S2 — Phần mềm điều khiển cổng (gate middleware)

### 4.1 Phạm vi
Lớp phần mềm chạy trên máy tính công nghiệp tại mỗi làn, nối các thiết bị với S1.

| Thiết bị | Giao tiếp phổ biến | Việc SIVIP làm |
|---|---|---|
| Camera nhận dạng biển số (đầu kéo, rơ-moóc) | SDK của hãng hoặc luồng video + phần mềm nhận dạng | Nhận kết quả, ảnh; hỗ trợ biển VN và biển TQ (có ký tự chữ Hán đầu biển) |
| Camera đọc số container (gắn cột, theo lựa chọn G3) | SDK hãng | Ghép kết quả từ nhiều góc, kiểm tra chữ số kiểm tra ISO 6346, đọc mã loại |
| Barie tốc độ cao | Bộ điều khiển vào/ra số (I/O) qua TCP hoặc RS485 | Lệnh mở, đóng; chống đóng khi có xe (vòng từ hoặc cảm biến) |
| Cân xe 120 tấn | Đầu cân qua RS232 hoặc TCP | Lấy số cân ổn định, chụp ảnh lúc cân, gắn vào lượt |
| LED điều hướng, loa | TCP hoặc RS485 | Hiện số xe, chỉ dẫn, lý do từ chối (Việt, Trung) |
| Máy in phiếu, đầu đọc QR tại làn | USB hoặc TCP | In phiếu vào bãi, quét mã hẹn |

### 4.2 Chức năng
- Điều phối một lượt xe theo trình tự: xe vào vòng từ → chụp → đọc biển số và container → gửi S1 → nhận quyết định → điều khiển barie, LED → đóng lượt.
- Bộ nhớ đệm khi mất mạng: lưu lượt và ảnh tại chỗ, đồng bộ khi nối lại.
- Bảng điều khiển làn cho nhân viên cổng: ảnh trực tiếp, kết quả đọc, nút mở tay (ghi lý do).
- Giám sát tình trạng thiết bị: camera, barie, cân mất kết nối thì báo về phòng điều hành.

### 4.3 Khối lượng, chi phí, tiến độ
- 8 người-tháng (tái sử dụng khoảng 30%), **0,35 tỷ**, lấy từ C3 và C8.
- 04/01–29/01: viết và chạy trên giả lập. 15/02–26/02: lắp thật, hiệu chỉnh từng làn. 28/02: mở cổng chạy dữ liệu thật.
- Cần từ VVS **trước 21/12**: chốt hãng camera, barie, cân để lấy SDK và tài liệu giao tiếp. Nếu chậm, 🟠3.

### 4.4 Nghiệm thu
- Tỷ lệ đọc đúng tự động: biển số VN từ 97%, biển số TQ từ 95%, số container từ 95% (con số phụ thuộc thiết bị; VVS phải yêu cầu hãng cam kết cùng mức).
- Không có trường hợp barie mở khi S1 chưa cho phép (trừ mở tay có ghi lý do).

### 4.5 Rủi ro
| Rủi ro | Ảnh hưởng | Phương án |
|---|---|---|
| Camera hãng không có SDK mở hoặc SDK chỉ tiếng Trung | 🟠3 | Chọn thiết bị có SDK và tài liệu đầy đủ là điều kiện mua; thử SDK trước khi đặt hàng |
| Biển số TQ, rơ-moóc bẩn, đọc kém ban đêm | 🟡2 | Đèn hồng ngoại, góc lắp đúng khuyến cáo; màn hình sửa tay |
| Chưa rõ xe nào qua cổng: đầu kéo TQ hay đầu kéo VN sau khi đổi | 🟡2 | Chốt sơ đồ khu chuyển giao trước thiết kế chi tiết 14/12 |

---

## 5. S3 — Kết nối hệ thống Hải quan

### 5.1 Phạm vi
Nối S1 với hệ thống của ngành Hải quan để địa điểm được công nhận và hàng được thông quan không phải nhập tay.

- Nhận từ Hải quan: trạng thái tờ khai, quyết định thông quan hoặc giải phóng hàng, yêu cầu kiểm hóa, cờ tạm giữ.
- Gửi Hải quan: thông tin container vào, ra, tồn tại địa điểm; báo cáo định kỳ theo mẫu.
- Chia sẻ hình ảnh camera theo điều kiện địa điểm kiểm tra, giám sát (camera kết nối Hải quan, thời gian lưu hình ảnh).
- Dự phòng: màn hình nhập tay trạng thái thông quan (lựa chọn G7 của đề xuất) dùng từ demo đến khi kết nối chạy thật.

Căn cứ cần rà: Luật Hải quan 2014; Nghị định 68/2016 sửa đổi bởi Nghị định 67/2020 về điều kiện kho, bãi, địa điểm; các thông tư hướng dẫn về hệ thống quản lý, giám sát hải quan tự động tại cảng, kho, bãi. **Chưa đối chiếu văn bản gốc**: tên hệ thống, chuẩn bản tin và thời gian lưu hình ảnh phải lấy từ Cục Hải quan tỉnh và luật sư xác nhận.

### 5.2 Tiến độ (đã áp chỗ sửa số 6: bắt đầu thủ tục từ tháng 1)
| Thời gian | Việc |
|---|---|
| 15/12 | Cùng Bảo Nguyên làm việc với Cục Hải quan tỉnh: xin danh mục điều kiện, tài liệu chuẩn kết nối, đầu mối kỹ thuật |
| 04/01–29/01 | Đăng ký kết nối, xin môi trường thử, chuẩn bị chữ ký số và đường truyền |
| 15/02–12/03 | Viết bộ kết nối, chạy với môi trường thử |
| 15/03–09/04 | Kiểm thử cùng Hải quan; hồ sơ kỹ thuật phần mềm nộp kèm hồ sơ công nhận địa điểm |
| 12/04 | Chạy thật, tắt màn hình nhập tay khi ổn định 2 tuần |

### 5.3 Khối lượng, chi phí
- 11 người-tháng, **0,50 tỷ** (phần SIVIP trong C6). Phần còn lại của C6 (khoảng 0,5 tỷ): đường truyền, chữ ký số, thiết bị đầu cuối do VVS và Viettel lo.

### 5.4 Rủi ro
| Rủi ro | Ảnh hưởng | Phương án |
|---|---|---|
| Hải quan cấp môi trường thử chậm | 🔴4 | Bắt đầu từ tháng 1; dự phòng nhập tay và xin vận hành có cán bộ Hải quan giám sát trực tiếp |
| Bãi đã được công nhận và đã dùng một phần mềm khác để báo cáo Hải quan | 🟡2 | Hỏi Bảo Nguyên tuần này; nếu có, S3 chuyển thành chuyển đổi dữ liệu và thay thế, nhanh hơn |
| Mẫu báo cáo thay đổi theo văn bản mới | 🟡2 | Mẫu báo cáo cấu hình được trong M8 |

---

## 6. S4 — Phần mềm máy chủ trung chuyển dữ liệu xe tự hành (có điều kiện)

### 6.1 Vì sao có điều kiện
Theo chỗ sửa số 4 (D4), hạ tầng xe tự hành (O4) chỉ được kích hoạt khi có văn bản cho phép xe TQ chạy vào bãi (mốc kiểm tra 31/01 hoặc 15/04). VVS giữ giá cố định đến 30/06/2027.

### 6.2 Hai mức
| Mức | Khi nào | Chức năng | Người-tháng | Chi phí (tỷ) |
|---|---|---|---|---|
| Bản demo (Mức B của demo) | Chỉ khi phía TQ đồng ý tham gia demo trước 31/01 | Nhận dữ liệu xe, **giải mã tại VN**, lưu bản sao, ghi nhật ký, chuyển tiếp | 4 | 0,18 |
| Bản O4 (rút gọn trong O4b) | Khi có giấy phép | Thêm bộ lọc (chặn LiDAR, bản đồ HD, video về TQ khi xe ở VN), công tắc ngắt luồng, cảnh báo, báo cáo cho cơ quan chức năng | 13 | 0,57 |

### 6.3 Yêu cầu bắt buộc (từ đánh giá pháp lý PA1)
- Mã hóa **kết thúc tại máy chủ VN** để phía VN đọc và lọc được. Không chấp nhận mã hóa đầu cuối thẳng sang TQ.
- LiDAR và bản đồ HD không chuyển sang TQ.
- Nhật ký mọi luồng dữ liệu ra nước ngoài, lưu tại VN, phục vụ hồ sơ đánh giá tác động chuyển dữ liệu ra nước ngoài.
- Phối hợp với Viettel: SIM khóa vùng, APN riêng (phần mạng không thuộc SIVIP).

### 6.4 Rủi ro
| Rủi ro | Ảnh hưởng | Phương án |
|---|---|---|
| Phía TQ không chịu kết thúc mã hóa tại VN | 🟠3 | Là điều kiện tiên quyết trong thỏa thuận với phía TQ; nếu không, không kích hoạt |
| Xe ghi dữ liệu tại chỗ rồi tải lên khi về TQ | 🟠3 | Ngoài khả năng phần mềm; chặn bằng hợp đồng và quyền kiểm tra xe |
| Chuẩn kết nối Pò Chài thay đổi | 🟡2 | Bộ chuyển đổi tách riêng, đổi không ảnh hưởng S1 |

---

## 7. S5 — Bộ chuyển đổi API với FMS/TOS phía TQ (có điều kiện)

- Mục tiêu: trao đổi kế hoạch chuyến, trạng thái container, thời điểm bàn giao giữa S1 và hệ thống điều hành xe (FMS) và bến bãi (TOS) phía Pò Chài, theo quy chuẩn kết nối bên thứ ba mà Pò Chài đã công bố.
- Không mua nền tảng đám mây Pò Chài, chỉ kết nối API.
- Trước 17/05: môi trường thử. Q3/2027: chạy thật.
- 5 người-tháng, **0,22 tỷ**. Ảnh hưởng nếu thiếu ngày 17/05: 🟢1 (bãi vẫn chạy bằng khai báo trước M2).
- Rủi ro: tài liệu chuẩn kết nối chỉ có tiếng Trung (🟡2) → SIVIP cần một kỹ sư đọc được tiếng Trung hoặc thuê phiên dịch kỹ thuật.

---

## 8. S6 — Tích hợp CCTV và màn hình phòng điều hành

- Gắn mỗi lượt cổng và mỗi lệnh việc với đoạn video tương ứng từ hệ thống quản lý video (VMS) do VVS cung cấp trong C4: bấm vào một container là xem được video lúc vào cổng, lúc hạ bãi.
- Tường màn hình phòng điều hành: bảng điều khiển M8, video trực tiếp, cảnh báo.
- Chia sẻ luồng camera cho Hải quan, và cho Biên phòng nếu được yêu cầu, có phân quyền.
- Tiến độ theo chỗ sửa số 6: **CCTV toàn bãi kéo sớm sang tháng 3**, chạy cùng vận hành thử, thay vì tuần 05/04.
- 3,5 người-tháng, **0,15 tỷ**. Ảnh hưởng nếu thiếu: 🟠3 (Hải quan có thể không công nhận địa điểm nếu camera chưa nối).

---

## 9. S7 — Tích hợp hệ thống, kiểm thử, đào tạo, hồ sơ, hỗ trợ tại chỗ

| Việc | Thời gian | Kết quả bàn giao |
|---|---|---|
| Kế hoạch kiểm thử tổng thể, kịch bản nghiệm thu | 04/01–29/01 | Bộ kịch bản được chủ đầu tư duyệt |
| Tích hợp đầu cuối với thiết bị thật | 15/02–28/02 | Cổng chạy dữ liệu thật 28/02 |
| Vận hành thử vòng 1, vòng 2, diễn tập | 08/03–19/03 | Danh sách lỗi đã sửa |
| Trực kỹ thuật demo | 22/03–26/03 | Demo 25/03 |
| Kiểm thử hiệu năng (gấp 1,5 lần sản lượng thiết kế) và kiểm thử xâm nhập | 29/03–16/04 | Báo cáo kiểm thử |
| Vận hành thử có tải | 19/04–07/05 | Số liệu chỉ tiêu ở mục 3.5 |
| Đào tạo: nhân viên cổng, điều độ, tài xế xe nâng, kế toán, quản trị hệ thống | 08/03–30/04 | 5 khóa, tài liệu tiếng Việt, video hướng dẫn |
| Hồ sơ: thiết kế, hướng dẫn sử dụng, vận hành, mã nguồn phần viết riêng | trước 14/05 | Bộ hồ sơ bàn giao |
| Hỗ trợ tại chỗ sau vận hành | 17/05–11/07 (8 tuần) | 2 kỹ sư thường trực ca ngày, 1 trực từ xa ca đêm |

- 18 người-tháng, **0,80 tỷ** (phần SIVIP trong C5 2,0 tỷ; phần còn lại là VVS tích hợp phần cứng, quản lý dự án).

---

## 10. S8 — Bảo hành và bảo trì phần mềm (đã áp chỗ sửa số 7)

| Nội dung | Cam kết |
|---|---|
| Bảo hành phần mềm | **24 tháng** từ nghiệm thu (phần cứng 12 tháng theo hãng) |
| Mức sự cố 1 (cổng hoặc toàn hệ thống ngừng) | Phản hồi trong 30 phút, xử lý từ xa trong **2 giờ**, có mặt tại chỗ trong **8 giờ** |
| Mức sự cố 2 (một phân hệ lỗi, có cách làm tạm) | Phản hồi 2 giờ, khắc phục trong 1 ngày làm việc |
| Mức sự cố 3 (lỗi nhỏ, yêu cầu chỉnh sửa) | Khắc phục trong bản cập nhật kế tiếp, tối đa 30 ngày |
| Bảo trì năm thứ nhất | Miễn phí, nằm trong bảo hành |
| Bảo trì từ năm thứ hai | **8% giá trị S1 mỗi năm (khoảng 0,32 tỷ)**, cố định trong 3 năm. Thấp hơn mức 10–15% chủ đầu tư phản biện là cao (câu Q13) |
| Bảo đảm cho năm bảo hành thứ hai | Thay tiền giữ lại bằng bảo lãnh bảo hành để không giữ tiền của VVS sang năm 2028 |

Nhân lực SIVIP cần giữ: 1 kỹ sư tại Lạng Sơn (hoặc trong bán kính 8 giờ di chuyển), trực từ xa 24/7 cho sự cố mức 1.

---

## 11. Tiến độ tổng hợp phần SIVIP

| Tuần bắt đầu | Việc SIVIP | Mốc chung |
|---|---|---|
| 30/11 | Bản chạy thử trên sản phẩm nền cho hồ sơ dự thầu | Nộp hồ sơ (giả định) |
| 07/12 | Trình diễn bản chạy thử khi làm rõ hồ sơ | |
| 14/12 | Thiết kế chi tiết (VVS và SIVIP tự bỏ chi phí, mất nếu trượt thầu) | |
| 21/12 | Chốt hãng thiết bị để lấy SDK; ký thỏa thuận VVS – SIVIP | Thư chấp thuận 21/12 |
| 04/01 | Sprint 1: M1, M4, khung M3, bộ giả lập; S3 đăng ký kết nối | Ký 31/12, tạm ứng 07/01 |
| 18/01 | Sprint 2: M2, M3, M5 cơ bản, M6; S2 trên giả lập | |
| 01/02–14/02 | Nghỉ Tết (1 người trực hệ thống phát triển) | |
| 15/02 | Sprint 3: lắp S2 thật, tích hợp đầu cuối; S3 viết bộ kết nối | |
| 28/02 | **Đóng băng mã GĐ1** (trước 01/03) | Mở cổng 28/02 |
| 01/03 | Sửa lỗi GĐ1; nhánh riêng làm GĐ2 (M7, M8, M9); S6 CCTV toàn bãi | Nộp hồ sơ công nhận địa điểm ngay sau mở cổng |
| 15/03 | Vận hành thử vòng 2, diễn tập | |
| 22/03 | Trực kỹ thuật | **Demo 25/03** |
| 29/03 | Hoàn thiện GĐ2; S3 kiểm thử với Hải quan; kiểm thử hiệu năng | |
| 12/04 | GĐ2 xong; S3 chạy thật | |
| 19/04 | Vận hành thử có tải | |
| 29/04 | **Biên bản hệ thống sẵn sàng** (30/04 là ngày lễ) | Cam kết VVS |
| 10/05 | Nghiệm thu, bàn giao hồ sơ, mã nguồn | Nghiệm thu 14/05 |
| 17/05 | Hỗ trợ tại chỗ 8 tuần | **Vận hành thương mại** (phụ thuộc giấy phép) |

---

## 12. Nhân sự SIVIP

| Vai trò | Số người | Giai đoạn |
|---|---|---|
| Quản lý dự án | 1 | Suốt dự án |
| Phân tích nghiệp vụ (có kinh nghiệm cảng, kho bãi, hải quan) | 2 | 12/2026–04/2027 |
| Kiến trúc sư giải pháp | 1 | 12/2026–04/2027 |
| Lập trình máy chủ | 5 | 01–04/2027 |
| Lập trình web | 2 | 01–04/2027 |
| Lập trình di động Android | 1 | 01–03/2027 |
| Kỹ sư tích hợp thiết bị (S2, S6) | 2 | 01–03/2027 |
| Kỹ sư tích hợp Hải quan (S3) | 1 | 01–04/2027 |
| Kiểm thử | 3 | 02–05/2027 |
| Hạ tầng, cơ sở dữ liệu | 1 | 01–05/2027 |
| Kỹ sư hiện trường tại Lạng Sơn | 2 | 15/02–11/07/2027 |
| **Đỉnh** | **khoảng 20** | Tháng 1 và tháng 3/2027 |

Tổng khối lượng phần cam kết: S1 76 + S2 8 + S3 11 + S6 3,5 + S7 18 = **khoảng 117 người-tháng** (đã trừ phần tái sử dụng từ sản phẩm nền).

---

## 13. Thỏa thuận VVS – SIVIP cần ký trước khi nộp thầu

1. **Phạm vi:** đúng 8 hạng mục ở mục 1; danh sách những gì SIVIP không làm.
2. **Giá:** cố định theo báo giá thật; S4, S5 là giá giữ đến 30/06/2027.
3. **Mã nguồn:** chủ đầu tư sở hữu phần viết riêng cho dự án; SIVIP giữ thư viện lõi, cấp quyền dùng vĩnh viễn, không thu thêm phí bản quyền theo số người dùng hay số làn.
4. **Tiến độ và phạt:** SIVIP chịu phạt tương ứng phần mình nếu làm chậm mốc 28/02, 25/03, 29/04 vì lỗi của SIVIP; được gia hạn khi thiết bị, SDK, môi trường thử Hải quan đến muộn.
5. **Thanh toán:** theo cùng tỷ lệ chủ đầu tư trả VVS (40% tạm ứng có bảo lãnh, thu hồi trừ dần).
6. **Nhân sự chủ chốt:** không thay quản lý dự án và kiến trúc sư khi chưa có đồng ý của VVS.
7. **Bảo hành, SLA:** như mục 10, SIVIP chịu trực tiếp.
8. **Bảo mật dữ liệu:** SIVIP không mang dữ liệu thật ra khỏi hệ thống tại bãi; dữ liệu phát triển là dữ liệu giả.

---

## 14. Câu hỏi cần trả lời trước khi chốt giá

| # | Câu hỏi | Hỏi ai | Hạn |
|---|---|---|---|
| 1 | SIVIP đã có phần mềm bãi, cảng hoặc kho làm nền chưa? Dự án tham chiếu nào? | SIVIP | 07/12 |
| 2 | Đơn giá nhân công thật và tỷ lệ tái sử dụng? | SIVIP | 07/12 |
| 3 | Bãi đang dùng phần mềm gì để báo cáo Hải quan (nếu đã được công nhận)? | Bảo Nguyên | Tuần này |
| 4 | Sản lượng dự kiến 2027–2029 để chốt cấu hình máy chủ và chỉ tiêu hiệu năng? | Bảo Nguyên | 07/12 |
| 5 | Hãng camera OCR, barie, cân sẽ mua? | VVS | 21/12 |
| 6 | Biểu phí và nhà cung cấp hóa đơn điện tử chủ đầu tư dùng? | Bảo Nguyên | 31/01 |
| 7 | Phía TQ có tham gia demo Mức B không? | Phía TQ qua Bảo Nguyên | 31/01 |
| 8 | Có cần cổng web và nhãn tiếng Trung cho doanh nghiệp TQ không? | Bảo Nguyên | 21/12 |
