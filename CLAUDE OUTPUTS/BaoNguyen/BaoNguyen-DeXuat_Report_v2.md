# Đề xuất VVS: đưa bãi vào vận hành giữa Quý 2/2027 — bản v2

> Bản v2 · 25/11/2026 · Dành cho liên doanh VVS, giai đoạn đấu thầu.
> Bản này **áp 7 chỗ sửa** ở Phần C của bản "Phản biện đề xuất VVS từ góc nhìn chủ đầu tư" vào bản v1 (artifact 86ezKea7maJHdMUkFyXjUp). Danh sách thay đổi ở cuối tài liệu.
> Mọi chi phí là **ước tính tham khảo, chưa VAT**. VVS phải thay bằng báo giá thật trước khi nộp hồ sơ.

Yêu cầu của chủ đầu tư Bảo Nguyên: đưa vào vận hành trung tuần Quý 2/2027. Tài liệu này dùng **hai mốc cam kết tách riêng**:

| Mốc | Ngày | Ai chịu trách nhiệm |
|---|---|---|
| **Hệ thống sẵn sàng vận hành** | **30/04/2027** (biên bản ký 29/04 vì 30/04 là ngày lễ) | **VVS cam kết** |
| **Vận hành thương mại** | **Thứ Hai 17/05/2027** | Phụ thuộc giấy phép do chủ đầu tư xin (nghiệm thu PCCC, công nhận địa điểm kiểm tra, giám sát hải quan) |

### Thang đánh giá tầm ảnh hưởng

| Mức | Tên | Ý nghĩa với dự án |
|---|---|---|
| 🔴4 | Nghiêm trọng | Không vận hành được ngày 17/05; bị đình chỉ; chi phí vượt trên 20%; VVS lỗ hoặc bị loại thầu |
| 🟠3 | Cao | Vận hành được nhưng thiếu chức năng chính; chậm 2 đến 4 tuần; chi phí tăng 10% đến 20%; bị xử phạt hành chính |
| 🟡2 | Trung bình | Phải chỉnh sửa, chậm dưới 2 tuần, chi phí tăng 3% đến 10% |
| 🟢1 | Thấp | Xử lý trong quá trình vận hành, nằm trong dự trữ |

### Giả định chính (cần anh xác nhận)

- Chủ đầu tư phát hành **thư chấp thuận ngày 21/12/2026** để VVS đặt hàng trước; ký hợp đồng 31/12/2026 (kịch bản cơ sở).
- Phạm vi vận hành 17/05 là cổng và bãi tự động phía Việt Nam, đổi đầu kéo bằng tài xế Việt Nam. Xe tự hành phía Trung Quốc chạy vào Việt Nam là **hạng mục có điều kiện**, phụ thuộc pháp lý (phần IV).
- Quy mô theo **phương án Tối ưu** ở phần III: 2 làn nhập, 2 làn xuất, 1 khu kiểm hóa, 1 khu đổi đầu kéo; thuê xe nâng; mua đầu kéo đã qua sử dụng; hạ tầng xe tự hành để có điều kiện.
- Demo ngày 25/03 được giữ làm mốc vận hành thử trung gian.

---

## I. Giải pháp

Giải pháp được chia theo ba mốc, mỗi mốc chỉ đưa vào những gì kịp làm chắc chắn.

### Phạm vi theo mốc

| Thành phần | Demo 25/03 | Sẵn sàng 30/04, vận hành 17/05 | Sau vận hành (Q3/2027) | Ảnh hưởng nếu thiếu ngày 17/05 |
|---|---|---|---|---|
| Cổng nhập, xuất: biển số, số container, barie, LED | 1 làn nhập, 1 làn xuất | Đủ 2 + 2 làn | — | 🔴4 |
| Phần mềm bãi: luật cổng, tồn bãi, đặt hẹn, hàng đợi, tính phí | Giai đoạn 1 | Giai đoạn 2: thêm báo cáo, phân quyền, hóa đơn thật | Tối ưu xếp bãi | 🔴4 |
| Thông quan | Màn hình nhập tay | Kết nối hệ thống Hải quan | — | 🔴4 (điều kiện công nhận địa điểm) |
| CCTV | Khu cổng; **toàn bãi lắp trong tháng 3** | Toàn bãi, lưu trữ theo yêu cầu Hải quan | — | 🔴4 |
| Cân xe | Tích hợp | Đã kiểm định | — | 🟠3 |
| Đổi đầu kéo | Tài xế VN | Tài xế VN | — | 🟠3 |
| Máy chủ trung chuyển dữ liệu xe tự hành | Chỉ khi demo Mức B (bản rút gọn) | **Có điều kiện**: chỉ khi có giấy phép | Bản đầy đủ nếu được kích hoạt | 🟢1 (bãi không cần khi chưa có xe tự hành) |
| Mạng Viettel 4G/5G, APN riêng, SIM khóa vùng | Khu demo | Toàn khu (phần cho bãi); phần cho xe tự hành có điều kiện | — | 🟡2 |
| Xe tự hành TQ chạy vào VN | Nếu được chấp thuận | Thí điểm nếu có giấy phép | Mở rộng | 🟡2 (bãi vẫn vận hành bằng tài xế) |
| Kết nối API với FMS/TOS phía TQ | Không | Môi trường thử | Chạy thật | 🟢1 |

### Lựa chọn giải pháp do tiến độ quyết định

| # | Lựa chọn | Vì tiến độ nên chọn | Phương án bị loại | Ảnh hưởng nếu chọn sai |
|---|---|---|---|---|
| G1 | VVS là đầu mối tích hợp duy nhất | Một người chịu trách nhiệm tiến độ toàn bộ | Mỗi gói một nhà thầu | 🔴4 |
| G2 | Phần mềm SIVIP làm theo giai đoạn, phát triển trên giả lập từ tháng 12, **trên sản phẩm nền có sẵn** | Không chờ cổng lắp xong mới viết phần mềm | Mua phần mềm nước ngoài: mất 2 đến 3 tháng bản địa hóa | 🔴4 |
| G3 | Camera nhận dạng gắn cột | Giao 3 đến 4 tuần | Khung cổng OCR trọn bộ: giao 8 đến 12 tuần | 🟠3 |
| G4 | Thuê mạng Viettel | Viettel triển khai trong 6 đến 8 tuần | Tự đầu tư 5G riêng: cần cấp phép tần số riêng, lâu hơn nhiều | 🟠3 |
| G5 | Cân tĩnh | Kiểm định nhanh | Cân động | 🟡2 |
| G6 | Đổi đầu kéo bằng tài xế VN ngay từ ngày vận hành | Bãi không phụ thuộc giấy phép xe tự hành | Chờ xe tự hành được phép rồi mới vận hành | 🔴4 |
| G7 | Nhập tay trạng thái thông quan làm phương án dự phòng | Vẫn vận hành được nếu kết nối Hải quan chậm | Chỉ dựa vào kết nối tự động | 🟠3 |
| **G8** | **Đặt hàng bằng thư chấp thuận 21/12; ưu tiên thiết bị có sẵn tại kho nhà phân phối ở VN** | Hàng không kẹt Tết bên Trung Quốc | Đặt hàng sau khi ký và nhận tạm ứng | 🔴4 |

Chi tiết phần mềm và tích hợp của SIVIP: xem `BaoNguyen-SIVIP_Report_v1.md`.

---

## II. Tiến độ thực hiện

### Mua sắm vượt kỳ nghỉ Tết (mới, chỗ sửa 1)

Nhà máy Trung Quốc nghỉ Tết từ cuối tháng 1, vận chuyển ngừng trước đó 1 đến 2 tuần; công nhân Việt Nam thường chỉ đủ quân sau Rằm tháng Giêng (khoảng 20/02/2027). Nếu đặt hàng sau khi ký 31/12 và nhận tạm ứng 07/01, hàng giao 3 đến 4 tuần sẽ ra khỏi nhà máy khoảng 28/01 đến 04/02 và có thể kẹt đến 25/02–05/03. VVS xử lý bằng 4 việc:

1. **Đặt hàng bằng thư chấp thuận trước khi ký:** chủ đầu tư phát hành thư ngay khi có kết quả (mục tiêu 21/12), VVS đặt cọc nhỏ có điều kiện hoàn lại.
2. **Ưu tiên thiết bị có sẵn tại kho nhà phân phối ở Việt Nam** (camera, barie, LED, CCTV, máy chủ). Chỉ đặt từ Trung Quốc những thứ không có hàng sẵn.
3. **Làm hết phần xây lắp, cột, ống cáp, tủ điện trước Tết.** Sau Tết chỉ còn gắn thiết bị và hiệu chỉnh.
4. **Đội lắp đặt chính của VVS trực lại tại công trường từ 15/02**, có phụ cấp Tết.

Ảnh hưởng sau khi xử lý: 🔴4 xuống 🟡2.

### Giai đoạn

| Giai đoạn | Thời gian | Kết quả cuối giai đoạn | Ảnh hưởng nếu chậm |
|---|---|---|---|
| 0. Đấu thầu, thương thảo | 23/11 – 31/12 | Thư chấp thuận 21/12, đặt hàng thiết bị; hợp đồng ký 31/12 | 🔴4 |
| 1. Thiết kế, xây lắp, mua sắm | 04/01 – 31/01 | **Toàn bộ xây lắp, cột, ống cáp, tủ điện xong**; thiết bị về công trường | 🔴4 |
| Tết | 01/02 – 14/02 | — | — |
| 2. Lắp đặt, mở cổng | 15/02 – 28/02 | Cổng chạy trên dữ liệu thật | 🔴4 |
| 3. Tích hợp, vận hành thử nội bộ, CCTV toàn bãi, demo | 01/03 – 31/03 | Demo 25/03; CCTV toàn bãi chạy; danh sách lỗi đã sửa | 🟠3 |
| 4. Hoàn thiện, vận hành thử có tải | 01/04 – 29/04 | **Biên bản hệ thống sẵn sàng 29/04 (VVS cam kết)** | 🔴4 |
| 4b. Pháp lý (chủ đầu tư, chạy song song) | 12/2026 – 07/05 | Nghiệm thu PCCC, quyết định công nhận địa điểm hải quan | 🔴4 |
| 5. Nghiệm thu, bàn giao | 10/05 – 14/05 | Biên bản nghiệm thu đưa vào sử dụng | 🔴4 |
| 6. Vận hành thương mại | Từ 17/05 (khi có giấy phép) | VVS trực hỗ trợ tại chỗ 8 tuần | — |

### Lịch theo tuần

Cột "Pháp lý" chạy song song từ tuần đầu, vì các thủ tục này mất 1 đến 3 tháng và không rút ngắn được bằng tăng ca.

| Tuần | Từ | Kỹ thuật, thi công | Pháp lý, thủ tục | Mốc | Ảnh hưởng nếu chậm |
|---|---|---|---|---|---|
| 1 | 23/11 | Khảo sát hiện trạng, chốt giải pháp, xin báo giá giữ giá 60 ngày **kèm thời gian giao trước Tết, ưu tiên hàng có sẵn tại VN** | **Hỏi Bảo Nguyên tình trạng pháp lý hiện tại của bãi** (quyết định công nhận địa điểm, giấy phép xây dựng, PCCC); rà soát pháp lý dự án | — | 🟡2 |
| 2 | 30/11 | Hoàn thiện hồ sơ dự thầu; bắt đầu phần mềm chạy thử | — | Nộp hồ sơ (giả định) | 🔴4 |
| 3 | 07/12 | Làm rõ hồ sơ, trình diễn bản chạy thử | Làm việc lần đầu với cơ quan chức năng về dữ liệu và xe tự hành | — | 🟡2 |
| 4 | 14/12 | Thiết kế chi tiết (VVS tự bỏ chi phí) | Nộp hồ sơ thẩm duyệt thiết kế PCCC (chủ đầu tư); làm việc với Cục Hải quan tỉnh lấy danh mục điều kiện | — | 🟠3 |
| 5 | 21/12 | Thương thảo hợp đồng; **đặt hàng bằng thư chấp thuận, đặt cọc có điều kiện hoàn lại; chốt đơn hàng nhà máy TQ** | Hồ sơ kỹ thuật kiểm soát dữ liệu | **Thư chấp thuận 21/12** | 🔴4 |
| 6 | 28/12 | Ký hợp đồng, bảo lãnh, tạm ứng; đặt hàng phần thiết bị còn lại | — | Ký 31/12 | 🔴4 |
| 7 | 04/01 | Nhận mặt bằng; móng cổng, cáp, điện; phần mềm trên giả lập | Xin cấp phép tần số, hợp quy cho thiết bị vô tuyến; **đăng ký kết nối hệ thống Hải quan, xin môi trường thử** | Tạm ứng chậm nhất 07/01 | 🔴4 |
| 8 | 11/01 | Làn xe, móng cân, khu kiểm hóa; **cột camera, ống cáp CCTV toàn bãi** | Hải quan duyệt quy trình cổng, kiểm hóa | — | 🟠3 |
| 9 | 18/01 | Hoàn thiện xây lắp, **tủ điện, cột**; nhận thiết bị có sẵn tại VN | Đánh giá tác động xử lý dữ liệu cá nhân | — | 🟠3 |
| 10 | 25/01 | Thiết bị TQ về; lắp cột camera, barie; **nghiệm thu xây lắp trước Tết** | Thỏa thuận demo với phía TQ; chấp thuận BQL KKT | Thiết bị về | 🔴4 |
| 11–12 | 01/02 | Tết | — | — | — |
| 13 | 15/02 | **Đội VVS trực lại từ 15/02**; lắp, hiệu chỉnh camera, cân; tăng ca | — | — | 🔴4 |
| 14 | 22/02 | Nối phần mềm với thiết bị; mạng Viettel sẵn sàng | — | Mở cổng 28/02 | 🔴4 |
| 15 | 01/03 | Chạy dữ liệu thật, sửa lỗi; **lắp CCTV toàn bãi** | **Nộp hồ sơ công nhận địa điểm kiểm tra, giám sát hải quan ngay sau mở cổng** (nếu bãi chưa được công nhận); kiểm định cân | — | 🔴4 |
| 16 | 08/03 | Vận hành thử vòng 1; đào tạo; **CCTV toàn bãi chạy cùng vận hành thử** | Mời Cảnh sát PCCC kiểm tra giữa kỳ | — | 🟠3 |
| 17 | 15/03 | Vận hành thử vòng 2; diễn tập; **lưu trữ CCTV dài hạn** | **Mời Hải quan kiểm tra sơ bộ địa điểm** | — | 🟠3 |
| 18 | 22/03 | Trực kỹ thuật | — | Demo 25/03 | 🟠3 |
| 19 | 29/03 | Sửa lỗi sau demo; bắt đầu giai đoạn 2 phần mềm | — | — | 🟡2 |
| 20 | 05/04 | **Kết nối hệ thống Hải quan chạy thử với Hải quan** | — | — | 🔴4 |
| 21 | 12/04 | Hoàn thiện phần mềm giai đoạn 2; kết nối Hải quan chạy thật | Nghiệm thu PCCC (hẹn tuần này, mục tiêu 16/04) | — | 🔴4 |
| 22 | 19/04 | Vận hành thử có tải: hàng thật, nhân viên Bảo Nguyên vận hành | Hải quan kiểm tra thực tế địa điểm | — | 🔴4 |
| 23 | 26/04 | Vận hành thử có tải (nghỉ 30/4, 1/5) | — | **Hệ thống sẵn sàng: biên bản 29/04** | 🔴4 |
| 24 | 03/05 | Chốt lỗi tồn đọng, hoàn công | Quyết định công nhận địa điểm hải quan | — | 🔴4 |
| 25 | 10/05 | Nghiệm thu, bàn giao, hồ sơ vận hành | Biểu phí dịch vụ niêm yết | Nghiệm thu 14/05 | 🔴4 |
| 26 | 17/05 | Hỗ trợ tại chỗ | — | Vận hành thương mại 17/05 | — |

### Đường găng

Đường găng tới ngày vận hành có hai nhánh chạy song song:

1. **Nhánh kỹ thuật (VVS chịu trách nhiệm, mốc 30/04):** thư chấp thuận 21/12 → xây lắp xong trước Tết → mở cổng 28/02 → CCTV toàn bãi tháng 3 → kết nối Hải quan tháng 4 → vận hành thử có tải 19/04 → hệ thống sẵn sàng 29/04. Dự trữ khoảng 2 tuần đến 17/05.
2. **Nhánh pháp lý (chủ đầu tư chịu trách nhiệm, mốc 17/05):** thẩm duyệt PCCC tháng 12 → nghiệm thu PCCC tháng 4; công nhận địa điểm hải quan. Nhánh này có hai kịch bản tùy tình trạng pháp lý hiện tại của bãi:

| Kịch bản | Điều kiện | Cách làm | Ảnh hưởng còn lại |
|---|---|---|---|
| A. Bãi đã được công nhận | Bãi đang nhận hàng có Hải quan Tân Thanh làm thủ tục (đã có 71 chuyến xe không người lái thử nghiệm từ Pò Chài) và đã có quyết định công nhận | Đổi thành thủ tục **điều chỉnh, mở rộng** địa điểm; rút ngắn khoảng 4 tuần | 🟡2 |
| B. Bãi chưa được công nhận | Phải xin công nhận mới | Nộp hồ sơ **ngay sau mở cổng 28/02** (thay vì 08/03); mời Hải quan kiểm tra sơ bộ trong tháng 3; dự phòng xin vận hành có cán bộ Hải quan giám sát trực tiếp | 🟠3 |

Trong hợp đồng, hai mốc được tách: VVS cam kết **hệ thống sẵn sàng 30/04**; **ngày vận hành thương mại 17/05 phụ thuộc giấy phép do chủ đầu tư xin**. VVS không chịu phạt nếu 17/05 lùi vì giấy phép.

---

## III. Giải trình chi phí và lộ trình chi phí

Lưu ý: tài liệu dự án chưa có đơn giá hay khối lượng thiết kế. Mọi con số dưới đây là ước tính tham khảo theo mặt bằng giá Việt Nam, chưa gồm VAT. Giá nộp thầu sẽ là **giá cố định từ báo giá thật**; các khoảng ở đây chỉ để chủ đầu tư chọn phương án.

Vì sao bản đầu tiên chênh 34 – 76 tỷ: gộp chung các quyết định chưa chốt vào một khoảng. Riêng xe nâng (thuê hay mua, 1 hay 2 chiếc) đã lệch 16 tỷ, đầu kéo lệch 4 tỷ, số làn cổng lệch 3 tỷ. Bản này tách ra: phần bắt buộc có một con số, sai số ±15%; các quyết định còn lại thành lựa chọn có giá riêng.

### 1. Phần bắt buộc để vận hành

Không có phần này thì bãi không được công nhận và không vận hành được. Tính với 1 làn nhập, 1 làn xuất.

| # | Hạng mục | Bên thực hiện | Ước tính (tỷ đồng) | Ảnh hưởng nếu cắt |
|---|---|---|---|---|
| C1 | Xây lắp: làn xe, đảo cổng, móng cân, khu kiểm hóa, điện, chiếu sáng; **gồm ống cáp và chỗ chờ cho máy chủ, trạm RTK của hạng mục xe tự hành** | VVS | 5,5 | 🔴4 |
| C2 | Phần mềm bãi giai đoạn 1 và 2 | VVS (SIVIP) | 4,0 | 🔴4 |
| C3 | Cổng thông minh 1 làn nhập, 1 làn xuất, camera gắn cột | VVS | 2,2 | 🔴4 |
| C4 | CCTV toàn bãi, lưu trữ theo yêu cầu Hải quan | VVS | 2,0 | 🔴4 |
| C5 | Tích hợp, vận hành thử, đào tạo, hồ sơ | VVS | 2,0 | 🟠3 |
| C6 | Kết nối hệ thống Hải quan | VVS | 1,0 | 🔴4 |
| C7 | Mạng nội bộ, cáp quang, 4G | VVS | 1,0 | 🟠3 |
| C8 | Cân xe 120 tấn | VVS | 0,9 | 🟠3 |
| C9 | Phòng điều hành | VVS | 0,8 | 🟠3 |
| | **Cộng gói VVS bắt buộc** | | **19,4** | |
| C10 | Tư vấn thiết kế, thẩm tra, giám sát | Chủ đầu tư | 1,2 | 🔴4 |
| C11 | Thủ tục PCCC, môi trường, tư vấn luật | Chủ đầu tư | 0,9 | 🔴4 |
| C12 | Nhân sự vận hành trước ngày vận hành | Chủ đầu tư | 0,8 | 🟠3 |
| C13 | Bảo hiểm công trình | Chủ đầu tư | 0,2 | 🟡2 |
| | Dự phòng 10% | | 2,3 | |
| | **Tổng phần bắt buộc** | | **24,8 (21,1 – 28,5)** | |

### 2. Các lựa chọn của chủ đầu tư

Mỗi nhóm chọn một phương án. "Đầu tư" là tiền bỏ ra trước ngày vận hành; "Chi phí hằng năm" là tiền thuê hoặc dịch vụ sau đó.

| Nhóm | Phương án | Đầu tư (tỷ) | Chi phí hằng năm (tỷ) | Tổng 3 năm (tỷ) | Đánh đổi |
|---|---|---|---|---|---|
| O1. Xe nâng chụp container (bắt buộc có, chọn cách có) | **a. Thuê 1 chiếc (đề xuất)** | 0 | 1,8 | **5,4** | Rẻ nhất trong 3 năm; hợp đồng thuê ghi rõ xe thay thế trong 24 giờ; hòa vốn so với mua sau khoảng 4 năm |
| | b. Mua 1 chiếc hãng Trung Quốc | 7,5 | 0,3 (bảo trì) | 8,4 | Giao 8 đến 12 tuần, phải đặt trong tháng 1 |
| | c. Mua 1 chiếc hãng châu Âu | 11,5 | 0,3 | 12,4 | Giao lâu hơn, có thể không kịp 17/05 |
| O2. Đầu kéo cho khu đổi đầu kéo (4 bộ) | a. Thuê dịch vụ vận chuyển nội bãi | 0 | 2,0 | 6,0 | Phụ thuộc bên thứ ba |
| | **b. Mua 4 đầu kéo đã qua sử dụng, kèm rơ-moóc (đề xuất)** | 4,0 | 0,4 | **5,2** | Rẻ nhất trong 3 năm; chi phí sửa chữa cao hơn xe mới |
| | c. Mua 4 đầu kéo mới, kèm rơ-moóc | 8,0 | 0,2 | 8,6 | |
| O3. Số làn cổng | a. 1 nhập, 1 xuất (đã có trong phần bắt buộc) | 0 | 0 | 0 | Một làn hỏng là tắc cổng |
| | **b. 2 nhập, 2 xuất (đề xuất)** | 3,0 | 0,1 | **3,3** | Có làn dự phòng, đủ cho sau này |
| O4. Hạ tầng cho xe tự hành (máy chủ trung chuyển, RTK, APN, 5G) | **a. Chưa làm trước 17/05; hạng mục có điều kiện (đề xuất)** | 0 | 0 | 0 | Xem mục 2a |
| | b. Bản rút gọn: máy chủ trung chuyển, RTK, APN và SIM khóa vùng | 1,7 | 0,8 | 4,1 | Đủ để thí điểm |
| | c. Bản đầy đủ: thêm sao lưu, trạm 5G riêng | 3,8 | 1,5 | 8,3 | Đủ cho vận hành lâu dài |

Xe nâng thứ hai không đưa vào đây. Nên quyết định sau 3 đến 6 tháng vận hành, khi có số chuyến thực tế.

### 2a. Hạ tầng xe tự hành là hạng mục có điều kiện (mới, chỗ sửa 4)

Giấy phép cho xe tự hành TQ chạy vào Việt Nam ước tính mất 3 đến 24 tháng. Chủ đầu tư không nên trả tiền cho thứ chưa dùng được, nên O4 được xử lý như sau:

- VVS **báo giá cố định** cho O4b (1,7 tỷ) và O4c (3,8 tỷ), **giữ giá đến 30/06/2027**.
- Chủ đầu tư **chỉ kích hoạt khi có văn bản cho phép** xe tự hành chạy vào bãi. Mốc kiểm tra: **31/01/2027** và **15/04/2027**. Nếu kích hoạt sau 30/06/2027, giá được điều chỉnh theo báo giá mới.
- **Phần làm luôn trong xây lắp** (đã gồm trong C1): đi ống cáp, chừa chỗ cho máy chủ và trạm RTK, vì chi phí nhỏ và tránh phải đào lại.
- Demo Mức B (xe tự hành TQ đến khu đổi đầu kéo) chỉ chạy nếu phía TQ và cơ quan chức năng đồng ý trước 31/01. Nếu không, demo ở Mức A, giữ nguyên ngày 25/03.

### 3. Bốn phương án trọn gói để chủ đầu tư chọn (chỗ sửa 3)

| | Tiết kiệm | **Tối ưu (đề xuất)** | Cân bằng | Đầy đủ |
|---|---|---|---|---|
| Phần bắt buộc | 24,8 | 24,8 | 24,8 | 24,8 |
| O1. Xe nâng | a. Thuê | **a. Thuê** | b. Mua hãng TQ: 7,5 | c. Mua hãng châu Âu: 11,5 |
| O2. Đầu kéo | a. Thuê | **b. Mua xe đã qua sử dụng: 4,0** | b. Mua xe đã qua sử dụng: 4,0 | c. Mua mới: 8,0 |
| O3. Làn cổng | a. 1 + 1 | **b. 2 + 2: 3,0** | b. 2 + 2: 3,0 | b. 2 + 2: 3,0 |
| O4. Hạ tầng xe tự hành | a. Chưa làm | **a. Có điều kiện (giữ giá)** | b. Rút gọn: 1,7 | c. Đầy đủ: 3,8 |
| **Đầu tư trước 17/05** | 24,8 (21,1 – 28,5) | **31,8 (27,0 – 36,6)** | 41,0 (34,9 – 47,2) | 51,1 (43,4 – 58,8) |
| Chi phí thuê, dịch vụ hằng năm | 3,8 | **2,3** | 1,6 | 2,1 |
| **Tổng 3 năm đầu** (đầu tư cộng 3 năm chi phí) | 36,2 | **38,7** | 45,8 | 57,4 |
| Có làn dự phòng | Không | **Có** | Có | Có |
| Ảnh hưởng đến dự án | 🟠3: không làn dự phòng, không thí điểm xe tự hành, phụ thuộc bên cho thuê | **🟢1** | 🟢1, nhưng trả trước 1,7 tỷ cho hạ tầng chưa dùng được | 🟡2: xe nâng châu Âu có thể không kịp 17/05 |

**Đề xuất: phương án Tối ưu, khoảng 31,8 tỷ đồng (27,0 – 36,6 tỷ).** Tối ưu chỉ đắt hơn Tiết kiệm **2,5 tỷ trong 3 năm** nhưng có làn dự phòng; rẻ hơn Cân bằng **7,1 tỷ trong 3 năm** (và ít hơn 9,2 tỷ vốn bỏ ra trước 17/05). Mỗi nhóm trong Tối ưu là phương án rẻ nhất trong 3 năm của nhóm đó, trừ O3 là chọn có chủ đích để có làn dự phòng.

### 4. Chi phí của nhà thầu VVS

Giá trị gói VVS theo phương án Tối ưu: 19,4 bắt buộc, cộng dự phòng 10% (1,9), cộng O3b (3,0), **khoảng 24,3 tỷ đồng**. Nếu O4 được kích hoạt, cộng thêm giá đã giữ (1,7 hoặc 3,8 tỷ).

| Khoản | Ước tính | Thời điểm | Ghi chú | Ảnh hưởng |
|---|---|---|---|---|
| Chi phí dự thầu: khảo sát, thiết kế sơ bộ, bản chạy thử | 0,3 – 0,8 tỷ | Tháng 11 đến 12 | Mất nếu trượt thầu | 🟡2 |
| **Đặt cọc thiết bị theo thư chấp thuận** | Khoảng 5–10% giá thiết bị nhập | Từ 21/12 | Có điều kiện hoàn lại nếu không ký | 🟡2 |
| Bảo lãnh dự thầu | Thường 1% đến 3% giá gói | Khi nộp hồ sơ | Theo hồ sơ mời thầu | 🟢1 |
| Bảo lãnh thực hiện hợp đồng | Thường 2% đến 10% giá hợp đồng | Khi ký | | 🟡2 |
| Bảo lãnh tạm ứng | Bằng 100% số tiền tạm ứng (khoảng 9,7 tỷ), giảm dần | Khi nhận tạm ứng | Xem mục 6a | 🟡2 |
| Vốn lưu động đệm giữa đặt hàng và thanh toán | Khoảng 30% đến 40% giá trị thiết bị | Tháng 1 đến 3 | Thiết bị nhập thường trả trước 30% đến 50% | 🟠3 |
| Chi phí làm gấp: tăng ca, phụ cấp Tết cho đội trực từ 15/02, vận chuyển nhanh | 5% đến 10% giá gói nếu ký sau 31/12 | Tháng 2 đến 3 | Đưa điều khoản điều chỉnh vào hợp đồng | 🟡2 |
| Tiền giữ lại bảo hành | 5% (khoảng 1,2 tỷ) | 12 tháng sau nghiệm thu | Năm bảo hành thứ hai của phần mềm dùng bảo lãnh bảo hành, không giữ tiền | 🟢1 |
| Phạt chậm tiến độ | Theo hợp đồng | Nếu trễ mốc 30/04 vì lỗi VVS | Chỉ loại trừ danh sách đóng: giao mặt bằng, tạm ứng, giấy phép nhà nước, dữ liệu và xe phía TQ | 🔴4 |

### 5. Chi phí của các bên liên quan

| Bên | Chi phí họ tự chịu | Chi phí có thể chuyển sang chủ đầu tư | Ảnh hưởng |
|---|---|---|---|
| Đơn vị vận hành cửa khẩu thông minh phía TQ | Xe tự hành, nền tảng FMS/TOS, mạng phía TQ | Phí kết nối, phí nền tảng, phí giám sát an toàn khi xe chạy tại VN (chỉ phát sinh khi O4 được kích hoạt) | 🟠3 |
| Viettel | Trạm phát nếu đầu tư đổi lấy hợp đồng thuê dài hạn | Thuê bao, APN, SIM (tính trong C7 cho bãi; trong O4 cho xe tự hành) | 🟡2 |
| Hải quan Việt Nam | Nhân sự, hệ thống của ngành | Thiết bị, đường truyền, phòng làm việc tại địa điểm (đã tính trong C4, C6) | 🟠3 |
| Biên phòng | Nhân sự | Phòng trực, chia sẻ camera nếu được yêu cầu | 🟢1 |

### 6. Lộ trình dòng tiền đề xuất (phương án Tối ưu)

Tỷ lệ thanh toán gói VVS (24,3 tỷ): **tạm ứng 40%**, thực nhận đợt 1 **20%**, đợt 2 **15%**, đợt nghiệm thu **20%**, bảo hành **5%**.

| Thời điểm | Chủ đầu tư trả VVS (thực nhận, tỷ) | Điều kiện | Chủ đầu tư chi ngoài gói VVS (tỷ) | Chủ đầu tư chi trong tháng (tỷ) |
|---|---|---|---|---|
| 12/2026 | — | Thư chấp thuận 21/12 | Tư vấn thiết kế, PCCC, pháp lý: 1,0 | 1,0 |
| 01/2027 | **Tạm ứng 40%: 9,7** | Ký hợp đồng, có bảo lãnh tạm ứng 100%; trả chậm nhất 07/01 | Bảo hiểm công trình: 0,2 | 9,9 |
| 02/2027 | **Đợt 1, thực nhận 20%: 4,9** | Thiết bị về, xây lắp xong | — | 4,9 |
| 03/2027 | **Đợt 2, thực nhận 15%: 3,6** | Mở cổng, demo | Mua 4 đầu kéo đã qua sử dụng: 4,0; tuyển nhân sự: 0,3 | 7,9 |
| 04/2027 | — | — | Nhân sự: 0,3; tư vấn giám sát: 0,5; ký hợp đồng thuê xe nâng | 0,8 |
| 05/2027 | **Nghiệm thu, thực nhận 20%: 4,9** | Nghiệm thu đưa vào sử dụng | Nhân sự: 0,2; tư vấn còn lại: 0,6 | 5,7 |
| 05/2028 | **Bảo hành 5%: 1,2** | Hết 12 tháng bảo hành phần cứng | — | 1,2 |
| | **Cộng gói VVS: 24,3** | | **Cộng ngoài gói: 7,1** (+ dự phòng của chủ đầu tư 0,4) | **Tổng đầu tư: 31,8** |

Chủ đầu tư chi nhiều nhất trong tháng 1 (khoảng 9,9 tỷ) và tháng 3/2027 (khoảng 7,9 tỷ). Tiền thuê xe nâng (1,8 tỷ/năm) bắt đầu từ khi nhận xe, nằm trong chi phí hằng năm.

### 6a. Cơ chế thu hồi tạm ứng (mới, chỗ sửa 5)

Tạm ứng 40% là cần thiết vì thiết bị nhập chiếm khoảng một nửa gói và phải trả trước 30% đến 50%. Chủ đầu tư không chịu rủi ro mất tiền nhờ 3 cơ chế:

1. **Bảo lãnh ngân hàng 100% số tiền tạm ứng** VVS nộp trước khi nhận tạm ứng.
2. **Thu hồi trừ dần**: mỗi đợt thanh toán khấu trừ 42,1% giá trị đợt cho đến khi thu hồi đủ 40%.
3. **Bảo lãnh tạm ứng giảm tương ứng** với số đã thu hồi, hết hiệu lực khi thu hồi xong.

| Đợt | Giá trị đợt theo khối lượng (% gói · tỷ) | Khấu trừ tạm ứng (tỷ) | VVS thực nhận (tỷ) | Bảo lãnh tạm ứng còn lại (tỷ) |
|---|---|---|---|---|
| Tạm ứng | — | — | 9,7 | 9,7 |
| Đợt 1 (thiết bị về, xây lắp xong) | 34,5% · 8,4 | 3,5 | 4,9 | 6,2 |
| Đợt 2 (mở cổng, demo) | 26,0% · 6,3 | 2,7 | 3,6 | 3,5 |
| Đợt 3 (nghiệm thu) | 34,5% · 8,4 | 3,5 | 4,9 | 0 |
| Bảo hành | 5,0% · 1,2 | — | 1,2 | — |
| **Cộng** | **100% · 24,3** | **9,7** | **24,3** | |

Tạm ứng chậm bao nhiêu ngày thì mốc tiến độ lùi bấy nhiêu ngày.

### 7. Bảo hành và mức dịch vụ (mới, chỗ sửa 7)

| Nội dung | Cam kết |
|---|---|
| Bảo hành phần cứng | 12 tháng theo hãng |
| **Bảo hành phần mềm** | **24 tháng** từ nghiệm thu |
| Sự cố nghiêm trọng (cổng hoặc toàn hệ thống ngừng) | Xử lý từ xa trong **2 giờ**, có mặt tại chỗ trong **8 giờ** |
| Sự cố một phân hệ, có cách làm tạm | Khắc phục trong 1 ngày làm việc |
| Bảo trì phần mềm năm thứ nhất | Miễn phí, nằm trong bảo hành |
| Bảo trì phần mềm từ năm thứ hai | Mức phí cố định trong 3 năm, đề xuất 8% giá trị phần mềm mỗi năm (khoảng 0,32 tỷ) |
| Hỗ trợ tại chỗ sau vận hành | 8 tuần từ 17/05 |

---

## IV. Các rủi ro pháp lý cần chú ý

Tên văn bản dưới đây là để định hướng rà soát. Chưa đối chiếu văn bản gốc và các bản sửa đổi mới nhất, nên cần luật sư xác nhận trước khi dùng trong hồ sơ. VVS sẽ nộp kèm ý kiến rà soát của luật sư.

| # | Rủi ro | Cơ sở pháp lý cần rà soát | Ai chịu ảnh hưởng | Ảnh hưởng |
|---|---|---|---|---|
| L1 | Bãi chưa được công nhận (hoặc chưa được điều chỉnh, mở rộng) là địa điểm kiểm tra, giám sát hải quan trước 17/05 | Luật Hải quan 2014; Nghị định 68/2016 và Nghị định 67/2020 về điều kiện kho, bãi, địa điểm | Chủ đầu tư, VVS | 🔴4 |
| L2 | Chưa nghiệm thu PCCC thì không được đưa công trình vào sử dụng | Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ 2024 và nghị định hướng dẫn | Chủ đầu tư | 🔴4 |
| L3 | Xe tự hành không người lái chạy trên đất Việt Nam chưa có khung pháp lý đầy đủ | Luật Trật tự, an toàn giao thông đường bộ 2024; Luật Đường bộ 2024; Hiệp định và Nghị định thư vận tải đường bộ Việt – Trung; cơ chế thử nghiệm có kiểm soát | Chủ đầu tư, phía TQ | 🟠3 (bãi vẫn chạy bằng tài xế) |
| L4 | Chuyển dữ liệu ra nước ngoài: video, biển số, hình ảnh tài xế là dữ liệu cá nhân; dữ liệu khu biên giới có thể là dữ liệu quan trọng, cốt lõi | Luật Dữ liệu 2024; Luật Bảo vệ dữ liệu cá nhân 2025 và nghị định hướng dẫn; Luật An ninh mạng | Chủ đầu tư, VVS | 🟠3 |
| L5 | Thiết bị vô tuyến (5G, RTK, V2X, RSU) nhập từ TQ chưa hợp quy, chưa có giấy phép tần số | Luật Tần số vô tuyến điện; quy định chứng nhận, công bố hợp quy | VVS, phía TQ | 🟡2 |
| L6 | Hoạt động trong khu vực biên giới: nhân sự TQ sang hỗ trợ, camera hướng ra đường biên | Luật Biên phòng Việt Nam 2020; quy chế khu vực biên giới đất liền | Chủ đầu tư, VVS | 🟡2 |
| L7 | Trách nhiệm khi xe tự hành gây tai nạn hoặc hư hỏng hàng trên đất VN | Bộ luật Dân sự 2015; quy định bảo hiểm bắt buộc | Chủ đầu tư, VVS | 🟠3 |
| L8 | Hợp đồng: VVS chịu phạt chậm cho việc phụ thuộc bên khác; Tết không phải bất khả kháng | Bộ luật Dân sự 2015; Luật Thương mại 2005; Luật Xây dựng và quy định về hợp đồng xây dựng | VVS | 🔴4 |
| L9 | Quyền sở hữu mã nguồn phần mềm bãi | Luật Sở hữu trí tuệ | VVS, chủ đầu tư | 🟡2 |
| L10 | Thu phí dịch vụ bãi khi chưa kê khai, niêm yết giá; hóa đơn điện tử chưa đăng ký | Luật Giá 2023; quy định hóa đơn điện tử | Chủ đầu tư | 🟡2 |
| L11 | Cân xe chưa kiểm định thì số cân không có giá trị pháp lý | Luật Đo lường | Chủ đầu tư, VVS | 🟡2 |
| L12 | Công trình thiếu giấy phép xây dựng hoặc giấy phép môi trường, bị đình chỉ thi công | Luật Xây dựng; Luật Bảo vệ môi trường 2020; quy định riêng của khu kinh tế cửa khẩu | Chủ đầu tư, VVS | 🟠3 |
| L13 | Thủ tục đấu thầu không đúng luật nếu dự án có vốn nhà nước | Luật Đấu thầu 2023 | VVS | 🟠3 |

## V. Phương án đề xuất cho các rủi ro pháp lý

| # | Phương án | Ai làm | Hạn | Ảnh hưởng còn lại |
|---|---|---|---|---|
| L1 | **Tuần này hỏi Bảo Nguyên tình trạng pháp lý hiện tại của bãi.** Nếu đã công nhận: làm thủ tục điều chỉnh, mở rộng (rút ngắn khoảng 4 tuần). Nếu chưa: làm việc với Cục Hải quan tỉnh tháng 12 để lấy danh mục điều kiện; thiết kế CCTV, lưu trữ, phần mềm quản lý hàng đúng điều kiện từ đầu; **nộp hồ sơ ngay sau mở cổng 28/02**; mời Hải quan kiểm tra sơ bộ trong tháng 3. Dự phòng: xin vận hành có cán bộ Hải quan giám sát trực tiếp | Bảo Nguyên chủ trì; VVS soạn hồ sơ kỹ thuật | Tuần này hỏi; 15/12 làm việc; đầu tháng 3 nộp | 🟡2 (đã công nhận) · 🟠3 (chưa) |
| L2 | Nộp thẩm duyệt thiết kế PCCC trong tháng 12; mời Cảnh sát PCCC kiểm tra giữa kỳ tháng 3; hẹn nghiệm thu tuần 12/04 | Bảo Nguyên, tư vấn thiết kế; VVS phần điện | 31/12 nộp; 16/04 nghiệm thu | 🟡2 |
| L3 | Tách xe tự hành khỏi điều kiện vận hành 17/05: bãi chạy bằng tài xế VN; xin cơ chế thí điểm có kiểm soát qua UBND tỉnh, Bộ Xây dựng và Bộ Công an; giới hạn trong khu vực có rào, có người giám sát, có nút dừng tại phòng điều hành VN. Hạ tầng xe tự hành là hạng mục có điều kiện (mục III.2a) | Bảo Nguyên; VVS soạn phương án kỹ thuật | 07/12 làm việc; 31/01 hồ sơ | 🟢1 với ngày vận hành |
| L4 | Máy chủ trung chuyển tại VN (khi O4 được kích hoạt), **mã hóa kết thúc tại đây**; tắt luồng video về TQ khi xe ở VN; SIM khóa vùng và APN riêng; lập hồ sơ đánh giá tác động xử lý và chuyển dữ liệu cá nhân ra nước ngoài; làm việc với cơ quan chức năng từ tháng 12 hướng tới quy định cấp tỉnh | VVS kỹ thuật; Bảo Nguyên hồ sơ | 15/12 hồ sơ kỹ thuật; 31/01 đánh giá tác động | 🟡2 |
| L5 | Yêu cầu phía TQ cung cấp chứng nhận, dải tần trước 15/12; ưu tiên thiết bị đã hợp quy tại VN; dùng mạng Viettel thay vì tần số riêng | VVS | 15/12; xin phép trong tháng 1 | 🟢1 |
| L6 | Đăng ký danh sách nhân sự nước ngoài với Biên phòng trước mỗi đợt; thống nhất hướng và vùng che camera; chia sẻ hình ảnh cho Biên phòng nếu được yêu cầu | Bảo Nguyên, VVS | Trước lắp đặt tháng 1 | 🟢1 |
| L7 | Thỏa thuận với phía TQ: bên vận hành xe chịu trách nhiệm về xe và hàng trên xe; bắt buộc bảo hiểm trách nhiệm có hiệu lực tại VN; hộp đen truy xuất được tại VN; VVS chỉ chịu trách nhiệm hệ thống cổng và bãi | Bảo Nguyên; VVS rà hợp đồng | 31/01 | 🟡2 |
| L8 | Đưa vào hợp đồng VVS: **hai mốc tách riêng (30/04 VVS, 17/05 phụ thuộc giấy phép)**; mốc tính từ ngày ký và ngày giao mặt bằng; **danh sách loại trừ đóng** (giao mặt bằng, tạm ứng, giấy phép nhà nước, dữ liệu và xe phía TQ) được gia hạn tương ứng, ngoài danh sách này VVS chịu phạt đầy đủ; trần phạt; thời gian Tết loại trừ khỏi tiến độ; tạm ứng đủ để đặt hàng | VVS | Khi thương thảo, tuần 21/12 | 🟡2 |
| L9 | Ghi rõ: chủ đầu tư sở hữu mã nguồn phần viết riêng cho dự án; SIVIP giữ quyền với thư viện lõi có sẵn và cấp quyền sử dụng vĩnh viễn; bàn giao mã nguồn và tài liệu khi nghiệm thu; ký thỏa thuận nội bộ VVS với SIVIP trước khi nộp thầu | VVS, SIVIP | Trước nộp hồ sơ | 🟢1 |
| L10 | Lập biểu phí, kê khai hoặc niêm yết theo quy định; đăng ký hóa đơn điện tử; thu phí thử ở mức 0 đồng trong vận hành thử | Bảo Nguyên | 30/04 | 🟢1 |
| L11 | Kiểm định cân ngay sau lắp đặt, trước vận hành thử có tải | VVS | 15/03 | 🟢1 |
| L12 | Rà soát giấy phép xây dựng, môi trường ngay tuần này; nếu thiếu, xin trước khi nhận mặt bằng; VVS không thi công khi chưa có giấy tờ | Bảo Nguyên; VVS kiểm tra | 04/01 | 🟡2 |
| L13 | Xác định nguồn vốn dự án; nếu có vốn nhà nước, làm đúng quy trình Luật Đấu thầu, tính thêm thời gian thẩm định vào tiến độ (thư chấp thuận 21/12 có thể không áp dụng được) | VVS hỏi bên mời thầu | Tuần này | 🟢1 |

---

## Cần anh xác nhận

1. Ngày vận hành 17/05/2027 có đúng ý "trung tuần Quý 2" của chủ đầu tư không; chủ đầu tư có chấp nhận tách hai mốc 30/04 / 17/05 không.
2. Ngày đóng thầu, ngày dự kiến có kết quả và ngày ký hợp đồng; chủ đầu tư có phát hành được thư chấp thuận 21/12 không.
3. Tình trạng pháp lý hiện tại của bãi: đã có quyết định công nhận địa điểm hải quan, giấy phép xây dựng, nghiệm thu PCCC chưa.
4. Gói VVS dự thầu gồm những hạng mục nào; chủ đầu tư có đồng ý phương án Tối ưu không.
5. Nguồn vốn dự án có vốn nhà nước hay không.
6. SIVIP đã có sản phẩm phần mềm bãi làm nền và dự án tham chiếu chưa (nếu chưa: điểm chết thứ 5).

---

## Phụ lục: danh sách thay đổi so với bản v1

### 7 chỗ sửa từ Phần C bản phản biện

| # | Sửa gì | Thuộc điểm | Đã áp ở đâu trong bản v2 |
|---|---|---|---|
| 1 | Đặt hàng bằng thư chấp thuận 21/12, hàng có sẵn tại VN, xây lắp trước Tết | D1 | Giả định chính; G8; mục II "Mua sắm vượt kỳ nghỉ Tết"; giai đoạn 0, 1; tuần 1, 5, 8–10, 13; III.4 (đặt cọc) |
| 2 | Tách "hệ thống sẵn sàng 30/04" (VVS cam kết) khỏi "vận hành thương mại 17/05" (phụ thuộc giấy phép) | D2 | Bảng mốc đầu tài liệu; giai đoạn 4, 4b; tuần 23; đường găng (kèm 2 kịch bản pháp lý A/B); L1, L8 |
| 3 | Thay phương án đề xuất Cân bằng bằng Tối ưu; tính lại dòng tiền | D3 | Giả định chính; III.2 (thêm cột tổng 3 năm); III.3 (bảng 4 phương án); III.4 (gói VVS 24,3); III.6 |
| 4 | Chuyển O4 thành hạng mục có điều kiện | D4 | Phạm vi theo mốc; C1 (ống cáp, chỗ chờ); III.2a; L3, L4 |
| 5 | Ghi cơ chế thu hồi tạm ứng | Q11 | III.6a |
| 6 | Kéo CCTV toàn bãi sớm sang tháng 3 | Q8 | Phạm vi theo mốc; giai đoạn 3; tuần 8, 15–17; kết nối Hải quan bắt đầu thủ tục từ tuần 7 |
| 7 | Bảo hành phần mềm 24 tháng, cam kết mức dịch vụ | Q15 | III.7; III.4 (bảo lãnh bảo hành năm thứ hai) |

### Thay đổi phát sinh để số liệu khớp nhau

- **Dòng tiền:** dùng tỷ lệ đã chốt **40% / 20% / 15% / 20% / 5%** thay cho 30% / 25% / 20% / 20% / 5% của bản v1, tính trên gói VVS 24,3 tỷ (thay 26,0 tỷ).
- **Hàng "Máy chủ trung chuyển dữ liệu" ở bảng phạm vi:** bản v1 ghi 🟠3 và "bản rút gọn có sao lưu" ngày 17/05, mâu thuẫn với việc hoãn O4. Bản v2 đổi thành có điều kiện, 🟢1.
- **Ngày ký biên bản sẵn sàng:** 29/04 vì 30/04/2027 (thứ Sáu) là ngày lễ.
- **Hồ sơ công nhận địa điểm hải quan:** nộp tuần 01/03 thay vì 08/03.
- **L8:** bổ sung danh sách loại trừ đóng theo câu Q14 của bản phản biện.
- **L13:** ghi chú thư chấp thuận có thể không áp dụng nếu dự án có vốn nhà nước.

### Lỗi phát hiện trong hai bộ slide anh gửi (cần sửa nếu dùng để trình bày)

| Slide | Lỗi | Sửa |
|---|---|---|
| "Bản thiết kế điều hành", slide 1 | Tên dự án ghi "Cửa khẩu Tân Tân Thanh" | Đổi thành bãi container cửa khẩu Bảo Nguyên (lặp chữ "Tân" và sai cửa khẩu) |
| "Bản thiết kế điều hành", slide 7 | Ô "2.0 tỷ: Tích n xe 120 tấn (0.9) 0.8)…" và "CCT nghiệm, đào tạo" bị chữ chồng lên nhau; gộp cân 0,9 và phòng điều hành 0,8 thành 2,0 tỷ "tích hợp" là sai | Tách thành C5 tích hợp 2,0 · C8 cân 0,9 · C9 phòng điều hành 0,8 · C4 CCTV 2,0 · C7 mạng 1,0 |
| "Bản thiết kế điều hành", slide 7 | Khối chủ đầu tư 5,4 tỷ gồm cả dự phòng 2,3 | Ghi rõ dự phòng là của cả dự án, không phải chi phí chủ đầu tư trả cho bên nào |
| "Bản thiết kế điều hành", slide 9 | Vẫn đề xuất Cân bằng 41 tỷ là phương án chính | Thay bằng bảng 4 phương án, Tối ưu là đề xuất (slide 10 đã đúng) |
| "Bản thiết kế điều hành", slide 14 | Dòng tiền dùng tạm ứng 30% (7,3 tỷ) / 25% / 20% / 20% / 5% | Đổi sang 40% (9,7) / 20% (4,9) / 15% (3,6) / 20% (4,9) / 5% (1,2) theo III.6 |
| "Báo cáo phản biện", slide 7 | Cột Cân bằng ghi xe nâng "Mua mới", đầu kéo "Mua mới", hạ tầng "Đầu tư ngay"; cột Tiết kiệm ghi xe nâng "Không" | Cân bằng: xe nâng mua hãng TQ, đầu kéo đã qua sử dụng, hạ tầng rút gọn. Tiết kiệm: xe nâng thuê |
| "Báo cáo phản biện", slide 7 | "Tối ưu đắt hơn Tiết kiệm 7 tỷ" | Đúng là 7,0 tỷ vốn ban đầu nhưng chỉ 2,5 tỷ trong 3 năm; nên ghi cả hai |
