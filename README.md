# hannin — workspace BMAD Method

Workspace này đã được thiết lập sẵn cho quy trình **BMAD Method v6.12.0** (Agile AI-Driven Development). Mở workspace bằng AI agent và gõ skill `bmad-help` là bắt đầu được ngay.

## Đã cài những gì

| Thành phần | Giá trị |
|---|---|
| BMAD Method | `v6.12.0` |
| Module | `core` + `bmm` (BMad Method) |
| AI tool đích | `codex` → kỹ năng nằm ở `.agents/skills/` (DSH đọc trực tiếp thư mục này) |
| Ngôn ngữ trao đổi | Tiếng Việt |
| Ngôn ngữ tài liệu | Tiếng Việt |
| Tên dự án | `hannin` |
| Thư mục output | `_bmad-output/` |

29 skill BMAD đã được cài, gồm 5 agent persona (Mary – Analyst, John – PM, Sally – UX, Winston – Architect, Amelia – Dev) và các workflow planning/build/review.

## Cấu trúc thư mục

```
.agents/skills/         29 skill BMAD (DSH và Codex/Cursor đọc từ đây)
_bmad/
  config.toml           Cấu hình do installer sinh — ĐỪNG sửa tay, sẽ bị ghi đè
  config.user.toml      Cấu hình riêng của bạn (user_name, ngôn ngữ)
  custom/
    config.toml         Override cấp team — được commit
    config.user.toml    Override cá nhân — bị gitignore
  scripts/              Script Python dùng chung (uv run)
  core/, bmm/           Định nghĩa module
  _config/              Manifest + catalog cho bmad-help
_bmad-output/           Nơi BMAD ghi tài liệu (sẽ chưa có gì cho tới khi chạy skill)
uv.toml                 Cấu hình uv cho workspace — xem mục dưới
docs/                   Kiến thức dài hạn của dự án (project_knowledge)
```

## Bắt đầu

1. Mở workspace này bằng DSH (đang ở `D:\hannin`).
2. Gõ yêu cầu dùng skill `bmad-help`, ví dụ: *"dùng bmad-help, tôi nên bắt đầu từ đâu?"*
3. Làm theo gợi ý. Đường đi thường gặp:

   `bmad-brainstorming` → `bmad-product-brief` / `bmad-prd` → `bmad-ux` → `bmad-architecture` → `bmad-create-epics-and-stories` → `bmad-sprint-planning` → `bmad-build`

4. Tài liệu sinh ra nằm trong `_bmad-output/planning-artifacts/` và `_bmad-output/implementation-artifacts/`.

Xem toàn bộ skill đang có: nhìn thư mục `.agents/skills/`, hoặc hỏi `bmad-help`.

## Lưu ý quan trọng về `uv` (đọc trước khi gặp lỗi)

Mọi skill BMAD đều gọi script Python qua `uv run ...`. Mặc định uv cache ở `%LOCALAPPDATA%\uv\cache`, nằm **ngoài** workspace nên bị sandbox của agent chặn ghi (lỗi `EPERM` / `Access is denied`).

Đã xử lý bằng `uv.toml` ở gốc workspace:

```toml
cache-dir = ".uv-cache"
python-preference = "only-system"
```

- Cache được chuyển vào `.uv-cache/` trong workspace (đã gitignore).
- `only-system` ngăn uv tải interpreter về thư mục profile cũng không ghi được. Máy đã có Python 3.11.9, thoả yêu cầu `>= 3.10` của BMAD.
- Toàn bộ script Python của BMAD chỉ dùng thư viện chuẩn (`tomllib`, `json`, `argparse`…), nên `uv run` không cần mạng và không cần cài package nào.

Kiểm tra nhanh nếu nghi ngờ:

```powershell
uv run "D:\hannin\_bmad\scripts\resolve_config.py" --project-root "D:\hannin" --key core
```

Lệnh này phải in ra JSON với `communication_language = "Vietnamese"`.

## Cập nhật / cài thêm module

Installer BMAD là idempotent — chạy lại để cập nhật hoặc thêm module. Trên máy này phải trỏ npm cache vào thư mục tạm, vì cache npm mặc định cũng nằm ngoài workspace và bị sandbox chặn:

```powershell
$env:npm_config_cache = "$env:TEMP\dsh-npm-cache"
```

Cập nhật bản mới nhất:

```powershell
npx --yes bmad-method@latest install --directory "D:\hannin" --tools codex --yes
```

Thêm module (ví dụ `bmb` = BMad Builder, `tea` = Test Architect, `cis` = Creative Intelligence Suite):

```powershell
npx --yes bmad-method@6.12.0 install --directory "D:\hannin" --modules bmm,bmb --tools codex --yes
```

Đổi ngôn ngữ / tên hiển thị:

```powershell
npx --yes bmad-method@6.12.0 install --directory "D:\hannin" --tools codex `
  --user-name "Tên của bạn" --communication-language Vietnamese --document-output-language Vietnamese --yes
```

Xem danh sách tool id và các khoá cấu hình hợp lệ:

```powershell
npx --yes bmad-method@6.12.0 install --list-tools
npx --yes bmad-method@6.12.0 install --list-options bmm
```

## Ghi chú về sandbox khi agent làm việc

- `.git` tồn tại ở gốc để DSH xác định đúng project root (DSH quét skill ở `<project-root>/.dsh/skills` và `<project-root>/.agents/skills`).
- Sandbox hiện tại là `workspace-write`: agent chỉ ghi được trong `D:\hannin`. Mọi thứ cần ghi ra ngoài (npm cache, uv cache) đều đã được chuyển hướng vào trong workspace hoặc thư mục tạm.
- Nếu agent cần chạy lệnh đòi quyền ghi rộng hơn, hãy chấp nhận prompt phê duyệt thay vì tự ý nới quyền.
