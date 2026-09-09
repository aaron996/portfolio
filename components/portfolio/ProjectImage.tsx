"use client";
import { PortfolioIcon } from "./PortfolioIcon";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { PrototypeMedia } from "@/content/types";
type Labels = { demo: string; enlarge: string; closeImage: string; imageViewer: string };
export function ProjectImage({ media, labels, priority = false }: { media: PrototypeMedia; labels: Labels; priority?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const previousOverflow = useRef<string | null>(null);
  const unlock = () => {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  };
  useEffect(() => () => unlock(), []);
  const picture = (large: boolean) => {
    const crop = media.crop;
    return <div className="pf-image-frame" style={{ aspectRatio: crop ? `${crop.width}/${crop.height}` : `${media.width}/${media.height}` }}>
      <Image src={media.src} alt={media.alt} width={media.width} height={media.height}
        priority={!large && priority} sizes={large ? "1600px" : "(max-width: 760px) 100vw, 70vw"}
        style={crop ? { position: "absolute", maxWidth: "none", width: `${media.width / crop.width * 100}%`, left: `${-crop.left / crop.width * 100}%`, top: `${-crop.top / crop.height * 100}%` } : undefined} />
    </div>;
  };
  return <figure className="pf-figure">
    <button ref={trigger} className="pf-image-button" onClick={() => {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setIsOpen(true);
      dialog.current?.showModal();
    }} aria-label={`${labels.enlarge}: ${media.caption}`}>
      {picture(false)}<span className="pf-image-action">{labels.enlarge}<PortfolioIcon /></span>
    </button>
    <figcaption><span>{media.caption}</span><span className="pf-demo">{labels.demo}</span></figcaption>
    <dialog ref={dialog} className="pf-image-dialog" aria-labelledby={titleId} onClose={() => { setIsOpen(false); unlock(); trigger.current?.focus(); }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="pf-dialog-bar"><p id={titleId}>{labels.imageViewer}</p><button autoFocus className="pf-button" onClick={() => dialog.current?.close()}>{labels.closeImage}<PortfolioIcon name="close" /></button></div>
      <div className="pf-image-scroll">{isOpen && picture(true)}</div><p className="pf-dialog-caption">{media.caption} <span>{labels.demo}</span></p>
    </dialog>
  </figure>;
}
