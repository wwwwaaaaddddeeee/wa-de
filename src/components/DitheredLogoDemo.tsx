import { useEffect, useState } from "react";
import { DitheredLogo } from "@/components/ui/dithered-logo/DitheredLogo";

const DESKTOP_SIZE = 520;
const MOBILE_SIZE = 320;

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
        color={[255, 40, 60]}
        midColor={[40, 210, 90]}
        accentColor={[40, 110, 255]}
      />
    </div>
  );
}