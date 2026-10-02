# ✦ Cuộc Hẹn Nhỏ · A Quiet Gathering for Two

> **Thiệp mời & Lời ngỏ hẹn hò phong cách tạp chí cổ điển (Editorial Vintage First-Date Invitation Studio).**  
> Chuẩn bị một lời mời đi date thật tinh tế, ấm áp và có gu. Thay vì hỏi han lòng vòng *"khi nào rảnh, ăn gì cũng được"*, hãy cùng đối phương chọn vài chi tiết nhỏ để buổi hẹn đầu tiên diễn ra thoải mái và trọn vẹn nhất.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cuochennho.vercel.app-9E7D4B?style=for-the-badge&logo=vercel)](https://cuochennho.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Điểm Nhấn Cốt Lõi (Key Features)

* **🎨 Giao diện Editorial Vintage & 4 Bảng Màu Báo Chí**: Tông màu Alabaster giấy lụa ấm, Midnight ánh kim, Sage Linen mộc mạc và Burgundy nồng nàn. Hỗ trợ tự do phối màu riêng hoặc tải ảnh kỷ niệm làm nền mờ.
* **💌 Trải nghiệm Xúc giác Đa giác quan (Tactile Digital)**: Hiệu ứng mở nắp phong bì thư tay, âm thanh sột soạt của giấy lụa (`Web Audio API`), tiếng đóng dấu sáp đỏ trầm đanh khi niêm phong.
* **☕ Bộ Câu Hỏi Hẹn Hò Tinh Tế, Không Gượng Gạo**:
  * *Khung giờ lý tưởng*: Hoàng hôn buông 16:30 hay Đèn phố lung linh 19:30.
  * *Không gian mong muốn*: Ban công gió, quán cà phê nhỏ yên tĩnh hay dạo bước tiệm sách & phòng tranh.
  * *Gu đồ uống & Món cần né*: Tự do chọn tag sở thích, ghi chú dị ứng hoặc những điều làm đối phương e ngại.
  * *Thư tay bí mật*: Vài dòng tâm sự gửi riêng cho người ấy.
* **🎟️ Cuống Vé Kỷ Niệm Boarding Pass**: Chiếc vé hẹn độc bản có mã vạch, dấu sáp niêm phong và câu chốt lịch ga-lăng: *"Lịch trình đã xác nhận. Mọi khâu sắp xếp còn lại, để mình lo"*.
* **💬 Phản hồi 1 Chạm qua Zalo / iMessage**: Người nhận mở thiệp, chọn xong là có thể gửi ngay kết quả và tấm vé về tin nhắn cho bạn chỉ với 1 nút bấm (hoặc lưu ảnh chất lượng cao vào album máy).
* **🔒 Riêng Tư & Zero-Friction**: Không cần đăng nhập tài khoản, không theo dõi thông tin cá nhân. Mã QR code và link rút gọn siêu ngắn, quét nhạy trong 0.2 giây.
* **🖼️ Open Graph & PWA**: Card xem trước sang trọng khi dán link vào Zalo/Messenger; hỗ trợ cài đặt Add to Home Screen trên iPhone/Android.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Compiler)
* **UI & Thư viện**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
* **Typography**: Cormorant Garamond (Serif), Be Vietnam Pro (Sans), Space Mono (Monospace)
* **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security, Cloud Storage Bucket)
* **Utilities**: `canvas-confetti`, `modern-screenshot`, `qrcode`, `lz-string`
* **Triển khai (Deployment)**: [Vercel](https://vercel.com/) (Edge Network & Serverless)

---

## 🚀 Cài Đặt & Chạy Môi Trường Cục Bộ (Local Setup)

### 1. Clone repository
```bash
git clone https://github.com/takeisan24/invitation-studio.git
cd invitation-studio
```

### 2. Cài đặt thư viện dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` từ mẫu `.env.example`:
```bash
cp .env.example .env.local
```

Điền các thông tin kết nối Supabase của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Thiết lập Supabase Database & Storage
Chạy câu lệnh SQL sau trong **SQL Editor** trên Supabase Dashboard:

```sql
-- Tạo bảng lưu trữ thiệp mời
CREATE TABLE IF NOT EXISTS public.invitations (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kích hoạt Row-Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc & tạo thiệp công khai không cần đăng nhập
CREATE POLICY "Allow public read invitations" 
ON public.invitations FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert invitations" 
ON public.invitations FOR INSERT TO anon, authenticated WITH CHECK (true);
```

Tạo một Storage Bucket tên là `invitation-backgrounds` (chế độ **Public**) để người dùng tải ảnh nền.

### 5. Khởi động môi trường dev
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm.

---

## 📦 Triển Khai Lên Vercel (Production Deployment)

1. Đẩy code lên GitHub repository của bạn.
2. Đăng nhập [vercel.com](https://vercel.com) và bấm **Import** dự án.
3. Trong mục **Environment Variables**, thêm:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_APP_URL` (ví dụ: `https://cuochennho.vercel.app`)
4. Bấm **Deploy**.

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép [MIT License](LICENSE). Tự do sử dụng, chỉnh sửa và đóng góp cho cộng đồng.

Tạo bởi sự chu đáo dành cho những buổi hẹn đầu chân thành ✦
