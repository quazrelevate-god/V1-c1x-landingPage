/**
 * Thin-line technical diagrams for the "Who It's For" cards.
 * Rendered inside a dark plate so the lime line-art stays legible on the light section.
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

export function ProducersDiagram() {
  return (
    <Frame>
      {/* silo */}
      <path d="M62 118 L62 62 Q62 44 80 44 Q98 44 98 62 L98 118 Z" className="stroke-accent" strokeWidth="1" />
      {[72, 86, 100].map((y) => (
        <line key={y} x1="62" y1={y} x2="98" y2={y} className={faint} strokeWidth="0.75" />
      ))}
      {/* grain level fill */}
      <foreignObject x="63" y="63" width="34" height="55">
        <div className="flex h-full w-full items-end">
          <div className="w-full bg-accent/25" style={{ animation: "dgm-fill 5s ease-in-out infinite" }} />
        </div>
      </foreignObject>
      {/* sacks */}
      {([
        [124, 108],
        [152, 108],
        [138, 86],
      ] as Array<[number, number]>).map(([x, y], i) => (
        <g key={i} style={{ animation: `dgm-float ${5 + i}s ease-in-out ${i * 0.4}s infinite`, transformOrigin: `${x}px ${y}px` }}>
          <path d={`M${x - 12} ${y + 10} L${x - 9} ${y - 8} Q${x} ${y - 14} ${x + 9} ${y - 8} L${x + 12} ${y + 10} Z`} className={line} strokeWidth="0.75" />
          <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y - 6} className="stroke-accent/70" strokeWidth="0.75" />
        </g>
      ))}
      {/* ground */}
      <line x1="14" y1="118" x2="206" y2="118" className={faint} strokeWidth="0.75" strokeDasharray="4 4" />
      <text x="110" y="30" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        AT SOURCE
      </text>
    </Frame>
  );
}

export function ExportersDiagram() {
  return (
    <Frame>
      {/* quay */}
      <line x1="14" y1="112" x2="206" y2="112" className={faint} strokeWidth="0.75" />
      {/* crane */}
      <path d="M40 112 L40 46 L150 46" className={line} strokeWidth="0.9" />
      <line x1="40" y1="60" x2="66" y2="46" className={faint} strokeWidth="0.75" />
      <line
        x1="116"
        y1="46"
        x2="116"
        y2="72"
        className="stroke-accent"
        strokeWidth="0.9"
        style={{ animation: "dgm-blink 3.2s ease-in-out infinite" }}
      />
      {/* lifted container */}
      <g style={{ animation: "dgm-float 4.5s ease-in-out infinite", transformOrigin: "116px 80px" }}>
        <rect x="100" y="72" width="32" height="16" className="stroke-accent" strokeWidth="1" />
      </g>
      {/* stacked containers */}
      {[0, 1, 2].map((c) => (
        <rect key={c} x={56 + c * 34} y="96" width="30" height="16" className={faint} strokeWidth="0.75" />
      ))}
      {/* outbound arrow */}
      <line
        x1="150"
        y1="128"
        x2="200"
        y2="128"
        className="stroke-accent/70"
        strokeWidth="0.9"
        strokeDasharray="10 6"
        style={{ animation: "dgm-dash 3s linear infinite" }}
      />
      <path d="M194 123 L202 128 L194 133" className="stroke-accent" strokeWidth="0.9" />
      <text x="110" y="28" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        OUTBOUND
      </text>
    </Frame>
  );
}

export function ImportersDiagram() {
  return (
    <Frame>
      {/* warehouse */}
      <path d="M56 118 L56 66 L110 42 L164 66 L164 118" className="stroke-accent" strokeWidth="1" />
      <rect x="92" y="86" width="36" height="32" className={line} strokeWidth="0.75" />
      {[94, 102, 110].map((y) => (
        <line key={y} x1="92" y1={y} x2="128" y2={y} className={faint} strokeWidth="0.75" />
      ))}
      {/* inbound arrow */}
      <line
        x1="16"
        y1="102"
        x2="52"
        y2="102"
        className="stroke-accent/70"
        strokeWidth="0.9"
        strokeDasharray="8 6"
        style={{ animation: "dgm-dash 2.8s linear infinite" }}
      />
      <path d="M46 97 L54 102 L46 107" className="stroke-accent" strokeWidth="0.9" />
      {/* inbound container */}
      <g style={{ animation: "dgm-float 4s ease-in-out infinite", transformOrigin: "182px 106px" }}>
        <rect x="170" y="96" width="30" height="18" className={line} strokeWidth="0.75" />
        <line x1="180" y1="96" x2="180" y2="114" className={faint} strokeWidth="0.75" />
        <line x1="190" y1="96" x2="190" y2="114" className={faint} strokeWidth="0.75" />
      </g>
      {/* status */}
      <circle
        cx="110"
        cy="64"
        r="3"
        className="fill-accent"
        stroke="none"
        style={{ animation: "dgm-pulse 2.4s ease-in-out infinite", transformOrigin: "110px 64px" }}
      />
      <line x1="14" y1="118" x2="206" y2="118" className={faint} strokeWidth="0.75" strokeDasharray="4 4" />
      <text x="110" y="30" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        INBOUND
      </text>
    </Frame>
  );
}
