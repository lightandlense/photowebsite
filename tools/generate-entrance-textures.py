"""
Generate photographic-style placeholder textures for the entrance parallax layers.
Uses only Pillow (PIL) and stdlib — no external APIs or AI models.
Run: python tools/generate-entrance-textures.py
"""

import os
import random
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images", "entrance")


def ensure_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def add_noise(img, intensity=12):
    """Add random pixel noise to simulate photographic grain."""
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            noise = random.randint(-intensity, intensity)
            pixels[x, y] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise)),
            )
    return img


def blend(c1, c2, t):
    """Linearly blend two RGB tuples by factor t (0=c1, 1=c2)."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def generate_sky():
    """Dark night sky with urban atmosphere — 1920x1080."""
    print("Generating sky.jpg...")
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h))
    pixels = img.load()

    top_color = (10, 10, 20)       # #0a0a14 — deep night
    mid_color = (26, 26, 46)       # #1a1a2e — slightly lighter midnight blue
    horizon_color = (42, 26, 24)   # #2a1a18 — warm glow at horizon

    # Gradient from top to bottom
    for y in range(h):
        t = y / h
        if t < 0.6:
            t2 = t / 0.6
            c = blend(top_color, mid_color, t2)
        else:
            t2 = (t - 0.6) / 0.4
            c = blend(mid_color, horizon_color, t2)
        for x in range(w):
            pixels[x, y] = c

    # Add atmospheric haze — horizontal bands of subtle variation
    for y in range(h):
        band_noise = int(math.sin(y * 0.03) * 4 + math.sin(y * 0.07) * 2)
        for x in range(0, w, 2):
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                max(0, min(255, r + band_noise)),
                max(0, min(255, g + band_noise)),
                max(0, min(255, b + band_noise)),
            )

    # Scatter stars — sparse, upper third only
    for _ in range(180):
        sx = random.randint(0, w - 1)
        sy = random.randint(0, h // 3)
        brightness = random.randint(160, 255)
        warmth = random.randint(0, 30)  # slight yellow-white variation
        star_color = (brightness, brightness - warmth // 2, brightness - warmth)
        # Size 1-2px
        if random.random() < 0.2:
            for dy in range(-1, 2):
                for dx in range(-1, 2):
                    nx, ny = sx + dx, sy + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        dist = abs(dx) + abs(dy)
                        alpha = max(0, 1 - dist * 0.5)
                        r, g, b = pixels[nx, ny]
                        sc = star_color
                        pixels[nx, ny] = (
                            int(r + (sc[0] - r) * alpha),
                            int(g + (sc[1] - g) * alpha),
                            int(b + (sc[2] - b) * alpha),
                        )
        else:
            pixels[sx, sy] = star_color

    # Warm glow band — bottom 20% (urban light pollution)
    glow_start = int(h * 0.8)
    for y in range(glow_start, h):
        t = (y - glow_start) / (h - glow_start)
        glow_strength = t * 0.4
        for x in range(w):
            # Vary glow intensity across horizontal axis (bell curve centered)
            hx = x / w - 0.5
            hglow = max(0, 1 - hx * hx * 3) * glow_strength
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                min(255, int(r + 60 * hglow)),
                min(255, int(g + 25 * hglow)),
                min(255, int(b + 5 * hglow)),
            )

    img = add_noise(img, intensity=8)
    img = img.filter(ImageFilter.GaussianBlur(0.5))

    out_path = os.path.join(OUTPUT_DIR, "sky.jpg")
    img.save(out_path, "JPEG", quality=85)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  -> sky.jpg ({size_kb} KB)")


def generate_building():
    """Brick wall facade — 1920x1080."""
    print("Generating building.jpg...")
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (36, 26, 14))  # #241a0e base
    draw = ImageDraw.Draw(img)

    # Mortar color (slightly darker)
    mortar_color = (22, 15, 7)
    # Fill with mortar first
    draw.rectangle([0, 0, w - 1, h - 1], fill=mortar_color)

    # Brick parameters
    brick_w = 60
    brick_h = 25
    mortar_w = 3
    mortar_h = 3

    row_h = brick_h + mortar_h
    col_w = brick_w + mortar_w

    num_rows = h // row_h + 2
    num_cols = w // col_w + 2

    rng = random.Random(42)  # fixed seed for reproducibility

    for row in range(num_rows):
        offset = (col_w // 2) if (row % 2 == 1) else 0
        y_top = row * row_h
        y_bot = y_top + brick_h

        for col in range(-1, num_cols + 1):
            x_left = col * col_w + offset - mortar_w
            x_right = x_left + brick_w

            # Base brick color with variation
            base_r, base_g, base_b = 48, 32, 16
            var = rng.randint(-18, 18)
            warm_var = rng.randint(-8, 12)
            brick_r = max(10, min(100, base_r + var + warm_var))
            brick_g = max(5, min(70, base_g + var))
            brick_b = max(2, min(40, base_b + var - 4))

            if x_right >= 0 and x_left < w and y_bot >= 0 and y_top < h:
                x1 = max(0, x_left)
                x2 = min(w - 1, x_right)
                y1 = max(0, y_top)
                y2 = min(h - 1, y_bot)
                draw.rectangle([x1, y1, x2, y2], fill=(brick_r, brick_g, brick_b))

                # Subtle brick surface variation — horizontal stripe
                if y2 - y1 > 6:
                    mid_y = (y1 + y2) // 2
                    light_var = rng.randint(3, 10)
                    draw.rectangle(
                        [x1, mid_y - 2, x2, mid_y + 2],
                        fill=(
                            min(255, brick_r + light_var),
                            min(255, brick_g + light_var),
                            min(255, brick_b + light_var),
                        ),
                    )

    # Suggest a window — upper right area, slightly lighter rectangle
    win_x1, win_y1, win_x2, win_y2 = w - 300, 80, w - 100, 230
    # Dark window pane
    draw.rectangle([win_x1, win_y1, win_x2, win_y2], fill=(8, 8, 14))
    # Window frame (lighter)
    draw.rectangle([win_x1 - 6, win_y1 - 6, win_x2 + 6, win_y2 + 6], outline=(55, 40, 22), width=5)

    # Street number "127" near upper-left
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    draw.text((30, 30), "127", fill=(90, 75, 55), font=font)

    img_data = img.load()
    img = add_noise(img, intensity=14)

    # Vignette darkening at edges
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            # Vignette factor — distance from center
            dx = (x / w - 0.5) * 2
            dy = (y / h - 0.5) * 2
            vignette = max(0, 1 - (dx * dx + dy * dy) * 0.5)
            vignette = 0.6 + vignette * 0.4  # mild darkening at edges
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                int(r * vignette),
                int(g * vignette),
                int(b * vignette),
            )

    out_path = os.path.join(OUTPUT_DIR, "building.jpg")
    img.save(out_path, "JPEG", quality=85)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  -> building.jpg ({size_kb} KB)")


def generate_door():
    """Industrial metal door (portrait) — 800x1200."""
    print("Generating door.jpg...")
    w, h = 800, 1200
    img = Image.new("RGB", (w, h), (42, 42, 42))
    pixels = img.load()

    rng = random.Random(99)

    # Vertical brushed metal strokes
    for x in range(w):
        col_base = rng.randint(32, 52)
        for y in range(h):
            # Very subtle variation to simulate brushed direction
            stripe_var = int(math.sin(x * 0.8 + y * 0.05) * 3)
            v = max(10, min(80, col_base + stripe_var))
            # Slightly warm gray (not pure gray)
            pixels[x, y] = (v, v - 2, v - 4)

    # Panel division lines — horizontal
    panel_y1 = h // 3
    panel_y2 = (h * 2) // 3
    draw = ImageDraw.Draw(img)

    for py in [panel_y1, panel_y2]:
        # Dark groove line
        draw.rectangle([10, py - 2, w - 10, py + 2], fill=(18, 17, 16))
        # Subtle highlight above the groove
        draw.rectangle([10, py - 4, w - 10, py - 3], fill=(65, 63, 60))

    # Door handle — right side, centered vertically
    handle_x = int(w * 0.82)
    handle_y = h // 2
    handle_w, handle_h = 14, 28
    # Handle body
    draw.rectangle(
        [handle_x - handle_w // 2, handle_y - handle_h // 2,
         handle_x + handle_w // 2, handle_y + handle_h // 2],
        fill=(138, 122, 96),
    )
    # Handle highlight
    draw.rectangle(
        [handle_x - handle_w // 2 + 2, handle_y - handle_h // 2 + 2,
         handle_x - 2, handle_y + handle_h // 2 - 2],
        fill=(170, 155, 120),
    )

    img = add_noise(img, intensity=10)

    # Heavy vignette
    pixels = img.load()
    for y in range(h):
        for x in range(w):
            dx = (x / w - 0.5) * 2
            dy = (y / h - 0.5) * 2
            dist = math.sqrt(dx * dx + dy * dy)
            vignette = max(0, 1 - dist * 0.55)
            vignette = 0.4 + vignette * 0.6  # stronger edge darkening for depth
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                int(r * vignette),
                int(g * vignette),
                int(b * vignette),
            )

    out_path = os.path.join(OUTPUT_DIR, "door.jpg")
    img.save(out_path, "JPEG", quality=85)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  -> door.jpg ({size_kb} KB)")


def generate_ground():
    """Concrete sidewalk — 1920x400."""
    print("Generating ground.jpg...")
    w, h = 1920, 400
    img = Image.new("RGB", (w, h))
    pixels = img.load()

    rng = random.Random(77)

    # Base: dark gray-brown, gradient top to bottom (lighter at top)
    top_color = (32, 28, 22)   # slightly lighter at building edge
    bot_color = (14, 12, 8)    # darker in foreground shadow

    for y in range(h):
        t = y / h
        c = blend(top_color, bot_color, t)
        for x in range(w):
            pixels[x, y] = c

    draw = ImageDraw.Draw(img)

    # Pavement joint cracks — subtle horizontal lines with slight waviness
    joint_positions = [h // 4, h // 2, (h * 3) // 4]
    for jy in joint_positions:
        for x in range(w):
            wave = int(math.sin(x * 0.02) * 2 + math.sin(x * 0.007) * 1.5)
            jy_local = jy + wave
            if 0 <= jy_local < h:
                r, g, b = pixels[x, jy_local]
                # Slightly darker crack
                pixels[x, jy_local] = (max(0, r - 8), max(0, g - 8), max(0, b - 5))
                # And a lighter edge just above (crack highlight)
                if jy_local > 0:
                    r2, g2, b2 = pixels[x, jy_local - 1]
                    pixels[x, jy_local - 1] = (min(255, r2 + 5), min(255, g2 + 5), min(255, b2 + 3))

    # Lighter strip near top — curb edge catching ambient light
    for y in range(min(30, h)):
        t = 1 - y / 30
        for x in range(w):
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                min(255, int(r + 20 * t)),
                min(255, int(g + 16 * t)),
                min(255, int(b + 10 * t)),
            )

    img = add_noise(img, intensity=16)  # coarser grain for concrete feel
    img = img.filter(ImageFilter.GaussianBlur(0.3))

    out_path = os.path.join(OUTPUT_DIR, "ground.jpg")
    img.save(out_path, "JPEG", quality=85)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  -> ground.jpg ({size_kb} KB)")


def main():
    ensure_dir()
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    generate_sky()
    generate_building()
    generate_door()
    generate_ground()
    print()
    print("Done. All four entrance textures generated.")


if __name__ == "__main__":
    main()
