"""
Generate a blurred photographic darkroom background image.
Simulates what a real darkroom looks like — equipment silhouettes, shelves,
amber safe light glow — all heavily blurred to create atmosphere.
Run: python tools/generate-darkroom-bg.py
"""

import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images", "darkroom")


def blend(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def add_noise(img, intensity=8):
    pixels = img.load()
    w, h = img.size
    rng = random.Random(55)
    for y in range(height := h):
        for x in range(width := w):
            r, g, b = pixels[x, y]
            noise = rng.randint(-intensity, intensity)
            pixels[x, y] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise)),
            )
    return img


def generate_darkroom_bg():
    """Create a blurred photographic darkroom interior — 1920x1080."""
    print("Generating darkroom-bg.jpg...")
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (18, 12, 8))
    draw = ImageDraw.Draw(img)
    rng = random.Random(42)

    # Base: very dark warm brown, slight gradient
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            t = y / h
            base_r = int(18 + t * 6)
            base_g = int(12 + t * 3)
            base_b = int(8 + t * 2)
            pixels[x, y] = (base_r, base_g, base_b)

    # Wall/shelf horizontal elements — subtle lighter bands suggesting shelves
    shelf_positions = [int(h * 0.2), int(h * 0.35), int(h * 0.55)]
    for sy in shelf_positions:
        shelf_h = rng.randint(4, 10)
        brightness = rng.randint(8, 18)
        draw.rectangle([0, sy, w, sy + shelf_h],
                        fill=(26 + brightness, 18 + brightness, 12 + brightness))

    # Enlarger silhouette — large dark shape left-center
    enlarger_x = int(w * 0.25)
    enlarger_y = int(h * 0.15)
    # Vertical column
    draw.rectangle([enlarger_x - 15, enlarger_y, enlarger_x + 15, int(h * 0.75)],
                    fill=(10, 7, 5))
    # Head/lamp at top
    draw.rectangle([enlarger_x - 40, enlarger_y, enlarger_x + 40, enlarger_y + 50],
                    fill=(12, 8, 6))
    # Base plate
    draw.rectangle([enlarger_x - 60, int(h * 0.7), enlarger_x + 60, int(h * 0.75)],
                    fill=(14, 10, 7))

    # Developing trays on counter — right side
    counter_y = int(h * 0.7)
    draw.rectangle([int(w * 0.55), counter_y, int(w * 0.95), counter_y + 8],
                    fill=(28, 20, 14))
    # Three trays
    for i, tx in enumerate([0.6, 0.72, 0.84]):
        tray_x = int(w * tx)
        tray_brightness = 22 + i * 3
        draw.rectangle([tray_x, counter_y + 10, tray_x + 100, counter_y + 45],
                        fill=(tray_brightness, tray_brightness - 4, tray_brightness - 8))
        # Liquid reflection
        draw.rectangle([tray_x + 5, counter_y + 15, tray_x + 95, counter_y + 40],
                        fill=(tray_brightness + 5, tray_brightness, tray_brightness - 5))

    # Bottles on shelf — upper right
    for i in range(6):
        bx = int(w * 0.7) + i * 35
        by = int(h * 0.18)
        bottle_h = rng.randint(35, 55)
        bottle_w = rng.randint(12, 18)
        brightness = rng.randint(15, 30)
        draw.rectangle([bx, by - bottle_h, bx + bottle_w, by],
                        fill=(brightness + 5, brightness, brightness - 3))

    # Amber safe light glow — upper left, warm radial
    for y in range(h):
        for x in range(w):
            # Distance from safe light source (upper-left area)
            dx = (x / w - 0.12)
            dy = (y / h - 0.08)
            dist = math.sqrt(dx * dx + dy * dy)
            glow = max(0, 1 - dist * 1.8) ** 2
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                min(255, int(r + 80 * glow)),
                min(255, int(g + 35 * glow)),
                min(255, int(b + 5 * glow)),
            )

    # Second, dimmer warm glow from right side (bounce light)
    for y in range(h):
        for x in range(w):
            dx = (x / w - 0.9)
            dy = (y / h - 0.4)
            dist = math.sqrt(dx * dx + dy * dy)
            glow = max(0, 1 - dist * 2.5) ** 2
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                min(255, int(r + 30 * glow)),
                min(255, int(g + 12 * glow)),
                min(255, int(b + 3 * glow)),
            )

    # Add noise before blur
    img = add_noise(img, intensity=10)

    # Heavy gaussian blur — the key to the photographic background look
    img = img.filter(ImageFilter.GaussianBlur(radius=18))

    # Vignette
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            dx = (x / w - 0.5) * 2
            dy = (y / h - 0.5) * 2
            dist = math.sqrt(dx * dx + dy * dy)
            vignette = max(0, 1 - dist * 0.6)
            vignette = 0.5 + vignette * 0.5
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                int(r * vignette),
                int(g * vignette),
                int(b * vignette),
            )

    out_path = os.path.join(OUTPUT_DIR, "darkroom-bg.jpg")
    img.save(out_path, "JPEG", quality=85)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  -> darkroom-bg.jpg ({size_kb} KB)")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    generate_darkroom_bg()
    print()
    print("Done. Darkroom background generated.")


if __name__ == "__main__":
    main()
