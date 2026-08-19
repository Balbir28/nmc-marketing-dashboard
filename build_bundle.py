import os

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
    full_path = os.path.join(os.getcwd(), fpath)
    with open(full_path, 'r', encoding='utf-8') as f:
        bundle_content += f"/* === {fpath} === */\n"
        bundle_content += f.read() + "\n\n"

with open('bundle.js', 'w', encoding='utf-8') as f:
    f.write(bundle_content)

print(f"Created bundle.js ({len(bundle_content):,} bytes, {len(bundle_content.splitlines()):,} lines)")

index_path = 'index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

start_marker = '<!-- Application Scripts -->'
if start_marker in html:
    prefix = html.split(start_marker)[0] + start_marker + '\n  <script>\n'
    suffix = '\n  </script>\n</body>\n</html>\n'
    updated_html = prefix + bundle_content + suffix
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(updated_html)
    print(f"Updated index.html ({len(updated_html):,} bytes)")
else:
    print('Error: start_marker not found in index.html!')
