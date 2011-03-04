#!/usr/bin/env python
import glob
images = glob.glob('*.jpg')

print "var data = ["

for image in sorted(images):
  print "    {\n        image:'/resource/auroral_resources/imagery/"+str(image).strip()+"',\n        link:'/resource/auroral_resources/imagery/"+str(image).strip()+"'\n    },\n",

print "];\n"
