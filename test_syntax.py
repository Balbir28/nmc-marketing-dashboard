import re

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Extract the script content from index.html
script_match = re.search(r'<script>(.*?)</script>', html, re.DOTALL)
if script_match:
    js_code = script_match.group(1)
    print(f"Extracted JS code length: {len(js_code)} chars, {len(js_code.splitlines())} lines")
    with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/extracted_test.js", "w", encoding="utf-8") as f:
        f.write(js_code)
    print("Wrote extracted_test.js")
else:
    print("Could not find <script> tag in index.html!")
