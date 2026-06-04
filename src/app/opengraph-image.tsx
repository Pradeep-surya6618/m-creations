import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Maria Creations · Handmade Flowers";
export const size = { width: 1200, height: 630 };
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
          background:
            "linear-gradient(135deg, #ffd6e7 0%, #fff7fa 50%, #ff7fb2 100%)",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 36, color: "#ff4f93", letterSpacing: 16, marginBottom: 24 }}>
          ✿ ✿ ✿
        </div>
        <div
          style={{
            fontSize: 140,
            fontStyle: "italic",
            color: "#ff4f93",
            lineHeight: 1,
          }}
        >
          Maria Creations
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 28,
            color: "#6b3a4d",
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Handmade flowers · Udumalpet
        </div>
      </div>
    ),
    { ...size }
  );
}
