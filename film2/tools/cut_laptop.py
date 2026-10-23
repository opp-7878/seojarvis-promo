# Вырезка MacBook из фото по геометрии (не по цвету): ровные края, прозрачный экран.
from PIL import Image, ImageDraw; import numpy as np, math, sys
src=Image.open(sys.argv[1]).convert('RGB'); W,H=src.size; K=4
def arc(cx,cy,r,a0,a1,n=24): return [(cx+r*math.cos(math.radians(a0+(a1-a0)*i/n)), cy+r*math.sin(math.radians(a0+(a1-a0)*i/n))) for i in range(n+1)]
def P(pts): return [(x*K,y*K) for x,y in pts]
def mask(shapes):
    m=Image.new('L',(W*K,H*K),0); d=ImageDraw.Draw(m)
    for pts,f in shapes: d.polygon(P(pts),fill=f)
    return np.asarray(m.resize((W,H),Image.LANCZOS)).astype(np.float32)/255
top=265.6; R=26
lid=arc(416.9+R,top+R,R,180,270)+arc(1602.6-R,top+R,R,270,360)+[(1606.6,1070),(412.6,1070)]
bt,bb,bl,br=1069.6,1113.2,322.9,1686.6
base=arc(bl+3,bt+3,3,180,270)+arc(br-3,bt+3,3,270,360)+arc(br-15,bb-15,15,0,90)+arc(bl+15,bb-15,15,90,180)
def foot(x0,x1): return arc(x0+4,1110,4,180,90,6)[::-1][:0]+[(x0,1110)]+arc(x0+6,1116,6,180,90,8)+arc(x1-6,1116,6,90,0,8)+[(x1,1110)]
feet=[(foot(398.5,475),255),(foot(1536.5,1612),255)]
a=mask([(lid,255),(base,255)]+feet)
sx0,sy0,sx1,sy1,r=429.6,281.0,1590.0,1021.0,6.5
hole=arc(sx0+r,sy0+r,r,180,270)+arc(sx1-r,sy0+r,r,270,360)+[(sx1,sy1),(sx0,sy1)]
nx0,nx1,ny,nr=953.1,1062.6,300.4,4
notch=[(nx0,sy0-2)]+arc(nx0+nr,ny-nr,nr,180,90,8)+arc(nx1-nr,ny-nr,nr,90,0,8)+[(nx1,sy0-2)]
h=mask([(hole,255),(notch,0)])
alpha=a*(1-h)
img=np.asarray(src).astype(np.float32)
out=np.dstack([img,alpha*255]).clip(0,255).astype(np.uint8)
cx0,cy0,cx1,cy1=300,250,1710,1130
Image.fromarray(out[cy0:cy1,cx0:cx1],'RGBA').save(sys.argv[2],optimize=True)
print('png',cx1-cx0,cy1-cy0,'screen',round(sx0-cx0,1),round(sy0-cy0,1),round(sx1-sx0,1),round(sy1-sy0,1),'notch x',nx0-cx0,nx1-cx0,'bottom',ny-cy0)
