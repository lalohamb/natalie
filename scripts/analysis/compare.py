from PIL import Image

approved = Image.open("docs/design-reference/approved-homepage.png").convert("RGB")
current = Image.open("docs/design-reference/screenshots/page-1440.png").convert("RGB")

aw, ah = approved.size
cw, ch = current.size

print(f"Approved: {aw}x{ah}  ratio 1:{ah/aw:.2f}")
print(f"Current:  {cw}x{ch}  ratio 1:{ch/cw:.2f}")
print(f"Current is {(ch/cw)/(ah/aw):.2f}x taller than approved")
print()

# Approved section boundaries (in approved px)
approved_sections = [
    ("nav+hero",   0,   190),
    ("bio",        190, 310),
    ("ministry",   310, 440),
    ("featured",   440, 530),
    ("books",      530, 620),
    ("events",     620, 700),
    ("partner",    700, 790),
    ("footer",     790, 915),
]

print("=== APPROVED section heights at 1440px equivalent ===")
for name, s, e in approved_sections:
    equiv = int((e - s) * 1440 / aw)
    pct = (e - s) / ah * 100
    print(f"  {name:15s}: {pct:5.1f}%  ~{equiv}px")

print()
print("=== CURRENT color bands at 1440px ===")
prev = None
changes = []
for y in range(0, ch, 20):
    px = [current.getpixel((int(cw * x), y)) for x in [0.2, 0.5, 0.8]]
    avg = tuple(sum(p[c] for p in px) // 3 for c in range(3))
    band = (avg[0] // 30, avg[1] // 30, avg[2] // 30)
    if band != prev:
        changes.append((y, avg))
        prev = band

for y, color in changes:
    pct = y / ch * 100
    print(f"  y={y:5d} ({pct:5.1f}%)  rgb={color}")
