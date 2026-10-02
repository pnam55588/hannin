---
name: 'Review đối kháng bản cập nhật Architecture Spine'
type: architecture-review
reviewer: 'Winston — reviewer đối kháng độc lập'
reviewed: '2026-09-30'
target: '../ARCHITECTURE-SPINE.md'
scope: 'AD-7, AD-12, AD-17, ownership dữ liệu, batching, request scope và responsive'
verdict: 'FAIL — cần làm rõ trước khi chia cho các unit triển khai độc lập'
---

# Review đối kháng bản cập nhật Architecture Spine

## Kết luận

**FAIL — spine đã đóng được ý định của AD-7/12/17, nhưng chưa đủ chặt để hai unit triển khai độc lập tạo ra các phần tương thích.**

AD-7 đã cấm cache xuyên request rõ hơn, AD-12 đã mở rộng quyền sở hữu chỉ số ra toàn hệ thống, và AD-17 đã cấm vòng lặp truy vấn theo lớp/học sinh. Tuy vậy, ba quyết định này vẫn thiếu hợp đồng tại các đường nối: ai dựng read model cho một request, module sở hữu chỉ số được phép đọc bảng nào, batch phải trả đủ tập nào, và “một request” bắt đầu/kết thúc ở đâu trong Next.js App Router. Vì thiếu các điểm đó, những unit dưới đây đều có thể viện đúng câu chữ hiện tại nhưng vẫn lệch số, lệch truy vấn hoặc không ghép được với nhau.

## Cách thử đối kháng

Review dùng cùng một phép thử cho mỗi finding:

1. Dựng hai unit có thể được giao cho hai người khác nhau.
2. Mỗi unit chỉ dùng import qua `public.ts`, không lưu số dẫn xuất, không cache xuyên request, và cung cấp biến thể batch.
3. Cho hai unit cùng xử lý một tập dữ liệu có lớp không phát sinh bản ghi, học sinh đã nghỉ còn nợ, nhiều khoảng so sánh và nhiều React Server Component cùng render.
4. Nếu cả hai unit đều bảo vệ được bằng câu chữ của spine nhưng ghép lại cho kết quả khác nhau hoặc sinh N+1, coi là lỗ hổng kiến trúc.

## Findings

### F1 — Critical: quyền sở hữu bảng và quyền sở hữu chỉ số xung đột tại truy vấn xuyên miền

**Vị trí:** AD-2, AD-5, AD-12, AD-17; Structural Seed và Capability Map.

**Hai unit đều có thể tự nhận là đúng luật:**

- Unit A (`tuition`) sở hữu `chargesForPeriod`. Để tính một lần theo lô, nó join trực tiếp `students`, `tuition_rates`, `schedule_slots` và `payments`, rồi trả read model hoàn chỉnh. A tuân AD-12/17 nhưng vi phạm cách đọc chặt của AD-2 vì truy vấn bảng do module khác sở hữu.
- Unit B (`tuition`) chỉ truy vấn `tuition_rates`, rồi gọi `students/public`, `classes/public` và `payments/public` để lấy các phần còn lại. B tuân AD-2 nhưng mỗi public function tự mở truy vấn; khi dashboard, debtors và report cùng cần dữ liệu, B không có quyền gom các bảng đó thành một read plan duy nhất. Kết quả là nhiều round trip hoặc lặp dữ liệu, trái ý định AD-17.

**Hậu quả khi ghép:** team viết metric owner không biết có được join bảng ngoại miền hay không. Nếu không được, batch dừng ở biên module và không giải quyết được request nhiều chỉ số. Nếu được, câu “mỗi bảng vẫn có đúng một module sở hữu mọi câu truy vấn” của AD-2 mất hiệu lực.

**Cần chốt trong spine:** lập bảng ownership tối thiểu cho từng bảng/read projection và chọn đúng một mô hình:

- module sở hữu bảng xuất query/projection batch, còn một request orchestrator compose các projection; hoặc
- module sở hữu chỉ số được phép có read query xuyên bảng theo danh sách rõ ràng, nhưng không được ghi bảng ngoại miền.

Nếu chọn mô hình thứ nhất, public API phải nhận cùng `db/tx` và một request context để các lời gọi không tự ý mở lại dữ liệu. Nếu chọn mô hình thứ hai, AD-2 phải đổi từ “sở hữu mọi câu truy vấn” thành “sở hữu mọi phép ghi và định nghĩa projection”, kèm danh sách join hợp lệ.

**Gate kiểm chứng:** một sơ đồ hoặc bảng phải trả lời dứt khoát ai được đọc/join `student`, `schedule_slot`, `tuition_rate`, `payment` để tạo `chargesForPeriod` và `debtorsForPeriod`.

### F2 — Critical: “một request” chưa có ranh giới và nơi orchestration trong App Router

**Vị trí:** AD-7 dòng 72–76, AD-12 dòng 102–106, AD-17 dòng 132–136, Design Paradigm và Structural Seed.

**Hai unit đều có thể tự nhận là đúng luật:**

- Unit A đặt một loader tại `dashboard/page.tsx`, gọi toàn bộ hàm batch một lần rồi truyền props xuống. Mỗi chỉ số tính đúng một lần.
- Unit B tách bốn thẻ thành bốn async React Server Component; mỗi component gọi cùng owner function batch vì không import nội bộ xuyên module. Từng component không lặp theo lớp và không cache xuyên request, nhưng một HTTP request vẫn đọc `payment` hoặc `schedule_slot` nhiều lần.

Một unit khác có thể dùng `cache()` của React để dedupe trong render. Nó có thể giải thích đây là memoization theo request, hợp AD-17; reviewer khác có thể loại vì AD-7 cấm “mọi lớp cache kết quả tính toán trong tiến trình”. Không có API hay lifetime nào trong spine phân biệt hai trường hợp.

**Hậu quả khi ghép:** thay đổi cách chia component làm thay đổi số query. Skeleton/loading và streaming của Next.js càng làm ranh giới render khác ranh giới HTTP khó đoán. AD-17 hiện là mục tiêu, chưa phải hợp đồng có thể review bằng code.

**Cần chốt trong spine:**

- định nghĩa request scope là một lần render/Route Handler/Server Action cụ thể;
- chỉ định nơi orchestration cho mỗi consumer (`page` loader, route loader hoặc module query service);
- quy định có cho phép memoization **chỉ sống trong request** hay không, và API duy nhất để làm việc đó;
- nói rõ `revalidatePath`, React cache và Next Data Cache thuộc loại nào trong AD-7.

Khuyến nghị đơn giản: mỗi page/route có đúng một request loader ở server, loader gọi batch owners và truyền read model xuống; không component con nào tự đọc database. Memoization theo request chỉ là hàng rào phụ, không phải cơ chế chính.

**Gate kiểm chứng:** test/instrumentation phải chứng minh việc tách một thẻ dashboard thành component con không tăng số query cho cùng request.

### F3 — High: hợp đồng batch không định nghĩa tập đầy đủ, zero row, thứ tự và lỗi từng phần

**Vị trí:** AD-12 và AD-17.

**Hai unit đều có thể tự nhận là đúng luật:**

- Unit A nhận `classIds` và trả `Map<classId, Metric>` đủ mọi id; lớp không có payment/attendance nhận giá trị `0` hoặc `{done: 0, total: 0}`.
- Unit B chạy `GROUP BY class_id` và chỉ trả các lớp có bản ghi. Bên gọi tự hiểu id vắng mặt là 0, “không áp dụng”, hoặc lỗi dữ liệu.

Cả hai là “một lời gọi cho nhiều lớp”. Nhưng với học sinh đã nghỉ còn nợ, lớp mới chưa có payment, hoặc lớp có lịch nhưng chưa có attendance, A và B tạo tập hàng khác nhau. Dashboard có thể điền 0 còn Excel bỏ dòng; hai consumer vẫn cùng gọi một owner function nhưng diễn giải missing khác nhau.

**Hậu quả khi ghép:** AD-12 bảo đảm một công thức nhưng chưa bảo đảm một read contract. Sai khác xuất hiện ở chính biên `public.ts`, nơi các unit phải ghép với nhau.

**Cần chốt trong spine:** mọi batch API phải có hợp đồng chung:

- input universe là danh sách id tường minh hay do hàm tự chọn;
- output phải có đúng một phần tử cho mỗi input id;
- quy tắc cho zero, không áp dụng, thiếu dữ liệu và lỗi phải tách biệt;
- khoá, thứ tự, tính ổn định và kiểu lỗi từng phần;
- lớp/học sinh đã nghỉ có được giữ trong universe theo từng chỉ số hay không.

Đối với công nợ, universe phải xuất phát từ nghĩa vụ tài chính của kỳ, không từ danh sách học sinh mặc định đang hoạt động. Điều này là điểm nối bắt buộc giữa AD-16 và AD-17.

**Gate kiểm chứng:** contract test dùng ít nhất bốn trường hợp: lớp không có payment, lớp không có attendance, học sinh đã nghỉ còn nợ, và id đầu vào không tồn tại.

### F4 — High: batching chỉ đóng chiều “nhiều lớp”, bỏ ngỏ nhiều khoảng thời gian của CAP-1

**Vị trí:** AD-8, AD-12, AD-17 và CAP-1 trong Capability Map.

Dashboard cần bốn khoảng thu nhập trong cùng request: tháng hiện tại, tháng liền trước, năm hiện tại và năm liền trước. AD-12 chỉ bắt owner trả nhiều **lớp** trong một lời gọi; AD-17 cho phép “số lần cần thiết” nhưng không định nghĩa batch theo nhiều khoảng.

**Hai unit đều có thể tự nhận là đúng luật:**

- Unit A gọi `incomeBetween` bốn lần. Mỗi lời gọi là owner duy nhất, không lặp theo lớp và không cache.
- Unit B đọc payment một lần cho khoảng bao trùm, rồi trả bốn bucket. Nó cũng tuân đúng owner và batch.

Hai cách cho số giống nhau nhưng có query plan và thời gian rất khác. Nếu mỗi thẻ lại là một component theo F2, A dễ quay về bốn lần đọc cùng bảng; spine vẫn chưa có câu đủ cụ thể để loại.

**Cần chốt trong spine:** AD-17 phải batch theo **mọi chiều fan-out đã biết của consumer**, ít nhất gồm `classIds × intervals`, hoặc định nghĩa một read model CAP-1 duy nhất do `payments/public` trả cho cả bốn khoảng. Mốc khoảng phải là `[from, to)` theo Asia/Ho_Chi_Minh và owner phải trả cả hai số nguyên gốc để formatter quyết định `%` hoặc `mới`.

**Gate kiểm chứng:** một request Dashboard chỉ có một lần đọc payment cho bốn khoảng; thêm số lớp không làm số query tăng.

### F5 — High: responsive có viewport nghiệm thu nhưng chưa có hợp đồng breakpoint/component đủ để các unit ghép giao diện

**Vị trí:** Consistency Conventions dòng 144; Structural Seed chỉ liệt kê `ui/` theo feature.

Spine yêu cầu token và breakpoint tập trung, dùng được ở 360×800, 768×1024, 1024×768 và 1536×1024, điều hướng thu gọn dưới 1024 px. Nó chưa quy định ngưỡng 4→2→1 cột, xử lý đúng tại biên 768/1024, hay component nào sở hữu page shell, table viewport, form grid và action bar.

**Hai unit đều có thể tự nhận là đúng luật:**

- Unit A dùng mobile `<640`, tablet `<1024`, desktop `>=1024`; tại 768 là lưới 2 cột và tại 1024 sidebar đầy đủ.
- Unit B dùng mobile `<=768`, tablet `769..1024`, desktop `>1024`; tại 768 là 1 cột và tại 1024 điều hướng thu gọn. Cả hai vẫn chạy được tại bốn viewport và không cuộn ngang toàn trang.

Khi trang do A viết đặt bảng của B vào shell, padding, chiều rộng sidebar và `min-width` khác nhau có thể khiến nút hoặc bảng tràn; từng unit riêng vẫn qua tiêu chí của mình.

**Cần chốt trong spine hoặc tài liệu UX trước khi chia build:**

- khoảng breakpoint inclusive/exclusive chính xác;
- một bộ layout primitive dùng chung (`AppShell`, `PageHeader`, `MetricGrid`, `FormGrid`, `TableViewport`, `ActionBar`);
- owner của token/breakpoint và cấm feature tự khai media query riêng;
- hành vi điều hướng, bảng, form và action ở đúng bốn viewport.

Đây có thể nằm trong `DESIGN.md`/`EXPERIENCE.md`, nhưng spine phải gọi hai tài liệu đó là companion ràng buộc trước khi implementation bắt đầu. Hiện companions chỉ có `brand.md` và `screen-inventory.md`.

**Gate kiểm chứng:** visual/interaction contract test cho cả bốn viewport trên cùng shared shell, gồm ít nhất dashboard, form thêm học sinh, điểm danh và bảng báo cáo rộng.

## Ma trận unit không tương thích nhưng vẫn “đúng chữ”

| Cặp unit | Unit 1 | Unit 2 | Điểm vỡ khi ghép |
| --- | --- | --- | --- |
| `tuition` ↔ modules dữ liệu | Join xuyên bảng để batch | Chỉ gọi public API từng module | Hoặc phạm AD-2, hoặc không đạt AD-17 |
| Dashboard page ↔ card RSC | Page loader truyền props | Mỗi card tự gọi owner batch | Số query phụ thuộc cấu trúc component |
| Metric owner ↔ report/export | Map đầy đủ cả zero row | `GROUP BY` chỉ trả hàng có dữ liệu | UI và Excel khác số dòng/ý nghĩa missing |
| Income owner ↔ Dashboard | Một query cho nhiều khoảng | Bốn `incomeBetween` độc lập | Cùng số nhưng không cùng ngân sách truy vấn |
| App shell ↔ feature UI | Biên `<1024` và shared widths | Biên `<=1024`, media query cục bộ | Trang ghép tràn hoặc đổi layout tại viewport nghiệm thu |

## Sửa tối thiểu để đổi verdict

Không cần thêm công nghệ mới. Chỉ cần spine hoặc companion ràng buộc bổ sung năm điểm sau:

1. Chốt mô hình read ownership xuyên module và ghi rõ ai được join bảng nào.
2. Chốt một request loader/orchestrator và chính sách memoization theo request.
3. Chuẩn hoá contract batch: input universe, output totality, zero/missing/error và status filtering.
4. Mở AD-17 từ “nhiều lớp” sang mọi chiều fan-out đã biết, đặc biệt nhiều khoảng của CAP-1.
5. Bind `DESIGN.md` và `EXPERIENCE.md` làm companion bắt buộc, với breakpoint chính xác và shared responsive primitives.

Sau năm sửa này, AD-7/12/17 mới tạo thành một chuỗi khép kín: dữ liệu gốc có owner → request loader đọc theo plan → metric owner tính một lần → batch contract trả tập đầy đủ → mọi consumer render cùng read model mà không cache xuyên request.

