const PIXELS: Record<string, string[]> = {
  m: ["00000", "11011", "10101", "10101", "10101", "10101", "10101"],
  o: ["00000", "01110", "10001", "10001", "10001", "10001", "01110"],
  d: ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
  e: ["00000", "01110", "10001", "11111", "10000", "10000", "01111"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
};

export function PixelWord() {
  return (
    <svg className="pixel-word" viewBox="0 0 29 7" role="img" aria-label="model" shapeRendering="crispEdges">
      {"model".split("").flatMap((letter, i) => PIXELS[letter].flatMap((row, y) => row.split("").map((pixel, x) => pixel === "1" ? <rect key={`${i}-${x}-${y}`} x={i * 6 + x} y={y} width="1" height="1" fill="currentColor" /> : null)))}
    </svg>
  );
}

export function Orbit() {
  return (
    <svg className="hero-orbit" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth=".8" aria-hidden="true">
      <circle cx="40" cy="40" r="31" /><ellipse cx="40" cy="40" rx="13" ry="31" /><ellipse cx="40" cy="40" rx="25" ry="31" /><ellipse cx="40" cy="40" rx="31" ry="12" /><path d="M9 40h62M40 9v62" />
    </svg>
  );
}

export function ResearchArt({ variant, figure }: { variant: "orbit" | "wave"; figure: string }) {
  return (
    <div className="art-frame" aria-hidden="true">
      <div className="art-toolbar"><span>▧</span><span>[ FIG. {figure} ]</span><span>⊞</span></div>
      <svg viewBox="0 0 320 240" className="wire-art" fill="none">
        <defs><pattern id={`dots-${variant}`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r=".65" fill="#395365" /></pattern></defs>
        <rect width="320" height="240" fill={`url(#dots-${variant})`} />
        <g stroke="#9aafc1" strokeWidth=".65" opacity=".8">
          {variant === "orbit" ? Array.from({ length: 23 }, (_, i) => (
            <ellipse key={i} cx="160" cy="120" rx={48 + i * 1.9} ry={85 - i * 2.7} transform={`rotate(${i * 8} 160 120)`} />
          )) : Array.from({ length: 24 }, (_, i) => (
            <path key={i} d={`M-20 ${60 + i * 5.5} C70 ${-80 + i * 9} 130 ${330 - i * 6} 190 ${165 - i * 4} S280 ${-70 + i * 8} 350 ${30 + i * 9}`} />
          ))}
        </g>
        <g fill="#f4ca83"><rect x="155" y="115" width="10" height="10" /><rect x="158" y="104" width="4" height="32" /><rect x="144" y="118" width="32" height="4" /></g>
        <text x="12" y="224" fontSize="7" fill="#91a6b9" fontFamily="monospace">{variant === "orbit" ? "NBIS / MARKET SIGNAL" : "FCFF / COMPANY CASE"}</text>
      </svg>
    </div>
  );
}
