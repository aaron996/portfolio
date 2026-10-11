/* Chữ và dàn nhân vật của phim GHN Ops Pulse (docs/case-motion.md). */

import { caseStudies } from "../../../content/cases.vi";
import { GHN_OUTFIT, ghnLook } from "../ghn";
import type { Look } from "../Person";

export const study = caseStudies.find(c => c.slug === "kas-shopee-performance")!;
export const lines = study.motion!.lines;

/** Ba người cùng xem một bộ số, khác mức đi sâu: vận hành, quản lý, lãnh đạo — mặc đồng phục GHN. */
export const OPS: Look = ghnLook(GHN_OUTFIT, "ops", lines.brand);
export const MANAGER: Look = ghnLook(GHN_OUTFIT, "manager", lines.brand);
export const LEAD: Look = ghnLook(GHN_OUTFIT, "lead", lines.brand);
