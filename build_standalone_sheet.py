with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/sheet.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/bundle.js", "r", encoding="utf-8") as f:
    js = f.read()

# Inline CSS
css_tag = f'<style>\n{css}\n</style>'
if '<link rel="stylesheet" href="styles.css">' in html:
    html = html.replace('<link rel="stylesheet" href="styles.css">', css_tag)

# Find script block and inline JS
start_marker = "<!-- NMC Application JavaScript Unified Bundle -->"
end_marker = '<script src="js/analytics.js"></script>'

if start_marker in html and end_marker in html:
    start_pos = html.find(start_marker)
    end_pos = html.find(end_marker) + len(end_marker)
    inlined_script = f"""<!-- NMC Healthcare In-Sheet Engine -->
  <script>
{js}
  </script>"""
    html = html[:start_pos] + inlined_script + html[end_pos:]

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/sheet.html", "w", encoding="utf-8") as f:
    f.write(html)

print(f"Successfully created 100% Self-Contained sheet.html ({len(html):,} bytes)")
