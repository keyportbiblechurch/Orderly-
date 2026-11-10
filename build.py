import sys,re
import os
SP=os.path.dirname(os.path.abspath(__file__))
r=lambda p:open(p).read()
qr=re.sub(r'^\s*//.*$','',r(SP+'/vendor/qrcode.js'),flags=re.M).replace('</','<\\/')
fonts='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Sans:wght@400;500;600;700&family=Jost:wght@400;500;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@400;500;700&family=Newsreader:ital,wght@0,400;0,500;1,400;1,500&family=Source+Sans+3:wght@400;600&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap'
body='<div id="app"></div><div id="pa"></div>\n<script>\n'+r(SP+'/vendor/bible.js')+'\n</script>\n<script>\n'+qr+'\n</script>\n<script>\n'+r(SP+'/src/i18n.js')+'\n'+r(SP+'/src/engine.js')+'\n'+r(SP+'/src/art.js')+'\n'+r(SP+'/src/fonts.js')+'\n'+r(SP+'/src/designs.js')+'\n'+r(SP+'/src/ui.js')+'\n</script>\n'
import base64

def png64(n):
    return 'data:image/png;base64,'+base64.b64encode(open(SP+'/assets/'+n,'rb').read()).decode()
def mani():
    import json
    m={"name":"Orderly — Church Bulletin Maker","short_name":"Orderly","display":"standalone","background_color":"#1f3a68","theme_color":"#1f3a68","icons":[{"src":png64('icon-192.png'),"sizes":"192x192","type":"image/png","purpose":"any"},{"src":png64('icon-512.png'),"sizes":"512x512","type":"image/png","purpose":"any"},{"src":png64('icon-maskable-512.png'),"sizes":"512x512","type":"image/png","purpose":"maskable"}]}
    return 'data:application/manifest+json;base64,'+base64.b64encode(json.dumps(m).encode()).decode()
ico='data:image/svg+xml;base64,'+base64.b64encode(open(SP+'/assets/orderly-icon.svg','rb').read()).decode()
head='<title>Orderly</title>\n<link rel="icon" type="image/svg+xml" href="'+ico+'">\n<link rel="apple-touch-icon" href="'+png64('apple-touch-icon.png')+'">\n<link rel="manifest" href="'+mani()+'">\n<meta name="theme-color" content="#1f3a68">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Orderly">\n<meta name="claude:viewport-fit-sides" content="cover">\n<link href="'+fonts+'" rel="stylesheet">\n<style>\n'+r(SP+'/src/app.css')+'\n</style>\n'
os.makedirs(SP+'/dist',exist_ok=True)
open(SP+'/dist/orderly-artifact.html','w').write(head+body)
site='<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+head+'</head>\n<body>\n'+body+'</body>\n</html>\n'
open(SP+'/index.html','w').write(site)
open(SP+'/dist/app_only.js','w').write(r(SP+'/src/i18n.js')+'\n'+r(SP+'/src/engine.js')+r(SP+'/src/art.js')+'\n'+r(SP+'/src/fonts.js')+r(SP+'/src/designs.js')+r(SP+'/src/ui.js'))
print(round(len(head+body)/1e6,2),'MB')
