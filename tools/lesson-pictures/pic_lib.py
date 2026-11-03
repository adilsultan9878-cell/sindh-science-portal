"""Small drawing kit for the lesson pictures: outlined flat shapes, people, animals and things.
Every helper returns SVG markup; most draw around (0, 0) so scenes place them with G(..., x=, y=, s=).
"""
import math

OUT = '#2d3142'  # outline colour used by every drawing
THEMES = {
    'sky': ('#d3eefa', '#f3fbff'), 'cream': ('#fff0d6', '#fffaf1'), 'mint': ('#d8f2e3', '#f4fcf7'),
    'lilac': ('#e7e0fa', '#f9f7ff'), 'peach': ('#ffe0d1', '#fff6f1'), 'night': ('#121a3d', '#2c3a78'),
    'smog': ('#cbcabd', '#ebeae2'), 'dusk': ('#1f2557', '#5b4f97'),
}


def attrs(kw):
    return ''.join(f' {k.rstrip("_").replace("_", "-")}="{v}"' for k, v in kw.items() if v is not None)


def E(tag, inner=None, **kw):
    return f'<{tag}{attrs(kw)}/>' if inner is None else f'<{tag}{attrs(kw)}>{inner}</{tag}>'


def S(tag, fill, sw=3, **kw):
    if sw:
        kw.setdefault('stroke', OUT)
        kw.update(stroke_width=sw, stroke_linejoin='round', stroke_linecap='round')
    return E(tag, fill=fill, **kw)


def G(*items, x=0, y=0, s=1, r=0, flip=False, op=None):
    t = []
    if x or y:
        t.append(f'translate({x:g} {y:g})')
    if r:
        t.append(f'rotate({r:g})')
    if s != 1 or flip:
        t.append(f'scale({-s if flip else s:g} {s:g})')
    return E('g', ''.join(items), transform=' '.join(t) or None, opacity=op)


def circ(cx, cy, r, fill, sw=3, **kw): return S('circle', fill, sw, cx=cx, cy=cy, r=r, **kw)
def ell(cx, cy, rx, ry, fill, sw=3, **kw): return S('ellipse', fill, sw, cx=cx, cy=cy, rx=rx, ry=ry, **kw)
def rect(x, y, w, h, fill, rx=0, sw=3, **kw): return S('rect', fill, sw, x=x, y=y, width=w, height=h, rx=rx or None, **kw)
def path(d, fill, sw=3, **kw): return S('path', fill, sw, d=d, **kw)
def poly(pts, fill, sw=3, **kw): return S('polygon', fill, sw, points=' '.join(f'{x:g},{y:g}' for x, y in pts), **kw)


def line(x1, y1, x2, y2, c=OUT, w=3, **kw):
    return E('line', x1=x1, y1=y1, x2=x2, y2=y2, stroke=c, stroke_width=w, stroke_linecap='round', **kw)


def stroke(d, c=OUT, w=3, **kw):
    return E('path', d=d, fill='none', stroke=c, stroke_width=w, stroke_linecap='round', stroke_linejoin='round', **kw)


def tube(d, c, w=9):
    """A thick outlined line (arms, legs, worms, wires)."""
    return stroke(d, OUT, w + 5) + stroke(d, c, w)


def limb(x1, y1, x2, y2, c, w=9):
    return tube(f'M{x1:g},{y1:g} L{x2:g},{y2:g}', c, w)


def shade(c, f=0.78):
    c = c.lstrip('#')
    return '#' + ''.join(f'{max(0, min(255, int(int(c[i:i + 2], 16) * f))):02x}' for i in (0, 2, 4))


def bumpy(cx, cy, rx, ry, n, bump=1.1, start=-90):
    """A scalloped outline (tree crowns, clouds, smoke, bushes)."""
    pts = [(cx + rx * math.cos(math.radians(start + 360 * i / n)), cy + ry * math.sin(math.radians(start + 360 * i / n))) for i in range(n)]
    d = f'M{pts[0][0]:.1f},{pts[0][1]:.1f}'
    for i in range(n):
        (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % n]
        r = math.hypot(x2 - x1, y2 - y1) / 2 * bump
        d += f' A{r:.1f},{r:.1f} 0 0 1 {x2:.1f},{y2:.1f}'
    return d + 'Z'


def svg(theme, body):
    top, bottom = THEMES[theme]
    defs = (f'<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient>'
            '<radialGradient id="glow"><stop offset="0" stop-color="#fff59d" stop-opacity=".95"/><stop offset=".55" stop-color="#ffe082" stop-opacity=".45"/>'
            '<stop offset="1" stop-color="#ffe082" stop-opacity="0"/></radialGradient>'
            '<filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>'
            '<clipPath id="clip"><rect width="640" height="400" rx="24"/></clipPath>'
            # A strip of Sindhi ajrak block-print pattern runs along the foot of every picture.
            '<pattern id="aj" width="24" height="14" patternUnits="userSpaceOnUse"><rect width="24" height="14" fill="#8e1b1f"/>'
            '<path d="M12 2 L17 7 L12 12 L7 7 Z" fill="#f7efe2"/><circle cx="12" cy="7" r="1.8" fill="#1d2a5b"/>'
            '<circle cx="0" cy="7" r="2.4" fill="#1d2a5b"/><circle cx="24" cy="7" r="2.4" fill="#1d2a5b"/></pattern>')
    body = ''.join(body) if isinstance(body, (list, tuple)) else body
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400"><defs>{defs}</defs>'
            f'<g clip-path="url(#clip)"><rect width="640" height="400" fill="url(#bg)"/>{body}'
            '<rect y="383" width="640" height="3" fill="#1d2a5b"/><rect y="386" width="640" height="14" fill="url(#aj)"/></g></svg>')


# ---------- layout helpers ----------

def panel(x, y, w, h, fill='#ffffff', op=0.65):
    return E('rect', x=x, y=y, width=w, height=h, rx=20, fill=fill, opacity=op)


def divider(x, y1=30, y2=360):
    return line(x, y1, x, y2, '#ffffff', 4, stroke_dasharray='2 12', opacity=0.9)


def arrow(x1, y1, x2, y2, c='#e53935', w=6, head=16):
    a = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - head * math.cos(a), y2 - head * math.sin(a)
    side = head * 0.62
    return (line(x1, y1, bx, by, c, w) +
            poly([(x2, y2), (bx + side * math.cos(a + math.pi / 2), by + side * math.sin(a + math.pi / 2)),
                  (bx - side * math.cos(a + math.pi / 2), by - side * math.sin(a + math.pi / 2))], c, 0))


def carrow(x1, y1, cx, cy, x2, y2, c='#e53935', w=6, head=16, dash=None):
    """Curved arrow (quadratic) with a head at the end."""
    a = math.atan2(y2 - cy, x2 - cx)
    bx, by = x2 - head * 0.8 * math.cos(a), y2 - head * 0.8 * math.sin(a)
    side = head * 0.62
    return (stroke(f'M{x1:g},{y1:g} Q{cx:g},{cy:g} {bx:.1f},{by:.1f}', c, w, stroke_dasharray=dash) +
            poly([(x2, y2), (bx + side * math.cos(a + math.pi / 2), by + side * math.sin(a + math.pi / 2)),
                  (bx - side * math.cos(a + math.pi / 2), by - side * math.sin(a + math.pi / 2))], c, 0))


def tick(x, y, r=17):
    return circ(x, y, r, '#43a047', 3, stroke='#ffffff') + stroke(f'M{x - 8},{y} l5,7 l11,-13', '#ffffff', 4.5)


def cross(x, y, r=17):
    return (circ(x, y, r, '#e53935', 3, stroke='#ffffff') + line(x - 7, y - 7, x + 7, y + 7, '#ffffff', 4.5) +
            line(x + 7, y - 7, x - 7, y + 7, '#ffffff', 4.5))


def sparkle(x, y, s=1, c='#ffffff'):
    return G(path('M0,-10 Q1,-1 10,0 Q1,1 0,10 Q-1,1 -10,0 Q-1,-1 0,-10 Z', c, 0), x=x, y=y, s=s)


def stars(pts, c='#fff8e1'):
    return ''.join(circ(x, y, r, c, 0, opacity=0.85) for x, y, r in pts)


# ---------- nature ----------

def ground(y=300, c='#a8d672', c2='#8cc152'):
    return (path(f'M-10,{y} C120,{y - 18} 220,{y + 10} 330,{y - 4} S540,{y - 14} 650,{y} V410 H-10 Z', c, 0) +
            path(f'M-10,{y + 34} C140,{y + 20} 260,{y + 44} 380,{y + 30} S560,{y + 22} 650,{y + 36} V410 H-10 Z', c2, 0, opacity=0.5))


def soil_band(y, h=None, c='#9a6b4a', pebbles=True):
    h = h or 400 - y
    out = rect(-10, y, 660, h, c, sw=0)
    if pebbles:
        for i, (px, py, r) in enumerate([(40, 30, 5), (130, 60, 4), (210, 22, 6), (300, 75, 5), (380, 35, 4), (460, 64, 6), (560, 28, 5), (610, 80, 4), (90, 100, 6), (520, 110, 5)]):
            if py < h - 10:
                out += ell(px, y + py, r * 1.4, r, shade(c, 0.75), 0)
    return out


def sun(r=34, face=False):
    rays = ''.join(line(math.cos(math.radians(a)) * (r + 10), math.sin(math.radians(a)) * (r + 10),
                        math.cos(math.radians(a)) * (r + 24), math.sin(math.radians(a)) * (r + 24), '#ffb300', 6) for a in range(0, 360, 30))
    out = rays + circ(0, 0, r, '#ffd54f')
    if face:
        out += circ(-10, -4, 3, OUT, 0) + circ(10, -4, 3, OUT, 0) + stroke('M-10,8 Q0,16 10,8', OUT, 3)
    return out


def cloud(c='#ffffff', sw=3):
    return path('M-58,20 C-80,20 -80,-6 -56,-8 C-54,-34 -18,-40 -4,-20 C10,-42 52,-34 48,-8 C72,-8 74,20 52,20 Z', c, sw)


def rain(x, y, n=5, c='#4fc3f7', dx=18):
    return ''.join(line(x + i * dx, y + (i % 2) * 12, x + i * dx - 5, y + 14 + (i % 2) * 12, c, 4) for i in range(n))


def drop(c='#4fc3f7', s=1):
    return G(path('M0,-18 C8,-6 12,0 12,6 A12,12 0 0 1 -12,6 C-12,0 -8,-6 0,-18 Z', c) +
             path('M-5,2 Q-5,-4 -2,-7', 'none', 0) + stroke('M-5,4 Q-6,-2 -2,-6', '#ffffff', 2.5), s=s)


def tree(crown='#66bb6a', trunk='#8d6e63', fruit=None, nest=False):
    out = path('M-10,0 L-7,-62 Q0,-68 7,-62 L10,0 Z', trunk)
    out += stroke('M0,-40 L-18,-62', OUT, 9) + stroke('M0,-40 L-18,-62', trunk, 5)
    out += path(bumpy(0, -104, 56, 48, 9), crown)
    out += path(bumpy(-14, -116, 22, 18, 6), shade(crown, 1.12), 0, opacity=0.7)
    if fruit:
        for fx, fy in ((-28, -96), (20, -120), (30, -86), (-6, -78), (-30, -126)):
            out += circ(fx, fy, 7, fruit, 2.5)
    if nest:
        out += path('M14,-74 Q34,-60 54,-74 Q50,-62 34,-60 Q18,-62 14,-74 Z', '#8d6e63', 2.5) + circ(26, -76, 5, '#e3f2fd', 2) + circ(38, -77, 5, '#e3f2fd', 2)
    return out


def bush(c='#81c784'):
    return path(bumpy(0, -18, 34, 20, 7), c)


def grass(c='#66bb6a'):
    return stroke('M-10,0 Q-12,-12 -16,-18 M-4,0 Q-4,-14 -2,-22 M3,0 Q6,-12 12,-18 M9,0 Q12,-8 18,-12', c, 3.5)


def flower(petal='#ec407a', center='#ffd54f', h=60):
    out = stroke(f'M0,0 Q4,{-h / 2} 0,{-h}', '#43a047', 4)
    out += path(f'M1,{-h * 0.4} Q16,{-h * 0.55} 22,{-h * 0.42} Q12,{-h * 0.3} 1,{-h * 0.4} Z', '#66bb6a', 2.5)
    for a in range(0, 360, 60):
        out += circ(math.cos(math.radians(a)) * 10, -h + math.sin(math.radians(a)) * 10, 8, petal, 2.5)
    return out + circ(0, -h, 7, center, 2.5)


def sunflower():
    out = stroke('M0,0 Q8,-60 10,-112', '#43a047', 7)
    out += path('M4,-50 Q-26,-62 -30,-44 Q-12,-38 4,-50 Z', '#66bb6a', 2.5) + path('M7,-78 Q34,-92 38,-74 Q20,-66 7,-78 Z', '#66bb6a', 2.5)
    for a in range(0, 360, 30):
        out += ell(10 + math.cos(math.radians(a)) * 22, -124 + math.sin(math.radians(a)) * 22, 12, 6, '#ffca28', 2.5,
                   transform=f'rotate({a} {10 + math.cos(math.radians(a)) * 22:.1f} {-124 + math.sin(math.radians(a)) * 22:.1f})')
    return out + circ(10, -124, 16, '#795548') + ''.join(circ(10 + dx, -124 + dy, 2, '#4e342e', 0) for dx, dy in ((-5, -5), (5, -4), (0, 3), (-6, 5), (6, 6)))


def rock(c='#9e9e9e', s=1):
    return G(path('M-30,0 L-34,-16 L-20,-30 L4,-34 L26,-24 L34,-6 L28,0 Z', c) + path('M-20,-26 L2,-30 L-6,-20 Z', shade(c, 1.18), 0), s=s)


def mountain(c='#8d9db6', snow=True):
    out = poly([(-90, 0), (-10, -110), (30, -60), (50, -84), (110, 0)], c)
    if snow:
        out += path('M-10,-110 L-32,-82 L-20,-86 L-10,-76 L2,-88 L12,-84 Z', '#ffffff', 2.5)
    return out


def water_body(x, y, w, h, c='#4fa9e0'):
    return (path(f'M{x},{y} Q{x + w * 0.25},{y - 10} {x + w * 0.5},{y} T{x + w},{y} V{y + h} H{x} Z', c, 0) +
            ''.join(stroke(f'M{x + w * f - 18},{y + h * g} q9,-6 18,0 q9,6 18,0', '#ffffff', 3, opacity=0.7) for f, g in ((0.2, 0.35), (0.55, 0.55), (0.8, 0.3))))


def leaf(c='#66bb6a', l=40):
    return path(f'M0,0 Q{l * 0.5},{-l * 0.45} {l},0 Q{l * 0.5},{l * 0.45} 0,0 Z', c) + stroke(f'M2,0 L{l - 4},0', shade(c, 0.7), 2)


# ---------- people ----------

def kid(shirt='#ef6c57', pants='#f4ecdc', skin='#c68863', hair='#2b1d16', girl=False, hands='down', mouth='smile', scarf='#ffd54f'):
    """A child in shalwar kameez, feet at (0, 0), about 155 tall."""
    poses = {'down': ((-28, -60), (28, -60)), 'up': ((-36, -152), (36, -152)), 'wave': ((-28, -60), (38, -150)),
             'front': ((28, -88), (40, -82)), 'hold': ((-12, -76), (12, -76)), 'back': ((-30, -88), (-40, -82))}
    lh, rh = poses[hands] if isinstance(hands, str) else hands
    out = ''
    if girl:
        out += path('M-22,-136 Q-30,-96 -16,-90 L16,-90 Q30,-96 22,-136 Z', hair)
    out += rect(-15, -50, 13, 46, pants, rx=5) + rect(2, -50, 13, 46, pants, rx=5)
    out += ell(-9, -3, 10, 5, '#5d4037') + ell(9, -3, 10, 5, '#5d4037')
    out += limb(-17, -102, lh[0], lh[1], shirt) + limb(17, -102, rh[0], rh[1], shirt)
    out += path('M-20,-108 Q0,-113 20,-108 L28,-40 Q0,-34 -28,-40 Z', shirt)
    out += circ(lh[0], lh[1], 6, skin, 2.5) + circ(rh[0], rh[1], 6, skin, 2.5)
    out += rect(-5, -118, 10, 12, skin, sw=2.5) + circ(0, -132, 20, skin)
    if girl:
        out += path('M-21,-130 C-22,-156 22,-156 21,-130 C14,-144 -14,-144 -21,-130 Z', hair)
        out += path('M-22,-106 Q0,-90 22,-106 L25,-97 Q0,-80 -25,-97 Z', scarf)
    else:
        out += path('M-20,-134 C-21,-154 -6,-158 4,-155 C16,-154 22,-146 20,-132 C14,-142 4,-144 -4,-140 C-10,-138 -16,-136 -20,-134 Z', hair)
    out += circ(-7, -132, 2.4, OUT, 0) + circ(7, -132, 2.4, OUT, 0)
    out += circ(-12, -125, 3.5, '#f48fb1', 0, opacity=0.55) + circ(12, -125, 3.5, '#f48fb1', 0, opacity=0.55)
    mouths = {'smile': stroke('M-7,-124 Q0,-118 7,-124', OUT, 2.2), 'o': circ(0, -121, 3.5, '#8d2a2a', 2),
              'sad': stroke('M-6,-119 Q0,-124 6,-119', OUT, 2.2), 'flat': line(-5, -122, 5, -122, OUT, 2.2)}
    return out + mouths[mouth]


# ---------- animals ----------

def bird(c='#42a5f5', fly=False):
    w = shade(c, 0.8)
    out = path('M-20,0 L-38,-10 L-36,6 Z', c) + ell(0, 0, 22, 15, c) + circ(20, -10, 11, c)
    out += poly([(29, -13), (41, -9), (29, -6)], '#ffb300', 2.5) + circ(23, -12, 2.2, OUT, 0)
    if fly:
        out += path('M-8,-4 Q0,-38 16,-34 Q12,-14 6,-2 Z', w)
    else:
        out = line(-3, 13, -5, 24, '#ff8f00', 3) + line(6, 13, 6, 24, '#ff8f00', 3) + out + path('M-14,-2 Q2,-14 14,0 Q0,10 -14,-2 Z', w)
    return out


def ant(c='#4e342e'):
    legs = ''.join(line(x, 0, x + dx, 12, c, 2.2) + line(x, 0, x + dx, -10, c, 2.2) for x, dx in ((-4, -8), (0, 0), (4, 8)))
    return (legs + circ(-14, 0, 6.5, c, 0) + circ(-2, 0, 5, c, 0) + circ(12, -2, 7, c, 0) +
            stroke('M16,-7 Q20,-16 26,-16 M14,-8 Q14,-18 20,-20', c, 2))


def butterfly(c1='#ff7043', c2='#ffca28'):
    return (ell(-14, -10, 15, 20, c1, 2.5, transform='rotate(-25 -14 -10)') + ell(14, -10, 15, 20, c1, 2.5, transform='rotate(25 14 -10)') +
            ell(-11, 12, 10, 12, c2, 2.5, transform='rotate(25 -11 12)') + ell(11, 12, 10, 12, c2, 2.5, transform='rotate(-25 11 12)') +
            circ(-14, -12, 4, '#ffffff', 0, opacity=0.8) + circ(14, -12, 4, '#ffffff', 0, opacity=0.8) +
            ell(0, 0, 4, 20, OUT, 0) + stroke('M-2,-18 Q-8,-30 -12,-30 M2,-18 Q8,-30 12,-30', OUT, 2))


def fish(c='#ffa726', sad=False):
    out = poly([(-26, 0), (-46, -16), (-46, 16)], shade(c, 0.85)) + ell(0, 0, 32, 18, c)
    out += path('M-6,-16 Q4,-30 14,-16', shade(c, 0.85), 2.5) + stroke('M10,-10 Q4,0 10,10', OUT, 2.2)
    if sad:
        out += line(16, -9, 24, -1, OUT, 2.5) + line(24, -9, 16, -1, OUT, 2.5)
    else:
        out += circ(19, -5, 4.5, '#ffffff', 2) + circ(20, -5, 2, OUT, 0)
    return out


def frog(c='#66bb6a'):
    return (ell(-22, 12, 14, 8, shade(c, 0.85)) + ell(22, 12, 14, 8, shade(c, 0.85)) + ell(0, 0, 28, 20, c) +
            circ(-13, -18, 9, c) + circ(13, -18, 9, c) + circ(-13, -18, 4.5, '#ffffff', 0) + circ(13, -18, 4.5, '#ffffff', 0) +
            circ(-12, -18, 2.4, OUT, 0) + circ(14, -18, 2.4, OUT, 0) + stroke('M-12,0 Q0,8 12,0', OUT, 2.5) + ell(0, 10, 12, 6, '#c5e1a5', 0))


def lizard(c='#9ccc65'):
    legs = ''.join(stroke(d, shade(c, 0.8), 5) for d in ('M-14,4 L-22,16', 'M-14,-4 L-22,-16', 'M14,4 L22,16', 'M14,-4 L22,-16'))
    return (legs + path('M-30,0 Q-56,-2 -70,10 Q-56,4 -30,6 Z', c, 2.5) +
            path('M-32,0 Q-20,-9 0,-8 Q20,-10 32,-4 Q44,0 32,5 Q20,10 0,8 Q-20,9 -32,0 Z', c, 2.5) + circ(30, -3, 2.2, OUT, 0))


def cow():
    legs = ''.join(rect(x, -24, 11, 26, '#ffffff', rx=3, sw=2.5) + rect(x, -2, 11, 6, OUT, rx=2, sw=0) for x in (-42, -24, 18, 34))
    body = rect(-50, -70, 100, 52, '#ffffff', rx=24)
    spots = path('M-30,-66 Q-12,-60 -18,-46 Q-34,-40 -38,-54 Z', '#4e342e', 0) + path('M10,-50 Q26,-56 30,-40 Q16,-30 8,-40 Z', '#4e342e', 0)
    tail = stroke('M-48,-56 Q-62,-40 -58,-24', OUT, 3) + ell(-58, -22, 4, 6, OUT, 0)
    head = (path('M40,-74 L34,-84 L44,-80 Z', '#e0d6c8', 2) + path('M70,-74 L78,-84 L68,-80 Z', '#e0d6c8', 2) +
            ell(34, -66, 9, 5, '#ffffff', 2.5, transform='rotate(-20 34 -66)') + ell(76, -66, 9, 5, '#ffffff', 2.5, transform='rotate(20 76 -66)') +
            rect(42, -78, 26, 40, '#ffffff', rx=12) + ell(55, -40, 16, 11, '#f8bbd0', 2.5) + circ(50, -41, 2, OUT, 0) + circ(60, -41, 2, OUT, 0) +
            circ(49, -62, 2.6, OUT, 0) + circ(61, -62, 2.6, OUT, 0))
    return legs + tail + body + spots + head


def goat():
    legs = ''.join(rect(x, -20, 8, 22, '#e8dccb', rx=3, sw=2.5) for x in (-30, -16, 12, 24))
    return (legs + ell(0, -34, 38, 20, '#e8dccb') + stroke('M-36,-40 L-44,-50', OUT, 3) +
            path('M26,-44 Q30,-70 48,-66 Q56,-52 46,-40 Q36,-36 26,-44 Z', '#e8dccb') + stroke('M38,-66 Q34,-82 26,-84', '#8d6e63', 4) +
            circ(44, -58, 2.4, OUT, 0) + path('M46,-42 L48,-30 L42,-38 Z', '#e8dccb', 2))


def hen():
    return (line(-4, -6, -6, 4, '#ff8f00', 3) + line(6, -6, 6, 4, '#ff8f00', 3) +
            path('M-24,-24 Q-40,-50 -30,-56 Q-22,-44 -16,-36 Z', '#a1673f') + ell(0, -24, 24, 19, '#c98a52') +
            circ(18, -44, 11, '#c98a52') + path('M14,-56 Q18,-64 22,-56 Q26,-62 28,-52 Z', '#e53935', 2) +
            poly([(28, -46), (36, -42), (28, -40)], '#ffb300', 2) + path('M24,-38 Q28,-32 24,-30 Q20,-34 24,-38 Z', '#e53935', 1.5) +
            circ(20, -46, 2.2, OUT, 0) + path('M-12,-24 Q2,-34 14,-22 Q2,-14 -12,-24 Z', '#a1673f'))


def chick():
    return (line(-3, -2, -4, 4, '#ff8f00', 2.5) + line(4, -2, 4, 4, '#ff8f00', 2.5) + ell(0, -12, 12, 10, '#ffe082') +
            circ(9, -22, 7, '#ffe082') + poly([(15, -23), (21, -21), (15, -19)], '#ffb300', 1.8) + circ(11, -23, 1.6, OUT, 0))


def snail():
    return (path('M-26,0 Q-28,-8 -16,-8 L22,-8 Q30,-8 32,-18 L34,-28 M32,-18 L26,-30', '#d7c4a3', 2.5) +
            path('M-26,0 Q-28,-8 -16,-8 L22,-8 Q32,-6 36,0 Z', '#d7c4a3', 2.5) + circ(34, -29, 2.5, OUT, 0) + circ(26, -31, 2.5, OUT, 0) +
            circ(0, -24, 18, '#c98a52') + stroke('M0,-24 m-3,0 a3,3 0 1 1 6,0 a7,7 0 1 1 -13,0 a11,11 0 1 1 22,0', '#7b4a2a', 2.5))


def spider():
    legs = ''
    for i, a in enumerate((-50, -20, 15, 45)):
        for sgn in (-1, 1):
            kx, ky = sgn * 20, -10 + i * 7
            legs += stroke(f'M{sgn * 4},{-2 + i * 2} L{kx},{ky - 10} L{sgn * 30},{ky + 8}', OUT, 2.6)
    return legs + ell(0, 6, 11, 12, '#5d4037', 2.5) + circ(0, -8, 7, '#5d4037', 2.5) + circ(-2.5, -10, 1.6, '#ffffff', 0) + circ(2.5, -10, 1.6, '#ffffff', 0)


def mosquito(c='#6d6d6d'):
    legs = ''.join(stroke(f'M{x},2 L{x + d},14 L{x + d * 1.8},30', OUT, 1.8) for x, d in ((-6, -10), (0, -3), (6, 6)))
    return (legs + ell(-8, -14, 16, 7, '#d8eefc', 1.8, opacity=0.9, transform='rotate(-25 -8 -14)') +
            ell(6, -16, 16, 7, '#d8eefc', 1.8, opacity=0.9, transform='rotate(-55 6 -16)') +
            ell(-6, 0, 18, 4.5, c, 2) + circ(14, -2, 5, c, 2) + line(18, -1, 32, 4, OUT, 1.8))


def worm(c='#f48fb1'):
    return tube('M-40,0 Q-26,-14 -10,0 T20,0 T44,-4', c, 8) + circ(44, -4, 1.4, OUT, 0)


# ---------- things ----------

def book(c='#5c6bc0'):
    return rect(-34, -24, 68, 48, c, rx=4) + rect(-30, -20, 60, 40, '#fdf6e3', rx=2, sw=2) + line(0, -20, 0, 20, OUT, 2.5) + rect(-34, -24, 10, 48, shade(c, 0.85), rx=3)


def chair(c='#a1673f'):
    return (rect(-22, -70, 8, 70, c, rx=2) + rect(14, -36, 8, 36, c, rx=2) + rect(-22, -40, 44, 9, c, rx=3) +
            rect(-22, -72, 44, 10, shade(c, 1.15), rx=3) + rect(-22, -58, 44, 6, shade(c, 1.15), rx=2))


def car(c='#ef5350'):
    return (path('M-60,-12 L-56,-34 Q-30,-38 -22,-38 L-10,-58 Q20,-60 32,-58 L46,-38 Q60,-36 62,-26 L62,-12 Z', c) +
            path('M-6,-54 L-14,-38 L12,-38 L12,-54 Z', '#bbdefb', 2.5) + path('M18,-54 L18,-38 L40,-38 L30,-54 Z', '#bbdefb', 2.5) +
            circ(-34, -12, 13, '#424242') + circ(-34, -12, 5, '#bdbdbd', 2) + circ(36, -12, 13, '#424242') + circ(36, -12, 5, '#bdbdbd', 2) +
            rect(54, -30, 8, 6, '#fff176', rx=2, sw=2))


def pencil():
    return (rect(-50, -8, 80, 16, '#ffca28', rx=2) + line(-50, 0, 30, 0, '#f9a825', 2) + rect(-62, -8, 12, 16, '#f48fb1', rx=3) +
            rect(-50, -8, 6, 16, '#b0bec5', sw=2) + poly([(30, -8), (52, 0), (30, 8)], '#f3d9b1') + poly([(45, -3), (52, 0), (45, 3)], OUT, 0))


def schoolbag(c='#29b6f6'):
    return (stroke('M-16,-56 Q0,-74 16,-56', OUT, 6) + rect(-32, -58, 64, 66, c, rx=14) + path('M-32,-40 Q0,-30 32,-40 L32,-20 Q0,-10 -32,-20 Z', shade(c, 0.85)) +
            rect(-14, -6, 28, 12, shade(c, 0.85), rx=4, sw=2.5) + rect(-4, -26, 8, 10, '#ffd54f', rx=2, sw=2))


def table(w=220, h=70, c='#c58b5a'):
    return rect(-w / 2, -h, w, 12, c, rx=4) + rect(-w / 2 + 12, -h + 12, 12, h - 12, shade(c, 0.85)) + rect(w / 2 - 24, -h + 12, 12, h - 12, shade(c, 0.85))


def glass(level=0.65, liquid='#64b5f6', h=70, w=44):
    top, bot = -h, 0
    ly = bot - (h - 6) * level
    shape = f'M{-w / 2},{top} L{-w / 2 + 6},{bot} L{w / 2 - 6},{bot} L{w / 2},{top} Z'
    inner = f'M{-w / 2 + 6 - 6 * (bot - ly) / h + 1},{ly} L{-w / 2 + 7},{bot - 3} L{w / 2 - 7},{bot - 3} L{w / 2 - 6 + 6 * (bot - ly) / h - 1},{ly} Z'
    return path(shape, '#eaf6ff', 3, opacity=0.95) + (path(inner, liquid, 0) if level else '') + path(shape, 'none', 3) + line(-w / 2 + 8, top + 8, -w / 2 + 12, bot - 10, '#ffffff', 3)


def bulb(on=True):
    out = ''
    if on:
        out += circ(0, -30, 46, 'url(#glow)', 0)
        out += ''.join(line(math.cos(math.radians(a)) * 30, -30 + math.sin(math.radians(a)) * 30, math.cos(math.radians(a)) * 42,
                            -30 + math.sin(math.radians(a)) * 42, '#ffb300', 4) for a in (-150, -120, -90, -60, -30, 180, 0))
    return (out + path('M-18,-30 A20,20 0 1 1 18,-30 Q12,-18 10,-8 L-10,-8 Q-12,-18 -18,-30 Z', '#fff59d' if on else '#eceff1') +
            stroke('M-6,-10 L-4,-26 L0,-20 L4,-26 L6,-10', '#ff8f00' if on else '#90a4ae', 2) + rect(-11, -9, 22, 14, '#9e9e9e', rx=3) +
            line(-11, -4, 11, -4, OUT, 2) + rect(-6, 5, 12, 5, OUT, rx=2, sw=0))


def candle():
    return (circ(0, -78, 30, 'url(#glow)', 0) + rect(-12, -56, 24, 56, '#fff8e1', rx=3) + line(0, -56, 0, -64, OUT, 2.5) +
            path('M0,-90 Q10,-74 0,-64 Q-10,-74 0,-90 Z', '#ffb300', 2.5) + path('M0,-82 Q4,-74 0,-68 Q-4,-74 0,-82 Z', '#fff176', 0) +
            path('M-12,-56 Q-12,-48 -6,-46 Q-4,-52 -2,-56 Z', '#ffffff', 0))


def torch():
    return rect(-44, -12, 52, 24, '#546e7a', rx=6) + path('M8,-12 L26,-22 L26,22 L8,12 Z', '#78909c') + ell(26, 0, 5, 22, '#fff59d', 2.5) + rect(-24, -16, 10, 6, '#ef5350', rx=2, sw=2)


def matka():
    return (path('M-16,-92 L16,-92 L14,-80 Q50,-70 50,-36 Q50,0 0,4 Q-50,0 -50,-36 Q-50,-70 -14,-80 Z', '#c0622f') +
            stroke('M-42,-46 Q0,-34 42,-46', '#f3c9a4', 3) + stroke('M-46,-30 Q0,-18 46,-30', '#8e3f1a', 2.5) + ell(0, -92, 18, 5, '#8e3f1a', 2.5))


def bottle(c='#81d4fa'):
    return (path('M-10,-58 L-10,-48 Q-18,-40 -18,-30 L-18,0 Q-18,4 -14,4 L14,4 Q18,4 18,0 L18,-30 Q18,-40 10,-48 L10,-58 Z', c, 2.5, opacity=0.95) +
            rect(-11, -66, 22, 10, '#1e88e5', rx=2, sw=2.5) + rect(-18, -26, 36, 12, '#ffffff', sw=2, opacity=0.8))


def tin():
    return rect(-14, -40, 28, 40, '#b0bec5', rx=3) + ell(0, -40, 14, 4, '#cfd8dc', 2.5) + rect(-14, -30, 28, 16, '#e57373', sw=2)


def jar():
    return rect(-18, -50, 36, 50, '#c8e6c9', rx=8, opacity=0.9) + rect(-14, -58, 28, 10, '#8d6e63', rx=3, sw=2.5) + line(-10, -40, -10, -12, '#ffffff', 3)


def polybag(c='#ffffff'):
    return path('M-20,-50 L-12,-50 Q-8,-40 0,-40 Q8,-40 12,-50 L20,-50 L24,0 L-24,0 Z', c, 2.5, opacity=0.9) + stroke('M-14,-30 Q0,-20 14,-30', '#b0bec5', 2)


def peel():
    return (path('M0,-6 Q-30,-10 -36,10 Q-20,0 -4,4 Z', '#ffd54f', 2.5) + path('M2,-6 Q28,-14 36,6 Q20,-2 4,4 Z', '#ffd54f', 2.5) +
            path('M-4,4 Q0,-30 4,-34 Q8,-30 4,4 Z', '#fff59d', 2.5) + rect(-2, 2, 6, 6, '#8d6e63', rx=1, sw=2))


def apple_core():
    return path('M-10,-34 Q-2,-30 -6,-18 Q-2,-8 -10,4 L10,4 Q2,-8 6,-18 Q2,-30 10,-34 Z', '#fff3e0', 2.5) + ell(0, -36, 12, 5, '#e53935', 2.5) + ell(0, 4, 12, 5, '#e53935', 2.5) + line(0, -41, 2, -48, '#6d4c41', 3)


def paper_ball():
    return poly([(-18, -6), (-8, -20), (8, -18), (18, -4), (12, 12), (-6, 14), (-16, 8)], '#fafafa', 2.5) + stroke('M-8,-12 L2,-2 L10,-10 M-6,6 L4,0', '#bdbdbd', 2)


def bin_(c='#43a047', lid=None):
    lid = lid or shade(c, 0.85)
    return (path('M-46,-96 L46,-96 L38,0 L-38,0 Z', c) + rect(-52, -108, 104, 14, lid, rx=5) + rect(-12, -116, 24, 10, lid, rx=4, sw=2.5) +
            line(-20, -80, -16, -12, shade(c, 0.75), 3) + line(0, -80, 0, -12, shade(c, 0.75), 3) + line(20, -80, 16, -12, shade(c, 0.75), 3))


def smoke(c='#8f8f8f', n=3):
    return ''.join(path(bumpy(i * 22, -i * 34, 16 + i * 8, 13 + i * 6, 7), c, 0, opacity=0.85 - i * 0.12) for i in range(n))


def factory(c='#b0705a'):
    return (rect(30, -150, 24, 110, '#8d6e63') + rect(70, -120, 20, 80, '#8d6e63') + rect(26, -156, 32, 10, '#6d4c41', rx=2) + rect(66, -126, 28, 10, '#6d4c41', rx=2) +
            path('M-70,0 L-70,-60 L-40,-80 L-40,-60 L-10,-80 L-10,-60 L20,-80 L20,-60 L100,-60 L100,0 Z', c) +
            ''.join(rect(x, -44, 16, 16, '#ffe082', rx=2, sw=2.5) for x in (-58, -28, 2, 34, 66)) + rect(-60, -22, 150, 4, shade(c, 0.8), sw=0))


def fire():
    return (path('M-26,0 Q-34,-26 -16,-42 Q-14,-24 -6,-26 Q-12,-50 6,-66 Q6,-40 18,-34 Q20,-46 26,-48 Q36,-22 24,0 Z', '#ff7043') +
            path('M-12,0 Q-18,-18 -4,-26 Q-2,-14 4,-16 Q6,-30 14,-34 Q20,-16 12,0 Z', '#ffd54f', 0))


def trash_pile():
    return (path('M-70,0 Q-60,-34 -30,-40 Q-10,-62 16,-46 Q46,-56 66,-24 Q76,-8 70,0 Z', '#8d8d7a') +
            G(polybag('#424242'), x=-34, y=-6, s=0.8) + G(bottle('#a5d6a7'), x=14, y=-10, s=0.6, r=70) + G(tin(), x=46, y=-4, s=0.7, r=-20) +
            G(paper_ball(), x=-6, y=-36, s=0.8))


def microbe(kind='rod', c='#7e57c2', face=None):
    if kind == 'rod':
        out = rect(-20, -8, 40, 16, c, rx=8) + stroke('M20,0 q8,-6 14,0 t12,0', OUT, 2)
    elif kind == 'coccus':
        out = ''.join(circ(dx, dy, 8, c, 2.5) for dx, dy in ((-9, 0), (8, -3), (0, 12), (16, 10), (-14, -14)))
    elif kind == 'spiral':
        out = tube('M-24,0 q6,-12 12,0 t12,0 t12,0 t12,0', c, 6)
    elif kind == 'virus':
        spikes = ''.join(line(math.cos(math.radians(a)) * 18, math.sin(math.radians(a)) * 18, math.cos(math.radians(a)) * 28,
                              math.sin(math.radians(a)) * 28, OUT, 3) + circ(math.cos(math.radians(a)) * 30, math.sin(math.radians(a)) * 30, 4, shade(c, 1.2), 2)
                         for a in range(0, 360, 30))
        out = spikes + circ(0, 0, 20, c) + circ(-6, -5, 4, shade(c, 0.8), 0) + circ(7, 5, 3, shade(c, 0.8), 0)
    else:  # friendly round microbe
        out = path(bumpy(0, 0, 20, 18, 8, 1.05), c)
    if face == 'happy':
        out += circ(-6, -3, 2.2, OUT, 0) + circ(6, -3, 2.2, OUT, 0) + stroke('M-6,4 Q0,10 6,4', OUT, 2)
    elif face == 'angry':
        out += line(-10, -8, -3, -5, OUT, 2.2) + line(10, -8, 3, -5, OUT, 2.2) + circ(-6, -1, 2, OUT, 0) + circ(6, -1, 2, OUT, 0) + stroke('M-6,8 Q0,3 6,8', OUT, 2)
    return out


def magnifier(r=40):
    return limb(r * 0.7, r * 0.7, r * 1.6, r * 1.6, '#6d4c41', 12) + circ(0, 0, r, '#e3f2fd', 6, stroke='#455a64', opacity=0.9)


def gear(c='#78909c'):
    pts = []
    for i in range(16):
        a = math.radians(i * 22.5)
        rr = 22 if i % 2 == 0 else 16
        pts.append((rr * math.cos(a), rr * math.sin(a)))
    return poly(pts, c, 2.5) + circ(0, 0, 7, '#eceff1', 2.5)


def hand(skin='#c68863'):
    """An open hand, wrist at the bottom (0, 0), fingers up."""
    return (path('M-16,0 L-18,-30 Q-26,-40 -22,-44 Q-16,-46 -12,-36 L-12,-58 Q-12,-64 -7,-64 Q-2,-64 -2,-58 L-2,-66 Q-2,-72 3,-72 Q8,-72 8,-66 '
                 'L8,-60 Q8,-66 13,-66 Q18,-66 18,-60 L18,-50 Q18,-56 22,-56 Q27,-56 27,-50 L26,-20 Q24,-4 16,0 Z', skin, 2.5))


def battery():
    return (rect(-40, -20, 80, 40, '#37474f', rx=6) + rect(-40, -20, 30, 40, '#ffb300', rx=6) + rect(-16, -20, 6, 40, '#ffb300', sw=0) +
            rect(40, -8, 8, 16, '#9e9e9e', rx=2, sw=2.5) + stroke('M14,0 h12 M20,-6 v12', '#ffffff', 3) + stroke('M-34,0 h10', '#37474f', 3))


def bar_magnet(w=120, flip=False):
    a, b = ('#1e88e5', '#e53935') if flip else ('#e53935', '#1e88e5')
    na, nb = ('S', 'N') if flip else ('N', 'S')
    t = lambda x, s: E('text', s, x=x, y=7, font_family='Arial, sans-serif', font_size=20, font_weight='bold', fill='#ffffff', text_anchor='middle')
    return rect(-w / 2, -16, w / 2, 32, a, rx=4) + rect(0, -16, w / 2, 32, b, rx=4) + t(-w / 4, na) + t(w / 4, nb)


def horseshoe():
    return (path('M-50,0 L-50,-50 A50,50 0 0 1 50,-50 L50,0 L22,0 L22,-50 A22,22 0 0 0 -22,-50 L-22,0 Z', '#e53935') +
            rect(-50, -2, 28, 22, '#cfd8dc', sw=3) + rect(22, -2, 28, 22, '#cfd8dc', sw=3))


def planet(r, c, ring=False, bands=None):
    out = ''
    if ring:
        out += ell(0, 0, r * 2.1, r * 0.55, 'none', 0, stroke='#e6c98f', stroke_width=r * 0.3, opacity=0.9, transform='rotate(-15)')
    out += circ(0, 0, r, c, 2.5)
    for dy, bc in (bands or []):
        out += E('path', d=f'M{-math.sqrt(max(r * r - (dy * r) ** 2, 0)):.1f},{dy * r:.1f} H{math.sqrt(max(r * r - (dy * r) ** 2, 0)):.1f}',
                 stroke=bc, stroke_width=max(2, r * 0.16), stroke_linecap='round')
    if ring:
        out += E('path', d=f'M{-r * 2.1:.1f},0 A{r * 2.1:.1f},{r * 0.55:.1f} 0 0 0 {r * 2.1:.1f},0', fill='none', stroke='#e6c98f',
                 stroke_width=r * 0.3, opacity=0.95, transform='rotate(-15)')
    return out


def moon_phase(k, r=26):
    """Moon as seen from Pakistan: k = 0 new, 1 waxing crescent, 2 first quarter, 3 waxing gibbous, 4 full, 5..7 waning."""
    out = circ(0, 0, r, '#39405e', 2.5, stroke='#8e97c4')
    if k == 0:
        return out
    if k == 4:
        return out + circ(0, 0, r, '#f6f0cf', 2.5, stroke='#8e97c4')
    th = math.radians((k if k < 4 else 8 - k) * 45)
    tx = abs(math.cos(th)) * r
    sweep = 0 if th < math.pi / 2 else 1
    term = f'L0,{-r}' if abs(tx) < 0.5 else f'A{tx:.1f},{r} 0 0 {sweep} 0,{-r}'
    lit = E('path', d=f'M0,{-r} A{r},{r} 0 0 1 0,{r} {term} Z', fill='#f6f0cf')
    return out + (G(lit, flip=True) if k > 4 else lit) + circ(0, 0, r, 'none', 2.5, stroke='#8e97c4')
