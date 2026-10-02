import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Thiệp Mời Buổi Hẹn · Lời Ngỏ Tinh Tế Cho Hai Người";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F9F6F0",
          backgroundImage: "radial-gradient(#E7E5E4 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          padding: "60px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Double Vintage Border */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "1.5px solid #D4AF37",
            borderRadius: "20px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "30px",
            border: "0.75px dashed #9E7D4B",
            borderRadius: "16px",
            display: "flex",
            opacity: 0.6,
          }}
        />

        {/* Wax Seal Icon */}
        <div
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            backgroundColor: "#7A2021",
            border: "3px solid #D4AF37",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
            boxShadow: "0 10px 25px rgba(122, 32, 33, 0.25)",
          }}
        >
          <svg width="42" height="42" viewBox="0 0 32 32">
            <path
              d="M16 4 C16 12 12 16 4 16 C12 16 16 20 16 28 C16 20 20 16 28 16 C20 16 16 12 16 4 Z"
              fill="#F9F6F0"
            />
            <circle cx="16" cy="16" r="2" fill="#D4AF37" />
          </svg>
        </div>

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 24px",
            borderRadius: "999px",
            backgroundColor: "#F2ECE1",
            border: "1px solid #E7E5E4",
            color: "#9E7D4B",
            fontSize: "16px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "20px",
          }}
        >
          A QUIET GATHERING FOR TWO
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: "64px",
            fontStyle: "italic",
            color: "#1C1917",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Thiệp Mời Buổi Hẹn</span>
          <span style={{ color: "#9E7D4B", fontSize: "44px", marginTop: "6px" }}>
            Lời Ngỏ Tinh Tế Dành Cho Hai Người
          </span>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#78716C",
            fontSize: "16px",
            fontFamily: "sans-serif",
            marginTop: "16px",
          }}
        >
          <span>Phong Cách Tạp Chí Cổ Điển</span>
          <span>-</span>
          <span>Riêng Tư Tuyệt Đối</span>
          <span>-</span>
          <span>Cuống Vé Kỷ Niệm Boarding Pass</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
