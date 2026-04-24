import { useEffect, useState } from "react";
import { DitheredLogo } from "@/components/ui/dithered-logo/DitheredLogo";

const DESKTOP_SIZE = 325;
const MOBILE_SIZE = 200;

export default function DitheredLogoDemo() {
  const [size, setSize] = useState(DESKTOP_SIZE);

  useEffect(() => {
    const update = () => setSize(window.innerWidth < 640 ? MOBILE_SIZE : DESKTOP_SIZE);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <DitheredLogo
        size={size}
        scale={0.9}
        invert
        colorWheel={{ cx: 0.5, cy: 0.5, offset: 0.6, s: 0.85, l: 0.6 }}
      />
    </div>
  );
}