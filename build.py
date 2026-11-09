import sys,re
SP=sys.argv[1]
r=lambda p:open(p).read()
qr=re.sub(r'^\s*//.*$','',r(SP+'/npm/node_modules/qrcode-generator/dist/qrcode.js'),flags=re.M).replace('</','<\\/')
fonts='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Instrument+Sans:wght@400;500;600;700&family=Jost:wght@400;500;600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Manrope:wght@400;500;700&family=Newsreader:ital,wght@0,400;0,500;1,400;1,500&family=Source+Sans+3:wght@400;600&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap'
body='<div id="app"></div><div id="pa"></div>\n<script>\n'+r(SP+'/work/bible.js')+'\n</script>\n<script>\n'+qr+'\n</script>\n<script>\n'+r(SP+'/bul/src/engine.js')+'\n'+r(SP+'/bul/src/art.js')+'\n'+r(SP+'/bul/src/fonts.js')+'\n'+r(SP+'/bul/src/designs.js')+'\n'+r(SP+'/bul/src/ui.js')+'\n</script>\n'
head='<title>Orderly</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link href="'+fonts+'" rel="stylesheet">\n<style>\n'+r(SP+'/bul/src/app.css')+'\n</style>\n'
open(SP+'/bul/folio.html','w').write(head+body)
site='<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'+head+'</head>\n<body>\n'+body+'</body>\n</html>\n'
open(SP+'/bul/index.html','w').write(site)
open(SP+'/bul/app_only.js','w').write(r(SP+'/bul/src/engine.js')+r(SP+'/bul/src/art.js')+'\n'+r(SP+'/bul/src/fonts.js')+r(SP+'/bul/src/designs.js')+r(SP+'/bul/src/ui.js'))
print(round(len(head+body)/1e6,2),'MB')
