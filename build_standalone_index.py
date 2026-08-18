with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/index.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/bundle.js", "r", encoding="utf-8") as f:
    js = f.read()

# Inline CSS
css_tag = f'<style>\n{css}\n</style>'
if '<style>' in html and '</style>' in html:
    s_idx = html.find('<style>')
    e_idx = html.find('</style>') + len('</style>')
    html = html[:s_idx] + css_tag + html[e_idx:]
elif '<link rel="stylesheet"' in html:
    import re
    html = re.sub(r'<link rel="stylesheet"[^>]*>', css_tag, html)

# Find script block and inline JS
inlined_script = f"""<!-- NMC Healthcare All-in-One Engine (Zero External File Dependencies) -->
  <script>
{js}
  </script>"""

if '<!-- NMC Healthcare All-in-One Engine' in html:
    s_idx = html.find('<!-- NMC Healthcare All-in-One Engine')
    e_idx = html.find('</script>', s_idx) + len('</script>')
    html = html[:s_idx] + inlined_script + html[e_idx:]
elif '<!-- NMC Application JavaScript Unified Bundle -->' in html:
    s_idx = html.find('<!-- NMC Application JavaScript Unified Bundle -->')
    e_idx = html.find('</script>', s_idx)
    # find the last script
    last_script = html.rfind('</script>') + len('</script>')
    html = html[:s_idx] + inlined_script + html[last_script:]

with open("/Users/balbaasaur/Documents/Antigravity/NMC Hospital (UAE)/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print(f"Successfully created 100% Self-Contained index.html ({len(html):,} bytes)")
