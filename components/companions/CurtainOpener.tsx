"use client";

import { useEffect } from "react";
import { content } from "@/content/content.vi";
import { openCurtain } from "./gameCurtain";

/** Nhận tấm rèm Chấm đã kéo kín ở trang chủ và kéo nó mở. Vào thẳng /game thì không làm gì. */
export function CurtainOpener() {
  useEffect(() => { openCurtain(content.game.curtain.line).catch(() => {}); }, []);
  return null;
}
