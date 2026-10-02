# Kiểm tra bí mật trước khi công khai repository

Ngày kiểm tra: 02/10/2026. HEAD: `b22d185`.

## Kết quả

Không phát hiện mật khẩu hoặc token thật trong phạm vi đã kiểm tra. Đây là kết quả quét, không phải cam kết tuyệt đối không có thông tin nhạy cảm.

## Phạm vi và bằng chứng

- Quét Gitleaks 8.30.1 với `--all`, bật che toàn bộ bí mật: 15 commit, khoảng 2,69 MB. Ba cảnh báo được đối chiếu thủ công.
- Hai cảnh báo trong `.env.example` là giá trị mẫu của AUTH_SECRET và OWNER_PASSWORD. Cảnh báo trong `_bmad/_config/files-manifest.csv` là checksum của tài nguyên BMAD.
- Quét 439 object Git bằng mẫu token, private key, JWT, chuỗi kết nối và phép đối chiếu với giá trị bí mật cục bộ. Đối chiếu bổ sung mật khẩu chủ lớp: không tìm thấy giá trị thật trong lịch sử.
- Các chuỗi kết nối bị đánh dấu trong `.env.example` dùng thông tin localhost mẫu hoặc placeholder; không phải mật khẩu production.
- Remote có một nhánh `main`, không có tag. GitHub trả về 0 issue/PR, 0 Actions run và 0 Actions artifact; wiki tắt tại thời điểm kiểm tra.
- Không thấy `.secrets/` hoặc file môi trường thật trong lịch sử đường dẫn Git. Kiểm tra ảnh dashboard hiện tại không thấy mật khẩu hay token.

## Điểm cần quyết định trước khi public

Ảnh `_bmad-output/specs/spec-hannin/sources/man-hinh-dashboard.jpg` có tên học sinh và số điện thoại. Chưa xác nhận đây là dữ liệu giả; nếu là thông tin thật, cần loại bỏ khỏi cả lịch sử Git trước khi công khai.

Tài liệu vận hành có ghi nhận mật khẩu database từng xuất hiện trong đầu ra chẩn đoán. Không tìm thấy mật khẩu đó trong Git; việc quét này không bao gồm toàn bộ lịch sử chat, terminal cũ hoặc log Vercel/Supabase. Chưa xác nhận mật khẩu từng xuất hiện đã được đổi.

Không thay đổi visibility, mật khẩu, dữ liệu production hay lịch sử Git trong lần kiểm tra này. Báo cáo công cụ được lưu trong `.secrets/audit-tools/`, không được Git theo dõi.
