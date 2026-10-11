/* Chữ và dàn nhân vật của phim Rà soát COD (docs/case-motion.md). Mọi nhân vật trừ Vinh và người mua
   mặc đồng phục GHN (ghn.ts). Bưu tá không bị vẽ như tội phạm: phim chỉ nói tiền bị giữ mà hệ thống
   không thấy, AI lọc ra đơn nghi ngờ để đội vận hành xử lý. */

import { caseStudies } from "../../../content/cases.vi";
import { GHN_OUTFIT, ghnLook } from "../ghn";
import type { Look } from "../Person";

export const study = caseStudies.find(c => c.slug === "cod-screening")!;
export const lines = study.motion!.lines;

export const BUYER: Look = { hair: "curly", hairColor: "#2A2420", top: "#C97B9A", bottom: "#3A3F48", skin: "#E9B88F" };
export const SHIPPER: Look = ghnLook(GHN_OUTFIT, "shipper", lines.brand);
export const MANAGER: Look = ghnLook(GHN_OUTFIT, "manager", lines.brand);
export const OPS: Look = ghnLook(GHN_OUTFIT, "ops", lines.brand);
