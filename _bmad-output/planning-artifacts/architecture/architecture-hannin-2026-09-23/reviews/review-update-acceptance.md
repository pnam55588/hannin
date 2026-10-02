# Acceptance review — Architecture Spine

**Ngày:** 30/09/2026  
**Đối tượng:** `../ARCHITECTURE-SPINE.md`  
**Phạm vi audit cuối:** AD-16 và tái nhập học, AD-3 batch sessions, AD-17 request loader/read plan/projection  
**Lint:** **PASS — 0 finding**  
**Verdict:** **PASS — không còn finding chặn kiến trúc.**

## Kết quả kiểm tra

| Điểm kiểm tra | Kết quả | Bằng chứng |
| --- | --- | --- |
| AD-16 không viết lại lịch sử | **PASS** | `startedOn` và `leftOn` đều bất biến sau khi có dữ liệu tiền. “Hiện lại” chỉ là bộ lọc trạng thái; cấm xoá `leftOn`. Vì vậy AD-5/AD-7 không còn tự sinh công nợ cho thời gian học sinh đã nghỉ. |
| Tái nhập học được deferred đúng cách | **PASS** | Deferred ghi rõ cần lịch sử nhiều khoảng append-only và công thức chia học phí qua các khoảng; cho tới lúc đó đường “Cho học lại” phải bỏ. Điều kiện xem lại đủ rõ, không cho builder tự chọn mô hình. |
| AD-3 batch sessions contract | **PASS** | `sessionsBetween({ classIds, intervals })` đọc lịch một lần, trả kết quả toàn phần cho từng cặp lớp/khoảng và số query không tăng theo hai chiều fan-out. Helper một lớp chỉ lọc projection đã tải, cấm query riêng. AD-5 đã trỏ thẳng vào projection này. |
| AD-17 loader và read plan | **PASS** | Mỗi page/route/action có đúng một server loader; loader lập read plan và gọi mỗi projection batch đúng một lần; component con chỉ nhận read model, metric function nhận projection thuần và cấm tự tải lại. |
| Chia projection theo ownership | **PASS** | Read plan gọi projection qua `public.ts` của module sở hữu bảng; metric owner compose chúng và bị cấm join bảng ngoại miền. Chuỗi AD-1 → AD-2 → AD-17 hiện nhất quán. |
| Batch nhiều chiều và totality | **PASS** | AD-17 bao phủ nhiều lớp, nhiều học sinh, nhiều khoảng thời gian; output phân biệt zero, không áp dụng, thiếu dữ liệu và lỗi; universe công nợ giữ học sinh đã nghỉ còn nợ. |
| Ranh giới với AD-7 | **PASS** | Memoization chỉ được sống trong request và không thay read plan; cache React/Next xuyên request và mọi lưu kết quả vẫn bị cấm. |

## Good-spine checklist

| Tiêu chí | Kết quả |
| --- | --- |
| Khóa các divergence point cho cấp dưới | **PASS** |
| Rule thi hành được và ngăn đúng divergence | **PASS** |
| Deferred có điều kiện xem lại, không để unit tự quyết | **PASS** |
| Bao phủ capability và Sprint Change Proposal | **PASS** |
| Dependency, ownership và request orchestration nhất quán | **PASS** |
| Operational/environmental envelope được quyết định hoặc gated | **PASS** |
| Lint cơ học | **PASS — 0 finding** |

## Các cổng triển khai không phải blocker của spine

- `vercel.json` vẫn phải thêm `regions: ["hnd1"]`, deploy lại và xác nhận Function chạy tại Tokyo.
- Backup gate của AD-15 vẫn đóng cho dữ liệu thật cho tới khi job trả 200, runbook có retention/giám sát/owner, và restore thành công trên project tạm.
- Mã/UI hiện có phải bỏ action “Cho học lại”; bộ lọc trạng thái là đường duy nhất để xem lại học sinh đã nghỉ trong phạm vi hiện tại.

Ba mục trên đã được spine ghi trung thực là target hoặc gate đang chờ thi hành. Chúng là điều kiện nghiệm thu implementation, không phải thiếu quyết định kiến trúc.

## Kết luận

Blocker cuối về việc xoá `leftOn` đã được đóng mà không mở lại mô hình nhiều khoảng ngoài phạm vi. AD-3 và AD-17 giờ tạo thành một hợp đồng liền mạch: loader lập read plan → gọi projection batch toàn phần của module owner một lần → truyền dữ liệu thuần cho metric owner → component chỉ render read model. **Architecture Spine đạt gate và sẵn sàng bàn giao sang UX/implementation theo thứ tự đã duyệt.**
