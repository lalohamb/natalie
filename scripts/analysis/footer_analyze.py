from PIL import Image

img = Image.open("docs/design-reference/approved-footer.png").convert("RGB")
w, h = img.size
print(f"Approved footer: {w}x{h}px  ratio 1:{h/w:.2f}")
print(f"At 1440px wide equivalent height: {int(h * 1440/w)}px")
print()

# Sample rows to understand structure
for y in range(0, h, max(1, h//40)):
    y = min(y, h-1)
    samples = [img.getpixel((int(w*x), y)) for x in [0.1, 0.25, 0.4, 0.55, 0.7, 0.85]]
    avg = tuple(sum(s[c] for s in samples)//6 for c in range(3))
    print(f"  y={y:4d} ({y/h*100:5.1f}%)  avg={avg}")
