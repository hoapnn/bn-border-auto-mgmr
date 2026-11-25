# HANDOFF — Bãi container thông minh Cửa khẩu Bảo Nguyên (hồ sơ dự thầu VVS)

> Cập nhật: 25/11/2026. Tài liệu bàn giao để người (hoặc phiên Claude) tiếp theo nắm toàn bộ bối cảnh mà không phải hỏi lại anh Hòa.
> Gộp từ: project memory, hai thread "Lập đề xuất dự thầu cho VVS" và "Xác định căn cứ pháp lý kiểm soát dữ liệu xe tự hành", cùng bộ tài liệu nguồn "BN Border gate".

---

## 1. Mục tiêu dự án

- **Bối cảnh:** Đề án Cửa khẩu thông minh Lạng Sơn, cặp Bảo Nguyên (VN) / Pò Chài – Phù Trại (TQ). Phía TQ đã có hệ thống xe đầu kéo container tự hành (SANY) và nền tảng điều khiển "xe – đường – đám mây". Chủ đầu tư phía VN là **Bảo Nguyên**, làm bãi container thông minh nhận hàng từ phía TQ.
- **Vai trò của mình:** Công ty của anh Hòa là **VVS**, đứng đầu **"liên doanh VVS"** (toàn nhà thầu Việt Nam, gồm SIVIP làm phần mềm, Viettel làm mạng). VVS **đang trong giai đoạn đấu thầu**, chưa có hợp đồng (tính đến 24/11/2026).
- **Mục tiêu của hồ sơ:** thuyết phục chủ đầu tư bằng một đề xuất đưa bãi vào **vận hành giữa Quý 2/2027**, với giải pháp, tiến độ, chi phí rõ ràng và rủi ro pháp lý có phương án xử lý.

### Mốc chính (đã chốt làm giả định)

| Mốc | Ngày | Ghi chú |
|---|---|---|
| Ký hợp đồng (kịch bản cơ sở) | 31/12/2026 | Ký 15/12 → ảnh hưởng 🟢1; ký sau 15/01 → 🔴4 |
| Tạm ứng 40% | chậm nhất 07/01/2027 | Yêu cầu của anh Hòa: trong 7 ngày sau ký. Nằm trên đường găng |
| Demo (mốc trung gian) | 25/03/2027 | Dự phòng tuần 29/03. Một số tài liệu cũ ghi 22/03, lấy **25/03** |
| Hệ thống VVS sẵn sàng | 30/04/2027 | Cam kết của VVS |
| Vận hành | **Thứ Hai 17/05/2027** | Phụ thuộc giấy phép do chủ đầu tư xin (PCCC, địa điểm giám sát hải quan) |

---

## 2. Kiến trúc + stack

Đây là dự án **tư vấn / hồ sơ thầu**, chưa có mã nguồn. "Kiến trúc" dưới đây là kiến trúc hệ thống bãi mà VVS đề xuất; "stack" là công cụ tạo ra tài liệu.

### 2.1 Kiến trúc hệ thống bãi (đề xuất)

```
 Phía TQ (Pò Chài)                    Km0                     Phía VN (bãi Bảo Nguyên)
 ┌───────────────────────┐            │            ┌──────────────────────────────────────────┐
 │ Xe tự hành SANY       │── bàn giao ┼ điều khiển ─▶ Cổng thông minh: OCR biển số/container,  │
 │ Nền tảng xe-đường-mây │            │            │ barrier, cân, log cổng                   │
 └─────────┬─────────────┘            │            │ Phần mềm bãi (SIVIP): tồn bãi, lệnh việc │
           │ API (chỉ kết nối,        │            │ CCTV, mạng (Viettel, 5G riêng/APN riêng) │
           │ không mua nền tảng)      │            │ Máy chủ đầu mối dữ liệu đặt tại VN       │
           └──────────────────────────┼────────────▶ (mã hóa kết thúc tại VN, lọc, lưu bản   │
                                      │            │  sao, ghi nhật ký) → kết nối Hải quan    │
                                      │            └──────────────────────────────────────────┘
```

- **Vận hành ban đầu bằng tài xế Việt Nam** (đổi đầu kéo tại khu chuyển giao). Xe tự hành TQ vào bãi là **hạng mục có điều kiện**, chỉ kích hoạt khi có giấy phép.
- **Phân chia mua sắm:** chỉ 5/19 hạng mục bắt buộc mua của SANY/phía TQ (xe, bộ lái tự động, TCU/OBU, bảo trì, buồng lái từ xa). Nền tảng đám mây Pò Chài **không mua**, chỉ kết nối API. Phần còn lại chia **6 gói thầu trong nước** cho liên doanh VVS. Pò Chài đã mở chuẩn kết nối cho 3 hãng xe khác → có thể đấu thầu xe theo chuẩn thay vì chỉ định SANY.
- **Kiểm soát dữ liệu xe tự hành (PA1 làm xương sống):** máy chủ đầu mối tại VN, mã hóa phải **kết thúc tại máy chủ VN** để phía VN đọc/lọc được; LiDAR và bản đồ HD **không** chuyển sang TQ. Bổ sung: SIM khóa theo geofence, APN riêng trên Viettel, bàn giao quyền điều khiển tại Km0. Demo chỉ cần bản rút gọn (chuyển tiếp + lưu bản sao + nhật ký).

### 2.2 Stack tài liệu

- **Claude Docs / Artifact** (claude.ai) cho mọi tài liệu chính. Anh Hòa ưu tiên **doc** cho nội dung mới, không dùng HTML trừ khi yêu cầu.
- **Một trang HTML trực quan** `bao-nguyen/lo-trinh-cua-khau-bao-nguyen.html` (trong thư mục dự án dùng chung) + bản artifact. Có ô "Đã đọc / Xác nhận" cho 78 mục + phần Demo, lưu chung cho nhóm trên link artifact, lưu localStorage khi mở offline; xuất CSV / sao chép báo cáo; nút In chỉ có ở bản offline.
- **Tài liệu nguồn** ở thư mục "BN Border gate" (tiếng Việt + tiếng Trung): phương án xe tự hành, tiêu chuẩn an toàn, quy chuẩn kết nối bên thứ ba của Pò Chài, thiết kế 5G PMN Hữu Nghị (tham khảo), quy hoạch QH03, sổ tay SANY.
- **Repo này** (`hoapnn/bn-border-auto-mgmr`) hiện chỉ có README + HANDOFF.md.

---

## 3. Các quyết định đã chốt

1. **VVS là đầu mối tích hợp duy nhất** của liên doanh (🔴4 nếu không giữ được).
2. **Bãi chạy bằng tài xế VN** từ ngày vận hành; xe tự hành TQ tách khỏi điều kiện vận hành (khung pháp lý chưa hoàn chỉnh: ngày 19/10/2026 tỉnh báo cáo Phó Thủ tướng rằng quy định về đăng ký, cấp phép xe không người lái qua biên giới chưa có).
3. **Hạ tầng xe tự hành là hạng mục có điều kiện:** VVS giữ giá, chủ đầu tư chỉ kích hoạt khi có giấy phép.
4. **Không phá sóng/chặn vô tuyến** (vi phạm Luật Tần số vô tuyến điện, làm hỏng 5G/RTK của chính xe).
5. **Tách hai cam kết:** VVS cam kết hệ thống sẵn sàng 30/04; ngày vận hành 17/05 phụ thuộc giấy phép của chủ đầu tư.
6. **Tạm ứng 40%** trong 7 ngày sau ký; tạm ứng chậm bao nhiêu ngày thì mốc lùi bấy nhiêu. Dòng tiền: 40% tạm ứng / 20% đợt 1 (T2) / 15% đợt 2 (T3) / 20% nghiệm thu / 5% bảo hành.
7. **Đặt hàng sớm bằng thư chấp thuận** của chủ đầu tư (~21/12), ưu tiên hàng có sẵn tại VN, **xây lắp xong trước Tết**; CCTV toàn bãi dời sang tháng 3.
8. **Demo 3 mức:** A (cam kết, chỉ phía VN), B (xe tự hành TQ đến khu đổi đầu kéo), C (kết nối FMS/TOS, Hải quan). Phía TQ chậm thì **hạ mức, không lùi ngày**.
9. **Chi phí trình bày theo phương án lựa chọn,** không đưa khoảng min–max rộng. Phần bắt buộc 24,8 tỷ (±15%). Ba gói Tiết kiệm 24,8 tỷ / Cân bằng 41 tỷ / Đầy đủ 51 tỷ; bản phản biện đề xuất thêm gói **"Tối ưu" 31,8 tỷ** (thuê xe nâng, đầu kéo đã qua sử dụng, 2+2 làn, hoãn hạ tầng xe tự hành; tổng 3 năm 38,7 tỷ). Gói VVS ~26 tỷ theo Cân bằng. Mọi số liệu chưa VAT, là **ước tính tham khảo**.
10. **Quy ước trình bày:** trả lời bằng **tiếng Việt**; mọi hạng mục có **thang ảnh hưởng 🟢1 → 🔴4** (🔴4 = mất demo hoặc VVS lỗ).

---

## 4. Việc đã xong

| # | Sản phẩm | Link |
|---|---|---|
| 1 | Lộ trình tự động hóa (24 hạng mục, 4 giai đoạn) — EN | https://claude.ai/artifact/VxpB1kdc8nt7YQgseAd1Ni |
| 2 | Phân chia gói thầu SANY / nhà thầu trong nước | https://claude.ai/artifact/NcqFiPVZH6ZKjEKewzvK9s |
| 3 | Trang HTML trực quan (lộ trình, phân công 15 đầu việc × đơn vị, duyệt 78 mục, Demo Q1/2027) | https://claude.ai/artifact/S8knmAnHnvWfEDsePh45sZ · tệp `/mnt/project-files/bao-nguyen/lo-trinh-cua-khau-bao-nguyen.html` |
| 4 | Hạng mục demo Q1/2027 – bảng phân mức (24 mục: A 15 / B 5 / C 4) | https://claude.ai/artifact/Ba2iyNrRSwvF5xYmZEr4KJ |
| 5 | Timeline VVS đến hết Q1/2027 (**đã bị thay thế** bởi #6, #7) | https://claude.ai/artifact/4KhFi3BZXN9uLy3u3gYRQH |
| 6 | Lộ trình VVS Q1/2027: giải pháp, tiến độ, chi phí (bản theo giai đoạn đấu thầu) | https://claude.ai/artifact/QCbUDPMDmjqTR2jioxunTU |
| 7 | **Đề xuất VVS: đưa bãi vào vận hành giữa Q2/2027** (tài liệu chính; I Giải pháp, II Tiến độ, III Chi phí, IV Rủi ro pháp lý, V Phương án) | https://claude.ai/artifact/86ezKea7maJHdMUkFyXjUp |
| 8 | Phản biện đề xuất từ góc nhìn chủ đầu tư (4 điểm chết, 18 câu hỏi + trả lời) | https://claude.ai/artifact/LHRETZ232b1XW6mH7hewv6 |
| 9 | **Danh mục công việc chi tiết của VVS** (68 đầu việc, 11 nhóm, 30 việc 🔴4, có danh sách ngoài phạm vi) | https://claude.ai/artifact/1nwnHBHBghVQG7tmDjVZ5T |
| 10 | Căn cứ pháp lý kiểm soát dữ liệu xe tự hành TQ + đánh giá 3 phương án (PA1/PA2/PA3) | https://claude.ai/artifact/UPa5ioegwhr8oTWW9GzA5X |

11 nhóm việc của VVS (#9): 1 Quản lý dự án & đấu thầu · 2 Khảo sát, thiết kế · 3 Mua sắm · 4 Xây lắp · 5 Cổng thông minh & thiết bị bãi · 6 Phần mềm bãi (SIVIP) · 7 Kết nối dữ liệu · 8 Mạng · 9 Hỗ trợ hồ sơ pháp lý cho chủ đầu tư · 10 Chạy thử, đào tạo, bàn giao · 11 Bảo hành.

Căn cứ pháp lý dữ liệu chính (#10): Luật BVDLCN 91/2025 + NĐ 356/2025 (hồ sơ nộp Cục A05); Luật Dữ liệu 60/2024 + QĐ 20/2025/QĐ-TTg (dữ liệu biên giới, không gian địa lý là dữ liệu cốt lõi); Luật Bảo vệ bí mật nhà nước; Luật Đo đạc và bản đồ; Luật An ninh mạng 116/2025. Không có điều luật nào ghi thẳng "xe TQ phải tắt truyền dữ liệu"; nghĩa vụ đến từ tổ hợp các quy định trên.

---

## 5. Việc đang dở

- **25/11/2026:** đã áp 7 chỗ sửa của bản phản biện vào đề xuất, thành bản v2 trong repo: `CLAUDE OUTPUTS/BaoNguyen/BaoNguyen-DeXuat_Report_v2.md` (phương án Tối ưu 31,8 tỷ, gói VVS 24,3 tỷ, dòng tiền 40/20/15/20/5, cơ chế thu hồi tạm ứng, O4 có điều kiện, bảo hành phần mềm 24 tháng). Chờ anh Hòa duyệt; artifact #7 trên claude.ai chưa được cập nhật.
- **25/11/2026:** chi tiết 8 hạng mục SIVIP có thể nhận thầu: `CLAUDE OUTPUTS/BaoNguyen/BaoNguyen-SIVIP_Report_v1.md` (khoảng 5,8 tỷ cam kết, 117 người-tháng; điều kiện tiên quyết là SIVIP có sản phẩm nền).
- Danh mục công việc (#9) cần đồng bộ lại số liệu với đề xuất v2.
- **Đang chờ anh Hòa trả lời:**
  - ngày đóng thầu và ngày dự kiến có kết quả;
  - phạm vi gói VVS dự thầu;
  - số làn cổng trong hồ sơ mời thầu;
  - bãi đã được công nhận địa điểm giám sát hải quan chưa;
  - SIVIP đã có sản phẩm phần mềm bãi làm nền chưa (nếu chưa: **điểm chết thứ 5**);
  - xác nhận tractor swap (đổi đầu kéo) cho go-live (comment còn mở trong #1);
  - 5 điểm cần xác nhận ở cuối đề xuất #7.

---

## 6. Việc tiếp theo

1. Anh Hòa duyệt đề xuất v2 và tài liệu SIVIP; đồng bộ số liệu sang #9 và các bộ slide.
2. **Thay toàn bộ chi phí ước tính bằng báo giá thật** (thiết bị cổng, OCR, CCTV, mạng Viettel, xe nâng/đầu kéo thuê–mua, SIVIP) trước khi nộp hồ sơ.
3. Nhờ **luật sư đối chiếu nguyên văn** các điều luật có dấu (*) trong #10 và 13 rủi ro pháp lý ở mục IV của #7.
4. Bắt đầu **PA2 (làm việc với cơ quan chức năng) từ tuần 07/12/2026**, hướng tới quy chế cấp tỉnh về dữ liệu xe tự hành.
5. Theo dõi 3 mốc kiểm tra nhánh pháp lý xe tự hành: **07/12, 31/01, 15/04** (mỗi mốc có phương án nếu chưa đạt). Ước tính có giấy phép: nhanh 3–5 tháng, cơ sở 6–9 tháng, chậm 12–24 tháng.
6. Chốt thỏa thuận với phía TQ và cơ quan chức năng **trước 31/01/2027** (điều kiện để Mức B của demo chạy được).
7. Sau khi trúng thầu: ký gói, đặt hàng thiết bị cổng ngay ngày nhận tạm ứng, đóng băng phần mềm Mức A trước 01/03, chạy thử + diễn tập tổng trước 20/03.

---

## 7. Lỗi / bẫy đã gặp

- **Đường găng không còn dự trữ.** Tết chiếm 2 tuần; chuỗi Mức A và nhánh pháp lý (PCCC, công nhận địa điểm hải quan) đều không còn tuần dư. Thiết bị TQ đặt sau 07/01 sẽ rơi vào kỳ nghỉ Tết bên đó.
- **Mã hóa đầu cuối thẳng sang TQ làm PA1 vô nghĩa:** máy chủ VN chỉ chuyển tiếp, không kiểm soát được. Phải yêu cầu mã hóa kết thúc tại VN.
- **Rủi ro còn lại lớn nhất về dữ liệu:** xe ghi dữ liệu tại chỗ rồi tải lên khi đã về TQ. Chỉ chặn được bằng hợp đồng và quyền kiểm tra xe.
- **Hữu Nghị và Tân Thanh chưa công bố cách xử lý dữ liệu** → không có mẫu để làm theo.
- **Khoảng chi phí quá rộng bị anh Hòa bác** (34–76 tỷ). Chênh lệch đến từ các quyết định chưa chốt (riêng xe nâng lệch 16 tỷ). Luôn tách thành phương án lựa chọn.
- **Khuyến nghị mâu thuẫn số liệu:** gói Cân bằng đắt hơn Tiết kiệm 9,6 tỷ trong 3 năm theo chính bảng của mình. Kiểm tra chéo trước khi khuyến nghị.
- **Coi bãi là đất trống là sai:** bãi Bảo Nguyên đã nhận hàng có Hải quan làm thủ tục, và xe không người lái đã chạy 71 chuyến thử nghiệm từ Pò Chài về bãi (có Biên phòng dẫn đường, tài xế ngồi trên xe). Đó là thử nghiệm, chưa phải giấy phép.
- **Không đọc được `会晤事项.doc`** (định dạng .doc cũ) → nội dung tệp này chưa có trong bất kỳ tài liệu nào.
- **Thư mục nguồn có nhiều bản trùng** (tên kết thúc bằng `(1)`, `(2)`). Dùng bản có số phiên bản cao nhất, ví dụ "PHƯƠNG ÁN XÂY DỰNG DỰ ÁN THÔNG TIN HOÁ (5)".
- **Trang HTML:** người chỉ có quyền xem thì tick chỉ lưu trên máy họ; muốn lưu chung phải chia sẻ quyền Contributor. Bản link không in được (trình xem chặn), dùng bản offline để in.
- **Timeline #5 đã lỗi thời** (viết như thể đã có hợp đồng). Dùng #6/#7.
- **Thiếu đơn vị** trong phân công ban đầu: Biên phòng, BQL KKT Đồng Đăng – Lạng Sơn/UBND tỉnh, Kiểm dịch, Cục Tần số, Bộ Công an (bắt buộc); SANY (tách khỏi bên vận hành TQ), Đăng kiểm, doanh nghiệp XNK/đại lý hải quan, bảo hiểm/giám định (nên có).
- **GitHub GraphQL không dùng được** từ phiên Claude Code cloud (`gh pr list` lỗi 403); dùng REST `gh api repos/...`.

---

## 8. Project memory (gộp nguyên văn ý)

> **bao-nguyen-vvs-bid** — Công ty VVS của anh Hòa đứng đầu "liên doanh VVS" (toàn nhà thầu VN, gồm SIVIP phần mềm, Viettel mạng) dự thầu cho chủ đầu tư Bảo Nguyên, bãi container thông minh tại cửa khẩu Bảo Nguyên / Pò Chài, Lạng Sơn. Đến 24/11/2026 VVS vẫn đang đấu thầu (chưa có hợp đồng).
> Mốc: chủ đầu tư muốn vận hành giữa Q2/2027 (dùng thứ Hai 17/05/2027); kịch bản cơ sở ký 31/12/2026; tạm ứng 40% trong 7 ngày sau ký (yêu cầu của anh Hòa); giữ demo 25/03/2027 làm mốc trung gian. Xe tự hành TQ vào VN chưa có khung pháp lý (19/10/2026) nên bãi thiết kế chạy bằng tài xế VN; hạ tầng xe tự hành là hạng mục có điều kiện.
> Anh Hòa thích trả lời bằng tiếng Việt, doc hơn HTML cho nội dung mới, thang ảnh hưởng 🟢1–🔴4 cho mọi hạng mục, và chi phí theo phương án thay vì khoảng min–max rộng.
> Cách dùng: xây tiếp trên các tài liệu đã có; số liệu chi phí là ước tính tham khảo cho đến khi VVS có báo giá thật.

## 9. Project instructions

Chưa có project instructions nào được đặt cho dự án này (tính đến 25/11/2026). Các quy ước làm việc thực tế nằm ở mục 3 (điểm 10) và mục 8.
