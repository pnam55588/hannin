---
name: Haninn English Class — Experience Spine
status: approved
created: '2026-09-30'
updated: '2026-09-30'
sources:
  - ../../specs/spec-hannin/SPEC.md
  - ../../specs/spec-hannin/screen-inventory.md
  - ../sprint-change-proposal-2026-09-26.md
  - ../architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md
design: DESIGN.md
---

# Haninn — Experience Spine

## Foundation

Ứng dụng web responsive cho **một chủ lớp** trên desktop, tablet và điện thoại; giao diện tiếng Việt có dấu. UI hiện có viết bằng Next.js/Tailwind và các component nội bộ; `DESIGN.md` sở hữu màu, chữ, hình khối. Tài liệu này sở hữu cấu trúc thông tin, hành vi, trạng thái và khả năng tiếp cận. Khi ảnh tham khảo hoặc mã hiện tại mâu thuẫn, cặp spine UX này cùng SPEC và Architecture Spine đã duyệt là hợp đồng để build.

Chủ lớp cần nhìn nhanh ba việc: hôm nay dạy buổi nào, đã điểm danh chưa, tiền nào còn thiếu. Tốc độ cảm nhận đến từ việc hiện khung nội dung đúng hình ngay khi chờ dữ liệu; không dùng màn trắng. Hành vi ghi dữ liệu phải phản hồi ngay trong cùng màn.

## Information Architecture

| Surface | Đường tới | Mục đích và điểm ra |
|---|---|---|
| Đăng nhập | Truy cập khi chưa có phiên | Đăng nhập một tài khoản chủ lớp; thành công tới Tổng quan. |
| Tổng quan | Trang đầu / nav | Bốn chỉ số CAP-1 ở đầu, lịch hôm nay, tình trạng điểm danh, nhắc nợ và nhận xét; các card dẫn tới màn tác vụ. |
| Học sinh | Nav / CTA Thêm học sinh | Tìm, lọc lớp/trạng thái, xem hồ sơ, thêm học sinh ngay trong trang. Mặc định “Đang học”. |
| Hồ sơ học sinh | Hàng trong danh sách / nhắc nợ | Thông tin, mốc học phí/miễn giảm/hạn đóng, sổ thu, điểm danh, nhận xét, đặt ngày nghỉ. |
| Lịch học | Nav / thẻ buổi hôm nay | Xem lớp và quy tắc lịch; thêm lớp, thêm mốc lịch hiệu lực. |
| Điểm danh | Nav / thẻ hôm nay | Chọn ngày, chọn buổi, đánh dấu từng học sinh và lưu buổi ngay trong trang. |
| Học phí & Thu nhập | Nav / nhắc nợ | Chọn kỳ, xem phải thu/đã thu/còn nợ/tiền thực nhận; ghi khoản thu và xem sổ thu. |
| Nhận xét | Nav / card gần đây / hồ sơ | Chọn kỳ, tìm học sinh, ghi hoặc sửa nhận xét tháng, đọc lại lịch sử. |
| Báo cáo | Nav | Chọn khoảng, xem số liệu theo lớp/học sinh, xuất `.xlsx`. |
| Tài khoản | Khu tài khoản của shell | Đổi mật khẩu, đăng xuất. |

Trên desktop, nav hiển thị đủ bảy mục của ảnh nguồn; Tài khoản và Đăng xuất ở cuối. Tablet/mobile dùng cùng một danh sách trong drawer từ top bar. Mỗi route có một `PageHeader` với tên trang và hành động chính. Không tạo màn riêng chỉ để bước 1/2/3 của một tác vụ. Không tạo cổng học sinh/phụ huynh.

## Voice and Tone

Giọng thân thiện, gọn, nói việc có thể làm. Lời chào lấy từ `brand.md`: “Chào bạn! Chúc một ngày làm việc thật hiệu quả!”. Những con số luôn có nhãn kỳ/ngày để tránh hiểu nhầm. Thu nhập gọi là “tiền thực nhận”; công nợ gọi là “còn thiếu”. Với trạng thái lỗi, nêu nguyên nhân và đường sửa, không dùng mã lỗi làm câu chính.

| Tình huống | Câu chữ |
|---|---|
| Kỳ trước bằng 0 | “Mới” thay cho phần trăm thay đổi. |
| Chưa có buổi hôm nay | “Hôm nay chưa có buổi học theo lịch.” + “Xem lịch học”. |
| Học sinh không có kết quả lọc | “Không có học sinh nào khớp bộ lọc này.” + “Xóa bộ lọc”. |
| Học sinh đã nghỉ còn nợ | Badge “Đã nghỉ”, vẫn hiện “Còn thiếu …” trên Học phí. |
| Thiếu đơn giá | “Chưa đặt học phí cho [tên]. Mở hồ sơ để đặt đơn giá.” |
| Lưu thất bại | “Chưa lưu được. Nội dung bạn nhập vẫn còn; thử lại.” |
| Không có mạng | “Mất kết nối. Chưa lưu thay đổi; kiểm tra mạng rồi thử lại.” |

## Component Patterns

Hình thức từng component ở `DESIGN.md` mục Components; ở đây chỉ định hành vi.

| Component | Hành vi |
|---|---|
| `AppShell` | Nav chỉ có một active route; drawer đóng khi chọn mục, bấm Escape hoặc chạm backdrop; focus trở về nút mở. Không đặt thông tin quan trọng chỉ trong sidebar. |
| `PageHeader` | Tên trang là `h1`; mô tả và action xuống hàng ở màn hẹp. Ngày/kỳ đang xem hiển thị bằng chữ rõ. |
| `MetricGrid` | Thứ tự DOM cố định: thu nhập tháng, thu nhập năm, buổi hôm nay, điểm danh hôm nay. Khi 4→2→1 cột, thứ tự đọc không đổi. |
| `MetricCard` | Toàn card không nhất thiết là link; chỉ action có nhãn là interactive. Số và dòng so sánh cùng mốc; % kỳ trước bằng 0 là “Mới”. |
| `Card` | Header chứa tên khối và tối đa một action chính; `Xem tất cả` đi tới màn tương ứng và mang nhãn hỗ trợ có ngữ cảnh. |
| `Button` | Một primary action cho mỗi form/khối tác vụ; pending vô hiệu gửi lặp và giữ nguyên dữ liệu đã nhập. Hành động có tác động tới tiền dùng nhãn động từ rõ. |
| `NavItem` | Icon luôn có nhãn văn bản; active báo bằng `aria-current="page"`. Drawer dùng cùng component với desktop. |
| `StatusBadge` | Trạng thái luôn là chữ + màu/icon; “Chưa điểm danh” khác “Vắng” và khác “Không có buổi”. |
| `Field` | Label gắn control, hint trước lỗi; lỗi gắn `aria-describedby`, focus về field lỗi đầu tiên sau submit. |
| `TableViewport` | Cuộn ngang chỉ trong bảng, có nhãn “Kéo ngang để xem thêm cột” ở mobile khi cần; giữ cột tên/đối tượng đầu tiên nhìn thấy nếu khả thi; header và giá trị có cùng thứ tự ở UI/Excel. |
| `ActionBar` | Action chính không bị che khi bàn phím ảo mở; các action phụ có thể wrap. Không dùng hover để lộ nút thiết yếu. |
| `Skeleton` | Hiện ngay trong vùng sắp có nội dung; chiều cao gần nội dung thật để tránh nhảy bố cục. Không đọc skeleton như dữ liệu thật cho screen reader. |

### Bộ lọc học sinh

Query string giữ `q`, `classId` và `status`; mặc định không có `status` tương đương `active`. Chọn “Đã nghỉ”, “Chưa bắt đầu” hoặc “Tất cả” cập nhật URL nên tải lại và nút Back giữ lựa chọn. Lọc trạng thái chỉ áp dụng ở danh sách Học sinh. Học sinh đã nghỉ vẫn có mặt trong danh sách nợ, cảnh báo quá hạn, báo cáo của kỳ liên quan và hồ sơ. “Hiện lại” nghĩa là chọn bộ lọc “Đã nghỉ”; không có action xoá ngày nghỉ để tái nhập học vì AD-16 đã đưa hành vi đó vào Deferred.

### Ngữ nghĩa bốn thẻ Tổng quan

| Thẻ | Dữ liệu / action |
|---|---|
| Thu nhập tháng này | Tổng payment theo ngày thu trong tháng dương lịch hiện tại, so tháng dương lịch liền trước. |
| Thu nhập năm nay | Tổng payment theo ngày thu trong năm dương lịch hiện tại, so năm dương lịch liền trước. |
| Buổi học hôm nay | `x/y`: số buổi đã tới giờ bắt đầu / tổng buổi theo lịch trong ngày; “Xem lịch tháng” tới Lịch học ở tháng tương ứng. |
| Đã điểm danh hôm nay | `m/n`: số buổi đã lưu điểm danh / số buổi đã tới giờ bắt đầu trong ngày; “Điểm danh” mở đúng ngày hôm nay. Nếu chưa tới giờ buổi nào, hiện `0/0` kèm nhãn “Chưa tới giờ học”. |

“Tới giờ bắt đầu” so với giờ hiện tại theo múi giờ lớp; không suy từ trạng thái điểm danh. Số học sinh, phải thu và còn nợ có thể ở khối phụ dưới bốn thẻ. Tỉ lệ điểm danh **theo kỳ** phải được ghi rõ “trong kỳ” nếu xuất hiện, không thay thế thẻ điểm danh **hôm nay**.

## State Patterns

| Surface | Tải / rỗng | Lỗi / không có mạng | Sau hành động |
|---|---|---|---|
| Đăng nhập | Form sẵn ngay, không cần skeleton | Sai thông tin báo tại form; mất mạng giữ email đã nhập | Thành công tới Tổng quan, focus vào `h1`. |
| Tổng quan | Bốn skeleton metric + card lịch/điểm danh đúng vị trí | Lỗi từng khối có câu thử lại, không thay cả trang bằng màn trắng | Khoản thu mới làm mới hai thẻ thu nhập và nhắc nợ. |
| Học sinh | Skeleton hàng danh sách và khung form; rỗng có CTA thêm | Lỗi lọc/submit giữ query và dữ liệu form | Thêm xong thấy học sinh trong danh sách mặc định nếu đang học. |
| Hồ sơ học sinh | Skeleton header, các card lịch sử | Thiếu mốc giá là lỗi dữ liệu có link đặt giá; không âm thầm hiển thị 0 | Mốc học phí/ngày nghỉ cập nhật các khối liên quan; lịch sử vẫn còn. |
| Lịch học | Khung lớp và lịch; chưa có lớp có CTA tạo | Buổi không hợp lịch báo đường sửa lịch | Mốc mới chỉ ảnh hưởng từ ngày hiệu lực. |
| Điểm danh | Skeleton danh sách buổi/học sinh; ngày không có buổi có thông báo và link lịch | Lưu lỗi giữ lựa chọn; không có mạng không báo đã lưu | Lưu xong hiện “Đã điểm danh” và chỉ số Tổng quan thay đổi. |
| Học phí & Thu nhập | Bốn skeleton metric, bảng nợ và sổ thu | Thiếu đơn giá hiện lỗi rõ từng học sinh; thu thất bại giữ form | Thu một phần giảm “Còn thiếu”; thu đủ bỏ người đó khỏi danh sách nợ. |
| Nhận xét | Danh sách rỗng có hướng dẫn chọn học sinh/kỳ | Lưu lỗi giữ nội dung | Mở lại hồ sơ/kỳ thấy nhận xét vừa lưu. |
| Báo cáo | Skeleton bộ lọc, số liệu và bảng | Chưa có dữ liệu nói rõ kỳ; xuất lỗi không tạo file rỗng | `.xlsx` tải xuống và giữ bộ lọc hiện tại. |
| Tài khoản | Form sẵn ngay | Lỗi mật khẩu hiển thị cạnh form | Đổi xong báo thành công; đăng xuất về Đăng nhập. |

Không có optimistic update cho tiền hoặc điểm danh: trạng thái hoàn tất chỉ xuất hiện sau khi server xác nhận. Khi lỗi dữ liệu một card, các card còn lại vẫn đọc được nếu có thể. Loading skeleton ở route phù hợp cho navigation; việc cuộn trang không làm skeleton che nút điều hướng.

## Interaction Primitives

- Chuột, touch và bàn phím có đường tương đương cho mọi hành động. Không có action chỉ xuất hiện khi hover.
- `Tab` đi theo thứ tự đọc; `Enter`/`Space` kích hoạt nút; `Escape` đóng drawer/overlay và trả focus về trigger.
- Filter dùng URL và nút Back; thay ngày/kỳ cập nhật heading và dữ liệu trong một trạng thái tải có ngữ cảnh.
- Form dài ở 360px vẫn nằm trên một **màn tác vụ** có cuộn dọc, không chia wizard; nút lưu dễ tìm ở cuối form.
- Bảng có thể cuộn ngang **trong khung**; không đổi bảng tài chính thành thẻ rời làm mất khả năng đối chiếu cột tiền.
- Không dùng animation chúc mừng cho ghi tiền/điểm danh. Chỉ dùng transition ngắn cho drawer, hover và trạng thái loading; tắt theo `prefers-reduced-motion`.

## Accessibility Floor

- Mục tiêu WCAG 2.2 AA. Tổ hợp chữ/nền trong DESIGN.md phải qua kiểm tương phản trước khi build; focus ring `{colors.focus}` luôn thấy trên nền sáng.
- Vùng chạm tối thiểu 44×44 CSS px cho action chính, menu và icon button. Text có thể phóng tới 200% mà không mất chức năng hoặc cuộn ngang toàn trang.
- Mỗi route có một `h1`; card có heading đúng cấp. Bảng dùng `th` và `scope`, form dùng label thật; avatar chữ cái chỉ là trang trí nếu đã có tên.
- Live region chỉ thông báo kết quả submit/lỗi cần hành động, không đọc lại toàn dashboard sau tải. “Đã lưu” không được chỉ đổi màu.
- Với thanh cuộn bảng, người dùng bàn phím focus vào được vùng cuộn và có chỉ dẫn. Drawer có focus trap khi mở; background không nhận focus.
- Chữ ngày, tiền và trạng thái không rút gọn mơ hồ trên điện thoại. Logo có alt “Haninn English Class”; icon đi kèm nhãn là trang trí cho screen reader.

## Responsive & Platform

| Viewport nghiệm thu | Shell | Nội dung |
|---|---|---|
| 360×800 (`<768`) | Top bar + drawer, logo rút gọn có tên | Một cột metric/form; lịch, điểm danh và card xếp dọc; bảng cuộn trong khung. |
| 768×1024 (`768–1023`) | Top bar + drawer | Hai cột metric; card có thể hai cột khi đủ chỗ, form ưu tiên một cột. |
| 1024×768 (`≥1024`) | Sidebar cố định | Bốn metric cùng hàng; khối chính hai cột nếu chiều rộng nội dung cho phép. |
| 1536×1024 (`≥1024`) | Sidebar cố định và logo đầy đủ | Bốn metric cùng hàng; nhịp khối gần ảnh dashboard, khoảng trắng rộng. |

Tại cả bốn viewport: không cuộn ngang toàn trang, không che nút/field, thêm học sinh và điểm danh hoàn thành trong cùng màn tác vụ. Điểm gãy dùng chung với Architecture Spine: mobile `<768`, tablet `768–1023`, desktop `≥1024`. Card không được đổi thứ tự ngữ nghĩa khi CSS xếp lại. Trình duyệt desktop và mobile cùng một URL/dữ liệu; không làm bản native riêng. Màn tối chưa có yêu cầu, chỉ thiết kế light mode.

## Inspiration & Anti-patterns

- Giữ từ ảnh khách: sidebar hồng nhạt, logo ở vùng riêng, card chỉ số sáng màu, icon nét mềm, lịch/nhận xét là các khối dễ quét. Ảnh là tham chiếu hình thức, các số và tên trong ảnh không phải dữ liệu thật để seed.
- Sửa khác ảnh: bốn thẻ đầu theo CAP-1 đã chốt; danh sách học sinh là màn riêng; ngày 16/09/2026 là Thứ Tư; không hiện nút xoá học sinh vì AD-16 cấm xoá cứng.
- Tránh: sidebar navy kín màn, bốn card trắng giống nhau, bảng chữ 11px để vừa điện thoại, coral làm màu chữ nhỏ, icon emoji, skeleton toàn trang không khớp layout.

## Key Flows

### CAP-1 — Chủ lớp mở Tổng quan sáng thứ Tư

1. Cô chủ lớp mở Haninn trên laptop lúc 07:45 và đăng nhập.
2. Bốn thẻ đầu cho thấy thu nhập tháng/năm và mốc so sánh, số buổi hôm nay, số buổi đã điểm danh hôm nay.
3. Cô thấy buổi 08:00 trong “Lịch học hôm nay”, rồi chọn “Điểm danh”.
4. **Khoảnh khắc đạt mục tiêu:** sau khi lưu buổi, quay lại Tổng quan thấy thẻ “Đã điểm danh hôm nay” tăng, không nhầm với tỉ lệ trong kỳ.
5. Nếu dữ liệu còn tải, skeleton ở đúng vị trí bốn thẻ và lịch; nếu lỗi, card báo thử lại.

### CAP-2 — Chủ lớp thêm và tìm một học sinh

1. Cô mở Học sinh trên điện thoại, thấy mặc định “Đang học” và nút thêm học sinh.
2. Cô điền form một cột, chọn lớp, ngày bắt đầu và lưu ngay trong trang.
3. Cô tìm theo tên, lọc lớp; hồ sơ mới hiện trong danh sách.
4. **Khoảnh khắc đạt mục tiêu:** khi đánh dấu một học sinh đã nghỉ, danh sách mặc định ẩn em đó; chọn “Đã nghỉ” thì thấy lại hồ sơ và ngày nghỉ, còn nợ cũ vẫn còn ở Học phí.
5. Nếu lưu lỗi, form giữ dữ liệu và focus vào lỗi; không xoá hồ sơ.

### CAP-3 — Chủ lớp đổi lịch một lớp

1. Cô mở Lịch học, chọn lớp 4A và xem các mốc lịch.
2. Cô thêm mốc hiệu lực mới với thứ/giờ thay đổi.
3. **Khoảnh khắc đạt mục tiêu:** lịch từ ngày mới đổi, còn buổi đã dạy trước đó giữ nguyên; lớp khác không đổi.
4. Nếu chọn mốc không hợp lệ, lỗi ở form giải thích ngày/giờ cần sửa.

### CAP-4 — Chủ lớp điểm danh buổi 08:00

1. Cô chọn ngày và buổi 08:00 trên trang Điểm danh.
2. Cô đánh dấu từng em “Có học” hoặc “Vắng”, thấy tiến độ m/n ngay trong card.
3. Cô lưu một lần cho cả buổi.
4. **Khoảnh khắc đạt mục tiêu:** nhãn buổi đổi thành “Đã điểm danh”; mở lại vẫn thấy từng trạng thái.
5. Nếu mất mạng/lưu lỗi, lựa chọn vẫn trên form và không hiện xác nhận sai.

### CAP-5 — Chủ lớp ghi một khoản thu

1. Cô mở Học phí & Thu nhập, chọn kỳ và nhìn bốn chỉ số tách “đã thu theo kỳ” khỏi “thu nhập thực nhận”.
2. Cô mở hàng học sinh còn thiếu, ghi một phần tiền với ngày thu và kỳ đúng.
3. **Khoảnh khắc đạt mục tiêu:** công nợ kỳ giảm đúng khoản vừa ghi; tiền thực nhận tăng ở tháng của ngày thu, kể cả khi thu cho kỳ cũ.
4. Nếu thiếu đơn giá, hệ thống nêu học sinh nào cần đặt giá, không ngầm coi phải thu là 0.

### CAP-6 — Chủ lớp ghi nhận xét tháng

1. Cô mở Nhận xét hoặc hồ sơ học sinh, chọn tháng 9/2026.
2. Cô ghi nhận xét và lưu trong trang.
3. **Khoảnh khắc đạt mục tiêu:** mở lại hồ sơ vẫn thấy nguyên văn nhận xét gắn tháng 9/2026.
4. Nếu lưu thất bại, nội dung vừa viết còn đó để thử lại.

### CAP-7 — Chủ lớp xem và xuất báo cáo

1. Cô vào Báo cáo, chọn khoảng ngày và góc nhìn theo lớp hoặc từng học sinh.
2. Cô đối chiếu số tiền/điểm danh trên preview, kể cả học sinh đã nghỉ trong kỳ còn liên quan.
3. Cô chọn “Xuất Excel”.
4. **Khoảnh khắc đạt mục tiêu:** file `.xlsx` tải xuống mở trong Excel với số liệu khớp preview; bộ lọc trên trang vẫn giữ.
5. Nếu xuất lỗi, thông báo rõ và không tải một file rỗng giả thành công.

### CAP-8 — Chủ lớp xử lý công nợ quá hạn

1. Từ Tổng quan, cô chọn một người trong “Nhắc hạn đóng”.
2. Trang Học phí cho thấy kỳ, hạn, phải thu, đã thu và còn thiếu; học sinh đã nghỉ vẫn xuất hiện nếu còn nghĩa vụ.
3. Cô ghi khoản thu còn thiếu.
4. **Khoảnh khắc đạt mục tiêu:** số còn thiếu về 0, học sinh rời danh sách nợ của kỳ; sổ thu vẫn giữ dòng vừa ghi.
5. Nếu khoản thu chưa được server xác nhận, hàng nợ chưa biến mất.
