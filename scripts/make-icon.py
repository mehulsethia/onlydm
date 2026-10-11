"""Builds the app icon set: a black paper-plane DM mark on white with a soft blue / violet / pink glow.
Run: python3 scripts/make-icon.py   (needs Pillow)"""
from PIL import Image, ImageDraw, ImageFilter

S = 1024
SS = 2  # supersample
# Plane polygons from the 512-unit source drawing: wing, then the folded tail.
WING = [(70, 229), (378, 126), (210, 296)]
TAIL = [(216, 303), (385, 133), (283, 441)]
CX, CY = 227.5, 283.5  # centre of the plane's bounding box


def plane(size, scale, dx=0, dy=0, color=(10, 10, 10, 255)):
    big = size * SS
    layer = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    k = big / 512 * scale
    for poly in (WING, TAIL):
        d.polygon([(big / 2 + (x - CX) * k + dx * SS, big / 2 + (y - CY) * k + dy * SS) for x, y in poly], fill=color)
    return layer.resize((size, size), Image.LANCZOS)


def glow(size):
    # Soft colour washes on white: blurred masks pasted with a flat colour, so no dark fringe.
    base = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    for (x, y, r, rgb, a) in [(0.10, 0.92, 0.46, (120, 170, 255), 200), (0.92, 0.86, 0.42, (255, 130, 190), 190), (0.62, 0.02, 0.44, (180, 140, 255), 190)]:
        mask = Image.new('L', (size, size), 0)
        ImageDraw.Draw(mask).ellipse([(x - r) * size, (y - r) * size, (x + r) * size, (y + r) * size], fill=a)
        mask = mask.filter(ImageFilter.GaussianBlur(size * 0.12))
        base.paste(Image.new('RGBA', (size, size), rgb + (255,)), (0, 0), mask)
    return base


icon = Image.alpha_composite(glow(S), plane(S, 1.24, dx=-8, dy=12))
icon.convert('RGB').save('assets/icon.png')
plane(S, 1.24).save('assets/splash-icon.png')
# Android adaptive: the plane stays inside the 66% safe zone.
plane(S, 1.0).save('assets/icon-foreground.png')
print('ok')

# ---- Web: favicons, touch icon, share image (site/public, public, assets/onlydm-brand/favicon) ----
import os, shutil

SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><radialGradient id="b" cx="10%" cy="92%" r="55%"><stop offset="0" stop-color="#78AAFF"/><stop offset="1" stop-color="#78AAFF" stop-opacity="0"/></radialGradient><radialGradient id="p" cx="92%" cy="86%" r="52%"><stop offset="0" stop-color="#FF82BE"/><stop offset="1" stop-color="#FF82BE" stop-opacity="0"/></radialGradient><radialGradient id="v" cx="62%" cy="2%" r="54%"><stop offset="0" stop-color="#B48CFF"/><stop offset="1" stop-color="#B48CFF" stop-opacity="0"/></radialGradient></defs><rect width="120" height="120" rx="27" fill="#fff"/><rect width="120" height="120" rx="27" fill="url(#b)"/><rect width="120" height="120" rx="27" fill="url(#p)"/><rect width="120" height="120" rx="27" fill="url(#v)"/><g transform="translate(60 60) scale(0.30) translate(-227.5 -283.5)" fill="#0A0A0A"><path d="M70 229L378 126L210 296Z"/><path d="M216 303L385 133L283 441Z"/></g></svg>'''

fav = Image.alpha_composite(glow(S), plane(S, 1.30)).convert('RGB')
mask = Image.alpha_composite(glow(S), plane(S, 1.0)).convert('RGB')
touch = icon.convert('RGB')
for d in ('site/public', 'public', 'assets/onlydm-brand/favicon'):
    os.makedirs(d, exist_ok=True)
    for n in (16, 32, 48, 64, 96, 192, 512):
        fav.resize((n, n), Image.LANCZOS).save(f'{d}/favicon-{n}x{n}.png')
    touch.resize((180, 180), Image.LANCZOS).save(f'{d}/apple-touch-icon.png')
    mask.resize((512, 512), Image.LANCZOS).save(f'{d}/maskable-512x512.png')
    fav.save(f'{d}/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    open(f'{d}/favicon.svg', 'w').write(SVG)
touch.resize((512, 512), Image.LANCZOS).save('site/public/onlydm-mark-dark-512.png')

# Share image: swap the old bubble for the plane (the wordmark and headline stay).
og = Image.open('site/public/og.png').convert('RGB')
bg = og.getpixel((70, 100))
ImageDraw.Draw(og).rectangle([80, 62, 152, 134], fill=bg)
tile = Image.alpha_composite(glow(S), plane(S, 1.24, dx=-8, dy=12)).resize((60, 60), Image.LANCZOS)
rounded = Image.new('L', (60, 60), 0)
ImageDraw.Draw(rounded).rounded_rectangle([0, 0, 59, 59], radius=14, fill=255)
og.paste(tile.convert('RGB'), (90, 70), rounded)
og.save('site/public/og.png')
print('web ok')
