import { ImageResponse } from "next/og";

// Served as /apple-icon.png — used by iOS Safari when the user adds the
// app to their Home Screen (the MiniPay use-case this app targets).

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D1B2A",
          borderRadius: 40,
        }}
      >
        {/* Speech bubble body */}
        <div
          style={{
            position: "absolute",
            top: 34,
            left: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 110,
              height: 74,
              background: "#FFFFFF",
              borderRadius: 14,
            }}
          />
          {/* Tail */}
          <div
            style={{
              width: 0,
              height: 0,
              marginLeft: 20,
              borderLeft: "10px solid transparent",
              borderRight: "0px solid transparent",
              borderTop: "22px solid #FFFFFF",
            }}
          />
        </div>

        {/* Coin badge */}
        <div
          style={{
            position: "absolute",
            top: 88,
            left: 94,
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "#0D1B2A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "#17A865",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1,
                fontFamily: "sans-serif",
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
