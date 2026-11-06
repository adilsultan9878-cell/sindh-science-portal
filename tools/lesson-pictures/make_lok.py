"""Draw the pictures for the "Folk Science of Sindh" cards (/lok/), in the same style as the lesson pictures.
Usage: python make_lok.py <out_dir>   (normally lok/img)
"""
import os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pic_lib import *  # noqa: E402,F403
from make_pictures import BEAN, bowl, glass  # noqa: E402,F401

SCENES = {}


def scene(key):
    def add(fn):
        SCENES[key] = fn
        return fn
    return add


def camel():
    legs = ''.join(tube(f'M{x},-60 L{x + d},0', '#d4a46a', 9) for x, d in ((-40, -4), (-24, 4), (30, -2), (44, 6)))
    return (legs + path('M-60,-70 Q-60,-104 -30,-104 Q-14,-140 10,-108 Q30,-100 50,-80 Q60,-60 40,-58 L-50,-56 Q-64,-58 -60,-70 Z', '#d4a46a') +
            tube('M46,-78 Q70,-110 72,-136', '#d4a46a', 16) + path('M62,-150 Q86,-152 96,-138 Q96,-128 84,-128 L66,-128 Q58,-136 62,-150 Z', '#d4a46a') +
            circ(78, -142, 2.4, OUT, 0) + stroke('M-60,-70 Q-70,-60 -68,-44', OUT, 3) + rect(-30, -100, 40, 14, '#c62828', rx=4, sw=2.5))


def quilt():
    colours = ['#c62828', '#1d2a5b', '#f9a825', '#2e7d32', '#ffffff', '#ad1457']
    out = ''
    for i in range(6):
        for j in range(4):
            c = colours[(i + j * 2) % len(colours)]
            out += rect(-150 + i * 50, -100 + j * 50, 50, 50, c, sw=2)
            out += poly([(-125 + i * 50, -90 + j * 50), (-110 + i * 50, -75 + j * 50), (-125 + i * 50, -60 + j * 50), (-140 + i * 50, -75 + j * 50)],
                        '#ffffff' if c != '#ffffff' else '#c62828', 0, opacity=0.85)
    return out + rect(-150, -100, 300, 200, 'none', sw=5)


def mangh_house():
    return (rect(-90, -120, 180, 120, '#e8c9a0') + rect(-94, -126, 188, 12, '#c58b5a', rx=3) +
            path('M20,-126 L20,-210 L70,-230 L70,-126 Z', '#d7a86e') + path('M20,-210 L70,-230 L70,-176 L20,-170 Z', '#5d4037', 2.5) +
            ''.join(rect(x, -96, 30, 34, '#6d4c41', rx=3) for x in (-70, -20)) + rect(36, -70, 34, 70, '#8d6e63', rx=3))


def saltpans():
    out = ''
    for i in range(3):
        for j in range(2):
            out += rect(-210 + i * 140, -40 + j * 60, 128, 50, '#9fd3ea' if (i + j) % 2 else '#cfe8f3', rx=4, sw=2.5)
    return out + ''.join(path(f'M{x - 22},{y} Q{x},{y - 30} {x + 22},{y} Z', '#ffffff', 2.5) for x, y in ((-146, 4), (-6, 64), (134, 4)))


@scene('matka')
def _():
    vapour = ''.join(stroke(f'M{x},{y} q-8,-12 0,-24 t0,-24', '#90caf9', 4, opacity=0.9) for x, y in ((220, 230), (420, 230), (240, 170), (400, 170)))
    return 'cream', [ground(320, '#e6c9a6', '#d9b48a'), G(sun(), x=560, y=70, s=0.7), G(matka(), x=320, y=338, s=2.2),
                     ''.join(G(drop(), x=x, y=y, s=0.45) for x, y in ((262, 250), (380, 282), (300, 300))), vapour, G(glass(0.7), x=470, y=346, s=0.9)]


@scene('ralli')
def _():
    warm = ''.join(carrow(x, 330, x + 10, 300, x, 270, '#ef6c57', 4, 12) for x in (150, 490))
    return 'peach', [G(quilt(), x=320, y=180, r=-3), warm]


@scene('mangh')
def _():
    wind = ''.join(arrow(330, y, 420, y + 14, '#4fc3f7', 5, 14) for y in (80, 110)) + carrow(450, 200, 460, 260, 400, 290, '#4fc3f7', 5, 14)
    return 'sky', [ground(330), G(mangh_house(), x=460, y=336), wind, G(cloud(), x=160, y=80, s=0.7), G(sun(), x=90, y=200, s=0.55),
                   carrow(380, 236, 360, 180, 400, 150, '#ef6c57', 4, 12, dash='6 6')]


@scene('camel')
def _():
    dune = path('M-10,330 Q160,250 330,320 Q480,270 650,330 V400 H-10 Z', '#f0c27b', 0) + path('M-10,360 Q200,320 420,356 T650,350 V400 H-10 Z', '#e6b066', 0)
    return 'cream', [G(sun(), x=560, y=70, s=0.8), dune, G(camel(), x=300, y=346, s=1.3), G(bush('#9ccc65'), x=520, y=330, s=0.8)]


@scene('salt')
def _():
    return 'sky', [G(sun(), x=80, y=70, s=0.75), water_body(-10, 150, 660, 40), ground(200, '#e9dcc4', '#ddcca9'), G(saltpans(), x=320, y=270),
                   ''.join(stroke(f'M{x},150 q-6,-10 0,-20 t0,-20', '#90caf9', 3.5) for x in (200, 300, 400, 500))]


@scene('palla')
def _():
    river = path('M-10,400 L-10,300 Q200,280 300,200 Q380,130 470,40 L560,40 Q470,160 400,240 Q300,340 160,400 Z', '#4fa9e0', 0)
    return 'mint', [ground(400, '#a8d672'), path('M-10,0 H650 V400 H-10 Z', '#c5e1a5', 0), river, water_body(-10, 340, 220, 70, '#1e88e5'),
                    G(fish('#b0bec5'), x=180, y=300, r=-30), G(fish('#cfd8dc'), x=300, y=210, r=-40, s=0.9), G(fish('#b0bec5'), x=400, y=124, r=-45, s=0.8),
                    carrow(120, 360, 260, 300, 460, 70, '#ef6c57', 4, 13, dash='8 8')]


@scene('dahi')
def _():
    return 'mint', [G(glass(0.8, '#ffffff'), x=150, y=300, s=1.4), arrow(220, 250, 330, 250, '#26a69a', 6, 16),
                    G(bowl('#c0622f', '#ffffff', 14), x=460, y=320, s=1.6),
                    G(microbe('blob', '#4dd0e1', 'happy'), x=380, y=150), G(microbe('rod', '#81c784'), x=470, y=120, s=0.8), G(microbe('blob', '#ffb74d', 'happy'), x=550, y=170, s=0.8)]


@scene('ajrak')
def _():
    cloth = G(quilt(), x=0, y=0, s=0.75)
    block = rect(-50, -30, 100, 40, '#8d6e63', rx=6) + rect(-14, -80, 28, 52, '#a1673f', rx=6)
    return 'lilac', [G(cloth, x=260, y=230, r=4), G(block, x=500, y=180), G(path(bumpy(0, 0, 40, 18, 8), '#1d2a5b', 2.5), x=500, y=300),
                     G(path(bumpy(0, 0, 34, 16, 8), '#c62828', 2.5), x=580, y=330)]


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for key, fn in SCENES.items():
        theme, body = fn()
        with open(os.path.join(out, key + '.svg'), 'w', encoding='utf-8') as f:
            f.write(svg(theme, body))
    print(len(SCENES), 'pictures')


if __name__ == '__main__':
    main()
