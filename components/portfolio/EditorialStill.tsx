import Image from "next/image";
import type { PrototypeVisual } from "@/content/types";

export function EditorialStill({
  visual,
  priority = false,
  className = "",
}: {
  visual: PrototypeVisual;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`pf-editorial-still ${className}`.trim()}>
      <Image
        src={visual.src}
        alt={visual.alt}
        width={visual.width}
        height={visual.height}
        priority={priority}
        sizes="(max-width: 760px) 100vw, min(100vw, 1280px)"
      />
      <figcaption>{visual.caption}</figcaption>
    </figure>
  );
}
