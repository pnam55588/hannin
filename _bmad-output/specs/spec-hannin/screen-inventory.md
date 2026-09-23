# Kiểm kê màn hình — Haninn English Class

Nguồn: `sources/man-hinh-dashboard.jpg` (ảnh khách gửi, 1536×1024). Toàn bộ nội dung trích bằng OCR `en-US`, nên **chữ có dấu có thể sai**; mục `[?]` là chưa chắc chắn. Đây là bản ghi những gì **quan sát được** trong ảnh, không phải thiết kế đề xuất.

## Điều hướng (sidebar)

`Tổng quan` · `Học sinh` · `Lịch học` · `Điểm danh` · `Học phí & Thu nhập` · `Nhận xét` · `Báo cáo`

## Màn Tổng quan (quan sát được)

- Lời chào đầu trang: *"Chào bạn! Chúc một ngày việc thật hiệu quả!"* kèm nhãn `Haninn`.
- Thẻ chỉ số:
  - `Thu nhập tháng này` = `6.800.000đ`, `+12%` so với tháng trước.
  - `Thu nhập năm nay` = `52.300.000đ`, `+28%` so với năm trước.
  - `5 / 12` buổi trong ngày, kèm nút `Xem lịch tháng`.
  - `4 / 5` đã điểm danh, kèm nút `Điểm danh`.
- Khối `Lịch học hôm nay` — `Thứ 3, 16/09/2026`: các khung giờ `08:00`, `09:30`, `14:00`, `15:30`; mỗi khung gắn tên học sinh và lớp (`4A`, `5A`, `4C`, `3A`).
  - **Mâu thuẫn đã kiểm chứng:** OCR đọc `Thứ 3`, nhưng `16/09/2026` là **Thứ Tư**. Một trong hai bị đọc sai. Spec dùng `Thứ Tư` vì ngày là chữ số nên đọc chắc hơn phần thứ trong tuần — cần soi lại ảnh gốc khi có điều kiện.
- Trạng thái điểm danh từng học sinh trong buổi: `Có học` / `Vắng`; có nhãn nhóm đánh dấu `[?]`.
- Khối `Nhận xét tháng 9/2026`: *"Học sinh có tiến bộ rõ rệt trong việc phát âm và sử dụng từ vựng. Cần luyện thêm kỹ năng nghe và phản xạ trong giao tiếp."*
- Nút `+ Thêm học sinh`; liên kết `Xem tất cả` / `Xem chi tiết`.

## Màn Học sinh (đã xác nhận là màn riêng, không nhúng trong Tổng quan)

- Tiêu đề `Danh sách học sinh (12)`; ô `Tìm kiếm học sinh...`; bộ lọc lớp (`Tất cả lớp`, `5B`, `5A`).
- Cột: `Mã` `[?]` · `Họ tên` · `Lớp` · `SĐT` · `Học phí/tháng` · `Lịch học` `[?]` · `Trạng thái` · `Thao tác`.
- Giá trị mẫu: học phí `2.000.000đ`, `1.500.000đ`, `1.800.000đ`, `1.200.000đ`, `1.600.000đ`; lịch `T2-T4-T6`; trạng thái `Đang học` / `Chưa bắt đầu`; SĐT dạng `0987 654 321`.
- Có cột số đếm dạng cặp (`22/30`, `10/24`, `5/12`, `19/26`) `[?]` — nhiều khả năng là số buổi đã học trên tổng số buổi. Kiến trúc để cột này ở mục Deferred: mẫu số là số buổi cả khoá, mà spec chưa có mốc bắt đầu và kết thúc khoá.
- Lịch hiển thị trong bảng (`T2-T4-T6`) là **lịch riêng của từng lớp**, sửa được — xem CAP-3.

## Chưa xác định

- Chưa thấy nội dung của các màn `Lịch học`, `Điểm danh`, `Học phí & Thu nhập`, `Nhận xét`, `Báo cáo` — chỉ biết chúng tồn tại qua sidebar.
- Chưa thấy màn đăng nhập, màn thêm/sửa học sinh, hay bất kỳ thông báo lỗi nào.
- Không đọc được nút xuất file nào trong ảnh; CAP-7 chốt xuất Excel (`.xlsx`).
- Cách hiển thị công nợ học phí (CAP-8) và chỗ nhập mức miễn giảm, hạn đóng (CAP-5, CAP-8) chưa có màn tương ứng trong ảnh — cần thiết kế mới.
