---
name: 'Review đối kháng cuối — Architecture Spine sau sửa AD-1/2/17'
type: architecture-review
reviewer: 'Winston — reviewer đối kháng độc lập'
reviewed: '2026-09-30'
target: '../ARCHITECTURE-SPINE.md'
scope: 'Tái kiểm critical/high về AD-7, AD-12, AD-17, ownership, batching, request scope và responsive'
verdict: 'FAIL — còn một mâu thuẫn critical và một lỗ hổng high'
---

# Review đối kháng cuối — Architecture Spine

## Verdict

**FAIL — bản sửa đã đóng phần lớn finding trước, nhưng còn một mâu thuẫn critical giữa AD-3 và AD-17, cùng một lỗ hổng high trong việc chia sẻ projection giữa nhiều metric của cùng request.**

Responsive đã đủ rõ ở cấp architecture để các unit ghép được: breakpoint có biên chính xác, media query feature bị cấm, primitive dùng chung đã có tên, và `MetricGrid` có số cột xác định. Ownership bảng/chỉ số cũng đã chọn được mô hình: owner bảng xuất projection batch; owner chỉ số compose qua `public.ts`; join ngoại miền bị cấm.

## Trạng thái năm finding trước

| Finding trước | Trạng thái | Bằng chứng trong spine mới |
| --- | --- | --- |
| F1 — ownership bảng xung đột ownership chỉ số | **Đã đóng** | AD-2 chốt owner bảng sở hữu write/read projection; metric owner compose projection qua `public.ts`, cấm join bảng ngoại miền. |
| F2 — request scope và nơi orchestration mơ hồ | **Đã đóng** | AD-17 định nghĩa scope là page render/Route Handler/Server Action; một loader ở biên; component con chỉ nhận props; memoization chỉ sống trong scope. |
| F3 — batch thiếu contract zero/missing/error | **Đã đóng** | AD-17 bắt universe ID tường minh, kết quả toàn phần và bốn trạng thái riêng; công nợ giữ học sinh đã nghỉ còn nợ. |
| F4 — bỏ ngỏ batch nhiều khoảng CAP-1 | **Đã đóng cho payment/CAP-1** | AD-17 bắt batch mọi chiều fan-out và nêu rõ Dashboard chỉ đọc payment một lần cho bốn khoảng. |
| F5 — responsive thiếu breakpoint và primitive | **Đã đóng** | Convention UI chốt `<768`, `768–1023`, `≥1024`; shared primitives và `MetricGrid` 1/2/4 cột; cấm media query riêng. |

## Finding còn chặn

### R1 — Critical: AD-3 cấm chính batch API mà AD-17 bắt buộc

**Vị trí:** AD-3 dòng 51–55; AD-12 dòng 105–109; AD-17 dòng 135–139.

AD-3 quy định `classes/public.ts` xuất **đúng một hàm** sinh buổi với chữ ký `sessionsBetween(classId, from, to)`. Hàm này nhận một lớp và một khoảng. AD-17 lại bắt projection phải batch theo nhiều lớp và nhiều khoảng; Dashboard chỉ được đọc nguồn một lần, và metric owner cấm join trực tiếp bảng `schedule_slot` của module classes.

**Hai unit không thể ghép mà vẫn đồng thời tuân cả hai AD:**

- Unit A (`classes/public.ts`) giữ đúng `sessionsBetween(classId, from, to)`. `tuition` hoặc `attendance` lặp qua `classIds × intervals` để gọi hàm này. A tuân AD-3 nhưng vi phạm AD-17.
- Unit B thêm `sessionsBetweenBatch(classIds, intervals)` hoặc đổi chữ ký `sessionsBetween` sang tập lớp/tập khoảng. B tuân AD-17 nhưng vi phạm câu “xuất đúng một hàm `sessionsBetween(classId, from, to)`” của AD-3; các unit được viết theo chữ ký cũ cũng không còn ghép trực tiếp.

Không thể giải quyết bằng cách để metric owner query `schedule_slot`, vì AD-2 đã cấm join bảng ngoại miền. Cũng không thể bọc vòng lặp trong `classes/public.ts`: dù chỉ có một lời gọi từ consumer, module classes vẫn thực hiện fan-out và có thể đọc dữ liệu nhiều lần, trái yêu cầu batch của AD-17.

**Sửa tối thiểu:** thay câu AD-3 bằng một contract batch duy nhất, ví dụ `sessionsBetween(classIds, intervals)` trả kết quả toàn phần theo `(classId, interval)`; hàm tiện ích một lớp nếu cần chỉ được là wrapper thuần trên dữ liệu đã tải, không được tự query. Đồng thời sửa các tham chiếu ở AD-5 từ chữ ký đơn sang contract batch.

**Gate:** với N lớp và M khoảng, số query `schedule_slot` không tăng theo N hoặc M; không có API public thứ hai tự cài lại luật sinh buổi.

### R2 — High: một loader có nhiều metric owner vẫn có thể đọc cùng projection nhiều lần

**Vị trí:** AD-2 dòng 45–49; AD-12 dòng 105–109; AD-17 dòng 135–139.

AD-17 đã chặn component con tự đọc database, nhưng chưa chốt cách các metric owner chia sẻ cùng projection trong một loader. Câu “loader gọi các projection batch” và câu ngay sau “module chỉ số ghép projection” cho phép hai cách orchestration khác nhau.

**Hai unit đều đúng chữ nhưng query plan khác nhau:**

- Unit A: Dashboard loader gọi `classes/public.sessions…` để dựng chỉ số số buổi hôm nay. Đồng thời nó gọi `attendance/public.attendanceRate…`; metric owner attendance lại gọi projection sessions của classes để xác định mẫu số. Cả hai lời gọi đều batch, mỗi chỉ số chỉ tính một lần, component không đọc DB, nhưng `schedule_slot` bị đọc hai lần trong cùng request.
- Unit B: loader tải projection classes một lần rồi truyền cùng read model vào hai hàm domain/metric owner. Nó đạt mục tiêu “đọc một lần”, nhưng spine chưa xác định kiểu input projection, ai sở hữu read model chung, hay metric public API có bắt buộc nhận dữ liệu đã tải sẵn hay không.

Tình huống tương tự xảy ra ở `students`/`payments` khi một request vừa cần công nợ tổng vừa cần danh sách người còn nợ. AD-12 ngăn cài lại công thức, nhưng không ngăn hai owner đọc lại cùng projection.

**Sửa tối thiểu:** chọn một trong hai contract và ghi thẳng vào AD-17:

1. loader tải mỗi projection cần thiết đúng một lần rồi truyền projection thuần vào metric owner; hoặc
2. tạo request context/read-plan cục bộ cho scope, và mọi projection public bắt buộc dedupe qua context đó.

Với quy mô hiện tại, phương án 1 đơn giản hơn và phù hợp luật “boring technology”: page/route loader lập read plan, gọi projection batch một lần, rồi gọi hàm thuần của owner để tính metric. `public.ts` vẫn là mặt tiếp xúc; domain nội bộ không bị import xuyên module.

**Gate:** instrumentation cho Dashboard phải chứng minh mỗi bảng nguồn chỉ bị đọc một lần trong request ngay cả khi hai chỉ số dùng chung projection; tách/gộp card không làm tăng số query.

## Phép thử unit sau sửa

| Phép thử | Kỳ vọng |
| --- | --- |
| `classes` phục vụ 12 lớp × 4 khoảng | Một projection query; output đủ mọi `(classId, interval)` |
| Dashboard có card số buổi và card điểm danh | Cùng dùng một projection sessions; không đọc `schedule_slot` lần hai |
| Tuition trả tổng công nợ và danh sách người nợ | Projection student/rate/payment được tải một lần mỗi loại |
| Lớp không có session/payment | Có kết quả zero/không áp dụng tường minh, không suy từ hàng bị thiếu |
| Học sinh đã nghỉ còn nợ | Vẫn nằm trong universe công nợ |
| 360, 768, 1024, 1536 px | Shared primitives lần lượt dùng layout mobile/tablet/desktop đã chốt |

## Điều kiện đổi verdict

Chỉ còn hai thay đổi kiến trúc cần thiết:

1. thay contract `sessionsBetween` đơn bằng contract batch tương thích AD-17;
2. chốt cơ chế chia sẻ projection giữa nhiều metric owner trong cùng loader.

Sau đó không còn unit không tương thích nào trong phạm vi AD-7/12/17, ownership, batching, request scope và responsive mà review này dựng được.

