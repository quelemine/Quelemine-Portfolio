import struct
import zlib
import os

w, h = 500, 500
cx, cy = w // 2, h // 2
rows = []

for y in range(h):
    row = bytearray([0])  # filter byte per row
    for x in range(w):
        dx, dy = x - cx, y - cy
        t = min((dx*dx + dy*dy)**0.5 / (w * 0.6), 1.0)
        r = int(11 + 19 * t)
        g = int(31 + 27 * t)
        b = int(61 + 34 * t)
        # head circle
        if ((x - cx)**2 + (y - (cy - 40))**2)**0.5 < 110:
            r, g, b = 59, 130, 246
        # shoulder ellipse
        bx = (x - cx) / (w * 0.38)
        by = (y - (cy + 160)) / (h * 0.28)
        if bx*bx + by*by < 1.0 and y > cy:
            r, g, b = 59, 130, 246
        row += bytes([r, g, b])
    rows.append(bytes(row))

raw = b''.join(rows)
comp = zlib.compress(raw, 6)

def chunk(name, data):
    c = name + data
    return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', comp) + chunk(b'IEND', b'')

out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   'public', 'images', 'profile', 'isaac-profile.jpg')
os.makedirs(os.path.dirname(out), exist_ok=True)

with open(out, 'wb') as f:
    f.write(png)

print('Written:', len(png), 'bytes')
print('Path:', out)
print('Exists:', os.path.exists(out))
