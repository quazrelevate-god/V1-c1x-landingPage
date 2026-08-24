import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

export interface PulseMarker {
  id: string;
  label?: string;
  /** [latitude, longitude] */
  location: [number, number];
  delay: number;
  /** label offset in px from the marker dot */
  labelOffset?: [number, number];
}

interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
  initialPhi?: number;
}

const defaultMarkers: PulseMarker[] = [
  { id: "pulse-1", location: [51.51, -0.13], delay: 0 },
  { id: "pulse-2", location: [40.71, -74.01], delay: 0.5 },
];

export function GlobePulse({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
  initialPhi = 0,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let globe: { update: (s: Record<string, number>) => void; destroy: () => void } | null = null;
    let animationId = 0;
    let phi = initialPhi;

    function positionOverlay(currentPhi: number, currentTheta: number) {
      const overlay = overlayRef.current;
      if (!overlay || !canvas) return;
      const size = canvas.offsetWidth;
      const r = size / 2;
      for (const m of markers) {
        const el = overlay.querySelector<HTMLElement>(`[data-marker="${m.id}"]`);
        if (!el) continue;
        const latRad = (m.location[0] * Math.PI) / 180;
        const lonRad = (m.location[1] * Math.PI) / 180;
        // globe space
        const a = lonRad + currentPhi + 1.396;
        const x0 = Math.cos(latRad) * Math.sin(a);
        const y0 = Math.sin(latRad);
        const z0 = Math.cos(latRad) * Math.cos(a);
        // tilt around x-axis by theta
        const y1 = y0 * Math.cos(currentTheta) - z0 * Math.sin(currentTheta);
        const z1 = y0 * Math.sin(currentTheta) + z0 * Math.cos(currentTheta);
        const visible = z1 > 0.06;
        el.style.transform = `translate(-50%, -50%) translate(${r + x0 * r}px, ${r - y1 * r}px)`;
        el.style.opacity = visible ? "1" : "0";
      }
    }

    function init() {
      console.log("[globe] init", canvas?.offsetWidth, !!globe);
      if (!canvas) return;
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: initialPhi,
        theta: 0.2,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.28, 0.3, 0.27],
        markerColor: [0.77, 0.85, 0.18],
        glowColor: [0.16, 0.18, 0.12],
        markers: markers.map((m) => ({ location: m.location, size: 0.035 })),
        opacity: 0.95,
      } as never) as never;

      function animate() {
        if (!isPausedRef.current) phi += speed;
        const p = phi + phiOffsetRef.current + dragOffset.current.phi;
        const t = 0.2 + thetaOffsetRef.current + dragOffset.current.theta;
        globe!.update({ phi: p, theta: t });
        positionOverlay(p, t);
        animationId = requestAnimationFrame(animate);
      }
      animate();
      setTimeout(() => canvas && (canvas.style.opacity = "1"));
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed, initialPhi]);

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <style>{`
        @keyframes cobe-pulse-expand {
          0% { transform: scale(0.3); opacity: 0.75; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="h-full w-full cursor-grab opacity-0 transition-opacity duration-700"
      />
      <div ref={overlayRef} aria-hidden className="pointer-events-none absolute inset-0">
        {markers.map((m) => (
          <div
            key={m.id}
            data-marker={m.id}
            className="absolute top-0 left-0 flex h-8 w-8 items-center justify-center opacity-0 transition-opacity duration-300"
          >
            <span
              className="absolute inset-0 rounded-full border-2 border-accent opacity-0"
              style={{ animation: `cobe-pulse-expand 2.4s ease-out infinite ${m.delay}s` }}
            />
            <span
              className="absolute inset-0 rounded-full border-2 border-accent opacity-0"
              style={{ animation: `cobe-pulse-expand 2.4s ease-out infinite ${m.delay + 0.6}s` }}
            />
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_3px_var(--background),0_0_0_5px_var(--accent)]" />
            {m.label ? (
              <span
                className="absolute font-display text-[0.7rem] tracking-[0.02em] whitespace-nowrap text-foreground"
                style={{
                  transform: `translate(${m.labelOffset?.[0] ?? 18}px, ${m.labelOffset?.[1] ?? 0}px)`,
                }}
              >
                {m.label}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
