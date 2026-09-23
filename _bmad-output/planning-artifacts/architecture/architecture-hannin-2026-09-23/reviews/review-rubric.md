# Review rubric (rubric walker) — ARCHITECTURE-SPINE.md

- **Spine được chấm:** `_bmad-output/planning-artifacts/architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md`
  - 228 dòng · 16 AD · `status: draft` · `altitude: feature` · `purpose: build-substrate`
  - SHA256 (16 ký tự đầu): `99C122BB328D733D` · mtime `2026-09-23 17:38:41`
- **Input đối chiếu:** `SPEC.md` (SHA256 `62D4BAA294349F4A`, mtime `2026-09-23 17:39:44`), `brand.md` (mtime 2026-09-21), `screen-inventory.md` (mtime 2026-09-21)
- **Nguồn phụ trợ (chỉ đọc):** `.memlog.md` của phiên kiến trúc và của phiên spec
- **Ngày chấm:** 2026-09-23
- **Phạm vi thao tác:** review này chỉ ghi vào `reviews/review-rubric.md`. **Không sửa spine và không sửa bất kỳ file nào khác.**
- **Công cụ đã chạy:** `uv run .agents/skills/bmad-architecture/scripts/lint_spine.py --workspace <folder>` → `ok: true`, `total_findings: 0` (không placeholder, không AD trùng/không tăng dần, không AD thiếu Binds/Prevents/Rule). Lint **xanh** — nên toàn bộ kết luận dưới đây là nửa ngữ nghĩa mà lint không chạm tới.

> ⚠️ **Cảnh báo độ tươi của baseline (quan trọng cho người tổng hợp).** Trong chính phiên review này, `SPEC.md` đã được render lại **lần 5** lúc `17:39:44` (spec memlog dòng 77–81): CAP-1, CAP-5, CAP-8 và Success signal nay viết theo **tiền thực nhận (cash)**. Bản `SPEC.md` trước đó (accrual) vẫn còn được trích dẫn trong `reviews/review-reconcile.md` §3.1 và trong bảng §2 của file đó — **finding đó nay đã hết hiệu lực**. Review này chấm trên bản cash (`62D4BAA2…`). Đừng cộng dồn hai review mà không đối chiếu mốc thời gian.

---

## 1. Verdict

**ĐẠT MỘT PHẦN — chưa nên chốt `status: final`.** Spine chốt đúng và chắc phần lớn điểm dễ lệch nhất ở tầng dưới (đơn vị tiền, kỳ thu, nguồn "đã thu", giá hiệu lực theo ngày, ranh giới module, một tài khoản, một module định dạng), biết tự khai giới hạn phiên bản một cách trung thực, và có đường thoát cho các lệnh cấm lớn. Nhưng còn **2 lỗi critical** (AD-10 và AD-11 là hai AD `[ADOPTED]` bind `all` không thể cùng đúng ở bề mặt xác thực/ghi; và **hạn đóng học phí** — một constraint của spec + success criterion của CAP-8 — rơi khỏi **mọi** nơi landing trong spine) cùng **10 lỗ hổng high** mà hai đơn vị build độc lập vẫn chọn lệch được. Ba nhóm lỗi high đáng lo nhất vì chúng chạm vào tiền hoặc vào lịch sử: (a) không có chủ sở hữu duy nhất cho hàm sinh "buổi" + bản ghi điểm danh mồ côi khi sửa lịch; (b) không có luật "một hàm duy nhất cho mỗi chỉ số" nên Tổng quan và Báo cáo có thể cài hai lần cùng một con số; (c) trạng thái học / ngày bắt đầu học không được mô hình hoá nên "ai nợ tháng M" là không quyết được.

**Không có AD nào là mô tả chung chung hoàn toàn.** AD yếu nhất về tính thực thi là **AD-15** (gộp 4 quyết định, mệnh đề "migration chạy có kiểm soát" không kiểm được) và **AD-4** (Rule viết theo nghĩa đen thì bất khả thi trong TypeScript/JavaScript). AD mạnh nhất và đáng lấy làm mẫu là **AD-16** và **AD-5**: một quyết định, một divergence, một đường thoát có tên.

---

## 2. Tiêu chí 1 — Spine có chốt đúng điểm dễ lệch ở tầng dưới? Bỏ sót gì?

Phép thử của độ cao này: *hai đơn vị ở tầng dưới (ví dụ module điểm danh và module học phí) tự build thì có chọn lệch nhau không?* Nếu có, và quyết định đó không hiển nhiên, thì phải được chốt.

### 2.1 Đã chốt đúng (ghi nhận, không phải finding)

| Điểm dễ lệch | Chốt ở đâu | Vì sao đủ |
|---|---|---|
| Đơn vị và kiểu của tiền | AD-4 | Chặn sai số dấu phẩy động và hai kiểu làm tròn — đúng loại lỗi hai module tiền hay mắc |
| Giá hiệu lực theo ngày, không tính bằng giá hiện tại | AD-5 | Chặn việc sửa giá hôm nay làm đổi số của tháng đã qua |
| "Đã thu" chỉ có một nguồn (sổ thu), không có cờ trạng thái | AD-6 | Chặn hai cách trả lời "đã đóng chưa" |
| Thu nhập = tiền thực nhận theo ngày thu | AD-8 | Chặn Tổng quan và Báo cáo định nghĩa "thu nhập" hai kiểu; **nay khớp đúng wording mới của spec** (CAP-1/CAP-5/CAP-8/Success signal) |
| Kỳ thu = (học sinh, YYYY-MM) | AD-9 | Chặn "kỳ" hiểu theo lớp / theo buổi / theo ngày thu |
| Một tài khoản, một cửa kiểm tra phiên | AD-10 | Đúng cho phạm vi một người dùng |
| Một module định dạng, token thương hiệu một chỗ | AD-13, AD-14 | Chặn mỗi màn format/pha màu một kiểu |
| Một nguồn số cho màn hình và file Excel | AD-12 | Chặn export tự tính lại |
| Một lớp hiện tại cho mỗi học sinh, điểm danh giữ `classId` lịch sử | AD-16 | Chặn bảng enrollment mọc lên sau và chặn mất lịch sử khi đổi lớp |
| Engine Postgres cùng major ở dev/prod, không ghi dữ liệu thật trước khi có sao lưu | AD-15 | Đúng loại bất biến môi trường mà độ cao feature hay bỏ rơi |

### 2.2 Bỏ sót (chi tiết ở phần findings)

| # | Điểm hai đơn vị vẫn chọn lệch được | Finding |
|---|---|---|
| 1 | Hạn đóng học phí: lưu ở đâu, ai sở hữu (tuition hay payments), mốc hiệu lực hay giá trị hiện tại | **C2** |
| 2 | Hàm sinh "buổi" có một bản hay bốn bản; bản ghi điểm danh mồ côi sau khi sửa lịch được lọc hay hợp | **H1** |
| 3 | Cùng một chỉ số (thu nhập theo khoảng, phải thu theo kỳ, tỉ lệ điểm danh) cài mấy lần, ở module nào | **H2** |
| 4 | Học sinh "Chưa bắt đầu" có phát sinh học phí tháng M không; học phí bắt đầu từ tháng nào | **H3**, **M13** |
| 5 | Ranh giới giao dịch khi ghi nhiều dòng (lưu điểm danh cả buổi) nằm ở tầng nào | **H4** |
| 6 | Quy tắc gán `period` so với `ngày thu` khi thu tiền; trả trước một tháng có được không | **H6** |
| 7 | Xoá học sinh/lớp: xoá cứng có cascade hay xoá mềm bằng trạng thái | **H8** |
| 8 | Báo cáo thu nhập "theo lớp" neo vào lớp hiện tại hay lớp tại thời điểm thu | **H10** |
| 9 | Chống ghi trùng một khoản thu (double-submit) | **M7** |
| 10 | Một học sinh có mấy nhận xét cho một tháng, Tổng quan hiển thị cái nào | **M8** |
| 11 | Định dạng ô tiền trong file Excel: chuỗi đã format hay số | **M5** |
| 12 | Mã học sinh / cách nhận diện học sinh (tên + lớp so với khoá chính số nguyên) | **M1** |

---

## 3. Tiêu chí 2 — TỪNG AD: Rule có thực thi được không, có ngăn đúng cái mà Prevents nêu không?

Thang đánh giá: **OK** = Rule kiểm được và ngăn đúng divergence đã nêu · **MỘT-PHẦN** = Rule kiểm được nhưng chỉ ngăn một phần divergence, hoặc còn lỗ hổng kề bên · **LỖI** = Rule không thực thi được như viết, hoặc xung đột với AD khác · **CHUNG-CHUNG** = không kiểm được, gần với khẩu hiệu.

| AD | Rule kiểm được? | Ngăn đúng Prevents? | Kết luận | Ghi chú ngắn |
|---|---|---|---|---|
| AD-1 Module theo feature, lõi domain thuần | Có (đọc/lint chiều import) | Có | **OK** | Thiếu cơ chế cưỡng chế tự động → M4 |
| AD-2 Mặt tiếp xúc công khai `public.ts` | Có | Có | **OK** | Cùng M4 |
| AD-3 Buổi suy ra từ lịch, không lưu bản ghi buổi | Có ở phía ghi | **Chỉ một phần** | **MỘT-PHẦN** | Không nói hàm sinh buổi có một bản duy nhất, và không nói cách đọc bản ghi mồ côi sau khi đổi lịch → H1 |
| AD-4 Tiền là số nguyên VND | **Không** theo nghĩa đen | Chỉ một phần | **LỖI** | "Cấm float" bất khả thi trong TS/JS; "cấm mọi phép làm tròn ở mọi tầng" mâu thuẫn với chỉ số `%` mà CAP-1 buộc phải hiển thị → H5 |
| AD-5 Giá hiệu lực theo ngày, không sinh hoá đơn | Có | Có | **OK (thiếu phạm vi)** | Đúng và kiểm được; thiếu hạn đóng (C2), thiếu cửa sổ "đang học" (H3), thiếu "miễn giảm là số tiền cố định" (M13) |
| AD-6 Sổ thu là nguồn duy nhất của "đã thu" | Có | Có | **OK (thiếu phạm vi)** | Không có luật chống ghi trùng (M7), không có vết sửa/xoá (M11) |
| AD-7 Không lưu số dẫn xuất | Có (soát schema) | Có | **OK** | Câu chữ "cấm cột cache" đụng AD-16 (L1) |
| AD-8 Thu nhập là tiền thực nhận | Có (soát nhãn UI + định nghĩa) | Có | **OK** | Nay khớp spec bản cash; nhưng spine không ghi vết đã đồng bộ ngược spec (L6) |
| AD-9 Kỳ thu là (học sinh, tháng) | Có | **Chỉ một phần** | **MỘT-PHẦN** | "Không có đóng trước nhiều tháng" không nói một tháng thì sao; không chốt quan hệ với `ngày thu` → H6 |
| AD-10 Một tài khoản, một cửa kiểm tra | **Không** (thiếu major Auth.js; middleware Edge không chạm được bảng user) | **Ngược lại**: Rule tạo hai chỗ kiểm tra | **LỖI** | Prevents nói ngăn "kiểm tra phân quyền thừa" nhưng Rule bắt buộc vừa middleware vừa `requireUser()`; vòng đời tài khoản bỏ trống (H9) → C1 |
| AD-11 Ghi dữ liệu qua Server Actions | **Không** ("ngoại lệ duy nhất là GET") | Không | **LỖI** | Xung đột trực tiếp với AD-10 và với cây `src/app/` (không có route auth) → C1 |
| AD-12 Một nguồn số cho màn hình và Excel | Có | Có, nhưng phạm vi quá hẹp | **MỘT-PHẦN** | Chỉ bind CAP-7; không chặn hai bản cài của cùng một chỉ số ở `dashboard` và `reports` → H2; bỏ lửng định dạng ô tiền (M5) |
| AD-13 Một module định dạng | Có (soát component) | Có | **OK (quá rộng)** | Câu cuối cấm format "số" nói chung, đụng SĐT / `T2-T4-T6` / `22/30` (L2) |
| AD-14 Token thương hiệu một chỗ | Nửa đầu có, nửa sau không | Chỉ một phần | **MỘT-PHẦN** | Cấm hardcode hex kiểm được; "tỉ lệ 70/30" không đo được; trung tính/typography không được ghim → M9, L4 |
| AD-15 Cùng engine hai môi trường, sao lưu trước dữ liệu thật | Một phần | Một phần | **CHUNG-CHUNG** | Gộp 4 quyết định; "migration chạy có kiểm soát" không kiểm được; job sao lưu không có chủ → H7, M3 |
| AD-16 Học sinh thuộc đúng một lớp | Có | Có | **OK (mẫu)** | Biết nêu hệ quả và đường thoát ("trừ khi có AD mới thay thế") |

**Không có AD nào là mô tả chung chung trắng trợn.** Hai chỗ hạ xuống mức khẩu hiệu là: mệnh đề *"Migration chạy có kiểm soát, không tự động ở prod"* (AD-15) và *"Tỉ lệ 70/30 là luật trình bày"* (AD-14) — cả hai không có cách nào để người review xác nhận đúng/sai.

---

## 4. Tiêu chí 7 — Hai AD mâu thuẫn hoặc chồng lấn gây hiểu hai cách

| # | Cặp | Loại | Finding |
|---|---|---|---|
| 1 | **AD-10 ↔ AD-11** | Mâu thuẫn thật, cả hai `[ADOPTED]`, `Binds: all`, không có trọng tài | **C1** (critical) |
| 2 | **AD-10 nội tại** | Rule bắt buộc hai cửa kiểm tra trong khi `Prevents` nói ngăn "kiểm tra phân quyền thừa" | **C1** |
| 3 | **AD-11 ↔ Structural Seed** | Cây `src/app/` không có route nào cho Auth.js, trong khi AD-10 buộc dùng Auth.js | **C1** |
| 4 | **AD-3 ↔ AD-5** | Chồng lấn về hiệu lực theo thời gian: giá có mốc hiệu lực theo ngày, quy tắc lịch thì không | **H1** |
| 5 | **AD-7 ↔ AD-16** | Chồng lấn câu chữ: "cấm cột cache" đọc thẳng ra là cấm cột `classId` snapshot mà AD-16 bắt buộc | **L1** |
| 6 | **AD-12 ↔ AD-13** | Chồng lấn về nguồn của con số trong Excel (một nguồn số vs mọi hiển thị tiền qua `lib/format`) | **M5** |
| 7 | **AD-6 ↔ Deferred "chốt sổ"** | AD-6 cho sửa/xoá payment bất kỳ ngày nào; Deferred nói nếu khách cần bất biến thì thêm bảng hoá đơn — hai AD/Deferred mô tả hai thế giới khác nhau cho cùng một sổ | **M11** |
| 8 | **AD-4 ↔ CAP-1** | Rule cấm mọi làm tròn ở mọi tầng, CAP-1 bắt buộc hiển thị `%` | **H5** |

---

## 5. Tiêu chí 3 — Deferred có mục nào vẫn khiến hai đơn vị build lệch?

Đã đọc hết 8 mục Deferred (dòng 221–228). Đánh giá từng mục:

| Mục Deferred | Có thể gây lệch? | Finding |
|---|---|---|
| Buổi bù, nghỉ lễ, ghi chú theo buổi | **Có** — không nêu ai sở hữu hàm sinh buổi, không có điều kiện xem lại; thêm bảng ngoại lệ sẽ đụng 4 module và đổi mẫu số của mọi tỉ lệ | **H1**, **M2** |
| Chốt sổ và hoá đơn bất biến | **Có** — viết dưới dạng điều kiện hoá ("Nếu khách cần…") nhưng khách **chưa từng được hỏi**; đây là câu hỏi mở bị ngụy trang thành defer | **M11** |
| Định dạng mã học sinh | **Có** — câu "hiện nhận diện học sinh bằng tên và lớp" xung đột với convention "khoá chính là số nguyên tự tăng" và sập với hai học sinh trùng tên cùng lớp | **M1** |
| Học sinh học nhiều lớp — đã chốt là không (AD-16) | Không — **mẫu tốt**: có quyết định, có hệ quả (học phí phải chuyển sang tính theo lớp), có điều kiện xem lại | — |
| Mobile và responsive | Không — defer nguyên một chiều, spec đã chốt desktop | — |
| Thông báo cho phụ huynh | Không — non-goal của spec, đã nói rõ nếu đổi ý là hệ thống mới | — |
| Số phiên bản cụ thể của mọi thư viện | Không — xem tiêu chí 4; có hành động và mốc cụ thể | **L5** (cách ghi marker) |
| Nhiều người dùng và phân quyền | Không — có nêu "AD-10 phải được thay" | — |

**Ba chiều bị bỏ quên hoàn toàn (không quyết, không defer, không hỏi)** — đây là dạng lỗi nặng hơn cả Deferred sai: **hạn đóng học phí** (C2), **trạng thái học / ngày bắt đầu học** (H3), **vòng đời tài khoản (đổi và khôi phục mật khẩu)** (H9).

---

## 6. Tiêu chí 4 — Công nghệ có được xác minh? Spine có trung thực về giới hạn không mạng?

**Kết luận: ĐẠT về thái độ trung thực, CHƯA ĐẠT về mặt cơ chế.** Đây là phần spine làm tốt hơn mức trung bình:

1. **Tự khai giới hạn trung thực và đúng chỗ.** Bảng Stack (142–155) ghi "chưa xác minh, chốt ở lần khởi tạo dự án" cho 9/10 dòng, và ngay dưới bảng có một câu riêng (157): *"Phiên soạn spine này không có mạng, nên không có phiên bản nào được xác minh trên web."* Không có dòng nào giả vờ đã kiểm.
2. **Có hành động cụ thể, không chỉ thú nhận.** Cùng câu 157: phải chốt phiên bản bằng trình quản lý gói rồi ghi số cụ thể vào bảng **trước khi viết dòng code đầu tiên**; và Deferred có mục riêng cho việc này kèm lý do. Đây đúng là điều rubric đòi ("verify any named technology's current version and fit on the web before binding" — khi không thể, phải nói ra và chuyển thành điều kiện chặn).
3. **Dòng Node.js 22 "đã kiểm tra trên máy này"** — trung thực về phạm vi kiểm chứng (máy, không phải web).
4. **Giới hạn của chính review này:** phiên của tôi cũng không có mạng, nên tôi **không xác minh được** phiên bản hiện hành. Tôi chỉ chấm được tính phù hợp nội tại (mọi tên được nêu đều là công nghệ thật, phổ biến và hợp với một app Next.js một người dùng) và tính nhất quán giữa các AD. Việc "còn tồn tại và phù hợp" phải chờ bước chốt phiên bản — và đây chính là lý do không được chốt `status: final` trước bước đó.

**Hai kẽ hở cơ chế (không phải đạo đức):**

- **Lint đang xanh vì marker viết bằng chữ.** `lint_spine.py` chỉ báo `version_pin` khi ô Version **rỗng** hoặc còn `{token}` (xem `scripts/lint_spine.py` dòng 189–197). Chuỗi "chưa xác minh, chốt ở lần khởi tạo dự án" là ô **không rỗng**, nên cổng cơ học báo `ok: true`. Hệ quả: nếu một dòng bị bỏ sót ở bước chốt phiên bản, gate cơ học sẽ không bắt được. → **L5**
- **Nghĩa vụ ghim phiên bản nằm ngoài cấu trúc AD.** Không có AD/convention nào nói "phiên bản ghim chính xác, không dùng `^`/`~`, commit lockfile" — mà đây lại là bất biến thật: nếu một đơn vị dùng caret range và đơn vị khác ghim, thì chính AD-15 ("dev và prod đều chạy Postgres cùng major version", "khác biệt hành vi giữa dev và prod" là cái phải ngăn) mất giá trị. → **L5**

**Một rủi ro phù hợp không cần mạng để thấy:** AD-10 nói *"Auth.js với credentials… Middleware chặn mọi đường dẫn… mọi Server Action gọi `requireUser()`"* nhưng **không nói major version nào** (v4 route-handler-centric so với v5 `auth()`/`handlers`), trong khi chính nội dung của Rule phụ thuộc vào major đó. Rule vì vậy **không quyết định được** cho tới khi phiên bản được chốt — và điều này nối trực tiếp vào **C1**.

---

## 7. Tiêu chí 5 — Spine có phủ hết CAP-1..CAP-8?

**Phủ 8/8 ở mức bảng Capability → Architecture Map (206–217):** mỗi CAP đều có `Lives in` và `Governed by`. Không CAP nào hoàn toàn vô chủ. Nhưng độ phủ đồng đều không cao:

| CAP | Chỗ ở trong spine | Đủ để build đúng spec? | Finding |
|---|---|---|---|
| CAP-1 Tổng quan | `modules/dashboard`; AD-7, AD-8, AD-13 | **Thiếu**: ai cài 4 chỉ số, mốc so sánh của `%`, định nghĩa `m/n đã điểm danh` | **H2**, **H1** |
| CAP-2 Học sinh | `modules/students`; AD-1, AD-2, AD-5, AD-16 | **Thiếu**: `trạng thái học` không được mô hình hoá dù AD-16 buộc `classId` NOT NULL | **H3** |
| CAP-3 Lịch học | `modules/classes`; AD-3 | **Thiếu**: quy tắc lịch không có hiệu lực theo ngày, nên "sửa lịch" viết lại quá khứ | **H1** |
| CAP-4 Điểm danh | `modules/attendance`; AD-3, AD-11 | **Thiếu**: tập giá trị trạng thái (`Có học`/`Vắng`), mẫu số của tỉ lệ, cách xử lý bản ghi mồ côi | **H1** |
| CAP-5 Học phí và thu nhập | `modules/tuition` + `payments` + `dashboard`; AD-4, AD-5, AD-6, AD-8 | **Thiếu**: miễn giảm là *số tiền cố định* (không phải %) chưa được chốt; ai được tính tiền | **M13**, **H3** |
| CAP-6 Nhận xét | `modules/comments`; AD-2, AD-13 | **Thiếu**: bội số nhận xét cho mỗi (học sinh, tháng) | **M8** |
| CAP-7 Báo cáo | `modules/reports`; AD-12, AD-8 | **Thiếu**: neo lớp lịch sử cho thu nhập; định dạng ô tiền trong Excel | **H10**, **M5** |
| CAP-8 Công nợ | `modules/payments` + `tuition`; AD-5, AD-6, AD-9 | **Không đủ**: `hạn đóng` rơi khỏi mọi nơi; không có bề mặt UI/route nào | **C2**, **M6** |

**Capability không tìm thấy chỗ ở trong spine:** không có CAP nào mất tích hoàn toàn, nhưng **CAP-8 mất cả hai chân**: chân dữ liệu thiếu `hạn đóng` (C2) và chân bề mặt thiếu route/màn (M6) — trong khi `screen-inventory.md` dòng 34–35 đã cảnh báo thẳng là màn công nợ và chỗ nhập miễn giảm/hạn đóng *"chưa có màn tương ứng trong ảnh — cần thiết kế mới"*. Nghịch lý đáng chú ý: sidebar quan sát được có 7 mục, khớp 1-1 với 7 route của cây `src/app/`, tức CAP-8 không có mục điều hướng nào — nhưng CAP-8 vẫn là một trong 8 capability và được 4 AD bind.

---

## 8. Tiêu chí 6 — Mọi chiều ở độ cao feature đã được quyết / defer / hỏi chưa?

| Chiều | Trạng thái | Finding |
|---|---|---|
| Paradigm & ranh giới module | ✅ Quyết (AD-1, AD-2, sơ đồ phụ thuộc) | — |
| Ai sở hữu bảng/dữ liệu nào | ✅ Quyết (AD-2, ERD) | — |
| Mô hình tiền & kỳ | ✅ Quyết (AD-4, AD-5, AD-6, AD-8, AD-9) | **H5**, **H6**, **M13** |
| Đột biến trạng thái (mutation) | ⚠️ Quyết một nửa — chưa có ranh giới giao dịch | **H4** |
| Xác thực | ⚠️ Quyết nhưng tự mâu thuẫn; thiếu vòng đời tài khoản | **C1**, **H9** |
| Định dạng & ngôn ngữ UI | ⚠️ Quyết (AD-13) nhưng quá rộng; "có dấu"/"duy nhất" bị làm nhạt | **L2**, **M9** |
| Thương hiệu | ⚠️ Một phần (màu/logo/tagline). Font, biến thể logo, giọng điệu, lời chào không quyết/không defer | **M9**, **L4** |
| Triển khai & môi trường | ⚠️ Một phần (Vercel + Neon, AD-15). Số môi trường, chính sách preview, cô lập secret theo môi trường: im lặng | **M10** |
| Hạ tầng / nhà cung cấp | ✅ Quyết (PaaS: Vercel + Neon) | — |
| **Vận hành: sao lưu & phục hồi** | ❌ **Im lặng về chủ thể** — có tên job trong sơ đồ, nhưng không ai chạy, chạy bằng gì, lưu ở đâu, giữ bao lâu, kết quả diễn tập ghi ở đâu | **H7** |
| Migration & tiến hoá schema | ⚠️ "có kiểm soát" — không kiểm được; AD-2 tách schema theo module nhưng không chốt một sổ migration | **M3** |
| Bí mật & cấu hình | ✅ Quyết (biến môi trường + `.env.example`, không commit) | — |
| **Quan sát hệ thống (log/alert)** | ❌ Im lặng — convention nói "lỗi được ghi log kèm mã lỗi" nhưng không có đích đến, không ai đọc | ghi chú dưới |
| **Xoá & lưu trữ dữ liệu** | ❌ Im lặng — không có luật xoá học sinh/lớp | **H8** |
| Mobile/responsive | ✅ Defer có lý do | — |
| Thông báo phụ huynh | ✅ Non-goal | — |
| Số phiên bản thư viện | ✅ Defer có hành động | **L5** |
| Phân quyền nhiều người | ✅ Defer kèm điều kiện ("AD-10 phải được thay") | — |

**Đọc bảng này:** đây **không** phải spine bỏ rơi cả chiều vận hành — nó có AD-15 và một sơ đồ triển khai, tức đã tốt hơn bản nháp domain-focused thông thường. Nhưng chiều vận hành mới được nêu **một nửa**: cái gì chạy ở đâu thì có, còn **ai chịu trách nhiệm và kiểm chứng bằng gì** thì không. Chú thích: log/alert và a11y (người dùng không phải dân kỹ thuật, desktop) là hai chiều im lặng nhưng stakes thấp — chỉ cần một dòng trong Deferred.

---

## 9. Tiêu chí 8 — Rule quá chặt đến phản tác dụng mà không nêu đường thoát

| AD | Chỗ quá chặt | Có đường thoát? | Finding |
|---|---|---|---|
| AD-4 | "cấm mọi phép làm tròn ở mọi tầng" | **Không** — trong khi CAP-1 buộc hiển thị `%` so với kỳ trước, tức bắt buộc phải làm tròn ở tầng hiển thị | **H5** |
| AD-14 | "tỉ lệ 70/30 là luật trình bày" | Không — và không có cách đo | **L4** |
| AD-15 | "migration chạy có kiểm soát"; "đã diễn tập phục hồi một lần" | Không — không có cơ chế, không có chủ, không có bằng chứng | **H7**, **M3** |
| AD-7 | "cấm cột cache và bảng tổng hợp" | **Có** — "muốn tối ưu sau này thì phải có AD mới thay thế" | OK (chỉ cần giới hạn lại câu chữ: **L1**) |
| AD-16 | "cấm bảng enrollment… cấm quan hệ nhiều-nhiều" | **Có** — "trừ khi có AD mới thay thế AD này" | OK |
| AD-5 | "không bao giờ tính bằng giá hiện tại" | Có (thay AD) | OK |
| AD-3 | "không có bảng buổi" | Có (Deferred nêu bảng ngoại lệ) | OK — nhưng phía đọc thiếu (**H1**) |
| AD-2, AD-1 | "không có ngoại lệ, kể cả cho một màn hình nhỏ" | Không cần — quá chặt là đúng ý đồ, quy mô 12 học sinh | OK |
| AD-12 | "cấm viết truy vấn thứ hai cho export, kể cả khi thấy nhanh hơn" | Không cần — đúng ý đồ | OK |
| AD-6 | "không tồn tại cờ 'đã thu' ở bất kỳ bảng nào" | Không nêu, nhưng hệ quả được chấp nhận | OK — kèm lưu ý mất vết sửa/xoá (**M11**) |

**Tổng hợp:** chỉ **AD-4** là chỗ quá chặt gây phản tác dụng thật (nó cấm đúng cái mà CAP-1 bắt buộc), và **AD-14/AD-15** là chỗ quá chặt nhưng không có hiệu lực vì không kiểm được. Các lệnh cấm lớn khác (AD-3, AD-5, AD-6, AD-7, AD-16) đều có đường thoát hoặc quy mô dự án khiến chúng hợp lý.

---

## 10. Findings đầy đủ theo mức

### 10.1 CRITICAL

#### C1 — AD-10 và AD-11 không thể cùng đúng ở bề mặt xác thực và bề mặt ghi
- **Mô tả.** AD-10 (`[ADOPTED]`, `Binds: all`, dòng 90–94) buộc *"Auth.js với credentials và bảng user là cơ chế xác thực duy nhất"*, *"Middleware chặn mọi đường dẫn trừ trang đăng nhập"*, *"Mọi Server Action và Route Handler gọi đúng một helper `requireUser()`"*. AD-11 (`[ADOPTED]`, `Binds: all`, dòng 96–100) buộc *"mọi thay đổi dữ liệu đi qua Server Action"* và *"Ngoại lệ duy nhất được phép là Route Handler GET để tải file Excel"*. Cây `src/app/` (dòng 170–175) chỉ khai `api/reports/[kind]/route.ts` — **không có route nào cho Auth.js**.
- **Vị trí.** AD-10 (dòng 94), AD-11 (dòng 100), Structural Seed cây `src/app/` (dòng 173–175), và mục Stack "Auth.js (NextAuth) | chưa xác minh" (dòng 150).
- **Vì sao là vấn đề.** Ba hệ quả độc lập, mỗi hệ quả đủ để một builder phải vi phạm ít nhất một AD ngay ngày đầu: (1) Auth.js cần một bề mặt HTTP riêng (`/api/auth/[...nextauth]`) và ở nhiều major nó cần cả `POST`; AD-11 tuyên bố ngoại lệ **duy nhất** là GET nên việc dựng auth hợp lệ trở thành vi phạm AD-11. (2) AD-10 yêu cầu middleware chặn mọi đường dẫn, nhưng middleware của Next.js chạy ở Edge runtime và không truy vấn được bảng `user` trong Postgres — muốn đúng luật phải tách cấu hình auth (phiên không chạm DB) và điều đó **không** được nói; Rule vì vậy không thực thi được như viết. (3) Rule bắt buộc **hai** cửa kiểm tra (middleware + `requireUser()` trong từng action), đúng cái mà chính `Prevents` của AD-10 nói là phải ngăn ("kiểm tra phân quyền thừa"). Cuối cùng, AD-10 không chốt major của Auth.js trong khi nội dung Rule phụ thuộc major đó, nên không ai đọc Rule mà biết phải làm gì.
- **Đề xuất sửa cụ thể.**
  1. Viết lại ngoại lệ của AD-11 thành danh sách đóng: *"Ngoại lệ: (a) Route Handler GET `/api/reports/[kind]` để tải `.xlsx`; (b) bề mặt HTTP của Auth.js tại `app/api/auth/[...nextauth]/route.ts` — chỉ dùng cho đăng nhập/đăng xuất, không chứa luật nghiệp vụ."* Thêm route đó vào cây `src/app/`.
  2. Sửa AD-10 để nói rõ **một** cửa quyết định: middleware chỉ kiểm sự hiện diện/hợp lệ của cookie phiên (không truy vấn DB), còn `requireUser()` trong action/route handler là nơi duy nhất truy vấn bảng `user`; hoặc bỏ hẳn middleware và để `requireUser()` là cửa duy nhất — cả hai đều thoả `Prevents`, nhưng phải chọn một.
  3. Ghi major Auth.js dự kiến (v4 hay v5) vào AD-10 **ngay khi** bước chốt phiên bản chạy, vì Rule không đọc được nếu thiếu nó.

#### C2 — "Hạn đóng học phí" rơi khỏi mọi nơi landing trong spine
- **Mô tả.** `SPEC.md` dòng 54 (Constraint): *"Hạn đóng học phí do chủ lớp đặt cho từng học sinh và giữ nguyên cho các tháng sau (sửa được) — không phải hằng số của hệ thống"*; CAP-8 intent (dòng 45) hỏi *"đến hạn khi nào"* và CAP-8 success (dòng 46) nghiệm thu *"hạn đóng đã đặt cho học sinh đó (giữ nguyên từ tháng trước nếu không sửa)"*. Trong spine, "hạn đóng" **không** xuất hiện ở bất kỳ AD, bảng Consistency Conventions, ERD, `Binds`, Capability Map hay Deferred nào (đã grep: chỉ có chữ "hạn" trong ngữ cảnh khác). `.memlog.md` dòng 13 ghi lại đúng constraint này → đây là **rơi khi distill**, không phải "chưa từng vào".
- **Vị trí.** Khuyết ở AD-5 (dòng 60–64 — mốc hiệu lực chỉ áp cho *giá* và *miễn giảm*), ERD (dòng 192–200 — chỉ có `TUITION_RATE`, `PAYMENT`), Deferred (dòng 221–228), và Capability Map dòng CAP-8 (215).
- **Vì sao là vấn đề.** (1) Success criterion của CAP-8 **không kiểm chứng được** vì không có chỗ lưu hạn đóng. (2) Đây đúng là loại điểm mà hai đơn vị ở tầng dưới chọn lệch: `tuition` có thể mô hình hạn đóng như một **mốc hiệu lực theo ngày** (theo khuôn AD-5, nên sửa hạn không làm đổi quá khứ) trong khi `payments` có thể mô hình nó như **một giá trị hiện tại trên học sinh** (nên sửa hạn hôm nay làm đổi "hạn đóng" của mọi tháng đã qua). Spec nói "giữ nguyên từ tháng trước nếu không sửa" — câu đó chỉ đúng với cách thứ nhất, nhưng spine không chốt cách nào. (3) Capability Map bind CAP-8 vào AD-5/AD-6/AD-9, không AD nào trong số đó nói về hạn đóng → bảng map đang **tự khai** một độ phủ không tồn tại.
- **Đề xuất sửa cụ thể.** Mở rộng Rule của AD-5 thành: *"học phí, miễn giảm **và hạn đóng** lưu thành các mốc hiệu lực theo ngày cho từng học sinh; số phải thu và hạn đóng của kỳ M là kết quả của hàm thuần tra mốc hiệu lực tại M"* — và thêm thực thể `DUE_DATE` (hoặc mốc `due_day` trong `TUITION_RATE`) vào ERD với quan hệ `STUDENT ||--o{ … }`. Nếu chốt là chưa làm trong phạm vi này thì phải nằm trong Deferred kèm hệ quả tường minh lên CAP-8, chứ không được để im lặng.

### 10.2 HIGH

#### H1 — Không có chủ sở hữu duy nhất cho hàm sinh "buổi"; sửa lịch tạo bản ghi điểm danh mồ côi
- **Mô tả.** AD-3 (dòng 48–52) chốt *"buổi là kết quả của một hàm thuần"*, khoá buổi là `(classId, date, startTime)` và *"đổi lịch không được sửa hay xoá bản ghi điểm danh đã có"*. Nhưng Rule không nói hàm đó nằm ở đâu, ai được gọi nó, và không nói gì về phía **đọc**. Quy tắc lịch cũng không có mốc hiệu lực theo ngày — trong khi giá thì có (AD-5, dòng 64: *"không bao giờ tính bằng giá hiện tại"*).
- **Vị trí.** AD-3 (dòng 52), tương phản với AD-5 (dòng 64); Deferred "Buổi bù, nghỉ lễ, ghi chú theo buổi" (dòng 221); cây module `classes/` được ghi chú "lớp + quy tắc lịch" (dòng 178).
- **Vì sao là vấn đề.** Bốn module cần danh sách buổi (attendance cần buổi của một ngày, classes cần lịch tháng, dashboard cần "x/ y buổi trong ngày", reports cần một khoảng). Nếu mỗi module tự viết phép giãn lịch theo thứ trong tuần, thì lần đầu tiên thêm bảng ngoại lệ (nghỉ lễ, buổi bù) chỉ **một** trong bốn bản được sửa và bốn màn hình cho bốn con số. Nặng hơn: sau khi sửa lịch (ví dụ đổi 08:00 → 09:00), quy tắc mới không còn sinh ra khoá `(classId, date, 08:00)`, nên bản ghi điểm danh cũ trở thành **mồ côi**. Rule cấm sửa/xoá nó nhưng không nói khi đọc thì lọc theo tập buổi hiện tại (⇒ **mất lịch sử**, tỉ lệ đã điểm danh tụt) hay hợp thêm (⇒ báo cáo đếm một buổi mà lịch đang phủ nhận). Hai đơn vị sẽ chọn hai cách, và mẫu số "22/30" trong màn Học sinh cũng đổi theo lịch một cách hồi tố.
- **Đề xuất sửa cụ thể.** (1) Thêm vào AD-3: *"`sessionsFor(classId, from, to)` trong `modules/classes/domain` là nguồn duy nhất sinh buổi, export qua `public.ts`; mọi module khác cấm tự giãn lịch."* (2) Chốt phía đọc: *"danh sách buổi hiển thị = hợp của buổi suy ra từ quy tắc lịch **và** buổi có bản ghi điểm danh; buổi chỉ có bản ghi vẫn hiển thị và vẫn vào mẫu số."* (3) Chọn một trong hai cho quy tắc lịch và nói thẳng: hoặc thêm mốc hiệu lực theo ngày cho `SCHEDULE_SLOT` (như AD-5), hoặc chốt *"lịch chỉ áp từ ngày sửa trở đi"* — hiện spine **âm thầm chốt hồi tố**, đúng chỗ khách chưa hề chốt.

#### H2 — Không có luật "một hàm duy nhất cho mỗi chỉ số" giữa `dashboard` (CAP-1) và `reports` (CAP-7)
- **Mô tả.** AD-12 (dòng 102–106, `Binds: CAP-7`) chỉ chốt: *"mỗi báo cáo có đúng một hàm lấy số; cả màn hình và file `.xlsx` đọc từ hàm đó"* — tức chống lệch **bên trong** một báo cáo. AD-7 (dòng 72–76) chỉ chốt *"tính bằng hàm thuần ở mỗi lần đọc"*, tức chống lệch do **lưu** số dẫn xuất. Không AD nào chốt rằng chỉ số "thu nhập trong khoảng X–Y" (hay "phải thu của kỳ M", hay "tỉ lệ điểm danh") chỉ có **một bản cài** trong toàn hệ.
- **Vị trí.** AD-12 (dòng 104–106) và Capability Map: CAP-1 → `modules/dashboard` (dòng 208) so với CAP-7 → `modules/reports` (dòng 214); cây module ghi `dashboard/ # chỉ đọc, tổng hợp từ public.ts của các module khác` (dòng 184).
- **Vì sao là vấn đề.** AD-8 chốt **định nghĩa** thu nhập (payment có ngày thu trong khoảng), nên cả hai module sẽ cài đúng định nghĩa đó — nhưng bằng **hai truy vấn khác nhau**, và phần chưa được định nghĩa nằm đúng ở ranh giới: khoảng là đóng hai đầu hay nửa mở; "tháng" và "năm" quy đổi từ `timestamptz` sang `Asia/Ho_Chi_Minh` ở tầng nào; `% so với kỳ trước` so cùng kỳ năm trước hay cả năm trước (CAP-1 dòng 25 cần `%` tháng và `%` năm, spine không nói mốc nào); `m/n đã điểm danh` (CAP-1) và "tỉ lệ điểm danh theo học sinh" (CAP-7) có tử/mẫu khác nhau và spine **không định nghĩa cái nào**. Đây đúng là loại divergence mà AD-8 được viết ra để chặn, chỉ dịch sang tầng chỉ số.
- **Đề xuất sửa cụ thể.** Mở rộng AD-12 thành một bất biến chung: *"mỗi chỉ số (thu nhập theo khoảng, số phải thu của kỳ, công nợ của kỳ, tỉ lệ điểm danh, số buổi trong ngày) có đúng một hàm trong `domain/` của module sở hữu, export qua `public.ts`; Tổng quan, Công nợ, Báo cáo và file Excel đều gọi hàm đó, cấm cài lại."* Kèm ba định nghĩa một dòng: khoảng `[from, to)`; quy đổi tháng/năm theo `Asia/Ho_Chi_Minh` tại hàm đó; `%` = so với **cùng kỳ liền trước** (tháng trước / cùng khoảng của năm trước) và chỉ được làm tròn ở tầng hiển thị.

#### H3 — Trạng thái học và ngày bắt đầu học không được mô hình hoá → "ai nợ tháng M" không quyết được
- **Mô tả.** `SPEC.md` dòng 27 (CAP-2 intent) yêu cầu học sinh có **trạng thái học**; `screen-inventory.md` dòng 26 cho hai giá trị quan sát được `Đang học` / `Chưa bắt đầu`. Trong spine: không AD, không ERD, không glossary, không Deferred. Trong khi đó AD-16 (dòng 130) buộc `classId` **bắt buộc, không được null** — kể cả cho học sinh `Chưa bắt đầu`. AD-5 (dòng 64) nói số phải thu là kết quả tra mốc hiệu lực tại kỳ M, nhưng không có "cửa sổ đang học" (ngày bắt đầu/kết thúc) nào trong mô hình.
- **Vị trí.** AD-5 (dòng 64), AD-16 (dòng 130), ERD (dòng 192–200), Deferred (dòng 221–228); đối chiếu `screen-inventory.md` dòng 26–27.
- **Vì sao là vấn đề.** Danh sách nợ (CAP-8) là danh sách **những người phải trả tiền trong tháng M**, nên nó phải quyết định: học sinh `Chưa bắt đầu` có mặt trong danh sách nợ không? Học sinh mới thêm tháng 10 có nợ tháng 1 không? Không có ngày bắt đầu học và không có luật trạng thái, `tuition` sẽ tính tiền cho mọi học sinh có mốc giá kể từ mốc sớm nhất (kể cả trước khi nhập học), còn `payments`/`reports` có thể lọc theo trạng thái — hai con số khác nhau trên cùng một màn. Đây cũng là chỗ mẫu số của cột `22/30` (screen-inventory dòng 27) không suy ra được từ mô hình: không có ngày bắt đầu học thì không biết "30" từ đâu.
- **Đề xuất sửa cụ thể.** Thêm vào AD-5 (hoặc AD mới): *"mỗi học sinh có `status` (`active` | `not_started`) và `startDate`; số phải thu của kỳ M chỉ sinh ra khi `M >= startDate` và trạng thái tại M là `active`; học sinh chưa bắt đầu không xuất hiện trong danh sách nợ."* Thêm hai cột vào ERD và một dòng vào bảng Conventions (giá trị hợp lệ + nhãn UI tiếng Việt `Đang học` / `Chưa bắt đầu`).

#### H4 — Không có luật về ranh giới giao dịch khi ghi nhiều dòng
- **Mô tả.** AD-1 (dòng 40) buộc `domain/` **không** chạm I/O; AD-11 (dòng 100) buộc mọi ghi đi qua Server Action, kiểm đầu vào ở biên, luật nghiệp vụ trong `domain/`. Không AD nào nói ai mở/đóng transaction, và một thao tác nghiệp vụ gồm nhiều dòng (lưu trạng thái điểm danh cho cả buổi = N học sinh; một lần thu = payment + có thể là một mốc giá) phải ghi nguyên tử.
- **Vị trí.** AD-1 (dòng 40), AD-11 (dòng 100), cây `data/ # kết nối Drizzle` (dòng 188).
- **Vì sao là vấn đề.** `domain/` thuần không thể sở hữu đơn vị công việc, nên chỗ đặt transaction chỉ còn `actions.ts` hoặc `data/` — và spine không chọn. Hai module sẽ chọn khác nhau: một bên để `data/` tự bọc transaction, bên kia để `actions.ts` gọi tuần tự nhiều lời gọi. Hệ quả quan sát được: lưu điểm danh một buổi 12 học sinh mà lỗi ở học sinh thứ 8 thì tỉ lệ "đã điểm danh" trên Tổng quan đã tăng trong khi dữ liệu buổi chưa đủ — sai đúng chỉ số mà CAP-4/CAP-1 nghiệm thu.
- **Đề xuất sửa cụ thể.** Thêm một dòng luật vào AD-11 (hoặc AD mới ngắn): *"một thao tác nghiệp vụ là một transaction; transaction mở ở `actions.ts` (hoặc hàm `data/` được action gọi đúng một lần) và bao trọn mọi dòng ghi của thao tác; `domain/` nhận/trả dữ liệu thuần, không mở transaction."* Thêm vào conventions: driver Drizzle phải là loại hỗ trợ transaction tương tác (loại trừ driver HTTP một chiều) — đây cũng là một quyết định tồn tại thật giữa Neon/Vercel.

#### H5 — AD-4 không thực thi được như viết và tự mâu thuẫn với CAP-1
- **Mô tả.** AD-4 (dòng 58): *"mọi trường tiền là số nguyên, đơn vị đồng, không có phần thập phân. Cấm float, cấm kiểu decimal, cấm mọi phép làm tròn ở mọi tầng."*
- **Vị trí.** AD-4 (dòng 58); đối chiếu CAP-1 success (`SPEC.md` dòng 25: cần `%` so với tháng trước và năm trước) và `screen-inventory.md` dòng 13–14 (`+12%`, `+28%`).
- **Vì sao là vấn đề.** Hai lỗi độc lập. (1) **Bất khả thi về kiểu:** TypeScript/JavaScript chỉ có `number` (IEEE-754 double) — không tồn tại kiểu số nguyên để "cấm float", nên Rule đọc theo nghĩa đen là không build được; cách diễn đạt kiểm được là "giá trị tiền là số nguyên, validate `.int()` ở biên, lưu `integer`/`bigint`". (2) **Tự mâu thuẫn:** CAP-1 buộc hiển thị mức thay đổi `%`, mà `%` là phép chia rồi làm tròn để hiển thị — đúng cái bị "cấm ở mọi tầng" — và không có đường thoát nào được nêu. Một Rule không thể vừa tuân vừa đạt CAP-1 sẽ bị người build bỏ qua toàn bộ, kéo theo cả phần đúng của nó (cấm float cho trường tiền) mất hiệu lực.
- **Đề xuất sửa cụ thể.** Viết lại Rule: *"mọi giá trị tiền là số nguyên VND; đầu vào validate `.int()` và `>= 0` ở biên; lưu `integer`/`bigint`; cấm chia, cấm nhân hệ số, cấm làm tròn **trên giá trị tiền** ở mọi tầng. Chỉ số phái sinh không phải tiền (phần trăm, tỉ lệ) được tính và làm tròn ở tầng hiển thị qua `lib/format`."* Nếu muốn chặt hơn nữa thì thêm một dòng vào conventions: tiền luôn đi qua một kiểu có thương hiệu (branded type) `Vnd`.

#### H6 — Chưa chốt quan hệ giữa `period` và `ngày thu` khi thu tiền
- **Mô tả.** AD-9 (dòng 88) định nghĩa kỳ thu là cặp `studentId` + `period` (YYYY-MM) và nói *"Mỗi payment thuộc đúng một kỳ. Không có đóng trước nhiều tháng."* AD-8 (dòng 82) định nghĩa thu nhập theo **ngày thu**. Không luật nào nói **kỳ được gán thế nào** khi chủ lớp ghi một khoản thu, và "không đóng trước **nhiều** tháng" để mở câu hỏi đóng trước **một** tháng.
- **Vị trí.** AD-6 (dòng 70), AD-8 (dòng 82), AD-9 (dòng 88).
- **Vì sao là vấn đề.** Hai trường ngày/tháng cùng tồn tại nhưng không có bất biến ràng buộc chúng, nên hai đơn vị sẽ làm khác nhau: form thu tiền có thể mặc định kỳ = **kỳ của món nợ đang xem** (đúng ý người dùng, xoá nợ tháng 9) hoặc kỳ = **tháng hiện tại**; hai cách cho hai danh sách nợ khác nhau. Với cash basis, thu nợ tháng 9 vào ngày 02/10 làm **thu nhập tháng 10** tăng trong khi nợ tháng 9 được xoá — chênh lệch này là *có chủ ý*, nhưng phải được nói ra, nếu không báo cáo tháng 9 và danh sách nợ tháng 9 sẽ được người dùng đọc là "mâu thuẫn". Cùng nhóm vấn đề: một payment ghi trước cho kỳ sau có được phép không (AD-9 không rõ) và nếu được thì nó vào thu nhập tháng nào.
- **Đề xuất sửa cụ thể.** Thêm một câu vào AD-9: *"kỳ của một payment do người dùng chọn, mặc định là kỳ đang xem khi thu từ danh sách nợ; `ngày thu` mặc định là hôm nay và luôn độc lập với kỳ; cấm đặt ngày thu ở tương lai."* Và thêm vào AD-8: *"khoản thu nợ cũ làm tăng thu nhập của tháng có `ngày thu`, không phải của kỳ được trả — các màn hình phải hiển thị kỳ và ngày thu cạnh nhau để người dùng không đọc sai."*

#### H7 — Cổng chặn dữ liệu thật của AD-15 dựa trên một job sao lưu không có chủ
- **Mô tả.** AD-15 (dòng 124): *"Không ghi dữ liệu thật vào prod trước khi job sao lưu hằng ngày chạy được và đã diễn tập phục hồi một lần."* Sơ đồ seed (dòng 161–168) vẽ `J["Job sao lưu hằng ngày"] --> N[(Neon Postgres)]` và `J --> S["Bản sao lưu ngoài Neon"]`. Không nơi nào nói **ai/cái gì** chạy job đó (Vercel Cron? GitHub Action? dịch vụ của Neon?), bản sao lưu ngoài Neon **nằm ở đâu**, giữ **bao lâu**, ai/biết gì kiểm tra job còn chạy, và **bằng chứng** của "đã diễn tập phục hồi một lần" ghi ở đâu.
- **Vị trí.** AD-15 (dòng 124), sơ đồ triển khai (dòng 166–167), Deferred (không nhắc).
- **Vì sao là vấn đề.** Rule này là một **cổng chặn** (điều kiện để được ghi dữ liệu thật) — và với một app giữ sổ thu của cả một lớp học, đây là bất biến quan trọng nhất về vận hành. Nhưng một cổng không có chủ thể và không có tiêu chí nghiệm thu thì không đóng được: người build sẽ tự quyết (thường là bỏ qua vì Vercel/Neon "đã có PITR"), và lần đầu dữ liệu thật bị ghi vào prod sẽ là một quyết định không ai nhớ là đã quyết. Đây cũng là chiều "vận hành" mà rubric coi là lỗi khi bị bỏ im lặng.
- **Đề xuất sửa cụ thể.** Thêm vào AD-15 ba định tố: (a) **cơ chế** — ví dụ *"sao lưu = Vercel Cron gọi `pg_dump` hằng ngày, ghi ra <đích ngoài Neon>; giữ 30 ngày"* (hoặc nếu chốt dùng PITR của Neon thì nói rõ PITR **là** cơ chế sao lưu và nêu cửa sổ phục hồi); (b) **kiểm chứng** — một job/alert báo khi bản sao lưu gần nhất cũ hơn 24h; (c) **bằng chứng diễn tập** — ghi ngày + người thực hiện + kết quả vào một file trong repo (ví dụ `docs/backup-drill.md`) và điều kiện "đã diễn tập" tham chiếu đúng file đó. Nếu để ở Deferred thì phải có điều kiện xem lại cụ thể ("trước khi ghi dữ liệu thật đầu tiên").

#### H8 — Không có luật xoá: xoá học sinh có thể xoá luôn sổ thu
- **Mô tả.** Không AD nào nói khi nào dữ liệu được xoá cứng, khi nào xoá mềm, và cái gì được cascade. Cây module có `students/`, `classes/` với `data/` sở hữu bảng; ERD (dòng 192–200) cho `STUDENT ||--o{ PAYMENT`, `STUDENT ||--o{ ATTENDANCE`, `STUDENT ||--o{ COMMENT`.
- **Vị trí.** AD-6 (dòng 70), AD-16 (dòng 130), ERD (dòng 192–200); khuyết ở toàn bộ mục Invariants.
- **Vì sao là vấn đề.** Với khoá ngoại bắt buộc, "xoá học sinh" trong Drizzle/Postgres hoặc bị chặn bởi FK (nên phải xoá payment trước) hoặc cascade (xoá luôn sổ thu) — tuỳ người build. Mất một payment là mất tiền thật, đúng thứ mà AD-15 dựng job sao lưu để chống. Ngoài ra `screen-inventory.md` cho thấy màn Học sinh có **trạng thái** (`Đang học`/`Chưa bắt đầu`) — tức đã có sẵn một cơ chế "ngừng học" mềm, nhưng spine không nối nó với luật xoá, nên mỗi module sẽ tự chọn.
- **Đề xuất sửa cụ thể.** Thêm một AD ngắn: *"cấm xoá cứng học sinh có bản ghi payment/attendance/comment; kết thúc học bằng trạng thái (ngừng học + ngày kết thúc), không bằng DELETE. Xoá cứng chỉ áp cho dữ liệu chưa từng tham gia tính toán (học sinh nhập sai ngay sau khi tạo)."* Cùng câu đó chốt luôn `onDelete: restrict` cho các FK tiền và điểm danh.

#### H9 — Đổi và khôi phục mật khẩu: quyết định đã có, chỗ ở trong spine không có
- **Mô tả.** `.memlog.md` dòng 30 (quyết định E-2): *"có bảng user trong DB, dùng Auth.js/NextAuth với credentials provider; **chủ lớp tự đổi được mật khẩu trong app**"*. Trong spine: AD-10 (dòng 90–94) chỉ nói về cơ chế xác thực và nói thẳng *"không có vai trò, và không có kiểm tra phân quyền ở bất kỳ tầng nào"*; cây `src/app/` (dòng 173) chỉ có `login/`, không có route tài khoản/cài đặt; Deferred (221–228) không có mục nào về tài khoản.
- **Vị trí.** AD-10 (dòng 94), cây `src/app/` (dòng 173), Deferred (221–228); đối chiếu `.memlog.md` dòng 30.
- **Vì sao là vấn đề.** (1) Một yêu cầu đã được quyết, có bề mặt người dùng, **không có chỗ ở** trong spine — đúng loại rơi mà bước reconcile phải bắt. (2) Nặng hơn: app nằm sau **một** tài khoản, không có email/SMS (non-goal), nên nếu không có đường khôi phục thì quên mật khẩu = mất toàn bộ hệ thống, kể cả sổ thu, cho tới khi ai đó sửa DB bằng tay. Đây là chiều vận hành có stakes cao nhất trong cả app và spine đang im lặng.
- **Đề xuất sửa cụ thể.** Thêm vào AD-10 (hoặc AD mới): *"đổi mật khẩu là một Server Action sau `requireUser()`, có route `app/settings/`; khôi phục khi quên mật khẩu thực hiện bằng script CLI chạy được với quyền truy cập DB (không qua email), ghi lại trong runbook `docs/`."* Thêm route vào cây `src/app/` và một dòng vào Capability Map (hàng "Tài khoản").

#### H10 — Báo cáo thu nhập "theo lớp" không có mỏ neo lịch sử
- **Mô tả.** `SPEC.md` dòng 42 (CAP-7 intent) yêu cầu báo cáo *"theo lớp và theo từng học sinh"* cho **cả thu nhập và điểm danh**. Trong spine, `ATTENDANCE` lưu `classId` tại thời điểm điểm danh (AD-16, dòng 130) nên điểm danh theo lớp là nhất quán lịch sử; nhưng `PAYMENT` (ERD dòng 198) chỉ thuộc `STUDENT`, và `STUDENT` chỉ có **một lớp hiện tại** (AD-16, dòng 130) — không có lớp tại thời điểm thu.
- **Vị trí.** AD-16 (dòng 130), ERD (dòng 198), Capability Map CAP-7 (dòng 214).
- **Vì sao là vấn đề.** Thu nhập theo lớp buộc phải join `payment → student → class`, tức neo vào **lớp hiện tại**. Khi một học sinh chuyển lớp (tình huống AD-16 sinh ra để xử lý), toàn bộ doanh thu các tháng trước của học sinh đó **nhảy** sang lớp mới, trong khi khối điểm danh cùng báo cáo vẫn nằm ở lớp cũ → một báo cáo tự mâu thuẫn, và hai đơn vị build sẽ chọn hai cách (một bên dùng lớp hiện tại, một bên cố suy lớp lịch sử từ attendance — sai với tháng không có buổi). Đây là acceptance criterion của CAP-7 mà spine không đảm bảo được.
- **Đề xuất sửa cụ thể.** Chọn và ghi thẳng vào AD-16 (hoặc AD mới): *"mọi bản ghi payment lưu `classId` tại thời điểm thu (như attendance); báo cáo theo lớp dùng `classId` lịch sử này, không dùng lớp hiện tại của học sinh."* Thêm `PAYMENT }o--|| CLASS` vào ERD. Nếu chốt ngược lại (báo cáo theo lớp hiện tại) thì phải nói rõ và ghi hệ quả "chuyển lớp viết lại báo cáo quá khứ" vào Deferred.

### 10.3 MEDIUM

#### M1 — Deferred "Định dạng mã học sinh" chứa một luật nhận diện xung đột với conventions
- **Vị trí.** Deferred dòng 223; conventions dòng 137 (*"Khoá chính là số nguyên tự tăng"*); `screen-inventory.md` dòng 25–26.
- **Vì sao.** Câu *"hiện nhận diện học sinh bằng tên và lớp"* là một tuyên bố về **danh tính**, không phải về hiển thị. Hai học sinh trùng tên cùng lớp (rất thật với lớp học tiếng Anh) sẽ không phân biệt được nếu ai đó đọc câu này thành luật; đồng thời nó xung đột với khoá chính số nguyên ở conventions. CAP-2 (spec dòng 28) cũng chỉ nghiệm thu "tìm theo tên trả về đúng học sinh".
- **Đề xuất.** Sửa thành: *"Cột `Mã` trong ảnh khách gửi chưa đọc chắc — chưa làm mã hiển thị. Danh tính học sinh là `student.id` (số nguyên); tên chỉ dùng để tìm kiếm, không dùng để nhận diện."*

#### M2 — Deferred "buổi bù, nghỉ lễ" không nêu chủ sở hữu và không nêu điều kiện xem lại
- **Vị trí.** Deferred dòng 221.
- **Vì sao.** Mục này hợp lệ để defer, nhưng nó là **thay đổi chạm 4 module** (classes, attendance, dashboard, reports) và đổi mẫu số của mọi tỉ lệ + cột đếm buổi trong màn Học sinh. Defer mà không nói "khi nào xem lại" và không nói "áp ở đúng một hàm" thì lần thêm bảng ngoại lệ sẽ được vá ở nơi người build đang mở file.
- **Đề xuất.** Thêm vào mục này: *"áp dụng bằng cách sửa `sessionsFor()` trong `modules/classes/domain` (nguồn duy nhất); điều kiện xem lại: khi khách yêu cầu nghỉ lễ/buổi bù, hoặc khi một tháng có ≥1 buổi không dạy theo lịch."*

#### M3 — AD-15 gộp bốn quyết định; mệnh đề migration không kiểm được; chưa chốt một sổ migration
- **Vị trí.** AD-15 (dòng 124); AD-2 (dòng 46) cho mỗi module tự khai bảng trong `data/schema.ts`.
- **Vì sao.** (1) AD-15 trộn engine parity + backup + migration policy + secrets, với hai `Prevents` khác nhau — muốn đổi một phần (ví dụ đổi cơ chế sao lưu) phải thay cả AD, và người đọc không biết phần nào là bất biến nào. (2) *"Migration chạy có kiểm soát, không tự động ở prod"* không có cơ chế, không có chủ, không có tiêu chí → không kiểm được. (3) AD-2 tách schema theo module nhưng **không** nói chỉ có một `drizzle.config.ts` và một thư mục migration duy nhất — hai người build sẽ tạo hai lịch sử migration không hợp nhất được, và dev/prod lệch schema (đúng cái AD-15 hứa ngăn).
- **Đề xuất.** Tách AD-15 thành 3 AD (engine & môi trường · sao lưu & phục hồi · migration & secret). Với migration, chốt: *"một `drizzle.config.ts` gốc, một thư mục `drizzle/` duy nhất chứa toàn bộ migration, sinh bằng `drizzle-kit generate` và áp bằng `drizzle-kit migrate`; cấm `push` ở prod; cùng một quy trình cho dev và prod."*

#### M4 — Không nêu cơ chế cưỡng chế cho AD-1, AD-2 (và AD-11)
- **Vị trí.** AD-1 (dòng 40), AD-2 (dòng 46), AD-11 (dòng 100).
- **Vì sao.** Ba AD chịu tải nhất của spine đều là luật **chiều import/đường ghi**, kiểm được bằng mắt nhưng không có gì kiểm tự động. Với code do agent viết theo từng story, "kiểm bằng mắt" là đủ để trôi: một `import { db } from '../tuition/data/schema'` lọt vào `students/` sẽ phá AD-2 mà không ai thấy cho tới khi hai bảng bị truy vấn bằng hai luật khác nhau.
- **Đề xuất.** Thêm vào conventions: *"AD-1/AD-2 được cưỡng chế bằng `eslint-plugin-boundaries` (hoặc `dependency-cruiser`) với rule cấm import xuyên module ngoài `public.ts`; CI chạy lint + typecheck + migration dry-run trước khi deploy."* Đây là fix rẻ nhất trong toàn bộ danh sách.

#### M5 — Định dạng ô tiền trong Excel bị bỏ lửng giữa AD-12 và AD-13
- **Vị trí.** AD-12 (dòng 106), AD-13 (dòng 112), CAP-7 success (`SPEC.md` dòng 43: file `.xlsx` mở lại đọc được bằng Excel).
- **Vì sao.** AD-12 buộc file Excel đọc từ cùng hàm số với màn hình; AD-13 buộc mọi hiển thị tiền đi qua `lib/format` dạng `1.200.000đ`. Nếu export ghi **chuỗi đã format**, Excel không cộng được (khách sẽ thử cộng); nếu ghi **số**, thì đó không phải "cùng cách hiển thị" và hai người build sẽ chọn hai cách.
- **Đề xuất.** Chốt một câu trong AD-12: *"ô tiền trong `.xlsx` là **số nguyên** VND với number-format `#,##0"đ"`; chuỗi `1.200.000đ` chỉ dùng trong UI."*

#### M6 — CAP-8 không có bề mặt UI/route nào, và spine im lặng thay vì defer
- **Vị trí.** Cây `src/app/` (dòng 173–175), Capability Map CAP-8 (dòng 215), Deferred (221–228); đối chiếu `screen-inventory.md` dòng 34–35 (*"chưa có màn tương ứng trong ảnh — cần thiết kế mới"*).
- **Vì sao.** Công nợ là một trong 8 capability và được 4 AD bind, nhưng không có route trong cây; cũng không có chỗ để **ghi nhận một lần thu** (CAP-5/CAP-8 đều cần). Cây thư mục ở độ cao feature là seed, nên thiếu route không sai về nguyên tắc — nhưng im lặng thì sai: người build sẽ tự đặt công nợ vào `attendance/`, `reports/` hoặc một mục sidebar thứ 8, và điều hướng lệch với 7 mục sidebar quan sát được.
- **Đề xuất.** Hoặc thêm `app/tuition/debt/page.tsx` (khối công nợ nằm trong màn Học phí & Thu nhập, không thêm mục sidebar) và ghi rõ trong cây; hoặc thêm một dòng Deferred: *"màn công nợ + chỗ nhập miễn giảm/hạn đóng: thiết kế mới, chưa có trong ảnh khách (screen-inventory dòng 34–35)."*

#### M7 — Không có luật chống ghi trùng khoản thu
- **Vị trí.** AD-6 (dòng 70), AD-11 (dòng 100).
- **Vì sao.** AD-6 nói "sửa sai bằng cách sửa hoặc xoá bản ghi payment", tức hai bản ghi giống nhau là **hợp lệ** với mô hình. Người dùng không phải dân kỹ thuật, double-click nút "Thu tiền" là tình huống thật, và hậu quả là thu nhập (cash) tăng sai — sai ở đúng con số headline của CAP-1/CAP-5.
- **Đề xuất.** Thêm vào AD-11 (hoặc một dòng conventions): *"mọi form ghi tiền/điểm danh chống submit lại: action trả kết quả rồi `revalidatePath`, nút ở trạng thái pending; với payment, chặn bản ghi trùng theo `(studentId, period, amount, paymentDate)` trong một cửa sổ ngắn."*

#### M8 — Số nhận xét cho mỗi (học sinh, tháng) không được chốt
- **Vị trí.** ERD dòng 199 (`STUDENT ||--o{ COMMENT : "nhận xét theo tháng"` — quan hệ một-nhiều), Capability Map CAP-6 (dòng 213); đối chiếu `screen-inventory.md` dòng 19 (Tổng quan có **một** khối `Nhận xét tháng 9/2026`).
- **Vì sao.** CAP-6 (spec dòng 40) nghiệm thu "mở lại hồ sơ thấy đúng nhận xét đó" — đúng với cả hai cách. Nhưng Tổng quan chỉ hiển thị một khối cho một tháng, nên nếu cho phép nhiều nhận xét thì "hiển thị cái nào" là quyết định chưa có, và `comments` (màn hồ sơ) với `dashboard` có thể chọn khác nhau (mới nhất? dài nhất? tất cả?). Kỳ của nhận xét cũng chưa được ghim vào convention `YYYY-MM` của AD-9.
- **Đề xuất.** Chốt: *"mỗi (học sinh, kỳ `YYYY-MM`) có đúng một nhận xét; lưu là upsert; Tổng quan hiển thị nhận xét của tháng hiện hành."* Thêm unique key vào ERD.

#### M9 — Claim từ brand/spec không landed: giọng điệu, tagline tiếng Việt, font/biến thể logo, lời chào, "một màn hình không wizard"
- **Vị trí.** AD-14 (dòng 118) chỉ chốt hai màu + logo/tagline "khai một chỗ"; khuyết ở conventions (dòng 134–138) và Deferred (221–228). Đối chiếu `brand.md` dòng 10, 23–25, 27–29; `SPEC.md` dòng 52, 56.
- **Vì sao.** AD-14 ngăn được "mỗi màn pha một sắc navy khác nhau" nhưng để trống phần lớn bề mặt UI còn lại: font (brand.md tự ghi "chưa xác định"), cỡ tối thiểu/biến thể logo trên nền sáng–tối, sắc trung tính, giọng câu chữ, lời chào đã quan sát được. Không có chỗ nào quyết hay defer → mỗi màn tự chọn, đúng loại divergence mà AD-14 sinh ra để chặn, chỉ dịch sang 90% diện tích còn lại. Ràng buộc "thao tác thường dùng phải xong trong một màn hình, không wizard" (spec dòng 56) cũng không landed ở đâu, dù nó định hình **flow** (một form một trang, modal tại chỗ) và spine đã có hai AD thuần UI là AD-13/AD-14.
- **Đề xuất.** Thêm hai dòng vào conventions: *"Ngôn ngữ & câu chữ: UI tiếng Việt **có dấu** là ngôn ngữ duy nhất (không lẫn tiếng Anh, kể cả nhãn trạng thái/nút); giọng ấm áp, xưng 'bạn', không thuật ngữ kỹ thuật; mọi thông điệp lỗi/thành công soạn theo brand.md."* và *"Hình thức: font, cỡ chữ, sắc trung tính khai trong theme Tailwind như AD-14; form dài một trang, không chia bước."* Đưa các mục chưa xác định của brand.md (font, biến thể logo nền sáng/tối, tagline tiếng Việt chọn cái nào) vào Deferred — spine đã biết cách xử lý trung thực một `[?]` khác (mục "Định dạng mã học sinh"), nên sự bất đối xứng này là thiếu sót chứ không phải lựa chọn.

#### M10 — Chính sách môi trường xem trước/staging im lặng
- **Vị trí.** AD-15 (dòng 124), sơ đồ triển khai (dòng 163–167).
- **Vì sao.** AD-15 nói dev và prod cùng engine, nhưng không nói hệ có **mấy** môi trường. Vercel mặc định tạo preview deployment cho mỗi nhánh/PR; nếu biến môi trường của preview trỏ vào DB prod (mặc định dễ xảy ra), thì một nhánh thử nghiệm có thể ghi vào sổ thu thật — điều AD-15 tuyên bố ngăn ("khác biệt hành vi giữa dev và prod"), nhưng bằng luật khác.
- **Đề xuất.** Thêm vào AD-15: *"preview deployment không được trỏ vào DB prod: hoặc tắt preview, hoặc preview dùng một Neon branch riêng; `DATABASE_URL` khác nhau theo môi trường, không có giá trị mặc định."*

#### M11 — "Chốt sổ và hoá đơn bất biến" là câu hỏi mở bị ngụy trang thành Deferred
- **Vị trí.** Deferred dòng 222; đối chiếu AD-6 (dòng 70) và `SPEC.md` dòng 46 (*"giữ nguyên từ tháng trước nếu không sửa"*).
- **Vì sao.** Mục Deferred viết dưới dạng điều kiện ("Nếu khách cần con số của tháng đã qua không bao giờ đổi…") nhưng **khách chưa từng được hỏi** — spec không có open question nào về việc này (spec tự khai 0 open question). Trong khi AD-6 cho phép **sửa hoặc xoá** bất kỳ bản ghi payment nào, kể cả của tháng đã qua, và không có metadata ai sửa lúc nào. Nghĩa là con số của một tháng đã báo cho phụ huynh có thể đổi mà không có vết — một rủi ro nghiệp vụ, không chỉ kỹ thuật, và nó quyết định luôn hình dạng dữ liệu (có/không có bảng hoá đơn).
- **Đề xuất.** Chuyển mục này thành một **câu hỏi mở cho khách** trong spine (xem M12): *"Tháng đã thu xong có được phép đổi số không? Nếu không, cần chốt sổ (bảng hoá đơn bất biến) và AD-5 phải được thay."* Nếu câu trả lời là "có thể đổi" thì bổ sung AD-6 một dòng: payment ghi thêm `updatedAt`/`voidedAt` để có vết.

#### M12 — Spine không có kênh "Open Questions"
- **Vị trí.** Toàn bộ spine (không có mục nào tên Open Questions / Câu hỏi mở).
- **Vì sao.** Bước triage của quy trình đòi: câu hỏi mở và tag `[ASSUMPTION]` hoặc được giải, hoặc được defer **kèm điều kiện xem lại**. Ở đây mọi câu hỏi mở sống trong `.memlog.md` — mà người build ở tầng dưới **không đọc memlog**, chỉ đọc spine (spine tự khai `purpose: build-substrate`). Hiện có ít nhất hai câu hỏi mở thật đang không có chỗ: chốt sổ (M11) và trạng thái/ngày bắt đầu học (H3, nếu chốt là hỏi khách thay vì tự quyết).
- **Đề xuất.** Thêm mục `## Open Questions` (3–5 dòng) ngay trước `## Deferred`, mỗi dòng: câu hỏi · ai trả lời · điều kiện chặn (câu nào phải trả lời trước khi build phần nào). Không cần dài — cần **có**, để câu hỏi không bị chôn trong memlog.

#### M13 — "Miễn giảm là số tiền cố định, không phải %" chưa được chốt
- **Vị trí.** AD-5 (dòng 64), AD-4 (dòng 58); đối chiếu `SPEC.md` dòng 27 và 36 (*"mức miễn giảm theo số tiền cố định"*), `.memlog.md` Q12.
- **Vì sao.** AD-5 chỉ nói miễn giảm lưu thành mốc hiệu lực theo ngày; AD-4 buộc tiền là số nguyên — nhưng **một tỉ lệ phần trăm cũng là số nguyên**, nên hai AD này không phân biệt được "giảm 200.000đ" với "giảm 10%". Nếu một người build chọn mô hình phần trăm (vẫn qua được AD-4), thì số phải thu đổi khi giá đổi — trái ý spec và làm lệch phép kiểm của CAP-5.
- **Đề xuất.** Thêm nửa câu vào AD-5: *"miễn giảm là **số tiền cố định** trừ vào học phí tháng, không phải tỉ lệ phần trăm; cấm mô hình phần trăm."*

### 10.4 LOW

#### L1 — AD-7 và AD-16 chồng lấn câu chữ: "cấm cột cache" có thể bị đọc thành cấm snapshot `classId`
- **Vị trí.** AD-7 (dòng 76: *"Cấm cột cache và bảng tổng hợp"*) so với AD-16 (dòng 130: bắt buộc lưu `classId` trên bản ghi điểm danh).
- **Vì sao.** Người đọc AD-7 theo nghĩa rộng có thể kết luận cột `classId` trong `ATTENDANCE` là dữ liệu dẫn xuất bị cấm — trong khi AD-16 bắt buộc nó và nó **không** suy ra được từ dữ liệu gốc sau khi học sinh đổi lớp. Hai AD `[ADOPTED]` cùng chạm một cột theo hai chiều.
- **Đề xuất.** Giới hạn phạm vi AD-7: *"cấm cột/bảng **tổng hợp và tỉ lệ** (tổng thu, công nợ, số buổi, tỉ lệ điểm danh); cấm lưu lại giá trị có thể suy ra từ dữ liệu gốc. Bản ghi lịch sử bất biến (ví dụ `classId` tại thời điểm điểm danh theo AD-16) không phải cache."*

#### L2 — AD-13 câu cuối quá rộng so với phạm vi Rule
- **Vị trí.** AD-13 (dòng 112): *"Cấm format số và ngày trong component."*
- **Vì sao.** Hai câu đầu giới hạn ở tiền và ngày, câu cuối cấm format "số" nói chung — nhưng `screen-inventory.md` cho thấy UI cần format **số điện thoại** (`0987 654 321`), **lịch dạng chuỗi** (`T2-T4-T6`), và **cặp đếm** (`22/30`). Nếu đọc chặt, ba thứ đó phải nằm trong `lib/format` (đúng về ý đồ) nhưng Rule không nói vậy, nên người build sẽ format tại chỗ ở màn Học sinh — chính cái divergence AD-13 sinh ra để chặn.
- **Đề xuất.** Sửa câu cuối thành: *"mọi phép format tiền, ngày/thứ, số điện thoại, chuỗi lịch (`T2-T4-T6`) và cặp đếm `x/y` đi qua `lib/format`; cấm format trong component."*

#### L3 — `Binds` thiếu CAP-1 ở những AD có chạm tiền
- **Vị trí.** AD-4 (`Binds: CAP-2, CAP-5, CAP-7, CAP-8`, dòng 56), AD-6 (dòng 68), AD-9 (dòng 86) — đều thiếu CAP-1, trong khi Tổng quan hiển thị tiền, công nợ, kỳ (Capability Map dòng 208 map CAP-1 vào AD-7, AD-8, AD-13).
- **Vì sao.** Một người build đọc `Binds` để biết luật nào áp cho CAP-1 có thể kết luận AD-4/AD-6/AD-9 không ràng buộc màn Tổng quan, và tự do hiển thị tiền theo cách khác ở đó.
- **Đề xuất.** Thêm CAP-1 vào `Binds` của AD-4, AD-6, AD-9 (hoặc đổi ba AD này thành `Binds: all` như AD-10).

#### L4 — AD-14 trộn một luật kiểm được với một luật không đo được
- **Vị trí.** AD-14 (dòng 118): *"Cấm hardcode mã màu trong component"* + *"Tỉ lệ 70/30 là luật trình bày"*.
- **Vì sao.** Nửa đầu kiểm được (grep hex), nửa sau không có cách xác nhận — không ai đo được "navy giữ diện tích lớn" khi review, nên nó sẽ bị bỏ qua và kéo độ tin cậy của cả AD xuống.
- **Đề xuất.** Giữ nửa đầu là Rule; chuyển nửa sau thành dòng conventions *"coral chỉ dùng cho CTA/nhấn/cảnh báo, không làm nền mảng lớn"* — mệnh đề này kiểm được bằng cách soát các component dùng token coral.

#### L5 — Marker "chưa xác minh" không máy kiểm được, và chưa có luật ghim phiên bản chính xác
- **Vị trí.** Bảng Stack (dòng 142–155), câu 157, Deferred dòng 227; `scripts/lint_spine.py` (điều kiện báo `version_pin` chỉ khi ô Version rỗng hoặc còn `{token}`).
- **Vì sao.** Thái độ trung thực của spine là điểm cộng, nhưng cổng cơ học đang xanh **vì** marker viết bằng chữ — nếu bước chốt phiên bản bỏ sót một dòng, không ai bị báo. Và vì chưa có luật ghim chính xác, một đơn vị có thể dùng `^` range trong khi đơn vị khác ghim, làm AD-15 ("khác biệt hành vi giữa dev và prod" là cái phải ngăn) mất giá trị.
- **Đề xuất.** Dùng một marker máy đọc được cho mọi dòng chưa chốt (ví dụ `[UNVERIFIED]` trong ô Version) và thêm một dòng conventions: *"phiên bản ghim chính xác (không `^`/`~`); lockfile được commit; bảng Stack không còn `[UNVERIFIED]` trước khi deploy prod lần đầu."*

#### L6 — AD-8 không ghi vết rằng định nghĩa "thu nhập" vừa được đồng bộ ngược vào spec
- **Vị trí.** AD-8 (dòng 78–82); `SPEC.md` bản render lần 5 (dòng 24–25, 36–37, 46, 69); `.memlog.md` dòng 29 (phiên kiến trúc) và spec memlog dòng 77–81.
- **Vì sao.** AD-8 chốt cash, và spec **đã được sửa theo** trong phiên này — nhưng spine không nói điều đó. Người đọc sau (hoặc một agent build đọc nhãn `Thu nhập tháng này` trong mockup) sẽ không biết định nghĩa này từng là accrual và đã được đồng bộ; rất dễ tái nhập accrual ở một màn mới.
- **Đề xuất.** Thêm một câu vào AD-8: *"Định nghĩa này đã được đồng bộ vào SPEC.md (CAP-1, CAP-5, CAP-8, Success signal) ngày 2026-09-23; nhãn UI 'Thu nhập' nghĩa là tiền đã thu, không phải số phải thu."*

---

## 11. Việc nên làm trước khi chốt `status: final` (thứ tự đề xuất)

1. **C1** — sửa ngoại lệ của AD-11 (thêm bề mặt Auth.js) + chốt một cửa kiểm tra duy nhất ở AD-10 + ghim major Auth.js. *(Sửa được toàn bộ bằng văn bản, không cần khách.)*
2. **C2** — thêm hạn đóng vào AD-5 + ERD (+ Capability Map). *(Sửa được bằng văn bản, theo đúng khuôn mốc hiệu lực đã có.)*
3. **H1, H2, H10** — ba lỗ hổng "hai đơn vị build lệch" nghiêm trọng nhất, đều chạm số liệu mà khách sẽ nhìn: chủ sở hữu hàm sinh buổi + cách đọc bản ghi mồ côi; một hàm duy nhất cho mỗi chỉ số; neo lớp lịch sử cho thu nhập theo lớp.
4. **H5** — viết lại AD-4 để Rule vừa đúng ý đồ vừa tuân được (và để AD-4 không còn tự mâu thuẫn với CAP-1).
5. **H3, H9, M11, M12** — phần cần **khách trả lời**, không phải tự quyết: trạng thái/ngày bắt đầu học, đường khôi phục mật khẩu, tháng đã thu có được đổi số không. Ghi thành mục `## Open Questions` trong spine.
6. **H7, M3, M10** — đóng chiều vận hành còn nửa vời: chủ thể + cơ chế + bằng chứng cho sao lưu/phục hồi; một quy trình migration; chính sách preview.
7. **L5** — trước khi finalize: marker phiên bản máy đọc được + luật ghim chính xác, để cổng cơ học bắt được dòng còn sót.
8. Còn lại (H4, H6, H8, M1–M13, L1–L4, L6): sửa văn bản tại chỗ — hầu hết chỉ cần một đến hai câu mỗi mục.

---

## 12. Trùng lặp với `reviews/review-reconcile.md` (để người tổng hợp khử trùng)

- `review-reconcile.md` là **lens đối chiếu đầu vào** (spec/brand/screen-inventory → spine). Review này là **lens rubric** (từng AD có thực thi được không, hai AD có mâu thuẫn không, Deferred có gây lệch không, Rule có quá chặt không) nên phần lớn nội dung không trùng.
- **Trùng có chủ ý:** hạn đóng học phí (C2 ≈ §3.2 của reconcile), bề mặt UI của CAP-8 (M6 ≈ §3.3), quy tắc lịch không có mốc hiệu lực (H1 ≈ §3.4), các claim brand/giọng điệu và "một màn hình không wizard" không landed (M9 ≈ §3.5–3.6), trạng thái học (H3 ≈ §3.7).
- **Khác biệt cần lưu ý:** (a) **§3.1 của reconcile (accrual vs cash) đã hết hiệu lực** — `SPEC.md` được render lại lần 5 lúc `17:39:44` và nay viết cash ở CAP-1, CAP-5, CAP-8 và Success signal; spine **khớp** spec ở điểm này. (b) Review này tìm thêm những thứ reconcile không chạm: **C1** (AD-10 ↔ AD-11 ↔ cây `src/app/`), **H4** (ranh giới giao dịch), **H6** (kỳ so với ngày thu), **H7** (job sao lưu không có chủ), **H8** (luật xoá), **H9** (vòng đời tài khoản), **H10** (neo lớp lịch sử), **H2** (một hàm cho mỗi chỉ số), **M5/M7/M8/M12/M13** và toàn bộ **L1–L6**.
