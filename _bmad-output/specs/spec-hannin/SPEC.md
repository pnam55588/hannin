---
id: SPEC-hannin
companions:
  - brand.md
  - screen-inventory.md
sources:
  - sources/haninn-logo.png
  - sources/man-hinh-dashboard.jpg
---

> **Canonical contract.** SPEC này cùng các file trong `companions:` là hợp đồng đầy đủ (đã kiểm tra preservation) cho việc xây, test và nghiệm thu. Các file trong `sources:` chỉ để truy vết — chỉ mở khi cần lý do bằng văn xuôi mà hợp đồng này cố ý lược bỏ.

# Haninn English Class — Ứng dụng quản lý lớp học

## Why

**Nỗi đau cần giải.** Chủ lớp tiếng Anh Haninn đang điều hành nhiều lớp với lịch riêng cho từng lớp và bốn khung giờ mỗi ngày, nhưng không có nơi tập trung để theo dõi điểm danh, học phí và nhận xét học sinh. Khách đã tự phác sẵn màn hình họ muốn — mockup dashboard kèm logo — nên nhu cầu đã cụ thể hoá thành **một công cụ nội bộ cho một người dùng duy nhất là chủ lớp**. Quy mô trong ảnh (12 học sinh, 5 lớp, thu nhập năm 52.300.000đ) đủ lớn để sai sót khi làm thủ công bắt đầu tốn kém: một buổi không điểm danh hoặc một học phí bị sót là mất tiền thật và mất niềm tin của phụ huynh.

**Ai chịu ảnh hưởng:** chủ lớp là người dùng duy nhất; phụ huynh và học sinh chịu ảnh hưởng gián tiếp qua tính chính xác của điểm danh và học phí.

## Capabilities

- **CAP-1 — Tổng quan**
  - **intent:** Chủ lớp xem được tình hình hiện tại trong một màn hình: thu nhập tháng này và năm nay — hiểu là tiền thực nhận trong kỳ — kèm mức thay đổi so với kỳ trước, số buổi học trong ngày, và tỉ lệ đã điểm danh.
  - **success:** Mở màn Tổng quan thấy đủ bốn chỉ số (tiền đã thu trong tháng + % so với tháng trước, tiền đã thu trong năm + % so với năm trước, x/y buổi trong ngày, m/n đã điểm danh); ghi thêm một khoản thu thì chỉ số tiền đổi theo.
- **CAP-2 — Quản lý học sinh**
  - **intent:** Chủ lớp thêm, sửa, xem và tìm kiếm học sinh với lớp, số điện thoại, học phí/tháng, mức miễn giảm, lịch học và trạng thái học.
  - **success:** Thêm một học sinh mới rồi thấy học sinh đó trong danh sách và trong bộ lọc theo lớp; tìm theo tên trả về đúng học sinh; sửa học phí của học sinh đó thì giá trị mới hiển thị lại đúng.
- **CAP-3 — Lịch học**
  - **intent:** Chủ lớp xem lịch dạy theo ngày và theo lớp, và sửa được lịch của từng lớp.
  - **success:** Chọn 16/09/2026 thì thấy các khung 08:00, 09:30, 14:00, 15:30; đổi lịch của một lớp (thêm/bớt thứ hoặc khung giờ) thì các buổi của lớp đó hiển thị theo lịch mới, còn lớp khác không đổi.
- **CAP-4 — Điểm danh**
  - **intent:** Chủ lớp điểm danh từng buổi học và ghi trạng thái của mỗi học sinh trong buổi đó.
  - **success:** Điểm danh xong một buổi thì tỉ lệ "đã điểm danh" của ngày trên Tổng quan tăng tương ứng, và trạng thái từng học sinh được lưu lại khi mở lại buổi đó.
- **CAP-5 — Học phí và thu nhập**
  - **intent:** Chủ lớp theo dõi học phí/tháng của từng học sinh — kể cả mức miễn giảm theo số tiền cố định áp cho học sinh đó — và dòng tiền đã thu theo tháng, theo năm. Học phí một tháng bằng đơn giá trừ miễn giảm; tháng mà học sinh vào hoặc nghỉ giữa tháng thì chia theo số buổi lớp đã diễn ra. Số phải thu và công nợ là chỉ số riêng, không gộp vào thu nhập.
  - **success:** Ghi một khoản thu làm tăng đúng số tiền đã thu của tháng đó; tổng đã thu của một tháng bằng tổng các khoản thu trong tháng, bất kể học sinh đã đóng đủ hay chưa; với tháng lệch, số phải thu bằng đơn giá trừ miễn giảm nhân với tỉ lệ số buổi lớp đã diễn ra trong phần tháng học sinh có mặt trên tổng số buổi của lớp trong tháng đó.
- **CAP-6 — Nhận xét**
  - **intent:** Chủ lớp ghi nhận xét theo tháng cho từng học sinh và đọc lại nhận xét cũ.
  - **success:** Lưu một nhận xét cho một học sinh trong tháng 9/2026 rồi mở lại hồ sơ học sinh, thấy đúng nhận xét đó gắn với tháng 9/2026.
- **CAP-7 — Báo cáo**
  - **intent:** Chủ lớp xem báo cáo về thu nhập và điểm danh theo một khoảng thời gian tự chọn — theo lớp và theo từng học sinh — và xuất được ra file Excel.
  - **success:** Chọn một khoảng thời gian rồi xem báo cáo theo lớp và theo học sinh với số liệu khớp dữ liệu đã nhập, và xuất được file `.xlsx` mở lại đọc được bằng Excel.
- **CAP-8 — Công nợ học phí**
  - **intent:** Chủ lớp biết trong tháng ai còn thiếu học phí, thiếu bao nhiêu và đến hạn khi nào.
  - **success:** Với một tháng, danh sách nợ hiển thị đúng những học sinh còn thiếu kèm số tiền còn thiếu và hạn đóng đã đặt cho học sinh đó (giữ nguyên từ tháng trước nếu không sửa); thu một phần thì số còn thiếu giảm đúng bằng phần đã thu; thu đủ thì học sinh rời danh sách nợ.

## Constraints

- Giao diện **tiếng Việt có dấu** là ngôn ngữ duy nhất của sản phẩm.
- Tiền tệ **VND** định dạng `1.200.000đ`; ngày hiển thị kèm thứ trong tuần, ví dụ `Thứ Tư, 16/09/2026`.
- **Nhận diện Haninn là ràng buộc cứng:** logo, hai màu `#0D1F3D` / `#FF6B6B` theo tỉ lệ ~70/30, tagline `LEARN · GROW · SUCCEED` (chi tiết trong `brand.md`).
- Toàn bộ app nằm sau **một tài khoản chủ lớp**; không có vai trò phụ huynh/học sinh và không có phần đọc công khai.
- **Hạn đóng học phí do chủ lớp đặt cho từng học sinh** và giữ nguyên cho các tháng sau (sửa được) — không phải hằng số của hệ thống.
- **Điểm danh không ảnh hưởng tới học phí:** vắng không bị trừ tiền. Tháng mà học sinh vào giữa tháng hoặc nghỉ giữa tháng được chia theo số buổi **lớp đã diễn ra** trong phần tháng đó, không theo số buổi học sinh có mặt.
- **Dữ liệu seed và bản demo phải là dữ liệu giả** — ảnh nguồn chứa tên và SĐT có thể là thật.
- Thao tác thường dùng (điểm danh, thêm học sinh) phải xong trong **một màn hình**, không qua wizard nhiều bước: người dùng không phải dân kỹ thuật.

## Non-goals

- Không làm website giới thiệu/marketing công khai hay form đăng ký cho phụ huynh — phạm vi đã chốt là công cụ nội bộ.
- Không làm cổng cho phụ huynh/học sinh: không tài khoản phụ huynh, không màn hình tra cứu, không kênh thông báo qua Zalo/SMS.
- Không làm nền tảng dạy học trực tuyến: không bài giảng, video, khoá học, bài tập về nhà.
- Không làm app native iOS/Android trong phạm vi này.
- Không tích hợp cổng thanh toán online hay biên lai điện tử — học phí ghi nhận nội bộ và theo dõi công nợ.
- Không xuất PDF; báo cáo chỉ xuất Excel (`.xlsx`).

## Success signal

- Chủ lớp chạy trọn một tháng học trong app — thêm học sinh mới, điểm danh từng buổi, ghi nhận xét tháng, ghi các khoản thu học phí và **nhìn ra ngay ai còn nợ** — không cần mở file nào bên ngoài; con số thu nhập tháng trên Tổng quan bằng tổng tiền đã thu trong tháng, và danh sách nợ khớp với số phải thu của từng học sinh.

## Assumptions

- Giả định hiện **chưa có hệ thống quản lý nào**; việc theo dõi đang làm thủ công.
- Sản phẩm dùng trên **desktop** (ảnh 1536×1024); spec chưa ràng buộc mobile/responsive.
- Nội dung trích từ ảnh bằng OCR tiếng Anh; các mục đánh dấu `[?]` trong `screen-inventory.md` là chưa chắc chắn.
- Lựa chọn "công nợ" cho học phí được coi là **loại trừ cổng thanh toán online và biên lai** khỏi phạm vi.
