/* =========================================================
   나라 경영 시뮬레이션 · engine.js
   게임 로직: 플레이어 생성, 점수, 턴 처리, 무역, 동맹, AI
   made by 박선생
========================================================= */

/* ─── 플레이어 생성 ──────────────────────────────── */
function mkPlayer(cfg) {
  var cl         = CLIMATES[cfg.climate];
  var base       = cl.base;
  var names      = COUNTRY_NAMES[cfg.climate];
  var country    = names[Math.floor(Math.random() * names.length)];
  var colors     = playerColors();
  var emojis     = playerEmojis();
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
    allies:     [],        /* [{partnerId, turnsLeft}] */
    tradeLog:   [],        /* 이번 턴 체결된 무역 내역 */
    action: { build: null, research: null, policy: null, diplo: null },
    scores: { econ:0, mil:0, sci:0, cult:0, pop:0, dip:0, total:0 }
  };
}

/* ─── 점수 계산 ──────────────────────────────────── */
function calcScore(p) {
  p.scores = calcScoreRaw(p);
  return p.scores;
}

function calcScoreRaw(p) {
  function bc(id) { return p.buildings.filter(function(b){ return b===id; }).length; }
  var econ  = Math.floor(p.resources.gold/2) + bc('market')*8 + bc('harbor')*10 + bc('foundry')*4 + bc('workshop')*2;
  var mil   = Math.floor(p.military * 2.5);
  var sci   = p.techs.length * 10 + Math.floor(p.resources.science/3);
  var cult  = Math.floor(p.resources.culture/2) + bc('temple')*8 + bc('theater')*15;
  var pop   = p.population * 6;
  var dip   = (p.dipBonus||0) + (p.allies ? p.allies.length * 5 : 0);
  return { econ:econ, mil:mil, sci:sci, cult:cult, pop:pop, dip:dip, total:econ+mil+sci+cult+pop+dip };
}

/* ─── 자원 획득 계산 ─────────────────────────────── */
function baseGain(p) {
  var b = CLIMATES[p.climate].base;
  return { food:b.food, production:b.production, gold:b.gold, science:b.science, culture:b.culture };
}

function bldGain(p) {
  var g = { food:0, production:0, gold:0, science:0, culture:0 };
  p.buildings.forEach(function(id) {
    var b = BUILDINGS.find(function(x){ return x.id===id; });
    if (b && b.perTurn) Object.keys(b.perTurn).forEach(function(r){ if(g[r]!==undefined) g[r]+=b.perTurn[r]; });
  });
  return g;
}

function techGain(p) {
  var g = { food:0, production:0, gold:0, science:0, culture:0 };
  p.techs.forEach(function(id) {
    var t = TECHS.find(function(x){ return x.id===id; });
    if (t && t.perTurn) Object.keys(t.perTurn).forEach(function(r){ if(g[r]!==undefined) g[r]+=t.perTurn[r]; });
  });
  return g;
}

function totalGain(p) {
  var bg=baseGain(p), blg=bldGain(p), tg=techGain(p);
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
  if (pol === 'economic')     g.gold       = Math.ceil(g.gold       * 1.6);
  if (pol === 'science')      g.science    = Math.ceil(g.science    * 1.6);
  if (pol === 'culture')      g.culture    = Math.ceil(g.culture    * 1.6);
  if (pol === 'agriculture')  g.food      += 5;
  if (pol === 'production')   g.production = Math.ceil(g.production * 1.6);
  return g;
}

/* ─── 무역 처리 ──────────────────────────────────── */
function processTrades() {
  var trades = G.pendingTrades || [];
  trades.forEach(function(trade) {
    if (trade.status !== 'accepted') return;
    var from = G.players.find(function(p){ return p.id===trade.fromId; });
    var to   = G.players.find(function(p){ return p.id===trade.toId; });
    if (!from || !to) return;
    /* 자원 충분한지 재확인 */
    if ((from.resources[trade.give.res] || 0) < trade.give.amt) return;
    if ((to.resources[trade.receive.res] || 0) < trade.receive.amt) return;
    /* 교환 */
    from.resources[trade.give.res]     -= trade.give.amt;
    from.resources[trade.receive.res]  += trade.receive.amt;
    to.resources[trade.receive.res]    -= trade.receive.amt;
    to.resources[trade.give.res]       += trade.give.amt;
    /* 외교 보너스 */
    from.dipBonus = (from.dipBonus||0) + 3;
    to.dipBonus   = (to.dipBonus||0)   + 3;
    /* 로그 */
    from.tradeLog = from.tradeLog || [];
    to.tradeLog   = to.tradeLog   || [];
    from.tradeLog.push({ with: to.name,   gave: trade.give,    received: trade.receive });
    to.tradeLog.push(  { with: from.name, gave: trade.receive, received: trade.give   });
  });
  G.pendingTrades = [];
}

/* ─── 동맹 처리 ──────────────────────────────────── */
function processAlliances() {
  /* 동맹 체결 (제안 수락된 것) */
  var proposed = G.pendingDiplo || [];
  proposed.forEach(function(d) {
    if (d.status !== 'accepted') return;
    var from = G.players.find(function(p){ return p.id===d.fromId; });
    var to   = G.players.find(function(p){ return p.id===d.toId; });
    if (!from || !to) return;

    if (d.type === 'alliance') {
      if ((from.resources.gold||0) < 5 || (to.resources.gold||0) < 5) return;
      from.resources.gold -= 5; to.resources.gold -= 5;
      from.allies = from.allies || [];
      to.allies   = to.allies   || [];
      /* 기존 동맹 갱신 또는 추가 */
      var fa = from.allies.find(function(a){ return a.partnerId===to.id; });
      var ta = to.allies.find(function(a){ return a.partnerId===from.id; });
      if (fa) fa.turnsLeft = 3; else from.allies.push({ partnerId:to.id, turnsLeft:3 });
      if (ta) ta.turnsLeft = 3; else to.allies.push({ partnerId:from.id, turnsLeft:3 });
      from.dipBonus = (from.dipBonus||0) + 10;
      to.dipBonus   = (to.dipBonus||0)   + 10;
    }
    if (d.type === 'mil_pact') {
      if ((from.resources.gold||0) < 5 || (to.resources.gold||0) < 5) return;
      from.resources.gold -= 5; to.resources.gold -= 5;
      from.military += 5; to.military += 5;
      from.dipBonus = (from.dipBonus||0) + 5;
      to.dipBonus   = (to.dipBonus||0)   + 5;
    }
  });
  G.pendingDiplo = [];

  /* 동맹 이벤트 공유 + 턴 감소 */
  G.players.forEach(function(p) {
    if (!p.allies) return;
    p.allies = p.allies.filter(function(a){ return a.turnsLeft > 0; });
    p.allies.forEach(function(a){ a.turnsLeft--; });
  });
}

/* ─── 턴 처리 ────────────────────────────────────── */
function processTurn() {
  /* 1. 무역·동맹 먼저 처리 */
  processTrades();
  processAlliances();

  var log = [];

  G.players.forEach(function(p) {
    p.tradeLog = [];
    var act  = p.action;
    var gain = totalGain(p);
    gain = applyPolicy(gain, act.policy);

    if (act.policy === 'military')    p.military += 4;
    if (act.policy === 'diplomacy_pol') p.dipBonus = (p.dipBonus||0) + 8;

    /* 자원 수령 */
    Object.keys(gain).forEach(function(r){ p.resources[r] = (p.resources[r]||0) + gain[r]; });

    /* 동맹국과 자원 일부 공유 */
    if (p.allies && p.allies.length > 0) {
      p.allies.forEach(function(a) {
        var ally = G.players.find(function(x){ return x.id===a.partnerId; });
        if (ally) { p.resources.gold += 1; p.resources.science += 1; }
      });
    }

    /* 건설 (일반 건물 + 기후 고유 건물 모두 처리) */
    if (act.build) {
      var allBuildings = BUILDINGS.concat(typeof UNIQUE_BUILDINGS !== 'undefined' ? UNIQUE_BUILDINGS : []);
      var bDef = allBuildings.find(function(x){ return x.id===act.build; });
      if (bDef) {
        /* 고유 건물 기후 제한 */
        var climateOk = !bDef.climate || bDef.climate === p.climate;
        /* 최대 개수 확인 */
        var bcount = p.buildings.filter(function(b){ return b===act.build; }).length;
        var maxOk  = bcount < (bDef.max || 1);
        /* 비용 확인 */
        var okB = climateOk && maxOk;
        Object.keys(bDef.cost||{}).forEach(function(r){ if((p.resources[r]||0)<bDef.cost[r]) okB=false; });
        if (okB) {
          Object.keys(bDef.cost||{}).forEach(function(r){ p.resources[r]-=bDef.cost[r]; });
          p.buildings.push(act.build);
          if (bDef.spec==='mil5')  p.military   += 5;
          if (bDef.spec==='mil12') p.military   += 12;
          if (bDef.spec==='mil3')  p.military   += 3;
          if (bDef.spec==='pop1')  p.population += 1;
          if (bDef.spec==='dip5')  p.dipBonus   = (p.dipBonus||0) + 5;
        }
      }
    }

    /* 연구 (전문 분야 25% 할인 적용) */
    if (act.research) {
      var tDef = TECHS.find(function(x){ return x.id===act.research; });
      if (tDef && p.techs.indexOf(act.research)===-1) {
        /* 선행 기술 확인 */
        var reqOk = !tDef.req || p.techs.indexOf(tDef.req) !== -1;
        if (reqOk) {
          /* 전문 분야(specialty) 할인: 기후의 특화 분야 기술은 25% 저렴 */
          var cl          = CLIMATES[p.climate];
          var isSpecialty = cl.specialty && tDef.branch === cl.specialty;
          var techCost    = {};
          Object.keys(tDef.cost||{}).forEach(function(r) {
            techCost[r] = isSpecialty ? Math.floor(tDef.cost[r] * 0.75) : tDef.cost[r];
          });
          var okT = true;
          Object.keys(techCost).forEach(function(r){ if((p.resources[r]||0)<techCost[r]) okT=false; });
          if (okT) {
            Object.keys(techCost).forEach(function(r){ p.resources[r]-=techCost[r]; });
            p.techs.push(act.research);
            if (tDef.spec==='mil6')  p.military   += 6;
            if (tDef.spec==='mil10') p.military   += 10;
            if (tDef.spec==='mil16') p.military   += 16;
            if (tDef.spec==='pop1')  p.population += 1;
            if (tDef.spec==='dip15') p.dipBonus = (p.dipBonus||0)+15;
            if (tDef.spec==='dip25') p.dipBonus = (p.dipBonus||0)+25;
            if (tDef.spec==='dip40') p.dipBonus = (p.dipBonus||0)+40;
          }
        }
      }
    }

    /* 인구 성장 */
    var surplus = p.resources.food - p.population*2;
    var grow = 0.18;
    if (p.buildings.indexOf('aqueduct')  !==-1) grow += 0.15;
    if (p.techs.indexOf('crop_rotation') !==-1) grow += 0.15;
    if (surplus > 5) grow += 0.2;
    if (Math.random() < grow && p.population < 20) p.population += 1;

    /* 식량 소비 */
    p.resources.food = Math.max(0, p.resources.food - Math.max(0, p.population-2));

    /* 랜덤 이벤트 */
    var ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
    var applyEv = true;
    if (G.diff==='easy' && ev.type==='bad'  && Math.random()<0.45) applyEv=false;
    if (G.diff==='hard' && ev.type==='good' && Math.random()<0.30) applyEv=false;

    var fxStr = applyEv ? ev.fx(p) : '';

    /* 동맹국에게 좋은 이벤트 공유 */
    if (applyEv && ev.type==='good' && p.allies && p.allies.length > 0) {
      p.allies.forEach(function(a) {
        var ally = G.players.find(function(x){ return x.id===a.partnerId; });
        if (ally && Math.random()<0.5) {
          /* 효과의 절반 공유 */
          ally.resources.food    += 1;
          ally.resources.gold    += 1;
          ally.resources.science += 1;
        }
      });
    }

    /* 자원 음수 방지 */
    Object.keys(p.resources).forEach(function(r){ p.resources[r]=Math.max(0,p.resources[r]); });

    log.push({
      pid:p.id, pname:p.name, country:p.country, climate:p.climate,
      ev: applyEv?ev:null, fx:fxStr, gain:gain
    });
    /* AI diplo 처리 */
    if (act.diplo && p.isAI) {
      makeDiplo(p.id, act.diplo.toId, act.diplo.type);
    }
    p.action = { build:null, research:null, policy:null, diplo:null };
  });

  G.players.forEach(function(p){ calcScore(p); });
  G.scoreHist.push(G.players.map(function(p){ return {id:p.id,name:p.name,total:p.scores.total}; }));
  G.turnLog = log;
}

/* ─── AI 결정 ────────────────────────────────────── */
function aiDecide(p) {
  var act = { build:null, research:null, policy:null, diplo:null };

  var climatePol = {
    tropical:'agriculture', arid:'economic', temperate:'production',
    cold:'science', monsoon:'agriculture', highland:'science'
  };
  act.policy = Math.random()<0.65 ? climatePol[p.climate] : POLICIES[Math.floor(Math.random()*POLICIES.length)].id;

  /* 건설: 가성비 최우선, 선행 기술 고려 */
  var bcount = {};
  p.buildings.forEach(function(b){ bcount[b]=(bcount[b]||0)+1; });
  var bestB=null, bestBS=-1;
  BUILDINGS.forEach(function(bDef) {
    if ((bcount[bDef.id]||0)>=bDef.max) return;
    if (bDef.req && p.buildings.indexOf(bDef.req)===-1) return;
    var ok=true;
    Object.keys(bDef.cost||{}).forEach(function(r){ if((p.resources[r]||0)<bDef.cost[r]) ok=false; });
    if (!ok) return;
    var sc=0;
    if (bDef.perTurn) Object.values(bDef.perTurn).forEach(function(v){ sc+=v; });
    if (bDef.spec) sc+=5;
    /* 기후별 보너스 */
    if (p.climate==='tropical' && bDef.cat==='food')      sc+=3;
    if (p.climate==='arid'     && bDef.cat==='commerce')  sc+=3;
    if (p.climate==='cold'     && bDef.cat==='science')   sc+=3;
    if (p.climate==='monsoon'  && bDef.cat==='food')      sc+=3;
    if (p.climate==='highland' && bDef.cat==='science')   sc+=2;
    if (sc>bestBS){ bestBS=sc; bestB=bDef.id; }
  });
  act.build = bestB;

  /* 연구: 분야 집중 전략 */
  var branchFocus = {
    tropical:'agriculture', arid:'commerce',  temperate:'industry',
    cold:'science',         monsoon:'culture', highland:'science'
  };
  var focus = branchFocus[p.climate];
  var bestT=null, bestTS=-1;
  TECHS.forEach(function(tDef) {
    if (p.techs.indexOf(tDef.id)!==-1) return;
    if (tDef.req && p.techs.indexOf(tDef.req)===-1) return;
    var ok=true;
    Object.keys(tDef.cost||{}).forEach(function(r){ if((p.resources[r]||0)<tDef.cost[r]) ok=false; });
    if (!ok) return;
    var sc=0;
    if (tDef.perTurn) Object.values(tDef.perTurn).forEach(function(v){ sc+=v; });
    if (tDef.spec) sc+=5;
    if (tDef.branch===focus) sc+=4;
    if (tDef.tier===2) sc+=1;
    if (tDef.tier===3) sc+=2;
    if (sc>bestTS){ bestTS=sc; bestT=tDef.id; }
  });
  act.research = bestT;

  /* AI 동맹 제안 (가끔) */
  if (Math.random()<0.15 && G.players.length>1) {
    var targets = G.players.filter(function(x){ return x.id!==p.id && !x.isAI; });
    if (targets.length>0 && (p.resources.gold||0)>=5) {
      var target = targets[Math.floor(Math.random()*targets.length)];
      act.diplo = { type:'alliance', toId:target.id };
    }
  }

  return act;
}

/* ─── 무역 제안 생성 ─────────────────────────────── */
function makeTrade(fromId, toId, giveRes, giveAmt, receiveRes, receiveAmt) {
  G.pendingTrades = G.pendingTrades || [];
  var id = Date.now() + '_' + fromId;
  G.pendingTrades.push({
    id:       id,
    fromId:   fromId,
    toId:     toId,
    give:     { res:giveRes,     amt:parseInt(giveAmt) },
    receive:  { res:receiveRes,  amt:parseInt(receiveAmt) },
    status:   'pending'
  });
  return id;
}

/* ─── 동맹 제안 생성 ─────────────────────────────── */
function makeDiplo(fromId, toId, type) {
  G.pendingDiplo = G.pendingDiplo || [];
  G.pendingDiplo.push({ id:Date.now()+'_d', fromId:fromId, toId:toId, type:type, status:'pending' });
}

/* ─── 무역/동맹 수락 ─────────────────────────────── */
function acceptTrade(id) {
  var t = (G.pendingTrades||[]).find(function(x){ return x.id===id; });
  if (t) { t.status = 'accepted'; render(); }
}
function acceptDiplo(id) {
  var d = (G.pendingDiplo||[]).find(function(x){ return x.id===id; });
  if (d) { d.status = 'accepted'; render(); }
}
function declineTrade(id) {
  G.pendingTrades = (G.pendingTrades||[]).filter(function(x){ return x.id!==id; });
  render();
}
function declineDiplo(id) {
  G.pendingDiplo = (G.pendingDiplo||[]).filter(function(x){ return x.id!==id; });
  render();
}
