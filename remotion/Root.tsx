import { useState } from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { InterdistFilm, INTERDIST_FILM_FRAMES } from "../components/motion/interdist/InterdistFilm";
import { InterdistOpener, INTERDIST_OPENER_FRAMES } from "../components/motion/interdist/InterdistOpener";
import { OpsPulseFilm, OPSPULSE_FILM_FRAMES } from "../components/motion/opspulse/OpsPulseFilm";
import { CodFilm, COD_FILM_FRAMES } from "../components/motion/cod/CodFilm";
import { WarehouseFilm, WAREHOUSE_FILM_FRAMES } from "../components/motion/warehouse/WarehouseFilm";
import { ShopeeFilm, SHOPEE_FILM_FRAMES } from "../components/motion/shopee/ShopeeFilm";
import { FPS, H, W } from "../components/motion/paper";
import { VinhSheet } from "./VinhSheet";
import { GhnCastSheet } from "./GhnCastSheet";

/* Trên site font đến từ next/font (biến --hero-grotesk/--hero-mono); khi render bằng CLI
   thì tự nạp cùng hai font từ Google Fonts và chờ chúng sẵn sàng. */
const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Space+Grotesk:wght@500;700&display=block";

function useFonts() {
  useState(() => {
    const handle = delayRender("fonts");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS;
    link.onload = () => Promise.all([
      document.fonts.load("700 20px 'Space Grotesk'", "Vùng ỏ"),
      document.fonts.load("500 16px 'IBM Plex Mono'", "Hạn"),
    ]).finally(() => continueRender(handle));
    link.onerror = () => continueRender(handle);
    document.head.appendChild(link);
    return handle;
  });
}

export function Root() {
  useFonts();
  return <>
    <Composition id="Interdist" component={InterdistFilm} durationInFrames={INTERDIST_FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="OpsPulse" component={OpsPulseFilm} durationInFrames={OPSPULSE_FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Cod" component={CodFilm} durationInFrames={COD_FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Warehouse" component={WarehouseFilm} durationInFrames={WAREHOUSE_FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Shopee" component={ShopeeFilm} durationInFrames={SHOPEE_FILM_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="InterdistOpener" component={InterdistOpener} durationInFrames={INTERDIST_OPENER_FRAMES} fps={FPS} width={W} height={H} />
    {[0, 1, 2, 3].map(k => <Composition key={k} id={`GhnCast${k + 1}`} component={GhnCastSheet} defaultProps={{ option: k }} durationInFrames={1} fps={FPS} width={W} height={H} />)}
    <Composition id="VinhSheet" component={VinhSheet} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>;
}
