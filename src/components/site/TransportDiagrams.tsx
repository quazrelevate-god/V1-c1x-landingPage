/**
 * Thin-line technical diagrams for the Logistics cards.
 * Same visual language as ApproachDiagrams: lime accent line-art, subtle looping motion.
 */

const line = "stroke-border";
const faint = "stroke-border/60";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 220 150"
      fill="none"
      className="h-full w-full text-muted-foreground"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function SeaDiagram() {
  return (
    <Frame>
      {/* horizon + grid */}
      <line x1="14" y1="42" x2="206" y2="42" className={faint} strokeWidth="0.75" strokeDasharray="3 5" />
      <g style={{ animation: "dgm-bob 6s ease-in-out infinite", transformOrigin: "110px 90px" }}>
        {/* hull */}
        <path d="M52 96 L168 96 L156 112 L64 112 Z" className="stroke-accent" strokeWidth="1" />
        {/* deck house */}
        <path d="M138 96 L138 80 L158 80 L158 96" className={line} strokeWidth="0.75" />
        {/* containers */}
        {[0, 1, 2, 3].map((c) => (
          <g key={c}>
            <rect x={60 + c * 19} y="84" width="17" height="12" className={line} strokeWidth="0.75" />
            <rect
              x={60 + c * 19}
              y="74"
              width="17"
              height="10"
              className={c === 1 ? "stroke-accent" : faint}
              strokeWidth="0.75"
              style={{ animation: `dgm-blink 4s ease-in-out ${c * 0.4}s infinite` }}
            />
          </g>
        ))}
        <line x1="52" y1="96" x2="168" y2="96" className={faint} strokeWidth="0.75" />
      </g>
      {/* water lines */}
      {[118, 126, 134].map((y, i) => (
        <line
          key={y}
          x1="10"
          y1={y}
          x2="210"
          y2={y}
          className={i === 0 ? "stroke-accent/50" : faint}
          strokeWidth="0.75"
          strokeDasharray="10 8"
          style={{ animation: `dgm-dash ${5 + i * 2}s linear infinite` }}
        />
      ))}
      <text x="110" y="26" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        PORT TO PORT
      </text>
    </Frame>
  );
}

export function AirDiagram() {
  return (
    <Frame>
      <g style={{ animation: "dgm-float 5s ease-in-out infinite", transformOrigin: "110px 80px" }}>
        {/* fuselage */}
        <path d="M56 82 L150 82 Q168 82 172 76 Q168 70 150 70 L62 70 Q54 72 56 82 Z" className="stroke-accent" strokeWidth="1" />
        {/* tail */}
        <path d="M56 70 L44 50 L54 50 L70 70" className={line} strokeWidth="0.75" />
        {/* wing */}
        <path d="M108 78 L86 104 L100 104 L124 80" className={line} strokeWidth="0.75" />
        <path d="M112 74 L96 56 L108 56 L126 72" className={faint} strokeWidth="0.75" />
        {/* windows */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={82 + i * 14}
            cy="75"
            r="1.4"
            className="fill-accent"
            stroke="none"
            style={{ animation: `dgm-blink 3s ease-in-out ${i * 0.3}s infinite` }}
          />
        ))}
      </g>
      {/* speed lines */}
      {[60, 92, 112].map((y, i) => (
        <line
          key={y}
          x1="8"
          y1={y}
          x2="200"
          y2={y}
          className={i === 1 ? "stroke-accent/45" : faint}
          strokeWidth="0.75"
          strokeDasharray="14 12"
          style={{ animation: `dgm-dash ${3 + i}s linear infinite` }}
        />
      ))}
      <text x="110" y="132" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        TIME CRITICAL
      </text>
    </Frame>
  );
}

export function RoadDiagram() {
  return (
    <Frame>
      <g style={{ animation: "dgm-bob 4s ease-in-out infinite", transformOrigin: "110px 90px" }}>
        {/* trailer */}
        <rect x="52" y="60" width="86" height="42" className="stroke-accent" strokeWidth="1" />
        {[1, 2, 3].map((i) => (
          <line key={i} x1={52 + i * 21} y1="60" x2={52 + i * 21} y2="102" className={faint} strokeWidth="0.75" />
        ))}
        {/* cab */}
        <path d="M138 102 L138 72 L158 72 L172 88 L172 102 Z" className={line} strokeWidth="0.75" />
        <path d="M142 76 L156 76 L164 88 L142 88 Z" className="stroke-accent/60" strokeWidth="0.75" />
        {/* wheels */}
        {[68, 92, 158].map((x) => (
          <circle key={x} cx={x} cy="106" r="6" className={line} strokeWidth="0.9" />
        ))}
        {[68, 92, 158].map((x) => (
          <circle
            key={`h${x}`}
            cx={x}
            cy="106"
            r="2"
            className="fill-accent"
            stroke="none"
            style={{ animation: "dgm-pulse 2.4s ease-in-out infinite", transformOrigin: `${x}px 106px` }}
          />
        ))}
      </g>
      {/* road */}
      <line x1="8" y1="114" x2="212" y2="114" className={faint} strokeWidth="0.75" />
      <line
        x1="8"
        y1="122"
        x2="212"
        y2="122"
        className="stroke-accent/50"
        strokeWidth="0.75"
        strokeDasharray="16 12"
        style={{ animation: "dgm-dash 2.4s linear infinite" }}
      />
      <text x="110" y="34" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        OVERLAND / LAST MILE
      </text>
    </Frame>
  );
}
