import { Gravity, MatterBody } from "@/components/ui/gravity";

export default function GravityDemo() {
  return (
    <div className="w-full h-screen relative">
      <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full">
        <MatterBody x="20%" y="10%" matterBodyOptions={{ friction: 0.5, restitution: 0.4 }}>
          <div className="px-6 py-3 rounded-full bg-black text-white text-2xl font-medium">
            hello
          </div>
        </MatterBody>
        <MatterBody x="50%" y="15%" matterBodyOptions={{ friction: 0.5, restitution: 0.6 }}>
          <div className="px-6 py-3 rounded-full bg-red-500 text-white text-2xl font-medium">
            wade
          </div>
        </MatterBody>
        <MatterBody x="75%" y="5%" matterBodyOptions={{ friction: 0.5, restitution: 0.5 }}>
          <div className="px-6 py-3 rounded-full bg-blue-600 text-white text-2xl font-medium">
            here
          </div>
        </MatterBody>
        <MatterBody x="35%" y="25%" bodyType="circle" matterBodyOptions={{ friction: 0.3, restitution: 0.8 }}>
          <div className="w-20 h-20 rounded-full bg-yellow-400" />
        </MatterBody>
        <MatterBody x="65%" y="30%" bodyType="circle" matterBodyOptions={{ friction: 0.3, restitution: 0.8 }}>
          <div className="w-16 h-16 rounded-full bg-green-500" />
        </MatterBody>
      </Gravity>
    </div>
  );
}
