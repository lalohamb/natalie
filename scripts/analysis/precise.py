from PIL import Image

current = Image.open("docs/design-reference/screenshots/page-1440.png").convert("RGB")
cw, ch = current.size
print(f"Size: {cw}x{ch}")

def classify(rgb):
    r, g, b = rgb
    if r < 60 and g < 50 and b < 45:
        return "ESPRESSO"
    if r < 80 and g > 60 and b < 80 and g > r:
        return "FOREST"
    if r > 235 and g > 228 and b > 218:
        return "IVORY"
    if r > 220 and g > 208 and b > 190 and r > b + 20:
        return "LINEN"
    return None

# Find solid-color section boundaries
prev = None
transitions = []
for y in range(0, ch, 2):
    # Sample 5 points across center
    samples = [current.getpixel((int(cw * x), y)) for x in [0.2, 0.35, 0.5, 0.65, 0.8]]
    # Count how many classify as same type
    types = [classify(s) for s in samples]
    dominant = max(set(t for t in types if t), key=lambda t: types.count(t), default=None)
    if dominant and types.count(dominant) >= 4:
        if dominant != prev:
            transitions.append((y, dominant))
            prev = dominant
    elif prev is not None:
        prev = None

for y, t in transitions:
    print(f"  y={y:5d} ({y/ch*100:5.1f}%)  {t}")
