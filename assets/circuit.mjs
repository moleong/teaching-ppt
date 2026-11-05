#!/usr/bin/env node
/**
 * circuit.mjs — 迷你電路圖生成器（teaching-ppt skill 專用）
 *
 * 定位：authoring-time 工具。Node 執行，輸出**靜態 inline SVG**，
 * 貼進講義 HTML 即可（不依賴瀏覽器 JS，noscript/列印皆安全）。
 *
 * 用法：
 *   node circuit.mjs <diagram.mjs>          # 輸出 SVG 到 stdout
 *   node circuit.mjs <diagram.mjs> --html   # 包成預覽用 HTML
 *   node circuit.mjs --list                 # 列出 SPEC 全部基準尺寸（審計用）
 *
 * diagram.mjs 格式：
 *   export default ({ Circuit }) => {
 *     const c = new Circuit();
 *     c.part('resistor', 100, 300, 200, 300, { label: '{i:R}' });
 *     return c.svg();
 *   };
 *
 * 【新增符號規範的流程（統一性保證）】
 *   1. 在下方 SPEC 加一筆尺寸（400px viewBox 基準）
 *   2. 在 SYMBOLS 加一筆 { span, halfH, draw }（draw 一律畫在「導線沿 +x、
 *      元件中心在原點」的局部座標系；直放由 part() 自動旋轉，不需重寫）
 *   3. 同步更新 SKILL.md「電路圖與標註文字規範」的人讀規範表
 *   SPEC 是全專案唯一尺寸來源，SKILL.md 的表是它的文字鏡像，兩者必須同改。
 */

// ---------------------------------------------------------------- SPEC ----
// 唯一尺寸來源（400px 寬 viewBox 基準；對應 SKILL.md 規範表，2026-11 定稿）
export const SPEC = {
  wire:      { color: '#333', width: 2, nodeR: 3.5 },
  text:      { family: "'Times New Roman', Times, serif", size: 13, color: '#333' },
  resistor:  { span: 32, halfH: 8 },                       // 橫放 32×16
  cell:      { span: 15, halfH: 17, pos: { len: 34, w: 2 }, neg: { len: 16, w: 4 } },
  switch:    { span: 70, halfH: 20 },                      // 斷開態刀閘，模板幾何
  lamp:      { span: 30, halfH: 15 },                      // 圓 r15 + 貫穿叉絲
  meter:     { span: 28, halfH: 14, r: 14, letterSize: 13 },
  capacitor: { span: 8,  halfH: 20, plateLen: 40, plateW: 3 },
  rheostat:  { span: 48, halfH: 26, bodyH: 16, leadUp: 26 },
  terminal:  { r: 5 },                                     // 開口接線柱（導線盡頭）
  vsource:   { span: 36, halfH: 17, r: 17 },               // 圓形電壓源；+/− 沿導線軸，+ 在導線段起點側
  current:   { color: '#d63384' },                         // 電流箭頭（紫紅）
  semantic:  { before: '#3498db', after: '#e74c3c' },      // 改裝前藍 / 改裝後紅
};

// marker 定義（用到才輸出）
const DEFS = {
  arrRheo:
    '<marker id="arrRheo" markerUnits="userSpaceOnUse" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">' +
    '<path d="M0,0 L7,3.5 L0,7 Z" fill="#333"/></marker>',
  arrCur:
    `<marker id="arrCur" markerUnits="userSpaceOnUse" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">` +
    `<path d="M0,0 L7,3.5 L0,7 Z" fill="${SPEC.current.color}"/></marker>`,
};

// ------------------------------------------------------------- SYMBOLS ----
// 每個符號：draw(g, abs, o) — g 推入局部座標元素（導線沿 +x，中心在原點），
// o 為呼叫端 opts。abs() 用於必須保持正立的內容（電表字母），參數為絕對座標。
const SYMBOLS = {
  resistor: {
    span: () => SPEC.resistor.span, halfH: () => SPEC.resistor.halfH,
    draw(g, abs, o = {}) {
      const { span, halfH } = SPEC.resistor;
      const color = o.color || SPEC.wire.color; // 語義色（改裝後 Rx 紅）由此傳入
      g.push(`<rect x="${-span / 2}" y="${-halfH}" width="${span}" height="${halfH * 2}" stroke="${color}" stroke-width="${SPEC.wire.width}" fill="#fff"/>`);
    },
  },

  cell: {
    span: () => SPEC.cell.span, halfH: () => SPEC.cell.halfH,
    draw(g, abs, o = {}) {
      const { span, pos, neg } = SPEC.cell;
      // 預設沿導線方向：− 板在起點側、+ 板在終點側（依電流方向可用 flip 調換）
      const s = o.flip ? -1 : 1;
      const xN = -span / 2 * s, xP = span / 2 * s;
      g.push(`<line x1="${xN}" y1="${-neg.len / 2}" x2="${xN}" y2="${neg.len / 2}" stroke="${SPEC.wire.color}" stroke-width="${neg.w}"/>`);
      g.push(`<line x1="${xP}" y1="${-pos.len / 2}" x2="${xP}" y2="${pos.len / 2}" stroke="${SPEC.wire.color}" stroke-width="${pos.w}"/>`);
    },
  },

  switch: {
    span: () => SPEC.switch.span, halfH: () => SPEC.switch.halfH,
    draw(g) {
      const h = SPEC.switch.span / 2; // 35
      // 左短線 10、鉸接點、刀刃向外張開、缺口、右短線（不畫接點圓點）
      g.push(`<line x1="${-h}" y1="0" x2="${-h + 10}" y2="0" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}"/>`);
      g.push(`<line x1="${-h + 10}" y1="0" x2="${-h + 34}" y2="-20" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}"/>`);
      g.push(`<line x1="${-h + 46}" y1="0" x2="${h}" y2="0" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}"/>`);
    },
  },

  lamp: {
    span: () => SPEC.lamp.span, halfH: () => SPEC.lamp.halfH,
    draw(g) {
      const r = SPEC.lamp.halfH, d = +(r / Math.SQRT2).toFixed(2);
      g.push(`<circle cx="0" cy="0" r="${r}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}" fill="#fff"/>`);
      g.push(`<line x1="${-d}" y1="${-d}" x2="${d}" y2="${d}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}"/>`);
      g.push(`<line x1="${-d}" y1="${d}" x2="${d}" y2="${-d}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}"/>`);
    },
  },

  meter: {
    span: () => SPEC.meter.span, halfH: () => SPEC.meter.halfH,
    draw(g, abs, o = {}) {
      const { r, letterSize } = SPEC.meter;
      const color = o.color || SPEC.wire.color;
      const ch = o.ch || 'A';
      g.push(`<circle cx="0" cy="0" r="${r}" stroke="${color}" stroke-width="${SPEC.wire.width}" fill="#fff"/>`);
      // 圈內字母為儀表符號 → 正體、且必須正立（放 abs 層，不隨直放旋轉）
      abs.push(`<text x="${o.cx}" y="${(o.cy + letterSize * 0.34).toFixed(1)}" text-anchor="middle" font-size="${letterSize}" fill="${color}" font-family="${SPEC.text.family}">${ch}</text>`);
    },
  },

  capacitor: {
    span: () => SPEC.capacitor.span, halfH: () => SPEC.capacitor.halfH,
    draw(g) {
      const { span, plateLen, plateW } = SPEC.capacitor;
      for (const x of [-span / 2, span / 2]) {
        g.push(`<line x1="${x}" y1="${-plateLen / 2}" x2="${x}" y2="${plateLen / 2}" stroke="${SPEC.wire.color}" stroke-width="${plateW}"/>`);
      }
    },
  },

  rheostat: {
    span: () => SPEC.rheostat.span, halfH: () => SPEC.rheostat.halfH,
    // 長條電阻體 + 滑片引線（自上方繞下、細箭頭觸框頂；sx 端與導線相接）
    // opts.slider: 'left' | 'right'（滑片接到導線的哪一端，預設 right）
    draw(g, abs, o = {}, ctx) {
      const { span, bodyH, leadUp } = SPEC.rheostat;
      const sx = (o.slider === 'left' ? -1 : 1) * span / 2;
      ctx.useDef('arrRheo');
      g.push(`<rect x="${-span / 2}" y="${-bodyH / 2}" width="${span}" height="${bodyH}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}" fill="#fff"/>`);
      g.push(`<circle cx="${sx}" cy="0" r="${SPEC.wire.nodeR}" fill="${SPEC.wire.color}"/>`);
      g.push(`<polyline points="${sx},0 ${sx},${-leadUp} 0,${-leadUp}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}" fill="none"/>`);
      g.push(`<line x1="0" y1="${-leadUp}" x2="0" y2="${-bodyH / 2 - 2}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}" marker-end="url(#arrRheo)"/>`);
    },
  },

  vsource: {
    span: () => SPEC.vsource.span, halfH: () => SPEC.vsource.halfH,
    // 圓形電壓源；+/− 沿導線軸放在圓外（+ 在導線段起點側，flip 調換）。
    // +/− 必須正立，故放 abs 層用絕對座標。
    draw(g, abs, o = {}) {
      const { r } = SPEC.vsource;
      const s = o.flip ? -1 : 1;
      g.push(`<circle cx="0" cy="0" r="${r}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}" fill="#fff"/>`);
      const rad = (o.ang || 0) * Math.PI / 180;
      const ux = Math.cos(rad), uy = Math.sin(rad), off = r + 9;
      const f = SPEC.text.family;
      abs.push(`<text x="${(o.cx - ux * off * s).toFixed(1)}" y="${(o.cy - uy * off * s + 5).toFixed(1)}" text-anchor="middle" font-size="13" fill="${SPEC.wire.color}" font-family="${f}">+</text>`);
      abs.push(`<text x="${(o.cx + ux * off * s).toFixed(1)}" y="${(o.cy + uy * off * s + 5).toFixed(1)}" text-anchor="middle" font-size="13" fill="${SPEC.wire.color}" font-family="${f}">−</text>`);
    },
  },
};

/** 註冊新符號（外部規範新增時用；與直接改 SYMBOLS 等效，供 diagram 檔臨時擴充） */
export function defineSymbol(name, { span, halfH, draw }) {
  if (SPEC[name] === undefined) SPEC[name] = {};
  SYMBOLS[name] = { span: () => span, halfH: () => halfH, draw };
}

// --------------------------------------------------------------- text -----
// 標註 DSL：{i:R} 斜體物理量、{u:V} 正體單位、{sub:x} 正體下標、{sup:2} 上標
// 純文字預設正體。例：'{i:R}{sub:x}'、'{i:U}{sub:M} = 3 {u:V}'
const TOKEN_RE = /\{(i|u|sub|sup):([^{}]*)\}/g;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function parseSpans(str) {
  const spans = [];
  let last = 0, m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(str))) {
    if (m.index > last) spans.push({ t: str.slice(last, m.index) });
    spans.push({ t: m[2], style: m[1] });
    last = m.index + m[0].length;
  }
  if (last < str.length) spans.push({ t: str.slice(last) });
  return spans;
}

function tspans(str) {
  let out = '', pendingDy = 0;
  for (const s of parseSpans(str)) {
    if (!s.t) continue;
    let dy = -pendingDy, scale = 1;
    if (s.style === 'sub') { dy += 0.28; scale = 0.75; }
    if (s.style === 'sup') { dy -= 0.42; scale = 0.75; }
    pendingDy = s.style === 'sub' ? 0.28 : s.style === 'sup' ? -0.42 : 0;
    let attrs = '';
    if (s.style === 'i') attrs += ' font-style="italic"';
    if (scale !== 1) attrs += ` font-size="${scale}em"`;
    if (Math.abs(dy) > 1e-9) attrs += ` dy="${+dy.toFixed(2)}em"`;
    out += `<tspan${attrs}>${esc(s.t)}</tspan>`;
  }
  return out;
}

// 估算字寬（bbox 用）：CJK 1em、其餘 0.55em，下標/上標乘 0.75
function textWidth(str, size) {
  let w = 0;
  for (const s of parseSpans(str)) {
    const scale = (s.style === 'sub' || s.style === 'sup') ? 0.75 : 1;
    for (const ch of s.t) w += (ch.charCodeAt(0) > 0x2e7f ? 1 : 0.55) * size * scale;
  }
  return w;
}

// ------------------------------------------------------------ Circuit -----
export class Circuit {
  constructor() {
    this.el = [];
    this.top = [];   // 置頂圖層：端子等必須蓋住導線線頭的元件，svg() 最後輸出
    this.defs = new Set();
    this.pts = {};   // 命名節點：at() 定義，各方法可用名稱代替座標
    this.wires = []; // 所有導線段（自動節點判定用）
    this.partSegs = []; // 各元件的導線段（段端點驗證用）
    this.termPts = [];  // 端子位置（線端歸屬驗證用）
    this.leadPts = new Set(); // 元件引腳位置（線端歸屬驗證用）
    this.manualNodes = new Set(); // node() 手動加點的位置（自動判定跳過）
    this.bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  }

  /** 定義命名節點：c.at('T1', 160, 70)，之後 wire/part/node/terminal 可用 'T1' 引用 */
  at(name, x, y) { this.pts[name] = [x, y]; return this; }

  // 參數解析：(x1,y1,x2,y2,opts) 或 ('名1','名2',opts)；單點用 _p1
  _p2(a, b, c, d, e) {
    if (typeof a === 'string') {
      const p1 = this.pts[a], p2 = this.pts[b];
      if (!p1) throw new Error(`未定義的節點名稱：${a}`);
      if (!p2) throw new Error(`未定義的節點名稱：${b}`);
      return [p1[0], p1[1], p2[0], p2[1], c];
    }
    return [a, b, c, d, e];
  }
  _p1(a, y) {
    if (typeof a === 'string') {
      const p = this.pts[a];
      if (!p) throw new Error(`未定義的節點名稱：${a}`);
      return p;
    }
    return [a, y];
  }

  useDef(id) { this.defs.add(id); }

  reg(x, y, pad = 0) {
    const b = this.bb;
    b.minX = Math.min(b.minX, x - pad); b.maxX = Math.max(b.maxX, x + pad);
    b.minY = Math.min(b.minY, y - pad); b.maxY = Math.max(b.maxY, y + pad);
  }

  /** 導線。端點可用座標或節點名稱；兩端必須各連接元件引腳／節點／端子／轉角（懸空即錯） */
  wire(a, b, c, d, opts) {
    const [x1, y1, x2, y2, o] = this._p2(a, b, c, d, opts);
    const { color = SPEC.wire.color, width = SPEC.wire.width } = o || {};
    this.el.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`);
    this.wires.push([x1, y1, x2, y2]);
    this.reg(x1, y1, width / 2); this.reg(x2, y2, width / 2);
    return this;
  }

  /** 手動加節點黑點（一般用不到：svg() 自動在三線交會處加點，轉角與直通不加；此為例外覆蓋） */
  node(a, y) {
    const [x, yy] = this._p1(a, y);
    this.el.push(`<circle cx="${x}" cy="${yy}" r="${SPEC.wire.nodeR}" fill="${SPEC.wire.color}"/>`);
    this.manualNodes.add(`${x},${yy}`);
    this.reg(x, yy, SPEC.wire.nodeR);
    return this;
  }

  // 自動節點判定：統計每個點的連接方向數（線段端點 + 被線段穿過的點），
  // ≥3 才加黑點；轉角（2 方向）與直通接縫（2 方向）自動不加。
  _autoNodes() {
    const dirs = this._pointDirs();
    const out = [];
    for (const [k, d] of dirs) {
      if (d.size >= 3 && !this.manualNodes.has(k)) out.push(k.split(',').map(Number));
    }
    return out;
  }

  // 每個點 → 連接方向集合（單位向量字串）。自動節點與段端點驗證共用。
  _pointDirs() {
    const dirs = new Map();
    const add = (x, y, ux, uy) => {
      const k = `${x},${y}`;
      if (!dirs.has(k)) dirs.set(k, new Set());
      dirs.get(k).add(`${ux.toFixed(4)},${uy.toFixed(4)}`);
    };
    const segs = this.wires.filter(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1) > 0);
    for (const [x1, y1, x2, y2] of segs) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      add(x1, y1, ux, uy); add(x2, y2, -ux, -uy);
    }
    // 線段穿過某端點 → 該點增加此線段的兩個方向
    for (const [x1, y1, x2, y2] of segs) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      for (const k of dirs.keys()) {
        const [px, py] = k.split(',').map(Number);
        if ((px === x1 && py === y1) || (px === x2 && py === y2)) continue;
        if (Math.abs((px - x1) * uy - (py - y1) * ux) > 0.5) continue; // 不共線
        const t = (px - x1) * ux + (py - y1) * uy;
        if (t > 0.5 && t < len - 0.5) { add(px, py, ux, uy); add(px, py, -ux, -uy); }
      }
    }
    return dirs;
  }

  // 段驗證（規範：段以節點／端子／轉角為界，段上元件均分置中）：
  // 每個元件沿軸向兩端延伸，穿過直通點、跨過串聯元件，直到硬點（節點/端子/轉角/線端），
  // 得真正的 run；run 上 k 個元件須各自置中於 1/k 等份（k=1 即置中整段）。違者報錯。
  _validateParts() {
    const dirs = this._pointDirs();
    const key = (x, y) => `${x},${y}`;
    const isHard = k => {
      const d = dirs.get(k);
      if (!d || d.size !== 2) return true;                 // 線端（1）或交會（≥3）
      const [u1, u2] = [...d].map(s => s.split(',').map(Number));
      return u1[0] * u2[0] + u1[1] * u2[1] > -0.99;        // 2 但非共線 → 轉角
    };
    // 導線鄰接表
    const adj = new Map();
    for (const [x1, y1, x2, y2] of this.wires) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (!len) continue;
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      const push = (k, e) => { if (!adj.has(k)) adj.set(k, []); adj.get(k).push(e); };
      push(key(x1, y1), { tx: x2, ty: y2, ux, uy });
      push(key(x2, y2), { tx: x1, ty: y1, ux: -ux, uy: -uy });
    }
    // 元件端點索引（直通點上跨過串聯元件用）
    const partEnd = new Map();
    for (const ps of this.partSegs) {
      for (const k of [key(ps[0], ps[1]), key(ps[2], ps[3])]) {
        if (!partEnd.has(k)) partEnd.set(k, []);
        partEnd.get(k).push(ps);
      }
    }
    // 從 (x,y) 沿 (dx,dy) 向外延伸到硬點；途中跨過的串聯元件收入 crossed
    const extend = (x, y, dx, dy, self) => {
      let cur = [x, y];
      const crossed = [];
      for (let i = 0; i < 100; i++) {
        const k = key(cur[0], cur[1]);
        if (isHard(k)) return { end: cur, crossed };
        const others = (partEnd.get(k) || []).filter(ps => ps !== self);
        if (others.length) {                               // 串聯點：跨過該元件
          const ps = others[0];
          crossed.push(ps);
          cur = (ps[0] === cur[0] && ps[1] === cur[1]) ? [ps[2], ps[3]] : [ps[0], ps[1]];
          continue;
        }
        const e = (adj.get(k) || []).find(w => Math.abs(w.ux - dx) < 1e-3 && Math.abs(w.uy - dy) < 1e-3);
        if (!e) return { end: cur, crossed };
        cur = [e.tx, e.ty];
      }
      return { end: cur, crossed };
    };

    for (const ps of this.partSegs) {
      const [x1, y1, x2, y2, type] = ps;
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
      const left = extend(x1, y1, -ux, -uy, ps);
      const right = extend(x2, y2, ux, uy, ps);
      const [rx1, ry1] = left.end, [rx2, ry2] = right.end;
      const runLen = Math.hypot(rx2 - rx1, ry2 - ry1);
      if (!runLen) continue;
      const rux = (rx2 - rx1) / runLen, ruy = (ry2 - ry1) / runLen;
      // run 上所有元件（含自身），按投影排序，各應置中於 1/k 等份
      const all = [ps, ...left.crossed, ...right.crossed];
      const proj = ps2 => ((ps2[0] + ps2[2]) / 2 - rx1) * rux + ((ps2[1] + ps2[3]) / 2 - ry1) * ruy;
      all.sort((a, b2) => proj(a) - proj(b2));
      const i = all.indexOf(ps);
      const expT = (i + 0.5) * runLen / all.length;
      const ex = rx1 + rux * expT, ey = ry1 + ruy * expT;
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      if (Math.abs(cx - ex) > 5 || Math.abs(cy - ey) > 5) {
        throw new Error(`元件 ${type} 未置中於其電路段：段 = (${rx1},${ry1})–(${rx2},${ry2}) 均分 ${all.length} 份，應置中於 (${ex.toFixed(1)},${ey.toFixed(1)})，實際 (${cx},${cy})`);
      }
    }

    // 線端歸屬：只有一個連接方向的點必須是端子（鄰域 6px）或元件引腳，否則即懸空
    for (const [k, d] of dirs) {
      if (d.size !== 1 || this.leadPts.has(k)) continue;
      const [px, py] = k.split(',').map(Number);
      if (this.termPts.some(([tx, ty]) => Math.hypot(tx - px, ty - py) <= 6)) continue;
      throw new Error(`導線端點 (${k}) 懸空：線端只能是端子或元件引腳（元件支路不得斷在半空）`);
    }
  }

  /** 開口接線柱（端子）：導線盡頭的小圓圈；白底圓自動蓋住線頭。
      收入置頂圖層，呼叫次序不影響遮蓋（導線先畫後畫都安全）。 */
  terminal(a, y) {
    const [x, yy] = this._p1(a, y);
    const r = SPEC.terminal.r;
    this.top.push(`<circle cx="${x}" cy="${yy}" r="${r}" stroke="${SPEC.wire.color}" stroke-width="${SPEC.wire.width}" fill="#fff"/>`);
    this.termPts.push([x, yy]);
    this.reg(x, yy, r + SPEC.wire.width / 2);
    return this;
  }

  /**
   * 電流箭頭（紫紅，方向 = (x1,y1)→(x2,y2)）。
   * label 預設放在箭頭中點上方 22px（配「箭頭畫在導線下方/旁邊」的慣例），
   * 用 opts.labelOffset:[dx,dy] 或 opts.noLabel 調整。
   */
  current(a, b, c, d, e, f) {
    let x1, y1, x2, y2, label, o;
    if (typeof a === 'string') { [x1, y1, x2, y2] = this._p2(a, b); label = c; o = d; }
    else { [x1, y1, x2, y2, label, o] = [a, b, c, d, e, f]; }
    const { color = SPEC.current.color, labelOffset = [0, -22] } = o || {};
    this.useDef('arrCur');
    this.el.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${SPEC.wire.width}" marker-end="url(#arrCur)"/>`);
    this.reg(x1, y1, 4); this.reg(x2, y2, 4);
    if (label) {
      this.text((x1 + x2) / 2 + labelOffset[0], (y1 + y2) / 2 + labelOffset[1], label, { color });
    }
    return this;
  }

  /**
   * 在導線段 (x1,y1)-(x2,y2) 上置中放置元件：導線自動在符號處中斷。
   * 支援水平／垂直／任意角度斜線段（橋式、三角形電路）。
   * type: resistor | cell | vsource | switch | lamp | meter | capacitor | rheostat
   * opts.label: 標註 DSL 字串；labelSide: 'above'|'below'|'left'|'right'（沿法線方向；
   *   預設近水平段 above、近垂直段 left；斜線段依實際法線方向）
   * opts.flip: 反轉符號極性/方向（cell、vsource）
   * meter 需 opts.ch（'G'|'V'|'A'|'N'），可 opts.color（語義色用 SPEC.semantic）
   * rheostat 可 opts.slider: 'left'|'right'
   */
  part(type, a, b, c, d, e) {
    let x1, y1, x2, y2, o;
    if (typeof a === 'string') { [x1, y1, x2, y2] = this._p2(a, b); o = c || {}; }
    else { [x1, y1, x2, y2, o] = [a, b, c, d, e || {}]; }
    const sym = SYMBOLS[type];
    if (!sym) throw new Error(`未知符號 "${type}"，可用：${Object.keys(SYMBOLS).join(', ')}`);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const span = sym.span();
    if (len < span + 4) throw new Error(`導線段長 ${len} 不足以放下 ${type}（span ${span}）`);
    this.partSegs.push([x1, y1, x2, y2, type]);
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const ux = dx / len, uy = dy / len;
    const half = span / 2;
    this.leadPts.add(`${cx - ux * half},${cy - uy * half}`);
    this.leadPts.add(`${cx + ux * half},${cy + uy * half}`);

    this.wire(x1, y1, cx - ux * half, cy - uy * half);
    this.wire(cx + ux * half, cy + uy * half, x2, y2);

    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const g = [], abs = [];
    const ctx = { useDef: id => this.useDef(id) };
    sym.draw(g, abs, { ...o, cx, cy, ang }, ctx);
    this.el.push(`<g transform="translate(${cx},${cy}) rotate(${+ang.toFixed(2)})">${g.join('')}</g>`);
    this.el.push(...abs);

    // bbox：符號垂直方向半高
    const hh = sym.halfH();
    this.reg(cx, cy, Math.max(half, hh) + SPEC.wire.width);

    if (o.label) {
      // 標註沿線段法線方向偏移；above/below = 法線中向上/下側，left/right = 向左/右側
      const gap = o.labelGap ?? 10;
      const px = -uy, py = ux;
      const dirs = {
        above: py <= 0 ? [px, py] : [-px, -py],
        below: py <= 0 ? [-px, -py] : [px, py],
        left:  px <= 0 ? [px, py] : [-px, -py],
        right: px <= 0 ? [-px, -py] : [px, py],
      };
      const side = o.labelSide || (Math.abs(uy) < 0.5 ? 'above' : 'left');
      const [vx, vy] = dirs[side];
      const lx = cx + vx * (hh + gap), ly = cy + vy * (hh + gap);
      const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';
      const dyFix = side === 'below' ? SPEC.text.size
        : (side === 'left' || side === 'right') ? SPEC.text.size * 0.34 : 0;
      this.text(+lx.toFixed(1), +(ly + dyFix).toFixed(1), o.label, { anchor, color: o.labelColor });
    }
    return this;
  }

  /** 標註文字（DSL 見 parseSpans）。y 為基線。 */
  text(x, y, str, { anchor = 'middle', size = SPEC.text.size, color = SPEC.text.color, rotate = 0 } = {}) {
    const rot = rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : '';
    this.el.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-family="${SPEC.text.family}"${rot}>${tspans(str)}</text>`);
    const w = textWidth(str, size);
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    this.reg(x0, y - size, 1); this.reg(x0 + w, y + 3, 1);
    return this;
  }

  /**
   * 在同一導線段上均勻分佈多個元件（規範：同段線路內元件平均分佈）。
   * parts: [{ type, opts }...]，段被切成 parts.length 等份，各元件置中於其等份。
   */
  distribute(a, b, c, d, e) {
    const [x1, y1, x2, y2, parts] = this._p2(a, b, c, d, e);
    const n = parts.length;
    if (!n) throw new Error('distribute() 需要至少一個元件');
    for (let i = 0; i < n; i++) {
      const t1 = i / n, t2 = (i + 1) / n;
      this.part(parts[i].type,
        x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1,
        x1 + (x2 - x1) * t2, y1 + (y2 - y1) * t2,
        parts[i].opts || {});
    }
    return this;
  }

  /**
   * 並聯支路（封閉迴路）：繞過 (x1,y1)-(x2,y2) 段，off>0 向上/向右繞。
   * 兩端黑點由自動節點判定補上，回傳支路導線段座標供放置支路元件。
   */
  branch(a, b, c, d, e) {
    const [x1, y1, x2, y2, off] = this._p2(a, b, c, d, e);
    if (Math.abs(y2 - y1) < 1e-9) {
      const by = y1 - off;
      this.wire(x1, y1, x1, by); this.wire(x1, by, x2, by); this.wire(x2, by, x2, y2);
      return [x1, by, x2, by];
    }
    const bx = x1 + off;
    this.wire(x1, y1, bx, y1); this.wire(bx, y1, bx, y2); this.wire(bx, y2, x2, y2);
    return [bx, y1, bx, y2];
  }

  /** 輸出靜態 SVG（寬度上限用 em，符合 skill 寬屏規範） */
  svg({ padding = 12 } = {}) {
    const b = this.bb;
    if (b.minX === Infinity) throw new Error('空白電路圖');
    this._validateParts();
    const vx = +(b.minX - padding).toFixed(1), vy = +(b.minY - padding).toFixed(1);
    const vw = +(b.maxX - b.minX + 2 * padding).toFixed(1), vh = +(b.maxY - b.minY + 2 * padding).toFixed(1);
    const defs = this.defs.size
      ? `<defs>${[...this.defs].map(id => DEFS[id]).join('')}</defs>` : '';
    const dots = this._autoNodes()
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${SPEC.wire.nodeR}" fill="${SPEC.wire.color}"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" ` +
      `style="width:100%;max-width:${+(vw / 16).toFixed(2)}em;height:auto;">${defs}${this.el.join('')}${dots}${this.top.join('')}</svg>`;
  }
}

// ---------------------------------------------------------------- CLI -----
const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes('--list')) {
    console.log(JSON.stringify(SPEC, null, 2));
    process.exit(0);
  }
  const file = args.find(a => !a.startsWith('--'));
  if (!file) {
    console.error('用法: node circuit.mjs <diagram.mjs> [--html] | --list');
    process.exit(1);
  }
  const { resolve } = await import('node:path');
  const mod = await import(new URL(`file://${resolve(file)}`).href);
  const svg = mod.default({ Circuit, SPEC, defineSymbol });
  if (args.includes('--html')) {
    console.log('<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>circuit preview</title></head>' +
      '<body style="margin:24px;background:#fff;max-width:900px;font-family:\'Microsoft JhengHei\',sans-serif">' +
      svg + '</body></html>');
  } else {
    console.log(svg);
  }
}
