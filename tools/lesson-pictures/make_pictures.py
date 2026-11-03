"""Draw one original picture for every lesson part (no words, so it suits all three languages).
Usage: python make_pictures.py <out_dir> [chapter-section ...]
Writes <out_dir>/<chapterId>-<sectionId>.svg, 640 x 400, in one shared style with an ajrak strip at the foot.
"""
import math, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pic_lib import *  # noqa: E402,F403

SCENES = {}


def scene(key):
    def add(fn):
        SCENES[key] = fn
        return fn
    return add


# ---------- extra things used by a few scenes ----------

def watering_can(c='#26a69a'):
    return (stroke('M-14,-30 Q0,-54 14,-30', OUT, 5) + tube('M16,-20 L44,-44', c, 6) + ell(47, -46, 7, 4, c, 2.5) +
            path('M-20,-32 L20,-32 L24,0 L-24,0 Z', c))


def heap(c, w=60, h=54):
    return path(f'M{-w},0 Q{-w * 0.66},{-h} 0,{-h * 1.04} Q{w * 0.66},{-h} {w},0 Z', c) + ''.join(
        circ(dx, dy, 2.2, shade(c, 0.7), 0) for dx, dy in ((-30, -14), (-10, -30), (14, -20), (32, -10), (0, -10), (-18, -40 * h / 54), (20, -38 * h / 54)))


def mushroom(c='#e53935'):
    return rect(-8, -34, 16, 34, '#f5f0e6', rx=6) + path('M-30,-30 Q-30,-62 0,-62 Q30,-62 30,-30 Z', c) + circ(-12, -46, 4, '#ffffff', 0) + circ(8, -52, 3, '#ffffff', 0) + circ(14, -38, 3.5, '#ffffff', 0)


def bread(mould=False):
    out = path('M-46,40 L-46,-20 Q-56,-50 -24,-56 Q0,-70 24,-56 Q56,-50 46,-20 L46,40 Z', '#c98a52') + path('M-38,34 L-38,-18 Q-46,-42 -20,-46 Q0,-58 20,-46 Q46,-42 38,-18 L38,34 Z', '#f6dca8', 0)
    if mould:
        out += ''.join(path(bumpy(x, y, r, r * 0.85, 7), c, 2) for x, y, r, c in ((-14, -20, 13, '#7cb342'), (16, 6, 10, '#9ccc65'), (-10, 20, 8, '#558b2f'), (20, -30, 7, '#aed581')))
    return out


def naan():
    return path('M-50,0 Q-48,-26 0,-30 Q56,-30 60,-6 Q58,18 0,20 Q-52,22 -50,0 Z', '#e9b872') + ''.join(ell(x, y, 6, 4, '#b5793a', 0) for x, y in ((-24, -8), (4, -14), (28, -2), (-6, 6), (40, -16)))


def bowl(c='#c0622f', fill_c=None, fill_h=0):
    out = ''
    if fill_c:
        out += path(f'M-46,-30 Q-40,{-30 - fill_h} 0,{-30 - fill_h - 6} Q40,{-30 - fill_h} 46,-30 Z', fill_c)
    return out + path('M-50,-32 L50,-32 Q48,0 0,4 Q-48,0 -50,-32 Z', c) + line(-36, -18, 36, -18, shade(c, 1.3), 3)


def tap(on=False, drip=False):
    out = rect(-60, -12, 50, 16, '#90a4ae', rx=4) + path('M-14,-14 L18,-14 Q30,-14 30,-2 L30,16 L18,16 L18,2 Q18,0 14,0 L-14,0 Z', '#b0bec5') + rect(-6, -30, 12, 16, '#78909c', rx=3) + rect(-18, -36, 36, 8, '#ef5350', rx=4)
    if on:
        out += rect(20, 16, 8, 70, '#81d4fa', rx=4, sw=0, opacity=0.9)
    if drip:
        out += G(drop(), x=24, y=40, s=0.55)
    return out


def ball(c='#ffffff'):
    return circ(0, 0, 18, c) + poly([(0, -7), (7, -2), (4, 6), (-4, 6), (-7, -2)], OUT, 0) + stroke('M0,-7 L0,-17 M7,-2 L16,-6 M4,6 L10,14 M-4,6 L-10,14 M-7,-2 L-16,-6', OUT, 2)


def box(c='#c58b5a', w=70, h=60):
    return rect(-w / 2, -h, w, h, c, rx=4) + line(-w / 2, -h / 2, w / 2, -h / 2, shade(c, 0.8), 2.5) + line(0, -h, 0, -h / 2, shade(c, 0.8), 2.5)


def toy_cart(c='#ffb300'):
    return rect(-34, -38, 68, 26, c, rx=4) + circ(-20, -10, 10, '#424242') + circ(20, -10, 10, '#424242') + circ(-20, -10, 3, '#bdbdbd', 0) + circ(20, -10, 3, '#bdbdbd', 0)


def apple():
    return circ(0, 0, 13, '#e53935') + line(0, -12, 2, -20, '#6d4c41', 3) + path('M2,-16 Q12,-24 16,-16 Q8,-12 2,-16 Z', '#66bb6a', 2)


def snowflake(c='#4fc3f7'):
    return ''.join(G(line(0, 0, 0, -16, c, 3.5) + line(0, -10, -5, -15, c, 3) + line(0, -10, 5, -15, c, 3), r=a) for a in range(0, 360, 60))


def flame_icon():
    return path('M0,-20 Q12,-6 8,4 Q4,12 0,12 Q-4,12 -8,4 Q-12,-6 0,-20 Z', '#ff7043', 2.5) + path('M0,-6 Q5,0 3,6 Q0,9 -3,6 Q-5,0 0,-6 Z', '#ffd54f', 0)


def ice_cube():
    return rect(-34, -34, 68, 68, '#b3e5fc', rx=12) + path('M-22,-24 L4,-24 Q-6,-18 -22,-4 Z', '#ffffff', 0, opacity=0.8) + rect(-34, -34, 68, 68, 'none', rx=12, stroke='#4fa9e0')


def pot(steam=True):
    out = ''
    if steam:
        out += ''.join(stroke(f'M{x},-66 q-10,-14 0,-28 t0,-28', '#ffffff', 5, opacity=0.95) for x in (-18, 0, 18))
    return (out + path('M-44,-56 L44,-56 L38,-6 Q36,0 30,0 L-30,0 Q-36,0 -38,-6 Z', '#90a4ae') + rect(-50, -62, 100, 10, '#78909c', rx=5) +
            ell(-52, -40, 8, 5, '#78909c', 2.5) + ell(52, -40, 8, 5, '#78909c', 2.5) + G(fire(), y=22, s=0.55))


def particles_box(kind, c):
    out = rect(-70, -60, 140, 120, '#ffffff', rx=14, opacity=0.8) + rect(-70, -60, 140, 120, 'none', rx=14, stroke='#90a4ae')
    if kind == 'solid':
        out += ''.join(circ(-33 + i * 22, -33 + j * 22, 10, c, 2) for i in range(4) for j in range(4))
    elif kind == 'liquid':
        pts = [(-48, 44), (-26, 44), (-4, 44), (18, 44), (42, 44), (-38, 24), (-14, 26), (8, 23), (30, 26), (50, 22), (-50, 4), (-26, 6), (-2, 4), (22, 7), (44, 3)]
        out += ''.join(circ(x, y, 10, c, 2) for x, y in pts)
    else:
        for x, y, dx, dy in ((-44, -38, -1, 1), (20, -40, 1, 0), (48, 10, 0, 1), (-20, 4, 1, 1), (-50, 40, -1, 0), (10, 38, 1, -1), (36, -12, -1, -1)):
            out += line(x - dx * 12, y - dy * 12, x - dx * 24, y - dy * 24, '#90a4ae', 2.5) + circ(x, y, 10, c, 2)
    return out


def egg():
    return ell(0, 0, 22, 28, '#fff3e0')


def fried_egg_pan():
    return (limb(50, 0, 96, -10, '#424242', 8) + circ(0, 0, 54, '#424242') + circ(0, 0, 46, '#616161', 0) +
            path(bumpy(-2, 2, 34, 28, 7, 1.05), '#ffffff', 2.5) + circ(2, 0, 13, '#ffb300', 2.5))


def paper(c='#ffffff'):
    return path('M-30,-40 L18,-40 L30,-28 L30,40 L-30,40 Z', c) + path('M18,-40 L18,-28 L30,-28', '#e0e0e0', 2) + ''.join(line(-20, y, 20, y, '#b0bec5', 2) for y in (-18, -6, 6, 18))


def torn_paper():
    return (G(path('M-30,-40 L10,-40 L4,-16 L14,6 L0,40 L-30,40 Z', '#ffffff'), x=-12, r=-8) +
            G(path('M10,-40 L30,-40 L30,40 L0,40 L14,6 L4,-16 Z', '#ffffff'), x=14, r=10))


def ash():
    return path('M-44,0 Q-30,-22 -6,-26 Q20,-30 36,-14 Q46,-6 44,0 Z', '#757575') + ''.join(circ(x, y, 3, '#424242', 0) for x, y in ((-20, -10), (4, -16), (22, -8)))


def clay_ball():
    return circ(0, -28, 28, '#a1887f') + path('M-14,-44 Q-4,-50 6,-46', 'none', 0) + stroke('M-14,-40 Q-6,-48 4,-46', '#d7ccc8', 3)


def clay_cup():
    return path('M-34,-56 L34,-56 L26,0 L-26,0 Z', '#a1887f') + ell(0, -56, 34, 8, '#8d6e63')


def wheel(r=40, c='#8d6e63'):
    return circ(0, 0, r, 'none', 8, stroke=c) + circ(0, 0, r, 'none', 2.5) + ''.join(line(0, 0, r * math.cos(math.radians(a)), r * math.sin(math.radians(a)), c, 5) for a in range(0, 360, 45)) + circ(0, 0, 8, '#5d4037')


def bus():
    return (rect(-96, -84, 192, 70, '#ffb300', rx=12) + ''.join(rect(-80 + i * 34, -72, 26, 24, '#bbdefb', rx=3, sw=2.5) for i in range(5)) +
            rect(-92, -34, 184, 8, '#e65100', sw=0) + circ(-56, -12, 15, '#424242') + circ(-56, -12, 5, '#bdbdbd', 2) + circ(56, -12, 15, '#424242') +
            circ(56, -12, 5, '#bdbdbd', 2) + rect(-108, -26, 14, 8, '#616161', rx=2, sw=2))


def rickshaw():
    return (path('M-44,-80 L28,-80 Q40,-80 42,-68 L44,-34 L-44,-34 Z', '#212121') + path('M-48,-34 L46,-34 Q64,-32 66,-12 L66,-8 L-48,-8 Z', '#43a047') +
            rect(14, -72, 24, 30, '#bbdefb', rx=3, sw=2.5) + circ(-30, -8, 12, '#424242') + circ(-30, -8, 4, '#bdbdbd', 0) + circ(50, -8, 12, '#424242') + circ(50, -8, 4, '#bdbdbd', 0) +
            rect(-58, -18, 12, 6, '#616161', rx=2, sw=2))


def house(lit=True):
    return (rect(-60, -80, 120, 80, '#ffe0b2') + poly([(-72, -78), (0, -130), (72, -78)], '#d84315') + rect(-14, -46, 28, 46, '#8d6e63', rx=3) +
            rect(26, -64, 24, 22, '#fff176' if lit else '#cfd8dc', rx=2) + line(38, -64, 38, -42, OUT, 2) + rect(-50, -64, 24, 22, '#fff176' if lit else '#cfd8dc', rx=2) +
            (circ(38, -53, 26, 'url(#glow)', 0) if lit else ''))


def pylon():
    return (poly([(-30, 0), (-8, -170), (8, -170), (30, 0)], 'none', 4, stroke='#78909c') +
            ''.join(line(-30 + 22 * f, -170 * f, 30 - 22 * f2, -170 * f2, '#78909c', 3) for f, f2 in ((0, 0.25), (0.25, 0.5), (0.5, 0.75))) +
            ''.join(line(30 - 22 * f, -170 * f, -30 + 22 * f2, -170 * f2, '#78909c', 3) for f, f2 in ((0, 0.25), (0.25, 0.5), (0.5, 0.75))) +
            line(-40, -150, 40, -150, '#78909c', 5) + line(-30, -120, 30, -120, '#78909c', 5))


def socket():
    return rect(-34, -34, 68, 68, '#fafafa', rx=10) + circ(-12, 0, 5, OUT, 0) + circ(12, 0, 5, OUT, 0) + rect(-6, -26, 12, 8, OUT, rx=2, sw=0)


def kite():
    return poly([(0, -40), (28, 0), (0, 40), (-28, 0)], '#ec407a') + line(0, -40, 0, 40, OUT, 2) + line(-28, 0, 28, 0, OUT, 2) + stroke('M0,40 q8,12 0,22 q-8,10 0,20', OUT, 2)


def clip():
    return stroke('M-4,14 L-4,-14 Q-4,-20 2,-20 Q8,-20 8,-14 L8,10 Q8,14 4,14 Q0,14 0,10 L0,-10', '#78909c', 3)


def nail():
    return rect(-3, -30, 6, 50, '#90a4ae', rx=1, sw=2) + rect(-9, -34, 18, 6, '#78909c', rx=2, sw=2) + poly([(-3, 20), (3, 20), (0, 28)], '#90a4ae', 2)


def funnel_column(soil, grain, water_level, pooled=False):
    """Water poured onto soil in a funnel; the beaker below shows how much drained through."""
    out = rect(-40, 40, 80, 90, '#eaf6ff', rx=6, opacity=0.9) + rect(-37, 130 - 84 * water_level, 74, 84 * water_level - 3, '#64b5f6', sw=0) + rect(-40, 40, 80, 90, 'none', rx=6)
    out += path('M-56,-60 L56,-60 L10,6 L10,34 L-10,34 L-10,6 Z', '#ffffff', 3, opacity=0.8)
    out += path('M-50,-54 L50,-54 L26,-20 L-26,-20 Z', soil, 0)
    if grain:
        out += ''.join(circ(x, y, grain, shade(soil, 0.8), 1.5) for x in range(-40, 44, int(grain * 2.4)) for y in (-48, -36, -26) if abs(x) < 50 - (y + 54) * 0.7)
    if pooled:
        out += rect(-48, -62, 96, 8, '#64b5f6', rx=3, sw=0)
    out += path('M-56,-60 L56,-60 L10,6 L10,34 L-10,34 L-10,6 Z', 'none', 3)
    out += ''.join(G(drop(), x=0, y=y, s=0.4) for y in ((44, 60) if water_level > 0.5 else (50,)))
    return out


def tooth(kind, tint):
    if kind == 'incisor':
        return path('M-14,-30 L14,-30 L12,10 Q8,30 0,34 Q-8,30 -12,10 Z', tint) + line(-14, -30, 14, -30, OUT, 4)
    if kind == 'canine':
        return path('M0,-38 L14,-18 L12,10 Q8,30 0,34 Q-8,30 -12,10 L-14,-18 Z', tint)
    return path('M-24,-30 Q-18,-38 -10,-30 Q-4,-38 4,-30 Q12,-38 22,-30 L24,0 L16,34 L8,8 L-8,8 L-16,34 L-24,0 Z', tint)


def toothbrush():
    return (G(rect(-70, -6, 110, 12, '#42a5f5', rx=6) + rect(40, -10, 40, 14, '#e3f2fd', rx=4) +
              ''.join(line(44 + i * 6, -10, 44 + i * 6, -24, '#ffffff', 3) + line(44 + i * 6, -10, 44 + i * 6, -24, OUT, 1) for i in range(7)) +
              path('M42,-24 Q60,-40 80,-26 Q62,-20 42,-24 Z', '#ffffff', 2) + path('M48,-28 Q60,-36 72,-28', 'none', 0) +
              stroke('M48,-28 Q60,-36 72,-28', '#e53935', 3), r=-20))


def molecule_co2():
    return circ(-24, 0, 11, '#ef5350') + circ(24, 0, 11, '#ef5350') + circ(0, 0, 13, '#546e7a')


def molecule_o2():
    return circ(-10, 0, 11, '#ef5350') + circ(10, 0, 11, '#ef5350')


def firefly():
    return circ(0, 6, 26, 'url(#glow)', 0) + ell(0, 6, 7, 9, '#d4e157', 2) + ell(0, -6, 6, 7, '#5d4037', 2) + ell(-8, -8, 9, 5, '#e3f2fd', 1.5, opacity=0.9) + ell(8, -8, 9, 5, '#e3f2fd', 1.5, opacity=0.9)


def dhol():
    return (rect(-50, -36, 100, 72, '#d84315', rx=10) + ''.join(line(-50 + i * 20, -36, -40 + i * 20, 36, '#ffe0b2', 2.5) for i in range(5)) +
            ell(-50, 0, 12, 36, '#ffe0b2') + ell(50, 0, 12, 36, '#ffe0b2'))


def plate(r=90):
    return ell(0, 0, r, r * 0.42, '#ffffff') + ell(0, 0, r * 0.72, r * 0.3, '#f5f5f5', 2)


def roti():
    return ell(0, 0, 40, 18, '#e2b77a') + ''.join(ell(x, y, 5, 2.5, '#a66a2c', 0) for x, y in ((-18, -4), (6, -8), (20, 4), (-4, 6)))


# ---------- living things ----------

@scene('living-things-s1')
def _():
    drops = ''.join(G(drop(), x=x, y=y, s=0.42) for x, y in ((413, 300), (417, 322), (413, 344)))
    return 'sky', [ground(300), G(sun(), x=565, y=70, s=0.85), G(cloud(), x=180, y=70, s=0.75), G(cloud(), x=410, y=48, s=0.5),
                   G(tree(fruit='#ef5350'), x=85, y=320, s=1.3), G(sunflower(), x=505, y=334, s=1.05, r=14),
                   G(bird(fly=True), x=285, y=112, s=0.75), G(bird('#ef5350', fly=True), x=350, y=145, s=0.55),
                   G(hen(), x=178, y=362), G(chick(), x=226, y=364), G(chick(), x=254, y=360, s=0.85),
                   G(kid('#26a69a', hands=((-28, -60), (30, -94))), x=330, y=372), G(watering_can(), x=362, y=326), drops,
                   G(flower('#ab47bc', h=42), x=430, y=374), G(ant(), x=566, y=368, s=0.8), G(ant(), x=604, y=374, s=0.7)]


@scene('living-things-s2')
def _():
    wind = ''.join(stroke(f'M{x},{y} q30,-12 54,0 q14,8 2,16 q-8,4 -12,-4', '#90a4ae', 4) for x, y in ((196, 296), (210, 326)))
    return 'cream', [panel(18, 18, 292, 350, '#f1e3c4', 0.9), panel(330, 18, 292, 350, '#dbe7f6', 0.9),
                     G(leaf('#66bb6a', 46), x=142, y=72, r=-35), G(gear('#5c6bc0'), x=476, y=62),
                     G(mountain(), x=165, y=182, s=0.75), G(rock(), x=78, y=256, s=1.25), G(rock('#8a8a8a'), x=128, y=262, s=0.8),
                     G(heap('#f0d58c'), x=238, y=262, s=0.9), ell(105, 332, 70, 22, '#4fa9e0'), stroke('M76,332 q12,-6 24,0 t24,0', '#ffffff', 3), wind,
                     G(pencil(), x=420, y=132, r=-25, s=0.9), G(book(), x=562, y=134), G(chair(), x=402, y=274, s=1.1),
                     G(schoolbag(), x=562, y=262), G(car(), x=478, y=350, s=0.85)]


@scene('living-things-s3')
def _():
    rays = ''.join(line(96 + dx, 96 + dy, 136 + dx * 2, 150 + dy, '#ffb300', 3, stroke_dasharray='6 7') for dx, dy in ((0, 0), (22, -6), (-8, 18)))
    return 'mint', [ground(300), G(sun(), x=62, y=62, s=0.7), rays, G(tree(), x=170, y=322, s=1.25), G(flower(), x=255, y=338), G(flower('#ffa726'), x=286, y=346, s=0.85),
                    G(grass(), x=60, y=352), G(grass(), x=230, y=372), divider(320, 40, 375),
                    G(cow(), x=455, y=352), G(grass('#43a047'), x=540, y=356, s=1.3), G(bird('#7e57c2', fly=True), x=570, y=110, s=0.8),
                    G(butterfly(), x=400, y=140, s=1.1), G(goat(), x=596, y=322, s=0.7)]


def spine_icon(crossed=False):
    out = line(0, -52, 0, 52, '#bcaaa4', 4) + ''.join(rect(-15, -48 + i * 20, 30, 14, '#f5efe0', rx=6, sw=2.5) for i in range(5))
    return out + (line(-30, -50, 30, 50, '#e53935', 7) if crossed else '')


@scene('living-things-s4')
def _():
    return 'lilac', [panel(18, 18, 292, 350, '#ffffff', 0.6), panel(330, 18, 292, 350, '#ffffff', 0.6),
                     G(spine_icon(), x=164, y=72, s=0.75), G(spine_icon(True), x=476, y=72, s=0.75),
                     G(fish(), x=90, y=170, s=0.95), G(frog(), x=236, y=176), G(bird('#a1887f'), x=90, y=262, s=1.05),
                     G(lizard(), x=236, y=262, s=0.9), G(cow(), x=150, y=356, s=0.5),
                     G(butterfly(), x=404, y=172, s=1.15), G(snail(), x=550, y=192, s=1.1), G(spider(), x=404, y=278, s=1.3),
                     G(ant(), x=550, y=272, s=1.4), G(mosquito(), x=470, y=338, s=1.1)]


# ---------- microorganisms ----------

def microscope():
    return (rect(-62, -16, 124, 16, '#546e7a', rx=6) + tube('M32,-16 L32,-70 Q32,-150 -4,-170', '#78909c', 16) + circ(-14, -62, 9, '#fff59d', 2.5) +
            rect(-58, -86, 100, 10, '#455a64', rx=3) + rect(-42, -93, 54, 7, '#b3e5fc', rx=1, sw=2) + circ(-15, -90, 4, '#4fc3f7', 0) +
            rect(-24, -126, 18, 30, '#90a4ae', rx=3) + rect(-32, -190, 34, 66, '#b0bec5', rx=6) + rect(-36, -208, 42, 20, '#37474f', rx=4) +
            circ(34, -118, 11, '#455a64'))


@scene('microorganisms-s1')
def _():
    inside = (G(microbe('rod', '#66bb6a'), x=392, y=126, r=-20) + G(microbe('rod', '#66bb6a'), x=508, y=258, r=30) + G(microbe('rod', '#81c784'), x=380, y=236, r=70) +
              G(microbe('coccus', '#ab47bc'), x=478, y=118) + G(microbe('spiral', '#ffa726'), x=526, y=176, r=15) + G(microbe('blob', '#4dd0e1', 'happy'), x=446, y=282) +
              G(microbe('coccus', '#ba68c8'), x=420, y=184, s=0.8) + G(microbe('rod', '#66bb6a'), x=540, y=110, s=0.7, r=60))
    return 'sky', [line(134, 244, 380, 70, '#90a4ae', 3, stroke_dasharray='8 8'), line(134, 244, 380, 312, '#90a4ae', 3, stroke_dasharray='8 8'),
                   G(microscope(), x=150, y=352, s=1.2), circ(455, 192, 132, '#f6fcff', 9, stroke='#78909c'), inside, circ(455, 192, 132, 'none', 3)]


@scene('microorganisms-s2')
def _():
    return 'peach', [panel(18, 18, 188, 350), panel(226, 18, 188, 350), panel(434, 18, 188, 350),
                     G(microbe('coccus', '#ab47bc'), x=96, y=108, s=1.5), G(microbe('rod', '#66bb6a'), x=118, y=200, s=1.5, r=-15),
                     G(microbe('spiral', '#ffa726'), x=104, y=292, s=1.6), G(microbe('rod', '#81c784'), x=160, y=130, s=0.8, r=50),
                     G(microbe('virus', '#ef5350'), x=320, y=170, s=1.9), G(microbe('virus', '#ec407a'), x=272, y=300, s=0.9), G(microbe('virus', '#f06292'), x=370, y=296, s=0.75),
                     G(bread(True), x=528, y=150, s=1.1), G(mushroom(), x=498, y=346), G(mushroom('#a1673f'), x=566, y=352, s=0.8)]


@scene('microorganisms-s3')
def _():
    friends = ''.join(G(microbe('blob', '#4dd0e1', 'happy'), x=x, y=54, s=0.8) for x in (54, 262, 470))
    return 'mint', [panel(18, 18, 188, 350), panel(226, 18, 188, 350), panel(434, 18, 188, 350), friends,
                    G(bowl('#90a4ae', '#f6e3b4', 34), x=112, y=190, s=1.2), G(naan(), x=110, y=310),
                    G(glass(0.8, '#ffffff'), x=284, y=200), arrow(300, 218, 330, 262, '#26a69a', 5, 14), G(bowl('#c0622f', '#ffffff', 10), x=344, y=330, s=1.1),
                    G(leaf('#a1887f', 40), x=480, y=136, r=-20) + G(leaf('#bcaaa4', 36), x=512, y=148, r=20) + G(leaf('#8d6e63', 38), x=536, y=126, r=-60),
                    arrow(528, 178, 528, 232, '#26a69a', 5, 14), G(heap('#5d4037', 64, 44), x=528, y=340), G(flower('#ffca28', h=48), x=528, y=300),
                    G(microbe('rod', '#9ccc65'), x=486, y=330, s=0.45), G(microbe('coccus', '#ba68c8'), x=570, y=328, s=0.45)]


@scene('microorganisms-s4')
def _():
    dirty = G(glass(0.75, '#8d7b5a'), x=110, y=352, s=1.3) + G(microbe('blob', '#9ccc65', 'angry'), x=104, y=318, s=0.55) + G(microbe('rod', '#7cb342'), x=124, y=294, s=0.45)
    hands = G(hand(), x=402, y=290, r=-40) + G(hand(), x=446, y=290, r=40, flip=True)
    bubbles = ''.join(circ(x, y, r, '#e3f2fd', 2, opacity=0.9) for x, y, r in ((410, 222, 9), (430, 210, 6), (446, 230, 8), (424, 240, 5)))
    cover = ell(560, 220, 54, 12, '#ffffff') + path('M512,218 Q512,150 560,150 Q608,150 608,218 Z', '#ffe0b2', 2.5, opacity=0.75) + stroke('M524,200 L596,200 M520,182 L600,182 M528,166 L592,166 M540,152 L540,216 M560,150 L560,218 M580,152 L580,216', '#ffb74d', 1.5)
    return 'peach', [panel(18, 18, 292, 350), panel(330, 18, 292, 350), cross(164, 50), tick(476, 50),
                     G(mosquito(), x=86, y=150, s=2.0), G(bread(True), x=236, y=168, s=0.85), dirty, G(microbe('virus', '#ef5350', 'angry'), x=236, y=300, s=1.1),
                     G(tap(on=True), x=400, y=110, s=1.1), hands, bubbles, rect(380, 300, 40, 22, '#f8bbd0', rx=8), cover, G(matka(), x=560, y=356, s=0.8)]


# ---------- seeds ----------

BEAN = 'M0,-70 C70,-70 110,-30 110,10 C110,55 70,80 10,80 C-50,80 -100,60 -100,20 C-100,6 -82,0 -80,-8 C-78,-18 -100,-24 -100,-40 C-100,-60 -55,-70 0,-70 Z'


def bean_section():
    embryo = (path('M-64,-34 Q-54,-12 -70,8 Q-78,16 -88,18 Q-84,6 -80,-6 Q-76,-22 -64,-34 Z', '#dce775', 2.5) +
              path('M-64,-34 Q-58,-54 -42,-52 Q-48,-38 -64,-34 Z', '#8bc34a', 2) + path('M-64,-34 Q-44,-42 -38,-30 Q-52,-26 -64,-34 Z', '#9ccc65', 2))
    return (path(BEAN, '#8d5524') + G(path(BEAN, '#f3dfb0', 2.5), s=0.9) + ell(20, -10, 40, 20, '#fbecc8', 0, opacity=0.8) + embryo +
            circ(-93, 16, 3, OUT, 0))


def maize_section():
    maize = 'M0,-95 C50,-95 72,-60 66,-10 C60,40 30,92 0,95 C-30,92 -60,40 -66,-10 C-72,-60 -50,-95 0,-95 Z'
    return (path(maize, '#f9a825') + G(path(maize, '#ffe082', 0), s=0.9) + ell(-16, 42, 22, 40, '#fff3e0', 2.5, transform='rotate(12 -16 42)') +
            stroke('M-18,22 L-14,64', '#8bc34a', 6) + path('M-18,22 Q-26,6 -16,2 Q-12,12 -18,22 Z', '#8bc34a', 2) + path('M-14,64 Q-12,74 -16,80', 'none', 0) +
            stroke('M-14,64 L-16,80', '#dce775', 6))


def seedling(leaves=2):
    out = tube('M0,0 L0,-50', '#7cb342', 5)
    if leaves == 2:
        out += G(leaf('#66bb6a', 34), x=0, y=-50, r=-30) + G(leaf('#66bb6a', 34), x=0, y=-50, r=-150)
    else:
        out += path('M0,-40 Q-6,-80 10,-96 Q4,-70 6,-40 Z', '#66bb6a', 2.5)
    return out + stroke('M0,0 L0,24 M0,8 L-12,22 M0,10 L12,24', '#d7ccc8', 3)


@scene('seeds-s1')
def _():
    sprouting = G(path(BEAN, '#8d5524'), s=0.42) + stroke('M-36,6 Q-46,30 -40,52', '#f5f0e6', 6) + stroke('M-36,6 Q-46,30 -40,52', OUT, 1.5)
    return 'cream', [G(path(BEAN, '#8d5524'), x=92, y=104, s=0.5, r=-15), G(bean_section(), x=330, y=205, s=1.55), G(sprouting, x=560, y=300),
                     G(magnifier(30), x=96, y=290, s=1.0)]


@scene('seeds-s2')
def _():
    halves = (G(path(BEAN, '#f3dfb0'), x=112, y=170, s=0.55, r=-12) + G(path(BEAN, '#f3dfb0'), x=222, y=170, s=0.55, r=12, flip=True) +
              G(path('M0,-10 Q10,6 0,26 Q-10,6 0,-10 Z', '#dce775', 2) + path('M0,-10 Q-10,-26 6,-28 Q6,-16 0,-10 Z', '#8bc34a', 2), x=167, y=146))
    return 'cream', [divider(320, 30, 370), halves, G(seedling(2), x=167, y=332), G(maize_section(), x=478, y=180, s=1.15), G(seedling(1), x=478, y=342)]


@scene('seeds-s3')
def _():
    seed = lambda x, y, r=0: G(path(BEAN, '#8d5524', 4), x=x, y=y, s=0.22, r=r)
    root = lambda d: stroke(d, '#f5f0e6', 5) + stroke(d, OUT, 1.2)
    stages = [
        seed(80, 290),
        root('M198,292 Q196,310 200,330') + seed(200, 286),
        root('M318,286 Q314,320 320,356 M318,312 L304,326 M319,330 L334,342') + stroke('M322,272 Q316,236 332,230 Q344,232 340,248', '#9ccc65', 6) + seed(320, 280),
        root('M438,284 Q434,330 440,370 M437,312 L420,328 M438,336 L456,350') + tube('M440,270 L440,180', '#7cb342', 5) +
        ell(426, 178, 14, 9, '#f3dfb0', 2.5) + ell(454, 178, 14, 9, '#f3dfb0', 2.5) + G(leaf('#66bb6a', 20), x=440, y=172, r=-70),
        root('M558,286 Q552,330 560,376 M556,306 L536,324 M557,328 L580,344 M558,350 L540,366') + tube('M560,280 L560,128', '#7cb342', 6) +
        ell(548, 210, 9, 6, '#e6cf9c', 2) + ell(572, 210, 9, 6, '#e6cf9c', 2) + G(leaf('#66bb6a', 46), x=560, y=130, r=-30) + G(leaf('#66bb6a', 46), x=560, y=130, r=-150),
    ]
    arrows = ''.join(arrow(x, 96, x + 52, 96, '#8d6e63', 4, 12) for x in (114, 234, 354, 474))
    return 'sky', [G(sun(), x=600, y=40, s=0.6), soil_band(232, c='#8d5f3f'), path('M-10,232 H650', 'none', 0), stroke('M-10,232 H650', '#6d4c41', 4)] + stages + [arrows]


@scene('seeds-s4')
def _():
    pot_ = path('M-60,-60 L60,-60 L46,0 L-46,0 Z', '#d0723c') + rect(-66, -72, 132, 16, '#e08a52', rx=4) + ell(0, -72, 62, 8, '#6d4c41', 0)
    sprout = G(seedling(2), x=320, y=266, s=1.2)
    factor = lambda x, y, inner: circ(x, y, 46, '#ffffff', 3, stroke='#b2dfdb', opacity=0.95) + G(inner, x=x, y=y)
    wind = stroke('M-26,-10 q22,-10 40,0 q12,8 0,14 q-6,2 -10,-4 M-30,10 q26,-6 46,4', '#90a4ae', 4)
    thermo = rect(14, -30, 12, 44, '#ffffff', rx=6, sw=2.5) + circ(20, 18, 9, '#e53935', 2.5) + rect(17, -10, 6, 26, '#e53935', sw=0)
    dry = ell(0, 0, 50, 12, '#eeeeee') + ''.join(G(path(BEAN, '#a1673f'), x=dx, y=-6, s=0.12) for dx in (-22, -4, 14, 30))
    cold = G(ice_cube(), s=0.9) + G(path(BEAN, '#a1673f'), x=0, y=2, s=0.14)
    return 'mint', [factor(110, 110, G(drop(), s=1.6)), factor(320, 78, wind), factor(530, 110, G(sun(), x=-10, y=0, s=0.5) + thermo),
                    carrow(150, 150, 220, 220, 268, 236, '#26a69a', 5, 14), arrow(320, 126, 320, 176, '#26a69a', 5, 14), carrow(490, 150, 420, 220, 372, 236, '#26a69a', 5, 14),
                    G(pot_, x=320, y=346), sprout, G(dry, x=96, y=320), cross(150, 290), G(cold, x=546, y=320), cross(598, 290)]


# ---------- pollution ----------

@scene('pollution-s1')
def _():
    river = (path('M318,298 Q336,296 352,298 Q340,318 386,336 Q446,360 440,400 L236,400 Q246,360 290,336 Q330,316 318,298 Z', '#7d927a', 0) +
             stroke('M276,356 q14,-6 28,0 t28,0 M336,334 q10,-4 20,0', '#a5b8a0', 3))
    bare = stroke('M600,300 L600,232 M600,256 L578,232 M600,246 L622,224 M600,236 L588,214', '#6d4c41', 6)
    return 'smog', [ground(300, '#b8ba8c', '#9fa274'), G(factory(), x=112, y=302), G(smoke('#7d7d7d'), x=152, y=130), G(smoke('#8f8f8f'), x=190, y=160, s=0.8),
                    river, G(bottle('#a5d6a7'), x=300, y=330, s=0.6, r=80), G(bottle(), x=390, y=354, s=0.55, r=-70), G(fish('#ffa726', True), x=330, y=376, s=0.55),
                    G(trash_pile(), x=510, y=332, s=1.1), bare, G(polybag('#bdbdbd'), x=560, y=356, s=0.6, r=20)]


@scene('pollution-s2')
def _():
    road = rect(-10, 292, 660, 110, '#6d6d6d', sw=0) + ''.join(rect(x, 340, 40, 6, '#ffffff', sw=0, opacity=0.8) for x in range(10, 640, 80))
    city = ''.join(rect(x, 292 - h, 44, h, '#a7a59a', sw=0) for x, h in ((20, 120), (80, 80), (380, 140), (440, 100), (520, 70)))
    return 'smog', [city, G(factory('#9e7a6c'), x=270, y=294, s=0.8), G(smoke('#6f6f6f'), x=306, y=158, s=0.9), road,
                    G(bus(), x=200, y=330), G(smoke('#555555'), x=76, y=312, s=0.8), G(rickshaw(), x=470, y=338), G(smoke('#5f5f5f'), x=398, y=326, s=0.6),
                    G(fire(), x=594, y=292, s=1.1), G(smoke('#4f4f4f'), x=590, y=232, s=0.9)]


@scene('pollution-s3')
def _():
    river = path('M-10,280 Q160,264 320,282 T650,276 V400 H-10 Z', '#6f8f72', 0) + stroke('M60,320 q14,-6 28,0 t28,0 M420,330 q14,-6 28,0 t28,0 M230,360 q14,-6 28,0 t28,0', '#9fb59e', 3)
    pipe = rect(-10, 236, 80, 22, '#78909c') + path('M70,240 Q96,246 104,282 L88,284 Q82,258 70,256 Z', '#4e4a3a', 2.5)
    return 'sky', [ground(236, '#a5c27a', '#90ad65'), G(factory('#a5806f'), x=130, y=238, s=0.55), river, pipe, path('M88,282 Q120,292 160,286 Q120,300 90,296 Z', '#4e4a3a', 0, opacity=0.8),
                   G(bottle('#a5d6a7'), x=220, y=316, s=0.6, r=80), G(bottle(), x=470, y=350, s=0.6, r=-75), G(tin(), x=560, y=322, s=0.6, r=60),
                   G(fish('#ffa726', True), x=330, y=344, s=0.7), G(trash_pile(), x=520, y=250, s=0.9), G(polybag('#424242'), x=410, y=246, s=0.6)]


@scene('pollution-s4')
def _():
    bottle_buried = G(bottle(), x=478, y=352, s=0.6, r=90)
    hourglass = poly([(-16, -26), (16, -26), (0, 0), (16, 26), (-16, 26), (0, 0)], '#fff8e1') + path('M-9,-18 L9,-18 L0,-4 Z', '#ffca28', 0) + path('M-10,22 L10,22 L0,12 Z', '#ffca28', 0) + rect(-20, -32, 40, 6, '#8d6e63', rx=2, sw=2) + rect(-20, 26, 40, 6, '#8d6e63', rx=2, sw=2)
    return 'mint', [soil_band(298, c='#8d5f3f'), divider(320, 30, 290),
                    G(peel(), x=110, y=100), G(apple_core(), x=166, y=82), G(leaf('#8d6e63', 40), x=200, y=112, r=-30), G(paper_ball(), x=150, y=140, s=0.9),
                    G(bin_('#43a047'), x=165, y=298), G(flower('#ffca28', h=40), x=250, y=300), stroke('M70,330 q10,-8 20,0 M120,352 q10,-8 20,0', '#5d4037', 4),
                    G(bottle(), x=428, y=110, s=0.8), G(tin(), x=480, y=100), G(jar(), x=532, y=110, s=0.8), G(polybag(), x=478, y=150, s=0.8, r=-10),
                    G(bin_('#78909c'), x=478, y=298), bottle_buried, G(hourglass, x=574, y=346)]


# ---------- matter ----------

@scene('matter-s1')
def _():
    balloon = ell(150, 186, 40, 46, '#ef5350', transform='rotate(-25 150 186)') + path('M114,224 L104,236 L118,232 Z', '#ef5350', 2.5) + ell(136, 172, 8, 14, '#ffffff', 0, opacity=0.5, transform='rotate(-25 136 172)')
    view = circ(452, 150, 48, '#e3f2fd', 5, stroke='#455a64') + ''.join(circ(452 + dx, 150 + dy, 7, '#4fc3f7', 1.5) for dx, dy in ((-22, -14), (-4, -20), (16, -12), (-26, 8), (-6, 2), (14, 10), (30, -2), (-12, 24), (8, 28), (24, 22)))
    return 'lilac', [G(table(320, 76), x=360, y=352), G(rock(), x=258, y=272, s=1.0), G(book('#26a69a'), x=346, y=252), G(glass(0.7), x=452, y=276, s=1.1),
                     line(452, 198, 452, 214, '#455a64', 3), view, G(kid('#ffa726', girl=True, hands=((14, -120), (24, -126)), mouth='o', scarf='#7e57c2'), x=82, y=372), balloon]


@scene('matter-s2')
def _():
    milk = G(glass(0.75, '#ffffff'), x=320, y=360, s=1.2)
    return 'sky', [G(particles_box('solid', '#7986cb'), x=120, y=124), G(particles_box('liquid', '#4fc3f7'), x=320, y=124), G(particles_box('gas', '#ffb74d'), x=520, y=124),
                   G(ice_cube(), x=120, y=316, s=1.1), milk, G(pot(), x=520, y=344, s=0.95)]


@scene('matter-s3')
def _():
    two_way = circ(164, 50, 22, '#43a047', 3, stroke='#ffffff') + arrow(150, 44, 180, 44, '#ffffff', 4, 9) + arrow(178, 57, 148, 57, '#ffffff', 4, 9)
    one_way = circ(476, 50, 22, '#fb8c00', 3, stroke='#ffffff') + arrow(460, 50, 494, 50, '#ffffff', 4.5, 10)
    return 'peach', [panel(18, 18, 292, 350), panel(330, 18, 292, 350), two_way, one_way,
                     G(ice_cube(), x=88, y=150, s=0.9), arrow(130, 140, 186, 140, '#43a047', 5, 13), arrow(186, 164, 130, 164, '#43a047', 5, 13), ell(240, 166, 50, 14, '#81d4fa'),
                     G(paper(), x=88, y=290), arrow(130, 290, 186, 290, '#43a047', 5, 13), G(torn_paper(), x=244, y=290),
                     G(paper(), x=402, y=160) + G(fire(), x=402, y=134, s=0.7), arrow(444, 150, 500, 150, '#fb8c00', 5, 13), G(ash(), x=558, y=176),
                     G(egg(), x=402, y=300), arrow(434, 300, 488, 300, '#fb8c00', 5, 13), G(fried_egg_pan(), x=538, y=304, s=0.75)]


# ---------- force and machines ----------

@scene('force-machines-s1')
def _():
    tiles = [panel(18, 18, 295, 172), panel(327, 18, 295, 172), panel(18, 200, 295, 168), panel(327, 200, 295, 168)]
    rope = stroke('M422,100 L524,154', OUT, 3)
    kick = carrow(176, 336, 230, 250, 284, 248, '#e53935', 5, 14, dash='8 7')
    press = G(hand(), x=470, y=244, r=180, s=0.8)
    return 'cream', tiles + [G(kid('#5c6bc0', hands='front'), x=110, y=184, s=0.92), G(box(), x=196, y=184), arrow(160, 60, 250, 60),
                             G(kid('#ef6c57', hands=((26, -88), (34, -84)), girl=True), x=388, y=184, s=0.92), rope, G(toy_cart(), x=548, y=184, s=1.1), arrow(560, 60, 470, 60),
                             G(kid('#26a69a', hands=((-30, -86), (28, -60))), x=96, y=366, s=0.95), G(ball(), x=150, y=346), kick,
                             G(clay_ball(), x=470, y=352), press, arrow(518, 330, 548, 330, '#8d6e63', 5, 13), G(clay_cup(), x=590, y=352, s=0.7)]


@scene('force-machines-s2')
def _():
    rough = stroke('M440,330 ' + ' '.join(f'l6,{-8 if i % 2 else 8}' for i in range(28)), '#6d4c41', 4)
    return 'sky', [panel(18, 18, 190, 350), panel(225, 18, 190, 350), panel(432, 18, 190, 350),
                   G(kid('#ff7043', hands='up'), x=113, y=366), G(schoolbag(), x=113, y=210, s=0.9), arrow(176, 270, 176, 200, '#e53935', 5, 14),
                   G(tree(fruit='#e53935'), x=290, y=356, s=1.0), G(apple(), x=360, y=196), stroke('M360,214 L360,330', '#e53935', 4, stroke_dasharray='8 8'),
                   poly([(360, 352), (350, 334), (370, 334)], '#e53935', 0), rect(225, 356, 190, 12, '#8d6e63', sw=0),
                   line(440, 170, 614, 170, '#4fc3f7', 6), G(car('#ab47bc'), x=590, y=170, s=0.42), stroke('M470,156 h70 M480,146 h60', '#90a4ae', 3),
                   rough, G(car('#ab47bc'), x=490, y=330, s=0.42), stroke('M448,316 h14', '#90a4ae', 3)]


@scene('force-machines-s3')
def _():
    T = [(18, 18), (225, 18), (432, 18), (18, 201), (225, 201), (432, 201)]
    tiles = [panel(x, y, 190, 165) for x, y in T]
    lever = poly([(113, 146), (93, 176), (133, 176)], '#8d6e63') + G(rect(-80, -6, 160, 12, '#ffb300', rx=4), x=113, y=140, r=-14) + G(rock(), x=52, y=150, s=0.8) + arrow(172, 74, 172, 110, '#e53935', 5, 13)
    pulley = (rect(244, 40, 10, 136, '#8d6e63') + rect(386, 40, 10, 136, '#8d6e63') + rect(244, 36, 152, 10, '#8d6e63') + G(wheel(18, '#78909c'), x=320, y=60) +
              line(302, 60, 302, 130, OUT, 3) + line(338, 60, 338, 150, OUT, 3) + path('M286,130 L318,130 L314,156 L290,156 Z', '#90a4ae') + ell(320, 172, 64, 10, '#bcaaa4') + arrow(356, 120, 356, 160, '#e53935', 5, 13))
    wheel_axle = G(wheel(42), x=500, y=124) + rect(498, 120, 90, 8, '#5d4037', sw=2.5) + G(wheel(26), x=592, y=124, s=0.7)
    ramp = poly([(36, 350), (196, 350), (196, 262)], '#b0bec5') + G(box('#c58b5a', 40, 34), x=126, y=310, r=-29) + arrow(84, 318, 132, 290, '#e53935', 5, 13)
    wedge = (ell(320, 334, 66, 22, '#a1673f') + ell(256, 334, 14, 22, '#d7a86e') + path('M300,314 L320,340 L340,314 Z', '#5d4037', 0) +
             poly([(302, 268), (338, 268), (320, 330)], '#b0bec5') + line(310, 276, 318, 316, '#ffffff', 2.5) +
             limb(334, 238, 392, 210, '#8d6e63', 9) + rect(296, 226, 50, 24, '#78909c', rx=5) + stroke('M292,262 l-12,-4 M348,262 l12,-4', '#e53935', 3))
    screw = rect(519, 228, 16, 12, '#90a4ae', rx=3) + ell(527, 226, 22, 7, '#b0bec5') + rect(521, 236, 12, 96, '#b0bec5') + ''.join(line(518, y, 536, y + 8, '#607d8b', 3) for y in range(240, 326, 12)) + poly([(521, 332), (533, 332), (527, 350)], '#b0bec5', 2.5)
    return 'cream', tiles + [lever, pulley, wheel_axle, ramp, wedge, screw]


# ---------- light and sound ----------

@scene('light-sound-s1')
def _():
    return 'dusk', [rect(320, 0, 320, 400, '#000000', sw=0, opacity=0.25), stars([(380, 40, 1.6), (600, 60, 1.4), (520, 30, 1.8), (350, 190, 1.2), (610, 200, 1.5)]),
                    circ(92, 88, 70, 'url(#glow)', 0), G(sun(), x=92, y=88, s=0.85), G(bulb(), x=236, y=208, s=1.1), G(candle(), x=104, y=356, s=1.05),
                    G(firefly(), x=240, y=310), G(firefly(), x=200, y=270, s=0.6),
                    carrow(150, 54, 300, 10, 420, 62, '#ffd54f', 4, 13, dash='8 8'), circ(462, 92, 36, '#f6f0cf', 3, stroke='#b0a87a') +
                    circ(452, 82, 6, '#e0d8b0', 0) + circ(472, 102, 4, '#e0d8b0', 0),
                    G(book('#7986cb'), x=560, y=262), G(chair('#8d6e63'), x=436, y=356, s=1.2)]


@scene('light-sound-s2')
def _():
    beam = poly([(96, 108), (590, 30), (590, 196), (96, 132)], '#fff59d', 0, opacity=0.55) + ''.join(line(100, 120, 590, y, '#ffe082', 2, opacity=0.9) for y in (44, 80, 150, 184))
    shadow = poly([(300, 96), (590, 66), (590, 172), (300, 144)], '#37474f', 0, opacity=0.35) + ell(598, 120, 12, 52, '#263238', 0, opacity=0.8)
    window = lambda x, inside: rect(x - 74, 238, 148, 128, '#e3f2fd', rx=6) + inside + rect(x - 74, 238, 148, 128, 'none', rx=6, sw=6, stroke='#8d6e63') + line(x, 238, x, 366, '#8d6e63', 4)
    tree_small = lambda x: G(tree(), x=x, y=360, s=0.72)
    frosted = G(tree_small(320), op=0.6) + rect(246, 238, 148, 128, '#ffffff', rx=6, sw=0, opacity=0.55)
    planks = ''.join(rect(446 + i * 37, 238, 37, 128, '#a1673f' if i % 2 else '#b5793a', sw=2) for i in range(4))
    return 'lilac', [rect(590, 20, 40, 196, '#cfd8dc', rx=4), beam, shadow, G(torch(), x=70, y=120), circ(300, 120, 26, '#ef5350'),
                     window(120, tree_small(120)), window(320, E('g', frosted, filter='url(#blur)')), window(520, planks)]


@scene('light-sound-s3')
def _():
    waves = ''.join(stroke(f'M{290 + r * math.cos(math.radians(-35)):.0f},{276 + r * math.sin(math.radians(-35)):.0f} A{r},{r} 0 0 1 {290 + r * math.cos(math.radians(35)):.0f},{276 + r * math.sin(math.radians(35)):.0f}', '#7e57c2', 5, opacity=1 - r / 260)
                    for r in (40, 80, 120, 160, 200))
    sticks = line(170, 254, 196, 280, '#6d4c41', 5) + line(178, 300, 208, 296, '#6d4c41', 5)
    shake = stroke('M206,226 l6,-10 M232,222 l0,-12 M258,226 l-6,-10', '#ef6c57', 4)
    return 'peach', [ground(352, '#f3c9a8', '#e9b48d'), G(kid('#3949ab', hands=((24, -100), (34, -76))), x=130, y=376), G(dhol(), x=232, y=288, s=0.9), sticks, shake, waves,
                     G(kid('#ef6c57', girl=True, hands=((-28, -60), (24, -134)), scarf='#26a69a'), x=550, y=376, flip=True),
                     stroke('M520,232 q-8,8 0,16', '#7e57c2', 3), G(bird('#ffa726'), x=440, y=96, s=0.8)]


# ---------- electricity and magnets ----------

@scene('electricity-magnets-s1')
def _():
    wires = stroke('M30,180 Q130,214 210,262 M110,180 Q170,206 212,252', OUT, 2.5)
    line_wire = stroke('M330,232 Q470,252 640,226', OUT, 3) + rect(334, 226, 8, 160, '#8d6e63', sw=2) + rect(620, 220, 8, 166, '#8d6e63', sw=2)
    wet_hand = G(hand(), x=420, y=232, r=60) + ''.join(G(drop(), x=x, y=y, s=0.4) for x, y in ((392, 196), (408, 236), (380, 226)))
    return 'sky', [ground(320), G(pylon(), x=70, y=330), wires, G(house(), x=262, y=326), G(battery(), x=146, y=360, s=0.6), G(torch(), x=60, y=362, s=0.6),
                   panel(320, 16, 304, 362, '#ffffff', 0.55), G(socket(), x=520, y=130), wet_hand, cross(574, 66), line_wire, G(kite(), x=520, y=262), stroke('M520,304 Q470,340 440,370', OUT, 2), cross(600, 330)]


@scene('electricity-magnets-s2')
def _():
    def circuit(x0, y0, x1, y1, closed):
        wire = tube(f'M{x0},{(y0 + y1) / 2 - 40} L{x0},{y0} L{(x0 + x1) / 2 - 30},{y0} M{(x0 + x1) / 2 + 30},{y0} L{x1},{y0} L{x1},{y1} L{x0},{y1} L{x0},{(y0 + y1) / 2 + 40}', '#ef6c57', 6)
        sx = (x0 + x1) / 2
        lever = limb(sx - 30, y0, sx + 30, y0, '#90a4ae', 5) if closed else limb(sx - 30, y0, sx + 22, y0 - 34, '#90a4ae', 5)
        sw = wire + circ(sx - 30, y0, 7, '#455a64') + circ(sx + 30, y0, 7, '#455a64') + lever
        flow = ''.join(arrow(a, b, c, d, '#ff9800', 4, 11) for a, b, c, d in ((x0 + 30, y0 - 18, x0 + 70, y0 - 18), (x1 + 18, y0 + 40, x1 + 18, y0 + 80), (x1 - 40, y1 + 18, x1 - 80, y1 + 18))) if closed else ''
        return sw + G(battery(), x=x0, y=(y0 + y1) / 2, r=-90, s=1.0) + G(bulb(closed), x=x1, y=(y0 + y1) / 2 + 22, s=1.25) + flow
    return 'cream', [circuit(60, 70, 300, 330, True), circuit(400, 120, 580, 330, False), tick(300, 40), cross(580, 96)]


@scene('electricity-magnets-s3')
def _():
    attracted = G(clip(), x=104, y=296, r=10) + G(clip(), x=124, y=318, r=-8) + G(nail(), x=176, y=304, r=6) + G(clip(), x=196, y=298, r=-12)
    left = G(horseshoe(), x=148, y=240, s=1.1) + attracted
    pair = lambda y, flip2, c, inward: (G(bar_magnet(110), x=370, y=y) + G(bar_magnet(110, flip2), x=550, y=y) +
                                        (arrow(330, y - 32, 400, y - 32, c, 5, 13) + arrow(590, y - 32, 520, y - 32, c, 5, 13) if inward else
                                         arrow(400, y - 32, 330, y - 32, c, 5, 13) + arrow(520, y - 32, 590, y - 32, c, 5, 13)))
    others = G(bar_magnet(90), x=380, y=330, s=0.8) + rect(450, 310, 44, 34, '#d7a86e') + rect(510, 318, 60, 12, '#4fc3f7', rx=3) + G(paper(), x=598, y=326, s=0.5) + cross(470, 290)
    return 'lilac', [panel(18, 18, 252, 350), panel(286, 18, 336, 350), left, pair(110, False, '#43a047', True), pair(210, True, '#e53935', False), others]


# ---------- soils ----------

@scene('soils-s1')
def _():
    x0, w = 36, 250
    layers = (rect(x0, 92, w, 80, '#5d4037', sw=0) + rect(x0, 172, w, 84, '#a1765a', sw=0) + rect(x0, 256, w, 62, '#c8b3a2', sw=0) + rect(x0, 318, w, 52, '#8d8d8d', sw=0))
    bits = (''.join(ell(x, y, 7, 3, '#8d6e63', 0) for x, y in ((70, 112), (130, 136), (200, 118), (250, 150))) + ''.join(circ(x, y, 3, '#ffffff', 0, opacity=0.7) for x, y in ((96, 150), (180, 104), (234, 132))) +
            ''.join(G(drop(), x=x, y=y, s=0.3) for x, y in ((160, 160), (226, 108))) + ''.join(ell(x, y, 9, 6, '#8d6e63', 2) for x, y in ((80, 210), (150, 236), (220, 196), (260, 230))) +
            ''.join(poly([(x - 18, y + 10), (x - 10, y - 12), (x + 14, y - 14), (x + 20, y + 8)], '#b0a191', 2.5) for x, y in ((80, 290), (160, 296), (240, 286))))
    roots = stroke('M120,92 L118,140 M118,112 L100,132 M118,120 L136,140 M220,92 L222,130 M222,108 L238,124', '#e8d8c0', 3)
    top = rect(x0, 80, w, 14, '#7cb342', sw=0) + ''.join(G(grass('#558b2f'), x=x, y=82) for x in (60, 120, 180, 240))
    rock_ = poly([(-60, 0), (-70, -50), (-30, -90), (30, -96), (70, -60), (64, 0)], '#9e9e9e') + stroke('M-20,-88 L-6,-50 L-24,-20 M30,-90 L18,-56 L36,-30', OUT, 2.5)
    return 'cream', [rect(x0, 80, w, 290, 'none', rx=8), top, layers, bits, roots, G(worm(), x=170, y=126, s=0.6), rect(x0, 80, w, 290, 'none', rx=4),
                     G(sun(), x=388, y=78, s=0.6), G(cloud(), x=556, y=74, s=0.7), rain(520, 110, 5), stroke('M360,170 q30,-12 54,0 q14,8 2,16', '#90a4ae', 4),
                     G(rock_, x=438, y=318), arrow(510, 300, 546, 300, '#8d6e63', 5, 13), ''.join(G(rock(s=0.4), x=x, y=y) for x, y in ((570, 310), (596, 300), (584, 322))),
                     ''.join(circ(x, y, 3, '#e0b97a', 1) for x, y in ((560, 352), (572, 356), (586, 350), (600, 356), (614, 350), (594, 360)))]


@scene('soils-s2')
def _():
    loose = rect(-50, -70, 100, 70, '#8d5a3b') + ''.join(circ(x, y, 5, '#fff3e0', 0, opacity=0.8) for x, y in ((-30, -52), (6, -40), (30, -58), (-14, -20), (24, -16))) + stroke('M-6,-70 L-4,-30 L-14,-14 M-4,-40 L10,-24', '#e8d8c0', 3) + ''.join(G(drop(), x=x, y=y, s=0.32) for x, y in ((-20, -82), (16, -78)))
    hard = rect(-50, -70, 100, 70, '#5b3a26') + ell(0, -72, 40, 6, '#64b5f6', 2) + stroke('M0,-70 L0,-58 Q4,-50 -14,-44', '#e8d8c0', 3)
    grains = lambda r, n, c: ''.join(circ(math.cos(i * 2.4) * (i ** 0.5) * r * 1.9, math.sin(i * 2.4) * (i ** 0.5) * r * 1.9, r, c, 1.5) for i in range(n))
    view = lambda inner: circ(0, 0, 48, '#fffaf1', 4, stroke='#8d6e63') + inner
    return 'cream', [G(heap('#b4532a'), x=96, y=150), G(heap('#8d5a3b'), x=242, y=150), G(heap('#3b2a22'), x=388, y=150), G(heap('#8f8d86'), x=534, y=150),
                     G(view(grains(8, 9, '#e0b97a')), x=80, y=286), G(view(grains(5, 22, '#bfa58a')), x=196, y=286), G(view(grains(3, 60, '#a06a4c')), x=312, y=286),
                     G(loose, x=460, y=340), tick(460, 248), G(hard, x=580, y=340), cross(580, 248)]


@scene('soils-s3')
def _():
    dune = path('M-70,30 Q-30,-30 10,0 Q40,-24 70,30 Z', '#f0c27b') + G(sun(), x=48, y=-24, s=0.35)
    bank = rect(-70, 6, 140, 24, '#4fa9e0', rx=6, sw=0) + path('M-70,8 Q0,-14 70,8', '#a1887f', 0) + ''.join(line(x, 4, x, -22, '#c0a040', 3) + ell(x, -24, 3, 6, '#e6c35c', 0) for x in (-40, -24, -8, 8, 24, 40))
    return 'sky', [G(dune, x=110, y=62), G(bank, x=320, y=60), G(matka(), x=530, y=98, s=0.7),
                   ''.join(G(drop(), x=x, y=130, s=0.45) for x in (98, 122, 308, 332, 518, 542)),
                   G(funnel_column('#e0b97a', 6, 0.85), x=110, y=220), G(funnel_column('#a1887f', 3.2, 0.5), x=320, y=220), G(funnel_column('#8d5a3b', 0, 0.12, True), x=530, y=220)]


@scene('soils-s4')
def _():
    soil = rect(-10, 150, 330, 250, '#7a5236', sw=0) + rect(-10, 140, 330, 14, '#7cb342', sw=0)
    tunnels = stroke('M40,180 Q80,230 60,290 Q50,330 90,360 M200,170 Q240,210 220,260', '#5c3b26', 14) + ''.join(ell(x, y, 22, 12, '#5c3b26', 0) for x, y in ((250, 320), (150, 300)))
    roots = stroke('M140,150 L138,210 M138,176 L118,200 M139,190 L160,214 M290,150 L292,196 M291,170 L276,190', '#e8d8c0', 3.5)
    left = soil + tunnels + roots + G(worm(), x=70, y=250, s=0.8, r=60) + G(worm('#f8bbd0'), x=210, y=214, s=0.6, r=20) + G(ant(), x=250, y=320, s=0.8) + G(ant(), x=150, y=300, s=0.7, flip=True) + \
        G(mushroom('#a1673f'), x=60, y=150, s=0.7) + G(leaf('#a1887f', 30), x=200, y=146, r=10) + G(flower('#ffca28', h=40), x=140, y=150) + G(grass(), x=290, y=150) + \
        ''.join(G(microbe('rod', '#c5e1a5'), x=x, y=y, s=0.25) for x, y in ((110, 240), (180, 340), (260, 270)))
    bare = path('M340,190 L630,110 L630,190 Z', '#a1765a') + G(cloud('#b0bec5'), x=470, y=60, s=0.6) + rain(440, 84, 4) + stroke('M420,186 q30,-6 50,-20 M480,176 q30,-10 60,-32', '#8d5a3b', 5) + cross(600, 196)
    green = path('M340,370 L630,290 L630,370 Z', '#8d6e63') + path('M340,370 L630,290 L630,300 L340,378 Z', '#7cb342', 0) + G(tree(), x=520, y=330, s=0.5) + G(tree('#81c784'), x=600, y=306, s=0.45) + \
        G(bush(), x=430, y=350, s=0.7) + G(cloud('#b0bec5'), x=420, y=244, s=0.5) + rain(396, 264, 4) + tick(372, 300)
    return 'mint', [left, divider(322, 20, 375), bare, green]


# ---------- earth and space ----------

SKY_STARS = [(40, 40, 1.6), (120, 330, 1.4), (230, 60, 1.8), (300, 340, 1.3), (380, 40, 1.5), (450, 330, 1.7), (520, 70, 1.4), (610, 40, 1.8), (600, 300, 1.5), (180, 150, 1.2), (480, 160, 1.3), (330, 110, 1.1)]


@scene('earth-space-s1')
def _():
    orbits = ''.join(circ(-40, 200, r, 'none', 0, stroke='#ffffff', stroke_width=1.5, opacity=0.18) for r in (165, 200, 240, 280, 360, 460, 545, 615))
    earth = planet(10, '#4f9be0') + path('M-6,-4 Q-2,-8 2,-4 Q0,2 -6,-4 Z', '#66bb6a', 0) + circ(13, -12, 3, '#cfd8dc', 1)
    return 'night', [stars(SKY_STARS), orbits, circ(-40, 200, 150, 'url(#glow)', 0), circ(-40, 200, 118, '#ffb300', 3, stroke='#ffd54f'),
                     G(planet(5, '#b0a99f'), x=125, y=200), G(planet(9, '#e8c27a'), x=160, y=200), G(earth, x=200, y=200), G(planet(7, '#d9653b'), x=240, y=200),
                     G(planet(34, '#d8b48a', bands=[(-0.45, '#b98a5e'), (0.05, '#c99a6e'), (0.5, '#b98a5e')]), x=320, y=200),
                     G(planet(25, '#e5cf9a', ring=True), x=420, y=200), G(planet(16, '#9fe1e7'), x=506, y=200), G(planet(15, '#4a6fe3'), x=578, y=200)]


@scene('earth-space-s2')
def _():
    globe = circ(0, 0, 92, '#4f9be0') + path(bumpy(-30, -30, 28, 20, 6), '#66bb6a', 0) + path(bumpy(30, 30, 30, 18, 6), '#66bb6a', 0) + path(bumpy(-20, 46, 16, 10, 5), '#81c784', 0)
    night = E('path', d='M0,-92 A92,92 0 0 1 0,92 Z', fill='#0b1030', opacity=0.6)
    axis = line(-40, -100, 40, 100, '#ffffff', 3, stroke_dasharray='8 6')
    orbit = ell(520, 318, 92, 34, 'none', 0, stroke='#ffffff', stroke_width=2, stroke_dasharray='6 6', opacity=0.7) + circ(520, 318, 12, '#ffb300', 2) + \
        ''.join(circ(520 + 92 * math.cos(math.radians(a)), 318 + 34 * math.sin(math.radians(a)), 6, '#4f9be0', 2) for a in (0, 90, 180, 270)) + carrow(600, 300, 610, 340, 580, 350, '#ffd54f', 3, 10)
    rays = ''.join(arrow(110, y, 200, y, '#ffd54f', 3, 10) for y in (130, 190, 250))
    return 'night', [stars(SKY_STARS), circ(20, 190, 120, 'url(#glow)', 0), circ(10, 190, 76, '#ffb300', 3, stroke='#ffd54f'), rays,
                     G(globe + night + circ(0, 0, 92, 'none', 3) + axis, x=320, y=190, r=0), carrow(240, 84, 320, 50, 402, 86, '#ffffff', 4, 13),
                     G(sun(), x=262, y=330, s=0.3), circ(392, 330, 14, '#f6f0cf', 2) + circ(398, 326, 13, '#2c3a78', 0), orbit]


@scene('earth-space-s3')
def _():
    phases = ''.join(G(moon_phase(k, 26), x=56 + k * 76, y=300) for k in range(8))
    path_arrow = carrow(56, 344, 320, 372, 590, 344, '#8e97c4', 3, 10)
    return 'night', [stars(SKY_STARS), circ(-10, 110, 100, 'url(#glow)', 0), circ(-20, 110, 62, '#ffb300', 3, stroke='#ffd54f'),
                     arrow(60, 110, 250, 110, '#ffd54f', 4, 12),
                     circ(300, 110, 44, '#39405e', 2.5, stroke='#8e97c4') + E('path', d='M300,66 A44,44 0 0 0 300,154 Z', fill='#f6f0cf') + circ(300, 110, 44, 'none', 2.5, stroke='#8e97c4'),
                     arrow(352, 116, 474, 140, '#ffd54f', 4, 12), G(planet(30, '#4f9be0') + path(bumpy(-8, -6, 12, 9, 5), '#66bb6a', 0), x=510, y=150),
                     phases, path_arrow]


# ---------- plants ----------

@scene('plants-s1')
def _():
    roots = stroke('M320,282 L318,350 M318,300 L290,330 M319,312 L350,342 M318,330 L300,362 M319,340 L338,372 M290,330 L276,340 M350,342 L366,350', '#e8d8c0', 4)
    leaves = ''.join(G(leaf('#66bb6a', 56), x=320, y=y, r=r) for y, r in ((250, -20), (222, -160), (192, -25), (166, -155)))
    flowers = G(flower('#ec407a', h=0), x=324, y=110) + G(flower('#ec407a', h=0), x=370, y=142, s=0.8)
    fruit = stroke('M322,160 Q290,170 284,186', '#43a047', 3) + circ(280, 198, 15, '#e53935') + path('M272,186 L280,180 L288,186', '#43a047', 2)
    return 'mint', [soil_band(282, c='#8d5f3f'), stroke('M-10,282 H650', '#6d4c41', 4), G(sun(), x=80, y=70, s=0.75), roots, tube('M320,282 Q316,200 324,112', '#43a047', 8),
                    stroke('M322,170 Q350,150 368,142', '#43a047', 4), leaves, flowers, fruit, G(butterfly(), x=440, y=110, s=0.8),
                    ''.join(G(drop(), x=x, y=y, s=0.4) for x, y in ((252, 330), (390, 320), (362, 372))), G(grass(), x=150, y=282), G(grass(), x=500, y=282)]


@scene('plants-s2')
def _():
    big_leaf = G(path('M-150,0 Q-60,-110 150,0 Q-60,110 -150,0 Z', '#66bb6a') + stroke('M-146,0 L140,0 M-60,0 L-20,-40 M-60,0 L-20,40 M20,0 L60,-36 M20,0 L60,36', '#388e3c', 3) +
                 ''.join(circ(x, y, 3, '#c8e6c9', 0) for x, y in ((-90, 14), (-30, -20), (40, 24), (90, -10))), x=330, y=210, r=-12)
    stem = tube('M180,252 Q170,320 176,392', '#43a047', 9)
    water = ''.join(G(drop(), x=x, y=y, s=0.42) for x, y in ((192, 370), (192, 330))) + arrow(206, 386, 206, 290, '#29b6f6', 5, 14)
    co2 = ''.join(G(molecule_co2(), x=x, y=y, s=0.75) for x, y in ((60, 230), (90, 300))) + arrow(116, 262, 180, 236, '#78909c', 5, 14)
    o2 = ''.join(G(molecule_o2(), x=x, y=y, s=0.8) for x, y in ((560, 110), (600, 160))) + arrow(470, 170, 536, 140, '#ef5350', 5, 14)
    food = arrow(430, 250, 500, 300, '#ff9800', 5, 14) + poly([(540, 286), (562, 298), (562, 322), (540, 334), (518, 322), (518, 298)], '#ffcc80')
    rays = ''.join(arrow(110 + dx, 90 + dy, 200 + dx * 1.6, 158 + dy, '#ffb300', 5, 14) for dx, dy in ((0, 0), (40, -24), (-20, 26)))
    return 'sky', [G(sun(), x=70, y=62, s=0.85), rays, stem, big_leaf, water, co2, o2, food]


@scene('plants-s3')
def _():
    o2 = ''.join(circ(x, y, r, '#e1f5fe', 2.5, stroke='#4fc3f7') for x, y, r in ((420, 96, 10), (446, 72, 7), (470, 100, 8)))
    basket = path('M-54,-26 L54,-26 L42,10 L-42,10 Z', '#c58b5a') + ''.join(circ(x, -32, 12, c) for x, c in ((-30, '#ffb300'), (-6, '#e53935'), (18, '#ffb300'), (38, '#7cb342')))
    wheat = ''.join(stroke(f'M{x},0 L{x + 4},-80', '#c9a227', 3) + ''.join(ell(x + 4 - k * 0.4, -80 + k * 10, 4, 8, '#e6c35c', 1.5) for k in range(4)) for x in (0, 16, 32))
    cotton = stroke('M0,0 L0,-70 M0,-40 L-20,-56 M0,-50 L20,-66', '#6d4c41', 4) + ''.join(path(bumpy(x, y, 11, 10, 6), '#ffffff', 2.5) for x, y in ((0, -78), (-22, -62), (22, -72)))
    logs = ''.join(rect(-50, y, 100, 22, '#a1673f', rx=11) + ell(50, y + 11, 9, 11, '#d7a86e', 2.5) for y in (-22, -46)) + rect(-26, -70, 76, 22, '#a1673f', rx=11) + ell(50, -59, 9, 11, '#d7a86e', 2.5)
    return 'cream', [ground(320, '#c5e1a5', '#aed581'), G(tree(fruit='#ffb300', nest=True), x=320, y=336, s=1.55), G(bird('#42a5f5'), x=380, y=200, s=0.6),
                     G(kid('#ef6c57', girl=True, scarf='#26a69a'), x=250, y=372, s=0.75), o2, G(basket, x=100, y=360), G(wheat, x=70, y=290),
                     G(cotton, x=540, y=300), G(logs, x=540, y=372)]


# ---------- digestion ----------

@scene('digestion-s1')
def _():
    bolt = poly([(4, -26), (-12, 4), (0, 4), (-6, 26), (12, -6), (0, -6)], '#ffca28')
    growth = ''.join(rect(-30 + i * 22, -10 - i * 14, 16, 10 + i * 14, c, rx=3, sw=2.5) for i, c in enumerate(('#81c784', '#66bb6a', '#43a047')))
    heart = path('M0,18 C-30,-2 -24,-26 -10,-26 C-2,-26 0,-18 0,-14 C0,-18 2,-26 10,-26 C24,-26 30,-2 0,18 Z', '#ef5350')
    icon = lambda x, y, inner: circ(x, y, 42, '#ffffff', 3, stroke='#ffccbc') + G(inner, x=x, y=y, s=1.2)
    dal = bowl('#ffb74d', '#f9a825', 6)
    return 'peach', [icon(110, 96, bolt), icon(320, 70, G(growth, y=8)), icon(530, 96, heart),
                     carrow(256, 200, 180, 170, 140, 142, '#ff8a65', 4, 12), arrow(320, 170, 320, 120, '#ff8a65', 4, 12), carrow(384, 200, 460, 170, 500, 142, '#ff8a65', 4, 12),
                     G(plate(150), x=320, y=280), G(roti(), x=262, y=272), G(dal, x=372, y=282, s=0.7), circ(318, 306, 10, '#e53935', 2) + circ(338, 300, 8, '#7cb342', 2),
                     G(glass(0.75, '#ffffff'), x=520, y=330, s=0.9), G(apple(), x=100, y=312, s=1.4),
                     path('M70,330 Q106,372 160,336 Q162,328 154,330 Q108,356 78,324 Z', '#ffd54f', 2.5) + line(156, 332, 164, 326, '#6d4c41', 3)]


@scene('digestion-s2')
def _():
    body = path('M220,160 Q320,138 420,160 Q448,170 452,210 L446,410 L194,410 L188,210 Q192,170 220,160 Z', '#f1c9a5')
    head = rect(304, 108, 32, 40, '#f1c9a5', sw=2.5) + circ(320, 74, 46, '#f1c9a5') + path('M274,70 C272,26 300,20 320,22 C346,20 368,30 366,72 C356,50 336,46 320,48 C302,48 286,54 274,70 Z', '#2b1d16') + \
        circ(304, 76, 3, OUT, 0) + circ(336, 76, 3, OUT, 0) + ell(320, 98, 9, 5, '#c2185b', 2)
    food_pipe = tube('M320,104 L320,182 Q322,196 336,200', '#f48fb1', 8)
    stomach = path('M332,192 Q362,176 392,192 Q414,210 404,240 Q392,262 358,256 Q338,252 334,240 Q350,242 362,234 Q374,222 360,212 Q346,206 332,210 Z', '#ef9a9a')
    large = tube('M270,352 L266,278 Q266,268 278,268 L390,268 Q402,268 402,280 L402,350 Q402,366 360,370 L334,376 L334,410', '#d7a86e', 13)
    small = tube('M350,254 Q326,264 304,282 Q284,296 312,302 Q350,302 368,294 Q386,306 362,316 Q322,326 290,318 Q276,328 302,336 Q340,342 358,334 Q374,344 356,352 Q320,360 280,350', '#f8bbd0', 7)
    bite = G(roti(), x=420, y=90, s=0.4) + arrow(398, 94, 346, 98, '#ff7043', 4, 11)
    return 'peach', [body, head, large, small, food_pipe, stomach, bite]


@scene('digestion-s3')
def _():
    gum = stroke('M140,60 A180,160 0 0 0 500,60', '#f48fb1', 62) + stroke('M140,60 A180,160 0 0 0 500,60', '#ec407a', 3, opacity=0.4)
    teeth = ''
    for a, kind in ((81, 'i'), (99, 'i'), (64, 'i'), (116, 'i'), (46, 'c'), (134, 'c'), (26, 'm'), (154, 'm'), (6, 'm'), (174, 'm')):
        x, y = 320 + 180 * math.cos(math.radians(a)), 60 + 160 * math.sin(math.radians(a))
        rot = a - 90
        if kind == 'i':
            shape = rect(-17, -13, 34, 26, '#e3f2fd', rx=7, sw=2.5)
        elif kind == 'c':
            shape = path('M-16,13 L-16,-4 L0,-20 L16,-4 L16,13 Z', '#fff3e0', 2.5)
        else:
            shape = rect(-22, -20, 44, 40, '#e8f5e9', rx=11, sw=2.5) + stroke('M-8,-12 L-8,12 M8,-12 L8,12', '#a5d6a7', 2.5)
        teeth += G(shape, x=x, y=y, r=rot)
    singles = ''.join(circ(x, 318, 50, c, 3, stroke='#ffffff') + G(tooth(k, '#ffffff'), x=x, y=318, s=1.05) for x, k, c in ((150, 'incisor', '#bbdefb'), (320, 'canine', '#ffe0b2'), (490, 'molar', '#c8e6c9')))
    return 'sky', [gum, teeth, singles]


@scene('digestion-s4')
def _():
    tiles = [panel(18, 18, 295, 172), panel(327, 18, 295, 172), panel(18, 200, 295, 168), panel(327, 200, 295, 168)]
    t1 = G(toothbrush(), x=150, y=120) + G(sun(), x=60, y=64, s=0.4) + circ(256, 64, 16, '#f6f0cf', 2) + circ(263, 58, 14, '#fff6f1', 0)
    t2 = G(tap(on=True), x=448, y=48, s=0.9) + G(hand(), x=448, y=176, r=-30, s=0.9) + G(hand(), x=490, y=176, r=30, s=0.9, flip=True) + rect(540, 150, 44, 24, '#f8bbd0', rx=8) + \
        ''.join(circ(x, y, r, '#e3f2fd', 2) for x, y, r in ((470, 110, 8), (488, 96, 6), (500, 118, 7)))
    veg = G(plate(110), x=165, y=300) + G(apple(), x=130, y=290) + path('M150,300 L200,284 L206,292 Z', '#ff8f00', 2.5) + circ(186, 310, 11, '#e53935', 2.5) + G(leaf('#66bb6a', 34), x=150, y=318, r=-10) + path('M110,304 Q130,280 160,296 Q130,300 112,314 Z', '#ffd54f', 2.5)
    water = G(glass(0.8), x=476, y=344, s=1.4) + G(drop(), x=560, y=270, s=1.2)
    return 'mint', tiles + [t1, t2, veg, water, tick(290, 40), tick(600, 40), tick(290, 222), tick(600, 222)]


# ---------- water cycle ----------

@scene('water-cycle-s1')
def _():
    return 'sky', [ground(340, '#cfe8f5', '#b9dcee'), G(ice_cube(), x=110, y=280, s=1.3), G(glass(0.7), x=320, y=330, s=1.5), G(pot(), x=530, y=336, s=1.0),
                   arrow(176, 220, 254, 220, '#ff7043', 6, 15), G(flame_icon(), x=214, y=192), arrow(388, 220, 466, 220, '#ff7043', 6, 15), G(flame_icon(), x=426, y=192),
                   arrow(254, 300, 176, 300, '#29b6f6', 6, 15), G(snowflake(), x=214, y=330)]


@scene('water-cycle-s2')
def _():
    land = path('M260,400 L300,300 Q400,262 470,280 L650,250 L650,400 Z', '#9ccc65', 0)
    river = path('M520,236 Q480,280 430,300 Q370,322 300,330 L250,340 L250,356 L300,348 Q380,340 440,316 Q494,292 530,244 Z', '#4fa9e0', 0)
    evap = ''.join(stroke(f'M{x},290 q-10,-20 0,-40 t0,-40', '#4fc3f7', 4, stroke_dasharray='6 6') + poly([(x - 8, 214), (x + 8, 214), (x, 200)], '#4fc3f7', 0) for x in (80, 140, 200))
    return 'sky', [G(sun(), x=70, y=62, s=0.8), water_body(-10, 296, 300, 110), land, G(mountain('#8d9db6'), x=530, y=262, s=1.2), river,
                   evap, G(cloud(), x=250, y=96, s=0.8), carrow(310, 92, 360, 62, 410, 76, '#90a4ae', 4, 12), G(cloud('#b0bec5'), x=480, y=82, s=0.95), rain(440, 116, 5, '#29b6f6', 20),
                   G(tree(), x=380, y=300, s=0.45), G(tree('#81c784'), x=610, y=268, s=0.5), arrow(330, 336, 280, 344, '#1e88e5', 4, 12)]


@scene('water-cycle-s3')
def _():
    tiles = [panel(18, 18, 295, 172), panel(327, 18, 295, 172), panel(18, 200, 295, 168), panel(327, 200, 295, 168)]
    t1 = G(tap(), x=150, y=70, s=1.0) + G(toothbrush(), x=110, y=150, s=0.7) + G(glass(0.6), x=226, y=170, s=0.8)
    wrench = G(rect(-6, -50, 12, 70, '#90a4ae', rx=4) + path('M-16,-50 Q-16,-70 0,-70 Q16,-70 16,-50 L8,-50 L8,-62 L-8,-62 L-8,-50 Z', '#90a4ae'), x=540, y=130, r=-40)
    t2 = G(tap(drip=True), x=430, y=80, s=1.0) + wrench
    low_sun = E('path', d='M50,350 A40,40 0 0 1 130,350 Z', fill='#ffb74d') + stroke('M40,350 H300', '#8cc152', 6)
    t3 = low_sun + G(watering_can(), x=200, y=320) + ''.join(G(drop(), x=x, y=y, s=0.35) for x, y in ((250, 290), (254, 310))) + G(flower('#ec407a', h=50), x=262, y=350)
    river = path('M327,320 Q470,300 622,330 L622,368 L327,368 Z', '#4fa9e0', 0) + G(fish(), x=430, y=348, s=0.6) + G(bin_('#43a047'), x=560, y=300, s=0.55) + G(bottle(), x=560, y=226, s=0.5)
    return 'mint', tiles + [t1, t2, t3, river, tick(290, 40), tick(600, 40), tick(290, 222), tick(600, 222)]


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    only = set(sys.argv[2:])
    for key, fn in SCENES.items():
        if only and key not in only:
            continue
        theme, body = fn()
        with open(os.path.join(out, key + '.svg'), 'w', encoding='utf-8') as f:
            f.write(svg(theme, body))
    print(len(SCENES), 'scenes')


if __name__ == '__main__':
    main()
