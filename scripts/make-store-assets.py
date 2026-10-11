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
# name, width, height, kind
SIZES = [('header-5244x2950', 5244, 2950, 'header'), ('header-3840x1646', 3840, 1646, 'header'), ('search-5244x2950', 5244, 2950, 'search'), ('search-3840x2560', 3840, 2560, 'search'), ('search-1920x1280', 1920, 1280, 'search')]


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


def pill(canvas, cx, cy, text, font, pad):
    d = ImageDraw.Draw(canvas)
    tw = d.textlength(text, font=font)
    w, h = tw + pad * 2, font.size + pad * 1.1
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], radius=h / 2, fill=(255, 255, 255, 240))
    sh = Image.new('RGBA', canvas.size, (60, 50, 110, 0))
    sh.putalpha(layer.split()[3].filter(ImageFilter.GaussianBlur(h * 0.25)).point(lambda v: int(v * 0.22)))
    canvas.alpha_composite(sh, (0, int(h * 0.12)))
    canvas.alpha_composite(layer)
    ImageDraw.Draw(canvas).text((cx - tw / 2, cy - font.size * 0.58), text, font=font, fill=(10, 10, 10))
    return w


def make(w, h, kind):
    """kind 'header': one narrow, centred stack (iPhone crops the header to its middle, and the app icon and
    name sit over the bottom-left, so nothing important goes near the sides or the lower third).
    kind 'search': the same stack plus three benefit pills; the 3:2 image is shown whole."""
    canvas = glow(w, h).convert('RGBA')
    m = min(w, h)
    cx = w / 2
    if kind == 'header':
        tile_s, f1_s, f2_s, top = 0.24, 0.105, 0.05, 0.16
    else:
        tile_s, f1_s, f2_s, top = 0.25, 0.13, 0.06, 0.15
    tile = int(m * tile_s)
    f1 = ImageFont.truetype(FONT_B, int(m * f1_s))
    f2 = ImageFont.truetype(FONT_M, int(m * f2_s))
    y = h * top
    ic = squircle(ICON, tile)
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([cx - tile / 2, y + tile * 0.05, cx + tile / 2, y + tile * 1.05], radius=int(tile * 0.225), fill=(40, 30, 90, 90))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(tile * 0.07)))
    canvas.alpha_composite(ic, (int(cx - tile / 2), int(y)))
    d = ImageDraw.Draw(canvas)
    y += tile + m * 0.045
    t1, t2 = 'Only DMs.', 'Reply and leave.'
    d.text((cx - d.textlength(t1, font=f1) / 2, y), t1, font=f1, fill=(10, 10, 10))
    y += f1.size * 1.2
    d.text((cx - d.textlength(t2, font=f2) / 2, y), t2, font=f2, fill=(61, 61, 61))
    if kind == 'search':
        y += f2.size * 1.9
        pf = ImageFont.truetype(FONT_B, int(m * 0.05))
        labels = ['No feed', 'No Reels', 'No Explore']
        pad = m * 0.035
        widths = [d.textlength(t, font=pf) + pad * 2 for t in labels]
        gap = m * 0.03
        x = cx - (sum(widths) + gap * 2) / 2
        for t, pw in zip(labels, widths):
            pill(canvas, x + pw / 2, y + pf.size * 0.6, t, pf, pad)
            x += pw + gap
    return canvas.convert('RGB')


os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith('.png'):
        os.remove(f'{OUT}/{f}')
for name, w, h, kind in SIZES:
    make(w, h, kind).save(f'{OUT}/{name}.png', optimize=True)
    print(name)
