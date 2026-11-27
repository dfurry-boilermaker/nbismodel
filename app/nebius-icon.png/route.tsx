import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// Square PNG for browsers, Apple touch icons and social link previews.
// Nebius mark geometry: https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/nebius.svg
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#DAFF33" }}>
        <svg width="374" height="374" viewBox="0 0 24 24" fill="#052B42" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2.306v16.797s4-.242 4-4.815V2.306h-4zM4 22.001V5.204s-4 .242-4 4.816V22h4z" />
          <path d="M16.318 16.51L11.286 4.94c-.824-1.872-2.168-2.926-4.077-2.926-1.908 0-3.211 1.54-3.211 3.19 0 0 2.405-.333 3.68 2.593l5.036 11.57c.821 1.87 2.168 2.926 4.075 2.926 1.905 0 3.211-1.541 3.211-3.19 0 0-2.406.333-3.682-2.594z" />
        </svg>
      </div>
    ),
    { width: 600, height: 600 }
  );
}
