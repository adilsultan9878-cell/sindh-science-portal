/* Clickable diagrams drawn as inline SVG.
   Each function receives label(id), which returns the part name in the current language
   (already HTML-escaped). Part ids must match "diagram.parts" in the chapter file. */
(function () {
  'use strict';

  // A clickable part: shapes + its label and leader line, so tapping either selects it.
  function part(id, label, shapes, lx, ly, line) {
    var lead = line ? '<line class="lead" x1="' + line[0] + '" y1="' + line[1] + '" x2="' + line[2] + '" y2="' + line[3] + '"/>' : '';
    return '<g class="part" data-part="' + id + '" tabindex="0" role="button" aria-label="' + label(id) + '">' +
      shapes + lead + '<text class="dlabel" x="' + lx + '" y="' + ly + '" text-anchor="middle">' + label(id) + '</text></g>';
  }

  window.DIAGRAMS = {
    plant: function (label) {
      return '<svg viewBox="0 0 360 330" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="0" y="240" width="360" height="90" fill="#f1e6d2"/>' +
        '<line x1="0" y1="240" x2="360" y2="240" stroke="#c8b08a" stroke-width="2"/>' +
        part('root', label,
          '<rect x="135" y="242" width="90" height="86" fill="transparent"/>' +
          '<path class="shape" d="M180 240 L180 302 M180 256 L150 290 M180 262 L212 296 M180 282 L160 318 M180 286 L204 322" stroke="#8d6e63" stroke-width="5" stroke-linecap="round" fill="none"/>',
          60, 294, [92, 289, 150, 289]) +
        part('stem', label,
          '<rect class="shape" x="174" y="80" width="12" height="160" rx="5" fill="#66bb6a" stroke="#388e3c" stroke-width="1.5"/>',
          60, 116, [92, 111, 173, 111]) +
        part('leaf', label,
          '<ellipse class="shape" cx="138" cy="176" rx="40" ry="15" transform="rotate(-25 138 176)" fill="#81c784" stroke="#388e3c" stroke-width="1.5"/>' +
          '<ellipse class="shape" cx="222" cy="140" rx="40" ry="15" transform="rotate(25 222 140)" fill="#81c784" stroke="#388e3c" stroke-width="1.5"/>',
          305, 112, [280, 116, 240, 136]) +
        part('flower', label,
          '<circle class="shape" cx="180" cy="45" r="11" fill="#f8bbd0" stroke="#d81b60" stroke-width="1.2"/>' +
          '<circle class="shape" cx="194.3" cy="55.4" r="11" fill="#f8bbd0" stroke="#d81b60" stroke-width="1.2"/>' +
          '<circle class="shape" cx="188.8" cy="72.1" r="11" fill="#f8bbd0" stroke="#d81b60" stroke-width="1.2"/>' +
          '<circle class="shape" cx="171.2" cy="72.1" r="11" fill="#f8bbd0" stroke="#d81b60" stroke-width="1.2"/>' +
          '<circle class="shape" cx="165.7" cy="55.4" r="11" fill="#f8bbd0" stroke="#d81b60" stroke-width="1.2"/>' +
          '<circle cx="180" cy="60" r="9" fill="#fdd835" stroke="#f9a825"/>',
          60, 44, [92, 44, 160, 52]) +
        part('fruit', label,
          '<path d="M186 205 Q 205 205 214 214" stroke="#388e3c" stroke-width="3" fill="none"/>' +
          '<circle class="shape" cx="222" cy="226" r="14" fill="#ef5350" stroke="#c62828" stroke-width="1.5"/>',
          305, 214, [280, 218, 238, 224]) +
        '</svg>';
    },

    digestive: function (label) {
      return '<svg viewBox="0 0 360 400" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="180" cy="52" r="38" fill="#fdebd8" stroke="#d7b899" stroke-width="2"/>' +
        '<rect x="165" y="86" width="30" height="22" fill="#fdebd8"/>' +
        '<rect x="105" y="100" width="150" height="290" rx="55" fill="#fdf3e8" stroke="#d7b899" stroke-width="2"/>' +
        '<circle cx="166" cy="44" r="4" fill="#5d4037"/><circle cx="194" cy="44" r="4" fill="#5d4037"/>' +
        part('foodpipe', label,
          '<rect class="shape" x="175" y="74" width="10" height="114" rx="4" fill="#f6b48f" stroke="#e07a4f" stroke-width="1.5"/>',
          58, 140, [90, 135, 174, 135]) +
        part('mouth', label,
          '<rect x="158" y="56" width="44" height="22" fill="transparent"/>' +
          '<path class="shape" d="M166 64 Q180 76 194 64" stroke="#c62828" stroke-width="4" fill="none" stroke-linecap="round"/>',
          58, 72, [90, 67, 160, 67]) +
        part('largeint', label,
          '<path class="shape" d="M130 372 V 276 Q130 268 138 268 H 222 Q230 268 230 276 V 372" stroke="#e76f51" stroke-width="14" fill="none" stroke-linecap="round"/>',
          302, 352, [272, 347, 238, 347]) +
        part('smallint', label,
          '<rect x="140" y="282" width="80" height="76" fill="transparent"/>' +
          '<path class="shape" d="M198 250 V 288 H 150 Q 142 288 142 296 Q 142 304 150 304 H 210 Q 218 304 218 312 Q 218 320 210 320 H 150 Q 142 320 142 328 Q 142 336 150 336 H 210 Q 218 336 218 344 Q 218 352 210 352 H 160" stroke="#e9b949" stroke-width="7" fill="none" stroke-linecap="round"/>',
          58, 325, [90, 320, 141, 320]) +
        part('stomach', label,
          '<path class="shape" d="M182 184 C 240 168, 252 228, 212 250 C 186 263, 158 246, 170 226 C 178 212, 176 199, 182 184 Z" fill="#f4a261" stroke="#d9773a" stroke-width="2"/>',
          302, 202, [272, 197, 238, 205]) +
        '</svg>';
    },

    watercycle: function (label) {
      return '<svg viewBox="0 0 360 285" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><marker id="wc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
        '<path d="M0 0 L10 5 L0 10 z" fill="#1e88e5"/></marker></defs>' +
        '<polygon points="215,218 290,108 360,218" fill="#c5e1a5" stroke="#9ccc65" stroke-width="2"/>' +
        part('collection', label,
          '<rect class="shape" x="0" y="218" width="360" height="67" fill="#bbdefb" stroke="#90caf9" stroke-width="2"/>' +
          '<path class="shape" d="M288 150 Q 272 192 236 212" stroke="#1e88e5" stroke-width="3" fill="none" marker-end="url(#wc-arrow)"/>',
          110, 262, null) +
        part('sun', label,
          '<circle class="shape" cx="50" cy="46" r="24" fill="#ffe082" stroke="#f9a825" stroke-width="2"/>' +
          '<path d="M50 12 V4 M50 80 V88 M16 46 H8 M84 46 H92 M26 22 L20 16 M74 70 L80 76 M74 22 L80 16 M26 70 L20 76" stroke="#f9a825" stroke-width="3" stroke-linecap="round"/>',
          50, 108, null) +
        part('evaporation', label,
          '<rect x="68" y="120" width="90" height="96" fill="transparent"/>' +
          '<path class="shape" d="M84 212 Q 76 192 84 172 Q 92 152 84 136" stroke="#1e88e5" stroke-width="3" fill="none" stroke-dasharray="5 4" marker-end="url(#wc-arrow)"/>' +
          '<path class="shape" d="M112 212 Q 104 192 112 172 Q 120 152 112 136" stroke="#1e88e5" stroke-width="3" fill="none" stroke-dasharray="5 4" marker-end="url(#wc-arrow)"/>' +
          '<path class="shape" d="M140 212 Q 132 192 140 172 Q 148 152 140 136" stroke="#1e88e5" stroke-width="3" fill="none" stroke-dasharray="5 4" marker-end="url(#wc-arrow)"/>' +
          '<path d="M150 118 Q 162 90 184 80" stroke="#1e88e5" stroke-width="2" fill="none" stroke-dasharray="5 4" marker-end="url(#wc-arrow)"/>',
          112, 128, null) +
        part('condensation', label,
          '<circle class="shape" cx="200" cy="64" r="20" fill="#eceff1" stroke="#b0bec5" stroke-width="2"/>' +
          '<circle class="shape" cx="250" cy="66" r="20" fill="#eceff1" stroke="#b0bec5" stroke-width="2"/>' +
          '<circle class="shape" cx="225" cy="52" r="25" fill="#eceff1" stroke="#b0bec5" stroke-width="2"/>' +
          '<rect x="196" y="62" width="58" height="22" fill="#eceff1"/>',
          225, 20, null) +
        part('precipitation', label,
          '<rect x="190" y="88" width="64" height="62" fill="transparent"/>' +
          '<path class="shape" d="M206 92 l-8 18 M224 95 l-8 18 M242 92 l-8 18 M214 122 l-8 18 M232 125 l-8 18" stroke="#42a5f5" stroke-width="3" stroke-linecap="round"/>',
          315, 82, [292, 88, 252, 104]) +
        '</svg>';
    },

    circuit: function (label) {
      return '<svg viewBox="0 0 360 270" xmlns="http://www.w3.org/2000/svg">' +
        part('wire', label,
          '<path class="shape" d="M90 70 H 290 V 200 H 90 Z" stroke="#b87333" stroke-width="5" fill="none" stroke-linejoin="round"/>',
          190, 230, [190, 216, 190, 203]) +
        part('battery', label,
          '<rect x="70" y="98" width="40" height="66" fill="#fff"/>' +
          '<rect class="shape" x="74" y="104" width="32" height="58" rx="4" fill="#ffca28" stroke="#f57f17" stroke-width="2"/>' +
          '<rect x="83" y="96" width="14" height="8" rx="2" fill="#9e9e9e"/>' +
          '<text x="90" y="128" text-anchor="middle" font-size="18" font-weight="700" fill="#5d4037">+</text>' +
          '<text x="90" y="154" text-anchor="middle" font-size="18" font-weight="700" fill="#5d4037">−</text>',
          44, 262, [60, 248, 82, 166]) +
        part('switch', label,
          '<rect x="158" y="52" width="64" height="30" fill="transparent"/>' +
          '<rect x="164" y="64" width="52" height="12" fill="#fff"/>' +
          '<circle cx="166" cy="70" r="5" fill="#455a64"/><circle cx="214" cy="70" r="5" fill="#455a64"/>' +
          '<line class="shape" x1="166" y1="70" x2="214" y2="70" stroke="#455a64" stroke-width="5" stroke-linecap="round"/>',
          190, 36, [190, 42, 190, 60]) +
        part('bulb', label,
          '<rect x="262" y="96" width="56" height="74" fill="#fff"/>' +
          '<path d="M290 86 V 80 M266 98 L 260 92 M314 98 L 320 92 M258 120 H 250 M322 120 H 330" stroke="#f9a825" stroke-width="3" stroke-linecap="round"/>' +
          '<circle class="shape" cx="290" cy="122" r="22" fill="#fff59d" stroke="#f9a825" stroke-width="2"/>' +
          '<path d="M282 124 L 286 132 L 290 124 L 294 132 L 298 124" stroke="#ef6c00" stroke-width="1.5" fill="none"/>' +
          '<rect class="shape" x="280" y="143" width="20" height="18" rx="3" fill="#90a4ae" stroke="#607d8b" stroke-width="1.5"/>',
          330, 262, [326, 248, 300, 164]) +
        '</svg>';
    },

    solar: function (label) {
      var planets = [
        ['mercury', 98, 4, '#9e9e9e'], ['venus', 124, 7, '#ffcc80'], ['earth', 154, 8, '#42a5f5'], ['mars', 182, 6, '#e57373'],
        ['jupiter', 226, 18, '#d7a86e'], ['saturn', 280, 15, '#e6c88a'], ['uranus', 322, 10, '#80deea'], ['neptune', 352, 10, '#5c6bc0']
      ];
      return '<svg viewBox="0 0 380 220" xmlns="http://www.w3.org/2000/svg">' +
        '<line x1="70" y1="110" x2="372" y2="110" stroke="#cfd8dc" stroke-width="1.5" stroke-dasharray="4 5"/>' +
        part('sun', label,
          '<circle class="shape" cx="14" cy="110" r="62" fill="#ffe082" stroke="#f9a825" stroke-width="2"/>',
          40, 196, null) +
        planets.map(function (p, i) {
          var up = i % 2 === 0, ly = up ? 110 - p[2] - 22 : 110 + p[2] + 32;
          var extra = p[0] === 'saturn' ? '<ellipse cx="' + p[1] + '" cy="110" rx="26" ry="6" fill="none" stroke="#b08d57" stroke-width="2.5"/>' : '';
          extra += p[0] === 'earth' ? '<circle cx="' + (p[1] + 13) + '" cy="100" r="2.5" fill="#bdbdbd"/>' : '';
          return part(p[0], label,
            '<circle cx="' + p[1] + '" cy="110" r="' + Math.max(14, p[2] + 4) + '" fill="transparent"/>' +
            '<circle class="shape" cx="' + p[1] + '" cy="110" r="' + p[2] + '" fill="' + p[3] + '" stroke="#546e7a" stroke-width="1"/>' + extra,
            p[1], ly, null);
        }).join('') +
        '</svg>';
    }
  };

  // A real picture for each chapter, shown above the clickable diagram.
  // All come from Wikimedia Commons under free licences; the credit line is required, so keep it.
  var BY_SA_25 = 'https://creativecommons.org/licenses/by-sa/2.5/',
      BY_SA_30 = 'https://creativecommons.org/licenses/by-sa/3.0/',
      BY_SA_40 = 'https://creativecommons.org/licenses/by-sa/4.0/',
      BY_25 = 'https://creativecommons.org/licenses/by/2.5/',
      CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/';
  // "topic" is the lesson section (s1, s2…) the picture belongs to; the diagram page groups pictures by topic.
  function pic(name, topic, w, h, author, license, licenseUrl, file) {
    return { src: '/img/' + name + '.webp', topic: topic, w: w, h: h, author: author, license: license, licenseUrl: licenseUrl,
      link: 'https://commons.wikimedia.org/wiki/File:' + file };
  }
  window.PICTURES = {
    'living-things': pic('living-things', 's3', 655, 900, 'Stemonitis', 'CC BY-SA 2.5', BY_SA_25, 'Animalia_diversity.jpg'),
    'plants': pic('plants', 's1', 651, 900, 'Kelvinsong', 'CC BY-SA 3.0', BY_SA_30, 'Plant.svg'),
    'digestion': pic('digestion', 's2', 637, 900, 'Mariana Ruiz, Jmarchn', 'Public domain', '', 'Digestive_system_diagram_en.svg'),
    'water-cycle': pic('water-cycle', 's2', 760, 360, 'Joooo, moyogo, Alexchr', 'CC BY-SA 3.0', BY_SA_30, 'Water_Cycle-en.png'),
    'matter': pic('matter', 's2', 500, 556, 'Luis Javier Rodriguez Lopez', 'CC BY 2.5', BY_25, 'Solid_liquid_gas.svg'),
    'force-machines': pic('force-machines', 's3', 760, 702, 'Pearson Scott Foresman', 'Public domain', '', 'Lever_(PSF).png'),
    'light-sound': pic('light-sound', 's1', 760, 506, 'Kelvinsong', 'CC0', CC0, 'Prism_flat_rainbow.jpg'),
    'electricity-magnets': pic('electricity-magnets', 's3', 620, 421, 'Newton Henry Black', 'Public domain', '', 'Magnet0873.png'),
    'earth-space': pic('earth-space', 's1', 760, 428, 'Lsmpascal', 'CC BY-SA 3.0', BY_SA_30, 'Size_planets_comparison.jpg'),
    'microorganisms': pic('microorganisms', 's2', 760, 639, 'NIAID', 'Public domain', '', 'EscherichiaColi_NIAID.jpg'),
    'seeds': pic('seeds', 's3', 760, 630, 'HudsonFlagg', 'CC0', CC0, 'Sequential_Steps_of_Bean_Seedling_Germination.svg'),
    'pollution': pic('pollution', 's2', 760, 448, 'Adina Voicu', 'CC0', CC0, 'Smoke_Pollution.jpg'),
    'soils': pic('soils', 's3', 760, 445, 'Kaerii', 'CC BY-SA 4.0', BY_SA_40, 'Soil_texture.png')
  };

  // The lesson section each chapter's clickable diagram explains.
  window.DIAGRAM_TOPICS = {
    'living-things': 's3', 'plants': 's1', 'digestion': 's2', 'water-cycle': 's2', 'matter': 's2',
    'force-machines': 's3', 'light-sound': 's2', 'electricity-magnets': 's2', 'earth-space': 's1',
    'microorganisms': 's2', 'seeds': 's1', 'pollution': 's1', 'soils': 's3'
  };

  // Short narrated videos (Urdu) for key topics, shown at the top of the lesson.
  function lv(name) { return { src: '/lesson-videos/' + name + '-ur.mp4', poster: '/lesson-videos/' + name + '-ur.webp' }; }
  window.LESSON_VIDEOS = {
    'living-things': lv('living-things'), 'microorganisms': lv('microorganisms'), 'seeds': lv('seeds'), 'pollution': lv('pollution'),
    'matter': lv('matter'), 'force-machines': lv('force-machines'), 'light-sound': lv('light-sound'),
    'electricity-magnets': lv('electricity-magnets'), 'soils': lv('soils'), 'earth-space': lv('earth-space'),
    'plants': lv('photosynthesis'), 'digestion': lv('digestion'), 'water-cycle': lv('water-cycle')
  };
})();
