# Review kiểm chứng công nghệ — ARCHITECTURE-SPINE.md

- **Spine được review:** `_bmad-output/planning-artifacts/architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md` (228 dòng, 16 AD, `status: draft`)
- **Nhiệm vụ:** kiểm chứng rằng mọi quyết định công nghệ đã được **xác minh thực tế**, không phải khẳng định suông từ dữ liệu huấn luyện — phiên bản hiện hành của framework/thư viện, sự tồn tại và tính phù hợp của từng công nghệ, và các mặc định hiện hành của starter nếu spine dựa vào.
- **Ngày:** 2026-09-23
- **Phạm vi thao tác:** review này **chỉ ghi** vào `reviews/review-technology.md`. Không sửa spine, không sửa bất kỳ file nào khác.
- **Ràng buộc đã biết:** máy này **không có mạng**. `web_fetch`/`web_search` không dùng được. Mọi kết luận dưới đây hoặc là **bằng chứng cục bộ trên máy**, hoặc được ghi rõ là **nghi ngờ cần kiểm chứng**. Không có mục nào trong báo cáo này được coi là "đã xác minh phiên bản hiện hành".

---

## 0. Verdict

**KHÔNG ĐẠT kiểm chứng công nghệ.** Spine **trung thực** khi tự khai "không có phiên bản nào được xác minh trên web" (10/12 dòng Stack ghi *chưa xác minh*), nhưng **0/12 dòng Stack có phiên bản được xác minh thực tế** trong phiên này, và bản thân hành động "chốt phiên bản ở lần khởi tạo dự án" **không thực thi được trên chính máy này** (đã thử `npm view <pkg> version --offline`, xem §1.3). Ba lỗ hổng cấp **critical** (Next.js major + App Router async, Auth.js major + ràng buộc credentials, driver kết nối Neon) có thể làm **vỡ AD-10, AD-11 và AD-15** ngay khi bắt đầu code; ngoài ra có **3 nghĩa vụ công nghệ mà AD đòi nhưng Stack không chọn gì** (job sao lưu cho AD-15, công cụ kiểm thử cho AD-1, xử lý ngày/giờ cho AD-9/AD-13).

---

## 1. Phương pháp và bằng chứng thực tế thu được trong phiên

### 1.1 Máy này — đo trực tiếp (không cần mạng)

| Kiểm tra | Kết quả đo được | Liên quan tới |
|---|---|---|
| `node -v` | **v22.23.2**, cài qua nvm (`…\Author Software\nvm\installs\v22.23.2\`) | Dòng Stack "Node.js 22 — đã kiểm tra trên máy này": **khớp chủng loại major, nhưng spine không ghi số cụ thể** (xem M7) |
| `npm -v` | 10.9.8 | việc "chốt phiên bản bằng trình quản lý gói" |
| Trình quản lý gói khác | **pnpm có**, npm có, `npx` có, **yarn không có** | Spine chưa chốt dùng npm hay pnpm (xem M5) |
| `docker` | **có** CLI (`C:\Program Files\Docker\Docker\resources\bin\docker.exe`) | AD-15 (dev chạy Postgres cùng major) |
| `psql` | **không có** | AD-15 — chưa có cách chạm Postgres cục bộ |
| Thư mục cài Postgres cục bộ | **không có** (`C:\Program Files\PostgreSQL` không tồn tại) | AD-15 |
| `git`, `uv` | có | AD-15 (deploy từ nhánh main) |
| `package.json` / lockfile trong repo | **không có file nào** (glob toàn workspace = 0 kết quả) | Xác nhận: **không thể** kiểm chứng phiên bản từ repo; "chưa xác minh" của spine là đúng thực tế |

### 1.2 Metadata registry còn nằm trong cache npm cục bộ (bằng chứng pháp y, KHÔNG phải kiểm chứng web)

Đọc trực tiếp `C:\Users\phgss\AppData\Local\npm-cache\_cacache\index-v5` (packument + `dist-tags.latest` + `time.modified` của lần npm tải metadata về máy):

| Gói | Giá trị thấy trong cache | `time.modified` của packument | Diễn giải (thận trọng) |
|---|---|---|---|
| `react`, `react-dom` | **19.2.8** | 2026-09-08 | Cache được làm mới **sát ngày spine** ⇒ React 19 là dòng hiện hành |
| `zod` | **4.6.5** | 2026-09-13 | **Zod 4** là dòng hiện hành (không phải 3.x) |
| `typescript` | **7.0.2** | 2026-09-09 | Có một major TS **7** (bản native/`tsgo`) là bản mới nhất tại thời điểm đó |
| `next`, `create-next-app`, `eslint-config-next` | **15.4.1** | **2025-07-16** | Bản ghi **cũ ~14 tháng** so với ngày spine ⇒ **không** suy ra được Next major hiện hành (xem C1) |
| `tailwindcss` | **4.1.11** | 2025-07-15 | **Tailwind v4** là dòng hiện hành (không phải v3) |
| `exceljs` | **4.4.0** | **2023-10-19** | Gần **3 năm** không có bản phát hành mới (xem H3) |
| `drizzle-orm`, `drizzle-kit`, `next-auth`, `@auth/core`, `shadcn`, `@radix-ui/*` | **không có bản ghi nào** | — | **Không kiểm chứng được gì** về các gói này |

> **Cảnh báo cách đọc:** `time.modified` là **thời điểm npm tải metadata về máy này**, không phải "ngày phát hành bản mới nhất hiện tại". Bảng trên chứng minh **dòng major nào đang tồn tại** (Zod 4, Tailwind 4, TS 7, React 19), **không** chứng minh "phiên bản hiện hành hôm nay". Không dòng nào ở đây được phép chép vào cột Version của spine như một con số đã xác minh.

### 1.3 Đã thử đường chốt phiên bản offline — **thất bại**

```
npm view <pkg> version --offline
```
Kết quả cho **cả 12 gói** (`react`, `react-dom`, `zod`, `typescript`, `next`, `create-next-app`, `tailwindcss`, `exceljs`, `drizzle-orm`, `next-auth`, `@auth/core`, `shadcn`): **`npm error code ENOTCACHED`** — *"cache mode is 'only-if-cached' but no cached response is available"*, dù `_cacache` cục bộ **có** bản ghi packument (bảng §1.2).

⇒ **Hệ quả trực tiếp:** trên máy này **không tồn tại** một quy trình chính thống nào để "chốt phiên bản bằng trình quản lý gói". Bước mà spine giao cho "lần khởi tạo dự án" (dòng 157) **cần mạng**, và spine **không nêu điều kiện tiên quyết đó** (xem M4).

### 1.4 Những gì KHÔNG thể kết luận trong phiên này

Không có kết luận nào — kể cả phủ định — về: phiên bản hiện hành thật của bất kỳ gói nào; API/thuộc tính cụ thể của bản phát hành mới nhất; tính tương thích chéo giữa các gói; chính sách/giới hạn hiện tại của Neon và Vercel; mặc định hiện hành của `create-next-app`/`shadcn` CLI. Tất cả các mục dưới đây vì thế được ghi theo hai loại nhãn: **[ĐO ĐƯỢC]** (bằng chứng cục bộ ở §1.1–1.3) và **[NGHI NGỜ — cần kiểm chứng]** (suy luận, phải xác minh khi có mạng).

---

## 2. Q1 — Liệt kê MỌI khẳng định công nghệ bắt buộc phải xác minh

### Bảng A — 12 dòng của bảng Stack (dòng 142–155)

| # | Khẳng định (dòng) | AD/conventions phụ thuộc | Trạng thái xác minh trong phiên này | Rủi ro nếu sai major |
|---|---|---|---|---|
| A1 | **Node.js 22** — "đã kiểm tra trên máy này" (144) | AD-15 (deploy), yêu cầu runtime của Next | **[ĐO ĐƯỢC]** máy có v22.23.2; spine không ghi số | Thấp–TB: sai major Node ⇒ build/Vercel lệch; chưa có luật pin (M7) |
| A2 | **Next.js** — chưa xác minh (145) | AD-1 (App Router là vỏ mỏng), AD-10 (`requireUser` trong middleware/route), AD-11 (Server Actions + 1 Route Handler) | **Không xác minh được**; cache cục bộ **cũ 14 tháng** | **CAO — C1** |
| A3 | **React** — chưa xác minh (146) | AD-1 (cấm import React trong `domain/`), toàn bộ `ui/` | Cache: React **19.2.8** (2026-09-08) | TB: lệch major React ⇒ lệch API Server/Client Component và hook |
| A4 | **TypeScript** — chưa xác minh (147) | Không AD nào nêu tên TS | Cache: **7.0.2** (2026-09-09) | **CAO — H4** |
| A5 | **Drizzle ORM và drizzle-kit** — chưa xác minh (148) | AD-1 (`data/` là adapter), AD-2 (bảng khai trong module), AD-15 (migration) | Không có bản ghi cache | **CAO — H1** |
| A6 | **PostgreSQL trên Neon** — chưa xác minh, cùng major dev/prod (149) | AD-15, AD-3/AD-4/AD-9 (kiểu `date`/`time`/`timestamptz`, số nguyên) | Không có bản ghi cache; máy **không có** Postgres/`psql` | **CAO — C3, M6** |
| A7 | **Auth.js (NextAuth)** — chưa xác minh (150) | **AD-10 là toàn bộ** | Không có bản ghi cache | **CAO — C2** |
| A8 | **exceljs** — chưa xác minh (151) | AD-11 (ngoại lệ Route Handler GET), AD-12 (`.xlsx`) | Cache: **4.4.0, mtime 2023-10-19** | **CAO — H3** |
| A9 | **Zod** — chưa xác minh (152) | AD-11 ("đầu vào được kiểm bằng schema ở biên" — **không nêu tên Zod**) | Cache: **4.6.5** (2026-09-13) | TB — M2 |
| A10 | **Tailwind CSS** — chưa xác minh (153) | AD-14 ("token chỉ khai trong theme Tailwind") | Cache: **4.1.11** (2025-07-15) | **CAO — H2** |
| A11 | **shadcn/ui (Radix)** — chưa xác minh (154) | **Không AD nào** (chỉ có `components/ui/` ở cây thư mục, dòng 189) | Không có bản ghi cache | TB — M1 |
| A12 | **Vercel** — "không ghim phiên bản" (155) | AD-15 | Không kiểm chứng được | TB: runtime/giới hạn hàm, Node version trên Vercel, cron |

### Bảng B — công nghệ được nêu ngoài bảng Stack (AD / conventions / diagram / Structural Seed)

| # | Khẳng định công nghệ | Nơi nêu | AD phụ thuộc | Rủi ro |
|---|---|---|---|---|
| B1 | **Next.js App Router** là lớp vỏ mỏng; page → `ui/`, form → `actions.ts` (20, 24, 163, 172) | paradigm, diagram, seed | AD-1, AD-11 | **CAO** — hành vi App Router đổi theo major (C1) |
| B2 | **Server Actions** là đường ghi duy nhất (26, 96–100, 163) | AD-11, diagram | AD-11 | TB–CAO: API `useActionState`/`revalidatePath` đổi theo major |
| B3 | **Route Handler GET** tại `app/api/reports/[kind]/route.ts` là ngoại lệ duy nhất (100, 175) | AD-11, seed | AD-11, AD-12 | **CAO**: `params` là Promise từ Next 15; runtime phải là Node cho exceljs (C1, H3) |
| B4 | **Middleware** chặn mọi đường dẫn trừ `login` (94) | AD-10 | AD-10 | **CAO** — Edge runtime + cấu hình Auth.js (C2) |
| B5 | Helper `requireUser()` là cửa kiểm tra duy nhất (94, 187) | AD-10 | AD-10 | **CAO** — API phiên của Auth.js đổi theo major; `cookies()` async (C1, C2) |
| B6 | **Drizzle** là adapter dữ liệu, `domain/` cấm import Drizzle (27, 40, 188) | AD-1, diagram | AD-1, AD-2 | **CAO** — H1 |
| B7 | "kết nối **pool**" tới Neon (164) | Structural Seed | AD-15 | **CAO** — chưa chốt driver nào (C3) |
| B8 | Kiểu dữ liệu **`date` / `time` / `timestamptz`**, múi giờ nghiệp vụ cố định **Asia/Ho_Chi_Minh** (137, 88) | Conventions, AD-9 | AD-9, AD-13 | **TB** — không có thư viện/chiến lược TZ nào được chọn (M3) |
| B9 | **Khoá chính là số nguyên tự tăng** (137) | Conventions | AD-4 (tiền nguyên), AD-6 | Thấp: `identity` vs `serial` chưa chốt (L3) |
| B10 | **`revalidatePath`** sau mutation; không giữ state máy chủ ở client (138) | Conventions | AD-11, AD-7 | TB: API Next đổi theo major |
| B11 | **`lib/format`** là nơi duy nhất format tiền/ngày (110–112, 186) | AD-13 | AD-13 | TB: chưa chốt dùng `Intl`/ICU hay thư viện (L2, M3) |
| B12 | **`components/ui/` = shadcn/ui** + "một module brand" trong theme Tailwind (118, 189) | AD-14, seed | AD-14 | **CAO** — H2 |
| B13 | **GitHub nhánh `main` → deploy Vercel** (165) | Structural Seed | AD-15 | Thấp |
| B14 | **"Job sao lưu hằng ngày" + "Bản sao lưu ngoài Neon"** (166–167) | Structural Seed | **AD-15** | **CAO — H6: không công nghệ nào được chọn** |
| B15 | **Secret qua biến môi trường + `.env.example` được commit** (124) | AD-15 | AD-15 | Thấp |
| B16 | **File `.xlsx` mở lại đọc được bằng Excel** (spec CAP-7) sinh bởi exceljs trong Route Handler | AD-12 + ngoại lệ AD-11 | AD-12 | **CAO** — H3 |
| B17 | Thông điệp Server Action trả về tiếng Việt; lỗi ghi log kèm mã lỗi (137–138) | Conventions | AD-11 | Thấp (không phải lựa chọn thư viện) |

---

## 3. Q2 — Rủi ro nếu chốt sai major (xếp theo mức)

Thang mức dùng trong báo cáo này:

- **CRITICAL** — chốt sai ⇒ **một AD đã `[ADOPTED]` không thể thoả như đã viết**, và phát hiện muộn thì phải viết lại một tầng.
- **HIGH** — sai major gây lệch API trên diện rộng, hoặc có **ràng buộc nền tảng chưa được ghi** làm hỏng đường ghi/đọc chính.
- **MEDIUM** — lệch cục bộ, tốn thời gian, hoặc là **khoảng trống stack** cần bổ sung.
- **LOW** — đặt tên, ghi chép, chi tiết DDL.

| Mức | Công nghệ | Sai major thì lệch cái gì | AD nào vỡ / không thoả được |
|---|---|---|---|
| **CRITICAL** | **Next.js** (A2, B1–B3, B5, B10) | App Router đổi API giữa các major: từ Next 15, `cookies()`, `headers()` và `params`/`searchParams` **là bất đồng bộ (phải `await`)**; `requireUser()` hiện được mô tả như một helper đọc phiên, còn Route Handler `[kind]` được mô tả như một hàm nhận tham số đường dẫn | **AD-10** (một cửa kiểm tra), **AD-11** (đường ghi + ngoại lệ duy nhất), **AD-1** (vỏ mỏng) — cả ba đều được viết bằng API của **một** major cụ thể mà spine không nêu |
| **CRITICAL** | **Auth.js (NextAuth)** (A7, B4, B5) | Hai dòng API khác hẳn nhau: `getServerSession()` + `authOptions` (v4) so với `auth()` + cấu hình export (Auth.js v5 / `@auth/core`). Ngoài ra hai ràng buộc chưa được ghi: (a) **Credentials provider chỉ dùng session JWT** — bảng `user` trong DB **không phải** session store; (b) **middleware chạy Edge runtime** nên cấu hình phải tách phần edge-safe, nếu không AD-10 không dựng được đúng như mô tả | **AD-10** ("Auth.js với credentials và bảng user là cơ chế xác thực duy nhất. Middleware chặn mọi đường dẫn trừ trang đăng nhập. Mọi Server Action và Route Handler gọi đúng một helper `requireUser()`") |
| **CRITICAL** | **Driver kết nối tới Neon** (A6, B7) | Chưa chọn giữa driver HTTP (`neon-http`) và driver WebSocket/`pg` (`neon-serverless`, `postgres.js`, `node-postgres`). Driver HTTP **không hỗ trợ transaction tương tác**; dùng HTTP ở prod và `pg` ở dev là **hai driver khác nhau ngoài "cùng engine"** | **AD-15** ("dev và prod đều chạy Postgres cùng major version" — mục tiêu là *không khác biệt hành vi*, mà khác driver thì vẫn khác), **AD-11** (Server Action nhiều câu ghi), **AD-6** (sổ thu cần ghi nguyên tử) |
| **HIGH** | **Drizzle ORM + drizzle-kit** (A5, B6) | `drizzle-orm` và `drizzle-kit` là hai gói hai major độc lập; tên file cấu hình và **tên lệnh CLI đã đổi qua các phiên bản** (`generate:pg` → `generate`, `drizzle.config.json` → `.ts`). AD-15 cấm migration tự chạy ở prod nhưng không nói ai/công cụ nào/chạy ở đâu | **AD-15** (migration có kiểm soát, không tự động ở prod), **AD-1/AD-2** (`data/` là ranh giới module) |
| **HIGH** | **Tailwind CSS** (A10, B12) | Tailwind **v4** (dong hiện hành theo cache) đổi chỗ khai theme sang **CSS-first** và mặc định **không còn `tailwind.config.js`**; cách setup shadcn/ui cũng khác theo major | **AD-14** ("hai màu… logo và tagline **chỉ được khai trong theme Tailwind** và một module brand") mô tả một chỗ khai mà **vị trí vật lý của nó phụ thuộc major**; kéo theo **AD-13** (không hardcode) |
| **HIGH** | **exceljs** (A8, B16) | Không phải chuyện major mà là chuyện **tồn tại/bảo trì**: bản mới nhất trong metadata cục bộ là **4.4.0 với mtime 2023-10-19**. Thêm ràng buộc chưa ghi: Route Handler phải chạy **Node runtime** (không Edge) và chịu giới hạn thời gian/bộ nhớ khi tạo workbook | **AD-12** (một nguồn số cho màn hình và file `.xlsx`) và ngoại lệ của **AD-11** — đây là mắt xích **duy nhất** của CAP-7 |
| **HIGH** | **TypeScript** (A4) | Cache cho thấy một major **7** (bản native). TS là hạ tầng của mọi file: đổi major là đổi build, ESLint, và cả **suy luận kiểu của Drizzle** | Không AD nào ràng buộc TS, nhưng mọi AD đều nằm trong mã TS ⇒ rủi ro **toàn cục**, và hiện **không có quyết định nào** |
| **HIGH** | *(thiếu)* **Công nghệ kiểm thử / lint** | AD-1 lấy lý do tồn tại là *"luật nghiệp vụ… không test được"* và tách `domain/` thành **hàm thuần** — nhưng Stack **không có** test runner nào, cũng không có linter/formatter | **AD-1**: mục tiêu "test được" không có công cụ nào bảo đảm; AD-7/AD-4 (số dẫn xuất, tiền nguyên) là loại luật đáng được test nhất |
| **HIGH** | *(thiếu)* **Công nghệ cho job sao lưu** (B14) | AD-15 đòi "job sao lưu hằng ngày chạy được và đã diễn tập phục hồi một lần", diagram vẽ "Job sao lưu hằng ngày" + "Bản sao lưu ngoài Neon", nhưng **không công nghệ nào được chọn** (Vercel Cron? GitHub Actions? `pg_dump`? PITR của Neon? đích lưu là gì?) | **AD-15** — điều kiện "không ghi dữ liệu thật vào prod trước khi…" **không thể thi hành** vì không có gì để thi hành |
| **MEDIUM** | **Zod** (A9) | Zod 4 (cache: 4.6.5) khác v3 ở API (ví dụ các hàm định dạng ở cấp gốc, cách tùy biến thông điệp lỗi, chữ ký một số constructor). Chưa chốt v3 hay v4, chưa kiểm tra tương thích với Auth.js/Drizzle | **AD-11** ("đầu vào được kiểm bằng schema ở biên") — schema ở biên là hợp đồng của **mọi** đường ghi |
| **MEDIUM** | *(thiếu)* **Xử lý ngày/giờ + múi giờ** (B8, B11) | Chưa chọn thư viện (`Intl`/ICU, `date-fns`+tz, Temporal…) và chưa nêu chiến lược. Bẫy cụ thể: Drizzle trả `date`/`time` dạng **chuỗi** nhưng `timestamptz` dạng **`Date` neo UTC**, trong khi runtime Vercel là UTC còn nghiệp vụ là **+07:00** | **AD-9** ("kỳ thu là cặp `studentId` và `period` dạng YYYY-MM **theo múi giờ Asia/Ho_Chi_Minh**") và **AD-13** ("ngày theo dạng `Thứ 3, 16/09/2026`") — lệch ngày/tháng ở biên tháng là lỗi tiền |
| **MEDIUM** | **Trình quản lý gói** (A1, A5) | Chưa chốt npm hay pnpm (máy có cả hai). Khác nhau ở lockfile, cách chạy migration/dev, và workspace | AD-15 (quy trình migration "có kiểm soát") |
| **MEDIUM** | **Neon / Postgres major** (A6) | "cùng major version ở dev và prod" chưa có **số**; Neon chọn major lúc tạo project, và nó có thể bị nâng cấp | **AD-15** |
| **MEDIUM** | **shadcn/ui** (A11) | Không AD nào ràng buộc; hơn nữa đây **không phải dependency runtime** mà là mã sinh vào repo ⇒ dòng "phiên bản" của nó trong Stack là **sai loại** | Không AD nào — xem §6 |
| **LOW** | Tên gói mơ hồ / lệch tên CLI (B12, A7, A10) | Xem §4 | — |
| **LOW** | Kiểu cột tiền + khoá chính (B9) | AD-4 buộc tiền là số nguyên nhưng không chốt **`integer` (int4) hay `bigint`**; conventions "khoá chính là số nguyên tự tăng" không chốt **`identity` hay `serial`** (DDL khác nhau) | AD-4, AD-6 (nhẹ) |

---

## 4. Q3 — Nghi ngờ lỗi thời / đã đổi tên / đã bị thay thế

> Tất cả mục dưới đây là **NGHI NGỜ CẦN KIỂM CHỨNG**, không phải kết luận. Chỉ mục nào có nhãn **[ĐO ĐƯỢC]** mới dựa trên bằng chứng cục bộ.

| # | Nghi ngờ | Cơ sở | Cần kiểm chứng bằng gì (khi có mạng) |
|---|---|---|---|
| N1 | **`next` trong cache đã cũ ~14 tháng** (15.4.1, mtime 2025-07-16) trong khi `react`/`zod`/`typescript` trong cùng cache được làm mới 09/2026 ⇒ rất có thể đã có **major Next mới** so với những gì spine hình dung **[ĐO ĐƯỢC: mtime]** | §1.2 | `npm view next dist-tags` + đọc `create-next-app` mặc định; kiểm tra "yêu cầu Node" và ghi chú nâng cấp API App Router |
| N2 | **`exceljs` gần 3 năm không phát hành bản mới** ⇒ nghi ngờ **không còn được bảo trì**; đáng cân nhắc thay thế (ví dụ một thư viện ghi xlsx còn được bảo trì, hoặc bản fork) **[ĐO ĐƯỢC: mtime 2023-10-19 + latest 4.4.0]** | §1.2 | Kiểm tra ngày phát hành bản mới nhất, tình trạng issue/security advisory, và các lựa chọn thay thế đang được bảo trì. **Lưu ý:** nếu xét `xlsx`/SheetJS thì phải kiểm tra kênh phân phối chính thức, vì bản trên npm nổi tiếng là lệch với bản phân phối riêng của nhà phát triển |
| N3 | **Tailwind v3 vs v4**: v4 dùng **cấu hình CSS-first** (khối `@theme` trong CSS) và mặc định **bỏ `tailwind.config.js`**; plugin PostCSS cũng đổi tên gói; một số plugin thời v3 (ví dụ `tailwindcss-animate`) được thay bằng gói khác ở v4 **[NGHI NGỜ — cần kiểm chứng]** | §1.2 cho thấy v4.1.11 là dòng hiện hành | Đọc migration guide chính thức v3→v4; kiểm tra shadcn/ui hiện hỗ trợ major nào và file nào giữ token |
| N4 | **shadcn/ui: CLI đã đổi tên** — lệnh cũ `npx shadcn-ui@latest …` được thay bằng `npx shadcn@latest …` **[NGHI NGỜ — cần kiểm chứng]** | kiến thức nền, không kiểm chứng được offline | `npm view shadcn version` + `npm view shadcn-ui version` (gói cũ còn tồn tại hay đã ngừng) |
| N5 | **Auth.js: nhập nhằng tên và major** — "Auth.js (NextAuth)" có thể là `next-auth@4` (NextAuth), `next-auth@5` (Auth.js, từng ở beta dài), hoặc lõi `@auth/core`; các API `getServerSession`/`authOptions` so với `auth()` thuộc về hai major khác nhau **[NGHI NGỜ — cần kiểm chứng]** | kiến thức nền | `npm view next-auth dist-tags` (bản `latest` là 4.x hay 5.x?) + đọc tài liệu credentials provider và hướng dẫn middleware |
| N6 | **Ràng buộc Credentials ⇒ session JWT** (không dùng database session) và **middleware Edge cần cấu hình tách file** **[NGHI NGỜ — cần kiểm chứng]** | kiến thức nền | tài liệu Auth.js: credentials provider + "Edge compatibility" |
| N7 | **Zod v3 vs v4**: v4 đổi API ở nhiều chỗ (hàm định dạng ở cấp gốc, tùy biến thông điệp lỗi, chữ ký `record`…) **[NGHI NGỜ — cần kiểm chứng]** | §1.2 cho thấy 4.6.5 là dòng hiện hành | Đọc migration guide v3→v4 + kiểm tra peer range của các gói dùng Zod |
| N8 | **drizzle-kit: tên lệnh/file cấu hình đã đổi** qua các phiên bản (`generate:pg` → `generate`; `drizzle.config.json` → `drizzle.config.ts`) **[NGHI NGỜ — cần kiểm chứng]** | kiến thức nền | `npm view drizzle-kit version` + `drizzle-kit --help` sau khi cài |
| N9 | **Driver Neon**: `neon-http` vs `neon-serverless`/`pg` — chỉ một số driver có transaction tương tác **[NGHI NGỜ — cần kiểm chứng]** | kiến thức nền | Tài liệu Drizzle "Connect to Neon" + tài liệu Neon về transaction |
| N10 | **Radix**: ngoài các gói `@radix-ui/react-*` còn có gói hợp nhất `radix-ui`; shadcn/ui có thể đã chuyển sang gói hợp nhất **[NGHI NGỜ — cần kiểm chứng]** | kiến thức nền | Kiểm tra component shadcn/ui mới sinh tham chiếu gói nào |
| N11 | **Node 22 có thể đang ở nhánh maintenance** so với Node LTS hiện hành tại 09/2026 **[NGHI NGỜ — cần kiểm chứng]** | lịch phát hành Node | Kiểm tra Node LTS hiện hành + "Node.js version" mà Next major yêu cầu/hỗ trợ |
| N12 | **"PostgreSQL trên Neon"**: Neon **không phải** một engine riêng mà là dịch vụ Postgres managed ⇒ spine nên tách rõ **engine = PostgreSQL (major ?)** và **nhà cung cấp = Neon** [nhận xét ghi chép, không cần kiểm chứng API] | đọc dòng 149 | — |

---

## 5. Q4 — Spine có trung thực về giới hạn "chưa xác minh phiên bản" và có hành động chốt cụ thể không?

### 5.1 Phần ĐẠT (trung thực, rõ ràng)

- **10/12 dòng Stack** ghi thẳng *"chưa xác minh, chốt ở lần khởi tạo dự án"* (145–154); chỉ Node.js được khai đã kiểm tra trên máy (144) và Vercel khai không ghim (155). **Không dòng nào khẳng định một phiên bản mà nó không có cơ sở** — đây là mức trung thực tốt và khớp thực tế repo (không có `package.json`/lockfile, §1.1).
- Đoạn dưới bảng (157) nói thẳng: *"Phiên soạn spine này không có mạng, nên **không có phiên bản nào được xác minh trên web**. Lần khởi tạo dự án phải chốt phiên bản bằng trình quản lý gói rồi ghi số cụ thể vào bảng này — trước khi viết dòng code đầu tiên."*
- **Deferred** có mục riêng cho việc này (227): *"Số phiên bản cụ thể của mọi thư viện. Chốt ở lần khởi tạo dự án vì phiên này không có mạng."*
- `.memlog.md` dòng 17 ghi lại đúng ràng buộc môi trường: *"Môi trường agent không có mạng — không xác minh được phiên bản thư viện; mọi version trong bảng Stack phải đánh dấu chưa xác minh."*

⇒ Về **khai báo giới hạn**: đạt. Không có finding ở đây.

### 5.2 Phần THIẾU (finding M4)

| # | Thiếu gì | Vì sao quan trọng |
|---|---|---|
| a | **Hành động chốt không đo được**: "chốt phiên bản bằng trình quản lý gói" không kèm **lệnh cụ thể**, không nói **pin exact hay dùng khoảng `^`**, không nói **commit lockfile**, không nói ai làm và khi nào coi là xong | Người build không biết thế nào là "đã chốt"; dễ cài xong rồi vẫn để khoảng phiên bản |
| b | **Không có ma trận tương thích** giữa Next ↔ React ↔ Auth.js ↔ Tailwind ↔ shadcn/ui ↔ Drizzle ↔ Node | Đây chính là nơi sai sót xảy ra: chốt từng gói "mới nhất" riêng lẻ vẫn có thể tạo tổ hợp không chạy được |
| c | **Không nêu điều kiện tiên quyết "có mạng"** | **[ĐO ĐƯỢC]** Trên chính máy này, không có mạng nghĩa là bước chốt phiên bản **không thực thi được** (§1.3). Nếu lần khởi tạo dự án diễn ra trong cùng môi trường, spine đang giao một việc bất khả thi mà không nói ra |
| d | **Không nói chốt "phiên bản của cái gì"**: ô Stack ghi tên *sản phẩm* (Auth.js, shadcn/ui, "PostgreSQL trên Neon") chứ không ghi **tên gói**, nên không có cách `npm view` một cách xác định | Chốt phiên bản cần tên gói; xem L1 |
| e | **Không có bước kiểm chứng sau khi cài** (ví dụ chạy build/typecheck tối thiểu, hoặc ghi lại output `npm ls --depth=0`) | Không có bằng chứng để review lần sau |

---

## 6. Q5 — Công nghệ nào không phục vụ AD nào?

| Công nghệ | AD/conventions ràng buộc nó | Kết luận |
|---|---|---|
| `shadcn/ui` | **Không AD nào.** Chỉ xuất hiện ở cây thư mục `components/ui/` (189). AD-13/AD-14 ràng buộc **cách hiển thị** (format, màu) nhưng không nói gì tới thư viện component | **KHÔNG ĐƯỢC QUẢN (M1)** — đây là mục duy nhất trong bảng Stack thực sự "không phục vụ AD nào". Nó cũng không phải dependency runtime (mã sinh vào repo) |
| `TypeScript` | Không AD nào nêu tên | Hạ tầng chung (mọi AD nằm trong mã TS) — chấp nhận được, nhưng **không có luật nào** (strict, cấm `any` ở biên) (H4, L3) |
| `Node.js` | Không AD nào nêu tên | Hạ tầng chung + AD-15 ngầm (deploy) — chấp nhận được (M7) |
| `React` | **AD-1 nêu tên** ("cấm import React" trong `domain/`) | Được quản |
| `Zod` | Chỉ **gián tiếp**: AD-11 nói "schema ở biên" nhưng không nêu tên gói | Truy vết gián tiếp (M2) |
| `Next.js` | AD-1, AD-10, AD-11 | Được quản |
| `Drizzle` | AD-1, AD-2, AD-15 | Được quản |
| `PostgreSQL`/`Neon` | AD-15 | Được quản |
| `Auth.js` | AD-10 | Được quản |
| `exceljs` | AD-11 (ngoại lệ), AD-12 | Được quản |
| `Tailwind CSS` | AD-14 | Được quản |
| `Vercel` | AD-15 | Được quản |

**Chiều ngược lại (nghĩa vụ AD không có công nghệ nào đảm nhiệm)** — quan trọng hơn câu hỏi "thừa":

1. **AD-15** đòi job sao lưu hằng ngày + bản sao ngoài Neon + diễn tập phục hồi → **không có công nghệ nào được chọn** (H6).
2. **AD-1** lấy "test được" làm lý do tách `domain/` thuần → **không có test runner/linter** trong Stack (H5).
3. **AD-9 + AD-13 + conventions** đòi ngày/giờ theo Asia/Ho_Chi_Minh → **không có thư viện/chiến lược TZ** (M3).
4. **AD-15** đòi migration "có kiểm soát, không tự động ở prod" → có `drizzle-kit` nhưng **không nói quy trình chạy** (H1).

---

## 7. Findings phân loại

### CRITICAL

- **C1 — Next.js: major chưa xác minh, cache cục bộ đã cũ ~14 tháng, và các API async của App Router chạm thẳng vào AD-10/AD-11.** Bằng chứng: `next`/`create-next-app`/`eslint-config-next` trong `_cacache` là 15.4.1 với mtime **2025-07-16**, trong khi `react`/`zod`/`typescript` trong cùng cache được làm mới **09/2026** ⇒ bản ghi Next này không đại diện cho major hiện hành. Nền tảng: từ Next 15, `cookies()`, `headers()` và `params`/`searchParams` là **bất đồng bộ**; spine mô tả `requireUser()` (94) và Route Handler `[kind]` (175) như API đồng bộ. Hệ quả: chốt sai major ⇒ lớp vỏ mỏng, cửa kiểm tra duy nhất và đường xuất Excel phải viết lại. *Đề xuất (không tự sửa):* ghi vào Stack dòng Next.js kèm **major mục tiêu** và một dòng luật "App Router: `cookies()`/`headers()`/`params` luôn `await`", hoặc đưa vào Deferred kèm hệ quả lên AD-10/AD-11.
- **C2 — Auth.js: chưa chốt major/tên gói, và hai ràng buộc nền tảng chưa được ghi.** AD-10 dựng toàn bộ cơ chế trên Auth.js, nhưng Stack chỉ ghi "Auth.js (NextAuth)" — đủ để rơi vào `next-auth@4` (`getServerSession`, `authOptions`) hoặc Auth.js v5/`@auth/core` (`auth()`), hai API khác nhau. Thêm: (a) Credentials provider đi kèm **session JWT** — bảng `user` không phải session store, điều này đổi nghĩa câu "bảng user là cơ chế xác thực duy nhất"; (b) **middleware chạy Edge** nên cấu hình phải tách phần edge-safe, nếu không "middleware chặn mọi đường dẫn" không dựng được. *Đề xuất:* chốt tên gói + major, và bổ sung hai ràng buộc này vào AD-10 (hoặc Deferred nếu chưa quyết).
- **C3 — Driver kết nối Neon chưa chốt: nguy cơ mất transaction và lệch driver giữa dev và prod.** Diagram ghi "kết nối pool tới Neon" (164) nhưng không nói driver nào. Driver HTTP của Neon không hỗ trợ transaction tương tác; nếu prod dùng HTTP còn dev dùng `pg`/Postgres cục bộ thì **khác driver**, đúng loại khác biệt hành vi mà AD-15 muốn loại bỏ; nếu chọn HTTP thì AD-11 ("mọi thay đổi qua Server Action") không gói được nhiều câu ghi thành một đơn vị nguyên tử. *Đề xuất:* ghi vào Stack/Database **một** driver duy nhất dùng cho cả dev và prod, kèm ghi chú về transaction.

### HIGH

- **H1 — Drizzle ORM + drizzle-kit: chưa chốt cặp phiên bản và quy trình migration.** Hai gói, hai major độc lập; tên lệnh CLI/file cấu hình đã đổi qua các phiên bản. AD-15 cấm migration tự chạy ở prod nhưng không nói ai chạy, lệnh nào, ở đâu. *Đề xuất:* một dòng trong AD-15 hoặc conventions: cặp phiên bản, file cấu hình, và lệnh migration chạy thủ công.
- **H2 — Tailwind major quyết định "nơi khai token" mà AD-14 đang nói tới.** Cache cho thấy **v4** là dòng hiện hành; v4 khai theme **trong CSS** và mặc định bỏ `tailwind.config.js`, nên câu "token brand chỉ được khai trong theme Tailwind" (118) mô tả một chỗ khai phụ thuộc major, và shadcn/ui setup cũng khác theo major. *Đề xuất:* nêu tên **file** giữ token (ví dụ khối `@theme` trong CSS toàn cục) trong AD-14, hoặc để việc đó cho lần khởi tạo nhưng ghi rõ hệ quả lên AD-14.
- **H3 — exceljs: nghi ngờ không còn được bảo trì, và chưa ghi ràng buộc runtime.** Metadata cục bộ: bản mới nhất **4.4.0, mtime 2023-10-19** (≈3 năm không phát hành). Đây là mắt xích duy nhất của CAP-7 (AD-12 + ngoại lệ AD-11); Route Handler phải chạy **Node runtime** và chịu giới hạn thời gian/bộ nhớ khi tạo workbook. *Đề xuất:* xác minh tình trạng bảo trì và các lựa chọn thay thế trước khi ghim; bổ sung một dòng luật "Route Handler xuất Excel chạy Node runtime, không Edge".
- **H4 — TypeScript: chưa có quyết định, trong khi cache cho thấy một major 7.** TS là hạ tầng toàn cục (build, ESLint, suy luận kiểu Drizzle). *Đề xuất:* chốt major TS + chế độ strict trong conventions, và kiểm tra tương thích với Next major/Drizzle trước khi cài.
- **H5 — Không có công nghệ kiểm thử/lint nào trong Stack, dù AD-1 lấy "test được" làm lý do tồn tại.** AD-1 tách `domain/` thành hàm thuần để test; AD-4/AD-7/AD-9 là loại luật (tiền nguyên, kỳ theo tháng, số dẫn xuất) đáng được test nhất. *Đề xuất:* thêm một dòng Stack cho test runner + một dòng conventions về nơi đặt test của `domain/`, hoặc ghi vào Deferred là chưa chốt.
- **H6 — AD-15 đòi job sao lưu hằng ngày + bản sao ngoài Neon, nhưng không công nghệ nào được chọn.** Diagram có nút "Job sao lưu hằng ngày" → "Bản sao lưu ngoài Neon" mà Stack không có scheduler, không có `pg_dump`/PITR, không có đích lưu. *Đề xuất:* chọn công nghệ cho job + đích lưu, hoặc ghi vào Deferred kèm điều kiện chặn "không nhập dữ liệu thật".

### MEDIUM

- **M1 — shadcn/ui không phục vụ AD nào và không phải dependency runtime.** Nên bỏ "phiên bản" khỏi bảng Stack (ghi là "mã sinh vào `components/ui/`") hoặc thêm một AD/conventions ràng buộc cách dùng component; nếu không, nó là dependency không được quản.
- **M2 — Zod chưa chốt v3/v4 và không được AD-11 nêu tên.** Cache cho thấy 4.6.5 là dòng hiện hành; cần chốt major và kiểm tra peer range với Auth.js/Drizzle trước khi viết schema ở biên.
- **M3 — Thiếu quyết định ngày/giờ & múi giờ dù AD-9 và AD-13 phụ thuộc.** Chưa nêu thư viện/chiến lược; bẫy `date` là chuỗi còn `timestamptz` là `Date` neo UTC, runtime Vercel là UTC còn nghiệp vụ +07:00 ⇒ lệch ngày/tháng ở biên tháng.
- **M4 — Hành động chốt phiên bản chưa đo được và không khả thi offline.** Không lệnh cụ thể, không quy tắc pin exact + commit lockfile, không ma trận tương thích, không nêu điều kiện tiên quyết "có mạng". **[ĐO ĐƯỢC]** `npm view <pkg> version --offline` trả `ENOTCACHED` cho cả 12 gói trên máy này.
- **M5 — Chưa chốt trình quản lý gói** (máy có npm 10.9.8 **và** pnpm): ảnh hưởng lockfile, workspace, cách chạy migration và dev.
- **M6 — AD-15 "cùng major version Postgres" chưa có số, và môi trường dev chưa dựng được DB.** Máy không có Postgres/`psql`, chỉ có docker CLI; không có mạng nên không kéo được image và không tạo được nhánh Neon. Neon chọn major lúc tạo project ⇒ phải ghi số vào spine.
- **M7 — Ô duy nhất "đã kiểm tra" không ghi số cụ thể.** Máy có **Node v22.23.2 qua nvm**; chưa có luật pin (`.nvmrc`/`engines` + Node trên Vercel). Thêm nghi ngờ Node 22 đã ở nhánh maintenance (N11).

### LOW

- **L1 — Tên gói/tên CLI mơ hồ, dễ chốt sai thứ.** "Auth.js (NextAuth)" → `next-auth` hay `@auth/core`?; "PostgreSQL trên Neon" trộn engine với nhà cung cấp; "shadcn/ui (Radix)" trộn CLI sinh mã với primitive; CLI `shadcn-ui` → `shadcn`; `tailwindcss-animate` → gói thay thế ở v4; `radix-ui` hợp nhất vs `@radix-ui/react-*`. Nên ghi **tên gói chính xác** trong bảng Stack — đó cũng là điều kiện để `npm view` được.
- **L2 — `lib/format`: chưa chốt dùng `Intl`/ICU hay thư viện.** AD-13 cần luật rõ cho hậu tố "đ" và dấu phân cách nghìn kiểu vi-VN, và cho việc tính "thứ" của một ngày (phụ thuộc TZ — xem M3).
- **L3 — Kiểu cột tiền và kiểu khoá chính chưa chốt.** AD-4 buộc tiền là số nguyên nhưng không nói `integer` (int4) hay `bigint`; conventions "khoá chính là số nguyên tự tăng" không nói `identity` hay `serial` (DDL khác nhau, ảnh hưởng migration).
- **L4 — "Số phiên bản cụ thể của mọi thư viện" đang nằm trong Deferred cùng chỗ với các mục lịch/hoá đơn.** Đây không phải việc "hoãn vô thời hạn" mà là **cổng bắt buộc trước dòng code đầu tiên** (đúng như câu ở dòng 157) — nên tách ra thành một mục "cổng chốt phiên bản" có điều kiện hoàn thành, để không bị đọc như một mục Deferred thông thường.

---

## 8. Việc tối thiểu phải làm trước dòng code đầu tiên

> Đây là đề xuất **cho người build / lần khởi tạo dự án**, không phải thay đổi spine.

1. **Xác nhận điều kiện tiên quyết:** phiên khởi tạo dự án **phải có mạng** (phiên này không có: `npm view … --offline` → `ENOTCACHED`). Nếu không có mạng, dừng lại và ghi nhận là blocker thay vì cài bằng phỏng đoán.
2. **Chốt tên gói + major cho 3 mục critical:** Next.js (**kèm ghi chú API async của App Router**), Auth.js (**tên gói + major + credentials/JWT + cấu hình Edge**), driver Neon (**một driver duy nhất cho dev và prod, có transaction**).
3. **Chốt ma trận tương thích** một lượt: Next ↔ React ↔ Auth.js ↔ Tailwind ↔ shadcn/ui ↔ Drizzle/drizzle-kit ↔ Zod ↔ Node; kiểm tra peer range chứ không chỉ "bản mới nhất".
4. **Pin exact + commit lockfile**; ghi số cụ thể vào bảng Stack của spine kèm ngày chốt; thêm `.nvmrc`/`engines` khớp Node trên Vercel.
5. **Xác minh sự tồn tại/bảo trì:** `exceljs` (nghi ngờ không còn bảo trì — H3) và các gói đã đổi tên (§4); nếu thay thế exceljs thì phải kiểm chứng định dạng `.xlsx` mở lại được bằng Excel (yêu cầu của spec).
6. **Chọn công nghệ cho 3 nghĩa vụ AD đang trống:** job sao lưu + đích lưu (AD-15), test runner (AD-1), chiến lược ngày/giờ + TZ (AD-9/AD-13) — hoặc ghi vào Deferred kèm hệ quả.
7. **Chạy một vòng kiểm chứng tối thiểu sau khi cài** (`build` + `typecheck`) và lưu lại output để lần review sau có bằng chứng.

---

## 9. Ngoài phạm vi review này

- Các lệch nghĩa giữa spine và `SPEC.md`/`brand.md`/`screen-inventory.md` (bao gồm câu hỏi accrual/cash và hạn đóng học phí) thuộc review đối chiếu đầu vào — xem `reviews/review-reconcile.md` cùng thư mục; review này **không** đánh giá lại các mục đó.
- **Ghi chú thời điểm (không phải finding công nghệ):** `reviews/review-reconcile.md` §3.1 kết luận `SPEC.md` vẫn viết thu nhập theo **phải thu** ở CAP-5 và Success signal; nhưng bản `SPEC.md` hiện tại (dòng 24, 36, 69) đã ghi **"tiền thực nhận" / "tổng tiền đã thu trong tháng"**. Nếu đúng như vậy thì review đó đã đọc một bản cũ hơn — nên kiểm lại trước khi dùng.
- Không có AD nào bị câu hỏi công nghệ làm cho sai về **nghiệp vụ**; các vấn đề ở đây thuần là "chưa chốt được công nghệ" và "nghĩa vụ AD không có công cụ".

---

## 10. Kết luận

- **Trung thực về giới hạn:** **đạt** — 10/12 dòng Stack khai *chưa xác minh*, có đoạn giải thích rõ, có mục Deferred, có ghi trong memlog. Không có dòng nào khẳng định phiên bản vô căn cứ.
- **Xác minh thực tế:** **không đạt** — 0/12 dòng Stack có phiên bản được xác minh; chỉ **Node 22** là khớp được với máy (và còn thiếu số cụ thể).
- **Hành động chốt trước khi viết code:** **thiếu tính đo được** — không lệnh, không quy tắc pin, không ma trận tương thích, và **không khả thi** trong môi trường không mạng hiện tại.
- **Rủi ro lớn nhất khi build:** 3 mục **critical** (Next.js major + API async, Auth.js major + credentials/JWT/Edge, driver Neon) có thể làm vỡ **AD-10, AD-11, AD-15**; 3 nghĩa vụ AD không có công nghệ (**AD-15** sao lưu, **AD-1** kiểm thử, **AD-9/AD-13** ngày–giờ) sẽ bị phát hiện muộn.
- **Điều kiện để coi là pass kiểm chứng công nghệ:** (1) mọi dòng Stack ghi **tên gói + phiên bản cụ thể + ngày chốt**, thu được **bằng trình quản lý gói có mạng**; (2) ba mục critical ở trên có quyết định bằng văn bản gắn với AD tương ứng; (3) ba nghĩa vụ AD đang trống có công nghệ hoặc có mục Deferred kèm hệ quả; (4) có một dòng ghi lại **tổ hợp phiên bản đã kiểm chứng chạy được** (`build` + `typecheck`).
