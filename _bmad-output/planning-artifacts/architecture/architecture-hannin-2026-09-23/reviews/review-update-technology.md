# Review độc lập — cập nhật region và kết nối Supabase

- **Ngày review:** 2026-09-30
- **Tài liệu được review:** `../ARCHITECTURE-SPINE.md`
- **Phạm vi:** thay đổi `hnd1`, `vercel.json`, Supabase Tokyo và mức khớp với mã hiện tại
- **Nguyên tắc:** chỉ dùng mã dự án và tài liệu chính thức; không sửa Architecture Spine

## Verdict

**KHÔNG ĐẠT ở trạng thái hiện tại.** Quyết định đặt Vercel Function tại Tokyo là hợp lý và mã hiện tại xác nhận database ở Supabase Tokyo, nhưng Architecture Spine đang mô tả `hnd1` là cấu hình đã được ghim trong `vercel.json` trong khi file deploy thực tế chưa có khóa `regions`. Nếu deploy từ trạng thái này, repo không thực thi được hợp đồng region của AD-15 và Vercel có thể tiếp tục dùng region mặc định `iad1`.

Sau khi thêm `"regions": ["hnd1"]` vào `vercel.json`, deploy lại và kiểm chứng deployment chạy tại `hnd1`, phần region có thể chuyển sang **đạt**. Hai finding về kết nối bên dưới không ngăn việc đặt region, nhưng cần chỉnh lý để AD-15 phản ánh đúng cơ chế kỹ thuật.

## Bằng chứng

### Nguồn chính thức

1. [Vercel — Configuring regions for Vercel Functions](https://vercel.com/docs/functions/configuring-functions/region): Vercel khuyến nghị đặt Function gần nguồn dữ liệu; Function mới mặc định ở `iad1`; khóa project-level `regions` trong `vercel.json` thay đổi region mặc định.
2. [Vercel — Static Configuration with vercel.json](https://vercel.com/docs/project-configuration/vercel-json#regions): `regions` nhận mảng mã region và ghi đè Function Region trong Project Settings. Tài liệu chính thức cũng xác nhận Hobby được chọn một region.
3. [Vercel — Tokyo pricing](https://vercel.com/docs/pricing/regional-pricing/hnd1): `hnd1` là Tokyo, Japan.
4. [Supabase — Available regions](https://supabase.com/docs/guides/platform/regions): `ap-northeast-1` là Northeast Asia (Tokyo).
5. [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres): session pooler dùng cổng `5432`, transaction pooler dùng `6543`; hướng dẫn serverless khuyến nghị client ở module scope, `max: 1`, `prepare: false`, và `ssl: 'require'`.
6. [Supabase — Postgres.js](https://supabase.com/docs/guides/database/postgres-js): với nền tảng serverless, Supabase khuyến nghị transaction pooler; đồng thời cảnh báo Postgres.js có pipelining mặc định và khi kết hợp shared transaction mode có thể treo truy vấn hoặc trả sai hàng.

### Mã dự án

- `ARCHITECTURE-SPINE.md:124` yêu cầu Function chạy tại `hnd1` và cấu hình nằm trong `vercel.json`; dòng 169 tuyên bố region đã được “ghim trong `vercel.json`”.
- `vercel.json:1-9` chỉ có `$schema` và `crons`; không có `regions`, `functions.*.regions` hay cấu hình region tương đương.
- Không có `preferredRegion`, `export const runtime` hoặc cấu hình region theo route trong `src/`.
- `DATABASE_URL` cục bộ được kiểm tra theo cách chỉ in host/port, không lộ thông tin xác thực: host là `aws-0-ap-northeast-1.pooler.supabase.com`, port `5432`. Điều này khớp Supabase Tokyo và session pooler.
- `src/lib/db/index.ts:25-32` tạo một Postgres.js client ở module scope, với `prepare: false` và `max: 1`; hai cấu hình này khớp khuyến nghị Supabase cho serverless. Cấu hình chưa đặt `ssl: 'require'`, và URL đã kiểm tra cũng không có `sslmode`.

## Findings

### F1 — CRITICAL: hợp đồng `hnd1` chưa tồn tại trong `vercel.json`

Spine nói cả ở AD-15 và bảng Stack rằng region được ghim trong repo, nhưng `vercel.json` hiện không có `"regions": ["hnd1"]`. Đây là sai lệch trực tiếp giữa kiến trúc và mã triển khai. Theo tài liệu Vercel, dự án mới mặc định chạy Function ở `iad1`; vì vậy không thể coi sự cố lệch vùng đã được sửa chỉ bằng việc cập nhật spine.

**Điều kiện đóng finding:** thêm khóa region ở cấp project, deploy production, rồi kiểm tra deployment summary hoặc `process.env.VERCEL_REGION`/header chẩn đoán để xác nhận Function thật sự chạy tại `hnd1`. Việc chỉ nhìn `x-vercel-id` nên được xem là bằng chứng vận hành phụ; Vercel Region hoặc deployment summary là bằng chứng trực tiếp hơn.

### F2 — PASS: `hnd1` và `ap-northeast-1` là cặp Tokyo hợp lệ

Tài liệu chính thức xác nhận `hnd1` là Tokyo của Vercel và `ap-northeast-1` là Tokyo của Supabase. Cách viết “cùng vùng địa lý” trong AD-15 là chính xác hơn “cùng region”, vì đây là hai mã region của hai nhà cung cấp khác nhau. Đặt Function tại `hnd1` giúp giảm khoảng cách tới database và phù hợp khuyến nghị của Vercel cho ứng dụng có nhiều lượt gọi database.

### F3 — HIGH: lý do cấm transaction pooler trong AD-15 chưa đúng kỹ thuật

AD-15 viết rằng transaction pooler bị cấm vì “không hợp với prepared statement trong khi AD-3 cần transaction”. Hai ý này không có quan hệ như câu hiện tại mô tả:

- transaction pooler vẫn hỗ trợ transaction; chính tài liệu Supabase khuyến nghị nó cho serverless;
- hạn chế prepared statement được xử lý bằng `prepare: false`, và mã hiện tại đã làm vậy;
- rủi ro thực tế với tổ hợp **Postgres.js + shared transaction pooler** là pipelining mặc định: Supabase cảnh báo có thể treo truy vấn hoặc trả sai hàng, và hiện không có tùy chọn tắt pipelining mà vẫn giữ `sql.begin()` hoạt động đúng.

Vì vậy, tiếp tục dùng session pooler có thể là lựa chọn hợp lý cho mã này, nhưng AD-15 nên ghi đúng lý do: tránh tương tác pipelining của Postgres.js với shared transaction mode và giữ transaction tương tác ổn định. Không nên nói transaction pooler không hỗ trợ ghi nhiều dòng hay không hỗ trợ transaction.

### F4 — MEDIUM: kết nối khớp Tokyo/session mode nhưng chưa cưỡng chế TLS trong client

Host/port hiện tại xác nhận kết nối tới session pooler ở `ap-northeast-1:5432`; `max: 1`, client module-scope và `prepare: false` đều khớp hướng dẫn Supabase. Tuy nhiên, tài liệu Supabase hiện yêu cầu `ssl: 'require'` để client từ chối kết nối không mã hóa. `src/lib/db/index.ts` chưa đặt tùy chọn này và URL được kiểm tra không có `sslmode`.

**Đề xuất:** thêm `ssl: 'require'` vào cấu hình Postgres.js, hoặc chứng minh chuỗi kết nối production đã cưỡng chế TLS bằng cách khác. Đây là chỉnh sửa mã triển khai, không phải lý do phản đối quyết định `hnd1`.

### F5 — MEDIUM: con số “15 client” là thuộc tính project, chưa có bằng chứng tái kiểm chứng trong repo

Tài liệu Supabase mô tả giới hạn client phụ thuộc compute size và cấu hình pooler; không đưa ra một hằng số chung là 15 cho mọi project. Có thể 15 là số đo đúng của project Haninn, nhưng review này không tìm thấy ảnh chụp, lệnh hoặc runbook tái kiểm chứng con số đó. Quy tắc `max: 1` vẫn hợp lý và khớp hướng dẫn Supabase cho serverless; phần cần sửa là nguồn gốc của con số tuyệt đối.

**Đề xuất:** ghi “giới hạn hiện tại của project là 15, kiểm tra tại Database settings ngày …” kèm cách tái kiểm tra, hoặc bỏ con số khỏi invariant và giữ luật `max: 1` dựa trên đặc tính scale-out của serverless.

## Kết luận nghiệm thu

| Hạng mục | Kết quả |
| --- | --- |
| `hnd1` có phải Tokyo và là mã Vercel hợp lệ | Đạt |
| Supabase `ap-northeast-1` có phải Tokyo | Đạt |
| Database URL hiện tại có trỏ đúng Tokyo/session pooler 5432 | Đạt |
| Client có module-scope, `max: 1`, `prepare: false` | Đạt |
| `vercel.json` có ghim `hnd1` như spine tuyên bố | **Không đạt** |
| Lý do kỹ thuật về transaction pooler trong AD-15 | **Cần chỉnh lý** |
| TLS được client cưỡng chế rõ ràng | **Chưa đạt** |

**Verdict cuối: KHÔNG ĐẠT cho tới khi `vercel.json` thực sự ghim `hnd1` và deployment production được kiểm chứng chạy ở Tokyo.**
