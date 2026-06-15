/* Federleicht — Symptom-Check (stiller Burnout)
   Anonymer, gewichteter Selbsttest über vier Dimensionen.
   Kein Diagnose-Tool. */
(function () {
  var root = document.getElementById('scApp');
  if (!root) return;

  var SCALE = ['Nie', 'Manchmal', 'Oft', 'Fast immer'];

  var DIMS = [
    { key: 'Körper & Energie', items: [
      'Ich fühle mich erschöpft, selbst wenn ich ausgeschlafen habe.',
      'Ich habe körperliche Beschwerden (Kopf, Verspannungen, Infekte) ohne klare Ursache.',
      'Mir fehlt die Energie für Dinge, die mir früher leichtfielen.'
    ]},
    { key: 'Schlaf & Erholung', items: [
      'Ich schlafe schlecht ein oder wache nachts auf und grüble.',
      'Erholung wie Wochenende oder Urlaub hält nur kurz an.',
      'Ich komme innerlich kaum noch zur Ruhe.'
    ]},
    { key: 'Emotionen & Stimmung', items: [
      'Ich bin gereizt oder dünnhäutig schon bei Kleinigkeiten.',
      'Ich fühle mich innerlich leer, taub oder freudlos.',
      'Ich habe das Gefühl, nur noch zu funktionieren.'
    ]},
    { key: 'Denken & Verhalten', items: [
      'Ich kann mich schlecht konzentrieren oder vergesse Dinge.',
      'Ich kann schlecht „Nein" sagen und stelle meine Bedürfnisse hinten an.',
      'Ich ziehe mich von Menschen oder Hobbys zurück.'
    ]}
  ];

  var TOTAL_Q = DIMS.reduce(function (n, d) { return n + d.items.length; }, 0);
  var MAX = TOTAL_Q * 3;
  var answers = {}; // qid -> 0..3

  var BANDS = [
    { cls: 'b1', max: 8,  label: 'Stabil', title: 'Du stehst gut da — bleib achtsam.',
      desc: 'Deine Antworten zeigen aktuell kaum Warnsignale. Wunderbar. Achte weiter auf deine Energie und gönn dir bewusst Pausen, damit das so bleibt.' },
    { cls: 'b2', max: 17, label: 'Frühe Signale', title: 'Erste Anzeichen sind erkennbar.',
      desc: 'Dein Körper sendet leise Signale. Das ist ein gutes Zeichen — denn jetzt gegenzusteuern ist deutlich leichter, als wenn die Erschöpfung tiefer wird.' },
    { cls: 'b3', max: 26, label: 'Deutliche Belastung', title: 'Deine Belastung ist deutlich spürbar.',
      desc: 'Mehrere Bereiche zeigen klare Warnsignale. Dein Körper und deine Seele bitten dich um eine Veränderung. Es lohnt sich, das ernst zu nehmen — du musst da nicht allein durch.' },
    { cls: 'b4', max: 36, label: 'Akute Erschöpfung', title: 'Vieles deutet auf eine akute Erschöpfung hin.',
      desc: 'Deine Antworten sprechen eine sehr klare Sprache. Kein Grund zur Panik — aber ein klarer Grund, dir jetzt Unterstützung zu holen. Der erste Schritt darf federleicht sein.' }
  ];

  /* ---- render questions ---- */
  var html = '';
  var qi = 0;
  DIMS.forEach(function (dim, di) {
    html += '<div class="sc-cat">' + dim.key + '</div>';
    dim.items.forEach(function (text, ii) {
      var id = 'q' + di + '_' + ii;
      html += '<div class="sc-q" data-q="' + id + '" data-dim="' + di + '">' +
              '<div class="q-text"><span class="qn">' + String(++qi).padStart(2, '0') + '</span>' + text + '</div>' +
              '<div class="sc-opts" role="group" aria-label="' + text.replace(/"/g, '') + '">';
      SCALE.forEach(function (lbl, v) {
        html += '<button type="button" class="sc-opt" data-v="' + v + '">' + lbl + '</button>';
      });
      html += '</div></div>';
    });
  });
  html +=
    '<div class="sc-actions">' +
      '<button type="button" class="btn btn-gold" id="scEval" disabled><span>Ergebnis anzeigen</span> <i data-lucide="sparkles"></i></button>' +
      '<span class="sc-hint" id="scHint">Beantworte alle ' + TOTAL_Q + ' Aussagen, um dein Ergebnis zu sehen.</span>' +
    '</div>' +
    '<div class="sc-result" id="scResult" tabindex="-1"></div>';
  root.innerHTML = html;

  var fill = document.getElementById('scFill');
  var pct = document.getElementById('scPct');
  var evalBtn = document.getElementById('scEval');
  var hint = document.getElementById('scHint');
  var resultBox = document.getElementById('scResult');

  if (window.lucide) lucide.createIcons();

  /* ---- interaction ---- */
  root.querySelectorAll('.sc-q').forEach(function (q) {
    q.querySelectorAll('.sc-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        q.querySelectorAll('.sc-opt').forEach(function (o) { o.classList.remove('sel'); o.setAttribute('aria-pressed', 'false'); });
        opt.classList.add('sel'); opt.setAttribute('aria-pressed', 'true');
        q.classList.add('answered');
        answers[q.dataset.q] = parseInt(opt.dataset.v, 10);
        updateProgress();
      });
    });
  });

  function answeredCount() { return Object.keys(answers).length; }

  function updateProgress() {
    var c = answeredCount();
    var p = Math.round((c / TOTAL_Q) * 100);
    if (fill) fill.style.width = p + '%';
    if (pct) pct.innerHTML = '<b>' + c + '</b> / ' + TOTAL_Q + ' beantwortet';
    var done = c === TOTAL_Q;
    evalBtn.disabled = !done;
    hint.textContent = done ? 'Alles beantwortet — zeig mir mein Ergebnis.' : 'Beantworte alle ' + TOTAL_Q + ' Aussagen, um dein Ergebnis zu sehen.';
  }

  evalBtn.addEventListener('click', renderResult);

  function renderResult() {
    var total = 0, dimScores = DIMS.map(function () { return 0; });
    DIMS.forEach(function (dim, di) {
      dim.items.forEach(function (_, ii) {
        var v = answers['q' + di + '_' + ii] || 0; total += v; dimScores[di] += v;
      });
    });
    var band = BANDS.find(function (b) { return total <= b.max; }) || BANDS[BANDS.length - 1];
    var maxDimIdx = dimScores.indexOf(Math.max.apply(null, dimScores));
    var indPct = Math.min(100, Math.round((total / MAX) * 100));

    var dimsHtml = DIMS.map(function (dim, di) {
      var w = Math.round((dimScores[di] / 9) * 100);
      var strong = di === maxDimIdx ? ' <b>(am stärksten)</b>' : '';
      return '<div class="sc-dim"><div class="dim-top"><span>' + dim.key + strong + '</span><span>' + dimScores[di] + '/9</span></div>' +
             '<div class="dim-track"><div class="dim-fill" data-w="' + w + '"></div></div></div>';
    }).join('');

    var crisis = (band.cls === 'b4' || band.cls === 'b3')
      ? '<div class="sc-crisis"><strong>Wenn es dir akut sehr schlecht geht:</strong> Die Telefonseelsorge ist rund um die Uhr kostenlos und anonym erreichbar unter <strong>0800 111 0 111</strong>. Bei einer ärztlichen Notlage wähle die <strong>112</strong>.</div>'
      : '';

    resultBox.innerHTML =
      '<div class="sc-score-card">' +
        '<span class="sc-band ' + band.cls + '">' + band.label + '</span>' +
        '<div class="sc-score-num">' + total + '<span> / ' + MAX + ' Punkten</span></div>' +
        '<div class="sc-meter"><div class="ind" id="scInd"></div></div>' +
        '<h3>' + band.title + '</h3>' +
        '<p class="desc">' + band.desc + '</p>' +
        '<div class="sc-dims">' + dimsHtml + '</div>' +
        '<a href="kontakt.html" class="btn btn-gold" style="width:100%;justify-content:center"><span>Kostenloses Erstgespräch anfragen</span> <i data-lucide="arrow-right"></i></a>' +
        crisis +
        '<div style="text-align:center"><button type="button" class="sc-retake" id="scRetake">Test zurücksetzen</button></div>' +
      '</div>' +
      '<p class="sc-disclaimer">Dieser Selbsttest dient der Orientierung und ist <strong>keine medizinische Diagnose</strong>. Er ersetzt keine ärztliche oder psychotherapeutische Abklärung.</p>';

    resultBox.classList.add('show');
    if (window.lucide) lucide.createIcons();

    requestAnimationFrame(function () {
      var ind = document.getElementById('scInd');
      if (ind) ind.style.left = indPct + '%';
      resultBox.querySelectorAll('.dim-fill').forEach(function (f) { f.style.width = f.dataset.w + '%'; });
    });
    setTimeout(function () {
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    document.getElementById('scRetake').addEventListener('click', function () {
      answers = {};
      root.querySelectorAll('.sc-opt').forEach(function (o) { o.classList.remove('sel'); });
      root.querySelectorAll('.sc-q').forEach(function (q) { q.classList.remove('answered'); });
      resultBox.classList.remove('show'); resultBox.innerHTML = '';
      updateProgress();
      window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    });
  }

  updateProgress();
})();
