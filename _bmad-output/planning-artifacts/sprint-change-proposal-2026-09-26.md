---
name: 'Sprint Change Proposal — Haninn English Class'
type: sprint-change-proposal
status: approved
created: '2026-09-26'
approved: '2026-09-30'
author: 'Mary — Business Analyst'
trigger: 'Khách báo 3 vấn đề sau khi dùng bản production'
binds: [CAP-1, CAP-2, CAP-5, CAP-7, CAP-8]
sources:
  - '../specs/spec-hannin/SPEC.md'
  - 'architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md'
  - '../../docs/van-hanh-va-khoi-phuc.md'
---

# Sprint Change Proposal — 26/09/2026

> **Ghi chú thích ứng (đọc trước).** Quy trình correct-course giả định có PRD và Epics.
> Dự án này **không có** PRD, không có epics, không có `sprint-status.yaml` — nó đi
> theo hướng spec-first. Hợp đồng ràng buộc thật là `SPEC.md` (CAP-1…CAP-8) và
> `ARCHITECTURE-SPINE.md` (AD-1…AD-16). Đề xuất này dùng:
>
> | Vai trò trong quy trình | Artifact thật của dự án |
> |---|---|
> | PRD | `_bmad-output/specs/spec-hannin/SPEC.md` |
> | Epics | Danh sách CAP-1…CAP-8 trong `SPEC.md` |
> | Story đã xong | commit `a487f53` + 5 script `scripts/verify-*.mjs` |
> | UX spec | **chưa tồn tại** — đây là một phần của thay đổi này |
>
> Không tạo PRD/epics mới: đó là giấy tờ thừa cho một sản phẩm đã chạy production.

---

## 1. Tóm tắt vấn đề

### 1.1 Nguồn phát hiện

Khách (chủ lớp Haninn) dùng bản production `https://hannin-theta.vercel.app` và báo
ba vấn đề trong một lượt. Không có story nào "phát hiện" vấn đề — đây là **phản hồi
sau khi dùng thật**, tức loại *"yêu cầu mới nổi lên từ người dùng cuối"* cộng với
*"hạn chế kỹ thuật chỉ lộ ra khi chạy thật"*.

### 1.2 Phát biểu vấn đề chính xác

| Mã | Phát biểu | Loại |
|---|---|---|
| **ISS-1** | Giao diện đơn điệu, **không giống mockup khách đã gửi**, thiếu logo khách đã cung cấp, cần nhiều màu sắc hơn | Lỗi tuân thủ hợp đồng + thiếu hụt thiết kế |
| **ISS-2** | Học sinh đã nghỉ học vẫn hiện trong danh sách; cần ẩn đi và có đường hiện lại | Yêu cầu mới từ người dùng |
| **ISS-3** | Tốc độ tải quá chậm; khách đề nghị làm thêm một bản build chạy local | Hạn chế kỹ thuật + **lỗi cấu hình triển khai** |

### 1.3 Bằng chứng (đã kiểm chứng, không suy đoán)

**ISS-3 — nguyên nhân gốc, đo được:**

| Bằng chứng | Cách kiểm | Kết quả |
|---|---|---|
| Function Vercel chạy ở **Mỹ** | gọi `GET /api/jobs/backup`, đọc header `x-vercel-id` | `hkg1::iad1::…` → function ở **iad1** (Washington D.C.) |
| Database ở **Tokyo** | `ARCHITECTURE-SPINE.md` dòng 154, `docs/van-hanh-va-khoi-phuc.md` dòng 12 | Supabase `ap-northeast-1` |
| Route không chạm DB cũng đã tốn | cùng phép đo trên | **296–1247 ms** cho một route chỉ trả 401 |
| `vercel.json` không khai `regions` | đọc file | không có khoá `regions` → dùng mặc định |
| ~44 truy vấn nối tiếp cho màn Tổng quan | đọc call graph: `dashboard/page.tsx:19–37` + `tuition/public.ts:97,180,214` + `attendance/public.ts:128` | xem §1.4 |
| Mọi truy vấn bị xếp hàng trên 1 kết nối | `src/lib/db/index.ts:29` (`max: 1`, theo AD-15) | `Promise.all` cũng không song song hoá được |
| Không có `loading.tsx` nào; 9/9 trang `force-dynamic` | grep + glob `src/**/loading.tsx` | người dùng nhìn màn hình trắng suốt thời gian chờ |

**ISS-1 — lỗi tuân thủ, không phải khẩu vị:**

| Bằng chứng | Cách kiểm | Kết quả |
|---|---|---|
| Logo chưa từng vào app | `Test-Path public` | `False` — **không có thư mục `public/`** |
| Không có asset ảnh nào trong app | glob `src,public -Include *.svg,*.png,*.ico,*.jpg` | 0 kết quả; logo chỉ nằm ở `specs/spec-hannin/sources/haninn-logo.png` |
| Không có favicon | `src/app/layout.tsx` | metadata không khai `icons` |
| AD-14 bị làm một nửa | grep `logo\|tagline` trong `src/` | 0 kết quả — **module brand mà AD-14 yêu cầu không tồn tại** |
| Màn Tổng quan thiếu 4 chỉ số của CAP-1 | `dashboard/page.tsx:108–126` so với `SPEC.md:25` | thiếu chỉ số **năm**, thiếu **cả hai phần trăm**, tỉ lệ điểm danh tính theo **kỳ** chứ không theo **ngày** |
| Hàm phần trăm có sẵn nhưng không ai gọi | grep `formatPercentChange` | chỉ có định nghĩa tại `lib/format/index.ts:63`, **0 lời gọi** |
| Navy chỉ là chữ trên nền trắng | `layout.tsx:11` (`bg-navy-700` ≠ `#0D1F3D`), `ui.tsx:69` | sidebar nhạt hơn navy gốc; coral chỉ ở link 12px; không có icon nào |

**ISS-2 — có bẫy:**

| Bằng chứng | Cách kiểm | Kết quả |
|---|---|---|
| Danh sách không lọc | `students/data/queries.ts:25` | trả về mọi học sinh, kể cả `left` |
| Đường "hiện lại" đã có | `students/ui/student-forms.tsx:93` | `reopenStudentAction` / "Cho học lại" đã tồn tại |
| **Bẫy mất tiền** | `tuition/public.ts:89–92` dùng `listStudents()` rồi lọc `isEnrolledInPeriod` | lọc ở tầng dữ liệu sẽ **xoá học sinh đã nghỉ khỏi danh sách nợ** — trái AD-5 |

### 1.4 Ước lượng số truy vấn màn Tổng quan (5 lớp, 12 học sinh, 4 buổi/ngày)

| Nguồn | Truy vấn |
|---|---|
| `sessionsForDate(today)` — 3 truy vấn + 1 truy vấn cho **mỗi** buổi (`attendance/public.ts:128`) | 7 |
| `billingSummary` → `chargesForPeriod` — 1 + 1 cho **mỗi** lớp (`tuition/public.ts:97`) + 2 + `paidByStudentForPeriod` | 9 |
| `incomeInPeriod` | 1 |
| `listStudents` | 1 |
| `debtorsForPeriod` → **tính lại `chargesForPeriod` từ đầu** (`tuition/public.ts:214`) | 9 |
| `recentComments` | 1 |
| `listClasses` | 1 |
| Vòng lặp `ratioForClassInPeriod` — 3 truy vấn × 5 lớp (`dashboard/page.tsx:33`) | 15 |
| **Tổng** | **~44** |

Với RTT iad1↔Tokyo (≈150–200 ms) và `max: 1`, phần lớn trong **~7–9 giây** là thời
gian chờ mạng thuần, không phải tính toán.

### 1.5 Rủi ro phát hiện thêm trong lúc điều tra (ngoài 3 vấn đề khách nêu)

> **RSK-1 — cổng chặn của AD-15 đang bị vượt.** `docs/van-hanh-va-khoi-phuc.md:37–42`
> ghi job sao lưu **còn trả 503 vì chưa cấu hình Storage**, và **chưa diễn tập phục hồi
> lần nào**; Supabase gói free **không có backup tự động**. AD-15 nói rõ: chưa xong hai
> việc đó thì chỉ được chạy dữ liệu giả. Nếu chủ lớp đã nhập dữ liệu thật thì **mất sổ
> thu là mất tiền thật, không khôi phục được**. Đây không phải vấn đề giao diện hay tốc
> độ — nó là rủi ro nghiêm trọng nhất trong toàn bộ ghi nhận này.

> **RSK-2 — mật khẩu trong `.secrets/owner.txt` đã cũ.** Đăng nhập production trả
> `CredentialsSignin`. Hệ quả: 5 script kiểm chứng trong `scripts/` **đều không chạy
> được** — mất luôn khả năng chứng minh "đã kiểm chứng thật trên production" mà runbook
> đang tuyên bố. Cần cấp lại secret trước khi có thể đo lường sau khi sửa.

> **RSK-3 — đã đóng ngày 30/09/2026.** Khách xác nhận yêu cầu là làm giao diện
> **tươi sáng, thân thiện hơn và responsive** cho chủ lớp; không mở thêm cổng hoặc tài
> khoản cho học sinh/phụ huynh. Non-goals hiện tại giữ nguyên.

---

## 2. Phân tích ảnh hưởng

### 2.1 Ảnh hưởng ở cấp "epic" (capability)

| Capability | Còn hoàn thành được như kế hoạch? | Thay đổi cần |
|---|---|---|
| **CAP-1 Tổng quan** | **Không** — bản đang chạy không đạt tiêu chí nghiệm thu của chính nó | Hoàn thiện 4 chỉ số đúng định nghĩa; làm rõ mốc so sánh phần trăm (P-7) |
| **CAP-2 Quản lý học sinh** | Có, nhưng thiếu một hành vi | Thêm luật hiển thị danh sách theo trạng thái (P-8) |
| CAP-3 Lịch học | Có | Không đổi hợp đồng; chỉ hưởng lợi từ gom truy vấn |
| CAP-4 Điểm danh | Có | Không đổi hợp đồng; chỉ hưởng lợi từ gom truy vấn |
| CAP-5 Học phí và thu nhập | Có | Không đổi công thức; `chargesForPeriod` phải tính một lần cho mỗi request (P-4) |
| CAP-6 Nhận xét | Có | Không đổi |
| CAP-7 Báo cáo | Có | Hưởng lợi từ P-4; phải giữ học sinh đã nghỉ (P-8) |
| CAP-8 Công nợ | Có | **Ràng buộc bảo vệ:** P-8 không được làm rơi người còn nợ |
| Giao diện / nhận diện | **Không** — AD-14 mới làm một nửa; chưa có hợp đồng responsive | Logo + module brand + giao diện tươi sáng + vòng thiết kế UX responsive (P-9, P-10, P-11) |
| Vận hành và triển khai | **Không** — region lệch; cổng AD-15 bị vượt | P-1, P-2, P-12, và tách RSK-1 thành việc riêng |

### 2.2 Ảnh hưởng ở cấp story

Không có story nào tồn tại để sửa. Thay vào đó, thay đổi này sinh ra **6 việc thi hành**
liệt kê ở §4.13 — đó là "backlog" của dự án này.

### 2.3 Xung đột artifact

| Artifact | Xung đột / thiếu | Xử lý |
|---|---|---|
| `SPEC.md` CAP-1 | Định nghĩa mốc so sánh phần trăm chưa có → hai người cài ra hai số khác nhau | P-7 |
| `SPEC.md` CAP-2 | Chưa có luật hiển thị theo trạng thái | P-8 |
| `SPEC.md` Constraints | Chưa có ngân sách hiệu năng và chưa ràng buộc responsive nên không có ngưỡng để nghiệm thu | P-9 |
| `brand.md` mục "Chưa xác định" | Font, kích thước tối thiểu, biến thể logo nền sáng/tối — chặn việc đặt logo lên sidebar navy | P-10 |
| `ARCHITECTURE-SPINE.md` AD-7 | Cấm cache số dẫn xuất; ranh giới với "đọc dữ liệu gốc một lần" chưa rõ → người review sau sẽ tưởng P-4 vi phạm | P-3 |
| `ARCHITECTURE-SPINE.md` AD-12 | Chưa buộc hàm sở hữu phải có đường gom theo lô nên màn hình phải lặp theo lớp | P-4 |
| `ARCHITECTURE-SPINE.md` AD-15 + Stack | Chưa có luật "function phải cùng region với database" | P-2, P-5 |
| `ARCHITECTURE-SPINE.md` Deferred | Chưa ghi phương án build local | P-6 |
| UX design | **Chưa tồn tại** | P-11 (tạo mới) |
| `docs/van-hanh-va-khoi-phuc.md` | Chưa có region, chưa có cách đo tốc độ, secret đã cũ | P-12 |

### 2.4 Ảnh hưởng kỹ thuật

- **Hạ tầng:** `vercel.json` thêm region — không đổi mã, không đổi schema, không cần migration.
- **Dữ liệu:** **không có migration nào.** Không thêm cột, không thêm bảng. AD-16 giữ nguyên.
- **Hiệu năng:** giảm ~44 → ≤8 truy vấn trên đường nóng; không cache số dẫn xuất.
- **Bảo mật/xác thực:** không đổi (AD-10 giữ nguyên).
- **Kiểm thử:** thêm ngân sách hiệu năng đo được; 5 script kiểm chứng hiện có cần secret mới để chạy lại.
- **Responsive:** không đổi nghiệp vụ hay dữ liệu; thay đổi bố cục, điều hướng và cách bảng/form co giãn trên desktop, tablet và điện thoại.
- **Tài liệu:** 4 file cập nhật + 2 file mới (UX).

---

## 3. Đường đi đề xuất

| Phương án | Đánh giá | Kết luận |
|---|---|---|
| **1. Direct Adjustment** — sửa trong cấu trúc hiện có | Không có epic/story để tái tổ chức; sửa thẳng theo CAP | **Khả thi** |
| **2. Rollback** | Không có gì để lùi: mã đang chạy production, dữ liệu thật có thể đã vào. Lùi chỉ làm chậm | **Không khả thi** |
| **3. Xem lại MVP / giảm phạm vi** | Cả ba vấn đề đều nằm trong 8 capability đã chốt; không có gì để cắt | **Không khả thi** |
| **4. Hybrid (chọn)** | Sửa thẳng + **một vòng thiết kế UX** + 2 AD mới/sửa | **Chọn** |

**Phương án chọn: Hybrid.**

**Lý do:**
1. ISS-1 phần chỉ số **không phải thay đổi hợp đồng** — hợp đồng đã đúng, bản cài đặt sai. Đây là việc sửa lỗi, không phải replan. Nhưng phần *nhìn* thì hợp đồng thiếu (logo, màu, font, kích thước) nên cần một vòng UX thật — và khách đã chọn đúng đường đó.
2. ISS-3 có **một sửa đổi một dòng** (region) giải quyết phần lớn, nhưng nếu chỉ sửa region thì ~44 truy vấn × ~2 ms vẫn còn phí; gom truy vấn là việc đúng về lâu dài và rẻ vì `sessionsForPeriod` đã có sẵn.
3. ISS-2 nhỏ, nhưng **phải làm cùng lúc** với các thay đổi kia, vì nếu làm riêng thì nguy cơ lọc nhầm tầng dữ liệu rất cao (xem §1.3 bẫy).
4. **Không có gì phải lùi, không có gì phải cắt.** Rủi ro chính không nằm ở ba vấn đề này mà ở **RSK-1** (không có backup đang chạy) — đề xuất tách thành việc riêng, xếp **trước** mọi việc khác nếu chủ lớp đã nhập dữ liệu thật.

**Ước lượng công sức và rủi ro:**

| Nhóm việc | Công sức | Rủi ro | Ghi chú |
|---|---|---|---|
| P-1 region | **Rất thấp** | **Rất thấp** | 1 dòng; hiệu quả lớn nhất |
| P-2…P-6 AD/spine | Thấp | Thấp | Chỉ sửa tài liệu |
| P-7…P-9 spec | Thấp | Thấp | Hai định nghĩa đã được khách chốt ngày 30/09/2026 |
| P-10 brand + P-11 UX | **Trung bình** | Trung bình | Phụ thuộc khách duyệt thiết kế; và phụ thuộc file logo thật |
| P-12 code gom truy vấn | **Trung bình** | **Trung bình** | Chạm module học phí — nơi AD-5/AD-12 nghiêm ngặt nhất; phải có test |
| P-12b lọc trạng thái | Thấp | Thấp | Có bẫy đã nhận diện |
| RSK-1 sao lưu/phục hồi | Trung bình | **Cao nếu bỏ qua** | Ngoài phạm vi 3 vấn đề nhưng ưu tiên cao nhất |

**Ảnh hưởng tiến độ:** không có sprint đang chạy nên không có gì bị đẩy lùi.

---

## 4. Đề xuất thay đổi chi tiết

### P-1 — `vercel.json`: đặt region function về Tokyo

```diff
 {
   "$schema": "https://openapi.vercel.sh/vercel.json",
+  "regions": ["hnd1"],
   "crons": [
```

**Lý do:** function đang chạy ở `iad1` (đo được), database ở `ap-northeast-1`. Đưa
function về `hnd1` để app và DB cùng nơi. Đây là thay đổi một dòng, không chạm mã,
không chạm dữ liệu, và là sửa đổi có tỉ lệ hiệu quả/chi phí cao nhất trong toàn bộ đề xuất.
**Nghiệm thu:** `x-vercel-id` trên route function phải chứa `hnd1`; và `hnd1` phải là
region có thật trong danh sách region Vercel hỗ trợ tại thời điểm deploy (kiểm bằng
`vercel regions` trước khi commit, đừng đoán tên).

### P-2 — `ARCHITECTURE-SPINE.md` AD-15: thêm luật cùng region

```diff
- **Rule:** dev và prod chạy Postgres cùng major version, cùng driver, dev dùng dữ liệu giả.
+ **Rule:** dev và prod chạy Postgres cùng major version, cùng driver, dev dùng dữ liệu giả.
+ Function của ứng dụng **phải chạy ở cùng region với database**; lệch region làm mỗi
+ truy vấn vượt một chặng xuyên lục địa và biến một màn hình 8 truy vấn thành nhiều giây
+ chờ mạng. Cấu hình region nằm trong `vercel.json`, là một phần của hợp đồng deploy chứ
+ không phải tuỳ chọn của người triển khai.
```

### P-3 — `ARCHITECTURE-SPINE.md`: thêm AD-17 (ranh giới với AD-7)

AD-7 vẫn giữ nguyên hiệu lực. AD-17 **không thay thế** AD-7; nó vẽ rõ ranh giới để P-12
không bị hiểu là vi phạm.

```markdown
### AD-17 — Đọc dữ liệu gốc một lần cho mỗi request [ADOPTED]

- **Binds:** CAP-1, CAP-5, CAP-7, CAP-8
- **Prevents:** mỗi màn hình tự đọc lại cùng một bảng theo một vòng lặp; cùng một request
  tính lại cùng một chỉ số hai lần; và việc tối ưu hiệu năng bị đẩy sang một lớp cache
  mà AD-7 đã cấm
- **Rule:** trong một request, mỗi bảng dữ liệu gốc chỉ được đọc số lần cần thiết và mọi
  phép đọc phải gom theo lô (một truy vấn cho nhiều lớp, không phải một truy vấn cho mỗi
  lớp). Một chỉ số của AD-12 chỉ được tính **một lần** cho mỗi request. Điều này **không**
  cho phép lưu hay cache kết quả tính toán — AD-7 giữ nguyên: mọi lần đọc vẫn tính lại từ
  dữ liệu gốc, chỉ khác là đọc dữ liệu gốc ít lần hơn. Hàm sở hữu của AD-12 phải có đường
  nhận bộ dữ liệu đã đọc sẵn, hoặc có biến thể theo lô, để bên gọi không phải lặp.
```

### P-4 — `ARCHITECTURE-SPINE.md` AD-12: buộc có đường theo lô

```diff
- **Rule:** mỗi chỉ số — thu nhập, số phải thu, công nợ, số buổi, tỉ lệ đã điểm danh, và mọi chỉ số theo lớp hay theo học sinh — có đúng một hàm sở hữu, nằm trong `public.ts` của đúng một module, và mọi màn hình lẫn file Excel đều gọi hàm đó. Cấm viết truy vấn tính chỉ số thứ hai ở bất kỳ đâu, kể cả trong `dashboard` hay `reports`.
+ **Rule:** mỗi chỉ số — thu nhập, số phải thu, công nợ, số buổi, tỉ lệ đã điểm danh, và mọi chỉ số theo lớp hay theo học sinh — có đúng một hàm sở hữu, nằm trong `public.ts` của đúng một module, và mọi màn hình lẫn file Excel đều gọi hàm đó. Cấm viết truy vấn tính chỉ số thứ hai ở bất kỳ đâu, kể cả trong `dashboard` hay `reports`. Hàm sở hữu phải trả được chỉ số cho **nhiều lớp trong một lời gọi** (theo AD-17); màn hình cấm lặp theo lớp rồi gọi hàm sở hữu cho từng lớp.
```

Nghiệm thu bổ sung cho tiêu chí "đúng một hàm": hàm theo lô **vẫn là một hàm** — không
được sinh ra bản sao thứ hai của cùng công thức.

### P-5 — `ARCHITECTURE-SPINE.md` bảng Stack: thêm dòng region

```diff
 | Vercel | nền tảng triển khai | ... |
+| Vercel function region | `hnd1` (Tokyo) — **phải khớp region Supabase** | Cấu hình trong `vercel.json`. Lệch region là nguyên nhân gốc của sự cố chậm 26/09/2026: function ở `iad1` còn database ở `ap-northeast-1`, và một route không chạm database cũng đã tốn 296–1247 ms |
```

### P-6 — `ARCHITECTURE-SPINE.md` mục Deferred: bản chạy local

```markdown
- **Bản build chạy local cho khách.** Khách đề nghị làm thêm bản chạy tại máy. Ghi nhận
  nhưng **chưa làm**, vì hai câu hỏi chưa có câu trả lời: (a) máy khách có Node 22 và
  Docker hay không; (b) nếu dùng Postgres cục bộ thì đâu là **sự thật** — dữ liệu ở máy
  khách hay ở Supabase — và ai chịu trách nhiệm đồng bộ. Sai câu (b) là mất sổ thu. Điều
  quan trọng nhất: **bản chạy local một mình không sửa được vấn đề chậm** — nếu vẫn trỏ
  vào Supabase Tokyo thì nó chỉ bỏ được cold start; phải làm P-1 và P-12 trước.
```

### P-7 — `SPEC.md` CAP-1: định nghĩa mốc so sánh phần trăm

Phần trăm hiện **không được hiển thị ở đâu cả**, và hợp đồng cũng không nói mốc so sánh
là gì. AD-12 buộc hàm sở hữu phải nêu mốc so sánh; khách đã chốt ngày 30/09/2026 dùng
tháng dương lịch liền trước và năm dương lịch liền trước.

```diff
 - **CAP-1 — Tổng quan**
   - **intent:** Chủ lớp xem được tình hình hiện tại trong một màn hình: thu nhập tháng này và năm nay — hiểu là tiền thực nhận trong kỳ — kèm mức thay đổi so với kỳ trước, số buổi học trong ngày, và tỉ lệ đã điểm danh.
   - **success:** Mở màn Tổng quan thấy đủ bốn chỉ số (tiền đã thu trong tháng + % so với tháng trước, tiền đã thu trong năm + % so với năm trước, x/y buổi trong ngày, m/n đã điểm danh); ghi thêm một khoản thu thì chỉ số tiền đổi theo.
+  - **baseline:** "tháng trước" là **tháng dương lịch liền trước**, "năm trước" là **năm dương lịch liền trước**. Thu nhập và mốc so sánh đều tính theo ngày thu, không theo kỳ (AD-8). Kỳ trước bằng 0 thì hiển thị `mới` thay vì phần trăm. `x/y buổi trong ngày` và `m/n đã điểm danh` tính theo **ngày hôm nay**, không theo kỳ — chúng là câu trả lời cho "hôm nay dạy gì", khác hẳn tỉ lệ điểm danh theo kỳ ở màn khác.
+  - **layout:** bốn chỉ số này là **nội dung bắt buộc** của màn Tổng quan và phải đứng cùng một hàng trên cùng, ngay dưới lời chào đầu trang. Màn Tổng quan không được thay chúng bằng chỉ số khác (phải thu, còn thiếu, số học sinh) — những chỉ số đó vẫn được phép hiển thị, nhưng ở khối riêng phía dưới.
```

### P-8 — `SPEC.md` CAP-2: luật hiển thị theo trạng thái

```diff
   - **success:** Thêm một học sinh mới rồi thấy học sinh đó trong danh sách và trong bộ lọc theo lớp; tìm theo tên trả về đúng học sinh; sửa học phí của học sinh đó thì giá trị mới hiển thị lại đúng.
+  - **visibility:** danh sách học sinh **mặc định chỉ hiển thị học sinh đang học**; học sinh đã nghỉ bị ẩn đi nhưng **không bị xoá** (AD-16). Có lựa chọn trạng thái để xem lại học sinh đã nghỉ, chưa bắt đầu, hoặc tất cả; lựa chọn này giữ được khi tải lại trang và khi bấm nút quay lại của trình duyệt. Học sinh đã nghỉ **vẫn phải xuất hiện** trong danh sách nợ, trong cảnh báo quá hạn, và trong báo cáo của các kỳ học sinh đó còn học — việc ẩn chỉ là chuyện của màn danh sách học sinh, không phải luật của tầng dữ liệu.
+  - **success bổ sung:** đặt một học sinh sang trạng thái đã nghỉ rồi tải lại danh sách thì học sinh đó biến mất khỏi danh sách mặc định; chọn xem "Đã nghỉ" thì học sinh đó hiện lại đúng với ngày nghỉ; nếu học sinh đó còn thiếu học phí thì vẫn thấy trong danh sách nợ ở màn Học phí.
```

### P-9 — `SPEC.md` Constraints: thêm ngân sách hiệu năng và responsive

```diff
 - Thao tác thường dùng (điểm danh, thêm học sinh) phải xong trong **một màn hình**, không qua wizard nhiều bước: người dùng không phải dân kỹ thuật.
+ - **Ngân sách hiệu năng đo được:** khi đã đăng nhập và function ở cùng region với database, màn Tổng quan phải trả nội dung trong **dưới 800 ms** và các màn còn lại **dưới 500 ms**. Số đo lấy từ một script trong `scripts/`, chạy lại được — không phải cảm nhận. Màn hình phải hiện khung xương ngay khi dữ liệu còn đang tải, thay vì để trắng.
+ - **Responsive:** toàn bộ chức năng phải dùng được ở bốn viewport nghiệm thu **360×800**, **768×1024**, **1024×768** và **1536×1024**. Không được có cuộn ngang ở cấp toàn trang; bảng rộng được phép cuộn trong chính khung bảng. Điều hướng phải thu gọn dưới 1024 px; nút và trường nhập không bị che, chồng hoặc tràn; thao tác điểm danh và thêm học sinh vẫn hoàn thành trong một màn hình ở từng viewport.
```

### P-10 — `brand.md`: đóng mục "Chưa xác định"

```diff
 ## Chưa xác định
-
-- Font chữ; kích thước tối thiểu của logo; phiên bản logo cho nền sáng/nền tối.
-- Mảnh chữ trên board chưa đọc được: `NGHĨA ÂN` `[?]`.
+### Đã chốt cho việc đặt logo trong app
+
+- **Vị trí:** khu thương hiệu ở đầu sidebar (khu vực dành riêng, không đặt trên nền rối),
+  màn đăng nhập, và favicon.
+- **Biến thể theo nền:** logo khách gửi là bản gốc 1254×1254; board chưa có bản knock-out
+  cho nền tối. Vì sidebar là navy đậm, nếu logo có chữ navy thì **không được đặt trực tiếp
+  lên nền navy** — phải dùng một trong hai: bản knock-out nền trong suốt, hoặc một khối
+  nền sáng bo góc đặt logo lên. Chọn cách nào là quyết định của vòng thiết kế UX, không
+  phải của người code.
+- **Khoảng thở:** logo có phần âm bản tạo thành mũi tên, nên phải giữ khoảng trống tối
+  thiểu bằng 1/4 chiều cao logo ở cả bốn phía.
+- **Kích thước tối thiểu trong app:** 32 px cho favicon, 120 px cho khu thương hiệu sidebar.
+
+### Vẫn chưa xác định
+
+- **Font chữ** — hiện dùng `'Segoe UI', system-ui` trong `globals.css`. Nếu khách muốn
+  font riêng thì phải có file font và giấy phép; chưa có thì giữ nguyên.
+- Mảnh chữ trên board chưa đọc được: `NGHĨA ÂN` `[?]`.
```

### P-11 — Artifact mới: vòng thiết kế UX (`DESIGN.md` + `EXPERIENCE.md`)

Khách đã chốt làm một vòng thiết kế đầy đủ trước khi build. Vị trí:
`_bmad-output/planning-artifacts/ux/` — theo quy ước tài liệu của AGENTS.md.

**Phạm vi bắt buộc của vòng này:**
1. Đối chiếu **từng dòng** của `screen-inventory.md` với bản đang chạy và với `man-hinh-dashboard.jpg`; mọi dòng lệch phải thành một mục trong `DESIGN.md`.
2. Thiết kế giao diện **tươi sáng, thân thiện, bớt khô khan** nhưng vẫn giữ nhận diện Haninn. Navy/coral 70/30 đã bị hiện thực thành "chữ navy trên nền trắng"; phải định nghĩa **màu nào chiếm mảng nào**: sidebar, nền canvas, thẻ chỉ số, nút, nhãn trạng thái. Có thể dùng sắc độ sáng của hai màu làm nền phụ, nhưng navy/coral gốc vẫn là màu thương hiệu và coral không trở thành nền mảng lớn.
3. Chốt avatar/icon cho điều hướng (hiện không có icon nào) và bộ biểu tượng dùng chung.
4. Chốt cách đặt logo theo P-10 và duyệt bằng ảnh chụp màn hình thật.
5. Thiết kế responsive cho bốn viewport của P-9: desktop giữ bố cục gần mockup; tablet và điện thoại có điều hướng thu gọn, thẻ chỉ số đổi từ 4 cột sang 2 rồi 1 cột, form về 1 cột, bảng rộng cuộn trong khung. Không được ẩn chức năng nghiệp vụ để vừa màn hình.
6. Định nghĩa khung xương khi tải (`loading`) theo từng breakpoint để P-12d có căn cứ.

### P-12 — Thay đổi mã (bàn giao cho Dev)

| Mã | File | Việc |
|---|---|---|
| P-12a | `vercel.json` | thêm `regions: ["hnd1"]` (P-1) |
| P-12b | `src/modules/attendance/public.ts`, `src/modules/classes/public.ts` | thêm hàm sở hữu tỉ lệ điểm danh **theo lô cho mọi lớp trong kỳ**; dùng `sessionsForPeriod`/`sessionsForBetween` sẵn có thay vì lặp `sessionsForClassInPeriod` |
| P-12c | `src/modules/tuition/public.ts` | `chargesForPeriod` chỉ tính **một lần** cho mỗi request; `billingSummary` và `debtorsForPeriod` dùng chung kết quả đó. Gom vòng lặp theo lớp thành một truy vấn `IN (...)`. **Giữ nguyên công thức AD-5 và `tuition/domain/pricing.test.ts` phải tiếp tục xanh** |
| P-12d | `src/app/(app)/**/loading.tsx` | thêm khung xương cho các màn |
| P-12e | `src/app/(app)/students/page.tsx` | bộ lọc trạng thái qua `searchParams`, **mặc định chỉ `active`** (P-8). **Cấm** đổi mặc định của `listStudents` |
| P-12f | `src/app/(app)/dashboard/page.tsx` | 4 chỉ số CAP-1 đúng định nghĩa + lời chào theo `brand.md` |
| P-12g | `public/`, `src/components/brand.tsx`, `src/app/layout.tsx` | đưa logo vào app, tạo module brand (AD-14), khai favicon, đặt logo theo P-11 |
| P-12h | `src/components/ui.tsx`, `globals.css`, `app-nav.tsx` và các trang trong `src/app/(app)/` | màu, icon và responsive theo `DESIGN.md`; token và breakpoint khai tập trung; điều hướng thu gọn dưới 1024 px; bảng rộng cuộn trong khung |
| P-12i | `scripts/verify-perf.mjs` (mới) | đo và chặn ngân sách của P-9 |

### P-13 — `docs/van-hanh-va-khoi-phuc.md`

- Thêm dòng region function vào bảng §1 và ghi lại sự cố 26/09 như một cái bẫy ở §6.
- Thêm cách chạy `scripts/verify-perf.mjs` và ngưỡng phải đạt.
- Cập nhật §2: `.secrets/owner.txt` đã cũ (RSK-2) — ghi rõ cách cấp lại.
- Nâng RSK-1 thành mục riêng, có người chịu trách nhiệm và hạn.

---

## 5. Bàn giao thi hành

**Phân loại phạm vi: Moderate** (có một phần Major: cần một AD mới và một vòng UX).

| Bước | Ai | Việc | Điều kiện xong |
|---|---|---|---|
| 1 | **Khách** | Đã chốt mốc so sánh phần trăm, cảm giác giao diện và responsive ngày 30/09/2026 | **Hoàn tất** |
| 2 | **Winston (Architect)** | Đã cập nhật P-2, P-3, P-4, P-5, P-6 vào spine ngày 30/09/2026 | **Hoàn tất — AD-17 có hiệu lực; reviewer gate PASS** |
| 3 | **Sally (UX)** | Vòng thiết kế P-11 → `DESIGN.md` + `EXPERIENCE.md` | **Hoàn tất — khách duyệt P-11 ngày 30/09/2026** |
| 4 | **Mary (BA)** | P-7, P-8, P-9, P-10 vào `SPEC.md`/`brand.md`; xác nhận preservation | Spec tự kiểm được |
| 5 | **Amelia (Dev)** | P-12, theo thứ tự **P-1 trước** (một dòng, hiệu quả ngay), rồi P-12c/b, rồi phần còn lại | Test cũ xanh + `verify-perf.mjs` đạt ngân sách |
| 6 | **Song song, ưu tiên cao nhất** | **RSK-1**: bật Storage cho job sao lưu + diễn tập phục hồi một lần | Job trả 200; đã khôi phục thử và ghi lại |

**Điều kiện nghiệm thu chung:**
1. Ảnh chụp màn Tổng quan giữ cấu trúc và nội dung của `man-hinh-dashboard.jpg`, hiển thị đúng logo khách gửi, có cảm giác tươi sáng và thân thiện theo `DESIGN.md`.
2. Học sinh đã nghỉ biến mất khỏi danh sách mặc định, hiện lại được, **và vẫn còn trong danh sách nợ** nếu còn thiếu tiền.
3. `x-vercel-id` chứa `hnd1`; màn Tổng quan < 800 ms, các màn khác < 500 ms, đo bằng script.
4. Toàn bộ test hiện có vẫn xanh; `pricing.test.ts` không bị nới lỏng.
5. Không có migration, không có cột cache, không có bảng tổng hợp (AD-7 còn nguyên hiệu lực).
6. Tại 360×800, 768×1024, 1024×768 và 1536×1024: không cuộn ngang toàn trang; điều hướng, dashboard, form, bảng và thao tác điểm danh dùng được; bảng rộng chỉ cuộn bên trong khung bảng.

---

## 6. Trạng thái checklist

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| 1.1 Story kích hoạt | `[N/A]` | Không có story; phát hiện khi dùng thật |
| 1.2 Phát biểu vấn đề | `[x]` | ISS-1, ISS-2, ISS-3 |
| 1.3 Bằng chứng | `[x]` | §1.3, §1.4 — tất cả đo hoặc đọc được từ mã |
| 2.1–2.5 Ảnh hưởng epic | `[x]` | §2.1 — không có epic để tái tổ chức; 6 việc thi hành sinh ra |
| 3.1 Xung đột PRD | `[x]` | P-7, P-8, P-9 |
| 3.2 Xung đột kiến trúc | `[x]` | P-2…P-6 |
| 3.3 Xung đột UI/UX | `[!]` | **UX spec chưa tồn tại** → P-11 tạo mới |
| 3.4 Artifact khác | `[x]` | P-13 + RSK-1, RSK-2 |
| 4.1 Direct Adjustment | `[x]` Khả thi | |
| 4.2 Rollback | `[x]` Không khả thi | Không có gì để lùi |
| 4.3 Xem lại MVP | `[x]` Không khả thi | Không có gì để cắt |
| 4.4 Chọn đường đi | `[x]` | Hybrid |
| 5.1–5.5 Thành phần đề xuất | `[x]` | §1–§5 |
| 6.1–6.2 Rà soát | `[x]` | |
| 6.3 Duyệt của người dùng | `[x]` | Phgss duyệt ngày 30/09/2026 |
| 6.4 Cập nhật sprint-status | `[N/A]` | Không có file này trong dự án |
| 6.5 Bàn giao | `[x]` | Sẵn sàng chuyển Winston → Sally → Mary → Amelia theo §5 |
