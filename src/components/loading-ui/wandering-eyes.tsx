import { cn } from "@/lib/utils";

type WanderingEyesProps = React.ComponentProps<"span"> & {
  eyeScale?: number;
  gapScale?: number;
  pupilScale?: number;
  blinkScale?: number;
  travelScale?: number;
  /** Multiplier for eye height relative to width. 1 = circle, >1 = vertical oval/rectangle. */
  eyeHeightScale?: number;
  /** Border radius for the eye element. Pass 9999px for full circle, smaller for rounded rectangle. */
  eyeRadius?: string;
  /** Render the pupil as a rectangle instead of a circle. */
  pupilShape?: "circle" | "rect";
  /** When pupilShape is "rect", height of the pupil as multiple of width. */
  pupilHeightScale?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function WanderingEyes({
  className,
  style,
  eyeScale = 0.62,
  gapScale = 0.09,
  pupilScale = 0.32,
  blinkScale = 0.375,
  travelScale = 0.3125,
  eyeHeightScale = 1,
  eyeRadius = "9999px",
  pupilShape = "circle",
  pupilHeightScale = 1,
  ...props
}: WanderingEyesProps) {
  const safeEyeScale = clamp(eyeScale, 0.28, 0.7);
  const safeGapScale = clamp(gapScale, 0.04, 2);
  const safePupilScale = clamp(pupilScale, 0.12, 0.9);
  const safeBlinkScale = clamp(blinkScale, 0.15, 1);
  const safeTravelScale = clamp(travelScale, 0.08, 0.5);
  const safeEyeHeightScale = clamp(eyeHeightScale, 0.5, 4);
  const eyesStyle = {
    ...style,
    "--loading-ui-wandering-eyes-eye": `${(safeEyeScale * 100).toFixed(2)}cqmin`,
    "--loading-ui-wandering-eyes-eye-h": `${(safeEyeScale * safeEyeHeightScale * 100).toFixed(2)}cqmin`,
    "--loading-ui-wandering-eyes-gap": `${(safeGapScale * 100).toFixed(2)}cqmin`,
    "--loading-ui-wandering-eyes-pupil-scale": `${safePupilScale}`,
    "--loading-ui-wandering-eyes-blink": `${safeBlinkScale}`,
    "--loading-ui-wandering-eyes-travel-scale": `${safeTravelScale}`,
    "--loading-ui-wandering-eyes-radius": eyeRadius,
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        @keyframes loading-ui-wandering-eyes-move {
          0%,
          10% {
            background-position: 0 0;
          }

          13%,
          40% {
            background-position: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale) * -1) 0;
          }

          43%,
          70% {
            background-position: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale)) 0;
          }

          73%,
          90% {
            background-position: 0 calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale));
          }

          93%,
          100% {
            background-position: 0 0;
          }
        }

        @keyframes loading-ui-wandering-eyes-blink {
          0%,
          10%,
          12%,
          20%,
          22%,
          40%,
          42%,
          60%,
          62%,
          70%,
          72%,
          90%,
          92%,
          98%,
          100% {
            height: var(--loading-ui-wandering-eyes-eye-h);
          }

          11%,
          21%,
          41%,
          61%,
          71%,
          91%,
          99% {
            height: calc(var(--loading-ui-wandering-eyes-eye-h) * var(--loading-ui-wandering-eyes-blink));
          }
        }
      `}</style>
      <span
        role="status"
        className={cn(
          "@container-[size] relative inline-flex aspect-9/4 items-center justify-center align-middle [--eye-color:color-mix(in_srgb,currentColor_16%,transparent)] [--pupil-color:currentColor]",
          className,
        )}
        style={eyesStyle}
        {...props}
      >
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center gap-(--loading-ui-wandering-eyes-gap)"
        >
          {Array.from({ length: 2 }, (_, index) => {
            const isRect = pupilShape === "rect";
            const backgroundImage = isRect
              ? "linear-gradient(0deg, var(--pupil-color), var(--pupil-color))"
              : "radial-gradient(circle calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-pupil-scale)), var(--pupil-color) 100%, transparent 0)";
            const backgroundSize = isRect
              ? `calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-pupil-scale)) calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-pupil-scale) * ${pupilHeightScale})`
              : undefined;
            return (
              <span
                key={index}
                className="inline-block"
                style={{
                  width: "var(--loading-ui-wandering-eyes-eye)",
                  height: "var(--loading-ui-wandering-eyes-eye-h)",
                  borderRadius: "var(--loading-ui-wandering-eyes-radius)",
                  backgroundColor: "var(--eye-color)",
                  backgroundImage,
                  backgroundSize,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  boxShadow: "var(--loading-ui-wandering-eyes-frame, none)",
                  animation:
                    "loading-ui-wandering-eyes-move var(--duration, 10s) infinite, loading-ui-wandering-eyes-blink var(--duration, 10s) infinite",
                }}
              />
            );
          })}
        </span>
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

export { WanderingEyes };
