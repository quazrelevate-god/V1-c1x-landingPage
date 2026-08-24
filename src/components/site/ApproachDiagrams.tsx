/**
 * Thin-line technical diagrams for the Approach cards.
 * Stroke colours use currentColor / semantic tokens; lime is reserved for accents.
 */

const line = "stroke-border";
const faint = "stroke-border/60";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 220 150"
      fill="none"
      className="h-[150px] w-full text-muted-foreground sm:h-[190px]"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* Isometric grid plate helper */
function Plate({ y, opacity = 1 }: { y: number; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <path
        d={`M110 ${y - 26} L166 ${y} L110 ${y + 26} L54 ${y} Z`}
        className={faint}
        strokeWidth="0.75"
      />
    </g>
  );
}

export function MatchingDiagram() {
  const left = [30, 60, 90, 120];
  const right = [40, 70, 100, 130];
  return (
    <Frame>
      {left.map((y, i) => (
        <g key={`l${i}`}>
          <rect x="18" y={y - 7} width="34" height="14" className={line} strokeWidth="0.75" />
          <circle cx="52" cy={y} r="2" className="fill-muted-foreground/60" stroke="none" />
        </g>
      ))}
      {right.map((y, i) => (
        <g key={`r${i}`}>
          <rect x="168" y={y - 7} width="34" height="14" className={line} strokeWidth="0.75" />
          <circle cx="168" cy={y} r="2" className="fill-muted-foreground/60" stroke="none" />
        </g>
      ))}
      {left.map((y, i) => (
        <path
          key={`c${i}`}
          d={`M52 ${y} C 95 ${y}, 125 ${right[i]}, 168 ${right[i]}`}
          className={i === 1 ? "stroke-accent" : faint}
          strokeWidth={i === 1 ? "1" : "0.75"}
          strokeDasharray="4 4"
          style={{ animation: `dgm-dash ${6 + i}s linear infinite` }}
        />
      ))}
      <circle
        cx="110"
        cy="65"
        r="4"
        className="fill-accent"
        stroke="none"
        style={{ animation: "dgm-pulse 2.4s ease-in-out infinite", transformOrigin: "110px 65px" }}
      />
      <text x="110" y="20" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        MATCH
      </text>
    </Frame>
  );
}

export function VerifyDiagram() {
  return (
    <Frame>
      <Plate y={112} opacity={0.5} />
      <Plate y={92} opacity={0.7} />
      <Plate y={72} />
      <path d="M110 46 L146 66 L110 86 L74 66 Z" className="stroke-accent/70" strokeWidth="0.9" />
      <path
        d="M99 66 L107 73 L122 59"
        className="stroke-accent"
        strokeWidth="1.4"
        strokeDasharray="40"
        style={{ animation: "dgm-draw 3.4s ease-in-out infinite" }}
      />
      <line x1="54" y1="34" x2="166" y2="34" className="stroke-accent/60" strokeWidth="0.75"
        style={{ animation: "dgm-sweep 3.4s ease-in-out infinite" }} />
      <line x1="110" y1="86" x2="110" y2="126" className={faint} strokeWidth="0.75" strokeDasharray="3 3" />
      <text x="110" y="24" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        KYC / KYB
      </text>
    </Frame>
  );
}

export function AutonomousDiagram() {
  const nodes = [
    [110, 30],
    [170, 60],
    [170, 100],
    [110, 130],
    [50, 100],
    [50, 60],
  ] as const;
  return (
    <Frame>
      <path
        d="M110 30 L170 60 L170 100 L110 130 L50 100 L50 60 Z"
        className={faint}
        strokeWidth="0.75"
      />
      <path
        d="M110 30 L170 60 L170 100 L110 130 L50 100 L50 60 Z"
        className="stroke-accent"
        strokeWidth="1"
        strokeDasharray="10 250"
        style={{ animation: "dgm-dash 4s linear infinite" }}
      />
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 4} y={y - 4} width="8" height="8" className={line} strokeWidth="0.75" />
          <rect
            x={x - 2}
            y={y - 2}
            width="4"
            height="4"
            className="fill-accent"
            stroke="none"
            style={{ animation: `dgm-blink 3s ease-in-out ${i * 0.35}s infinite` }}
          />
        </g>
      ))}
      <g style={{ animation: "dgm-float 5s ease-in-out infinite", transformOrigin: "110px 80px" }}>
        <path d="M110 66 L128 80 L110 94 L92 80 Z" className="stroke-accent/70" strokeWidth="0.9" />
      </g>
      <text x="110" y="18" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        AUTONOMOUS LOOP
      </text>
    </Frame>
  );
}

export function SettlementDiagram() {
  return (
    <Frame>
      <path d="M20 110 L110 110 L110 40 L200 40" className={faint} strokeWidth="0.75" />
      <path d="M20 110 L110 110 L110 80 L200 80" className={faint} strokeWidth="0.75" />
      <path
        d="M20 110 L110 110 L110 40 L200 40"
        className="stroke-accent"
        strokeWidth="1"
        strokeDasharray="8 240"
        style={{ animation: "dgm-dash 3.6s linear infinite" }}
      />
      {[
        [20, 110],
        [110, 110],
        [200, 40],
        [200, 80],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" className={line} strokeWidth="0.75" />
      ))}
      <circle
        cx="110"
        cy="110"
        r="7"
        className="stroke-accent/70"
        strokeWidth="0.8"
        style={{ animation: "dgm-pulse 2.6s ease-in-out infinite", transformOrigin: "110px 110px" }}
      />
      <text x="110" y="130" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        ROUTE
      </text>
      <text x="196" y="32" textAnchor="end" className="fill-muted-foreground/70 font-sans" fontSize="6">
        SETTLE
      </text>
    </Frame>
  );
}

export function EscrowDiagram() {
  return (
    <Frame>
      <path d="M110 34 L168 68 L168 108 L110 132 L52 108 L52 68 Z" className={faint} strokeWidth="0.75" />
      <rect x="88" y="66" width="44" height="34" className={line} strokeWidth="0.75" />
      <path d="M96 66 v-8 a14 14 0 0 1 28 0 v8" className="stroke-accent/80" strokeWidth="1" />
      <foreignObject x="88" y="66" width="44" height="34">
        <div className="flex h-full w-full items-end">
          <div
            className="w-full bg-accent/25"
            style={{ animation: "dgm-fill 4s ease-in-out infinite" }}
          />
        </div>
      </foreignObject>
      <circle
        cx="110"
        cy="83"
        r="3"
        className="fill-accent"
        stroke="none"
        style={{ animation: "dgm-pulse 2.2s ease-in-out infinite", transformOrigin: "110px 83px" }}
      />
      <line x1="52" y1="88" x2="88" y2="88" className={faint} strokeWidth="0.75" strokeDasharray="3 3" />
      <line x1="132" y1="88" x2="168" y2="88" className={faint} strokeWidth="0.75" strokeDasharray="3 3" />
      <text x="110" y="24" textAnchor="middle" className="fill-muted-foreground/70 font-sans" fontSize="6">
        FUNDS HELD
      </text>
    </Frame>
  );
}
