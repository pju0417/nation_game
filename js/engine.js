/* =========================================================
   나라 경영 시뮬레이션 · engine.js
   게임 로직: 플레이어 생성, 점수 계산, 턴 처리, AI
   made by 박선생
========================================================= */

/* ─── 플레이어 생성 ──────────────────────────────── */
function mkPlayer(cfg) {
  var cl = CLIMATES[cfg.climate];
  var base = cl.base;
  var names = COUNTRY_NAMES[cfg.climate];
  var country = names[Math.floor(Math.random() * names.length)];
  var colors = playerColors();
  var emojis = playerEmojis();

  var startBonus = G.diff === 'easy' ? 6 : G.diff === 'hard' ? -3 : 0;

  return {
    id:       cfg.id,
    name:     cfg.name,
    country:  country,
    climate:  cfg.climate,
    isAI:     cfg.isAI,
    color:    colors[cfg.id % colors.length],
    emoji:    emojis[cfg.id % emojis.length],
    resources: {
      food:       base.food       * 2 + 6 + startBonus,
      production: base.production * 2 + 5 + startBonus,
      gold:       base.gold       * 2 + 5 + startBonus,
      science:    base.science    * 2     + startBonus,
      culture:    base.culture    * 2     + startBonus
    },
    population: 3,
    buildings:  [],
    techs:      [],
    military:   5,
    dipBonus:   0,
    action: { build:null, research:null, policy:null },
    scores: { econ:0, mil:0, sci:0, cult:0, pop:0, dip:0, total:0 }
  };
}

/* ─── 국력 점수 계산 ─────────────────────────────── */
function calcScore(p) {
  function bc(id) { return p.buildings.filter(function(b){ return b === id; }).length; }

  var econ  = Math.floor(p.resources.gold / 2) + bc('market')*8 + bc('mine')*5 + bc('harbor')*6 + bc('workshop')*2;
  var mil   = Math.floor(p.military * 2.5);
  var sci   = p.techs.length * 12 + Math.floor(p.resources.science / 3);
  var cult  = Math.floor(p.resources.culture / 2) + bc('temple')*8 + bc('theater')*14;
  var pop   = p.population * 6;
  var dip   = p.dipBonus || 0;
  var total = econ + mil + sci + cult + pop + dip;

  p.scores = { econ:econ, mil:mil, sci:sci, cult:cult, pop:pop, dip:dip, total:total };
  return p.scores;
}

/* ─── 자원 획득 계산 ─────────────────────────────── */
function baseGain(p) {
  var b = CLIMATES[p.climate].base;
  return { food:b.food, production:b.production, gold:b.gold, science:b.science, culture:b.culture };
}

function bldGain(p) {
  var g = { food:0, production:0, gold:0, science:0, culture:0 };
  p.buildings.forEach(function(id) {
    var bDef = BUILDINGS.find(function(x){ return x.id === id; });
    if (bDef && bDef.perTurn) {
      Object.keys(bDef.perTurn).forEach(function(r) {
        if (g[r] !== undefined) g[r] += bDef.perTurn[r];
      });
    }
  });
  return g;
}

function techGain(p) {
  var g = { food:0, production:0, gold:0, science:0, culture:0 };
  p.techs.forEach(function(id) {
    var tDef = TECHS.find(function(x){ return x.id === id; });
    if (tDef && tDef.perTurn) {
      Object.keys(tDef.perTurn).forEach(function(r) {
        if (g[r] !== undefined) g[r] += tDef.perTurn[r];
      });
    }
  });
  return g;
}

function totalGain(p) {
  var bg  = baseGain(p);
  var blg = bldGain(p);
  var tg  = techGain(p);
  return {
    food:       bg.food       + blg.food       + tg.food,
    production: bg.production + blg.production + tg.production,
    gold:       bg.gold       + blg.gold       + tg.gold,
    science:    bg.science    + blg.science    + tg.science,
    culture:    bg.culture    + blg.culture    + tg.culture
  };
}

function applyPolicy(gain, pol) {
  var g = Object.assign({}, gain);
  if (!pol) return g;
  if (pol === 'economic')    g.gold       = Math.ceil(g.gold       * 1.6);
  if (pol === 'science')     g.science    = Math.ceil(g.science    * 1.6);
  if (pol === 'culture')     g.culture    = Math.ceil(g.culture    * 1.6);
  if (pol === 'agriculture') g.food      += 5;
  if (pol === 'production')  g.production = Math.ceil(g.production * 1.6);
  return g;
}

/* ─── 턴 처리 ────────────────────────────────────── */
function processTurn() {
  var log = [];

  G.players.forEach(function(p) {
    var act  = p.action;
    var gain = totalGain(p);
    gain = applyPolicy(gain, act.policy);

    if (act.policy === 'military') p.military += 4;

    /* 자원 수령 */
    Object.keys(gain).forEach(function(r) {
      p.resources[r] = (p.resources[r] || 0) + gain[r];
    });

    /* 건설 */
    if (act.build) {
      var bDef = BUILDINGS.find(function(x){ return x.id === act.build; });
      if (bDef) {
        var canBuild = true;
        Object.keys(bDef.cost || {}).forEach(function(r) {
          if ((p.resources[r] || 0) < bDef.cost[r]) canBuild = false;
        });
        if (canBuild) {
          Object.keys(bDef.cost || {}).forEach(function(r) {
            p.resources[r] -= bDef.cost[r];
          });
          p.buildings.push(act.build);
          if (bDef.spec === 'mil5')  p.military += 5;
          if (bDef.spec === 'mil10') p.military += 10;
          if (bDef.spec === 'pop')   p.population += 1;
        }
      }
    }

    /* 연구 */
    if (act.research) {
      var tDef = TECHS.find(function(x){ return x.id === act.research; });
      if (tDef && !p.techs.includes(act.research)) {
        var canResearch = true;
        Object.keys(tDef.cost || {}).forEach(function(r) {
          if ((p.resources[r] || 0) < tDef.cost[r]) canResearch = false;
        });
        if (canResearch) {
          Object.keys(tDef.cost || {}).forEach(function(r) {
            p.resources[r] -= tDef.cost[r];
          });
          p.techs.push(act.research);
          if (tDef.spec === 'mil8')  p.military += 8;
          if (tDef.spec === 'pop1')  p.population += 1;
          if (tDef.spec === 'dip15') p.dipBonus = (p.dipBonus || 0) + 15;
        }
      }
    }

    /* 인구 성장 */
    var surplus = p.resources.food - p.population * 2;
    var growChance = 0.18;
    if (p.buildings.includes('granary')) growChance += 0.15;
    if (p.techs.includes('medicine'))    growChance += 0.15;
    if (surplus > 5)                     growChance += 0.2;
    if (Math.random() < growChance && p.population < 20) p.population += 1;

    /* 식량 소비 */
    p.resources.food = Math.max(0, p.resources.food - Math.max(0, p.population - 2));

    /* 랜덤 이벤트 */
    var evIdx = Math.floor(Math.random() * EVENTS.length);
    var ev = EVENTS[evIdx];
    var applyEv = true;
    if (G.diff === 'easy' && ev.type === 'bad'  && Math.random() < 0.45) applyEv = false;
    if (G.diff === 'hard' && ev.type === 'good' && Math.random() < 0.30) applyEv = false;

    var fxStr = '';
    if (applyEv) fxStr = ev.fx(p);

    /* 자원 음수 방지 */
    Object.keys(p.resources).forEach(function(r) {
      p.resources[r] = Math.max(0, p.resources[r]);
    });

    log.push({
      pid:     p.id,
      pname:   p.name,
      country: p.country,
      climate: p.climate,
      ev:      applyEv ? ev : null,
      fx:      fxStr,
      gain:    gain
    });

    /* 행동 초기화 */
    p.action = { build:null, research:null, policy:null };
  });

  /* 점수 재계산 */
  G.players.forEach(function(p) { calcScore(p); });

  /* 점수 이력 저장 */
  G.scoreHist.push(G.players.map(function(p) {
    return { id:p.id, name:p.name, total:p.scores.total };
  }));

  G.turnLog = log;
}

/* ─── AI 결정 ────────────────────────────────────── */
function aiDecide(p) {
  var act = { build:null, research:null, policy:null };

  /* 정책 선택 */
  var climatePol = {
    tropical:'agriculture', arid:'economic',
    temperate:'production', cold:'science',
    monsoon:'agriculture', highland:'science'
  };
  act.policy = Math.random() < 0.65
    ? climatePol[p.climate]
    : POLICIES[Math.floor(Math.random() * POLICIES.length)].id;

  /* 건설 선택 */
  var bcount = {};
  p.buildings.forEach(function(b) { bcount[b] = (bcount[b] || 0) + 1; });

  var bestB = null, bestBS = -1;
  BUILDINGS.forEach(function(bDef) {
    if ((bcount[bDef.id] || 0) >= bDef.max) return;
    if (bDef.req && !p.buildings.includes(bDef.req)) return;
    var ok = true;
    Object.keys(bDef.cost || {}).forEach(function(r) {
      if ((p.resources[r] || 0) < bDef.cost[r]) ok = false;
    });
    if (!ok) return;

    var sc = 0;
    if (bDef.perTurn) Object.values(bDef.perTurn).forEach(function(v) { sc += v; });
    if (bDef.spec)    sc += 4;
    if (p.climate === 'tropical'  && bDef.id === 'farm')    sc += 3;
    if (p.climate === 'arid'      && bDef.id === 'market')  sc += 3;
    if (p.climate === 'cold'      && bDef.cat === 'science') sc += 3;
    if (p.climate === 'monsoon'   && bDef.id === 'farm')    sc += 3;
    if (p.climate === 'highland'  && bDef.cat === 'science') sc += 2;

    if (sc > bestBS) { bestBS = sc; bestB = bDef.id; }
  });
  act.build = bestB;

  /* 연구 선택 */
  var bestT = null, bestTS = -1;
  TECHS.forEach(function(tDef) {
    if (p.techs.includes(tDef.id)) return;
    var ok = true;
    Object.keys(tDef.cost || {}).forEach(function(r) {
      if ((p.resources[r] || 0) < tDef.cost[r]) ok = false;
    });
    if (!ok) return;

    var sc = 0;
    if (tDef.perTurn) Object.values(tDef.perTurn).forEach(function(v) { sc += v; });
    if (tDef.spec)    sc += 6;
    if (p.climate === 'cold'    && tDef.id === 'astronomy')   sc += 4;
    if (p.climate === 'tropical'&& tDef.id === 'adv_farming') sc += 3;
    if (p.climate === 'arid'    && tDef.id === 'trade_routes') sc += 4;

    if (sc > bestTS) { bestTS = sc; bestT = tDef.id; }
  });
  act.research = bestT;

  return act;
}
