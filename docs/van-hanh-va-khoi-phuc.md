# Vận hành, sao lưu và khôi phục — Haninn

Tài liệu này là thứ AD-15 yêu cầu: một runbook trong `docs/` để người vận hành biết
hệ thống đang chạy ở đâu, sao lưu bằng gì, và **đã từng khôi phục thử hay chưa**.

## 1. Hệ thống đang chạy ở đâu

| Thành phần | Địa chỉ | Ghi chú |
|---|---|---|
| Mã nguồn | `github.com/pnam55588/hannin` | private, nhánh `main` |
| Ứng dụng | `https://hannin-theta.vercel.app` | Vercel project `hannin`, deploy production |
| Cơ sở dữ liệu | Supabase Postgres **17.6**, vùng `ap-northeast-1` (Tokyo), ref `dzwcvlvslfckcwgaiiia` | gói free |
| Sao lưu | bucket `backups` của Supabase Storage | do cron gọi, xem mục 3 |

Chuỗi kết nối dùng **session pooler cổng 5432**, không dùng transaction pooler 6543:
AD-3 cần transaction tương tác, và migration cần chạy DDL trong một phiên.

## 1.1 Đã kiểm chứng thật trên production

Không phải "chạy được ở máy tôi" — tất cả những điều dưới đây đều kiểm bằng cách
gọi thật vào site đang chạy:

- **Đăng nhập**: lấy csrf → gửi credentials → 302 về `/dashboard` → trang render 200
  bằng dữ liệu từ Supabase. Mật khẩu sai không vào được.
- **Đọc**: 9/9 màn hình trả 200, số tiền hiển thị đúng định dạng `2.000.000`.
- **Ghi**: gửi form "Thêm lớp" đúng như trình duyệt không bật JS vẫn gửi (multipart
  kèm `$ACTION_REF`/`$ACTION_KEY`), nhận 200, rồi **đọc lại trên `/classes` thấy lớp
  mới** — form → Server Action → Postgres → hiển thị thông suốt.
- **Cổng bảo vệ**: `/dashboard` và `/api/reports/*` khi chưa đăng nhập → 307 về
  `/login`; `/api/jobs/backup` không token → 401.
- Postgres 17.6; dev và prod cùng major vì cùng một project.

Các script kiểm chứng nằm trong `scripts/`: `verify-login.mjs`, `verify-screens.mjs`,
`verify-write.mjs`, `verify-backup.mjs`, `count-rows.mjs`. Chúng là bằng chứng chạy
lại được, không phải lời kể.

## 1.2 Cổng chặn trước khi nhập dữ liệu THẬT

AD-15 chặn: **không ghi dữ liệu thật vào production trước khi job sao lưu chạy được
một lần và đã diễn tập phục hồi.** Hiện job sao lưu còn trả 503 vì chưa cấu hình
Storage, và chưa diễn tập phục hồi lần nào. Nghĩa là: **dữ liệu giả thì được, dữ
liệu thật thì chưa.** Muốn mở cổng này phải làm xong mục 3 và mục 4.

## 2. Bản đồ khoá và biến môi trường

Không có khoá nào nằm trong git. Chúng nằm ở hai chỗ:

**Trên máy bạn — `.secrets/` (đã bị gitignore):**

| Tệp | Nội dung |
|---|---|
| `github.token` | PAT của tài khoản `pnam55588`, quyền `repo` |
| `vercel.token` | token Vercel, quyền Full Account |
| `supabase.env` | `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_REGION`, `SUPABASE_PROJECT_REF`, `AUTH_SECRET`, `CRON_SECRET` |
| `owner.txt` | email và mật khẩu đăng nhập chủ lớp |

**Trên Vercel — Project → Settings → Environment Variables (Production):**
`DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET`.

Còn thiếu, chỉ cần khi bật tải bản sao lưu lên Storage: `SUPABASE_URL` và
`SUPABASE_SERVICE_ROLE_KEY`. Khi chưa có, job sao lưu trả **503 kèm bản dump ngay
trong phản hồi** chứ không im lặng bỏ qua — mất dữ liệu mà không ai biết là kiểu
hỏng tệ nhất.

### Đổi mật khẩu database

Mật khẩu database Supabase từng bị in ra trong một lần chẩn đoán (lỗi che chuỗi
kết nối). Việc cần làm: Supabase → Settings → Database → **Reset database password**,
rồi cập nhật lại `DATABASE_URL` và `DIRECT_URL` trong `.secrets/supabase.env` **và**
trên Vercel, sau đó deploy lại.

## 3. Sao lưu

`vercel.json` đăng ký cron gọi `GET /api/jobs/backup` lúc **17:00 UTC mỗi ngày**
(00:00 giờ Việt Nam). Route này:

1. từ chối mọi request không có header `Authorization: Bearer $CRON_SECRET`;
2. dump 8 bảng nghiệp vụ thành JSON;
3. tải lên Supabase Storage bucket `backups` với tên `hannin-<ngày>.json`;
4. nếu chưa cấu hình Storage, trả 503 kèm bản dump để không mất dữ liệu.

Gói Supabase free **không có sao lưu tự động**, nên job này không phải tuỳ chọn.

Kiểm tra job đang chạy:

```powershell
node -e "fetch('https://hannin-theta.vercel.app/api/jobs/backup',{headers:{Authorization:'Bearer '+require('node:fs').readFileSync('.secrets/supabase.env','utf8').match(/CRON_SECRET=(.*)/)[1].trim()}}).then(async r=>console.log(r.status, (await r.text()).slice(0,200)))"
```

## 4. Khôi phục — và đã thử chưa

**Trạng thái: CHƯA diễn tập.** Đây là việc còn nợ, ghi rõ ra để không ai tưởng
nhầm là đã xong. Một bản sao lưu chưa từng khôi phục thử thì chưa được coi là bản
sao lưu.

Các bước diễn tập (làm trên project Supabase tạm, **không** làm trên production):

1. Tạo project Supabase tạm, cùng vùng, lấy chuỗi session pooler.
2. Trỏ `DIRECT_URL` tạm vào project đó rồi chạy `pnpm db:migrate` để dựng schema.
3. Tải một tệp `hannin-<ngày>.json` từ bucket `backups`.
4. Nạp lại theo đúng thứ tự khoá ngoại: `users` → `classes` → `scheduleSlots` →
   `students` → `tuitionRates` → `dueDateRules` → `attendance` → `payments` →
   `comments`. Sai thứ tự sẽ bị chặn bởi khoá ngoại — đó là thiết kế, không phải lỗi.
5. Chạy `pnpm test` và mở `/dashboard`, `/tuition`, `/reports` để đối chiếu con số.
6. Ghi lại ngày diễn tập và kết quả vào chính mục này.

Nguyên tắc phải giữ khi khôi phục: **không xoá cứng** học sinh hay dòng tiền
(AD-16). Nếu bản dump thiếu người dùng, tạo lại bằng `pnpm db:owner` chứ đừng sửa
tay bảng `users`.

## 5. Việc thường ngày

| Việc | Lệnh |
|---|---|
| Chạy thử dưới máy | `pnpm dev` |
| Kiểm tra kiểu và test | `pnpm typecheck`, `pnpm test` |
| Áp migration | `pnpm db:migrate` |
| Tạo/đổi mật khẩu chủ lớp | `pnpm db:owner` (đọc `OWNER_EMAIL`, `OWNER_PASSWORD`) |
| Dữ liệu giả để xem thử | `pnpm db:seed` — **không bao giờ chạy trên production** |
| Xoá sạch dữ liệu nghiệp vụ | `pnpm db:reset` — từ chối chạy khi `NODE_ENV=production` |
| Deploy | `npx vercel --prod` ở gốc repo |

`pnpm db:seed` và `pnpm db:reset` đều tự chặn khi `NODE_ENV=production`. Đừng gỡ
chốt đó.

## 6. Vài cái bẫy đã gặp, ghi lại để lần sau không mất thời gian

- **Sai vùng pooler** báo `tenant/user ... not found`. Host pooler phải khớp vùng
  của project.
- **pnpm 12** chặn build script của gói lạ; phải khai `allowBuilds` trong
  `pnpm-workspace.yaml`. Tên khoá cũ `onlyBuiltDependencies` đã bỏ.
- **pnpm 12** mặc định từ chối gói mới phát hành trong 24 giờ. Cách xử lý là hạ
  phiên bản, không phải tắt chính sách.
- **Đừng dùng `Get-Content`/`Set-Content` của PowerShell để sửa tệp có dấu tiếng
  Việt** — nó đọc UTF-8 như cp1252 và phá hỏng dấu. Dùng công cụ sửa tệp, hoặc
  `[System.IO.File]::ReadAllText` / `WriteAllText` với `UTF8Encoding($false)`.
- **`RandomNumberGenerator::Fill`** không có trên PowerShell 5.1; dùng
  `[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes(...)`.
  Tôi từng đặt mật khẩu chủ lớp bằng một mảng byte toàn số 0 vì lỗi này.
- **Script chẩn đoán đặt trong `scripts/*.ts` sẽ bị `next build` typecheck.** Xoá
  trước khi deploy, hoặc đặt đuôi `.mjs`.
