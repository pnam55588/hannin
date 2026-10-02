# Final gate — Architecture Spine sau vòng sửa reviewer

**Ngày:** 30/09/2026  
**Đối tượng:** `../ARCHITECTURE-SPINE.md`  
**Phương pháp:** lint cơ học + Good-spine checklist, tập trung vào tách dev/prod, vòng đời học sinh, dependency/ownership, AD-17, responsive, backup và region  
**Lint:** **PASS**, 0 finding  
**Verdict:** **CHƯA QUA GATE — còn 1 finding chặn về tính toàn vẹn công nợ lịch sử.** Các finding kiến trúc còn lại của ba reviewer đã được xử lý đủ để bàn giao sau khi sửa finding này. Hai việc `hnd1` và backup/restore là cổng triển khai đã được spine mô tả đúng trạng thái chờ, không còn là lỗi tài liệu.

## 1. Finding còn chặn

### CRITICAL — “Cho học lại” bằng cách xoá `leftOn` viết lại lịch sử nghĩa vụ học phí

**Vị trí:** AD-5, AD-7, AD-16; ER `STUDENT.started_on/left_on`.

AD-16 hiện quy định một học sinh có đúng một cặp `startedOn`/`leftOn`, rồi quy định: **“Cho học lại là xoá `leftOn`, không đổi `startedOn`.”** Giả sử học sinh bắt đầu ngày 01/01, nghỉ ngày 31/03, học lại ngày 01/06. Khi xoá `leftOn`, dữ liệu gốc nói học sinh học liên tục từ 01/01 tới hiện tại. AD-5 vì vậy sẽ sinh lại số phải thu cho tháng 4 và 5; AD-7 lại yêu cầu mọi công nợ được tính lại từ dữ liệu gốc, nên không có snapshot nào giữ được khoảng nghỉ cũ.

Đây không chỉ là thiếu hỗ trợ một trường hợp hiếm: đường **“Cho học lại” đã tồn tại trong sản phẩm và nằm trong bằng chứng của Sprint Change Proposal**. Hai builder có thể chọn hai cách không tương thích nhưng đều cố tuân spine: một bên xoá `leftOn` đúng chữ và tính thêm nợ trong thời gian nghỉ; bên kia tự thêm lịch sử nhiều khoảng để giữ nghĩa vụ cũ.

**Checklist vi phạm:** Rule không ngăn divergence; nguồn dữ liệu không đủ tái dựng capability CAP-5/CAP-8; thay đổi dữ liệu hiện tại làm sai lịch sử tiền.

**Điều kiện đóng gate:** AD-16 phải lưu được nhiều khoảng học bất biến theo thời gian. Có hai hướng hợp lệ:

1. Lịch sử vòng đời append-only gồm các khoảng `[startedOn, leftOn]`; cho học lại thêm khoảng mới và không sửa khoảng cũ.
2. Nếu sản phẩm chỉ cho đúng một lần học, bỏ hành vi “Cho học lại” khỏi hợp đồng và UI; không được xoá `leftOn` sau khi đã phát sinh dữ liệu tiền.

Nếu chọn hướng 1, cần sửa ER và nêu rõ AD-5 tính nghĩa vụ trên hợp các khoảng học giao với kỳ. Tên bảng không nhất thiết là `enrollment`, nhưng dữ liệu phải giữ được mọi khoảng; câu cấm bảng enrollment hiện tại không được làm mất lịch sử này.

## 2. Kiểm tra các điểm được yêu cầu

| Điểm kiểm tra | Kết quả | Bằng chứng và giới hạn |
| --- | --- | --- |
| Tách dev/prod | **PASS** | AD-15 buộc database/project tách biệt, dev chỉ có dữ liệu giả và không có production credential; Structural Seed đã vẽ `Dev database` riêng. Không còn mâu thuẫn với production Supabase. |
| `startedOn`/`leftOn` | **FAIL** | Đủ cho một khoảng học, không đủ cho nghỉ rồi học lại. Việc xoá `leftOn` làm sai lịch sử công nợ. Đây là finding duy nhất chặn tài liệu. |
| AD-1 dependency | **PASS** | Luồng nội module đã rõ: `ui → actions → public → data/domain`, `page → public`, `data → domain`; `public.ts` orchestration, `data/` là nơi duy nhất chạm Drizzle, domain thuần. Sơ đồ và Rule khớp nhau. |
| AD-2 ownership | **PASS** | Mỗi bảng có một owner cho ghi và projection đọc; metric owner compose projection batch qua public API và bị cấm join trực tiếp bảng ngoại miền. Luật đủ để phân xử `tuition`/`students`/`classes`/`payments`. |
| AD-17 request loader | **PASS** | Request scope được định nghĩa cho page render, Route Handler và Server Action; mỗi consumer có một server loader, component con nhận read model và cấm tự đọc DB. Memoization trong scope được phân biệt rõ với cache xuyên request. |
| AD-17 batch contract | **PASS** | Input universe tường minh, output total cho từng ID; zero/not-applicable/missing/error tách biệt; universe công nợ giữ học sinh đã nghỉ còn nợ. Đây là hợp đồng đủ cho UI và export dùng cùng nghĩa. |
| AD-17 nhiều khoảng | **PASS có lưu ý nhỏ** | Rule buộc batch theo nhiều khoảng và nêu Dashboard chỉ đọc payment một lần cho tháng hiện tại/tháng trước/năm hiện tại/năm trước. Khi định nghĩa API cụ thể, nên trả ma trận đầy đủ `ID × interval` hoặc một record/ID chứa đủ mọi interval; đây là chi tiết contract, không chặn spine vì luật “đọc một lần” và tổng tính đã rõ. |
| Responsive primitives | **PASS** | Breakpoint `<768`, `768–1023`, `≥1024`; cấm media query cục bộ; shared primitives `AppShell`, `PageHeader`, `MetricGrid`, `FormGrid`, `TableViewport`, `ActionBar`; 1/2/4 cột và bốn viewport nghiệm thu đều rõ. |
| Backup gate | **PASS ở cấp spine** | AD-15 ghim private object storage tách khỏi Postgres và chặn dữ liệu thật cho tới khi job 200, runbook có retention/monitoring/owner, và restore thành công trên project tạm. Deferred nói đúng trạng thái hiện tại: job 503 và gate còn đóng. Provider/retention có thể được chốt trong runbook vì spine đã quy định điều kiện bắt buộc và revisit condition. |
| Region chờ triển khai | **PASS ở cấp spine; chưa đạt production** | AD-15 ghim mục tiêu `hnd1`; Stack nói rõ repo hiện chưa tuân và P-1 còn chờ Dev. Không còn tuyên bố sai rằng `vercel.json` đã có region. Điều kiện nghiệm thu implementation vẫn là thêm `regions: ["hnd1"]`, deploy lại và kiểm chứng Function thực chạy tại Tokyo. |

## 3. Good-spine checklist

| Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- |
| Khóa các điểm divergence thật | **Không đạt do 1 blocker** | Hành vi học lại vẫn có hai mô hình dữ liệu khả dĩ và một mô hình làm sai tiền. Các seam còn lại đã khóa. |
| Rule thi hành được, ngăn đúng divergence | **Đạt ngoài AD-16** | AD-1/2/15/17 đều có thể review bằng code/config. |
| Deferred không cho unit tự chọn không tương thích | **Đạt** | Local build và backup có điều kiện xem lại/gate rõ. |
| Công nghệ và trạng thái triển khai được mô tả trung thực | **Đạt** | Bảng Stack đã đổi từ tuyên bố “latest” sang các bản đang pin và nêu region chờ triển khai. |
| Ratify brownfield hoặc chỉ rõ target delta | **Đạt** | Region và backup được ghi là target chưa đạt; không còn giả định repo đã tuân. |
| Bao phủ capability từ spec/proposal | **Không đạt do 1 blocker** | CAP-5/CAP-8 sai sau thao tác học lại. P-2…P-6 và responsive đã landed. |
| Operational/environmental envelope | **Đạt** | Dev/prod, region, TLS, pooler, migration, backup gate và restore target đã được quyết định hoặc deferred có điều kiện. |

## 4. Kết luận gate

Spine đã xử lý đầy đủ các finding về tách môi trường, dependency và ownership, request orchestration, batch totality, nhiều khoảng so sánh, responsive primitives, backup gate và việc region còn chờ triển khai. **Chỉ còn AD-16 chặn handoff:** không thể vừa giữ đúng công nợ lịch sử vừa hỗ trợ “Cho học lại” bằng một cặp `startedOn/leftOn` bị sửa tại chỗ.

Sau khi AD-16 và ER chuyển sang lịch sử nhiều khoảng hoặc bỏ hẳn hành vi học lại, rubric gate có thể chuyển thành **PASS** mà không cần thêm quyết định kiến trúc nào khác.
