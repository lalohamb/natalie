from PIL import Image

current = Image.open("docs/design-reference/screenshots/page-1440.png").convert("RGB")
cw, ch = current.size

# Find major section transitions by looking for solid color bands
def is_espresso(rgb):
    return rgb[0] < 60 and rgb[1] < 50 and rgb[2] < 45

def is_forest(rgb):
    return rgb[0] < 80 and rgb[1] > 60 and rgb[2] < 80 and rgb[1] > rgb[0]

def is_ivory(rgb):
    return rgb[0] > 230 and rgb[1] > 225 and rgb[2] > 215

def is_linen(rgb):
    return rgb[0] > 220 and rgb[1] > 210 and rgb[2] > 195 and rgb[0] > rgb[2] + 15

# Sample center column
print("Scanning for section boundaries...")
prev_type = None
for y in range(0, ch, 5):
    px = [current.getpixel((int(cw * x), y)) for x in [0.3, 0.5, 0.7]]
    avg = tuple(sum(p[c] for p in px) // 3 for c in range(3))
    
    if is_espresso(avg):
        t = "ESPRESSO"
    elif is_forest(avg):
        t = "FOREST"
    elif is_linen(avg):
        t = "LINEN"
    elif is_ivory(avg):
        t = "IVORY"
    else:
        t = f"other({avg})"
    
    if t != prev_type:
        print(f"  y={y:5d} ({y/ch*100:5.1f}%)  {t}")
        prev_type = t
