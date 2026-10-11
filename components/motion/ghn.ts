/* Đồng phục GHN cho nhân vật phụ trong các phim GHN (Ops Pulse, Rà soát COD, Tìm kho) — trừ Vinh.
   Màu lấy từ ghn.vn: cam #FF5200, xanh #007ED4. Bốn phương án để Vinh chọn (remotion/GhnCastSheet.tsx);
   phương án đã chọn ghi ở GHN_OUTFIT. Chữ "GHN" trên áo lấy từ content (lines.brand). */

import type { Look } from "./Person";

export const GHN = { orange: "#FF5200", blue: "#007ED4", navy: "#1F3A5F", jeans: "#3E5F8A" };

export type GhnRole = "ops" | "manager" | "lead" | "shipper";

/** Tóc, kính… riêng từng vai — giữ nguyên qua mọi phương án áo. */
const BASE: Record<GhnRole, Look> = {
  ops: { hair: "bob", hairColor: "#3B2A22" },
  manager: { hair: "short", hairColor: "#2A2420", glasses: "square" },
  lead: { hair: "grey" },
  shipper: { hair: "helmet" },
};

export const GHN_OPTIONS: { name: string; looks: (brand: string) => Record<GhnRole, Look> }[] = [
  {
    name: "Polo cam GHN",
    looks: brand => ({
      ops: { top: GHN.orange, collar: "polo", logo: { text: brand, color: "#FFFFFF" }, bottom: GHN.navy },
      manager: { top: GHN.orange, collar: "polo", logo: { text: brand, color: "#FFFFFF" }, bottom: "#3A3F48" },
      lead: { top: GHN.navy, collar: "jacket", inner: GHN.orange, logo: { text: brand, color: GHN.orange }, bottom: GHN.navy },
      shipper: { top: GHN.orange, collar: "polo", logo: { text: brand, color: "#FFFFFF" }, hatColor: GHN.orange, hatLogo: brand, bottom: GHN.jeans },
    }),
  },
  {
    name: "Xanh – cam",
    looks: brand => ({
      ops: { top: GHN.blue, collar: "polo", trim: GHN.orange, logo: { text: brand, color: "#FFFFFF", bg: GHN.orange }, bottom: GHN.navy },
      manager: { top: "#FFFFFF", collar: "shirt", lanyard: GHN.orange, bottom: GHN.navy },
      lead: { top: GHN.navy, collar: "jacket", inner: "#FFFFFF", tie: GHN.orange, logo: { text: brand, color: "#FFFFFF", bg: GHN.orange }, bottom: GHN.navy },
      shipper: { top: GHN.orange, collar: "jacket", inner: GHN.blue, trim: GHN.blue, logo: { text: brand, color: "#FFFFFF" }, hatColor: GHN.orange, hatLogo: brand, bottom: GHN.jeans },
    }),
  },
  {
    name: "Văn phòng trắng, điểm cam",
    looks: brand => ({
      ops: { top: "#FFFFFF", collar: "tee", lanyard: GHN.orange, bottom: GHN.navy },
      manager: { top: "#FFFFFF", collar: "shirt", lanyard: GHN.orange, bottom: "#3A3F48" },
      lead: { top: "#5F6670", collar: "jacket", inner: "#FFFFFF", tie: GHN.orange, logo: { text: brand, color: "#FFFFFF", bg: GHN.orange }, bottom: "#3A3F48" },
      shipper: { top: GHN.orange, collar: "polo", logo: { text: brand, color: "#FFFFFF" }, stripes: "#E9E9E2", hatColor: GHN.orange, hatLogo: brand, bottom: GHN.jeans },
    }),
  },
  {
    name: "Áo khoác GHN",
    looks: brand => ({
      ops: { top: GHN.orange, collar: "jacket", inner: "#FFFFFF", logo: { text: brand, color: "#FFFFFF" }, bottom: GHN.navy },
      manager: { top: GHN.blue, collar: "jacket", inner: "#FFFFFF", logo: { text: brand, color: "#FFFFFF", bg: GHN.orange }, bottom: GHN.navy },
      lead: { top: GHN.navy, collar: "jacket", inner: GHN.orange, logo: { text: brand, color: "#FFFFFF", bg: GHN.orange }, bottom: GHN.navy },
      shipper: { top: GHN.orange, collar: "jacket", inner: GHN.orange, logo: { text: brand, color: "#FFFFFF" }, stripes: "#E9E9E2", hatColor: GHN.orange, hatLogo: brand, bottom: GHN.jeans },
    }),
  },
];

/** Phương án Vinh chọn (2026-10-11): 2 · Xanh – cam. */
export const GHN_OUTFIT = 1;

/** Ghép tóc của vai với áo của phương án. */
export function ghnLook(option: number, role: GhnRole, brand: string): Look {
  return { ...BASE[role], ...GHN_OPTIONS[option].looks(brand)[role] };
}
