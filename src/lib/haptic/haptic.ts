const isTouchDevice =
  typeof window !== "undefined"
    ? window.matchMedia("(pointer: coarse)").matches
    : false

/**
 * Trigger haptic feedback on mobile devices.
 * Uses Vibration API on Android/modern browsers, and iOS checkbox trick on iOS.
 *
 * @param pattern - Vibration duration (ms) or pattern.
 * Custom patterns only work on Android devices. iOS uses fixed feedback.
 * See [Vibration API](https://developer.mozilla.org/docs/Web/API/Vibration_API)
 *
 * @example
 * import { haptic } from "@/lib/haptic"
 *
 * <Button onClick={() => haptic()}>Haptic</Button>
 */
export function haptic(pattern: number | number[] = 50) {
  try {
    if (!isTouchDevice) return

    if (typeof navigator.vibrate === "function" && navigator.vibrate(pattern)) {
      return
    }

    // iOS 17.4+ haptic via <input type="checkbox" switch>
    // Must live in <body> and be rendered (not display:none) for the toggle to fire haptic
    const label = document.createElement("label")
    label.ariaHidden = "true"
    label.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;"

    const input = document.createElement("input")
    input.type = "checkbox"
    input.setAttribute("switch", "")
    label.appendChild(input)

    document.body.appendChild(label)
    label.click()
    setTimeout(() => label.remove(), 100)
  } catch {}
}
