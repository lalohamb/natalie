from PIL import Image

img = Image.open("docs/design-reference/approved-homepage.png").convert("RGB")
w, h = img.size
print(f"Approved: {w}x{h}px")

sections = [
    ("HERO y=0-190", range(0, 190, 30)),
    ("BIO y=190-310", range(190, 310, 20)),
    ("MINISTRY y=310-440", range(310, 440, 20)),
    ("FEATURED y=440-530", range(440, 530, 15)),
    ("BOOKS y=530-620", range(530, 620, 15)),
    ("EVENTS y=620-700", range(620, 700, 15)),
    ("PARTNER y=700-790", range(700, 790, 15)),
    ("FOOTER y=790-915", range(790, 915, 20)),
]

for label, rows in sections:
    print(f"\n{label}")
    for y in rows:
        y = min(y, h - 1)
        left = img.getpixel((int(w * 0.2), y))
        mid = img.getpixel((int(w * 0.5), y))
        right = img.getpixel((int(w * 0.8), y))
        print(f"  y={y:4d}  L={left}  M={mid}  R={right}")
