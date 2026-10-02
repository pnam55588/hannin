---
name: Haninn English Class
description: Giao diện sáng, ấm áp cho chủ lớp; nhận diện Haninn rõ ràng trên desktop, tablet và điện thoại.
status: approved
created: '2026-09-30'
updated: '2026-09-30'
sources:
  - ../../specs/spec-hannin/SPEC.md
  - ../../specs/spec-hannin/brand.md
  - ../../specs/spec-hannin/screen-inventory.md
  - ../../specs/spec-hannin/sources/man-hinh-dashboard.jpg
  - ../../specs/spec-hannin/sources/haninn-logo.png
  - ../sprint-change-proposal-2026-09-26.md
  - ../architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md
colors:
  brand-navy: '#0D1F3D'
  brand-coral: '#FF6B6B'
  coral-ink: '#9F273D'
  canvas: '#FFFDFC'
  surface: '#FFFFFF'
  sidebar: '#FFF5F7'
  navy-tint: '#EAF0FA'
  coral-tint: '#FFE9EC'
  lavender-tint: '#F3F0FF'
  mint-tint: '#ECF8F5'
  butter-tint: '#FFF8EA'
  ink: '#0D1F3D'
  muted: '#52637A'
  border: '#E5EAF0'
  success-ink: '#17634F'
  success-tint: '#E7F5EF'
  danger-ink: '#9F273D'
  danger-tint: '#FFE9EC'
  focus: '#0D1F3D'
typography:
  display:
    fontFamily: 'Segoe UI, system-ui, sans-serif'
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.25'
  title:
    fontFamily: 'Segoe UI, system-ui, sans-serif'
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '1.3'
  section:
    fontFamily: 'Segoe UI, system-ui, sans-serif'
    fontSize: 16px
    fontWeight: '700'
    lineHeight: '1.4'
  body:
    fontFamily: 'Segoe UI, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'Segoe UI, system-ui, sans-serif'
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.4'
  caption:
    fontFamily: 'Segoe UI, system-ui, sans-serif'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 8px
  md: 12px
  lg: 18px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
components:
  AppShell:
    canvas: '{colors.canvas}'
    sidebar: '{colors.sidebar}'
    divider: '{colors.border}'
  PageHeader:
    title: '{typography.title}'
    foreground: '{colors.brand-navy}'
  MetricGrid:
    gap: '{spacing.4}'
  MetricCard:
    background: '{colors.surface}'
    radius: '{rounded.lg}'
    value: '{colors.brand-navy}'
  Card:
    background: '{colors.surface}'
    radius: '{rounded.lg}'
    border: '{colors.border}'
  Button:
    primary-background: '{colors.brand-navy}'
    primary-foreground: '{colors.surface}'
    accent-background: '{colors.brand-coral}'
    accent-foreground: '{colors.brand-navy}'
    radius: '{rounded.md}'
  NavItem:
    active-background: '{colors.coral-tint}'
    active-foreground: '{colors.coral-ink}'
    radius: '{rounded.md}'
  StatusBadge:
    success-background: '{colors.success-tint}'
    success-foreground: '{colors.success-ink}'
    warning-background: '{colors.butter-tint}'
    warning-foreground: '{colors.brand-navy}'
    danger-background: '{colors.danger-tint}'
    danger-foreground: '{colors.danger-ink}'
  Field:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.sm}'
  TableViewport:
    background: '{colors.surface}'
    border: '{colors.border}'
  ActionBar:
    background: '{colors.surface}'
    divider: '{colors.border}'
  Skeleton:
    background: '{colors.navy-tint}'
    radius: '{rounded.sm}'
---

# Haninn — Design Spine

## Brand & Style

Haninn là sổ điều hành lớp học của một chủ lớp. Cảm giác cần đạt: sáng sủa như ảnh khách gửi, gần gũi với môi trường giáo dục, nhưng số tiền, ngày học và trạng thái vẫn dễ đọc trong vài giây. Các mảng pastel làm nhịp nền cho thông tin; logo và các hành động quan trọng tạo điểm nhận diện. Đây là giao diện công cụ nội bộ, không phải trang quảng bá cho học sinh.

Ảnh nguồn [dashboard](../../specs/spec-hannin/sources/man-hinh-dashboard.jpg) là tham chiếu về nhịp bố cục, icon nét mềm, các thẻ nhẹ màu và khoảng thở. [Logo nguồn](../../specs/spec-hannin/sources/haninn-logo.png) là một board nhiều biến thể, không phải asset sạch sẵn để chèn nguyên tấm vào app. Dev phải trích lockup chính từ chính file khách gửi, giữ đúng hình và chữ, rồi cho khách duyệt ở kích thước thật. Không tự vẽ lại ký hiệu chữ H. Tài liệu này và `EXPERIENCE.md` là hợp đồng khi mockup và mã hiện tại khác nhau.

## Colors

| Vai trò | Token | Áp dụng |
|---|---|---|
| Thương hiệu chính | `{colors.brand-navy}` | Logo, tiêu đề, chữ số lớn, nút chính, icon chính. |
| Thương hiệu nhấn | `{colors.brand-coral}` | Nút thêm mới, dấu nhấn trên lịch, một điểm nhấn trong mỗi nhóm thẻ. Chữ trên nền coral dùng navy. |
| Chữ coral | `{colors.coral-ink}` | Link, active nav, cảnh báo chữ nhỏ trên nền sáng. |
| Nền chính | `{colors.canvas}` | Toàn vùng nội dung; hơi ấm để màn sáng nhưng không chói. |
| Sidebar | `{colors.sidebar}` | Nền hồng rất nhạt như ảnh nguồn; không phủ navy đậm kín sidebar. |
| Nền thẻ nhạt | `{colors.navy-tint}`, `{colors.coral-tint}`, `{colors.lavender-tint}`, `{colors.mint-tint}`, `{colors.butter-tint}` | Tô một phần thẻ chỉ số và icon well; sắc độ phụ, không thành màu thương hiệu mới. |
| Trạng thái | `{colors.success-ink}`, `{colors.success-tint}`, `{colors.danger-ink}`, `{colors.danger-tint}` | Có học/đã thu, vắng/quá hạn. Trạng thái luôn có chữ và biểu tượng, không truyền ý nghĩa bằng màu đơn độc. |

Quy tắc 70/30 của board logo là tỷ lệ thị giác cho **các điểm nhận diện chủ động** như logo, CTA, active nav và dấu nhấn; navy dẫn dắt khoảng 70%, coral nhấn khoảng 30%. Không tính chữ nội dung, nền trắng/pastel hay màu ngữ nghĩa vào tỷ lệ này. Khi duyệt ảnh chụp 1536×1024 và 360×800, xem hai màu có đủ hiện diện và không giành vai trò của nhau. Sidebar nhạt và bốn thẻ pastel giữ tổng thể tươi sáng. Coral không làm nền cho cả panel lớn hoặc đoạn văn dài.

Chữ và control quan trọng phải đạt tương phản tối thiểu 4.5:1; chữ lớn tối thiểu 3:1. `{colors.brand-coral}` không dùng làm chữ nhỏ trên trắng và không đặt chữ trắng trên coral gốc. Nếu tone pastel không đủ tương phản, giữ tone cho nền và dùng `{colors.brand-navy}`/`{colors.coral-ink}` cho chữ. Không dùng độ trong suốt để giảm tương phản của text.

## Typography

Giữ font hệ thống Segoe UI để hiển thị tiếng Việt ổn định. `{typography.display}` chỉ dành cho lời chào và con số đầu trang; `{typography.title}` cho tên trang; `{typography.section}` cho tên khối; `{typography.body}` cho bảng, form và diễn giải. Nhãn không viết toàn chữ hoa. Giá trị tiền dùng tabular numerals để các cột thẳng hàng. Ở điện thoại, lời chào giảm còn 24px, tên trang 20px; body không dưới 14px, chú thích không dưới 12px.

## Layout & Spacing

- Desktop `≥1024px`: sidebar rộng 248px, vùng nội dung tối đa 1440px với padding 32px. Dashboard: hàng bốn `MetricCard`; dưới là lưới hai cột 7/5 cho lịch và điểm danh/nhận xét; các panel khác theo nội dung.
- Tablet `768–1023px`: điều hướng chuyển thành drawer mở từ top bar; padding 24px; `MetricGrid` hai cột; panel chính xếp một cột khi thiếu chỗ.
- Mobile `<768px`: top bar gọn, drawer; padding 16px; `MetricGrid` một cột; form một cột; action quan trọng đặt cạnh tiêu đề hoặc trong `{components.ActionBar}`. Bảng rộng cuộn ngang trong `{components.TableViewport}`, toàn trang không cuộn ngang.
- Các mốc 768 và 1024 thuộc khoảng phía trên tương ứng; không dùng breakpoint riêng trong từng feature. Khoảng cách giữa panel là `{spacing.6}`, bên trong card là `{spacing.4}` hoặc `{spacing.5}`. Luôn giữ `min-width: 0` ở grid child để bảng không làm tràn page.

## Elevation & Depth

Card trắng trên canvas ấm dùng viền `{colors.border}` và bóng rất nhẹ, không bóng đậm. Sidebar tách bằng viền, không dùng gradient. Khi hover, nâng card ít hơn 2px hoặc chỉ đổi viền; với `prefers-reduced-motion`, bỏ chuyển động. Thẻ pastel vẫn giữ viền mảnh để không chìm trên nền.

## Shapes

Input `{rounded.sm}`, nút/nav `{rounded.md}`, card `{rounded.lg}`, badge `{rounded.full}`. Hình tròn chỉ cho icon well và avatar chữ cái. Các góc mềm theo ảnh nguồn, nhưng không tạo khối viên thuốc lớn quanh bảng hoặc form.

## Components

| Component | Hình thức bắt buộc |
|---|---|
| `AppShell` | Sidebar `{colors.sidebar}` trên desktop, logo trong khối nền sáng; top bar đồng bộ trên tablet/mobile. Nội dung đặt trên `{colors.canvas}`. |
| `PageHeader` | Tên trang navy, mô tả muted, cụm action rõ ràng; không nhét tất cả bộ lọc vào cùng hàng ở 360px. |
| `MetricGrid` | 4/2/1 cột theo desktop/tablet/mobile, bốn thẻ CAP-1 cùng cấp; thứ tự DOM giữ nguyên khi xếp xuống. |
| `MetricCard` | Icon nét đơn 20–24px trong vòng nền pastel, nhãn, số lớn, dòng phụ. Bốn nền nhạt theo thứ tự mint/butter/lavender/coral; màu chữ số luôn navy. |
| `Card` | Nền trắng, viền mảnh, radius lớn, tiêu đề và action ở cùng vùng header; nội dung không chạm mép. |
| `Button` | Navy cho hành động chính theo tác vụ, coral cho “Thêm học sinh” và điểm nhấn tạo mới. Hover dùng màu đậm hơn; focus ring navy rõ; disabled giảm độ sáng nền nhưng chữ vẫn đọc được. |
| `NavItem` | Icon nét 20px + nhãn; active dùng `{colors.coral-tint}` và `{colors.coral-ink}` cùng chỉ báo dọc. Icon chung một bộ SVG nét 1.75–2px: nhà, học sinh, lịch, điểm danh, học phí, nhận xét, báo cáo, tài khoản, menu, đóng, mũi tên. Không dùng emoji làm icon. |
| `StatusBadge` | Nhãn chữ đầy đủ “Đang học”, “Đã nghỉ”, “Chưa bắt đầu”, “Có học”, “Vắng”, “Chưa điểm danh”, “Quá hạn”; màu ngữ nghĩa và icon nhỏ đi kèm. |
| `Field` | Label ở trên, control cao tối thiểu 44px, hint và lỗi nằm ngay dưới. Focus không làm layout nhảy. |
| `TableViewport` | Container viền sáng, `overflow-x: auto`, cột số căn phải, header còn đọc được khi cuộn; không thu chữ dưới body để ép bảng vừa điện thoại. |
| `ActionBar` | Trên mobile là hàng action có thể wrap; nút chính luôn thấy được. Không che dòng cuối của form/bảng. |
| `Skeleton` | Khối nhạt theo đúng hình học của bốn metric, card và bảng sẽ tới; không dùng spinner toàn trang. |

### Đối chiếu từng dòng kiểm kê với giao diện hiện tại

| Dòng trong `screen-inventory.md` | Bản đang chạy | Quyết định thiết kế |
|---|---|---|
| Sidebar bảy mục | Đủ bảy mục, chỉ có chữ | Giữ tên/thứ tự, thêm icon nét chung, active coral nhạt. |
| Lời chào “Chào bạn!” và Haninn | Header hiện là “Tổng quan — ngày”; sidebar chỉ chữ Haninn | Thêm lời chào theo brand và lockup logo; ngày chuyển thành nhãn phụ. |
| Thu nhập tháng + % | Có tiền tháng nhưng thiếu % và đứng cuối | Đưa lên thẻ 1, so tháng dương lịch liền trước; kỳ trước bằng 0 hiển thị “mới”. |
| Thu nhập năm + % | Thiếu cả hai | Đưa lên thẻ 2, so năm dương lịch liền trước. |
| Buổi hôm nay `5/12`, “Xem lịch tháng” | Bản chạy chỉ có danh sách “Hôm nay học gì” | Thẻ 3 hiển thị x/y **buổi trong ngày** theo định nghĩa CAP-1; link sang Lịch học. `12` trong ảnh không dùng làm mẫu số nếu dữ liệu không hỗ trợ. |
| Đã điểm danh `4/5`, nút “Điểm danh” | Có tỉ lệ theo kỳ ở khối dưới | Thẻ 4 dùng m/n của **ngày hôm nay**, có link sang Điểm danh; tỉ lệ theo kỳ có thể ở khối phụ. |
| Lịch học hôm nay và bốn giờ | Có danh sách buổi, chưa giống card nguồn | Giữ danh sách theo giờ, tên lớp, trạng thái và action; không gắn tên một học sinh như thể là cả buổi của lớp. |
| `Thứ 3, 16/09/2026` | Date formatter hiện dùng ngày thật | Hiển thị `Thứ Tư, 16/09/2026`; OCR phần thứ của ảnh không đáng tin. |
| “Có học” / “Vắng” | Dashboard hiện badge hoàn thành buổi; cá nhân ở Điểm danh | Dashboard tóm tắt trạng thái buổi, Điểm danh hiển thị trạng thái từng học sinh. Không gộp hai mức dữ liệu. |
| Nhận xét tháng 9 | Hiện “Nhận xét vừa cập nhật” dạng bảng | Khối trích một nhận xét mới nhất dễ đọc; link “Xem tất cả”; không dùng dữ liệu tên/SĐT thật từ ảnh. |
| `+ Thêm học sinh` | Form nằm trong trang Học sinh, dashboard không có CTA | CTA trên dashboard dẫn tới form cùng trang Học sinh; không mở wizard. |
| “Xem tất cả” / “Xem chi tiết” | Chưa rõ ở các card dashboard | Đặt ở card header với đích cụ thể; label có ngữ cảnh nếu cần cho screen reader. |
| Danh sách học sinh là màn riêng | Đúng | Giữ riêng, dashboard chỉ có CTA và chỉ số phụ. |
| Tiêu đề, tìm kiếm, lọc lớp | Có tên, SĐT, lớp; thiếu lọc trạng thái | Thêm lọc trạng thái mặc định “Đang học”; tìm kiếm/lọc nằm trên danh sách. |
| Cột `Mã` `[?]` | Không có mã học sinh | Không tạo ID giả để giống ảnh; chờ hợp đồng dữ liệu. |
| Họ tên, lớp, SĐT, học phí/tháng, lịch, trạng thái, thao tác | Có họ tên/lớp/SĐT/ngày bắt đầu/trạng thái/chi tiết; tiền và lịch ở hồ sơ/lớp | Desktop đưa học phí và lịch tóm tắt vào bảng khi có dữ liệu sở hữu; mobile giữ bảng cuộn trong khung. Không nhân bản công thức tiền. |
| Cột đếm `22/30` `[?]` | Không có | Không hiển thị; thiếu mốc khoá học để định nghĩa mẫu số. |
| Trạng thái “Đang học” / “Chưa bắt đầu” | Có, cùng “Đã nghỉ” | Badge đầy đủ; học sinh đã nghỉ chỉ hiện khi chọn lọc. |
| Các màn chỉ thấy tên qua sidebar | Đã có Lịch học, Điểm danh, Học phí, Nhận xét, Báo cáo | Dùng cùng shell, page header, card, form và bảng; chi tiết hành vi ở EXPERIENCE.md. |
| Đăng nhập, form, lỗi, công nợ, miễn giảm, hạn đóng, Excel chưa thấy trong ảnh | Bản chạy đã có các bề mặt này | Thiết kế tiếp theo dữ liệu thật và spec, không suy chúng từ ảnh; trạng thái ở EXPERIENCE.md. |

## Do's and Don'ts

| Làm | Tránh |
|---|---|
| Dùng logo đã trích từ nguồn và kiểm trên nền sáng ở desktop/mobile | Chèn nguyên board logo 1254×1254 vào sidebar hoặc vẽ lại biểu tượng |
| Giữ bốn thẻ CAP-1 ở thứ tự đã chốt | Thay chúng bằng số học sinh/phải thu/còn nợ ở hàng đầu |
| Dùng pastel làm nền, navy cho chữ, coral cho điểm nhấn | Dùng coral làm cả panel hoặc chữ coral gốc trên nền trắng |
| Bảng rộng cuộn bên trong `TableViewport` | Cho toàn trang cuộn ngang hoặc giảm cỡ chữ để ép cột |
| Dùng icon nét có nhãn và trạng thái có chữ | Dựa vào màu/icon đơn độc hoặc emoji |
| Duyệt ảnh chụp thật ở cả bốn viewport trước build | Coi mockup 1536px là bằng chứng đủ cho responsive |

### Bản xem trước để duyệt hướng hình thức

Xem [dashboard-preview.html](dashboard-preview.html) và ảnh chụp [360×800](dashboard-mobile.png), [768×1024](dashboard-tablet.png), [1024×768](dashboard-small-desktop.png), [1536×1024](dashboard-desktop.png). Đây là bản mô phỏng tĩnh dùng dữ liệu minh họa, không phải giao diện sản phẩm đã triển khai. Các nút/link trong bản xem trước biểu thị vị trí và nhãn, chưa thực hiện điều hướng. Asset logo ở đây được cắt hiển thị bằng CSS từ board nguồn; P-12g sẽ trích lockup sạch trước khi đưa vào app.
