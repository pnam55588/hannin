# Haninn — Quản lý lớp học tiếng Anh

Haninn là ứng dụng web dành cho chủ lớp để quản lý học sinh, lịch học, điểm danh, học phí, khoản thu và nhận xét theo tháng. Hệ thống sử dụng một tài khoản chủ lớp và hỗ trợ tải báo cáo Excel.

**Ứng dụng:** [hannin-theta.vercel.app](https://hannin-theta.vercel.app) · **Mã nguồn:** [pnam55588/hannin](https://github.com/pnam55588/hannin)

## Tài liệu

| Tài liệu | Dành cho |
|---|---|
| [Hướng dẫn sử dụng](docs/huong-dan-su-dung.md) | Chủ lớp: thiết lập ban đầu và thao tác hằng ngày. |
| [Vận hành và khôi phục](docs/van-hanh-va-khoi-phuc.md) | Người vận hành: triển khai, sao lưu và khôi phục dữ liệu. |
| [Đặc tả sản phẩm](_bmad-output/specs/spec-hannin/SPEC.md) | Người phát triển: phạm vi và yêu cầu sản phẩm. |
| [Kiến trúc](_bmad-output/planning-artifacts/architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md) | Người phát triển: cấu trúc và quyết định kỹ thuật. |
| [Quy tắc cho AI agent](AGENTS.md) | Agent làm việc trong repository. |

### Tài liệu tải về

| Tài liệu | Markdown | Word |
|---|---|---|
| Cài đặt trên máy mới | [Đọc](docs/cai-dat.md) | [Tải .docx](docs/cai-dat.docx) |
| Hướng dẫn sử dụng | [Đọc](docs/huong-dan-su-dung.md) | [Tải .docx](docs/huong-dan-su-dung.docx) |
| Vận hành và khôi phục | [Đọc](docs/van-hanh-va-khoi-phuc.md) | [Tải .docx](docs/van-hanh-va-khoi-phuc.docx) |
| Kiểm tra bí mật trước khi public | [Đọc](docs/kiem-tra-bi-mat-truoc-public.md) | [Tải .docx](docs/kiem-tra-bi-mat-truoc-public.docx) |

Các bản Word được chuyển từ tài liệu Markdown để thuận tiện tải về, chỉnh sửa và in. Khi cập nhật nội dung Markdown, cần tạo lại bản Word tương ứng.

## Chức năng

- **Tổng quan:** xem các chỉ số và thông tin phục vụ quản lý lớp.
- **Học sinh:** thêm và cập nhật hồ sơ, tìm kiếm, lọc theo lớp và trạng thái, ghi nhận nghỉ học.
- **Lịch học:** tạo lớp và thêm lịch theo ngày hiệu lực.
- **Điểm danh:** ghi Có mặt hoặc Vắng theo từng buổi trong lịch.
- **Học phí & Thu nhập:** đặt đơn giá, miễn giảm và hạn đóng cho từng em; ghi khoản thu và theo dõi công nợ theo kỳ.
- **Nhận xét:** lưu và cập nhật nhận xét cho từng học sinh theo tháng.
- **Báo cáo:** tải Excel về công nợ, danh sách học sinh, điểm danh và thu nhập theo tháng.
- **Tài khoản:** đăng nhập, đăng xuất và đổi mật khẩu chủ lớp.

### Quy tắc nghiệp vụ

- Điểm danh không làm thay đổi học phí. Học phí của tháng học một phần được chia theo lịch lớp trong khoảng ngày học sinh thuộc lớp.
- Kỳ học phí và ngày nhận tiền được lưu riêng: tiền trả muộn vẫn thuộc kỳ cần thu, còn thu nhập được tính theo ngày thu.
- Lịch học, đơn giá và hạn đóng được ghi theo mốc hiệu lực; mốc đã lưu không bị ghi đè.
- Học sinh nghỉ học được giữ hồ sơ và lịch sử. Giao diện không có chức năng xóa học sinh.
- Sổ thu lưu các khoản đã ghi. Hiện giao diện chưa hiển thị biểu mẫu điều chỉnh khoản thu; khoản nhập sai cần hỗ trợ kỹ thuật. Xem chi tiết trong hướng dẫn sử dụng.

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Ứng dụng | Next.js App Router, React, TypeScript |
| Giao diện | Tailwind CSS |
| Xác thực | Auth.js / NextAuth, bcryptjs |
| Dữ liệu | PostgreSQL, Drizzle ORM, postgres.js |
| Kiểm tra dữ liệu nhập | Zod |
| Báo cáo Excel | ExcelJS |
| Kiểm thử | Vitest |
| Triển khai hiện tại | Vercel và Supabase PostgreSQL |
| Quy trình phát triển | BMAD Method 6.12.0, module `core` và `bmm` |

Phiên bản thư viện và các lệnh dự án được khai báo trong [package.json](package.json).

## Chạy ở máy phát triển

### Yêu cầu

- Node.js từ phiên bản 22.
- pnpm theo phiên bản trong trường `packageManager` của `package.json`.
- Một PostgreSQL dành riêng cho phát triển. Các ví dụ dưới đây giả định database `hannin` đã tồn tại tại `localhost:5432`.
- Python từ 3.10 và `uv` nếu sử dụng các script BMAD.

### Thiết lập

Chạy từ thư mục gốc của repository bằng PowerShell:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
```

Điền giá trị phù hợp vào `.env.local`:

| Biến | Công dụng |
|---|---|
| `DATABASE_URL` | Kết nối PostgreSQL của ứng dụng. |
| `DIRECT_URL` | Kết nối cho script dữ liệu; script ưu tiên biến này nếu có. |
| `AUTH_SECRET` | Khóa bí mật cho xác thực; thay giá trị mẫu bằng chuỗi ngẫu nhiên riêng. |
| `AUTH_TRUST_HOST` | Cấu hình tin cậy host của Auth.js. |
| `OWNER_EMAIL`, `OWNER_PASSWORD` | Thông tin dùng khi tạo hoặc cập nhật tài khoản chủ lớp. |
| `CRON_SECRET` | Khóa riêng để gọi tác vụ sao lưu. |

Sau khi kiểm tra đích kết nối là database phát triển:

```powershell
pnpm db:migrate
pnpm db:owner
pnpm dev
```

Mở [localhost:3000](http://localhost:3000) và đăng nhập bằng tài khoản vừa tạo.

`db:owner` cập nhật mật khẩu nếu email đã tồn tại. Chỉ chạy khi chủ động muốn tạo hoặc thay thông tin tài khoản. File mẫu chỉ cung cấp chuỗi kết nối; repository không tự khởi tạo máy chủ PostgreSQL.

### Dữ liệu dùng thử

Chỉ chạy trên database phát triển có thể xóa:

```powershell
pnpm db:seed
```

Lệnh này **xóa dữ liệu nghiệp vụ đang có rồi tạo dữ liệu mẫu**. `db:reset` cũng xóa toàn bộ dữ liệu nghiệp vụ, giữ bảng tài khoản. Không dùng hai lệnh này trên database production và không bỏ qua chốt bảo vệ môi trường.

## Các lệnh thường dùng

| Lệnh | Công dụng |
|---|---|
| `pnpm dev` | Chạy máy chủ phát triển. |
| `pnpm typecheck` | Kiểm tra TypeScript. |
| `pnpm test` | Chạy kiểm thử tự động. |
| `pnpm test:watch` | Chạy kiểm thử khi sửa mã. |
| `pnpm build` | Tạo bản build ứng dụng. |
| `pnpm start` | Chạy bản build đã tạo. |
| `pnpm db:generate` | Sinh migration từ schema. |
| `pnpm db:migrate` | Áp dụng migration vào database đã cấu hình. |
| `pnpm db:owner` | Tạo hoặc cập nhật tài khoản chủ lớp. |
| `pnpm db:studio` | Mở công cụ xem dữ liệu Drizzle Studio. |

`pnpm lint` đã được khai báo nhưng repository hiện chưa có file cấu hình ESLint. Cần hoàn thiện cấu hình trước khi dùng lệnh này làm bước kiểm tra bắt buộc.

## Cấu trúc repository

```text
src/
  app/                 Các trang, Server Actions và API routes
  components/          Thành phần giao diện dùng chung
  lib/                 Xác thực, database, ngày giờ, định dạng và validation
  modules/             Classes, students, attendance, tuition, payments,
                       comments và reports
public/                Hình ảnh và tài nguyên tĩnh
scripts/               Migration, tài khoản, dữ liệu mẫu và kiểm chứng
drizzle/              Migration PostgreSQL và metadata
docs/                 Hướng dẫn sử dụng và tài liệu vận hành
_bmad-output/          Đặc tả, tài liệu planning và implementation
_bmad/                 Cấu hình, script và module BMAD
.agents/skills/         Các skill BMAD đã cài
```

Các module chia mã theo nghiệp vụ; `public.ts` là điểm giao tiếp giữa các module. Schema dữ liệu được định nghĩa trong `src/lib/db/schema.ts`.

## Triển khai và sao lưu

Cấu hình Vercel nằm trong [vercel.json](vercel.json), sử dụng vùng `hnd1`. Khi thiết lập Supabase, dùng kết nối phù hợp với transaction của ứng dụng; tài liệu vận hành quy định session pooler cổng `5432`.

Tác vụ `/api/jobs/backup` được lên lịch lúc 17:00 UTC mỗi ngày, tương ứng 00:00 ngày hôm sau tại Việt Nam. Để tải bản sao lưu lên Storage cần cấu hình:

- `CRON_SECRET`.
- `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`.
- Bucket riêng tư, mặc định tên `backups`; có thể đổi bằng `SUPABASE_BACKUP_BUCKET`.

Bản sao lưu của route này gồm 8 bảng nghiệp vụ, **không gồm bảng tài khoản**. Có lịch cron chưa đồng nghĩa sao lưu đã hoạt động; cần kiểm tra một lần chạy thành công và diễn tập khôi phục. Tài liệu vận hành hiện ghi nhận việc cấu hình Storage và diễn tập khôi phục còn chưa hoàn tất; đối chiếu trạng thái thực tế trước khi dựa vào sao lưu để vận hành.

Hướng dẫn triển khai và khôi phục chi tiết nằm trong [tài liệu vận hành](docs/van-hanh-va-khoi-phuc.md).

## Làm việc với BMAD và Codex

Ngôn ngữ trao đổi và tài liệu của dự án là tiếng Việt. Gọi skill `bmad-help` khi cần xác định bước tiếp theo.

- Planning lưu trong `_bmad-output/planning-artifacts/`; implementation lưu trong `_bmad-output/implementation-artifacts/`.
- Kiến thức và hướng dẫn lâu dài lưu trong `docs/`.
- Chạy script BMAD qua `uv run`; giữ nguyên `uv.toml` để cache nằm trong workspace.
- Không sửa trực tiếp cấu hình do installer sinh hoặc `.agents/skills/`. Thay đổi bền vững qua `_bmad/custom/` và skill `bmad-customize`.
- Ghi nhật ký công việc bằng `_bmad/scripts/memlog.py`.

Kiểm tra cấu hình đã hợp nhất:

```powershell
uv run "_bmad/scripts/resolve_config.py" --project-root "."
```

## Bảo vệ thông tin truy cập

Không commit `.env.local`, các file môi trường có giá trị thật, token, mật khẩu hoặc nội dung `.secrets/`. Các đường dẫn này đã được khai báo trong `.gitignore`. Luôn kiểm tra đích database trước khi chạy migration, tạo tài khoản hoặc thao tác dữ liệu.
