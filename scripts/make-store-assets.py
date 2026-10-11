"""App Store Connect product-page header and search-results creatives.
Apple's rules: one clear idea, short phrase, focal point centred, no URLs, prices, awards or other platforms' logos.
Run: python3 scripts/make-store-assets.py   (needs Pillow)"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_B = 'node_modules/@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf'
FONT_M = 'node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'
OUT = 'docs/store-assets'
def white_tile():
    # White squircle with the black plane: stands out from the glow behind it.
    n = 1024
    im = Image.new('RGB', (n, n), (255, 255, 255))
    d = ImageDraw.Draw(im)
    k = n * 0.60 / 328
    ox, oy = n * 0.20 - 6 * k, n * 0.20 - 0 * k
    for poly in ([(70, 229), (378, 126), (210, 296)], [(216, 303), (385, 133), (283, 441)]):
        d.polygon([(n * 0.20 + (x - 64) * k, n * 0.20 + (y - 120) * k) for x, y in poly], fill=(10, 10, 10))
    return im


ICON = white_tile()
# name, width, height
SIZES = [('universal-5244x2950', 5244, 2950), ('header-3840x1646', 3840, 1646), ('search-3840x2560', 3840, 2560), ('search-1920x1280', 1920, 1280)]


def glow(w, h):
    base = Image.new('RGB', (w, h), (255, 255, 255))
    m = min(w, h)
    for (x, y, r, rgb, a) in [(0.0, 1.0, 0.75, (120, 170, 255), 215), (1.0, 1.0, 0.7, (255, 130, 190), 205), (0.62, 0.0, 0.7, (180, 140, 255), 205)]:
        mask = Image.new('L', (w, h), 0)
        ImageDraw.Draw(mask).ellipse([x * w - r * m, y * h - r * m, x * w + r * m, y * h + r * m], fill=a)
        base.paste(Image.new('RGB', (w, h), rgb), (0, 0), mask.filter(ImageFilter.GaussianBlur(m * 0.2)))
    return base


def squircle(img, size, radius_ratio=0.225):
    img = img.resize((size, size), Image.LANCZOS)
    mask = Image.new('L', (size * 2, size * 2), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size * 2 - 1, size * 2 - 1], radius=int(size * 2 * radius_ratio), fill=255)
    out = img.convert('RGBA')
    out.putalpha(mask.resize((size, size), Image.LANCZOS))
    return out


def bubble(canvas, cx, cy, bw, bh, side):
    """An empty chat bubble: just shape, so there is no text to localise."""
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    box = [cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2]
    d.rounded_rectangle(box, radius=bh / 2, fill=(255, 255, 255, 235))
    tail_x = box[0] + bh * 0.5 if side == 'l' else box[2] - bh * 0.5
    d.polygon([(tail_x - bh * 0.18, box[3] - bh * 0.25), (tail_x + bh * 0.18, box[3] - bh * 0.25), (tail_x + (-1 if side == 'l' else 1) * bh * 0.05, box[3] + bh * 0.2)], fill=(255, 255, 255, 235))
    shadow = layer.filter(ImageFilter.GaussianBlur(bh * 0.18))
    sh = Image.new('RGBA', canvas.size, (60, 50, 110, 0))
    sh.putalpha(shadow.split()[3].point(lambda v: int(v * 0.25)))
    canvas.alpha_composite(sh, (0, int(bh * 0.12)))
    canvas.alpha_composite(layer)


def make(w, h):
    canvas = glow(w, h).convert('RGBA')
    m = min(w, h)
    g = 0.80 if w / h < 2 else 1.0  # 3:2 crops are narrower: shrink the focal group so it stays inside the safe area
    # Soft empty chat bubbles at the sides, away from the centred focal group.
    for (fx, fy, bw, bh, side) in [(0.07, 0.20, 0.30, 0.13, 'l'), (0.05, 0.80, 0.22, 0.11, 'l'), (0.93, 0.18, 0.22, 0.11, 'r'), (0.95, 0.82, 0.30, 0.13, 'r')]:
        bubble(canvas, fx * w, fy * h, bw * m * 1.15, bh * m * 1.15, side)
    tile = int(m * 0.36 * g)
    f1 = ImageFont.truetype(FONT_B, int(m * 0.17 * g))
    f2 = ImageFont.truetype(FONT_M, int(m * 0.075 * g))
    d = ImageDraw.Draw(canvas)
    t1, t2 = 'Only DMs.', 'Reply and leave.'
    tw = max(d.textlength(t1, font=f1), d.textlength(t2, font=f2))
    gap = int(m * 0.07 * g)
    total = tile + gap + tw
    x0 = (w - total) / 2
    y0 = (h - tile) / 2
    # Icon tile with a soft shadow.
    ic = squircle(ICON, tile)
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([x0, y0 + tile * 0.05, x0 + tile, y0 + tile * 1.05], radius=int(tile * 0.225), fill=(40, 30, 90, 90))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(tile * 0.07)))
    canvas.alpha_composite(ic, (int(x0), int(y0)))
    d = ImageDraw.Draw(canvas)
    tx = x0 + tile + gap
    block = int(m * 0.17 * g) + int(m * 0.075 * g) + int(m * 0.03 * g)
    ty = h / 2 - block / 2 - m * 0.03 * g
    d.text((tx, ty), t1, font=f1, fill=(10, 10, 10))
    d.text((tx, ty + m * 0.17 * g * 1.18), t2, font=f2, fill=(61, 61, 61))
    return canvas.convert('RGB')


os.makedirs(OUT, exist_ok=True)
for name, w, h in SIZES:
    make(w, h).save(f'{OUT}/{name}.png', optimize=True)
    print(name)
