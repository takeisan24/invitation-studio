<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cuộc Hẹn Nhỏ — nguồn sự thật cho agent

Phần này do chủ dự án duyệt ngày 2026-10-23. Khi yêu cầu mâu thuẫn với nội dung dưới đây, dừng lại và hỏi chủ dự án — không tự suy diễn ý định sản phẩm. Mục còn ghi "chưa chốt" thì hỏi trước khi làm.

Repo này **public**. Không ghi vào bất kỳ file nào được commit: chi tiết lỗ hổng chưa vá, secret, mã project hay URL nội bộ của hạ tầng.

## Sản phẩm

- **Là gì:** studio tạo thiệp mời đi date phong cách Editorial Vintage. Người gửi soạn thiệp, người nhận mở link, chọn vài chi tiết (giờ, không gian, đồ uống…) và nhận một cuống vé.
- **Mục đích:** sản phẩm cá nhân, open-source (MIT), **phi thương mại**. Chạy trên gói miễn phí (Vercel Hobby chỉ cho phép dùng phi thương mại).
- **Người dùng:** người gửi là người trẻ Việt Nam muốn rủ đi date; người nhận mở thiệp trên điện thoại từ Zalo/Messenger.
- **Thành công:** người nhận trả lời xong trong khoảng 2 phút mà không phải hỏi lại người gửi.
- **Ngôn ngữ:** tiếng Việt là chính, tiếng Anh là phụ. Giọng văn nhẹ nhàng, tinh tế, không sến.
- **Design:** giữ Editorial Vintage với 4 theme trong `lib/theme-config.ts` và bộ font hiện có. Danh sách điều cấm: *chưa chốt*.
- **Lộ trình / ngoài phạm vi:** *chưa chốt*.

## Nguyên tắc bất biến

1. **Không tài khoản, không đăng nhập.**
2. **Không lưu câu trả lời của người nhận trên server.** Câu trả lời chỉ về người gửi qua link `/reply#r=…` mà người nhận tự chọn gửi.
3. **Không analytics theo dõi từng người.** Nếu cần thống kê thì chỉ dạng tổng hợp, không cookie, và phải hỏi trước.
4. Chỉ dùng gói miễn phí. Bất cứ thay đổi nào có thể phát sinh phí phải hỏi trước.

## Kiến trúc (không database)

| Luồng | Cách chạy | File chính |
|---|---|---|
| Link ngắn | Config lưu thành JSON bất biến trên Vercel Blob, `/i/<id>` (id = `YYMM` hết hạn + 10 ký tự CSPRNG) | `lib/server/invite-store.ts`, `app/api/invites/route.ts`, `app/i/[id]/page.tsx` |
| Link dự phòng | `/invite#c=…` chỉ chứa phần khác với snapshot mặc định; fragment không bao giờ tới server | `lib/invite-codec.ts`, `lib/invite-baseline.ts` |
| Link cũ | `/invite?c=` (config đầy đủ) và `/invite?id=` (chuyển sang `/i/<id>`) vẫn mở được | `lib/config-encoder.ts`, `app/invite/page.tsx` |
| Câu trả lời | `/reply#r=…` lưu vào hộp thư `localStorage` của người gửi | `app/reply/page.tsx`, `lib/archive-storage.ts` |
| Upload ảnh/nhạc | Client upload thẳng lên Blob bằng token ngắn hạn do server cấp | `app/api/upload/route.ts`, `lib/upload-client.ts` |
| Dọn dẹp | Cron hằng tuần xoá thư mục tháng đã hết hạn | `app/api/cron/cleanup/route.ts`, `vercel.json` |

Quy tắc khi sửa:

- **`lib/invite-baseline.ts` không bao giờ được sửa.** Mọi link `#c=` đã gửi giải mã dựa trên snapshot này. Muốn đổi mặc định thì thêm snapshot v2 và tăng `INVITE_PAYLOAD_VERSION`. Test `baseline snapshot still matches the live defaults` sẽ báo khi `lib/date-content.ts` lệch khỏi snapshot — khi đó phải thêm v2, không sửa snapshot.
- Mọi config đến từ URL hoặc request đều phải đi qua `sanitizeInviteConfig`.
- Đã chốt thời hạn file: 30 ngày sau ngày hẹn, hoặc 90 ngày sau khi tạo nếu không có ngày; tối đa 180 ngày.
- Hạn mức Blob trên Hobby: vượt là bị khoá 30 ngày, mọi ảnh và nhạc đã gửi sẽ hỏng. Đừng thêm thao tác `put`/`list` không cần thiết.

## Quy trình

- Spec → review → build. Spec để trong `specs/` (đã exclude khỏi git, không commit).
- Mỗi tính năng một branch và một PR. Commit theo dạng `feat(scope): …`, `fix(scope): …`.
- Kiểm tra trước khi báo xong: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, rồi QA tay theo kịch bản trong spec.
- Unit test bắt buộc cho logic thuần, nhất là bộ mã hoá link (`tests/`).

## Agent không được tự làm (phải hỏi riêng từng lần)

- `git push`, force push, merge vào `main`.
- Deploy production, tạo hoặc sửa env, Blob store, cron, domain trên Vercel.
- Mọi lệnh ghi hoặc xoá trên production: SQL, policy, bucket, blob.
- Commit `specs/` hoặc bất cứ thứ gì mô tả lỗ hổng chưa vá.
- In secret hay giá trị env ra màn hình.

Truy vấn chỉ đọc (metadata, log, liệt kê) thì được phép.
