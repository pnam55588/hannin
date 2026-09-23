# Review đối chiếu đầu vào (reconcile) — ARCHITECTURE-SPINE.md

- **Spine được review:** `_bmad-output/planning-artifacts/architecture/architecture-hannin-2026-09-23/ARCHITECTURE-SPINE.md` (228 dòng, 16 AD, `status: draft`)
- **Input đối chiếu:** `SPEC.md` (8 capability, 7 constraint, 6 non-goal, 4 assumption, 0 open question), `brand.md`, `screen-inventory.md`
- **Nguồn phụ trợ để phân biệt "rơi khi distill" với "chưa từng vào":** `.memlog.md` cùng thư mục (chỉ đọc, không tính là input chính thức)
- **Ngày:** 2026-09-23
- **Phạm vi thao tác:** review này chỉ ghi vào `reviews/review-reconcile.md`. Không sửa spine và không sửa bất kỳ file nào khác.

## 0. Phương pháp

Một claim chịu tải (load-bearing) được coi là **landed** nếu nó xuất hiện ở **ít nhất một** trong các nơi sau của spine:

1. một AD (Invariants & Rules),
2. bảng **Consistency Conventions**,
3. bảng **Capability → Architecture Map**,
4. bảng **Stack**,
5. **Structural Seed** (sơ đồ triển khai / cây thư mục `src/` / ER diagram),
6. **Deferred**.

Nếu không tìm thấy ở đâu cả → **GAP (lỗ hổng bảo tồn)**.
Nhãn dùng trong báo cáo: `LANDED` · `LANDED-MỘT-PHẦN` · `GAP` · `LỆCH-NGHĨA` · `CHỐT-THAY-KHÁCH`.

## 1. Verdict

**KHÔNG ĐẠT reconcile đầy đủ (fail preservation, pass một phần cấu trúc).** Spine đáp xuống trọn 8/8 capability ở bảng Capability → Architecture Map, và các ràng buộc "có hình dạng kỹ thuật" (tiền nguyên VND, định dạng `1.200.000đ` + ngày kèm thứ, dữ liệu giả, một tài khoản, chỉ Excel không PDF, màu/logo/tỉ lệ 70/30) đều landed đúng chỗ. Nhưng có **1 lệch nghĩa nghiêm trọng** (định nghĩa "thu nhập": spine chốt tiền thực nhận, spec vẫn nghiệm thu theo số phải thu) và **6 claim chịu tải không landed ở đâu cả**, trong đó nặng nhất là **hạn đóng học phí** (constraint #5 của spec + success của CAP-8) và **toàn bộ bề mặt UI của CAP-8 công nợ**. Ngoài ra spine **âm thầm chốt thay khách** ở hai chỗ mà `screen-inventory.md` đánh dấu `[?]`/`cần thiết kế mới`. Không có non-goal nào bị mở lại.

## 2. SPEC.md — Capability (CAP-1..CAP-8)

| # | Claim chịu tải (dòng SPEC) | Nơi landing trong spine | Kết luận |
|---|---|---|---|
| CAP-1 | intent: 4 chỉ số Tổng quan; success: thu nhập tháng/năm **+ % so với kỳ trước**, `x/y` buổi trong ngày, `m/n` đã điểm danh (24–25) | Map CAP-1 → `modules/dashboard`, AD-7, AD-8, AD-13 (208); AD-7 liệt kê "công nợ, thu nhập, số buổi và tỉ lệ điểm danh" là số dẫn xuất (76) | **LANDED-MỘT-PHẦN** — 4 chỉ số landed; **ngữ nghĩa "% so với tháng trước / năm trước"** (mốc so sánh, cách tính %) không có ở AD, conventions hay Deferred → GAP phụ. Xem §4.2 (granularity "buổi") |
| CAP-2 | intent: thêm/sửa/xem/tìm học sinh với **lớp, SĐT, học phí/tháng, miễn giảm, lịch học, trạng thái học** (27–28) | Map CAP-2 → `modules/students`, AD-1, AD-2, AD-5, AD-16 (209); ER có STUDENT (195); AD-5 cho học phí + miễn giảm theo mốc hiệu lực (64) | **LANDED-MỘT-PHẦN** — thiếu: **trạng thái học** (`Đang học` / `Chưa bắt đầu`, screen-inventory dòng 26) không có ở AD/ER/Deferred; **tìm kiếm theo tên** và **SĐT** không được nói tới (chấp nhận được ở độ cao này, nhưng trạng thái học thì không — xem §4.3) |
| CAP-3 | xem lịch theo ngày và theo lớp, **sửa được lịch từng lớp**; đổi lịch thì buổi hiển thị theo lịch mới (30–31) | Map CAP-3 → `modules/classes`, AD-3 (210); AD-3: chỉ lưu quy tắc lịch (thứ + giờ bắt đầu) (52) | **LANDED-MỘT-PHẦN** — quy tắc lịch có chỗ; nhưng **quy tắc lịch không có hiệu lực theo ngày** trong khi học phí thì có (AD-5), nên "sửa lịch" viết lại quá khứ và mâu thuẫn chính AD-3 ("bất biến"). Xem §4.4 |
| CAP-4 | điểm danh từng buổi, ghi **trạng thái của mỗi học sinh** trong buổi (33–34) | Map CAP-4 → `modules/attendance`, AD-3, AD-11 (211); ER `STUDENT ||--o{ ATTENDANCE` (196) | **GAP phụ** — không có **tập giá trị trạng thái điểm danh** nào (ảnh cho `Có học` / `Vắng`, screen-inventory 18) ở glossary, AD, conventions hay Deferred. Xem §4.2 |
| CAP-5 | **intent:** theo dõi học phí/tháng, **miễn giảm theo số tiền cố định**, tổng thu nhập theo tháng/năm (36); **success:** "Tổng thu nhập tháng trên Tổng quan khớp với tổng **số tiền phải thu** của các học sinh đang học sau khi trừ miễn giảm" (37) | Map CAP-5 → `modules/tuition` + `modules/payments` + `modules/dashboard`, AD-4, AD-5, AD-6, AD-8 (212); AD-5 mốc hiệu lực học phí + miễn giảm (64); AD-8 "Thu nhập = tổng payment có ngày thu trong khoảng" (82) | **LỆCH-NGHĨA (nặng)** — AD-8 chốt thu nhập theo **tiền thực nhận**, còn success của CAP-5 nghiệm thu theo **phải thu**. Hai bên không thể cùng đúng. Xem §3.1. Miễn giảm landed nhưng AD-5 không nói **số tiền cố định (không phải %)** → LANDED-MỘT-PHẦN |
| CAP-6 | ghi nhận xét theo tháng cho từng học sinh, **đọc lại nhận xét cũ** (39–40) | Map CAP-6 → `modules/comments`, AD-2, AD-13 (213); ER `STUDENT ||--o{ COMMENT : "nhận xét theo tháng"` (199) | **LANDED** (kỳ của nhận xét = theo tháng nằm ở nhãn ER; không có AD riêng nhưng đủ) |
| CAP-7 | báo cáo thu nhập + điểm danh theo khoảng tự chọn, **theo lớp và theo từng học sinh**, xuất `.xlsx` (42–43) | Map CAP-7 → `modules/reports`, AD-12, AD-8 (214); AD-12 một nguồn số cho màn hình và Excel (106); `app/api/reports/[kind]/route.ts` (175); AD-11 cho phép Route Handler GET (100) | **LANDED** — lưu ý phụ: "theo lớp" dựa vào `classId` lưu tại thời điểm điểm danh (AD-16, 130) nên nhất quán |
| CAP-8 | **intent:** biết ai thiếu học phí, thiếu bao nhiêu và **đến hạn khi nào** (45); **success:** số tiền còn thiếu + **hạn đóng đã đặt cho học sinh đó (giữ nguyên từ tháng trước nếu không sửa)**; đánh dấu đã thu thì rời danh sách nợ và thu nhập tăng (46) | Map CAP-8 → `modules/payments` + `modules/tuition`, AD-5, AD-6, AD-9 (215) | **GAP (nặng)** — số còn thiếu landed (AD-6, 70). **Hạn đóng hoàn toàn vắng mặt**: không AD, không conventions, không ER, không Deferred, không route. Thêm nữa **không có bề mặt UI nào** để xem công nợ hay ghi nhận một lần thu. Xem §3.2, §3.3 |

## 3. Các lệch nghĩa và lỗ hổng quan trọng nhất

### 3.1 [LỆCH-NGHĨA · P1] "Thu nhập" bị định nghĩa lại từ phải thu (accrual) sang tiền thực nhận (cash)

- Spine AD-8 (78–82, `[ADOPTED]`): *"Thu nhập ở mọi màn hình và trong file Excel bằng tổng số tiền của các payment có ngày thu nằm trong khoảng đang xét. Số phải thu và công nợ là chỉ số riêng… không được gọi là thu nhập."*
- Spec CAP-5 success (37): *"Tổng thu nhập tháng trên Tổng quan khớp với tổng **số tiền phải thu** của các học sinh đang học sau khi trừ miễn giảm; sửa học phí hoặc mức miễn giảm của một học sinh thì tổng đổi đúng mức chênh lệch."*
- Spec **Success signal** (69): *"con số thu nhập tháng trên Tổng quan khớp với tổng số tiền **phải thu** sau miễn giảm của các học sinh đang học."*
- Chiều ngược lại, spec CAP-8 success (46) lại mô tả **cash**: "đánh dấu đã thu một học sinh thì… tổng thu nhập tháng tăng đúng số tiền đó".
- `.memlog.md` dòng 29 ghi rõ mâu thuẫn này vẫn là một **câu hỏi mở** ("phải cập nhật spec để hai bên không lệch"); dòng 46 ghi "Đã đồng bộ ngược lên spec: CAP-1, CAP-5, CAP-8 và Success signal được sửa theo C-iv-1 (cash)" — nhưng **bản SPEC.md hiện tại vẫn viết accrual ở CAP-5 và Success signal**. Spec vì thế **không còn tự nhất quán** (CAP-8 cash, CAP-5 + Success signal accrual), còn spine chốt cash mà không nêu ở Deferred và không ghi nhận câu hỏi còn treo.

**Hệ quả build:** người build đọc success criterion của CAP-5 sẽ cài Tổng quan theo phải thu, vi phạm AD-8; test nghiệm thu theo spec sẽ fail trên chính spine. Đây là lỗi preservation nghiêm trọng nhất vì nó đổi **định nghĩa một con số tiền**.

**Đề xuất sửa tối thiểu (không tự sửa):** hoặc (a) cập nhật CAP-5 + Success signal của spec sang cash basis cho khớp C-iv-1/CAP-8, hoặc (b) nếu khách thực sự muốn accrual trên Tổng quan thì thay AD-8 bằng AD mới và ghi nhận việc này như một thay đổi spec có chủ ý. Trước khi build phải đóng câu hỏi memlog dòng 29.

### 3.2 [GAP · P1] Hạn đóng học phí theo từng học sinh không landed ở đâu cả

- Constraint spec (54): *"**Hạn đóng học phí do chủ lớp đặt cho từng học sinh** và giữ nguyên cho các tháng sau (sửa được) — không phải hằng số của hệ thống."*
- CAP-8 intent (45) và success (46) đều phụ thuộc claim này ("đến hạn khi nào", "hạn đóng đã đặt cho học sinh đó giữ nguyên từ tháng trước nếu không sửa").
- `.memlog.md` dòng 13 ghi lại đúng constraint này — nên đây là **rơi khi distill spine**, không phải "chưa từng vào".
- Trong spine: từ "hạn" không xuất hiện với nghĩa due date; ER (193–200) chỉ có `TUITION_RATE`/`PAYMENT`; AD-5 nói mốc hiệu lực **giá**, không nói mốc hiệu lực **hạn đóng**; Deferred (221–228) không nhắc.

**Hệ quả build:** không có chỗ lưu hạn đóng, không có luật carry-forward "giữ nguyên từ tháng trước", nên success criterion của CAP-8 không kiểm chứng được; và mô hình AD-5 (mốc hiệu lực theo ngày) là khuôn có sẵn nhưng chưa được áp cho hạn đóng.

**Đề xuất:** thêm thuộc tính hạn đóng theo học sinh (cùng khuôn mốc hiệu lực như AD-5) vào ER + một dòng luật, hoặc nếu chốt chưa làm thì phải nằm trong Deferred kèm hệ quả lên CAP-8.

### 3.3 [GAP · P1] CAP-8 và việc ghi nhận thanh toán không có bề mặt UI/route nào trong Structural Seed

- Cây thư mục `src/app/` (172–175) chỉ có: `login/`, `dashboard/`, `students/`, `schedule/`, `attendance/`, `tuition/`, `comments/`, `reports/`. **Không có route nào cho công nợ** và không có route nào để ghi nhận một lần thu.
- `screen-inventory.md` (35) đã cảnh báo thẳng: *"Cách hiển thị công nợ học phí (CAP-8) và chỗ nhập mức miễn giảm, hạn đóng (CAP-5, CAP-8) chưa có màn tương ứng trong ảnh — **cần thiết kế mới**."*
- Spine không đưa mục này vào Deferred, cũng không nói "công nợ nằm trong màn Học phí & Thu nhập" hay tương tự → **im lặng thay vì trung thực**.
- Nghịch lý: sidebar quan sát được có **7 mục** (screen-inventory 7) khớp 1-1 với 7 route của spine — tức công nợ **không** có mục sidebar, nhưng CAP-8 được `binds` bởi 4 AD và là một trong 8 capability. Bề mặt thực thi bị bỏ trống.

**Đề xuất:** hoặc thêm route/màn hình (ví dụ mục Công nợ hoặc một khối trong `tuition/`) + chỗ ghi nhận payment, hoặc ghi vào Deferred một dòng "màn công nợ + chỗ nhập miễn giảm/hạn đóng: thiết kế mới, chưa có trong ảnh khách".

### 3.4 [GAP + CHỐT-THAY-KHÁCH · P2] Quy tắc lịch không có hiệu lực theo ngày, mâu thuẫn chính AD-3

- AD-3 (52): khoá buổi là `classId`, `date`, `startTime` và **bất biến**; "đổi lịch không được sửa hay xoá bản ghi điểm danh đã có".
- Nhưng quy tắc lịch được lưu **không kèm mốc hiệu lực** (khác hẳn AD-5 dành cho giá: "không bao giờ tính bằng giá hiện tại", 64).
- CAP-3 success (31) cho phép "thêm/bớt thứ hoặc khung giờ" của một lớp. Nếu quy tắc lịch là hiện hành/không ngày, sửa lịch sẽ làm **buổi quá khứ biến mất hoặc đổi giờ**, và bản ghi điểm danh cũ trỏ tới cặp `(date, startTime)` mà quy tắc mới không còn sinh ra → bản ghi mồ côi, báo cáo điểm danh (CAP-7) và tỉ lệ đã điểm danh (CAP-1) lệch.
- Spine không nói việc sửa lịch áp dụng hồi tố hay từ ngày sửa → **chốt thay khách** ở đúng chỗ khách chưa hề chốt.

**Đề xuất:** nêu rõ một trong hai: (a) lịch có hiệu lực theo ngày như giá (thêm mốc hiệu lực cho `SCHEDULE_SLOT`), hoặc (b) lịch chỉ áp từ ngày sửa trở đi và AD-3 nói rõ điều đó. Không được để im lặng.

### 3.5 [GAP · P2] Nhóm ràng buộc "im lặng" của spec không landed ở đâu cả

| Claim (dòng SPEC) | Trạng thái trong spine |
|---|---|
| *"Thao tác thường dùng (điểm danh, thêm học sinh) phải xong trong **một màn hình**, không qua wizard nhiều bước: người dùng không phải dân kỹ thuật"* (56) | **Không có ở AD, conventions, Map, Stack, Structural Seed hay Deferred.** Cụm "wizard" và "một màn hình" (nghĩa UX) vắng mặt; chỉ có "một màn hình nhỏ" ở dòng 40 với nghĩa khác (phạm vi ngoại lệ của AD-1). Đây là ràng buộc **định hình UI/flow** (một form một trang, không chia bước, modal tại chỗ) nên thuộc tầm với của spine — nhất là khi spine đã có AD-13/AD-14 là các AD thuần UI. Rơi ngay từ `.memlog.md` (không có trong danh sách constraint dòng 11–17) |
| *"Giao diện **tiếng Việt có dấu** là **ngôn ngữ duy nhất** của sản phẩm"* (50) | **LANDED-MỘT-PHẦN**: conventions chỉ ghi "Code và schema tiếng Anh, **UI tiếng Việt**" (136) — mất hai định tố chịu tải: **"có dấu"** (ảnh nguồn OCR `en-US` nên chuỗi không dấu có nguy cơ lọt vào UI) và **"duy nhất"** (không được để lẫn tiếng Anh trong UI, kể cả tên trạng thái/nút). Memlog dòng 11 có ghi "có dấu" nhưng bản distill đã làm nhạt |
| *"Miễn giảm học phí là **số tiền cố định** trên học phí tháng của từng học sinh"* (memlog 14; SPEC CAP-5 dòng 36) | **LANDED-MỘT-PHẦN**: AD-5 chỉ nói "học phí và miễn giảm lưu thành các mốc hiệu lực theo ngày" (64); AD-4 buộc tiền là số nguyên nhưng **một tỉ lệ % cũng là số nguyên**, nên phân biệt "số tiền cố định" với "phần trăm" chưa được chốt |

**Đề xuất:** thêm một dòng vào bảng Consistency Conventions (ví dụ concern "Ngôn ngữ & câu chữ": UI tiếng Việt có dấu là ngôn ngữ duy nhất, không lẫn tiếng Anh, thông điệp thân thiện không thuật ngữ) và một AD UI cho "thao tác thường dùng gói trong một màn hình, không wizard"; nếu cho là ngoài tầm architecture thì phải nằm trong Deferred — không được để trống cả hai.

### 3.6 [GAP · P2] Thương hiệu: chỉ màu/logo/tagline landed; **giọng điệu** và các mục chưa xác định bị rơi

- AD-14 (114–118): hai mã màu `#0D1F3D` / `#FF6B6B`, **tỉ lệ 70/30 là luật trình bày**, logo và tagline khai một chỗ, cấm hardcode hex → **LANDED đúng và đủ** cho phần hình.
- **Không landed:** (a) *giọng ấm áp, hướng phụ huynh/học sinh, xưng "bạn", không dùng thuật ngữ kỹ thuật* (brand.md 25) — không AD, không conventions, không Deferred; (b) **tagline tiếng Việt** *"Mở cánh cửa cơ hội và tương lai"*, *"Hành trình học tập dẫn đến thành công"*, *"Mở cánh cửa Tương lai của bạn"* (brand.md 23) — nếu khách hỏi "tagline nào", spine không phân biệt tagline nào là tagline chính; (c) **câu chữ đã quan sát trong app** *"Chào bạn! Chúc một ngày việc thật hiệu quả!"* (brand.md 24, screen-inventory 11) — không có chỗ nào nói màn Tổng quan phải giữ lời chào này; (d) khoảng thở quanh logo / dấu mũi tên âm bản (brand.md 9) và các biến thể logo (brand.md 10) — AD-14 gói logo vào "một module brand" nhưng không nói file nào, favicon, biến thể nền sáng/tối.
- **Các mục `[?]`/chưa xác định của brand.md** (dòng 10, 29: bản chỉ chữ `Haninn`, font, kích thước tối thiểu logo, biến thể nền sáng/tối, mảnh chữ `NGHĨA ÂN`) **không xuất hiện ở Deferred** — trong khi spine đã biết cách xử lý trung thực một `[?]` khác (xem §5, `Mã`). Sự bất đối xứng này là một lỗ hổng bảo tồn, không phải một lựa chọn có ghi chép.
- `.memlog.md` dòng 40 chỉ ghi "token brand nằm một chỗ, cấm hardcode hex" → phần giọng điệu/câu chữ đã rơi trước cả bước distill.

### 3.7 [GAP · P2] Mô hình dữ liệu không sinh ra được các cột/số liệu đã quan sát

| Quan sát (screen-inventory) | Trạng thái trong spine |
|---|---|
| Cột **`Trạng thái`** = `Đang học` / `Chưa bắt đầu` (26) | Không có ở AD/ER/glossary/Deferred. Nặng hơn: **AD-16** (130) buộc mỗi học sinh có đúng một lớp, `classId` **NOT NULL, không được null** — học sinh `Chưa bắt đầu` vẫn phải có lớp; và spec nghiệm thu CAP-5/Success signal theo "các học sinh **đang học**", một **vị từ chưa được định nghĩa ở đâu** trong spine. Đây là claim chạm vào tiền |
| Cột số đếm dạng cặp `22/30`, `10/24`, `5/12`, `19/26` `[?]` (27) | AD-7 có nhắc "số buổi" là số dẫn xuất (76), nhưng ER **không có ngày bắt đầu học, không có tổng số buổi/khoá**, nên **mẫu số không suy ra được** từ mô hình. Spine im lặng hoàn toàn về cột này → GAP |
| `5 / 12` buổi trong ngày **và** `4 / 5` đã điểm danh (15–16) | AD-3 định nghĩa buổi = `(classId, date, startTime)` — tức **theo lớp**. Nhưng ảnh có 4 khung giờ/ngày và toàn hệ có 5 lớp, nên `12` **không thể** là số buổi theo lớp; `12` lại trùng số học sinh (danh sách 12). Nghĩa là số liệu quan sát gợi ý granularity **theo học sinh**, ngược với AD-3. Spine **âm thầm chốt theo lớp** và không hề nêu mâu thuẫn này → CHỐT-THAY-KHÁCH + rủi ro CAP-1/CAP-4 bất khả thi đúng như success criterion |
| Nút `Xem lịch tháng` (15) | CAP-3 intent chỉ nói "theo ngày và theo lớp"; **chế độ xem tháng** có trong ảnh nhưng không landed ở route/AD nào |
| `Nhãn nhóm đánh dấu` `[?]` trong trạng thái điểm danh (18) | Không landed, không vào Deferred — và kéo theo việc **tập giá trị trạng thái điểm danh** (`Có học` / `Vắng`) cũng không được chốt (xem CAP-4 ở §2) |
| Nút `+ Thêm học sinh`, `Xem tất cả`, `Xem chi tiết` (20) | Không landed; chấp nhận được ở độ cao này, nhưng đáng ghi vì liên quan tới ràng buộc "một màn hình" (§3.5) và tới luật AD-2 (dashboard đọc qua `public.ts` của module khác — dòng 208 — nên các khối này hợp lệ về mặt kiến trúc) |

## 4. SPEC.md — Constraints (7)

| # | Constraint (dòng) | Nơi landing | Kết luận |
|---|---|---|---|
| C1 | Tiếng Việt có dấu là ngôn ngữ duy nhất (50) | Conventions "UI tiếng Việt" (136); thông điệp lỗi tiếng Việt (137) | **LANDED-MỘT-PHẦN** — mất "có dấu" và "duy nhất" (§3.5) |
| C2 | Tiền VND `1.200.000đ`; ngày kèm thứ `Thứ 3, 16/09/2026` (51) | AD-4 (58) + AD-13 (112) + `lib/format` (186) + Conventions "Data & formats" (137) | **LANDED** |
| C3 | Nhận diện Haninn là ràng buộc cứng: logo, hai màu, tỉ lệ ~70/30, tagline (52) | AD-14 (118) + "một module brand" | **LANDED-MỘT-PHẦN** (thiếu giọng điệu + tagline tiếng Việt + biến thể logo) (§3.6) |
| C4 | Một tài khoản chủ lớp, không vai trò phụ huynh/học sinh, không phần đọc công khai (53) | AD-10 (90–94): Auth.js credentials, middleware chặn mọi đường dẫn trừ login, "không có vai trò, không có kiểm tra phân quyền" | **LANDED** — đầy đủ và đúng |
| C5 | Hạn đóng học phí do chủ lớp đặt cho từng học sinh, giữ nguyên tháng sau, sửa được (54) | **Không tìm thấy ở đâu** | **GAP (P1)** (§3.2) |
| C6 | Dữ liệu seed và demo phải là dữ liệu giả (55) | Conventions "Data & formats": *"Dữ liệu seed và demo chỉ là dữ liệu giả"* (137); AD-15 "dev dùng dữ liệu giả" (124) | **LANDED** — có ở hai nơi. Ghi chú: spine không nói phải **loại bỏ tên/SĐT có thể là thật** trích từ ảnh nguồn (spec 55 nêu lý do này); luật hiện tại bao trùm nhưng không nhắc nguồn ảnh |
| C7 | Thao tác thường dùng xong trong một màn hình, không wizard; người dùng không phải dân kỹ thuật (56) | **Không tìm thấy ở đâu** | **GAP (P2)** (§3.5) |

## 5. SPEC.md — Non-goals (6): có cái nào bị spine vô tình mở lại không?

| # | Non-goal (dòng) | Đối chiếu spine | Kết luận |
|---|---|---|---|
| N1 | Không website marketing công khai / form đăng ký phụ huynh (60) | Không có route công khai; AD-10 chặn mọi đường dẫn trừ `login` (94) | **Không bị mở lại** (đóng bằng AD-10) |
| N2 | Không cổng phụ huynh/học sinh, không tra cứu, không Zalo/SMS (61) | AD-10 "không có vai trò" (94); **Deferred** "Thông báo cho phụ huynh. Là non-goal trong spec; nếu đổi ý thì đây là một hệ thống mới, không phải một màn hình mới" (226) | **Landing trung thực** — đây là cách xử lý non-goal tốt nhất trong spine |
| N3 | Không nền tảng dạy học trực tuyến (bài giảng, video, khoá học, bài tập) (62) | Không có module/route nào tương ứng; nhưng cũng **không được nhắc ở Deferred** | **Không bị mở lại**, nhưng không được đối chiếu ở đâu (rủi ro thấp vì cấu trúc module không tạo đường cho nó) |
| N4 | Không app native iOS/Android (63) | Deferred "Mobile và responsive. Spec chốt desktop; bố cục hiện tại không ràng buộc điểm gãy" (225) | **Không bị mở lại** — nhưng Deferred gộp "mobile web/responsive" với "app native"; nếu người build đọc riêng dòng này có thể hiểu nhầm mobile web chỉ là hoãn. Nên tách rõ |
| N5 | Không cổng thanh toán online / biên lai điện tử (64) | AD-6 sổ thu nội bộ (70); AD-5 "Không có bảng hoá đơn" (64); AD-11 không có tích hợp ngoài | **Không bị mở lại**. Cảnh báo thuật ngữ: Deferred "Chốt sổ và **hoá đơn** bất biến. … phải thêm bảng hoá đơn" (222) dùng chữ "hoá đơn" cho **bảng chốt sổ nội bộ**, dễ bị đọc thành biên lai điện tử — nên nói rõ "hoá đơn nội bộ, không phải biên lai" để tránh chạm non-goal |
| N6 | Không xuất PDF; báo cáo chỉ Excel `.xlsx` (65) | AD-12 `file .xlsx` (106); AD-11 "Route Handler GET để tải file Excel" (100); `api/reports/[kind]/route.ts` (175) | **LANDED**, không có PDF nào được mở lại |

**Kết luận non-goal: 0/6 bị mở lại.** Điểm trừ duy nhất là N3 và N4 không được nêu ở đâu (im lặng, không phải vi phạm), và Deferred dùng chữ "hoá đơn" dễ gây nhầm với N5.

## 6. SPEC.md — Assumptions (4) và Open questions (0)

| # | Assumption (dòng) | Đối chiếu spine | Kết luận |
|---|---|---|---|
| A1 | Chưa có hệ thống quản lý nào, đang làm thủ công (73) | Không có AD nhập liệu/migration; cũng không có mục Deferred | **Không cần landing** (không tạo ràng buộc kiến trúc); spine không mâu thuẫn |
| A2 | Dùng trên desktop (1536×1024); chưa ràng buộc mobile/responsive (74) | Deferred "Mobile và responsive. Spec chốt desktop; bố cục hiện tại không ràng buộc điểm gãy" (225) | **LANDED** (đúng chỗ Deferred) |
| A3 | Nội dung trích bằng OCR `en-US`; các mục `[?]` trong screen-inventory là chưa chắc chắn (75) | Spine xử lý **một** `[?]` trung thực: Deferred "Định dạng mã học sinh… Cột `Mã` trong ảnh khách gửi chưa đọc chắc được" (223). Các `[?]` khác (nhãn nhóm điểm danh, cột `22/30`, cột `Lịch học`, `[?]` của brand.md) **không được nêu ở đâu** | **LANDED-MỘT-PHẦN** — xử lý không đồng đều; 4+ mục `[?]` bị bỏ im lặng thay vì vào Deferred (§3.6, §3.7) |
| A4 | Chọn "công nợ" ⇒ loại cổng thanh toán online và biên lai khỏi phạm vi (76) | AD-6 sổ thu nội bộ; AD-5 không bảng hoá đơn; không tích hợp ngoài | **LANDED** |
| — | **0 open question** (spec) | Spine không tạo open question mới, nhưng cũng **không ghi nhận** rằng sau khi distill đã **phát sinh** ít nhất hai câu hỏi thật: hạn đóng học phí (§3.2) và granularity "buổi" (§3.7). `.memlog.md` dòng 29 vẫn đang để mở câu hỏi accrual/cash | **Chưa trung thực**: đáng lẽ vào Deferred |

## 7. brand.md

| Claim (dòng) | Nơi landing | Kết luận |
|---|---|---|
| Logo lockup `Haninn` + `ENGLISH CLASS` + tagline `LEARN · GROW · SUCCEED` (7) | AD-14 "logo và tagline chỉ được khai trong theme Tailwind và một module brand" (118) | **LANDED-MỘT-PHẦN** — có chỗ cho logo/tagline, nhưng không chốt tagline nào là chính (§3.6) |
| File dùng được `sources/haninn-logo.png` cho header, favicon, tài liệu in (8) | Không có ở AD/Structural Seed (không có `public/`, không nói favicon) | **GAP phụ** |
| Khoảng thở quanh logo; âm bản tạo mũi tên (9) | Không có | **GAP phụ** (nhưng đúng tầm "module brand") |
| Biến thể lockup dọc/ngang/chỉ chữ `[?]` (10) | Không có, không vào Deferred | **GAP** |
| Màu `#0D1F3D` (chính, ~70%), `#FF6B6B` (nhấn, ~30%), luật không dùng coral làm mảng lớn (16–19) | AD-14 (118): hai mã, "Tỉ lệ 70/30 là luật trình bày: navy giữ diện tích lớn, coral chỉ để nhấn" | **LANDED**, khớp cả tỉ lệ lẫn luật cấm |
| Tagline tiếng Việt (23) | Không có | **GAP** |
| Câu chữ trong app: lời chào Tổng quan, câu "không chỉ kiến thức, mà còn là hành trình trưởng thành." (24) | Không có (screen-inventory 11, 19 cũng quan sát được) | **GAP** |
| Giọng ấm áp, hướng phụ huynh, xưng "bạn", không thuật ngữ kỹ thuật (25) | Không có ở AD, conventions, Deferred | **GAP** — đây là "yêu cầu im lặng" điển hình: không có hình dạng schema nên dễ bị cấu trúc AD làm rơi |
| Font, kích thước tối thiểu logo, biến thể nền sáng/tối, `NGHĨA ÂN` `[?]` (29–30) | Không có, không vào Deferred | **GAP** |

## 8. screen-inventory.md

**Sidebar 7 mục (dòng 7) ↔ cấu trúc module: ánh xạ được 7/7.**

| Mục sidebar | Route trong spine (172–175) | Module (176–184) | Kết luận |
|---|---|---|---|
| `Tổng quan` | `dashboard/` | `modules/dashboard` | Khớp |
| `Học sinh` | `students/` | `modules/students` | Khớp |
| `Lịch học` | `schedule/` | `modules/classes` (lệch tên: route `schedule`, module `classes`) | Khớp, chỉ lệch **tên** — đáng ghi vì Conventions khẳng định glossary một-một "một khái niệm chỉ có đúng một tên trong code" (136), mà "lịch học" ở đây là hai tên (`schedule` cho route, `classes` cho module) |
| `Điểm danh` | `attendance/` | `modules/attendance` | Khớp |
| `Học phí & Thu nhập` | `tuition/` | `modules/tuition` + `modules/payments` | Khớp một phần: module `payments` **không có route tương ứng** trong `app/` (§3.3) |
| `Nhận xét` | `comments/` | `modules/comments` | Khớp |
| `Báo cáo` | `reports/` | `modules/reports` + `api/reports/[kind]/route.ts` | Khớp |
| *(không có trong ảnh)* | *(không có route)* | `modules/payments` (công nợ, ghi nhận thu) | **Hụt bề mặt** (§3.3) |

**Các mục khác:** xem §3.7 cho bảng cột bảng học sinh (`Mã`, `Trạng thái`, `22/30`, lịch theo lớp) và số liệu Tổng quan (`5/12`, `4/5`, `Xem lịch tháng`, nhãn nhóm `[?]`). Ghi nhận thêm:

- `Lịch học` `[?]` (dòng 25) trong bảng học sinh: inventory tự giải thích "là lịch riêng của từng lớp" (28) → spine **nhất quán** với cách hiểu đó (AD-3 lịch thuộc lớp; AD-16 học sinh thuộc một lớp) nhưng **không nói ra**; nên chấp nhận là landed gián tiếp.
- Cột `Mã` `[?]` (25): xử lý **trung thực**, đưa vào Deferred kèm cách thay thế (223). Đây là mẫu tốt để áp cho các `[?]` còn lại. Lưu ý nhỏ: Deferred nói "nhận diện học sinh bằng tên và lớp", còn Conventions chốt "Khoá chính là số nguyên tự tăng" (137) — hai câu không mâu thuẫn nhưng dễ đọc lệch (khoá kỹ thuật vs định danh trên UI); nên nói rõ.
- Các màn **chưa thấy nội dung** (Lịch học, Điểm danh, Học phí & Thu nhập, Nhận xét, Báo cáo) (32) — spine cấp route/module cho cả 5 → **landed**.
- "Chưa thấy màn đăng nhập" (33) → spine có `app/login/` + AD-10 → **landed** (thiết kế mới, hợp lý).
- "Không đọc được nút xuất file; CAP-7 chốt `.xlsx`" (34) → AD-12 + AD-11 → **landed**.
- "Cách hiển thị công nợ và chỗ nhập miễn giảm, hạn đóng chưa có màn tương ứng — cần thiết kế mới" (35) → **GAP** (§3.3): spine không nêu.

## 9. Bảng xếp hạng lỗ hổng và việc cần làm trước khi build

| Mức | Lỗ hổng | Đích sửa đề xuất (không tự sửa) |
|---|---|---|
| **P1** | Thu nhập: AD-8 cash vs CAP-5 + Success signal accrual (§3.1) | Đồng bộ spec theo cash **hoặc** thay AD-8; đóng câu hỏi `.memlog.md` dòng 29 |
| **P1** | Hạn đóng học phí theo học sinh không landed (§3.2) | Thêm thuộc tính/AD + ER, hoặc một dòng Deferred kèm hệ quả lên CAP-8 |
| **P1** | CAP-8 không có route/màn hình, không có chỗ ghi nhận payment (§3.3) | Thêm route/khối UI, hoặc Deferred "thiết kế mới" |
| **P2** | Lịch không có hiệu lực theo ngày, mâu thuẫn AD-3 (§3.4) | Nêu rõ hồi tố hay không; nếu cần thì thêm mốc hiệu lực cho quy tắc lịch |
| **P2** | "Một màn hình, không wizard", "tiếng Việt có dấu là ngôn ngữ duy nhất", "miễn giảm là số tiền cố định" (§3.5) | Một dòng Conventions + một AD UI; hoặc Deferred |
| **P2** | Giọng điệu, tagline tiếng Việt, câu chữ trong app, biến thể logo, `[?]` của brand.md (§3.6) | Mở rộng AD-14/phạm vi module brand + Deferred cho các `[?]` |
| **P2** | `Trạng thái` học sinh, `22/30`, granularity "buổi" 5/12, `Xem lịch tháng`, nhãn nhóm `[?]`, tập giá trị trạng thái điểm danh (§3.7) | Chốt granularity buổi (AD-3), định nghĩa `Trạng thái` + vị từ "đang học", đưa phần không suy ra được vào Deferred |
| **P3** | `% so với kỳ trước` không có luật; chữ "hoá đơn" trong Deferred dễ nhầm với non-goal biên lai; lệch tên `schedule` (route) vs `classes` (module); không nói về loại bỏ tên/SĐT thật trong ảnh nguồn | Nêu rõ khi có dịp sửa spine |

## 10. Ghi chú ngoài ba input (từ `.memlog.md`, để không bỏ sót)

- **Dòng 30 (E-2):** "chủ lớp tự đổi được mật khẩu trong app" — không thấy landed: AD-10 mô tả Auth.js credentials + bảng user nhưng **không có route/màn hình đổi mật khẩu** trong Structural Seed (chỉ có `login/`). Không nằm trong ba input chính thức, nhưng nếu đây là quyết định đã chốt với khách thì nó đang là một lỗ hổng cùng loại với §3.3.
- **Dòng 24 (C-iii-2):** "cho phép thu một phần" — AD-6 suy ra được ("công nợ = phải thu − tổng payment của kỳ", 70) nhưng không nói thành lời; spec cũng không nêu. Nên xác nhận vì success của CAP-8 nói "đánh dấu đã thu một học sinh" (nghe như thu trọn).
- **Dòng 46:** ghi "đã đồng bộ ngược lên spec… theo C-iv-1 (cash)" — **không khớp** với SPEC.md hiện tại (§3.1). Đây là bằng chứng mạnh nhất rằng P1 thứ nhất là lỗi đồng bộ thật, không phải khác biệt diễn đạt.
- **Dòng 47:** lint cơ học 0 finding — đúng, nhưng lint cơ học không bắt được loại lỗi bảo tồn trong báo cáo này (không AD nào thiếu field; cái thiếu là claim không có AD nào).

## 11. Kết luận

- **Capability:** 8/8 có mặt ở bảng Capability → Architecture Map (tốt), nhưng CAP-5 lệch nghĩa và CAP-8 thiếu mô hình hạn đóng + thiếu bề mặt UI.
- **Constraint:** 3/7 landed trọn (C2, C4, C6), 3/7 landed một phần (C1, C3, và miễn giảm-số-tiền-cố định), 1/7 GAP hoàn toàn (C5 hạn đóng), 1/7 GAP (C7 một-màn-hình).
- **Non-goal:** 0/6 bị mở lại; 2/6 không được đối chiếu ở đâu (rủi ro thấp).
- **Assumption:** 2/4 landed trọn; A3 (`[?]`) xử lý không đồng đều — 1 mục trung thực, 4+ mục bị bỏ im lặng.
- **Trung thực với `[?]`:** nhìn chung **chưa đạt** — spine chốt thay khách ở granularity "buổi" (theo lớp) và ở việc không có màn công nợ, thay vì ghi vào Deferred như đã làm với cột `Mã`.
- **Điều kiện để coi là reconcile pass:** xử lý 3 mục P1 (đồng bộ định nghĩa thu nhập, hạn đóng học phí, bề mặt CAP-8) và đưa ít nhất các `[?]`/ràng buộc im lặng còn lại vào Deferred hoặc Conventions.
