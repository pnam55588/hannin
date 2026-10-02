---
name: 'Acceptance đối kháng cuối — Architecture Spine'
type: architecture-review
reviewer: 'Winston — reviewer đối kháng độc lập'
reviewed: '2026-09-30'
target: '../ARCHITECTURE-SPINE.md'
scope: 'AD-3 batch classIds×intervals, AD-17 read plan/projection thuần, AD-16 leftOn và các finding critical/high trước'
verdict: 'PASS — không còn blocker trong phạm vi audit'
---

# Acceptance đối kháng cuối — Architecture Spine

## Verdict

**PASS — không còn blocker trong phạm vi AD-3/7/12/16/17, ownership dữ liệu, batching, request scope và responsive.**

Ba sửa đổi cuối đã khép chuỗi kiến trúc từ nguồn dữ liệu tới consumer:

1. AD-3 có một projection batch `sessionsBetween({ classIds, intervals })`, đọc lịch một lần và trả kết quả toàn phần theo từng cặp lớp/khoảng.
2. AD-17 buộc loader lập read plan, gọi mỗi projection đúng một lần, rồi truyền projection thuần vào metric owner; metric owner bị cấm tự tải lại.
3. AD-16 làm `leftOn` bất biến sau khi có dữ liệu tiền, giải thích “hiện lại” là lọc để xem, và hoãn tái nhập học cho tới khi có mô hình nhiều khoảng học append-only.

## Kết quả dựng lại các unit từng xung đột

| Cặp unit | Phép thử đối kháng | Kết quả |
| --- | --- | --- |
| `classes` ↔ `tuition`/`attendance` | Một bên giữ API một lớp; bên kia đòi batch nhiều lớp/nhiều khoảng | **Không còn hợp lệ.** AD-3 chỉ cho projection batch, wrapper một lớp chỉ được lọc projection đã tải và cấm query. |
| Dashboard loader ↔ metric owners | Hai metric owner tự tải lại cùng projection | **Không còn hợp lệ.** AD-17 buộc loader gọi mỗi projection đúng một lần và metric owner cấm tự tải lại. |
| Owner bảng ↔ owner chỉ số | Metric owner join trực tiếp bảng ngoại miền | **Không còn hợp lệ.** AD-2 buộc compose projection qua `public.ts` của owner bảng. |
| UI ↔ Excel/report | Consumer tự tính lại chỉ số hoặc tự diễn giải hàng thiếu | **Không còn hợp lệ.** AD-12 giữ một owner; AD-17 bắt output toàn phần và tách zero/không áp dụng/thiếu dữ liệu/lỗi. |
| Danh sách học sinh ↔ công nợ | Lọc học sinh đã nghỉ khỏi universe nợ | **Không còn hợp lệ.** AD-17 lấy universe từ nghĩa vụ kỳ và giữ người đã nghỉ còn nợ. |
| Bộ lọc “Đã nghỉ” ↔ vòng đời học sinh | Xoá `leftOn` để học sinh xuất hiện lại | **Không còn hợp lệ.** AD-16 định nghĩa “hiện lại” là xem bằng bộ lọc và cấm đường cho học lại hiện tại. |
| App shell ↔ feature UI | Feature tự chọn breakpoint/media query | **Không còn hợp lệ.** Convention chốt ba khoảng breakpoint, shared primitives và cấm media query riêng. |

## Kiểm tra ba điểm sửa cuối

### AD-3: projection sessions batch

Contract hiện tại đủ để các unit triển khai độc lập thống nhất:

- input có hai chiều fan-out tường minh: `classIds` và `intervals`;
- output toàn phần theo `(classId, interval)`;
- số query không tăng theo số lớp hoặc khoảng;
- wrapper một lớp không được tạo thêm I/O;
- AD-5 dùng chính projection batch, nên học phí không có đường lặp query riêng.

Không còn cách hợp lệ để giữ hàm query đơn lớp cũ.

### AD-17: read plan và projection thuần

Contract hiện tại phân vai đủ rõ:

- page render, Route Handler hoặc Server Action là request scope;
- mỗi consumer có một loader/orchestrator;
- loader quyết định read plan và gọi mỗi projection batch đúng một lần;
- metric owner nhận dữ liệu đã tải, tính công thức duy nhất và không được tự query;
- component chỉ nhận read model qua props;
- memoization trong scope chỉ là hàng rào, không thay read plan;
- cache xuyên request vẫn bị AD-7 cấm.

Với các luật này, việc tách card thành React Server Component không còn được phép làm tăng số query.

### AD-16: `leftOn` và tái nhập học

Contract hiện tại không còn hai cách hiểu “hiện lại”:

- “hiện lại” nghĩa là chọn bộ lọc để xem học sinh đã nghỉ;
- nó không thay đổi vòng đời và không xoá `leftOn`;
- sau khi có dữ liệu tiền, `startedOn` và `leftOn` đều bất biến;
- tái nhập học là thay đổi mô hình, đã được đưa vào Deferred với lịch sử nhiều khoảng học append-only.

Do đó công nợ, dữ liệu điểm danh và báo cáo lịch sử không thể bị viết lại bằng thao tác UI lọc trạng thái.

## Gate triển khai không chặn acceptance

Các điểm dưới đây là bằng chứng cần có khi build, không phải thiếu hụt kiến trúc:

- contract test cho `sessionsBetween` với nhiều lớp, nhiều khoảng, lớp không có lịch và khoảng không có buổi;
- instrumentation xác nhận mỗi projection chỉ chạy một lần trong Dashboard và Tuition request;
- contract test cho zero/không áp dụng/thiếu dữ liệu/lỗi;
- test học sinh đã nghỉ còn nợ vẫn xuất hiện ở Tuition nhưng vắng khỏi danh sách học sinh mặc định;
- kiểm tra bốn viewport bằng shared primitives tại 360, 768, 1024 và 1536 px.

## Acceptance

Không còn finding critical/high nào từ các review trước tồn tại sau bản sửa này. Architecture Spine đủ nhất quán để bàn giao cho UX và implementation trong phạm vi thay đổi đã duyệt.

