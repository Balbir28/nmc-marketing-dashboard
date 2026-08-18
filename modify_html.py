with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Hide Doctor / Consultant filter
old_doc_filter = '''      <!-- Doctor / Consultant -->
      <div class="filter-item">
        <span class="filter-label">Doctor / Consultant</span>
        <select id="filterDoctor" class="filter-select">
          <option value="ALL">All Doctors / Consultants</option>
        </select>
      </div>'''

new_doc_filter = '''      <!-- Doctor / Consultant (Hidden) -->
      <div class="filter-item" style="display: none;">
        <span class="filter-label">Doctor / Consultant</span>
        <select id="filterDoctor" class="filter-select">
          <option value="ALL">All Doctors / Consultants</option>
        </select>
      </div>'''

if old_doc_filter in html:
    html = html.replace(old_doc_filter, new_doc_filter)
    print("Successfully hid Doctor / Consultant filter in index.html!")

# 2. Add Sunny Specialities Table
target_pos = html.find('<tbody id="tbodySpecialityMatrix"></tbody>')
if target_pos != -1:
    card_end = html.find('</div>', html.find('</div>', target_pos) + 1) + 6
    sunny_table_html = """

      <!-- Sunny Clinics Specialities Performance Deep-Dive -->
      <div class="content-card" style="margin-bottom: 1.5rem;">
        <div class="card-header-row">
          <div class="card-title-group">
            <h3>🏥 Sunny Clinics (UAE) — Clinical Specialities Performance & Economics Deep-Dive</h3>
            <p>Granular breakdown of ad investment, patient engagement, inbound leads & CPBA across Sunny Medical Specialities</p>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Speciality</th>
                <th class="cell-numeric">Spend (AED)</th>
                <th class="cell-numeric">Clicks</th>
                <th class="cell-numeric">Impressions & CTR</th>
                <th class="cell-numeric">Avg CPC</th>
                <th class="cell-numeric">Conversions</th>
                <th class="cell-numeric">Booked Appts</th>
                <th class="cell-numeric">CPBA</th>
              </tr>
            </thead>
            <tbody id="tbodySunnySpecialityMatrix"></tbody>
          </table>
        </div>
      </div>"""
    
    html = html[:card_end] + sunny_table_html + html[card_end:]
    print("Successfully added Sunny Clinics Specialities table to index.html!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
