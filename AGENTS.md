# AGENTS.md — hannin

Hướng dẫn cho AI agent làm việc trong repository này. Đọc trước khi bắt đầu.

## Bối cảnh

Đây là workspace **BMAD Method v6.12.0** (`core` + `bmm`). Chưa có mã ứng dụng — dự án sẽ được hình thành qua các skill BMAD. Agent giao tiếp bằng **tiếng Việt** và tài liệu sinh ra cũng bằng **tiếng Việt** (đã cấu hình trong `_bmad/config.user.toml`).

Không rõ nên làm gì tiếp → load skill `bmad-help`. Đó là điểm vào chính thức của quy trình.

## Quy tắc bắt buộc

1. **Script BMAD chỉ chạy qua `uv run`.** Ví dụ:
   `uv run "_bmad/scripts/resolve_config.py" --project-root "D:\hannin"`.
   Không gọi `python` trực tiếp. Cache uv đã được chuyển vào `.uv-cache/` bằng `uv.toml` ở gốc repo — đừng xoá hay sửa `uv.toml`, nếu không mọi script sẽ lỗi `EPERM` do sandbox.

2. **Không sửa tay `_bmad/config.toml` và `_bmad/config.user.toml`.** Installer sinh ra và sẽ ghi đè ở lần cài sau. Muốn thay đổi bền vững thì sửa `_bmad/custom/config.toml` (cấp team, có commit) hoặc `_bmad/custom/config.user.toml` (cá nhân, bị gitignore), hoặc chạy lại installer.

3. **Không sửa `.agents/skills/`.** Đây là bản cài của BMAD; chạy lại `bmad-method install` là mất thay đổi. Muốn đổi hành vi skill thì dùng skill `bmad-customize` (ghi override vào `_bmad/custom/`).

4. **Tài liệu đi đúng chỗ:**
   - Planning (brief, PRD, UX, architecture, epics) → `_bmad-output/planning-artifacts/`
   - Implementation (sprint status, story, review, retrospective) → `_bmad-output/implementation-artifacts/`
   - Kiến thức dài hạn (research, tham chiếu) → `docs/`
   Đừng đặt tài liệu dự án ở gốc repo.

5. **Nhật ký công việc qua `memlog.py`**, không tự viết file nhớ: `uv run "_bmad/scripts/memlog.py" append --workspace <thư-mục> --type <decision|assumption|question|...> --text "<tóm tắt một dòng>"`.

## Môi trường

- Windows, PowerShell. Node v22, Python 3.11.9, `uv` 0.11.25 — tất cả đã có sẵn trên PATH.
- Sandbox ghi file hiện tại: `workspace-write` — chỉ ghi được trong `D:\hannin`.
- npm cache mặc định nằm ngoài workspace và bị chặn. Cần chạy npm/npx thì đặt trước:
  `$env:npm_config_cache = "$env:TEMP\dsh-npm-cache"`
- Git đã khởi tạo ở nhánh `main`. Repo này **chưa có commit nào** ở thời điểm bàn giao workspace.

## Bản đồ thư mục

| Đường dẫn | Ý nghĩa |
|---|---|
| `.agents/skills/` | 29 skill BMAD — DSH nạp catalog từ đây |
| `_bmad/scripts/` | Script Python dùng chung: `resolve_config.py`, `resolve_customization.py`, `memlog.py`, `render_skill.py`, `config_utils.py` |
| `_bmad/_config/` | Manifest và catalog cho `bmad-help` |
| `_bmad/render/` | Bản render tạm của skill — bị gitignore, xoá được |
| `_bmad-output/` | Tài liệu BMAD sinh ra |
| `uv.toml` | Chuyển cache uv vào workspace (bắt buộc, xem Quy tắc 1) |
| `README.md` | Hướng dẫn thiết lập và vận hành workspace |
