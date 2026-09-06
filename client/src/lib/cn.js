import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design's type scale adds font sizes tailwind-merge has never heard of.
 * Left unregistered it reads `text-kicker` as a text *colour* and silently
 * drops the real colour beside it, so `bg-brand text-ground text-kicker` loses
 * its ground text. Registering them keeps size and colour in separate groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "kicker",
            "meta",
            "ui",
            "body",
            "body-lg",
            "card-title",
            "post-title",
            "page-title",
            "stat",
            "hero",
          ],
        },
      ],
    },
  },
});

/** Join class names, letting later Tailwind utilities win over earlier ones. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
