import json
import sys
import re

obj = json.load(sys.stdin)
for page in obj["pages"]:
    for artboard in page["artboards"]:
        # For Unicode error
        #pageName = page["name"].encode("utf-8")
        artboardName = artboard["name"].encode("utf-8")
        print(artboardName)
