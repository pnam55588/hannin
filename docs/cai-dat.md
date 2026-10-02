# Cài đặt và chạy Haninn trên máy mới

Dành cho Windows và PowerShell · Cập nhật ngày 02/10/2026

Hướng dẫn này dùng database riêng trên máy để phát triển và chạy thử. Không cần lấy mật khẩu hay token của production. Các giá trị có dấu `<...>` bên dưới là chỗ cần thay bằng thông tin do bạn tự thiết lập, không phải thông tin truy cập thật.

## 1. Chuẩn bị môi trường

| Công cụ | Yêu cầu |
|---|---|
| Git | Để tải và cập nhật mã nguồn. |
| Node.js | Dự án yêu cầu từ 22; chọn bản 22.13 trở lên để phù hợp cách cài pnpm qua npm. |
| pnpm | `12.3.4`, theo `packageManager` trong `package.json`. |
| PostgreSQL | Dùng bản 17 để khớp major database được ghi trong tài liệu vận hành. |
| Trình duyệt | Để mở ứng dụng tại localhost. |
| Python và uv | Chỉ cần nếu dùng script BMAD; Python từ 3.10, có thể dùng 3.11. |

Cài Git và Node.js trên máy, sau đó mở lại PowerShell. Cài pnpm đúng phiên bản:

```powershell
npm install --global pnpm@12.3.4
git --version
node --version
pnpm --version
```

Nếu chạy trong môi trường agent bị chặn cache npm, đặt biến này trước khi cài:

```powershell
$env:npm_config_cache = "$env:TEMP\dsh-npm-cache"
```

Tham khảo [hướng dẫn cài pnpm chính thức](https://pnpm.io/installation). Không cần thay `packageManager` hoặc cập nhật thư viện để làm theo tài liệu này.

## 2. Tải mã nguồn

Chọn thư mục bạn muốn chứa dự án rồi chạy:

```powershell
git clone https://github.com/pnam55588/hannin.git
Set-Location hannin
pnpm install --frozen-lockfile
```

Nếu repo còn private, tài khoản GitHub dùng để clone phải có quyền truy cập. Không đặt token vào URL clone hoặc chép token vào tài liệu.

Nếu đã có thư mục mã nguồn, mở PowerShell tại thư mục chứa `package.json` thay vì clone lần nữa. Các lệnh tiếp theo đều chạy từ thư mục đó.

## 3. Tạo database phát triển

Repository chưa có Docker Compose hay lệnh tự cài máy chủ PostgreSQL. Cần chuẩn bị database trước khi chạy migration.

1. Tải PostgreSQL từ [trang cài Windows chính thức](https://www.postgresql.org/download/windows/). Bộ cài gồm máy chủ PostgreSQL và công cụ pgAdmin.
2. Khi cài, tự đặt mật khẩu cho tài khoản database `postgres` và lưu ở nơi riêng tư. Có thể dùng cổng mặc định `5432` nếu chưa bị chương trình khác chiếm.
3. Mở pgAdmin, kết nối máy chủ local bằng mật khẩu vừa đặt.
4. Trong phần **Databases**, tạo database tên `hannin`. Đây là database dành riêng cho bản chạy trên máy.

Nếu đã quen dùng SQL, có thể tạo database bằng lệnh sau trong công cụ quản trị PostgreSQL:

```sql
CREATE DATABASE hannin;
```

Không dùng chuỗi kết nối production cho bước này. Chạy local nhưng trỏ database production vẫn có thể thay đổi dữ liệu thật.

## 4. Cấu hình môi trường

Tạo file môi trường nếu chưa có:

```powershell
Copy-Item .env.example .env.local
```

Nếu `.env.local` đã tồn tại, mở và sửa file đó; không sao chép đè làm mất cấu hình riêng.

Điền thông tin local theo mẫu:

```dotenv
DATABASE_URL=postgresql://postgres:<MAT_KHAU_DATABASE_DA_MA_HOA_URL>@localhost:5432/hannin
DIRECT_URL=postgresql://postgres:<MAT_KHAU_DATABASE_DA_MA_HOA_URL>@localhost:5432/hannin
AUTH_SECRET=<CHUOI_NGAU_NHIEN_RIENG>
AUTH_TRUST_HOST=true
OWNER_EMAIL=<EMAIL_DANG_NHAP_LOCAL>
OWNER_PASSWORD=<MAT_KHAU_CHU_LOP_LOCAL>
CRON_SECRET=<CHUOI_NGAU_NHIEN_KHAC>
```

Thay cả phần `<...>`; không giữ nguyên dấu ngoặc nhọn. Không cần tạo tài khoản email mới, nhưng `OWNER_EMAIL` phải có dạng email để dùng ở màn hình đăng nhập. Nên đặt mật khẩu chủ lớp từ 8 đến 72 ký tự, không dùng mật khẩu mẫu.

### Ý nghĩa các biến

| Biến | Cách dùng |
|---|---|
| `DATABASE_URL` | Ứng dụng đọc biến này để kết nối database. |
| `DIRECT_URL` | Script migration, tài khoản và dữ liệu ưu tiên biến này nếu có. Khi chạy local, đặt cùng đích với DATABASE_URL. |
| `AUTH_SECRET` | Khóa riêng cho phiên đăng nhập; dùng chuỗi ngẫu nhiên tối thiểu 32 ký tự. |
| `AUTH_TRUST_HOST` | Đặt `true` theo file mẫu của dự án. |
| `OWNER_EMAIL`, `OWNER_PASSWORD` | Thông tin được lệnh tạo tài khoản sử dụng; không tự tạo tài khoản chỉ bằng việc khai báo biến. |
| `OWNER_NAME` | Tùy chọn; tên tài khoản, mặc định “Chủ lớp”. |
| `CRON_SECRET` | Khóa riêng của tác vụ sao lưu, khác AUTH_SECRET. Không cần gọi tác vụ này để chạy các trang local. |

Bạn có thể sinh chuỗi ngẫu nhiên trên máy bằng Node.js, chạy hai lần để lấy hai giá trị khác nhau:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Chỉ lưu kết quả vào file môi trường riêng, không gửi vào chat công khai hay commit lên Git.

Nếu mật khẩu database có ký tự như `@`, `:`, `/`, `#`, `%`, cần mã hóa phần mật khẩu theo URL trước khi ghép vào chuỗi kết nối. Không mã hóa toàn bộ URL. Có thể dùng mật khẩu ngẫu nhiên gồm chữ và số cho database local để tránh nhầm khi ghép chuỗi.

### Cách nạp file môi trường

- Next.js đọc `.env.local` khi chạy ứng dụng.
- Các script `db:migrate`, `db:owner`, `db:seed`, `db:reset` đọc `.env.local` trước rồi `.env`.
- `drizzle.config.ts` hiện dùng `dotenv/config`, không tự đọc `.env.local`. Phần xử lý lỗi bên dưới hướng dẫn cách nạp file này khi dùng Drizzle Studio hoặc sinh migration.
- Biến đã có trong PowerShell có thể được ưu tiên hơn file. Nếu kết nối khác dự kiến, kiểm tra cấu hình của terminal; mở terminal mới để tránh dùng biến còn sót từ lần làm việc trước.

## 5. Dựng bảng và tạo tài khoản

Kiểm tra cả DATABASE_URL và DIRECT_URL trỏ đến `localhost` và database `hannin`, rồi chạy:

```powershell
pnpm db:migrate
pnpm db:owner
```

Kết quả cần thấy:

- Migration hiển thị đích local và thông báo **Đã áp dụng migration**.
- Tạo tài khoản hiển thị **Đã tạo tài khoản ...**.

Nếu email đã tồn tại, `db:owner` **cập nhật mật khẩu và tên** của tài khoản đó. Không chạy lại chỉ để kiểm tra đăng nhập. Dự án thiết kế cho một chủ lớp; dùng lại một email local, không tạo nhiều tài khoản tùy ý.

Không cần chạy `db:generate` ở lần cài đầu: repository đã có migration trong `drizzle/`.

## 6. Chạy ứng dụng

```powershell
pnpm dev
```

Giữ terminal đang chạy, mở [http://localhost:3000](http://localhost:3000) và đăng nhập bằng OWNER_EMAIL, OWNER_PASSWORD đã dùng ở bước tạo tài khoản. Nếu terminal báo một cổng khác, mở đúng địa chỉ được in ra.

Thiết lập dữ liệu thật của bản local theo thứ tự **Lịch học → Học sinh → đơn giá và hạn đóng**. Xem [hướng dẫn sử dụng](huong-dan-su-dung.md) để thao tác từng màn hình.

Muốn dừng máy chủ, nhấn `Ctrl+C` trong terminal.

## 7. Tùy chọn: tạo dữ liệu mẫu

Chỉ dùng khi database local có thể xóa và chưa chứa dữ liệu cần giữ:

```powershell
pnpm db:seed
```

Lệnh này xóa dữ liệu nghiệp vụ hiện có rồi tạo lớp, học sinh, đơn giá, hạn đóng, điểm danh, khoản thu và nhận xét mẫu. Tài khoản chủ lớp được giữ nguyên.

Muốn đưa database thử nghiệm về trạng thái không có dữ liệu nghiệp vụ:

```powershell
pnpm db:reset
```

Lệnh reset giữ bảng tài khoản. Seed và reset là thao tác xóa dữ liệu, không phải bước cài đặt bắt buộc. Không dùng trên production, không bỏ qua chốt NODE_ENV hoặc đặt FORCE_RESET để vượt chốt. Chốt môi trường không thay thế việc kiểm tra đích database.

## 8. Kiểm tra và chạy bản build

Mở terminal thứ hai tại thư mục dự án:

```powershell
pnpm typecheck
pnpm test
pnpm build
```

Sau khi build thành công, dừng `pnpm dev` nếu đang dùng cùng cổng, rồi chạy:

```powershell
pnpm start
```

`start` cần bản build đã tạo. Đây vẫn là bản chạy trên máy với cấu hình local, không phải lệnh deploy lên Vercel.

Repository có lệnh `pnpm lint` nhưng hiện chưa có cấu hình ESLint, nên lệnh đó chưa phải bước kiểm tra có thể dùng ngay.

## 9. Lỗi thường gặp

| Lỗi hoặc hiện tượng | Cách xử lý |
|---|---|
| Không nhận ra git, node hoặc pnpm | Cài công cụ còn thiếu, mở lại PowerShell, kiểm tra bằng lệnh `--version`. |
| PowerShell chặn file pnpm.ps1 | Thử `pnpm.cmd` thay `pnpm` trong các lệnh. Không cần tắt chính sách bảo vệ toàn máy. |
| pnpm báo sai phiên bản | Đối chiếu `pnpm --version` với `packageManager` trong package.json; cài đúng bản yêu cầu. |
| Frozen lockfile không khớp | Kiểm tra mã nguồn và pnpm-lock.yaml cùng phiên bản bằng `git status`; dùng pnpm đúng phiên bản. Không xóa lockfile để bỏ qua lỗi. |
| Thiếu DATABASE_URL hoặc DIRECT_URL | Kiểm tra tên file `.env.local`, tránh tên `.env.local.txt`, và chạy từ gốc repository. |
| Connection refused / không kết nối localhost:5432 | Kiểm tra dịch vụ PostgreSQL đã chạy, cổng và máy chủ trong URL đúng. |
| Password authentication failed | Kiểm tra mật khẩu database, tài khoản và mã hóa URL; đây không phải mật khẩu đăng nhập web. |
| Database hannin does not exist | Tạo database hannin bằng pgAdmin trước khi chạy migration. |
| Relation users / students ... does not exist | Chạy db:migrate trên đúng database mà ứng dụng đang dùng; đối chiếu DATABASE_URL và DIRECT_URL. |
| Đăng nhập không thành công | Kiểm tra đã chạy db:owner, email và mật khẩu đã dùng khi tạo; khai báo OWNER_PASSWORD không tự đổi tài khoản đã lưu. |
| Cổng 3000 đã được dùng | Dừng máy chủ cũ hoặc mở cổng mới do Next.js thông báo. |
| Trang báo lỗi sau khi sửa .env.local | Dừng máy chủ và chạy lại pnpm dev. |
| Thiếu binary esbuild hoặc lỗi build script | Chạy lại pnpm install từ gốc, giữ pnpm-workspace.yaml với allowBuilds hiện có; không bật build script cho tất cả gói. |
| Báo cáo trống hoặc không có buổi điểm danh | Database mới chưa có dữ liệu, hoặc chưa tạo lịch/đơn giá. Xem hướng dẫn sử dụng trước khi kết luận cài đặt lỗi. |

### Drizzle Studio hoặc db:generate không đọc .env.local

Với Node.js hỗ trợ `--env-file` như yêu cầu ở trên, chạy CLI trực tiếp qua Node để nạp đúng file:

```powershell
node --env-file=.env.local ./node_modules/drizzle-kit/bin.cjs studio
```

Chỉ khi bạn chủ động sửa schema và cần sinh migration mới:

```powershell
node --env-file=.env.local ./node_modules/drizzle-kit/bin.cjs generate
```

Drizzle Studio cho phép sửa dữ liệu; kiểm tra đích local trước khi dùng. Không chạy các script `verify-*.mjs` để kiểm tra bản local một cách tùy ý: nhiều script hiện trỏ cố định đến web production và đọc `.secrets/`.

## 10. Khi sử dụng BMAD trên máy mới

Phần này tùy chọn, không cần để đăng nhập và sử dụng web.

Cài Python từ 3.10 và uv, sau đó kiểm tra:

```powershell
uv --version
uv run "_bmad/scripts/resolve_config.py" --project-root "."
```

Giữ nguyên `uv.toml`: file chuyển cache vào `.uv-cache/` và yêu cầu dùng Python đã cài trên máy. Nếu thiếu Python, cài interpreter hệ thống rồi mở lại terminal. Mọi script BMAD phải chạy qua `uv run`.

Gọi skill `bmad-help` trong Codex khi cần hướng dẫn quy trình. Đọc [AGENTS.md](../AGENTS.md) trước khi sửa dự án bằng AI agent.

## 11. Thông tin riêng tư và sao lưu

- `.env.local`, `.env` và `.secrets/` chứa thông tin riêng, không đưa lên Git. File mẫu chỉ có placeholder; luôn thay giá trị mẫu khi cài.
- Tài khoản local thuộc database local; không phải tài khoản trên web production.
- Bản local không tự được lịch cron Vercel gọi. Chạy được ứng dụng không có nghĩa đã có sao lưu tự động.
- Route sao lưu lên Storage cần CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY và bucket riêng tư. Đây là cấu hình vận hành riêng, không bắt buộc cho cài local. Không chép khóa production vào hướng dẫn.
- Nếu dùng local để lưu dữ liệu quan trọng, chuẩn bị và kiểm tra phương án sao lưu trước. Tham khảo [vận hành và khôi phục](van-hanh-va-khoi-phuc.md).

## 12. Xác nhận cài đặt xong

- [ ] Công cụ đã được cài và pnpm đúng phiên bản.
- [ ] DATABASE_URL và DIRECT_URL cùng trỏ database local riêng.
- [ ] Migration hoàn tất và tài khoản chủ lớp đã được tạo.
- [ ] Đăng nhập được vào địa chỉ localhost.
- [ ] Mở được Lịch học, Học sinh, Điểm danh và Học phí & Thu nhập.
- [ ] TypeScript, test và build chạy thành công khi tự kiểm tra trên máy mới.
- [ ] Không đưa file môi trường hoặc thông tin truy cập thật vào Git.

Tài liệu được đối chiếu với package.json, .env.example, drizzle.config.ts, cấu hình database/xác thực và các script migration, tài khoản, seed, reset. Các bước cài trên máy mới chưa được diễn tập trong lần soạn tài liệu này.
