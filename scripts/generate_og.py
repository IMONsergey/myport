#!/usr/bin/env python3
"""Regenerate Open Graph previews from owned portfolio media. Requires Pillow."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og"
OUT.mkdir(parents=True, exist_ok=True)
DATA = json.loads((ROOT / "content" / "projects.json").read_text())
STORIES = json.loads((ROOT / "content" / "stories.json").read_text())
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"

def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()

def rgb(hex_color):
    c = hex_color.lstrip("#")
    return tuple(int(c[i:i+2], 16) for i in (0,2,4))

def text_width(draw, txt, f):
    return draw.textbbox((0,0), txt, font=f)[2]

def fit_title(draw, title, width=445, maxlines=3):
    for size in range(90, 37, -2):
        f = font(GEORGIA, size)
        words = title.split()
        lines = []
        cur = ""
        for word in words:
            nxt = (cur + " " + word).strip()
            if text_width(draw, nxt, f) <= width:
                cur = nxt
            elif cur:
                lines.append(cur)
                cur = word
            else:
                lines.append(word)
                cur = ""
        if cur:
            lines.append(cur)
        if len(lines) <= maxlines and all(text_width(draw, ln, f) <= width for ln in lines):
            return f, lines
    return font(GEORGIA, 42), [title]

def build(name, title, subtitle, cover_path=None, accent="#83cdb3"):
    W,H = 1200,630
    bg = Image.new("RGB", (W,H), (20,32,28))
    d=ImageDraw.Draw(bg)
    tone=rgb(accent)
    d.rectangle((0,0,14,H), fill=tone)
    d.rectangle((34,52,90,54), fill=tone)
    d.text((58,48),"OTCHESKOV. DIGITAL",fill=(229,238,230),font=font(ARIAL,20))
    d.text((58,95),"SELECTED WORK / PORTFOLIO",fill=(155,183,168),font=font(ARIAL,15))
    d.line((58,143,482,143),fill=(78,102,89),width=1)

    yf,lines = fit_title(d,title)
    size = getattr(yf, "size", 65)
    step = int(size*1.13)
    top = 200 if len(lines)<=2 else 180
    for i,line in enumerate(lines):
        d.text((55,top+i*step),line,fill=(242,247,240),font=yf)
    d.line((58,537,490,537), fill=(92,119,102),width=1)
    sf=font(ARIAL,20)
    words=subtitle.split()
    result=[]
    cur=""
    for w in words:
        test=(cur+" "+w).strip()
        if text_width(d,test,sf)>428 and cur:
            result.append(cur)
            cur=w
        else:
            cur=test
    if cur:result.append(cur)
    for i,line in enumerate(result[:2]):
        d.text((58,557+i*25),line,fill=(177,194,182),font=sf)
    card=Image.new("RGB",(632,485),(28,55,48))
    if cover_path and (ROOT/"public"/cover_path).is_file():
        with Image.open(ROOT/"public"/cover_path) as input_image:
            input_image=ImageOps.exif_transpose(input_image).convert("RGB")
            thumb=ImageOps.contain(input_image,(620,470),method=Image.Resampling.LANCZOS)
            card.paste(thumb,((632-thumb.width)//2,(485-thumb.height)//2))
    else:
        inner=ImageDraw.Draw(card)
        inner.text((100,188),"SIX SENSES",font=font(GEORGIA,57),fill=(219,227,213))
        inner.text((180,257),"RESIDENCES",font=font(GEORGIA,25),fill=(219,227,213))
    bg.paste(card,(540,71))
    d=ImageDraw.Draw(bg)
    d.rectangle((539,70,1173,558),outline=(86,112,101),width=2)
    d.text((550,580),"BRANDS   /   DIGITAL   /   SYSTEMS",fill=(165,190,172),font=font(ARIAL,15))
    bg.save(OUT/f"{name}.webp","WEBP",quality=83,method=6)
    print(f"{name}: {(OUT/f'{name}.webp').stat().st_size//1024} KiB")

build("profile","BRANDS. DIGITAL. SYSTEMS.","Сергей Отческов — портфолио архитектора брендов и цифровых систем",
      "media/sergey/00.webp", "#8abfac")
for p in DATA["projects"]:
    s=STORIES[p["id"]]
    cover=p.get("cover") or {}
    build(p["id"],p["title"],s.get("short",p["kicker"]),cover.get("src"),s.get("accent","#92b9a5"))
