import { ImageResponse } from "next/og";

// Social-share preview card, generated at build time. Next wires it into the
// og:image / twitter:image meta tags automatically.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project Manager — team collaboration platform";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#34d399",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.5px",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#059669",
            }}
          />
          Project Manager
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 700,
            marginTop: 28,
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          <div>Team collaboration,</div>
          <div>done in real time.</div>
        </div>
        <div style={{ fontSize: 32, color: "#a1a1aa", marginTop: 28 }}>
          Kanban · time tracking · roles · live notifications
        </div>
        <div style={{ fontSize: 26, color: "#52525b", marginTop: 48 }}>
          pm.andreisili.com
        </div>
      </div>
    ),
    { ...size }
  );
}
