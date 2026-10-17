from PIL import Image

img = Image.open("docs/design-reference/approved-footer.png").convert("RGB")
w, h = img.size
print(f"Approved footer: {w}x{h}px")
print(f"Equivalent at 1440px wide: {int(h * 1440/w)}px tall")
print()

# Sample columns to understand layout
print("=== COLUMN STRUCTURE (y=50, mid-footer) ===")
y = 50
for x_pct in range(0, 101, 5):
    x = min(int(w * x_pct / 100), w-1)
    px = img.getpixel((x, y))
    bright = sum(px) // 3
    char = "█" if bright < 60 else ("▒" if bright < 120 else "░")
    print(f"  x={x_pct:3d}%  rgb={px}  {char}")

print()
print("=== TOP ROWS (checking for newsletter band) ===")
for y in range(0, 30, 3):
    samples = [img.getpixel((int(w*x), y)) for x in [0.2, 0.5, 0.8]]
    avg = tuple(sum(s[c] for s in samples)//3 for c in range(3))
    print(f"  y={y:3d}  avg={avg}")

print()
print("=== BOTTOM ROW (copyright bar) ===")
for y in range(h-20, h, 2):
    samples = [img.getpixel((int(w*x), y)) for x in [0.2, 0.5, 0.8]]
    avg = tuple(sum(s[c] for s in samples)//3 for c in range(3))
    print(f"  y={y:3d}  avg={avg}")

print()
# Check if there's a lighter band at top (newsletter) vs dark (footer)
print("=== FULL HEIGHT SCAN ===")
prev = None
for y in range(0, h, 3):
    samples = [img.getpixel((int(w*x), y)) for x in [0.3, 0.5, 0.7]]
    avg = tuple(sum(s[c] for s in samples)//3 for c in range(3))
    dark = avg[0] < 70
    if dark != prev:
        print(f"  y={y:3d} ({y/h*100:.0f}%)  {'DARK espresso' if dark else 'LIGHT'}  avg={avg}")
        prev = dark
