---
name: 'Review đối kháng — Architecture Spine Haninn'
type: adversarial-review
target: '../ARCHITECTURE-SPINE.md'
target_revision: '2026-09-23, status draft, 16 AD'
sources: ['../../../specs/spec-hannin/SPEC.md', '../../../specs/spec-hannin/screen-inventory.md', '../../../specs/spec-hannin/brand.md']
reviewer: 'reviewer đối kháng (red team kiến trúc)'
created: '2026-09-23'
verdict: 'NOT-READY — spine đủ tốt để chốt paradigm, chưa đủ để hai người build song song mà ra một hệ thống'
---

# Review đối kháng — Architecture Spine Haninn

## Phương pháp

Review này **không** đi tìm chỗ spine viết sai chính tả hay thiếu ví dụ. Nó đi tìm **cặp đơn vị ở tầng dưới** mà mỗi đơn vị **tuân thủ đúng từng chữ** mọi AD, nhưng hai đơn vị ráp lại cho ra hai hệ thống không tương thích. Điều kiện để một cặp được tính là hợp lệ:

1. Mỗi đơn vị **trích được câu AD** làm căn cứ cho hành vi của mình (không có đơn vị nào "cố tình làm sai").
2. Không AD nào, đọc theo nghĩa chữ, bắt buộc một trong hai đơn vị phải đổi.
3. Hệ quả nhìn thấy được trên **màn hình hoặc file Excel** mà khách hàng dùng, hoặc là **mất tiền / sai tiền**.

Một cặp chỉ được xếp *low* khi hậu quả là lỗi biên dịch hoặc lệch chữ; *critical* khi hậu quả là **hai con số tiền khác nhau cho cùng một câu hỏi**, hoặc **mất dữ liệu tiền không phục hồi được**, hoặc **một AD không thể thoả mãn đồng thời với một AD khác**.

Phạm vi: chỉ đọc. Review này **không sửa** `ARCHITECTURE-SPINE.md`, `SPEC.md` hay bất kỳ file nào khác. Mọi đề xuất Rule nằm trong file này dưới dạng văn bản để tác giả spine tự quyết.

---

## Verdict

**NOT-READY.** Spine khoá đúng *hình dạng* (modular monolith, suy diễn thay vì lưu, tiền nguyên, sổ thu là nguồn duy nhất) nhưng chưa khoá *thời gian*, *chủ sở hữu chỉ số* và *vòng đời dữ liệu*. Ba lỗ hổng gốc sinh ra 25 cặp dưới đây:

- **Gốc 1 — Thời gian không có chủ.** Spine ghim *kiểu* dữ liệu (`date`, `time`, `timestamptz`) và *múi giờ nghiệp vụ*, nhưng không ghim **đồng hồ nào** (server Vercel / trình duyệt / máy dev), **biên của một khoảng** (đầu ngày ICT hay 00:00Z), và **thời điểm tham chiếu trong một tháng** (ngày 1 hay ngày cuối). AD-9 ghim múi giờ cho `period` nhưng AD-8 không ghim múi giờ cho "khoảng đang xét"; AD-3 ghim khoá buổi bằng `date` + `startTime` không múi giờ.
- **Gốc 2 — Chỉ số không có chủ.** AD-8 ghim *định nghĩa* "thu nhập" ở mọi màn hình, nhưng AD-12 chỉ buộc "đúng một hàm" **trong phạm vi CAP-7**. Không AD nào nói ai *sở hữu* hàm tính thu nhập / công nợ / tỉ lệ điểm danh. Định nghĩa giống nhau + hai hiện thực khác nhau = đúng cái thất bại mà AD-8 tuyên bố ngăn.
- **Gốc 3 — Vòng đời không có chủ.** AD-16 xoá thực thể mang thời gian (enrollment) để chặn quan hệ nhiều-nhiều, nhưng không AD nào cho thời gian một chỗ ở mới: không có "học sinh bắt đầu từ ngày nào", không có "lịch lớp có hiệu lực từ ngày nào", không AD nào nói ai được **xoá** dòng dữ liệu tiền. Hệ quả: lịch sử bị viết lại và sổ thu bị xoá dây chuyền mà không vi phạm câu chữ nào.

### Bảng phân loại

| # | Mức | Cặp đơn vị (trái / phải) | AD lẽ ra phải chặn |
|---|---|---|---|
| F1 | **critical** | `payments/data` (lưu `period`) / `reports/data` (suy `period` từ `paymentDate`) | AD-9, AD-6, AD-8 |
| F2 | **critical** | `dashboard/data` (đồng hồ server) / `attendance/ui` + `lib/format` (đồng hồ trình duyệt) | AD-13, AD-15, Data & formats |
| F3 | **critical** | `dashboard/domain` (mẫu số = buổi suy ra) / `attendance/domain` (mẫu số = buổi có bản ghi) | AD-3, AD-7 |
| F4 | **critical** | `tuition/domain.payableAt` (mốc tại ngày 1) / `tuition/domain.payableEffective` (mốc tại ngày cuối) | AD-5 |
| F5 | **critical** | `dashboard/data.getIncome` / `reports/data.getIncome` | AD-8 (qua AD-12) |
| F6 | **critical** | `students/actions.deleteStudent` (cascade) / `payments/data` (sổ thu) | AD-6, AD-16 |
| F7 | **critical** | AD-15 (job sao lưu) / AD-10 + AD-11 (mọi Route Handler, mọi ghi) | AD-10, AD-11, AD-15 |
| F8 | high | AD-10 tuân thủ chữ / Auth.js `/api/auth/*` | AD-10 |
| F9 | high | `public.ts` tái xuất schema / `lib/` chứa SQL nghiệp vụ | AD-1, AD-2 |
| F10 | high | AD-7 tuân thủ chữ / `unstable_cache` + cột `period` | AD-7 |
| F11 | high | AD-4 tuân thủ chữ / tỉ lệ và phần trăm của AD-7, CAP-1 | AD-4 |
| F12 | high | AD-3 khoá buổi "bất biến" / lịch lớp sửa được | AD-3 |
| F13 | high | `reports` thu nhập theo lớp (theo `students.classId`) / `attendance` theo lớp (theo `attendance.classId`) | AD-16, AD-2 |
| F14 | high | Excel (ngoài AD-13) / màn hình (AD-13) | AD-12, AD-13 |
| F15 | high | Ví dụ `Thứ 3, 16/09/2026` của AD-13 / lịch thật | AD-13 |
| F16 | high | `discountVnd` / `discountPercent` + không có sàn 0 | AD-4, AD-5 |
| F17 | high | Route Handler GET `?from=&to=&kind=` / màn hình báo cáo | AD-11, AD-12 |
| F18 | medium | "hạn đóng" ở `students` (ngày trong tháng) / ở `tuition` (ngày tuyệt đối) | (không AD nào) |
| F19 | medium | `22/30` đếm từ `createdAt` lớp / từ `createdAt` học sinh | AD-3, AD-7 |
| F20 | medium | công nợ theo kỳ / công nợ luỹ kế | AD-6, AD-9 |
| F21 | medium | ghi điểm danh không kiểm tra buổi tồn tại / buổi suy ra từ lịch | AD-3, AD-11 |
| F22 | medium | tính theo tháng đủ / chia theo buổi khi vào giữa tháng | AD-4, AD-5 |
| F23 | medium | migration tự động trong build / migration chạy tay sau deploy | AD-15 |
| F24 | low | token màu ở theme Tailwind / ở module brand | AD-14 |
| F25 | low | `period` / `billingPeriod`; "buổi = session" không có thực thể | Consistency Conventions |
| F26 | low | chuỗi định dạng tự viết / `Intl` vi-VN | AD-13 |

---

## CRITICAL

### F1 — "Kỳ thu" lưu hay suy ra: cùng một payment, hai tháng

**Hai đơn vị.**
- A: `payments/data/schema.ts` khai `period: text('period')` (YYYY-MM) trên bảng `payments`; `payments/actions.recordPayment` nhận `period` do màn hình đang xem truyền vào.
- B: `payments/data/schema.ts` **không** có cột `period`; `payments/domain/periodOf(paymentDate)` = đổi `paymentDate` sang ICT rồi cắt `YYYY-MM`.

**Hai hành vi (đều hợp lệ theo chữ).**
Thu học phí tháng 9 muộn, ngày 03/10/2026. A ghi `payment(period='2026-09', paymentDate='2026-10-03T09:00+07')`. B ghi cùng dòng dữ liệu nhưng `periodOf` trả `'2026-10'`.

**AD đáng lẽ phải chặn.** AD-9 ("mỗi payment thuộc đúng một kỳ") và AD-6 ("công nợ của kỳ bằng số phải thu trừ tổng payment của kỳ đó").

**Vì sao lọt.**
- AD-9 chỉ nói payment *thuộc* một kỳ, không nói kỳ **được lưu**. B đọc "thuộc" thành một bất biến suy diễn được — đúng tinh thần AD-3 và AD-5 (suy diễn, không lưu).
- AD-9 cấm "đóng trước nhiều tháng" nhưng **không cấm đóng muộn**, mà AD-6 lại *buộc* phải biểu diễn được đóng muộn: nếu kỳ luôn suy từ ngày thu thì một khoản thu luôn nằm đúng tháng nó được thu, và "công nợ của kỳ 2026-09" không bao giờ được tất toán muộn. Vậy AD-6 ngầm đòi có cột `period`, còn AD-9 ngầm cho phép không có. Hai AD này mâu thuẫn ở tầng chữ.
- AD-8 thêm tầng thứ ba: "thu nhập = tổng payment có **ngày thu** trong khoảng". Với A, tiền của tháng 9 rơi vào thu nhập tháng 10; với B, công nợ tháng 9 vẫn còn nhưng thu nhập tháng 9 vẫn 0. SPEC CAP-8 "success" lại phán: *"đánh dấu đã thu một học sinh thì ... tổng thu nhập tháng tăng đúng số tiền đó"* — câu này chỉ đúng nếu thu nhập khoá theo **kỳ**, tức là trái AD-8. Ba tài liệu, ba câu trả lời.

**Đề xuất.** AD-9 phải nói rõ kỳ là **dữ liệu nhập, không phải dữ liệu dẫn xuất**, và AD-8 phải nói rõ "khoảng đang xét" của thu nhập là gì khi ngày thu và kỳ khác nhau. Đồng thời phải sửa SPEC CAP-5/CAP-8 cho khớp, hoặc ghi lại việc spine override spec.

**Rule viết lại — AD-9:**
> Kỳ thu là cặp `studentId` và `period` dạng `YYYY-MM`, và `period` là **cột bắt buộc trên bảng `payments`, do người ghi chọn tại thời điểm ghi**; cấm suy `period` từ `paymentDate` ở bất kỳ tầng nào. `paymentDate` là thời điểm giao dịch, độc lập với `period`; một payment có thể có `period` trước hoặc sau tháng của `paymentDate`. Mỗi payment thuộc đúng một kỳ. Không có đóng trước nhiều tháng: một payment không được có `period` sau tháng ICT của `paymentDate` quá 0 tháng.

**Rule viết lại — AD-8 (bổ sung câu):**
> ... "Thu nhập" của một khoảng là tổng payment có **`period` nằm trong khoảng đó**, không phải ngày thu; màn hình và Excel phải ghi nhãn rõ là "thu nhập theo kỳ thu". Nếu cần con số theo ngày thu thì đó là chỉ số thứ hai, có tên riêng ("tiền về trong kỳ"), và cả hai đều phải hiện nhãn.

> **Cảnh báo thi hành:** câu chữ AD-8 hiện tại không tương thích với tiêu chí nghiệm thu CAP-5 ("tổng thu nhập tháng khớp với tổng số tiền phải thu sau miễn giảm") và với Success signal của SPEC. Đây là **thay đổi yêu cầu**, không phải sửa lỗi kỹ thuật; phải do khách chốt.

---

### F2 — "Hôm nay" và "tháng này" không có đồng hồ: dev ICT, prod UTC

**Hai đơn vị.**
- A: `dashboard/domain.todaySessions(now: Date)` — `now` do `dashboard/data` truyền vào bằng `new Date()` (đồng hồ tiến trình server; trên Vercel mặc định UTC).
- B: `attendance/ui` lấy ngày đang xem bằng `new Date()` trong trình duyệt (máy chủ lớp ở Việt Nam, ICT) và truyền chuỗi `YYYY-MM-DD` xuống action.
- (Cùng họ) `lib/format.formatDate(d)` nếu dùng `Intl.DateTimeFormat` **không kèm `timeZone`** thì chính **một hàm** đó cho hai kết quả ở hai môi trường.

**Hai hành vi (đều hợp lệ theo chữ).**
01/10/2026 lúc 00:30 giờ ICT. A tính "tháng này" = tháng 9 (server còn ở 30/09 UTC) và "hôm nay" = 30/09; B hiển thị 01/10 và tháng 10. Trên màn Tổng quan, thẻ "Thu nhập tháng này" và bộ lọc "tháng 9" của màn Học phí trả lời hai tháng khác nhau trong cùng một phiên. Với `lib/format`, server render `Thứ 4, 30/09/2026`, client hydrate lại thành `Thứ 5, 01/10/2026` → lệch hydration và hai ngày trong một ô.

**AD đáng lẽ phải chặn.** AD-13 ("mọi hiển thị ... đi qua `lib/format`"), AD-15 ("cùng engine hai môi trường", "mất sổ thu mà không có bản phục hồi"), và dòng "múi giờ nghiệp vụ cố định Asia/Ho_Chi_Minh" ở Consistency Conventions.

**Vì sao lọt.**
- AD-13 ghim **hình dạng chuỗi** nhưng không ghim **múi giờ của phép tính**; một hàm format "thuần" vẫn phụ thuộc môi trường (TZ, ICU) — đây là chỗ "hàm thuần" bị vô hiệu trên thực tế.
- AD-15 hứa "cùng engine" nhưng chỉ nói về **Postgres major version**, không nói về TZ/locale/ICU của runtime. Máy dev ở đây là `SE Asia Standard Time` (đã kiểm tra), prod là UTC: AD-15 hứa một thứ và bỏ quên đúng thứ gây lệch.
- Consistency Conventions nói "múi giờ nghiệp vụ cố định" như một mô tả **kiểu dữ liệu**, không phải một luật về **đồng hồ**. Không AD nào cấm `new Date()` ngoài một cửa.

**Đề xuất.** Một cửa thời gian duy nhất + cấm `new Date()`/`Date.now()` ở mọi nơi khác; mọi hàm domain nhận ngày/tháng đã chuẩn hoá ICT như **tham số**; `lib/format` bắt buộc truyền `timeZone: 'Asia/Ho_Chi_Minh'`.

**Rule viết lại — AD-13 (bổ sung):**
> Mọi hiển thị tiền và ngày đi qua `lib/format`. Tiền theo dạng `1.200.000đ`; ngày theo dạng `Thứ 3, 15/09/2026`. `lib/format` **bắt buộc** truyền `timeZone: 'Asia/Ho_Chi_Minh'` và `locale: 'vi-VN'` tường minh; cấm dựa vào múi giờ hay locale mặc định của runtime. Cấm format số và ngày trong component.

**Rule viết lại — AD-15 (bổ sung):**
> ... dev và prod chạy Postgres cùng major version **và cùng `TZ=Asia/Ho_Chi_Minh` cùng phiên bản ICU**; dev dùng dữ liệu giả. Mọi khác biệt hành vi do môi trường là lỗi, không phải chuyện nhỏ.

**AD mới — AD-19 (Thời gian nghiệp vụ lấy từ một cửa):**
> - **Binds:** all
> - **Prevents:** hai màn trả lời "hôm nay" và "tháng này" bằng hai đồng hồ khác nhau; tính toán ngày chạy đúng trên máy dev và sai trên Vercel.
> - **Rule:** chỉ `lib/time` được đọc đồng hồ hệ thống. `lib/time` xuất `businessNow(): Date`, `businessToday(): string` (YYYY-MM-DD), `businessMonth(): string` (YYYY-MM) — tất cả tính theo `Asia/Ho_Chi_Minh` bằng offset tường minh, không dựa `TZ` của runtime. `domain/` không được gọi `new Date()`, `Date.now()`, hay bất kỳ API thời gian nào; mọi hàm cần thời gian phải nhận `today`/`month`/`now` như tham số. Cấm client tự quyết định "hôm nay": mọi ngày hiển thị lấy từ server. Mọi khoảng thời gian là nửa mở `[from, to)` với `from`/`to` là ngày ICT.

---

### F3 — "Buổi đã điểm danh" không có chủ, và không có trạng thái nào để hỏi

**Hai đơn vị.**
- A: `dashboard/domain.attendanceProgress(today)` — mẫu số = số buổi suy ra từ lịch lớp; tử số = số buổi **có ít nhất một** bản ghi điểm danh.
- B: `attendance/domain.coveredSessions(today)` — mẫu số = số buổi suy ra từ lịch; tử số = số buổi **có đủ bản ghi cho mọi học sinh đang học** của lớp.

**Hai hành vi (đều hợp lệ theo chữ).**
Lớp 4A hôm nay có 1 buổi; chủ lớp mới điểm danh 3/8 học sinh. A báo "1/1 đã điểm danh" (xong việc, không cần quay lại); B báo "0/1". Nếu chủ lớp đánh dấu cả lớp "Vắng" mà schema chỉ lưu dòng cho học sinh "Có học", A báo "0/1" vĩnh viễn — không cách nào đạt 100%. AD-3 cấm bảng buổi, nên **không tồn tại chỗ nào ghi "buổi này đã điểm danh"**; mỗi đơn vị tự phát minh định nghĩa.

**AD đáng lẽ phải chặn.** AD-3 (buổi suy ra, không lưu — nhưng trạng thái "đã điểm danh" **không** suy ra được từ lịch) và AD-7 (liệt "tỉ lệ điểm danh" vào danh sách phải tính bằng hàm thuần từ **dữ liệu gốc** — nhưng với câu hỏi này không có dữ liệu gốc nào).

**Vì sao lọt.** AD-3 đúng khi trả lời "hôm nay có buổi nào" (suy từ lịch). Nó **không** trả lời được "buổi đó đã điểm danh chưa", vì đó là một trạng thái *phát sinh từ hành vi*, không phải từ lịch. AD-3 không nhận ra mình vừa xoá thực thể duy nhất có thể mang trạng thái đó. SPEC CAP-4 nói "ghi trạng thái của mỗi học sinh trong buổi đó" — trạng thái của *học sinh*, không của *buổi*; nên cả hai đơn vị đều có căn cứ.

**Đề xuất.** Không cần thêm bảng: siết AD-3 buộc ghi điểm danh một buổi phải ghi **đủ một dòng cho mọi học sinh đang học của lớp**, kể cả `Vắng`; khi đó "buổi đã điểm danh" ⟺ tồn tại bản ghi, và mẫu số vẫn suy từ lịch.

**Rule viết lại — AD-3 (bổ sung hai câu):**
> ... Khoá buổi là bộ ba `classId`, `date`, `startTime` và bất biến; đổi lịch không được sửa hay xoá bản ghi điểm danh đã có. Bảng điểm danh có khoá duy nhất trên `(studentId, classId, date, startTime)` và **một buổi chỉ được coi là "đã điểm danh" khi mọi học sinh đang học của lớp tại ngày đó đều có đúng một dòng, kể cả dòng mang trạng thái `Vắng`**; `Vắng` là một giá trị được lưu, không phải một dòng bị thiếu. Mọi màn hình lấy mẫu số "số buổi trong ngày" từ đúng một hàm `classes.domain.sessionsBetween(classId, from, to)`; cấm đếm buổi bằng cách đếm bản ghi điểm danh.

---

### F4 — AD-5 không có mốc thời gian, không có tính đầy đủ, và bị viết lại quá khứ

**Hai đơn vị.**
- A: `tuition/domain.payableAt(studentId, '2026-09')` chọn mốc có `effectiveFrom <= '2026-09-01'`.
- B: `tuition/domain.payableEffective(studentId, '2026-09')` chọn mốc có `effectiveFrom <= ngày cuối của 2026-09`.
- C: `students/actions.updateTuition` (màn Học sinh, SPEC CAP-2: "sửa học phí ... giá trị mới hiển thị lại đúng") **sửa tại chỗ** mốc đang hiệu lực.

**Hai hành vi (đều hợp lệ theo chữ).**
Học phí 2.000.000 từ 01/06; ngày 15/09 khách tăng lên 2.500.000. A: tháng 9 phải thu 2.000.000. B: 2.500.000. Còn C: mốc 01/06 bị sửa thành 2.500.000 → **lịch sử tháng 6, 7, 8 đổi theo**, kể cả các tháng đã thu đủ → công nợ tháng 6 thành −500.000 (một khoản "âm" mà không màn hình nào định nghĩa). Thêm nữa: học sinh ghi danh 01/06 nhưng mốc đầu tiên hiệu lực 01/08 → `payableAt(...,'2026-06')` trả `undefined`; A quy ước `undefined → 0` → học sinh **biến mất khỏi danh sách nợ tháng 6**, đúng cái "mất tiền thật" mà phần *Why* của SPEC nêu.

**AD đáng lẽ phải chặn.** AD-5 ("tra mốc hiệu lực tại M", "không bao giờ tính bằng giá hiện tại").

**Vì sao lọt.**
- "Tại M" — M là một **tháng**, không phải một **thời điểm**. AD-5 không nói ngày nào trong M là ngày tham chiếu. Cả ngày 1 và ngày cuối đều là "tại M".
- AD-5 cấm **đọc** giá hiện tại, nhưng không cấm **ghi đè** mốc quá khứ. So sánh: AD-3 có câu "đổi lịch không được sửa hay xoá bản ghi đã có" — AD-5 thiếu đúng câu tương ứng ở dạng "mốc đã dùng để tính một kỳ đã thu thì không được sửa".
- AD-5 không có luật **đầy đủ** ("mọi kỳ từ ngày ghi danh đều phải có mốc"), nên hàm thuần được phép trả "không tìm thấy", và mỗi consumer tự quyết hậu quả.

**Đề xuất.** Ghim ngày tham chiếu; thêm luật đầy đủ + luật bất biến; và cho "ngày ghi danh" một chỗ ở (xem AD-21/AD-22 bên dưới, vì AD-16 đã xoá enrollment).

**Rule viết lại — AD-5:**
> Học phí và miễn giảm lưu thành các mốc hiệu lực theo ngày cho từng học sinh; mốc đầu tiên của một học sinh **bắt buộc** hiệu lực không muộn hơn ngày ghi danh, và mọi kỳ từ ngày ghi danh trở đi đều phải tra được đúng một mốc — hàm tra trả về `None` là lỗi dữ liệu, không phải số 0. Số phải thu của kỳ M là kết quả của **đúng một** hàm thuần `tuition.domain.payableFor(studentId, month, enrollmentDate)` tra mốc hiệu lực **tại ngày đầu tiên của M theo `Asia/Ho_Chi_Minh`**; mọi màn hình và Excel dùng hàm đó. Mốc hiệu lực đã được dùng để tính một kỳ đã có payment **không được sửa hay xoá**; sửa giá là tạo mốc mới. Không có bảng hoá đơn, và không bao giờ tính bằng giá hiện tại.

---

### F5 — AD-8 tuyên bố ngăn đúng cái nó không ngăn được

**Hai đơn vị.**
- A: `dashboard/data.getMonthlyIncome(month)` — tự dựng truy vấn tổng payment theo khoảng của tháng, qua `payments/public.ts`.
- B: `reports/data.getReport('income', from, to)` — hàm lấy số của báo cáo, dùng cho cả màn Báo cáo và file `.xlsx` (đúng AD-12).

**Hai hành vi (đều hợp lệ theo chữ).** Cùng câu hỏi "thu nhập tháng 9/2026", hai hàm, hai kết quả, khi: (a) khoảng của A là `[01/09 00:00, 01/10 00:00)` còn B là `[01/09, 30/09]` bao gồm cả ngày cuối; (b) A lọc theo `paymentDate`, B lọc theo `period`; (c) một payment thu ngày 03/10 cho `period='2026-09'`.

**AD đáng lẽ phải chặn.** AD-8, với câu "**Prevents:** màn Tổng quan và màn Báo cáo trả lời 'thu nhập tháng' theo hai định nghĩa khác nhau".

**Vì sao lọt.** AD-12 — cơ chế duy nhất buộc "đúng một hàm" — **chỉ binds CAP-7**, và câu chữ của nó là "cả **màn hình** và file `.xlsx` đọc từ hàm đó", trong đó "màn hình" là màn của *báo cáo đó*, không phải mọi màn hình trong app. Nên Dashboard **hợp pháp** có hàm riêng. AD-8 ghim *định nghĩa* nhưng không ghim *chủ sở hữu hàm*, và một định nghĩa có thể được hiện thực theo nhiều cách khác nhau ở phần biên (khoảng mở/đóng, múi giờ, lọc theo ngày thu hay theo kỳ). AD-8 liệt "thu nhập" vào nhóm chỉ số nhưng không nói ai được định nghĩa nó. Đây là lỗ hổng nghiêm trọng nhất về mặt *kiến trúc*, vì nó là lý do tồn tại của chính AD-8.

**Đề xuất.** Tách "định nghĩa chỉ số" khỏi "báo cáo": mỗi chỉ số có **một chủ** và **một hàm** trong `public.ts` của chủ đó; mọi màn hình và Excel gọi hàm ấy.

**Rule viết lại — AD-12 (mở rộng khỏi CAP-7):**
> Mỗi chỉ số nghiệp vụ (thu nhập, số phải thu, công nợ, số buổi, tỉ lệ điểm danh, mức thay đổi so với kỳ trước) có **đúng một chủ sở hữu** và **đúng một hàm** trong `public.ts` của chủ đó; mọi màn hình, mọi báo cáo và file `.xlsx` gọi đúng hàm ấy, không có ngoại lệ và không có truy vấn thứ hai. Hàm nhận tham số khoảng thời gian dạng `{ from: string; to: string }` ngày ICT, luôn diễn giải khoảng là nửa mở `[from, to)`, và trả về **số nguyên thô**, không định dạng. Thêm một chỉ số mới mà không thêm chủ sở hữu là lỗi kiến trúc.

---

### F6 — Sổ thu không được bảo vệ khỏi xoá dây chuyền

**Hai đơn vị.**
- A: `students/actions.deleteStudent(id)` — UNIQUE/không được null theo AD-16, không có cột trạng thái, nên cách duy nhất để học sinh rời danh sách là `DELETE`; khoá ngoại khai `onDelete: 'cascade'` ("AD-2 nói tôi sở hữu bảng này, nên tôi quyết định khoá ngoại của nó").
- B: `payments/data` — sổ thu là nguồn duy nhất của "đã thu" (AD-6), dữ liệu tiền không được biến mất.
- (Cùng họ) `classes/actions.deleteClass(id)` — AD-2 nói mọi truy vấn trên bảng `classes` nằm trong module `classes`, nên việc lớp bị xoá kéo theo `students` là quyết định của module `classes`; `students` không có tiếng nói.

**Hai hành vi (đều hợp lệ theo chữ).** Chủ lớp xoá một học sinh đã nghỉ (hoặc xoá một lớp đã giải tán). Cascade xoá luôn `payments` và `tuition_rates` của học sinh đó → **thu nhập tháng 10 giảm**, báo cáo các tháng trước đổi theo, công nợ đã tất toán quay lại thành nợ. AD-15 phòng ngừa bằng sao lưu, không bằng thiết kế. Không AD nào cấm.

**AD đáng lẽ phải chặn.** AD-6 (sổ thu là nguồn duy nhất của "đã thu") và AD-16 (học sinh thuộc đúng một lớp, khoá ngoại bắt buộc, không null).

**Vì sao lọt.** AD-6 nói cách sửa sai là "sửa hoặc xoá bản ghi payment" → ngầm khẳng định payment **được phép** biến mất, nên không có gì gợi ý chúng cần được bảo vệ. AD-16 chặn `null` nhưng không cho một trạng thái "đã nghỉ", nên nó **buộc** phải xoá cứng; cùng lúc AD-16 cấm bảng enrollment, tức là cấm luôn chỗ để ghi "học sinh này học từ ngày nào đến ngày nào". AD-2 phân quyền theo *bảng* nhưng không phân quyền theo *hành vi*, nên "ai được xoá" không có câu trả lời.

**Đề xuất.** AD mới về vòng đời dữ liệu tiền (AD-22), nới AD-16 để có trạng thái nghỉ học thay vì xoá, và cấm `onDelete: 'cascade'` trên mọi bảng có tiền.

**Rule viết lại — AD-16 (bổ sung):**
> ... mỗi học sinh có đúng một lớp hiện tại, là khoá ngoại bắt buộc, không được null. Học sinh rời lớp bằng cách chuyển `status` sang `inactive` kèm `leftOn` (ngày ICT), **không bằng cách xoá dòng**; học sinh `inactive` không xuất hiện trong danh sách điểm danh mới nhưng vẫn giữ nguyên lịch sử điểm danh, học phí và payment. Bản ghi điểm danh lưu `classId` tại thời điểm điểm danh, nên đổi lớp không làm mất lịch sử. Cấm bảng enrollment và cấm quan hệ nhiều-nhiều giữa học sinh và lớp, trừ khi có AD mới thay thế AD này.

**AD mới — AD-22 (Không xoá cứng dữ liệu tiền và lịch sử):**
> - **Binds:** CAP-2, CAP-4, CAP-5, CAP-8
> - **Prevents:** xoá một học sinh hoặc một lớp làm biến mất sổ thu và làm đổi báo cáo của các tháng đã qua; mất tiền thật mà không có cửa phục hồi trong app.
> - **Rule:** mọi khoá ngoại từ `payments`, `tuition_rates`, `attendance`, `comments` sang `students` là `onDelete: 'restrict'`; cấm `cascade` và cấm `set null`. Xoá cứng một học sinh hoặc một lớp chỉ được phép khi không còn bản ghi nào tham chiếu; mọi đường xoá khác phải là xoá mềm (`status = 'inactive'`, `leftOn`, `archivedAt`). Bản ghi `payment` là append-only: sửa sai bằng một bản ghi điều chỉnh có tham chiếu tới bản ghi gốc, và bản ghi gốc không bị xoá cứng. Mọi thao tác xoá mềm là một Server Action có bước xác nhận thứ hai ở UI.

---

### F7 — Job sao lưu của AD-15 không có đường tồn tại hợp luật

**Hai đơn vị.**
- A: AD-15 + Structural Seed — tồn tại một thành phần `J["Job sao lưu hằng ngày"]` ghi ra `S["Bản sao lưu ngoài Neon"]`, và AD-15 **chặn việc nhập dữ liệu thật** cho tới khi job này chạy được.
- B: AD-10 — "Middleware chặn mọi đường dẫn trừ trang đăng nhập. **Mọi** Server Action và Route Handler gọi đúng một helper `requireUser()`"; và AD-11 — "mọi thay đổi dữ liệu đi qua Server Action", "Ngoại lệ **duy nhất** được phép là Route Handler GET để tải file Excel".

**Hai hành vi (đều hợp lệ theo chữ).** Ba cách hiện thực job, cách nào cũng đụng một AD:
1. Vercel Cron → `GET /api/jobs/backup` (Route Handler) → theo AD-10 phải gọi `requireUser()` → request của cron không có cookie phiên → job không bao giờ chạy → **điều kiện tiên quyết của AD-15 không bao giờ đạt**, dữ liệu thật không bao giờ được nhập.
2. Miễn trừ `/api/jobs/*` khỏi `requireUser()` và xác thực bằng `CRON_SECRET` → **cơ chế xác thực thứ hai**, trái câu "Auth.js ... là cơ chế xác thực duy nhất" của AD-10.
3. Job ghi một dòng log/bảng trạng thái sao lưu → một **ghi dữ liệu ngoài Server Action**, trái AD-11.
4. Job nằm ngoài app (Neon PITR/branching theo lịch) → hợp luật, nhưng khi đó nhánh `J --> S` ("bản sao lưu **ngoài** Neon") của Structural Seed không tồn tại, và sơ đồ seed mô tả một hệ thống không xây được.

**AD đáng lẽ phải chặn.** AD-10 và AD-11 (đáng lẽ phải có ngoại lệ vận hành), AD-15 (đáng lẽ phải nói job chạy ở đâu).

**Vì sao lọt.** AD-10 được viết cho bề mặt *người dùng* và dùng chữ "mọi" tuyệt đối; AD-11 liệt kê ngoại lệ đóng (chỉ Excel). Không AD nào nhắc tới tác nhân không phải người dùng, trong khi Structural Seed lại vẽ một tác nhân như vậy. Đây là mâu thuẫn giữa **sơ đồ** và **luật**, và nó chặn đúng cái milestone go-live.

**Đề xuất.** AD mới về ngoại lệ vận hành, ghim rõ một ngoại lệ duy nhất và cách xác thực nó.

**AD mới — AD-24 (Ngoại lệ vận hành có kiểm soát):**
> - **Binds:** AD-10, AD-11, AD-15
> - **Prevents:** mỗi lần cần một tác vụ nền lại nới một lỗ xác thực mới; job sao lưu không chạy được nên không bao giờ đủ điều kiện nhập dữ liệu thật.
> - **Rule:** chỉ tồn tại **một** Route Handler không gọi `requireUser()`, nằm ở `app/api/jobs/[job]/route.ts`, chỉ chấp nhận `GET`, chỉ chạy được khi header `Authorization: Bearer $CRON_SECRET` khớp, và chỉ được gọi các job khai trong một danh sách đóng ở `lib/jobs/registry.ts` (hiện chỉ có `backup:verify`). Job **không** được ghi vào bảng nghiệp vụ; job chỉ đọc và ghi ra ngoài (hoặc gọi API của nhà cung cấp sao lưu). Mọi `POST`/`PUT`/`DELETE` vào đường dẫn này trả 405. Việc sao lưu thật do Neon PITR đảm nhiệm; app chỉ có nhiệm vụ **kiểm tra** bản sao lưu gần nhất và ghi kết quả vào log của nền tảng, không vào Postgres.

---

## HIGH

### F8 — AD-10 yêu cầu `requireUser()` ở mọi Route Handler, kể cả route đăng nhập

**Hai đơn vị.**
- A: tuân thủ chữ AD-10 → thêm `requireUser()` vào `app/api/auth/[...nextauth]/route.ts`. Không có phiên thì `requireUser()` chuyển hướng/ngã → **không thể đăng nhập**.
- B: loại trừ `/api/auth/*` khỏi middleware và khỏi `requireUser()` — một ngoại lệ **không được ghi trong AD nào**. Lỗ này là chỗ duy nhất của app mà một đường dẫn không có kiểm tra phiên, và không có gì chặn nó lớn dần (một `/api/dev/*`, một `/api/preview/*`).

**Hai hành vi (đều hợp lệ theo chữ).** A đọc AD-10 theo nghĩa đen và app không dùng được; B đọc AD-10 theo ý và tạo ra đúng thứ AD-10 tuyên bố ngăn ("một route quên kiểm tra phiên"). Ngoài ra AD-10 tự mâu thuẫn: mục **Prevents** ghi "sự xuất hiện của **kiểm tra phân quyền thừa**", còn **Rule** bắt buộc **hai** lớp kiểm tra (middleware + `requireUser()`).

**AD đáng lẽ phải chặn.** AD-10.

**Đề xuất.** Ghi rõ ngoại lệ đăng nhập và bỏ lớp kiểm tra thừa ở tầng middleware (middleware chỉ chuyển hướng cho đẹp, `requireUser()` mới là cửa duy nhất).

**Rule viết lại — AD-10:**
> Auth.js với credentials và bảng user là cơ chế xác thực duy nhất; **hai ngoại lệ được khai tường minh** là `/api/auth/*` (bắt buộc, vì đó là đường lấy phiên) và `app/api/jobs/[job]` (xem AD-24). Middleware chỉ dùng để chuyển hướng người chưa đăng nhập về trang đăng nhập; **cửa kiểm tra duy nhất** là `requireUser()`, gọi ở đầu mọi Server Action và mọi Route Handler còn lại. Không có vai trò, không có kiểm tra phân quyền nào khác, và không được thêm ngoại lệ mới mà không sửa AD này.

---

### F9 — AD-2 bị lách hợp pháp qua `public.ts` và qua `lib/`

**Hai đơn vị.**
- A: `students/public.ts` = `export * from './data/schema'; export const listStudents = ...`.
- B: `reports/data/schema.ts` khai bảng riêng, nhưng `reports/data/income.ts` gọi `lib/reporting/sql.ts`, trong đó có SQL thô join `payments × students × classes × attendance`.

**Hai hành vi (đều hợp lệ theo chữ).** A thoả câu 1 của AD-2 ("module khác chỉ được import `<module>/public.ts`") nhưng câu 2 ("mọi truy vấn trên bảng đó nằm trong chính module ấy") chỉ có thể bị phát hiện bằng review tay — không có rào cơ học nào, trong khi câu 1 thì lint được. B không hề vi phạm AD-2, vì AD-2 chỉ nói về **module**; `lib/` không phải module, và AD-1 cũng không nói gì về `lib/` ngoài `DOM → FMT`. Vậy `lib/` là một vùng tự do nơi mọi bảng có thể bị truy vấn mà không ai sở hữu luật.

**Hệ quả.** Hai file trong `lib/` có thể tính "thu nhập" theo hai cách, và cả hai đều "đúng AD-2". Kết hợp với F5, AD-8 mất nốt chỗ dựa.

**Đề xuất.** AD mới giới hạn `lib/` và siết AD-2.

**Rule viết lại — AD-2 (bổ sung):**
> module khác chỉ được import `<module>/public.ts`. `public.ts` **chỉ được xuất** kiểu dữ liệu (DTO), hàm use-case và hằng số nghiệp vụ; **cấm** xuất bảng Drizzle, schema, query builder, hay `export *` từ `data/`. Cấm import `domain/`, `data/`, `ui/` và `actions.ts` xuyên module. Bảng do module sở hữu tự khai trong `data/schema.ts` của nó, và mọi truy vấn trên bảng đó nằm trong chính module ấy.

**AD mới — AD-23 (Biên ngoài module):**
> - **Binds:** all
> - **Prevents:** `lib/` trở thành module thứ hai không ai sở hữu, nơi mọi bảng bị join tự do và mọi luật của module bị bỏ qua.
> - **Rule:** `lib/` chỉ được chứa hàm **không truy vấn bảng nghiệp vụ**: `lib/format`, `lib/time`, `lib/auth`, `lib/db` (chỉ tạo kết nối và kiểu), `lib/jobs`. Cấm mọi truy vấn hoặc import bảng Drizzle trong `lib/`; một phép join nhiều bảng nghiệp vụ chỉ được tồn tại trong module sở hữu bảng gốc của phép join đó, và phải được xuất qua `public.ts` dưới dạng hàm use-case.

---

### F10 — AD-7 bị lách theo hai đường: cột `period` và cache không phải "cột cache"

**Hai đơn vị.**
- A: `payments/data/schema.ts` có cột `period` (một giá trị **dẫn xuất từ `paymentDate`** được lưu lại) — AD-7 cấm "cột cache và bảng tổng hợp", nhưng AD-9 **buộc** mỗi payment thuộc đúng một kỳ, và danh sách chỉ số bị cấm của AD-7 (công nợ, thu nhập, số buổi, tỉ lệ điểm danh) **không có** `period`. Vậy `period` là một cột dẫn xuất hợp pháp, được AD-9 bảo kê.
- B: `reports/data.getReport` được bọc `unstable_cache`/`cache()` để "một hàm dùng cho cả màn hình và Excel" (AD-12) chạy nhanh. Một cache trong bộ nhớ **không phải** "cột cache" và **không phải** "bảng tổng hợp" → hợp luật theo chữ.

**Hai hành vi (đều hợp lệ theo chữ).** Sau khi thu tiền, `payments.actions` gọi `revalidatePath('/payments')` (đúng State & cross-cutting) nhưng `unstable_cache` không có tag nên **không** bị xoá: màn Học phí hiện số mới, màn Báo cáo (và file Excel) vẫn phục vụ số cũ tới khi TTL hết. AD-7 nói "tính bằng hàm thuần từ dữ liệu gốc **ở mỗi lần đọc**" — B không vi phạm câu chữ nào vì câu chữ chỉ cấm **lưu trữ**, không cấm **nhớ tạm**.

**AD đáng lẽ phải chặn.** AD-7.

**Đề xuất.** AD-7 phải nói về *thời điểm đọc*, không chỉ về *nơi lưu*; và phải phân loại rõ `period` là dữ liệu nghiệp vụ chứ không phải dẫn xuất (xem F1).

**Rule viết lại — AD-7:**
> công nợ, thu nhập, số buổi và tỉ lệ điểm danh đều được tính bằng hàm thuần từ dữ liệu gốc **tại thời điểm phục vụ mỗi request**; cấm mọi dạng lưu trữ hoặc nhớ tạm giá trị đã tính — cấm cột cache, cấm bảng tổng hợp, cấm materialized view, cấm `unstable_cache`, `cache()`, `revalidateTag` dựa trên chỉ số, và cấm cache ở tầng CDN cho mọi phản hồi chứa chỉ số nghiệp vụ. Mọi phản hồi chứa tiền hoặc chỉ số phải là `dynamic = 'force-dynamic'`. Chỉ được phép lưu các trường **người dùng nhập** (giá, miễn giảm, ngày, số tiền, `period`, trạng thái điểm danh); mọi trường suy ra từ chúng đều bị cấm. Muốn tối ưu sau này thì phải có AD mới thay thế AD này.

---

### F11 — AD-4 cấm làm tròn, nhưng AD-7 và CAP-1 bắt buộc phải chia

**Hai đơn vị.**
- A: đọc AD-4 là luật **chỉ về tiền** → `dashboard/domain.attendanceRate = present/total` (số thực) → màn hình in `96,4%`, file Excel ghi `0.9642857142857143`.
- B: đọc AD-4 theo nghĩa đen, áp cho mọi tầng → `Math.floor(present*100/total)` → `96%`; `reports` dùng `Math.round` → cùng dữ liệu `27/28` ra `96%` hoặc `97%` tuỳ module.

**Hai hành vi (đều hợp lệ theo chữ).** AD-4 câu 1 có chủ ngữ ("mọi **trường tiền**"), câu 2 thì không ("Cấm float, cấm kiểu decimal, cấm mọi phép làm tròn ở mọi tầng") → đọc kiểu nào cũng biện luận được. Và AD-7 **bắt buộc** có "tỉ lệ điểm danh", CAP-1 **bắt buộc** có "% so với tháng trước" — hai chỉ số bản chất là phép chia, không thể là số nguyên nếu không có luật làm tròn. AD-4 đưa ra luật *cấm* làm tròn thay vì luật *thống nhất* làm tròn, nên mỗi module tự nghĩ ra một cách, và chính vì thế hai màn lệch nhau 1%.

**AD đáng lẽ phải chặn.** AD-4 (nhưng nó chặn nhầm đối tượng).

**Đề xuất.** Tách phạm vi AD-4 (tiền) khỏi luật làm tròn (tỉ lệ), và ghim **một** hàm phần trăm.

**Rule viết lại — AD-4:**
> mọi trường **tiền** là số nguyên, đơn vị đồng, không có phần thập phân; cấm float và cấm kiểu decimal cho trường tiền; **tiền không bao giờ được làm tròn ở bất kỳ tầng nào**. Mọi phép chia cho tiền (miễn giảm theo phần trăm, chia theo buổi) đều bị cấm — miễn giảm là số tiền cố định.

**AD mới — AD-26 (Một chính sách làm tròn):**
> - **Binds:** CAP-1, CAP-7, AD-4, AD-7
> - **Prevents:** cùng một tỉ lệ, màn Tổng quan và file Excel in hai số khác nhau; mỗi module tự chọn cách làm tròn.
> - **Rule:** chỉ `lib/format` được làm tròn, và chỉ để hiển thị. Mọi tỉ lệ phần trăm được tính bằng **đúng một** hàm `lib/format.pct(numerator, denominator)` trả về số nguyên phần trăm làm tròn nửa lên (`Math.round`), và mọi mức thay đổi so với kỳ trước dùng `lib/format.deltaPct(current, previous)` trả về số nguyên có dấu. Cấm chia và cấm làm tròn ở mọi nơi khác, kể cả trong `domain/`, `data/`, và trong route xuất Excel. File Excel ghi **cùng số nguyên** với màn hình, không ghi số thực.

---

### F12 — "Khoá buổi bất biến" không thi hành được vì lịch sửa được

**Hai đơn vị.**
- A: `attendance/data/schema.ts` đặt `UNIQUE (studentId, classId, date, startTime)` — đúng nguyên văn bộ ba khoá của AD-3.
- B: `attendance/data/schema.ts` đặt `UNIQUE (studentId, date)` — lập luận: AD-16 cho mỗi học sinh đúng một lớp, và một lớp có một khung giờ cho mỗi thứ, nên một học sinh không thể có hai buổi trong cùng một ngày.

**Hai hành vi (đều hợp lệ theo chữ).** Chủ lớp sửa giờ lớp 4A từ 08:00 sang 08:15 (sửa lỗi gõ) hồi tháng 9. AD-3 cấm "sửa hay xoá bản ghi điểm danh đã có" → cả A và B đều **giữ** dòng cũ. Nhưng hàm suy buổi chạy theo lịch **hiện tại** nên ngày thứ Hai đó giờ có buổi lúc 08:15. Khi chủ lớp mở lại và điểm danh, A tạo **dòng thứ hai** cho cùng một buổi thật (08:15 nằm cạnh 08:00) → "số buổi đã học" của học sinh tăng thêm 1, còn mẫu số (một buổi) không đổi → **tỉ lệ điểm danh vượt 100%**. B không lưu được giờ đã sửa, nên bản ghi lịch sử trỏ tới một buổi không còn tồn tại → buổi 08:15 không có dữ liệu điểm danh và bị coi là "chưa điểm danh" mãi mãi.

Vấn đề gốc: AD-3 khẳng định khoá buổi **bất biến** trong khi mọi thành phần của khoá (trừ `classId`) đến từ một **lịch sửa được** và spine không có mốc hiệu lực cho lịch. AD-3 cũng không buộc khoá phải được **thi hành** bằng ràng buộc, nên cả A và B đều có thể tự nhận là tuân thủ.

**Đề xuất.** AD mới: lịch lớp cũng phải có mốc hiệu lực theo ngày (đối xứng với AD-5), và buổi đã có bản ghi thì bất biến.

**Rule viết lại — AD-3 (bổ sung):**
> ... Khoá buổi là bộ ba `classId`, `date`, `startTime`, được thi hành bằng **ràng buộc duy nhất** `(studentId, classId, date, startTime)` trên bảng điểm danh. **Buổi đã có bản ghi điểm danh là bất biến**: mọi thay đổi lịch chỉ có hiệu lực từ ngày hiệu lực trở đi, không làm đổi tên buổi đã có bản ghi, và không được tạo ra buổi thứ hai cho cùng một buổi thật.

**AD mới — AD-21 (Lịch lớp có mốc hiệu lực theo ngày):**
> - **Binds:** CAP-1, CAP-3, CAP-4, CAP-7
> - **Prevents:** sửa lịch hôm nay viết lại quá khứ — số buổi của tháng 9 đổi sau khi tháng 9 đã dạy xong; bản ghi điểm danh trỏ tới buổi không còn tồn tại.
> - **Rule:** quy tắc lịch của lớp (thứ trong tuần + `startTime`) lưu thành các **mốc hiệu lực theo ngày** `(classId, effectiveFrom, weekdays, startTime)`; cấm sửa hay xoá một mốc đã có hiệu lực trong quá khứ — đổi lịch là thêm mốc mới. Hàm suy buổi `sessionsBetween(classId, from, to)` **bắt buộc** tra mốc hiệu lực tại từng ngày, không dùng lịch hiện tại. Mọi màn hình đếm buổi dùng đúng hàm đó.

---

### F13 — Học sinh chuyển lớp: điểm danh theo lớp cũ, tiền theo lớp mới

**Hai đơn vị.**
- A: `attendance/data` lưu `classId` tại thời điểm điểm danh (AD-16 cho phép và khuyến khích).
- B: `reports/data.incomeByClass()` nhóm thu nhập theo `students.classId` — vì bảng `payments` **không có** `classId` (ER diagram của spine chỉ có `STUDENT ||--o{ PAYMENT`), và AD-16 nói mỗi học sinh có **đúng một** lớp hiện tại.

**Hai hành vi (đều hợp lệ theo chữ).** Học sinh học lớp 5A (T2-T4-T6 08:00) đến hết tháng 9, chuyển sang 5B (T3-T5 14:00) từ 01/10. Báo cáo tháng 9 "theo lớp": 5A hiện 20 buổi, **0đ**; 5B hiện 0 buổi, **2.000.000đ**. Cả hai con số đều đúng theo định nghĩa của chính module mình, và không AD nào nói payment thuộc lớp nào. Đây là báo cáo **bắt buộc** của CAP-7 ("theo lớp và theo từng học sinh").

**AD đáng lẽ phải chặn.** AD-16 (đáng lẽ phải nói bản ghi tiền cũng chụp `classId` như bản ghi điểm danh, hoặc nói rõ nhóm theo lớp hiện tại là quy ước có chủ ý).

**Đề xuất.** Cho `payments` một `classId` chụp tại thời điểm ghi, và ghim quy ước nhóm.

**Rule viết lại — AD-16 (bổ sung):**
> ... Bản ghi điểm danh lưu `classId` tại thời điểm điểm danh, **và bản ghi `payment` cũng lưu `classId` tại thời điểm ghi**, nên đổi lớp không làm mất lịch sử và không làm tiền của tháng cũ nhảy sang lớp mới. Mọi báo cáo "theo lớp" nhóm theo `classId` **đã chụp trên bản ghi**, không theo `students.classId`; cấm nhóm lịch sử theo lớp hiện tại. Cấm bảng enrollment và cấm quan hệ nhiều-nhiều giữa học sinh và lớp, trừ khi có AD mới thay thế AD này.

---

### F14 — Excel nằm ngoài AD-13, nên AD-12 chỉ bảo đảm con số, không bảo đảm cái khách nhìn

**Hai đơn vị.**
- A: `app/api/reports/[kind]/route.ts` ghi tiền dưới dạng **chuỗi** đã format qua `lib/format` (`"1.200.000đ"`).
- B: ghi tiền dưới dạng **số** `1200000` kèm `numFmt`.

**Hai hành vi (đều hợp lệ theo chữ).** AD-13 binds "**all UI**" và route handler không phải UI, nên nó **không bị ràng buộc bởi bất kỳ luật định dạng nào**. A: file mở ra cột tiền là text, không cộng được (SPEC nói file phải "mở lại đọc được bằng Excel"). B: cột tiền cộng được nhưng cột ngày là `paymentDate` thô (`timestamptz`) → Excel hiển thị theo múi giờ của người mở (hoặc UTC): `30/09/2026 17:00`, trong khi màn hình cùng dòng đó hiện `Thứ 4, 01/10/2026` (ICT). AD-12 vẫn được tôn trọng (cùng hàm, cùng con số) — nhưng **ngày** lệch, và khách đọc file để đối chiếu ngày thu.

**AD đáng lẽ phải chặn.** AD-13 (đáng lẽ phải nói rõ file Excel cũng là một consumer) và AD-12 (đáng lẽ phải nói rõ hàm trả về cái gì).

**Rule viết lại — AD-13 (bổ sung):**
> ... Cấm format số và ngày trong component. **File `.xlsx` cũng là một consumer của `lib/format`**: cột tiền ghi dạng số với `numFmt` `#,##0"đ"`, cột ngày ghi dạng **chuỗi ngày ICT** `dd/MM/yyyy` kèm cột thứ, không ghi `timestamptz` thô. Mọi cột chỉ số trong file phải ghi đúng giá trị mà màn hình hiển thị.

---

### F15 — Ví dụ định dạng duy nhất của AD-13 sai ngày

**Hai đơn vị.**
- A: format trung thực từ dữ liệu → `Thứ 4, 16/09/2026`.
- B: giữ đúng chuỗi mẫu của AD-13/SPEC → hardcode `Thứ 3, 16/09/2026` trong fixture/seed/tiêu đề báo cáo để test xanh.

**Hai hành vi (đều hợp lệ theo chữ).** AD-13 ghim ví dụ `Thứ 3, 16/09/2026`. **16/09/2026 là Thứ Tư** (đã kiểm tra bằng `Get-Date`: `2026-09-16 -> Wednesday`; `2026-09-15` mới là Tuesday). SPEC lặp lại y nguyên chuỗi này hai lần (Constraints và màn Tổng quan trong `screen-inventory.md`), nên nó trở thành **oracle nghiệm thu**. A làm đúng kỹ thuật nhưng trượt test; B làm test xanh nhưng sai thứ trong app, và — quan trọng hơn — **lưu một giá trị dẫn xuất (thứ trong tuần) vào fixture**, đúng thứ AD-7 cấm.

**AD đáng lẽ phải chặn.** AD-13 (đáng lẽ ví dụ phải đúng), và gián tiếp AD-7.

**Đề xuất.** Sửa ví dụ trong AD-13 và trong SPEC thành `Thứ 3, 15/09/2026` (hoặc `Thứ 4, 16/09/2026`); thêm một test vàng (golden test) cho `lib/format` để ví dụ không bao giờ lệch nữa; và ghim rằng thứ trong tuần **luôn được suy từ ngày**, cấm lưu.

**Rule viết lại — AD-13 (câu ví dụ):**
> ... Tiền theo dạng `1.200.000đ`; ngày theo dạng `Thứ 3, 15/09/2026` (thứ trong tuần **luôn** suy từ ngày bằng `lib/format`, cấm lưu thứ vào dữ liệu ở bất kỳ dạng nào, kể cả fixture). `lib/format` có golden test cho đúng ví dụ này.

---

### F16 — Miễn giảm: đơn vị không ai ghim, và không có sàn 0

**Hai đơn vị.**
- A: `tuition/data/schema.ts` khai `discountVnd: integer`.
- B: khai `discountPercent: integer` (đọc AD-4 thành "phần trăm là số nguyên nên hợp luật").

**Hai hành vi (đều hợp lệ theo chữ).** Cột "Mức miễn giảm" trên màn Học sinh hiện `10%` (B) hoặc `10đ` (A — khi người dùng gõ `10` vào ô mà nhãn không nói đơn vị). Số phải thu chênh nhau đúng bằng sai số đơn vị. AD-5 nói "miễn giảm lưu thành các mốc hiệu lực theo ngày" nhưng **không nói đơn vị**; SPEC nói "số tiền cố định" nhưng AD-5 không nhắc lại, và AD-5 là thứ người build đọc. Thêm nữa, không có luật sàn: miễn giảm 2.500.000 trên học phí 2.000.000 → phải thu = −500.000 → AD-6 cho `outstanding = −500.000`, một con số mà SPEC CAP-8 không định nghĩa ("những học sinh còn **thiếu**").

**AD đáng lẽ phải chặn.** AD-5 (đáng lẽ phải ghim đơn vị) và AD-4 (đáng lẽ phải nói về dấu và sàn).

**Rule viết lại — AD-5 (bổ sung câu về đơn vị và sàn):**
> ... Miễn giảm là **số tiền VND cố định** cho từng học sinh, không phải phần trăm. Bất biến: `0 ≤ discount ≤ rate` tại mọi mốc hiệu lực, và **số phải thu của mọi kỳ không bao giờ âm** — hàm `payableFor` kẹp ở 0 và trả kèm cờ `capped: true` khi miễn giảm vượt học phí. Cấm mọi phép chia để tính miễn giảm.

---

### F17 — Đầu vào của Route Handler GET không qua schema, nên Excel có thể lệch một ngày

**Hai đơn vị.**
- A: màn Báo cáo lấy khoảng từ hai ô `<input type="date">` (chuỗi `YYYY-MM-DD`), diễn giải là ngày ICT, rồi gọi hàm lấy số với `from='2026-09-01'`, `to='2026-10-01'`.
- B: route xuất Excel nhận `?from=2026-09-01&to=2026-09-30&kind=income` rồi tự dựng `new Date(req.nextUrl.searchParams.get('from'))` — chuỗi không múi giờ, JS hiểu là 00:00Z.

**Hai hành vi (đều hợp lệ theo chữ).** AD-11 buộc "đầu vào được kiểm bằng schema ở biên" **trong câu nói về Server Action** ("mọi **thay đổi dữ liệu** đi qua Server Action; đầu vào được kiểm bằng schema ở biên") và ngoại lệ duy nhất là Route Handler GET để tải Excel — ngoại lệ này được miễn **cả** yêu cầu Server Action **lẫn** (theo cách đọc tự nhiên) yêu cầu schema. AD-12 vẫn được tôn trọng vì cả hai gọi **cùng một hàm** — nhưng với **hai tham số khác nhau**, lệch nhau 7 tiếng ở mỗi đầu khoảng. File Excel chứa một payment ngày 30/09 20:00 ICT mà màn hình không có. `kind` là chuỗi tự do: gõ sai → 500 hoặc một workbook rỗng, trong khi không AD nào định nghĩa **tập báo cáo** là gì.

**Đề xuất.** AD mới: mọi đầu vào HTTP qua schema, kể cả GET; tập báo cáo là union literal một chỗ.

**AD mới — AD-25 (Mọi đầu vào HTTP đi qua schema):**
> - **Binds:** all
> - **Prevents:** route xuất Excel nhận tham số chưa kiểm và diễn giải ngày theo múi giờ khác màn hình; thêm một "kind" báo cáo không ai quản.
> - **Rule:** mọi Server Action, Route Handler (kể cả `GET`), và mọi `searchParams` phải được parse bằng một schema Zod khai cùng chỗ với hàm lấy số, trước khi chạm vào dữ liệu; schema từ chối mọi chuỗi ngày không đúng `YYYY-MM-DD` và mọi khoảng có `from >= to`. Tập báo cáo là một union literal khai **một lần** ở `modules/reports/public.ts` (`type ReportKind = 'income' | 'attendance' | ...`), dùng chung cho cả nút trên UI và dynamic segment `[kind]`; `kind` không nằm trong union trả 404, không trả 500. Mọi khoảng ngày được chuyển sang ngày ICT bằng `lib/time` trước khi so sánh.

---

## MEDIUM

### F18 — "Hạn đóng" không có chủ và không có quy tắc lặp

SPEC (Constraints) ghim: hạn đóng do chủ lớp đặt **cho từng học sinh**, "giữ nguyên cho các tháng sau (sửa được)". Không AD nào nhắc tới nó, và không module nào được chỉ định.

- A: `students` khai `dueDay: integer` (1–31) → `dueDate(M)` suy ra theo tháng.
- B: `tuition` lưu một mốc `dueDate: date` tuyệt đối và "giữ nguyên" theo nghĩa đen.

Cùng câu chữ SPEC, hai kết quả: B làm mọi học sinh hiện "quá hạn" trong tháng 10 (hạn vẫn là 05/09/2026), A hiện 05/10. Thêm hai lỗ nhỏ: ngày 31 trong tháng 30 ngày, và múi giờ của phép so "quá hạn" (payment lúc 23:00 ICT ngày đến hạn bị coi là muộn nếu so bằng UTC).

**Đề xuất.** **AD-27 (Hạn đóng là quy tắc lặp):** hạn đóng lưu ở `students` dưới dạng `dueDayOfMonth` (1–28) và **suy ra** `dueDate(M)` = ngày `dueDayOfMonth` của tháng M theo ICT; cấm lưu hạn tuyệt đối; cấm ngày > 28 để tránh tháng thiếu ngày; "quá hạn" là hàm thuần so `businessToday()` với `dueDate(M)`, và **hạn cuối là 23:59:59 ICT của ngày đến hạn**.

### F19 — Cột `22/30` không có nguồn cho mẫu số

`screen-inventory.md` ghi cột đếm dạng `22/30` trong danh sách học sinh `[?]`. Muốn có "30" phải biết **khoá học bắt đầu và kết thúc khi nào**, hoặc tổng số buổi theo kế hoạch. AD-3 chỉ lưu thứ + giờ; AD-16 xoá enrollment; không có `startDate`/`endDate` cho lớp hay học sinh.

- A: đếm từ `classes.createdAt` tới hôm nay.
- B: đếm từ `students.createdAt` tới hôm nay.
- C: một cột `plannedSessions = 30` khai trên lớp.

Ba con số khác nhau (30 / 44 / 30), cả ba đều là hàm thuần trên "dữ liệu gốc" — nhưng `createdAt` không phải dữ liệu nghiệp vụ, và AD-7 không cho nó một vai trò nào. AD-21 (mốc hiệu lực lịch) chưa đủ; cần cả mốc bắt đầu/kết thúc.

**Đề xuất.** Hoặc bỏ cột này khỏi SPEC (nó đang là `[?]`), hoặc thêm `classes.startOn`/`endOn` + `students.joinedOn` và ghim công thức trong AD-21.

### F20 — Công nợ: theo kỳ hay luỹ kế, và "đánh dấu đã thu" là đường ghi thứ hai

- A: `payments/public.outstanding(studentId, period)` — một dòng nợ cho mỗi (học sinh, tháng).
- B: `payments/public.outstandingTotal(studentId)` — một dòng nợ cho mỗi học sinh, cộng dồn mọi tháng.

SPEC CAP-8 nói "với **một tháng**, danh sách nợ hiển thị đúng những học sinh còn thiếu kèm **số tiền còn thiếu**" — đọc được cả hai cách; và không màn nào trong spine có "tổng công nợ". AD-6 chỉ định nghĩa công nợ **của một kỳ**. Hai đường mutation cũng khác nhau: nút "đánh dấu đã thu" (CAP-8) tạo một payment bằng đúng phần còn thiếu với `period` = tháng đang xem và `paymentDate` = **bây giờ**; form "ghi thu" cho người dùng tự chọn cả hai. Ngày 01/10 lúc 06:00 ICT, nút "đánh dấu đã thu tháng 9" ghi một payment tháng 10 (theo ngày) cho kỳ 9 — hai đường ghi, hai kết quả khác nhau trên cùng một cú click ý định.

**Đề xuất.** AD-6 nói rõ đơn vị hiển thị của danh sách nợ; và ghim rằng "đánh dấu đã thu" **không** được tự chọn ngày thu khác `businessToday()`.

### F21 — Ghi điểm danh không kiểm tra buổi có tồn tại

AD-11 buộc đầu vào qua schema, nhưng schema kiểm **hình dạng**, không kiểm **sự tồn tại của buổi**. Vì AD-3 cấm bảng buổi, không có khoá ngoại nào chặn.

- A: `attendance/actions.mark` nhận `(studentId, classId, date, startTime)` bất kỳ, ghi thẳng.
- B: `attendance/actions.mark` từ chối nếu `classes.domain.sessionsBetween(classId, date, date)` không chứa buổi đó.

Hệ quả với A: chủ lớp điểm danh một ngày nghỉ lễ (spine để "nghỉ lễ" ở mục *Deferred*), hoặc điểm danh nhầm ngày, hoặc điểm danh một buổi bù → bản ghi **tồn tại nhưng không bao giờ được đếm** (mẫu số suy từ lịch không có buổi đó), nên tỉ lệ điểm danh không bao giờ khớp và không màn nào báo lỗi. Với B: "buổi bù" không thể ghi, mâu thuẫn với *Deferred* đang để ngỏ.

**Đề xuất.** AD-3/AD-11 ghim: ghi điểm danh **bắt buộc** kiểm tra buổi suy ra; muốn có buổi bù thì phải thêm mốc ngoại lệ lịch (AD-21 mở rộng), không được ghi tự do.

### F22 — Vào giữa tháng và đổi giá giữa tháng: không có luật, mà AD-4 cấm công cụ để có luật

Học sinh bắt đầu học ngày 22/09 (`status = 'Chưa bắt đầu'` theo SPEC). Tháng 9 phải thu bao nhiêu?

- A: thu đủ một tháng (đơn giản, hợp AD-5 vì chỉ tra mốc).
- B: chia theo buổi = `rate * attended / planned` → cần **làm tròn** → trái AD-4 câu 2; B lách bằng cách làm tròn trong `data/` và không ai phát hiện.

Cả hai đều "đúng AD-5" vì AD-5 không nói kỳ đầu tiên hay kỳ đổi giá giữa tháng được tính thế nào, trong khi cột `22/30` (F19) gợi ý khách đang nghĩ theo số buổi.

**Đề xuất.** AD-5 ghim thẳng: **thu theo tháng đủ, kỳ ghi danh thu nguyên tháng**, cấm chia theo buổi; nếu khách muốn chia theo buổi thì phải thay AD-4 và AD-5 bằng AD mới.

### F23 — Migration và deploy không có thứ tự

AD-15: "Migration chạy có kiểm soát, **không tự động ở prod**". Structural Seed: `G["GitHub nhánh main"] -->|deploy| V`.

- A: chạy migration trong bước build của Vercel → **tự động ở prod**, trái AD-15, nhưng không có cửa sổ lỗi.
- B: chạy migration tay **sau** khi Vercel deploy xong → có một cửa sổ code mới + schema cũ: `/payments` trả 500, và payment ghi trong cửa sổ đó có thể mất.
- C: chạy tay **trước** deploy → migration kiểu "expand" an toàn, nhưng không AD nào nói phải viết migration theo kiểu expand/contract.

**Đề xuất.** AD-15 ghim thứ tự: **migration expand chạy tay trước, deploy sau, migration contract chạy tay sau**; cấm migration phá huỷ trong cùng một lần với deploy; cấm mọi migration tự động ở prod, kể cả trong build step.

---

## LOW

### F24 — AD-14 khai token ở **hai** chỗ

AD-14: màu "chỉ được khai trong theme Tailwind **và** một module brand" — hai nguồn cho cùng một token. A: component dùng `bg-navy`. B: component dùng `style={{ color: BRAND.navy }}`. Cả hai hợp luật; đổi thương hiệu thì một nửa app đổi. Quy tắc 70/30 là luật "trình bày" nhưng không có phép kiểm nào (nó nói về **diện tích được vẽ**), nên hai người build sẽ "tuân thủ" theo hai cách.

**Đề xuất.** Một nguồn duy nhất (CSS variable), `brand.ts` chỉ đọc lại từ đó; chuyển 70/30 ra khỏi Rule thành một mục checklist review thiết kế.

### F25 — Glossary ghim "một khái niệm một tên", nhưng tên nào thì không nói

Consistency Conventions: "buổi = session", "kỳ thu = billing period". Nhưng spine **không có thực thể session** (AD-3), nên glossary đang ánh xạ một cái tên tới một thứ không tồn tại; và AD-9 đặt tên cột là `period` trong khi glossary gọi khái niệm là "billing period". A: `period`. B: `billingPeriod`. Cả hai hợp lệ vì glossory chỉ ghim **khái niệm**, không ghim **định danh trong schema**.

**Đề xuất.** Bảng glossary ghim luôn tên bảng/cột/hàm (ví dụ `payments.period`, `classes.sessionRule`, `tuition.payableFor`).

### F26 — Chuỗi định dạng ghim trong AD-13 khác kết quả của `Intl`

AD-13 ghim `1.200.000đ` và `16/09/2026`. `Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' })` cho ra dạng có ký hiệu `₫` và khoảng trắng; `Intl.DateTimeFormat('vi-VN')` cho ra `16/9/2026` (không đệm 0). A: tự viết hàm format. B: dùng `Intl` rồi hậu xử lý. Cả hai "đi qua `lib/format`".

**Đề xuất.** AD-13 ghim **kết quả chuỗi**, kèm golden test; nói rõ `Intl` được dùng hay không và nếu dùng thì phải hậu xử lý về đúng chuỗi ghim. (Số liệu `Intl` cần xác minh khi khởi tạo dự án — spine hiện chưa kiểm chứng phiên bản/ICU nào.)

---

## Bốn cách "đúng luật" để lách AD-2 và AD-7

Tổng hợp riêng phần lách, vì đây là chỗ spine khó tự vệ nhất:

1. **`public.ts` tái xuất schema** — thoả câu "chỉ import `public.ts`" của AD-2 mà vẫn đưa bảng Drizzle ra ngoài. *Bịt bằng:* câu bổ sung của AD-2 (chỉ xuất DTO + hàm use-case).
2. **`lib/` là module bóng** — AD-2 chỉ nói về "module", nên SQL nghiệp vụ trong `lib/reporting/` không thuộc ai. *Bịt bằng:* AD-23.
3. **`period` là cột cache không có tên trong danh sách cấm của AD-7** — AD-9 lại buộc phải có nó. *Bịt bằng:* AD-7 mới (chỉ được lưu trường người dùng nhập) và AD-9 nói rõ `period` là **dữ liệu nhập**.
4. **Bảng điểm danh chính là "bảng buổi" đổi tên** — nó lưu `classId`, `date`, `startTime`, tức là toàn bộ khoá buổi và cả sự tồn tại của buổi; AD-3 nói "không có bảng buổi" nhưng bảng điểm danh đang **là** bảng buổi phi chuẩn hoá theo từng học sinh. Đây là cách hợp pháp để có bảng buổi mà vẫn tuyên bố tuân thủ AD-3 — và chính vì thế F3 mới xảy ra. *Bịt bằng:* Rule bổ sung của AD-3 ("buổi đã điểm danh ⟺ đủ dòng cho mọi học sinh") biến việc này thành **quy ước có chủ ý** thay vì tai nạn.

---

## AD mới đề xuất (11) — và thứ tự cần làm

**Nhóm 1 — bắt buộc trước khi viết dòng code đầu tiên (chặn tiền và chặn thời gian):**
AD-17 (*Kỳ thu là dữ liệu nhập*) — gộp từ F1; AD-18 (*Một chỉ số, một chủ, một hàm*) — mở rộng AD-12, F5; AD-19 (*Thời gian nghiệp vụ một cửa*) — F2; AD-21 (*Lịch lớp có mốc hiệu lực*) — F12, F19.

**Nhóm 2 — bắt buộc trước khi nhập dữ liệu thật:**
AD-20 (*Buổi có trạng thái "đã điểm danh"*) — F3, F21 (có thể chỉ cần siết AD-3, không cần AD mới); AD-22 (*Không xoá cứng dữ liệu tiền*) — F6; AD-24 (*Ngoại lệ vận hành*) — F7, F8.

**Nhóm 3 — nên có, rẻ, và ngăn được lệch số về sau:**
AD-23 (*Biên ngoài module*) — F9; AD-25 (*Mọi đầu vào HTTP qua schema*) — F17; AD-26 (*Một chính sách làm tròn*) — F11; AD-27 (*Hạn đóng là quy tắc lặp*) — F18.

**Số lượng là một vấn đề.** 16 → 27 AD là dấu hiệu spine đang cố bù bằng AD những chỗ lẽ ra chỉ cần **một quyết định**. Ba chỗ nên **thay** thay vì **thêm**:
- **AD-3** nên được thay bằng một cặp rõ ràng: *lịch có mốc hiệu lực* (AD-21) + *buổi suy ra & bất biến* (AD-3 siết). Giữ AD-3 như hiện tại là giữ một AD nửa đúng.
- **AD-8** và **AD-12** nên **gộp** thành một AD-18 duy nhất, vì tách ra chính là lý do F5 tồn tại.
- **AD-16** nên được **sửa** để có trạng thái nghỉ học và `classId` chụp trên bản ghi tiền, thay vì thêm AD-22 đứng cạnh một AD-16 vẫn còn sai.

**Ba câu hỏi phải hỏi khách trước khi chốt** (không tự quyết được, vì chúng là *yêu cầu*, không phải *kỹ thuật*):
1. "Thu nhập tháng 9" là tiền **thu được trong tháng 9** hay tiền **thuộc kỳ tháng 9**? (F1, F5 — và câu này quyết định cả SPEC CAP-5 lẫn Success signal.)
2. Học phí tháng 9 của một học sinh **bắt đầu học ngày 22/09** là bao nhiêu? (F22, F19)
3. Học sinh **nghỉ học** thì xử lý thế nào — ẩn đi, hay xoá, và có cần xem lại lịch sử không? (F6)

---

## Điểm tin được của tài liệu này

- Các cặp ở F1–F26 được dựng từ **câu chữ** của AD trong `ARCHITECTURE-SPINE.md` và các tiêu chí trong `SPEC.md`, `screen-inventory.md`, `brand.md` — không suy diễn thêm.
- **Đã kiểm chứng cục bộ:** `2026-09-16` là **Wednesday** (Thứ Tư) — ví dụ `Thứ 3, 16/09/2026` ở AD-13 và SPEC là **sai một ngày**; máy dev có múi giờ `SE Asia Standard Time`.
- **Chưa kiểm chứng:** mặc định `TZ` của Vercel và chi tiết đầu ra của `Intl` vi-VN (F26). Phiên này không có mạng, nên hai điểm đó phải được xác minh ở bước khởi tạo dự án — đúng như spine đã tự ghi ở mục Stack. F2 và F26 được viết sao cho vẫn đúng ngay cả khi mặc định của Vercel khác dự đoán: điều F2 khẳng định là **spine không ghim TZ/locale của runtime**, và điều đó đúng bất kể mặc định là gì.
- Review này **không sửa** bất kỳ file nào ngoài chính nó.
