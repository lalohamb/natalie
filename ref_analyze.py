from PIL import Image

img = Image.open("docs/design-reference/hero section and section below..png").convert("RGB")
w, h = img.size
print(f"Size: {w}x{h}px  ratio 1:{h/w:.2f}")
print(f"Equivalent at 1440px: {int(h * 1440/w)}px tall")
print()

# Full height scan for section boundaries
print("=== COLOR SCAN ===")
prev = None
for y in range(0, h, 5):
    samples = [img.getpixel((int(w*x), y)) for x in [0.1, 0.3, 0.5, 0.7, 0.9]]
    avg = tuple(sum(s[c] for s in samples)//5 for c in range(3))
    band = (avg[0]//25, avg[1]//25, avg[2]//25)
    if band != prev:
        print(f"  y={y:5d} ({y/h*100:5.1f}%)  rgb={avg}")
        prev = band

print()
# Left vs right at key rows
print("=== LEFT vs RIGHT at key rows ===")
for y in [int(h*p) for p in [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]]:
    y = min(y, h-1)
    left = img.getpixel((int(w*0.25), y))
    right = img.getpixel((int(w*0.75), y))
    print(f"  y={y:5d} ({y/h*100:4.0f}%)  L={left}  R={right}")
