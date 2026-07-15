/**
 * generate-favicon.mjs
 *
 * Generates a pixel-perfect, gradient-free AskPay favicon using only
 * Node.js built-ins (no npm packages required).
 *
 * Design:
 *   - 512×512 canvas
 *   - Navy background: #0D1B2A with large rounded corners
 *   - White speech bubble (rounded rect + triangular tail)
 *   - Celo-green (#17A865) coin badge with white $ sign
 *
 * Output:
 *   - apps/web/public/favicon.png   (512×512 — source of truth)
 *   - apps/web/public/favicon-32.png (32×32  — browser tab)
 *   - apps/web/public/apple-touch-icon.png (180×180 — iOS)
 */

import { createWriteStream, mkdirSync } from "fs";
import { deflateSync } from "zlib";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// PNG encoder (pure Node.js, no deps)
// ─────────────────────────────────────────────────────────────────────────────

function crc32(buf) {
  let c = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let v = i;
      for (let j = 0; j < 8; j++) v = (v & 1) ? (0xedb88320 ^ (v >>> 1)) : (v >>> 1);
      t[i] = v;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const d = Buffer.from(data);
  const crcBuf = Buffer.concat([t, d]);
  return Buffer.concat([u32be(d.length), t, d, u32be(crc32(crcBuf))]);
}

function encodePNG(width, height, pixels /* Uint8Array RGBA */) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB (we'll strip alpha separately for compatibility)
  // Actually use color type 6 (RGBA)
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines (filter byte 0 per row)
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const idat = deflateSync(raw, { level: 6 });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rasterizer helpers
// ─────────────────────────────────────────────────────────────────────────────

function hexToRGB(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4); // RGBA
  }

  setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    // Alpha composite over existing
    const srcA = a / 255;
    const dstA = this.data[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA === 0) return;
    this.data[i]     = Math.round((r * srcA + this.data[i]     * dstA * (1 - srcA)) / outA);
    this.data[i + 1] = Math.round((g * srcA + this.data[i + 1] * dstA * (1 - srcA)) / outA);
    this.data[i + 2] = Math.round((b * srcA + this.data[i + 2] * dstA * (1 - srcA)) / outA);
    this.data[i + 3] = Math.round(outA * 255);
  }

  // Anti-aliased circle fill
  fillCircle(cx, cy, r, hex) {
    const [R, G, B] = hexToRGB(hex);
    const x0 = Math.floor(cx - r - 1), x1 = Math.ceil(cx + r + 1);
    const y0 = Math.floor(cy - r - 1), y1 = Math.ceil(cy + r + 1);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const a = Math.max(0, Math.min(1, r + 0.5 - d));
        if (a > 0) this.setPixel(x, y, R, G, B, Math.round(a * 255));
      }
    }
  }

  // Rounded rectangle fill (anti-aliased corners)
  fillRoundRect(x, y, w, h, rx, hex) {
    const [R, G, B] = hexToRGB(hex);
    for (let py = Math.floor(y); py <= Math.ceil(y + h); py++) {
      for (let px = Math.floor(x); px <= Math.ceil(x + w); px++) {
        // Distance to nearest corner center
        const cx = Math.max(x + rx, Math.min(x + w - rx, px));
        const cy = Math.max(y + rx, Math.min(y + h - rx, py));
        const d = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        const a = Math.max(0, Math.min(1, rx + 0.5 - d));
        if (a > 0) this.setPixel(px, py, R, G, B, Math.round(a * 255));
      }
    }
  }

  // Filled triangle (solid, no AA needed for this size)
  fillTriangle(x1, y1, x2, y2, x3, y3, hex) {
    const [R, G, B] = hexToRGB(hex);
    const minX = Math.floor(Math.min(x1, x2, x3));
    const maxX = Math.ceil(Math.max(x1, x2, x3));
    const minY = Math.floor(Math.min(y1, y2, y3));
    const maxY = Math.ceil(Math.max(y1, y2, y3));
    function sign(ax, ay, bx, by, cx2, cy2) {
      return (ax - cx2) * (by - cy2) - (bx - cx2) * (ay - cy2);
    }
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d1 = sign(px, py, x1, y1, x2, y2);
        const d2 = sign(px, py, x2, y2, x3, y3);
        const d3 = sign(px, py, x3, y3, x1, y1);
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        if (!(hasNeg && hasPos)) this.setPixel(px, py, R, G, B, 255);
      }
    }
  }

  // Stroke a path as thick line segments
  strokeLine(x1, y1, x2, y2, thickness, hex) {
    const [R, G, B] = hexToRGB(hex);
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len, ny = dx / len; // normal
    const steps = Math.ceil(len * 2);
    const halfT = thickness / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mx = x1 + dx * t, my = y1 + dy * t;
      // Draw a filled circle at each point along the line
      for (let oy = -halfT - 1; oy <= halfT + 1; oy++) {
        for (let ox = -halfT - 1; ox <= halfT + 1; ox++) {
          const d = Math.sqrt(ox * ox + oy * oy);
          const a = Math.max(0, Math.min(1, halfT + 0.5 - d));
          if (a > 0) this.setPixel(Math.round(mx + ox), Math.round(my + oy), R, G, B, Math.round(a * 255));
        }
      }
    }
  }

  // Draw the dollar sign S-curve using line segments
  drawDollarSign(cx, cy, size, hex) {
    const s = size;
    const hw = s * 0.28; // half-width of S
    const thick = s * 0.12;

    // Vertical bar
    this.strokeLine(cx, cy - s * 0.55, cx, cy + s * 0.55, thick * 0.9, hex);

    // Top arc (upper S): center at (cx, cy - s*0.22), radius hw
    // approximated as a semi-circle arc
    const arcSegs = 24;

    // Upper arc: from right to left, top half
    for (let i = 0; i < arcSegs; i++) {
      const a1 = (i / arcSegs) * Math.PI;      // 0..PI (left semicircle)
      const a2 = ((i + 1) / arcSegs) * Math.PI;
      const acy = cy - s * 0.22;
      const x1 = cx + hw * Math.cos(Math.PI - a1);
      const y1 = acy - hw * 0.7 * Math.sin(a1);
      const x2 = cx + hw * Math.cos(Math.PI - a2);
      const y2 = acy - hw * 0.7 * Math.sin(a2);
      this.strokeLine(x1, y1, x2, y2, thick, hex);
    }

    // Lower arc: from left to right, bottom half
    for (let i = 0; i < arcSegs; i++) {
      const a1 = (i / arcSegs) * Math.PI;
      const a2 = ((i + 1) / arcSegs) * Math.PI;
      const acy = cy + s * 0.22;
      const x1 = cx - hw * Math.cos(Math.PI - a1);
      const y1 = acy + hw * 0.7 * Math.sin(a1);
      const x2 = cx - hw * Math.cos(Math.PI - a2);
      const y2 = acy + hw * 0.7 * Math.sin(a2);
      this.strokeLine(x1, y1, x2, y2, thick, hex);
    }
  }

  savePNG(path) {
    const buf = encodePNG(this.w, this.h, this.data);
    const ws = createWriteStream(path);
    ws.write(buf);
    ws.end();
    console.log(`✓ Written ${buf.length} bytes → ${path}`);
    return buf;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Render the favicon at a given size
// ─────────────────────────────────────────────────────────────────────────────

function render(size) {
  const S = size;
  const c = new Canvas(S, S);

  const BG    = "#0D1B2A";
  const WHITE = "#FFFFFF";
  const GREEN = "#17A865";

  // ── Background (rounded rect) ──────────────────────────────────────────────
  const bgR = S * 0.21; // corner radius ≈ 21% of size
  c.fillRoundRect(0, 0, S, S, bgR, BG);

  // ── Speech bubble ──────────────────────────────────────────────────────────
  const bx = S * 0.14;       // bubble left
  const by = S * 0.18;       // bubble top
  const bw = S * 0.60;       // bubble width
  const bh = S * 0.42;       // bubble height
  const br = S * 0.07;       // bubble corner radius
  c.fillRoundRect(bx, by, bw, bh, br, WHITE);

  // Tail: triangle below-left of bubble
  const tx1 = bx + S * 0.10, ty1 = by + bh;
  const tx2 = bx + S * 0.10, ty2 = by + bh + S * 0.14;
  const tx3 = bx + S * 0.25, ty3 = by + bh;
  c.fillTriangle(tx1, ty1, tx2, ty2, tx3, ty3, WHITE);

  // ── Coin badge ─────────────────────────────────────────────────────────────
  const coinCX = S * 0.70;
  const coinCY = S * 0.68;
  const ringR  = S * 0.175;
  const coinR  = S * 0.150;
  c.fillCircle(coinCX, coinCY, ringR, BG);    // navy ring (separator)
  c.fillCircle(coinCX, coinCY, coinR, GREEN); // green face

  // ── Dollar sign ────────────────────────────────────────────────────────────
  c.drawDollarSign(coinCX, coinCY, coinR * 0.80, WHITE);

  return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// Write output files
// ─────────────────────────────────────────────────────────────────────────────

const publicDir = resolve(__dirname, "apps/web/public");
const appDir    = resolve(__dirname, "apps/web/src/app");

mkdirSync(publicDir, { recursive: true });

// 512×512 source
const big = render(512);
big.savePNG(resolve(publicDir, "favicon.png"));

// 32×32 for browser tab
const small = render(32);
small.savePNG(resolve(publicDir, "favicon-32.png"));

// 180×180 for Apple touch icon
const apple = render(180);
apple.savePNG(resolve(publicDir, "apple-touch-icon.png"));

// Also copy 32px version to app/icon.png so Next.js auto-links it
const buf32 = encodePNG(32, 32, small.data);
import { writeFileSync } from "fs";
writeFileSync(resolve(appDir, "icon.png"), buf32);
console.log(`✓ Written ${buf32.length} bytes → apps/web/src/app/icon.png`);
