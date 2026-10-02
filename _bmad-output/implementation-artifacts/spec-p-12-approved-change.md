---
title: 'P-12 — hiệu năng và giao diện Haninn'
type: 'feature'
created: '2026-09-30'
status: 'in-review'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '0c63ec0ffffe20881fbf5fd8b882ee95e430662a'
context:
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-26.md
  - _bmad-output/planning-artifacts/ux/DESIGN.md
  - _bmad-output/planning-artifacts/ux/EXPERIENCE.md
---

<frozen-after-approval reason="Ý định người dùng: đã duyệt P-11 và yêu cầu triển khai trọn P-12">

## Intent

**Vấn đề:** App hiện còn chậm vì lệch region và truy vấn lặp, dashboard thiếu chỉ số đã chốt, giao diện tối/khó dùng trên màn hẹp, thiếu logo, bộ lọc trạng thái và skeleton.

**Hướng làm:** Thực hiện P-12a–i theo Sprint Change Proposal; bắt đầu bằng P-1 (`hnd1`), rồi gom dữ liệu học phí/điểm danh, cuối cùng triển khai giao diện theo DESIGN.md và EXPERIENCE.md đã được khách duyệt.

## Boundaries & Constraints

**Luôn giữ:** Tiền tính từ sổ thu theo ngày thu; công thức học phí AD-5; học sinh đã nghỉ còn nợ vẫn hiện ở công nợ; cùng bốn chỉ số CAP-1 theo ngày Việt Nam; token và breakpoint tập trung; chức năng đầy đủ ở 360, 768, 1024 và 1536px.

**Không làm:** Migration, bảng cache/tổng hợp, đổi mặc định `listStudents`, xóa cứng hoặc cho học lại bằng cách xóa `leftOn`, mở rộng sang P-13 hay RSK-1.

## I/O & Edge-Case Matrix

| Tình huống | Đầu vào / trạng thái | Kết quả | Lỗi |
|---|---|---|---|
| Kỳ trước không có thu | Thu tháng/năm trước bằng 0 | Hiện “Mới”, không chia cho 0 | Thu thất bại không cập nhật giả |
| Học sinh đã nghỉ còn nợ | `leftOn` có giá trị, dư nợ dương | Ẩn ở danh sách mặc định, còn ở danh sách nợ | Bộ lọc URL cho xem lại |
| Chưa đến giờ học | Hôm nay có lịch nhưng chưa tới buổi đầu | `0/y` và `0/0` điểm danh | Không đếm buổi tương lai đã lưu trước |
| Bảng rộng trên điện thoại | Viewport 360px | Chỉ khung bảng cuộn ngang | Không có cuộn ngang toàn trang |

</frozen-after-approval>

## Code Map

- `vercel.json`: thêm `regions: ["hnd1"]`; không đổi cron.
- `src/modules/classes/public.ts`, `data/queries.ts`: sinh buổi theo lịch hiệu lực; mở đường batch cho các lớp.
- `src/modules/attendance/public.ts`, `data/queries.ts`: tỷ lệ theo lớp đang truy vấn lặp; `sessionsForDate` có `complete`.
- `src/modules/tuition/public.ts`: `chargesForPeriod` dùng chung trong request, không đổi `domain/pricing.ts`.
- `src/modules/payments/public.ts`: nguồn chuẩn thu nhập theo ngày thu.
- `src/app/(app)/dashboard/page.tsx`: bốn thẻ hiện sai CAP-1; dùng API public và đồng hồ `Asia/Ho_Chi_Minh`.
- `src/app/(app)/students/page.tsx`: lọc trạng thái chỉ tại UI và qua URL.
- `src/app/(app)/layout.tsx`, `src/components/{app-nav,ui,form-kit}.tsx`, `src/app/globals.css`: shell, token, form và bảng responsive.
- `src/modules/students/ui/student-forms.tsx`: bỏ action “Cho học lại” trái AD-16.
- `src/app/layout.tsx`, `src/app/login/page.tsx`, `public/`: đặt logo nguồn đã trích và favicon.
- `scripts/verify-perf.mjs`: đo HTTP sau đăng nhập, thất bại rõ khi vượt ngân sách.

## Tasks & Acceptance

**Thực hiện:**
- [x] `vercel.json` — đặt region `hnd1` trước mọi thay đổi khác.
- [x] Module classes/attendance/tuition — dùng API lịch theo lô có sẵn và chung bộ dữ liệu tính phí/điểm danh.
- [x] App dashboard/students — bốn chỉ số CAP-1, lọc `active` mặc định, giữ nợ của người đã nghỉ.
- [x] Shell, shared UI và các trang — token sáng, icon SVG, drawer dưới 1024px, bảng/form responsive, skeleton.
- [x] Brand asset và metadata — logo tại sidebar/login, favicon.
- [x] `scripts/verify-perf.mjs` — đo dashboard <800ms, trang khác <500ms, báo lỗi/exit khác 0 nếu không đạt.

**Nghiệm thu:**
- Given đã đăng nhập trên deploy mới, when xem `x-vercel-id`, then function ở `hnd1`.
- Given kỳ trước bằng 0, when mở dashboard, then thẻ thu nhập hiện “Mới”.
- Given học sinh đã nghỉ còn nợ, when mở danh sách mặc định và công nợ, then chỉ công nợ còn hiển thị người đó.
- Given bốn viewport đã chốt, when đi qua các trang, then không cuộn ngang toàn trang và tác vụ vẫn dùng được.

## Implementation Notes

- P-1 được làm đầu tiên: `vercel.json` định vùng `hnd1`, cron giữ nguyên.
- Học phí dùng `billingForPeriod` để tính charge và payment một lần cho dashboard, học phí, báo cáo. Điểm danh kỳ gom lịch, sổ điểm danh và học sinh thay vì gọi theo từng lớp/buổi.
- Dashboard hiển thị bốn chỉ số CAP-1 theo giờ Việt Nam và các mốc so sánh tháng/năm liền trước. Danh sách học sinh lọc trạng thái ở UI; API `listStudents` vẫn trả đầy đủ cho công nợ/báo cáo.
- Bỏ hành động cho học lại và chặn đổi/xóa `leftOn` đã ghi ở server. Logo được trích từ board nguồn vào `public/`.
- Chưa deploy. Vì vậy chưa thể xác nhận `x-vercel-id`, ngân sách thời gian hoặc ảnh của bản chạy có dữ liệu ở bốn viewport.

## Spec Change Log

## Review Triage Log

## Verification

Đã chạy trực tiếp CLI từ `node_modules` vì shim `pnpm` bị NVM chặn: TypeScript đạt, 38/38 test đạt, Next production build đạt với `DATABASE_URL`/`AUTH_SECRET` giả chỉ dùng lúc build, `git diff --check` đạt. Lint chưa chạy được vì repo thiếu `eslint.config.*`. Cần kiểm tra ảnh của bản chạy tại bốn viewport và chạy `node scripts/verify-perf.mjs` sau deploy ở `hnd1`; chưa có chứng cứ đạt ngân sách production.
