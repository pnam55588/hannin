# Review rubric — bản cập nhật P-2…P-6 và AD-17

**Đối tượng:** `ARCHITECTURE-SPINE.md`, bản cập nhật 30/09/2026  
**Lăng kính:** Good-spine checklist trong `references/reviewer-gate.md`  
**Phạm vi:** kiểm tra P-2…P-6 và AD-17, đồng thời rà toàn spine để tìm xung đột  
**Verdict:** **CHƯA SẴN SÀNG BÀN GIAO — ĐẠT MỘT PHẦN.** P-2…P-6 đã được đưa vào đúng vị trí, AD-17 tương thích với AD-7 và AD-12, nhưng toàn spine còn hai xung đột có thể dẫn hai đơn vị triển khai tới hai hệ thống dữ liệu khác nhau, cùng một khoảng trống vận hành quan trọng.

## 1. Kết quả riêng cho P-2…P-6

| Mục | Kết quả | Nhận xét |
| --- | --- | --- |
| P-2 — AD-15 cùng vùng | Đạt | AD-15 ghim Vercel Function tại `hnd1`, cùng địa lý Tokyo với Supabase `ap-northeast-1`, và buộc cấu hình trong `vercel.json`. Luật đủ cụ thể để review mã triển khai. |
| P-3 — AD-17 | Đạt có điều kiện | Ranh giới với AD-7 rõ: gom đọc và tái sử dụng trong một request, cấm cache xuyên request. Cụm “khi cùng tập dữ liệu có thể lấy trong một truy vấn” vẫn cần tiêu chí đo ở spec/test hiệu năng; proposal đã giao việc này cho P-9/P-12i nên không phải blocker riêng của spine. |
| P-4 — AD-12 theo lô | Đạt | Buộc hàm sở hữu trả nhiều lớp trong một lời gọi và cấm caller lặp theo lớp. Quyền sở hữu công thức vẫn giữ một chỗ. |
| P-5 — Stack region | Đạt | Dòng `hnd1` khớp AD-15 và Structural Seed. |
| P-6 — local build Deferred | Đạt | Có lý do trì hoãn và điều kiện xem lại: năng lực máy khách, nguồn dữ liệu chuẩn, trách nhiệm đồng bộ. Mục này không cho phép người build tự ý chọn local. |
| Responsive bổ sung | Đạt ở độ cao kiến trúc | Bốn viewport, token/breakpoint tập trung, không cuộn ngang toàn trang và cách xử lý bảng rộng đã được ghi ở Consistency Conventions. Chi tiết bố cục thuộc vòng UX tiếp theo. |

## 2. Findings cần xử lý

### CRITICAL-1 — Dev trỏ vào chính Supabase production, trái AD-15 và không có ranh giới môi trường

**Bằng chứng.** AD-15 bắt buộc “dev dùng dữ liệu giả”. Structural Seed lại vẽ `Dev: trỏ thẳng vào project Supabase khi máy chưa có Postgres cục bộ` tới đúng nút `Supabase Postgres 17.6 — Tokyo` mà production dùng. Spine không khai project/schema/database riêng cho dev, cũng không cấm dev chạm dữ liệu production.

**Divergence thực tế.** Một builder có thể dùng chung project production rồi seed dữ liệu giả; builder khác có thể tạo project dev riêng. Cả hai đều có thể viện dẫn spine. Phương án đầu sẽ trộn seed/test với sổ thu thật và khiến migration/dev query có thể tác động dữ liệu thật.

**Checklist vi phạm.** Luật phải thi hành được; operational/environmental envelope phải được quyết định hoặc deferred; spine không được tự mâu thuẫn.

**Xử lý đề nghị:** **autofix trước handoff.** Chọn và ghi một chiến lược môi trường duy nhất. Tối thiểu, AD-15 và sơ đồ phải nói dev dùng database/project tách biệt chứa dữ liệu giả; production credentials không được cấp cho dev. Nếu tạm thời bắt buộc dùng chung Supabase project, phải có ranh giới schema/database và quyền truy cập đủ mạnh để chứng minh không thể chạm dữ liệu production.

### CRITICAL-2 — Mô hình vòng đời học sinh không đủ dữ liệu để thi hành AD-5

**Bằng chứng.** AD-5 cần biết cả ngày bắt đầu và ngày nghỉ để tính học phí tháng lệch và tái tính mọi kỳ từ dữ liệu gốc. AD-16 chỉ quy định một `status` kèm một `status_from`; ER cũng chỉ có `STUDENT.status` và `STUDENT.status_from`. Khi học sinh chuyển `chưa bắt đầu → đang học → đã nghỉ`, việc ghi trạng thái cuối cùng sẽ làm mất ít nhất một mốc cần cho phép tính lịch sử. Spine đồng thời cấm bảng enrollment và AD-7 cấm lưu số dẫn xuất, nên không có nguồn nào khác để tái dựng ngày bắt đầu.

**Divergence thực tế.** Builder A sẽ thêm `started_on` và `left_on`; builder B sẽ tạo lịch sử trạng thái; builder C sẽ ghi đè `status_from` và cho ra công nợ quá khứ sai. Đây là một điểm rẽ dữ liệu cốt lõi giữa CAP-2, CAP-5 và CAP-8.

**Checklist vi phạm.** Chưa cố định điểm phân kỳ thật ở cấp dưới; Rule không thực thi đủ để ngăn divergence; mô hình hiện tại không bao phủ đầy đủ capability tiền.

**Xử lý đề nghị:** **thảo luận rồi sửa AD-16/ER.** Chốt một trong hai hợp đồng: hai mốc bất biến `startedOn`/`leftOn`, hoặc lịch sử trạng thái append-only. Phương án được chọn phải cho `isEnrolledInPeriod` và AD-5 tái dựng được mọi kỳ mà không dựa vào giá trị hiện tại.

### HIGH-1 — Hợp đồng sao lưu dừng ở “ngoài Supabase”, để hở toàn bộ vận hành phục hồi

**Bằng chứng.** AD-15 chỉ nói route `/api/jobs/backup` đổ dữ liệu ra “một bản sao nằm ngoài Supabase”, chạy được một lần và diễn tập phục hồi. Structural Seed để đích là nút chung chung `Bản sao lưu ngoài Supabase`. Không có nơi lưu, lịch chạy, retention, mã hóa/quyền đọc, giám sát lỗi hay người chịu trách nhiệm. Mục Deferred cũng không nhận các quyết định này, dù proposal xác định RSK-1 là rủi ro cao nhất.

**Divergence thực tế.** Hai đơn vị có thể chọn file tạm trên Vercel, object storage bền vững, hoặc tải tay về máy; tất cả đều có vẻ khớp câu “ngoài Supabase” nhưng mức khôi phục hoàn toàn khác nhau.

**Checklist vi phạm.** Một phần trọng yếu của operational envelope bị để im; Deferred vẫn cho phép các đơn vị chọn không tương thích.

**Xử lý đề nghị:** **autofix hoặc đưa thành open item chặn dữ liệu thật.** Ghim tối thiểu loại storage bền vững, lịch/retention, xác thực, tín hiệu thành công/thất bại, và owner của diễn tập restore. Nếu chưa thể chọn provider, Deferred phải nêu rõ điều kiện chốt và AD-15 phải tiếp tục chặn dữ liệu thật.

### HIGH-2 — Luật phụ thuộc AD-1 thiếu đường hợp pháp tới tầng dữ liệu

**Bằng chứng.** AD-1 tuyên bố hướng phụ thuộc duy nhất là `ui → actions → domain`, `data → domain`, `domain → ∅`; sơ đồ cũng không có cạnh từ `actions.ts` hoặc `public.ts` tới `data/`. Nhưng mutation qua Server Action phải ghi DB, còn AD-2 cho phép `public.ts` xuất hàm đọc nhận kết nối. Spine không chỉ ra ai được gọi `data/` trong cùng module.

**Divergence thực tế.** Builder A cho `actions → data`; builder B cho `actions → public → data`; builder C đặt I/O vào `domain` để giữ chuỗi được mô tả. Cách C vi phạm lõi thuần, còn A/B tạo hai cấu trúc module khác nhau.

**Checklist vi phạm.** Paradigm và Rule chưa thi hành được, không ngăn đúng divergence mà phần mở đầu tuyên bố muốn khóa.

**Xử lý đề nghị:** **autofix.** Bổ sung dependency hợp pháp cho orchestration/I/O trong nội bộ module và cập nhật cả sơ đồ lẫn Rule. Giữ nguyên cấm import xuyên module ngoài `public.ts`.

### MEDIUM-1 — Bảng “đã xác minh trên registry” đã cũ ngay tại ngày cập nhật

**Bằng chứng kiểm tra registry ngày 30/09/2026.** `next` latest là `16.3.7` trong khi spine ghim `16.3.5`; `eslint-config-next` latest là `16.3.7`; `vitest` latest là `5.0.3` trong khi spine ghi `5.0.1`. Các dòng còn lại đã kiểm tra khớp latest, ngoại trừ `next-auth`: endpoint `latest` là stable `4.24.15`, còn spine cố ý ghim beta `5.0.0-beta.32` và đã nêu phương án lùi.

Việc ghim bản cũ không tự thân là lỗi; vấn đề là lời giải thích chỉ nói `16.3.6` bị cửa sổ 24 giờ chặn vào 23/09, nhưng spine được cập nhật 30/09 mà không xác minh lại `16.3.7`, và Vitest không có lý do ghim.

**Xử lý đề nghị:** **autofix ghi chú xác minh.** Xác minh lại các bản ghim tại thời điểm handoff; hoặc cập nhật version, hoặc ghi rõ lý do giữ bản cũ. Không cần chạy theo `latest` nếu lockfile và chính sách release age chủ ý chọn bản thấp hơn.

## 3. Good-spine checklist

| Tiêu chí | Đánh giá | Ghi chú |
| --- | --- | --- |
| Khóa đủ điểm phân kỳ thật cho cấp dưới | Không đạt | Thiếu hợp đồng lịch sử trạng thái học sinh và ranh giới môi trường. |
| Rule thi hành được và ngăn đúng divergence | Không đạt | AD-1 thiếu đường tới data; AD-16 không đủ dữ liệu cho AD-5. |
| Deferred không để hai đơn vị chọn khác nhau | Đạt một phần | Local build được deferred tốt; chiến lược backup còn im lặng. |
| Công nghệ được xác minh hiện hành | Đạt một phần | Phần lớn khớp registry; Next/eslint-config-next/Vitest cần xác minh lại hoặc giải thích pin. |
| Ratify brownfield, không mâu thuẫn codebase | Đạt có điều kiện | AD-17 chủ ý siết code hiện tại theo proposal; đây là thay đổi được duyệt. Tuy nhiên sơ đồ dev/prod tự mâu thuẫn với AD-15. |
| Bao phủ capability của spec/nguồn thay đổi | Đạt một phần | P-2…P-6 landed đầy đủ; CAP-5/CAP-8 chưa có nguồn lịch sử vòng đời đủ để thi hành. |
| Không làm yếu invariant cha | N/A | Không có parent spine được khai báo. |
| Mọi dimension ở altitude được quyết định/deferred/open | Không đạt | Backup/restore và tách môi trường còn thiếu. |

## 4. Kết luận gate

P-2…P-6 và AD-17 tự thân **đạt**: thay đổi region, batch ownership và Deferred local đã được ghi đúng, nhất quán với mục tiêu giảm độ trễ và không mở đường cache. Gate vẫn **chưa thể thông qua toàn spine** vì CRITICAL-1 và CRITICAL-2 có thể làm bẩn dữ liệu production hoặc tính sai công nợ lịch sử. Sau khi sửa hai mục đó, nên xử lý HIGH-1 và HIGH-2 trong cùng lượt để operational envelope và paradigm thực sự là hợp đồng có thể thi hành.
