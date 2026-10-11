"""Wraps raw simulator captures (docs/screenshots/raw/*.png) in App Store marketing frames at 1320x2868.
Run: python3 scripts/make-screenshots.py   (needs Pillow)"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1320, 2868
RAW, OUT = 'docs/screenshots/raw', 'docs/screenshots'
FONT = 'node_modules/@expo-google-fonts/inter/800ExtraBold/Inter_800ExtraBold.ttf'
SHOTS = [  # (file, line 1, line 2)
    ('whats-left', 'Instagram.', 'Just the DMs.'),
    ('cold-open', 'Quick reply.', 'Lost 47 minutes.'),
    ('total-time', 'See what the', 'scroll costs you.'),
    ('receipt', 'Your time,', 'itemised.'),
    ('trust', 'Sign in on', 'Instagram’s own page.'),
    ('paywall', 'Try it free', 'for 7 days.'),
]


def glow():
    base = Image.new('RGB', (W, H), (255, 255, 255))
    for (x, y, r, rgb, a) in [(0.05, 0.98, 0.55, (120, 170, 255), 210), (0.98, 0.9, 0.5, (255, 130, 190), 200), (0.7, 0.0, 0.5, (180, 140, 255), 200)]:
        m = Image.new('L', (W, H), 0)
        ImageDraw.Draw(m).ellipse([(x - r) * W, (y - r * 0.5) * H, (x + r) * W, (y + r * 0.5) * H], fill=a)
        base.paste(Image.new('RGB', (W, H), rgb), (0, 0), m.filter(ImageFilter.GaussianBlur(220)))
    return base


def frame(name, l1, l2):
    bg = glow()
    d = ImageDraw.Draw(bg)
    f = ImageFont.truetype(FONT, 112)
    for i, t in enumerate((l1, l2)):
        w = d.textlength(t, font=f)
        d.text(((W - w) / 2, 150 + i * 134), t, font=f, fill=(10, 10, 10))
    shot = Image.open(f'{RAW}/{name}.png').convert('RGB')
    sw = 1000
    sh = int(shot.height * sw / shot.width)
    shot = shot.resize((sw, sh), Image.LANCZOS)
    top = 470
    # Screen peeks from the bottom edge, rounded, with a soft shadow.
    mask = Image.new('L', (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], radius=96, fill=255)
    shadow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shadow).rounded_rectangle([(W - sw) / 2, top + 30, (W + sw) / 2, top + sh + 30], radius=96, fill=90)
    bg.paste(Image.new('RGB', (W, H), (40, 40, 60)), (0, 0), shadow.filter(ImageFilter.GaussianBlur(40)))
    bd = ImageDraw.Draw(bg)
    bd.rounded_rectangle([(W - sw) / 2 - 14, top - 14, (W + sw) / 2 + 14, top + sh + 14], radius=110, fill=(12, 12, 12))
    bg.paste(shot, ((W - sw) // 2, top), mask)
    return bg


os.makedirs(OUT, exist_ok=True)
for i, (n, a, b) in enumerate(SHOTS, 1):
    if os.path.exists(f'{RAW}/{n}.png'):
        frame(n, a, b).save(f'{OUT}/{i:02d}-{n}.png')
        print('made', n)
