import os

# Read all JS files in correct dependency order
js_files = [
    'js/parser.js',
    'js/analytics.js',
    'js/charts.js',
    'js/chatbot.js',
    'js/data-store.js',
    'js/app.js'
]

bundle_content = "/* NMC Healthcare (UAE) Performance Marketing & CRM Dashboard Unified Engine */\n\n"

for fpath in js_files:
    full_path = os.path.join("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)", fpath)
    with open(full_path, 'r', encoding='utf-8') as f:
        bundle_content += f"/* === {fpath} === */\n"
        bundle_content += f.read() + "\n\n"

bundle_path = "/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/bundle.js"
with open(bundle_path, 'w', encoding='utf-8') as f:
    f.write(bundle_content)

print(f"Created bundle.js ({len(bundle_content):,} bytes, {len(bundle_content.splitlines()):,} lines)")

# Also update index.html to load bundle.js and keep individual fallbacks
index_path = "/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/index.html"
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace script tags with bundle.js
script_block = """  <!-- NMC Application JavaScript Unified Bundle -->
  <script src="bundle.js?v=20260818_2"></script>
  <script src="js/parser.js"></script>
  <script src="js/analytics.js"></script>
  <script src="js/charts.js"></script>
  <script src="js/chatbot.js"></script>
  <script src="js/data-store.js"></script>
  <script src="js/app.js"></script>"""

import re
html_updated = re.sub(
    r'<script src="js/parser\.js".*?<\/script>\s*<script src="js/app\.js"><\/script>',
    script_block,
    html,
    flags=re.DOTALL
)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html_updated)

print("Updated index.html to include bundle.js with cache buster")
