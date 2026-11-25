from PIL import Image

img = Image.open("docs/design-reference/hero section and section below..png").convert("RGB")
w, h = img.size
print(f"Size: {w}x{h}px")
print(f"Hero section appears to end around y=455 (ivory starts)")
print(f"Bio section: y=455 to y=774")
print()

# Hero section: y=0-455
# Transition at y~455 where ivory background starts
hero_h = 455
bio_h = h - hero_h
print(f"Hero height: {hero_h}px ({hero_h/h*100:.0f}%) → {int(hero_h*1440/w)}px at 1440w")
print(f"Bio height:  {bio_h}px ({bio_h/h*100:.0f}%) → {int(bio_h*1440/w)}px at 1440w")
print()

# Hero: left column analysis (text side)
print("=== HERO LEFT COLUMN (x=0-50%) ===")
for y in range(0, 455, 30):
    left_samples = [img.getpixel((int(w*x), y)) for x in [0.05, 0.15, 0.25, 0.35, 0.45]]
    avg = tuple(sum(s[c] for s in left_samples)//5 for c in range(3))
    print(f"  y={y:4d}  left_avg={avg}")

print()
print("=== HERO RIGHT COLUMN (x=50-100%) ===")
for y in range(0, 455, 30):
    right_samples = [img.getpixel((int(w*x), y)) for x in [0.55, 0.65, 0.75, 0.85, 0.95]]
    avg = tuple(sum(s[c] for s in right_samples)//5 for c in range(3))
    print(f"  y={y:4d}  right_avg={avg}")

print()
print("=== BIO SECTION (y=455-774) ===")
for y in range(455, h, 25):
    left = img.getpixel((int(w*0.25), y))
    right = img.getpixel((int(w*0.75), y))
    print(f"  y={y:4d}  L={left}  R={right}")
