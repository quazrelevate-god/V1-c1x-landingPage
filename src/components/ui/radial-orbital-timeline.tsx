import { useEffect, useRef, useState, type ComponentType, type MouseEvent, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  centerNode?: ReactNode;
  /** When true, the built-in center mark is not rendered — for callers that supply their own sun. */
  hideCenter?: boolean;
  /** 0..1 reveal ramp. Ring + planets fade/scale in as this rises. Planets are staggered by index. Default 1 = fully revealed. */
  revealProgress?: number;
}

export default function RadialOrbitalTimeline({
  timelineData,
  centerNode,
  hideCenter = false,
  revealProgress = 1,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [radius, setRadius] = useState(120);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  /* Mirror of `rotationAngle` for synchronous reads. A tween needs its starting
     angle at the instant it is kicked off, and setState is async. */
  const rotationRef = useRef(0);
  /* Handle for an in-flight click-to-centre tween, so a second click cancels the
     first instead of two loops fighting over the same value. */
  const spinRaf = useRef(0);

  /** Write both the ref and the state, so reads stay correct between renders. */
  const applyRotation = (v: number) => {
    rotationRef.current = v;
    setRotationAngle(v);
  };

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      /*
       * Orbit radius, trimmed ~5% from the original 120 / 170 / 215.
       *
       * The ring was crowding the labels against the viewport edge on a phone and
       * sitting a touch large against the smaller mark on every breakpoint.
       */
      /* Phones get a 20% wider ring. With the planets trimmed to 40px the old
         radius left the labels crowding both the mark and each other; the cap
         rises with it so a wider phone actually spends the extra room. The
         (w - 170) / 2 term still guards the narrow end, keeping the widest
         label ("MONITOR", ~57px) clear of the viewport edge. */
      const phone = Math.max(88, Math.min(145, (w - 170) / 2)) * 1.2;
      const base = w < 640 ? phone : w < 1024 ? 170 : 215;
      setRadius(Math.round(base * 0.95));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  /*
   * Auto-rotation, rAF-driven and time-based.
   *
   * This used to be a 50ms setInterval stepping 0.18deg, which is only 20 updates
   * a second — visibly steppy on its own, so each planet carried a 700ms CSS
   * transition to smooth it over. That transition is exactly what made the bloom
   * feel like it "slowly assembles by itself" instead of tracking the scroll:
   * scroll set the progress instantly, then CSS spent 700ms easing to it.
   *
   * Driving rotation per-frame off elapsed time removes the need for any
   * transition on the transform, so the bloom can be scroll-exact while the idle
   * rotation stays smooth.
   *
   * It also stays parked until the bloom has finished. Rotating a half-formed
   * ring is what made the formation read as motion-that-happens-to-you rather
   * than motion you are driving.
   */
  const bloomed = revealProgress >= 0.999;
  useEffect(() => {
    if (!autoRotate || !bloomed) return;
    let raf = 0;
    let last = 0;
    const DEG_PER_MS = 0.18 / 50; // unchanged speed: 0.18deg every 50ms
    const tick = (ts: number) => {
      if (last) {
        const dt = ts - last;
        applyRotation((rotationRef.current + dt * DEG_PER_MS) % 360);
      }
      last = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // applyRotation is a stable closure over refs/setState; re-running this on it
    // would restart the loop every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRotate, bloomed]);

  // Stop any in-flight click tween when the component goes away.
  useEffect(() => () => cancelAnimationFrame(spinRaf.current), []);

  const handleContainerClick = (e: MouseEvent) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      // Drop any click-to-centre swing still in flight, or it would keep pulling
      // the ring toward the old target while free rotation resumes.
      cancelAnimationFrame(spinRaf.current);
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getRelatedItems = (itemId: number): number[] =>
    timelineData.find((item) => item.id === itemId)?.relatedIds ?? [];

  /*
   * Swing the ring so the clicked node comes to rest at the top.
   *
   * This used to assign the target angle in one go and rely on each planet's
   * `transition-all duration-700` to make the move look like a rotation. That
   * transition had to go — it was also easing the scroll-driven bloom, which made
   * the formation lag the finger — so the assignment became a hard snap.
   *
   * Tweening the angle here restores the swing without putting a transition back
   * on the transform: the bloom stays scroll-exact, and the click still animates.
   */
  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    if (nodeIndex < 0) return;
    const target = 270 - (nodeIndex / timelineData.length) * 360;

    cancelAnimationFrame(spinRaf.current);
    const start = rotationRef.current;
    // Shortest way round: without this a swing from 350deg to 10deg would travel
    // the long way, 340deg backwards, instead of 20deg forwards.
    const delta = ((((target - start) % 360) + 540) % 360) - 180;

    const DURATION = 700;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      applyRotation((((start + delta * eased) % 360) + 360) % 360);
      if (t < 1) spinRaf.current = requestAnimationFrame(tick);
    };
    spinRaf.current = requestAnimationFrame(tick);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const opening = !prev[id];
      if (opening) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const next: Record<number, boolean> = {};
        getRelatedItems(id).forEach((relId) => (next[relId] = true));
        setPulseEffect(next);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return { [id]: opening };
    });
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian),
      zIndex: Math.round(100 + 50 * Math.cos(radian)),
      /*
       * Depth cue: nodes on the far side of the orbit sit back a little.
       *
       * The floor was 0.45, which on a black background left half the ring close
       * to invisible — and gone entirely on a dimmed screen. Raised to 0.72 so the
       * far side still reads as further away without dropping out.
       */
      opacity: Math.max(0.72, Math.min(1, 0.72 + 0.28 * ((1 + Math.sin(radian)) / 2))),
    };
  };

  const isRelatedToActive = (itemId: number) =>
    activeNodeId ? getRelatedItems(activeNodeId).includes(itemId) : false;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex h-full min-h-[470px] w-full items-center justify-center"
    >
      <div ref={orbitRef} className="relative flex h-full w-full items-center justify-center">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* center mark */}
          {hideCenter ? null : (
            <div className="relative grid h-20 w-20 place-items-center rounded-full border border-accent/40 bg-card/70 backdrop-blur-sm">
              <div className="absolute inset-0 animate-ping rounded-full border border-accent/25" />
              <div className="absolute -inset-6 rounded-full bg-accent/10 blur-2xl" />
              {centerNode}
            </div>
          )}

          {/* orbit ring — fades and scales in with revealProgress.
              Wrapper handles the translate-to-centre; inner element handles the scale.
              Combining both into one transform breaks centring because the percent-translate
              measures the pre-scale box while the scale multiplies from a different origin. */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* The ring only fades — it never scales.
                It used to scale 0.7 -> 1 while the planets travelled 0 -> full
                radius on a different, per-planet staggered curve. The two curves
                disagreed for the whole bloom, so mid-formation the planets sat
                visibly inside the circle instead of on it. Holding the ring at
                its true radius means every planet lands exactly on the line. */}
            <div
              className="rounded-full border border-dashed border-border"
              style={{
                width: radius * 2,
                height: radius * 2,
                opacity: Math.min(1, Math.max(0, revealProgress * 1.4)),
              }}
            />
          </div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = !!expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = !!pulseEffect[item.id];
            const Icon = item.icon;

            // Staggered bloom: tighter spacing so the ring assembles quickly under
            // the finger rather than trailing scroll. Start close together, span each
            // planet's fade briefly, so by revealProgress ~ 0.9 every planet is home.
            const n = timelineData.length;
            const start = (index / n) * 0.6;
            const span = 0.35;
            const bloom = Math.min(1, Math.max(0, (revealProgress - start) / span));
            // Ease out for a settled landing.
            const bloomEased = 1 - Math.pow(1 - bloom, 3);
            // Planets slide out from the sun as they appear — 0 travel at bloom=0,
            // full travel at bloom=1. Combined with the base orbital position this
            // gives the "born from the sun" motion.
            const travelX = position.x * bloomEased;
            const travelY = position.y * bloomEased;
            const restingOpacity = isExpanded ? 1 : position.opacity;
            const finalOpacity = restingOpacity * bloomEased;

            return (
              <div
                key={item.id}
                // No transition on this wrapper: its transform/opacity are driven
                // by scroll during the bloom and must land on the exact frame the
                // scroll asks for. Smoothness of the idle rotation comes from the
                // rAF loop above, not from CSS easing.
                className="absolute left-1/2 top-1/2 cursor-pointer"
                style={{
                  transform: `translate(${travelX}px, ${travelY}px) scale(${0.6 + 0.4 * bloomEased})`,
                  zIndex: isExpanded ? 300 : position.zIndex,
                  opacity: finalOpacity,
                  pointerEvents: bloomEased > 0.95 ? undefined : "none",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute left-0 top-0 h-[3.6rem] w-[3.6rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-md transition-all duration-500 ${
                    isPulsing || isExpanded ? "scale-125 opacity-100" : "opacity-0"
                  }`}
                />
                {/* The disc sits BACK — a near-black fill against the section's
                    black — so the icon reads as the lit element rather than
                    competing with its own container. */}
                <div
                  className={`relative grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition-colors duration-500 ${
                    isExpanded
                      ? "border-accent bg-accent text-accent-foreground"
                      : isRelated
                        ? "border-accent/70 bg-background/85 text-accent"
                        : "border-border/80 bg-background/85 text-foreground"
                  }`}
                >
                  {/* Heavier stroke: at 1.5 the glyphs disappeared on a dim screen. */}
                  <Icon className="h-[1.035rem] w-[1.035rem]" strokeWidth={2.25} />
                </div>
                <div
                  className={`absolute left-0 top-[1.6rem] w-max -translate-x-1/2 whitespace-nowrap font-display text-[0.7rem] font-semibold uppercase tracking-[0.06em] transition-colors duration-500 ${
                    isExpanded ? "text-accent" : "text-foreground"
                  }`}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute left-0 top-12 w-[min(17rem,74vw)] -translate-x-1/2 gap-0 border-accent/30 bg-elevated/95 py-0 text-left shadow-xl backdrop-blur-md">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-accent/50" />
                    <CardHeader className="gap-2 px-5 pt-5">
                      <CardTitle className="font-display text-base leading-snug font-medium tracking-tight text-foreground">
                        {item.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-3">
                      <p className="font-sans text-[0.82rem] leading-relaxed text-secondary-foreground">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>

                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
