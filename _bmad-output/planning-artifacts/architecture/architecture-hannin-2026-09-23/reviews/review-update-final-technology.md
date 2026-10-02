# Review công nghệ cuối — region Vercel và Supabase

- **Ngày:** 2026-09-30
- **Tài liệu được review:** `../ARCHITECTURE-SPINE.md`
- **Phạm vi:** rà lại các finding về `hnd1`, Supabase Tokyo, session pooler, TLS và ngân sách kết nối
- **Ranh giới đánh giá:** verdict áp dụng cho **chất lượng tài liệu kiến trúc**. Những chỗ mã chưa tuân được ghi riêng là việc triển khai P-1/Dev, không dùng để đánh trượt một hợp đồng mục tiêu đã mô tả trung thực.
- **Thao tác:** không sửa Architecture Spine.

## Verdict

**ĐẠT — không còn finding công nghệ nào chặn chính tài liệu kiến trúc.**

AD-15 và bảng Stack giờ phân biệt rõ trạng thái mục tiêu với trạng thái triển khai: `hnd1` là hợp đồng deploy đã được xác minh về tính hợp lệ, còn P-1 và kiểm chứng production đang chờ Dev. Lý do giữ session pooler đã chuyển sang rủi ro đúng của tổ hợp Postgres.js và shared transaction pooler; TLS đã trở thành invariant bắt buộc; con số giới hạn 15 client không còn bị trình bày như hằng số phổ quát.

## Đối chiếu từng finding cũ

### 1. Region `hnd1` và `vercel.json` — ĐÃ ĐÓNG ở cấp kiến trúc

`ARCHITECTURE-SPINE.md:127` đặt hợp đồng: Vercel Function chạy tại `hnd1`, gần Supabase `ap-northeast-1`, và cấu hình phải nằm trong `vercel.json`. Dòng Stack tại `:172` ghi đúng trạng thái: đây là **mục tiêu**, P-1 và kiểm chứng production vẫn đang chờ Dev, repo hiện tại chưa tuân AD-15.

Cách mô tả này khớp tài liệu chính thức:

- [Vercel — Configuring regions for Vercel Functions](https://vercel.com/docs/functions/configuring-functions/region) xác nhận Function mới mặc định ở `iad1`, có thể đặt region bằng khóa `regions` trong `vercel.json`, và nên chạy gần nguồn dữ liệu.
- [Vercel — Static Configuration with vercel.json](https://vercel.com/docs/project-configuration/vercel-json#regions) xác nhận `regions` là cấu hình project-level điều khiển nơi Function chạy.
- [Vercel — Tokyo pricing](https://vercel.com/docs/pricing/regional-pricing/hnd1) xác nhận `hnd1` là Tokyo.
- [Supabase — Available regions](https://supabase.com/docs/guides/platform/regions) xác nhận `ap-northeast-1` là Tokyo.

Hai mã thuộc hai nhà cung cấp khác nhau, nên cách viết “cùng vùng địa lý” trong AD-15 là chính xác.

### 2. Lý do dùng session pooler — ĐÃ ĐÓNG

AD-15 không còn tuyên bố transaction pooler không hỗ trợ transaction hoặc không thể ghi nhiều dòng. Luật mới chỉ cấm đổi sang shared transaction pooler khi chưa chứng minh được:

1. Postgres.js không gặp lỗi do pipelining;
2. transaction tương tác vẫn hoạt động đúng.

Điều này khớp [Supabase — Postgres.js](https://supabase.com/docs/guides/database/postgres-js): transaction mode thường được khuyến nghị cho serverless, nhưng Postgres.js pipeline truy vấn mặc định; tổ hợp với shared transaction mode có thể treo truy vấn hoặc trả sai hàng, và cách tắt pipeline hiện có làm hỏng `sql.begin()`.

Session pooler `5432` vì vậy là một lựa chọn có chủ đích cho driver hiện tại, không còn dựa trên lý do prepared statement sai quan hệ.

### 3. TLS — ĐÃ ĐÓNG ở cấp kiến trúc

AD-15 đã có invariant rõ: **“Kết nối phải cưỡng chế TLS.”** Điều này khớp [Supabase — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres), trong đó ví dụ cấu hình serverless đặt `ssl: 'require'`.

Tài liệu đã nói đủ “phải làm gì”; việc thêm tùy chọn vào client thuộc triển khai Dev.

### 4. Giới hạn 15 client — ĐÃ ĐÓNG

Spine đã bỏ hằng số 15. Luật hiện tại dựa trên thuộc tính ổn định hơn: Vercel có thể scale thành nhiều instance, ngân sách kết nối của pooler hữu hạn, mỗi instance chỉ mở một kết nối; muốn tăng `max` phải kèm bằng chứng ngân sách còn đủ.

Cách viết này khớp hướng dẫn Supabase về application-side pool: tạo client ở module scope, đặt `max: 1` cho serverless và chỉ tăng khi có bằng chứng invocation đang xếp hàng. Nó không gắn invariant vào một giới hạn plan/project có thể thay đổi.

## Kiểm tra tính nhất quán trong Spine

| Nội dung | Kết quả | Bằng chứng |
| --- | --- | --- |
| Vercel và Supabase cùng vùng địa lý Tokyo | Đạt | AD-15 `:127`, Stack `:163`, `:172` |
| Phân biệt hợp đồng mục tiêu với trạng thái repo | Đạt | Stack `:172` nói rõ P-1/production còn chờ Dev |
| Session pooler có lý do kỹ thuật đúng | Đạt | AD-15 `:127` nêu pipelining và transaction tương tác |
| TLS là yêu cầu bắt buộc | Đạt | AD-15 `:127` |
| Không hardcode giới hạn 15 client | Đạt | AD-15 dùng “ngân sách hữu hạn”; tăng `max` cần bằng chứng |
| Một kết nối mỗi instance | Đạt | phù hợp workload nhỏ và hướng dẫn serverless của Supabase |

## Khoảng cách triển khai còn lại — không chặn tài liệu kiến trúc

Các mục sau là **pending Dev**, không phải finding chặn Spine:

1. `vercel.json` hiện chỉ có `$schema` và cron; P-1 cần thêm `"regions": ["hnd1"]`.
2. Sau deploy cần kiểm chứng production thực sự chạy tại `hnd1`, ưu tiên deployment summary hoặc `process.env.VERCEL_REGION` làm bằng chứng trực tiếp.
3. `src/lib/db/index.ts` hiện có client module-scope, `max: 1`, `prepare: false`, nhưng chưa có `ssl: 'require'`; Dev phải bổ sung để tuân invariant TLS.
4. Comment tại `src/lib/db/index.ts:13-22` vẫn nói prepared statement và giới hạn 15 client. Comment này đã lỗi thời so với AD-15 và nên được cập nhật cùng thay đổi triển khai để không dẫn người bảo trì quay lại lập luận cũ.

## Finding còn chặn tài liệu

**Không có.**

## Kết luận

Architecture Spine đã xử lý đầy đủ bốn finding công nghệ trước đó và đủ rõ để bàn giao cho Dev. Điều kiện nghiệm thu triển khai sau này là: `vercel.json` ghim `hnd1`, production xác nhận chạy tại Tokyo, Postgres.js cưỡng chế TLS, và comment trong mã phản ánh đúng lý do dùng session pooler.
