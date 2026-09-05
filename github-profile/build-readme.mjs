#!/usr/bin/env node
/**
 * Sinh github-profile/repo/README.md — profile README của aaron996/aaron996.
 *
 * Vì sao sinh bằng script chứ không gõ tay: nội dung gốc nằm ở content/content.vi.ts
 * (23 quyết định, 5 case, mọi con số kèm `method` và cờ `verified`). Chép tay từng đó
 * chữ sang markdown là chép sai — và sai ở đây nghĩa là con số trên profile lệch với
 * con số trên site. Script đọc thẳng file gốc nên hai bên không thể lệch.
 *
 *   node github-profile/build-readme.mjs
 *
 * Chạy lại mỗi khi sửa content.vi.ts. README sinh ra là file được commit; repo profile
 * KHÔNG cần content.vi.ts — đó là chủ ý, trang GitHub phải đứng độc lập.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = path.join(HERE, "repo", "README.md");

/* Ảnh trỏ về CHÍNH repo profile, không phải repo portfolio — đây là điểm mấu chốt:
   trang github.com/aaron996 phải tự chứa, không phụ thuộc repo nào khác. */
const A = "https://raw.githubusercontent.com/aaron996/aaron996/main/assets";
const CV = "https://github.com/aaron996/aaron996/blob/main/assets/cv.pdf";

/* ── đọc content.vi.ts ───────────────────────────────────────────────────── */
function loadContent() {
  const src = fs.readFileSync(path.join(ROOT, "content", "content.vi.ts"), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  // content.vi.ts chỉ import type từ ./types (bị xoá khi transpile), nên require rỗng là đủ
  new Function("exports", "require", "module", js)(mod.exports, () => ({}), mod);
  return mod.exports.content;
}

/* ── chú thích ngắn dưới mỗi ảnh, khoá theo media.id ─────────────────────── */
const CAPTIONS = {
  "hero-shot": "Dashboard KPI: tiến độ target, xu hướng, chi tiết theo vùng và kênh",
  "import-flow": "Xem trước batch replace trước khi ghi đè",
  "target-preview": "Điều chỉnh target theo ngày, có so sánh trước/sau",
  "matrix-overview": "Ma trận ontime theo miền và vùng, kèm ngưỡng target",
  "hub-drill": "Mở một vùng xuống từng hub, copy bảng thành ảnh",
  "insight": "Tab Insight — ghi rõ đây là tương quan, chưa phải nhân quả",
  "access-log": "Nhật ký truy cập và phân quyền theo allowlist",
  "kas-monitor": "Giám sát sản lượng, dự báo và năng lực theo tỉnh",
};

/* Hai case không có ảnh chụp (rule engine và kết quả 4 năm thì không có màn hình nào
   để chụp). Thay bằng hình tự dựng — xem github-profile/repo/src/. */
const FALLBACK_FIGURE = {
  "sla-attribution": {
    file: "case-sla-flow.png",
    alt:
      "Đường đi của rule engine: 01 log ra/vào kho (quét trùng, quét thiếu, thứ tự không " +
      "chuẩn) → 02 gom episode, chuẩn hoá event trước khi suy luận → 03 chạy 4 quy tắc, " +
      "vét cạn mọi đơn không lọc theo nhóm khiếu nại → 04 thứ tự ưu tiên, chạy lại luôn ra " +
      "cùng kết quả → kết quả: đúng một kho, 1 dòng mỗi đơn kèm số ngày tồn và số quy tắc " +
      "cùng vi phạm.",
  },
  "shopee-3pl-performance": {
    file: "case-3pl-uplift.png",
    alt:
      "Pickup on-time của Viettel Post đi từ 90.1% năm 2021 lên 97.5% năm 2025, theo dõi " +
      "trong 4 năm, Shopee và đối tác cùng xác nhận. Thang đo từ 88% đến 100%.",
  },
};

/* ── helper ──────────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/&/g, "&amp;");
const img = (src, alt) => `<img src="${src}" alt="${esc(alt)}" width="100%">`;
const badge = (v) => (v ? "`✓ đã xác thực`" : "`≈ ước tính`");

/** 1 ảnh → full width. Lẻ → ảnh đầu full rồi ghép đôi. Chẵn → ghép đôi hết. */
function gallery(media) {
  if (!media.length) return "";
  const out = [];
  let rest = media;
  if (media.length === 1 || media.length % 2 === 1) {
    const first = rest[0];
    rest = rest.slice(1);
    out.push(img(`${A}${first.src}`, first.alt));
    if (CAPTIONS[first.id]) out.push(`<sub>${CAPTIONS[first.id]}</sub>`);
    out.push("");
  }
  if (rest.length) {
    const rows = [];
    for (let i = 0; i < rest.length; i += 2) rows.push(rest.slice(i, i + 2));
    const body = rows
      .map((pair) => {
        const cells = pair
          .map((m) => `<td width="50%">${img(`${A}${m.src}`, m.alt)}</td>`)
          .join("\n");
        const caps = pair.map((m) => `<td><sub>${CAPTIONS[m.id] ?? ""}</sub></td>`).join("\n");
        return `<tr>\n${cells}\n</tr>\n<tr>\n${caps}\n</tr>`;
      })
      .join("\n");
    out.push(`<table>\n${body}\n</table>`);
  }
  return out.join("\n");
}

function caseBlock(cs, n) {
  const L = [];
  const num = String(n).padStart(2, "0");
  L.push(`### ${num} · ${cs.title}`, "");

  const head = [`**${cs.client}**`, cs.scopeLabel, cs.period];
  if (cs.clientNote) head.push(cs.clientNote);
  L.push(head.join(" · "), "");
  L.push(`> ${cs.proves}`, "");
  L.push(cs.oneLiner, "");
  L.push(`**${cs.keyResult.value}** — ${cs.keyResult.label} ${badge(cs.keyResult.verified)}`, "");

  const media = cs.media ?? [];
  if (media.length) {
    L.push(gallery(media), "");
  } else if (FALLBACK_FIGURE[cs.slug]) {
    const f = FALLBACK_FIGURE[cs.slug];
    L.push(img(`${A}/${f.file}`, f.alt), "");
  }

  L.push("<details>", "<summary><b>Bối cảnh, các quyết định, kết quả và cách tính</b></summary>", "");

  L.push("#### Bối cảnh", "");
  cs.context.forEach((c) => L.push(`- ${c}`));
  L.push("");

  L.push(`#### ${cs.decisions.length} quyết định đáng kể`, "");
  cs.decisions.forEach((d, i) => {
    L.push(`**${i + 1}. ${d.problem}**`, "");
    L.push(`*Vì sao cách hiển nhiên lại sai:* ${d.why}`, "");
    L.push(`*Quyết định:* ${d.decision}`, "");
    L.push(`\`${d.term}\``, "");
  });

  L.push("#### Phần tôi làm", "");
  cs.ownership.owned.forEach((o) => L.push(`- ${o}`));
  L.push("");
  if (cs.ownership.notOwned?.length) {
    L.push("#### Không thuộc phần tôi", "");
    cs.ownership.notOwned.forEach((o) => L.push(`- ${o}`));
    L.push("");
  }

  L.push("#### Kết quả — và con số đó được tính ra sao", "");
  L.push("| Chỉ số | Giá trị | Cách tính |", "|---|---|---|");
  cs.results.forEach((r) => {
    L.push(`| ${r.label} | **${r.value}** ${badge(r.verified)} | ${r.method} |`);
  });
  L.push("");

  if (cs.reflection?.length) {
    L.push("#### Nhìn lại", "");
    cs.reflection.forEach((r) => L.push(`> ${r}`, ">"));
    L.pop();
    L.push("");
  }

  L.push("</details>", "");
  L.push(cs.stack.flatMap((g) => g.items).map((i) => `\`${i}\``).join(" "), "");
  L.push("<br>", "");
  return L.join("\n");
}

/* ── dựng README ─────────────────────────────────────────────────────────── */
const c = loadContent();
const P = [];

P.push(
  img(
    `${A}/banner.png`,
    `${c.meta.name} — ${c.meta.roleLabel}. Define the metric. Automate the system. ` +
      "Solve the problem. Sáu năm vận hành logistics và thương mại điện tử · " +
      "Shopee · GHN · J&T Express · Maersk.",
  ),
  "",
);

P.push(
  "<p align=\"center\">",
  `  <a href="${CV}"><img alt="CV PDF" src="https://img.shields.io/badge/CV%20PDF-D4F236?style=for-the-badge&labelColor=0A0A0A"></a>`,
  `  <a href="${c.contact.linkedin}"><img alt="LinkedIn" src="https://img.shields.io/badge/LINKEDIN-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>`,
  `  <a href="mailto:${c.contact.email}"><img alt="Email" src="https://img.shields.io/badge/EMAIL-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>`,
  "</p>",
  "",
);

P.push(c.hero.subline, "");
P.push(c.intro.body[0], "");
P.push(
  img(
    `${A}/stats.png`,
    c.statBand
      .map((s) => `${s.value}${s.suffix ?? ""} ${s.label}${s.note ? ` (${s.note})` : ""}`)
      .join(". ") + ".",
  ),
  "",
);

P.push("---", "");
P.push("## Việc đã làm", "");
P.push(c.intro.body[2], "");
P.push(
  "> [!NOTE]",
  "> Các hệ thống này là công cụ nội bộ của GHN và Interdist nên repo để private và không",
  "> có link demo công khai. Ảnh bên dưới chụp từ chính bản đang chạy production, đã thay",
  "> số thật bằng dữ liệu minh hoạ và che thông tin khách hàng. Mỗi case có một khối gập",
  "> lại — mở ra là toàn bộ bối cảnh, từng quyết định thiết kế, và cách từng con số được",
  "> tính, kèm nhãn phân biệt số đã xác thực với số còn là ước tính.",
  "",
);
P.push("<br>", "");
c.cases.forEach((cs, i) => P.push(caseBlock(cs, i + 1)));

P.push("---", "");
P.push(`## ${c.pipeline.heading}`, "");
P.push(c.pipeline.intro, "");
P.push(
  img(
    `${A}/pipeline.png`,
    "Bảy mắt của một dashboard: 01 chốt lại câu hỏi, 02 tự viết query và tự kiểm output " +
      "(chỉ có quyền đọc lakehouse), 03 job định kỳ do team BI dựng vì quyền tạo job thuộc " +
      "team khác, 04 đồng bộ sang cơ sở dữ liệu ứng dụng, 05 mô hình hoá lại cho ứng dụng, " +
      "06 dựng ứng dụng, 07 deploy và vận hành.",
  ),
  "",
);
P.push(`**Đánh đổi tôi biết mình đang chịu.** ${c.pipeline.tradeoff}`, "");
P.push(`**Về AI.** ${c.pipeline.aiNote}`, "");

P.push("---", "");
P.push("## Bộ kỹ năng", "");
P.push("| Nhóm | |", "|---|---|");
c.skills.forEach((s) => P.push(`| **${s.title}** | ${s.items.join(" · ")} |`));
P.push("");

P.push("---", "");
P.push("## Kinh nghiệm", "");
P.push(
  img(
    `${A}/timeline.png`,
    c.experience
      .slice()
      .reverse()
      .map((e) => `${e.period}: ${e.company}, ${e.role}`)
      .join(". ") + ".",
  ),
  "",
);
c.experience.forEach((e) => {
  P.push("<details>", `<summary><b>${e.company}</b> — ${e.role} · ${e.period}</summary>`, "");
  P.push(e.summary, "");
  e.highlights.forEach((h) => P.push(`- ${h}`));
  P.push("", "</details>", "");
});

P.push("---", "");
P.push("## Nên gọi tôi khi", "");
c.intro.fit.forEach((f) => P.push(`- ${f}`));
P.push("");
P.push("## Và khi không nên", "");
c.intro.notFit.forEach((f) => P.push(`- ${f}`));
P.push("");
P.push(`> ${c.intro.boundary}`, "");

P.push("---", "");
P.push(`## ${c.contact.heading}`, "");
P.push(c.contact.body, "");
P.push(
  "<p align=\"center\">",
  `  <a href="mailto:${c.contact.email}"><b>${c.contact.email}</b></a> &nbsp;·&nbsp;`,
  `  <a href="${c.contact.linkedin}">LinkedIn</a> &nbsp;·&nbsp;`,
  `  <a href="${CV}">CV (PDF)</a>`,
  "</p>",
  "",
  `<p align="center"><sub>${c.contact.availability}</sub></p>`,
  "",
);

fs.writeFileSync(OUT, P.join("\n").replace(/\n{3,}/g, "\n\n"));
const md = fs.readFileSync(OUT, "utf8");
console.log(
  `README.md → ${md.split("\n").length} dòng, ${(md.length / 1024).toFixed(1)} KB, ` +
    `${c.cases.length} case, ${c.cases.reduce((n, x) => n + x.decisions.length, 0)} quyết định`,
);
