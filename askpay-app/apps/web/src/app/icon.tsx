import { ImageResponse } from "next/og";

// Next.js App Router: this file is auto-served as /icon.png (the browser favicon)
// and /apple-icon.png when named apple-icon.tsx
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons

export const runtime = "edge";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D1B2A",
          borderRadius: 110,
        }}
      >
        {/* ── Speech bubble ──────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 72,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {/* Bubble body */}
          <div
            style={{
              width: 310,
              height: 210,
              background: "#FFFFFF",
              borderRadius: 36,
            }}
          />
          {/* Bubble tail */}
          <div
            style={{
              width: 0,
              height: 0,
              marginLeft: 56,
              borderLeft: "28px solid transparent",
              borderRight: "0px solid transparent",
              borderTop: "60px solid #FFFFFF",
            }}
          />
        </div>

        {/* ── Coin badge ─────────────────────────────────────────── */}
        {/* Navy ring for separation */}
        <div
          style={{
            position: "absolute",
            top: 258,
            left: 268,
            width: 176,
            height: 176,
            borderRadius: "50%",
            background: "#0D1B2A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Green coin face */}
          <div
            style={{
              width: 152,
              height: 152,
              borderRadius: "50%",
              background: "#17A865",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Dollar sign */}
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 88,
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: "sans-serif",
                letterSpacing: "-4px",
              }}
            >
              $
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
