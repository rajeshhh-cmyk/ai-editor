"""Overlay graphics matching the Matoshree reference edit (1080x1920)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, re
from functools import lru_cache

W, H = 1080, 1920
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")

MAGENTA = (214, 18, 214)
RED = (228, 24, 32)
BLACK = (14, 14, 14)
WHITE = (255, 255, 255)
NAVY = (40, 36, 110)
ORANGE = (236, 124, 36)
GREEN = (92, 170, 60)
PURPLE = (70, 40, 140)

DEVA_SCALE = 1.08  # Hind reads slightly smaller than Poppins at equal size


@lru_cache(None)
def font(name, size):
    return ImageFont.truetype(os.path.join(FD, name + ".ttf"), size, layout_engine=ImageFont.Layout.RAQM)


def _is_deva(ch):
    return "ऀ" <= ch <= "ॿ" or "꣠" <= ch <= "ꣿ"


def runs(text):
    """Split text into (is_devanagari, chunk) runs; neutral chars join the previous run."""
    out = []
    for ch in text:
        k = _is_deva(ch)  # spaces/punctuation go to Poppins (Hind subset lacks them)
        if out and out[-1][0] == k:
            out[-1] = (k, out[-1][1] + ch)
        else:
            out.append((k, ch))
    return out


def _fonts(weight, size):
    return font("Hind-" + weight, int(size * DEVA_SCALE)), font("Poppins-" + weight, size)


def text_len(text, size, weight="Bold"):
    fd, fl = _fonts(weight, size)
    return sum((fd if d else fl).getlength(s) for d, s in runs(text))


def draw_text(d, x, baseline, text, size, fill, weight="Bold"):
    fd, fl = _fonts(weight, size)
    for dv, s in runs(text):
        f = fd if dv else fl
        d.text((x, baseline), s, font=f, fill=fill, anchor="ls")
        x += f.getlength(s)
    return x


def shadow(img, radius=6, offset=(0, 4), alpha=110):
    a = img.split()[3].point(lambda v: v * alpha // 255)
    sh = Image.new("RGBA", img.size, (0, 0, 0, 255))
    sh.putalpha(a)
    pad = radius * 3
    out = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0))
    out.paste(sh, (pad + offset[0], pad + offset[1]), sh)
    out = out.filter(ImageFilter.GaussianBlur(radius))
    out.alpha_composite(img, (pad, pad))
    return out, pad


def pill(text, size=46):
    """Magenta caption box with white bold text (subtitle)."""
    tw = text_len(text, size)
    padx = 16
    h = int(size * 1.42)
    w = int(tw + 2 * padx)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=9, fill=MAGENTA + (255,))
    base = int(h * 0.76)
    draw_text(d, padx + 2, base + 2, text, size, (95, 0, 95, 150))
    draw_text(d, padx, base, text, size, WHITE + (255,))
    return img


def card(lines, size=60, maxw=1010):
    """White question card. lines: list of list of (text, color). Returns (img, pad)."""
    space = text_len(" ", size)
    widths = [sum(text_len(t, size) for t, _ in ln) + space * (len(ln) - 1) for ln in lines]
    cw = max(widths)
    if cw > maxw - 56:
        return card(lines, int(size * (maxw - 56) / cw), maxw)
    lh = int(size * 1.22)
    w = int(cw + 56)
    h = int(lh * len(lines) + size * 0.42)
    img = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = ImageDraw.Draw(img)
    y = int(size * 0.18) + int(size * 1.0)
    for ln, lw in zip(lines, widths):
        x = (w - lw) / 2
        for t, c in ln:
            x = draw_text(d, x, y, t, size, c + (255,)) + space
        y += lh
    return shadow(img, radius=8, offset=(0, 5), alpha=120)


def logo(width=280):
    """Re-drawn Matoshree IVF & ART Bank mark (top-right corner)."""
    S = 4
    w, h = 300 * S, 108 * S
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([10 * S, 4 * S, 23 * S, 17 * S], fill=NAVY)
    d.ellipse([53 * S, 2 * S, 66 * S, 15 * S], fill=GREEN)
    d.polygon([(6 * S, 21 * S), (24 * S, 21 * S), (40 * S, 46 * S), (40 * S, 62 * S), (22 * S, 38 * S),
               (22 * S, 66 * S), (6 * S, 66 * S)], fill=PURPLE)
    d.polygon([(56 * S, 19 * S), (72 * S, 19 * S), (72 * S, 66 * S), (56 * S, 66 * S), (56 * S, 38 * S),
               (40 * S, 62 * S), (40 * S, 46 * S)], fill=GREEN)
    d.ellipse([33 * S, 40 * S, 46 * S, 53 * S], fill=ORANGE)
    d.arc([0 * S, 14 * S, 80 * S, 72 * S], start=25, end=155, fill=ORANGE, width=5 * S)
    d.text((74 * S, 46 * S), "atoshree", font=font("Poppins-Bold", 47 * S), fill=NAVY, anchor="ls")
    d.text((84 * S, 70 * S), "IVF & ART Bank", font=font("Poppins-SemiBold", 19 * S), fill=NAVY, anchor="ls")
    d.line([(72 * S, 79 * S), (290 * S, 79 * S)], fill=ORANGE, width=3 * S)
    d.ellipse([286 * S, 76 * S, 294 * S, 82 * S], fill=ORANGE)
    d.text((76 * S, 96 * S), "Advanced  |  Affordable  |  Ethical", font=font("Poppins-SemiBold", 11 * S), fill=NAVY, anchor="ls")
    return img.resize((width, int(h * width / w)), Image.LANCZOS)


def insta_icon(size, gradient=False):
    S = 4
    s = size * S
    mask = Image.new("L", (s, s), 0)
    md = ImageDraw.Draw(mask)
    lw = max(2, int(s * 0.085))
    md.rounded_rectangle([lw // 2, lw // 2, s - lw // 2, s - lw // 2], radius=int(s * 0.28), outline=255, width=lw)
    c, r = s / 2, s * 0.22
    md.ellipse([c - r, c - r, c + r, c + r], outline=255, width=lw)
    dr = s * 0.055
    md.ellipse([s * 0.75 - dr, s * 0.25 - dr, s * 0.75 + dr, s * 0.25 + dr], fill=255)
    if gradient:
        import numpy as np
        yy, xx = np.mgrid[0:s, 0:s] / s
        t = np.clip((1 - yy) * 0.65 + (1 - xx) * 0.35, 0, 1)  # bottom-left warm -> top-right cool
        t = 1 - t
        stops = np.array([0.0, 0.25, 0.5, 0.75, 1.0])
        cols = np.array([(254, 218, 117), (250, 126, 30), (214, 41, 118), (150, 47, 191), (79, 91, 213)], float)
        rgb = np.stack([np.interp(t, stops, cols[:, i]) for i in range(3)], -1).astype("uint8")
        fill = Image.fromarray(rgb, "RGB").convert("RGBA")
    else:
        fill = Image.new("RGBA", (s, s), (255, 255, 255, 255))
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    img = Image.composite(fill, img, mask)
    return img.resize((size, size), Image.LANCZOS)


def handle_tag(icon=46, size=24):
    """White instagram glyph with @MATOSHREEIVF beneath (watermark)."""
    f = font("Poppins-SemiBold", size)
    txt = "@MATOSHREEIVF"
    tw = int(f.getlength(txt))
    w = max(tw, icon) + 8
    h = icon + size + 16
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ic = insta_icon(icon)
    sh, pad = shadow(ic, radius=3, offset=(0, 1), alpha=90)
    img.alpha_composite(sh.crop((pad, pad, pad + icon, pad + icon)), ((w - icon) // 2, 0))
    d = ImageDraw.Draw(img)
    d.text(((w - tw) // 2 + 1, h - 3), txt, font=f, fill=(0, 0, 0, 100), anchor="ls")
    d.text(((w - tw) // 2, h - 4), txt, font=f, fill=(255, 255, 255, 240), anchor="ls")
    return img


def footer():
    f = font("Poppins-Light", 30)
    txt = "-For Education Purpose Only*"
    tw = int(f.getlength(txt))
    img = Image.new("RGBA", (tw + 10, 50), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((5, 38), txt, font=f, fill=(255, 255, 255, 170), anchor="ls")
    return img


def end_handle(gradient=True, icon=150):
    ic = insta_icon(icon, gradient=gradient)
    f = font("Poppins-SemiBold", 38)
    txt = "@MATOSHREEIVF"
    tw = int(f.getlength(txt))
    w = max(tw, icon) + 10
    img = Image.new("RGBA", (w, icon + 95), (0, 0, 0, 0))
    img.alpha_composite(ic, ((w - icon) // 2, 0))
    ImageDraw.Draw(img).text(((w - tw) // 2, icon + 80), txt, font=f, fill=(255, 255, 255, 255), anchor="ls")
    return img
