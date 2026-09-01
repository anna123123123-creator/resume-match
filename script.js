(function () {
  'use strict';

  var EXAMPLE_JD = [
    '岗位职责：负责产品的市场调研与竞品分析，制定产品路线图，跟进项目排期与验收。',
    '任职要求：3年以上产品经理经验，熟悉数据分析，会使用 SQL 和 Excel，具备良好的沟通协调能力，有 To B 产品经验优先，英语可作为工作语言。',
  ].join('\n');

  var EXAMPLE_RESUME = [
    '5年产品经理工作经验，主导过3款 To B SaaS 产品从0到1的搭建。',
    '擅长市场调研、竞品分析和需求梳理，日常使用 SQL 做数据分析支撑决策。',
    '带领过8人跨部门团队，沟通协调能力强，通过英语六级。',
  ].join('\n');

  var jdInput = document.getElementById('jdInput');
  var resumeInput = document.getElementById('resumeInput');
  var scoreNum = document.getElementById('scoreNum');
  var matchedList = document.getElementById('matchedList');
  var missingList = document.getElementById('missingList');

  var STOPWORDS = ['的', '了', '和', '与', '及', '等', '有', '为', '在', '是', '并', '或', '之', '将', '对', '可', '需'];

  function tokenize(text) {
    var tokens = [];
    var words = text.match(/[a-zA-Z][a-zA-Z0-9+#.]*/g);
    if (words) tokens = tokens.concat(words.map(function (w) { return w.toLowerCase(); }));
    var cjkRuns = text.match(/[一-鿿]+/g);
    if (cjkRuns) {
      cjkRuns.forEach(function (run) {
        var cleaned = run;
        STOPWORDS.forEach(function (w) { cleaned = cleaned.split(w).join(''); });
        if (cleaned.length === 1) {
          tokens.push(cleaned);
        } else {
          for (var i = 0; i < cleaned.length - 1; i++) tokens.push(cleaned.slice(i, i + 2));
        }
      });
    }
    return tokens;
  }

  function extractFragments(jd) {
    return jd.split(/[，。！？；：\n\r\t,.;:!?、]+/)
      .map(function (f) { return f.trim(); })
      .filter(function (f) { return f.length >= 2 && f.length <= 24; });
  }

  function overlapRatio(fragment, resumeTokenSet) {
    var fragTokens = new Set(tokenize(fragment));
    if (!fragTokens.size) return 0;
    var hit = 0;
    fragTokens.forEach(function (t) { if (resumeTokenSet.has(t)) hit++; });
    return hit / fragTokens.size;
  }

  function makeTag(text, matched) {
    var span = document.createElement('span');
    span.className = 'kw-tag ' + (matched ? 'matched' : 'missing');
    span.textContent = text;
    return span;
  }

  function run() {
    var jd = jdInput.value;
    var resume = resumeInput.value;
    var fragments = extractFragments(jd);
    var uniqueFragments = Array.from(new Set(fragments));

    matchedList.innerHTML = '';
    missingList.innerHTML = '';

    if (!uniqueFragments.length || !resume.trim()) {
      scoreNum.textContent = '--';
      return;
    }

    var resumeTokenSet = new Set(tokenize(resume));
    var matchedCount = 0;

    uniqueFragments.forEach(function (frag) {
      var ratio = overlapRatio(frag, resumeTokenSet);
      var isMatch = ratio >= 0.5;
      if (isMatch) matchedCount++;
      (isMatch ? matchedList : missingList).appendChild(makeTag(frag, isMatch));
    });

    var score = Math.round((matchedCount / uniqueFragments.length) * 100);
    scoreNum.textContent = score + '%';

    if (!matchedList.children.length) matchedList.innerHTML = '<span style="color:var(--muted);font-size:12.5px">暂无</span>';
    if (!missingList.children.length) missingList.innerHTML = '<span style="color:var(--muted);font-size:12.5px">全部覆盖，很棒！</span>';
  }

  document.getElementById('btnRun').addEventListener('click', run);
  document.getElementById('btnExample').addEventListener('click', function () {
    jdInput.value = EXAMPLE_JD;
    resumeInput.value = EXAMPLE_RESUME;
    run();
  });

  jdInput.value = EXAMPLE_JD;
  resumeInput.value = EXAMPLE_RESUME;
  run();
})();
