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
}

export default function RadialOrbitalTimeline({ timelineData, centerNode }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [radius, setRadius] = useState(120);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setRadius(w < 640 ? Math.max(88, Math.min(120, (w - 170) / 2)) : w < 1024 ? 170 : 215);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    const t = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.18) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(t);
  }, [autoRotate]);

  const handleContainerClick = (e: MouseEvent) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getRelatedItems = (itemId: number): number[] =>
    timelineData.find((item) => item.id === itemId)?.relatedIds ?? [];

  const centerViewOnNode = (nodeId: number) => {
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    if (nodeIndex < 0) return;
    setRotationAngle(270 - (nodeIndex / timelineData.length) * 360);
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
      opacity: Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2))),
    };
  };

  const isRelatedToActive = (itemId: number) =>
    activeNodeId ? getRelatedItems(activeNodeId).includes(itemId) : false;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="relative flex h-[470px] w-full items-center justify-center overflow-hidden sm:h-[640px] lg:h-[720px]"
    >
      <div ref={orbitRef} className="relative flex h-full w-full items-center justify-center">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* center mark */}
          <div className="relative grid h-20 w-20 place-items-center rounded-full border border-accent/40 bg-card/70 backdrop-blur-sm">
            <div className="absolute inset-0 animate-ping rounded-full border border-accent/25" />
            <div className="absolute -inset-6 rounded-full bg-accent/10 blur-2xl" />
            {centerNode}
          </div>

          {/* orbit ring */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border"
            style={{ width: radius * 2, height: radius * 2 }}
          />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = !!expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = !!pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 cursor-pointer transition-all duration-700"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 300 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-md transition-all duration-500 ${
                    isPulsing || isExpanded ? "scale-125 opacity-100" : "opacity-0"
                  }`}
                />
                <div
                  className={`relative grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition-all duration-500 ${
                    isExpanded
                      ? "border-accent bg-accent text-accent-foreground"
                      : isRelated
                        ? "border-accent/70 bg-card text-accent"
                        : "border-border bg-card text-secondary-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div
                  className={`absolute left-1/2 top-7 w-max -translate-x-1/2 whitespace-nowrap font-display text-[0.72rem] uppercase tracking-[0.02em] transition-colors duration-500 ${
                    isExpanded ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute left-1/2 top-12 w-[min(17rem,74vw)] -translate-x-1/2 gap-0 border-accent/30 bg-elevated/95 py-0 text-left shadow-xl backdrop-blur-md">
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
