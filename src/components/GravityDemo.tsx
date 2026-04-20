import { Gravity, MatterBody } from "@/components/ui/gravity";
import { useEffect, useState } from "react";

const SCALE_DESKTOP = 5.25;
const SCALE_MOBILE = 3.5;

const letters = [
  { src: "/letters/w.svg", w: 59, h: 39, x: "15%", y: "0%", angle: -8 },
  { src: "/letters/a.svg", w: 38, h: 47, x: "32%", y: "10%", angle: 4 },
  { src: "/letters/dash.svg", w: 26, h: 22, x: "50%", y: "5%", angle: -2 },
  { src: "/letters/d.svg", w: 40, h: 56, x: "68%", y: "12%", angle: 6 },
  { src: "/letters/e.svg", w: 37, h: 45, x: "85%", y: "0%", angle: -5 },
];

export default function GravityDemo() {
  const [scale, setScale] = useState(SCALE_DESKTOP);

  useEffect(() => {
    const update = () => setScale(window.innerWidth < 640 ? SCALE_MOBILE : SCALE_DESKTOP);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
        {letters.map((l) => {
          const w = Math.round(l.w * scale);
          const h = Math.round(l.h * scale);
          return (
            <MatterBody
              key={l.src}
              x={l.x}
              y={l.y}
              angle={l.angle}
              matterBodyOptions={{
                friction: 0.4,
                frictionAir: 0.025,
                restitution: 0.35,
                density: 0.004,
              }}
            >
              <div style={{ width: `${w}px`, height: `${h}px` }}>
                <img
                  src={l.src}
                  alt=""
                  width={w}
                  height={h}
                  draggable={false}
                  className="w-full h-full select-none"
                />
              </div>
            </MatterBody>
          );
        })}
      </Gravity>
    </div>
  );
}
