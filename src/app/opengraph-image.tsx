import { ImageResponse } from "next/og";

/**
 * Default social card. Uses the same ink ground and thread motif as the site, so
 * a shared link is recognisable before the reader arrives. Individual pages can
 * override this with their own OG image from the CMS.
 */
export const runtime = "nodejs";
export const alt = "One Thread in the Fabric of Freedom, a book by Peter Douet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10192b",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 10,
            background: "#a32b33",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#a7b0c1" }}>
          Edmond Kelly
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.05,
              color: "#eeece5",
              maxWidth: 900,
            }}
          >
            One Thread in the Fabric of Freedom
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#d9736c" }}>
            The true story of Reverend Edmond Kelly
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#a7b0c1" }}>
          A book by Peter Douet
        </div>
      </div>
    ),
    size,
  );
}
