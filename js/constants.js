/* =========================================================
   나라 경영 시뮬레이션 · constants.js
   made by 박선생
========================================================= */

/* ─── 기후 ───────────────────────────────────────── */
var CLIMATES = {
  tropical: {
  id:'tropical', name:'열대', emoji:'🌴', color:'#50d878',
  bg:'linear-gradient(135deg,#0d2e14,#060f08)',
  desc:'풍부한 강수량과 생물 다양성으로 식량과 인구 성장이 빠른 열대우림 기후.',
  geo:'동남아시아 · 아프리카 중부 · 아마존',
  base:{ food:4, production:2, gold:2, science:1, culture:2 },
  perk:'🌾 식량 탁월 · 인구 성장 유리',
  weakness:'🔬 과학 발전은 다소 느림',
  specialty:'agriculture',
  mapX:580, mapY:330
},
  arid: {
    id:'arid', name:'건조', emoji:'🏜️', color:'#d4a845',
    bg:'linear-gradient(135deg,#2e1e08,#100a02)',
    desc:'강수량이 적어 사막이 발달한 건조 기후.',
    geo:'북아프리카 · 중동 · 중앙아시아',
    base:{ food:1, production:2, gold:4, science:2, culture:1 },
    perk:'💰 금화 풍부', weakness:'🌾 식량 부족', specialty:'commerce',
    mapX:370, mapY:260
  },
  temperate: {
    id:'temperate', name:'온대', emoji:'🌿', color:'#60c868',
    bg:'linear-gradient(135deg,#0e2216,#050e09)',
    desc:'사계절이 뚜렷하고 균형 잡힌 온대 기후.',
    geo:'서유럽 · 동아시아 · 북아메리카',
    base:{ food:2, production:2, gold:2, science:2, culture:2 },
    perk:'⚖️ 균형', weakness:'✨ 특별 보너스 없음', specialty:'industry',
    mapX:175, mapY:220
  },
  cold: {
    id:'cold', name:'냉대', emoji:'🌲', color:'#6aacdc',
    bg:'linear-gradient(135deg,#0a1826,#040810)',
    desc:'겨울이 길고 혹독한 냉대 기후.',
    geo:'러시아 · 캐나다 · 북유럽',
    base:{ food:1, production:3, gold:1, science:3, culture:1 },
    perk:'🔬 과학·생산 강함', weakness:'🌾 식량·금화 부족', specialty:'science',
    mapX:175, mapY:100
  },
  monsoon: {
    id:'monsoon', name:'계절풍', emoji:'🌾', color:'#98cc50',
    bg:'linear-gradient(135deg,#162210,#080e06)',
    desc:'여름철 집중 강수로 벼농사가 발달한 기후.',
    geo:'한국 · 중국 · 일본 · 인도',
    base:{ food:3, production:2, gold:2, science:1, culture:3 },
    perk:'🌾 식량·문화 강함', weakness:'🌪️ 태풍·홍수 위험', specialty:'culture',
    mapX:560, mapY:205
  },
  highland: {
    id:'highland', name:'고산', emoji:'⛰️', color:'#b0b0d8',
    bg:'linear-gradient(135deg,#16162a,#080810)',
    desc:'높은 고도의 서늘한 고산 기후.',
    geo:'안데스 · 히말라야 · 티베트',
    base:{ food:1, production:2, gold:3, science:3, culture:2 },
    perk:'🔭 과학·금화 강함', weakness:'🌾 식량 제한', specialty:'military',
    mapX:490, mapY:105
  }
};

var COUNTRY_NAMES = {
  tropical:  ['야자 왕국','정글 제국','에메랄드 연방','열대 문명'],
  arid:      ['사막 제국','황금 왕국','오아시스 연방','사하라 문명'],
  temperate: ['초원 연방','사계 왕국','녹원 제국','평야 문명'],
  cold:      ['설원 왕국','빙하 제국','침엽 연방','극지 공화국'],
  monsoon:   ['계절 왕국','논밭 제국','계절풍 연방','동아시아 문명'],
  highland:  ['봉우리 왕국','운무 제국','고원 연방','천산 문명']
};

/* ─── 기술 분야 ──────────────────────────────────── */
var TECH_BRANCHES = {
  agriculture: { name:'농업',   emoji:'🌾', color:'#60d060' },
  industry:    { name:'산업',   emoji:'⚙️', color:'#80a8c8' },
  commerce:    { name:'상업',   emoji:'💰', color:'#f0c040' },
  science:     { name:'과학',   emoji:'🔬', color:'#50a8e8' },
  culture:     { name:'문화',   emoji:'🎨', color:'#b050e8' },
  military:    { name:'군사',   emoji:'⚔️', color:'#e05050' },
  diplomacy:   { name:'외교',   emoji:'🤝', color:'#50d0c0' }
};

/*
  기술 트리: 7개 분야 x 3단계 = 21개 기술
  20턴 기준 최대 5~7개 연구 가능 → 전략적 선택 필수
  Tier 비용: T1=8, T2=18(선행기술 필요), T3=30(T2 완료 필요)
*/
var TECHS = [
  /* 농업 분야 */
  { id:'irrigation',   name:'관개시설',  emoji:'💧', branch:'agriculture', tier:1, cost:{science:8},  perTurn:{food:2},            desc:'식량 +2/턴' },
  { id:'crop_rotation',name:'윤작법',    emoji:'🌱', branch:'agriculture', tier:2, cost:{science:18}, perTurn:{food:3}, spec:'pop1', desc:'식량 +3/턴, 인구 성장', req:'irrigation' },
  { id:'modern_farm',  name:'근대 농업', emoji:'🚜', branch:'agriculture', tier:3, cost:{science:30}, perTurn:{food:5},            desc:'식량 +5/턴', req:'crop_rotation' },
  /* 산업 분야 */
  { id:'smelting',     name:'제련술',    emoji:'🔩', branch:'industry',    tier:1, cost:{science:8},  perTurn:{production:2},      desc:'생산력 +2/턴' },
  { id:'engineering',  name:'건축공학',  emoji:'🏗️', branch:'industry',    tier:2, cost:{science:18}, perTurn:{production:3},      desc:'생산력 +3/턴', req:'smelting' },
  { id:'industrialization', name:'산업화', emoji:'🏭', branch:'industry', tier:3, cost:{science:30}, perTurn:{production:5},      desc:'생산력 +5/턴', req:'engineering' },
  /* 상업 분야 */
  { id:'trade_routes', name:'교역로',    emoji:'🚢', branch:'commerce',    tier:1, cost:{science:8},  perTurn:{gold:2},            desc:'금화 +2/턴' },
  { id:'currency',     name:'화폐제도',  emoji:'🪙', branch:'commerce',    tier:2, cost:{science:18}, perTurn:{gold:3},            desc:'금화 +3/턴', req:'trade_routes' },
  { id:'market_economy',name:'시장경제', emoji:'💹', branch:'commerce',    tier:3, cost:{science:30}, perTurn:{gold:5},            desc:'금화 +5/턴', req:'currency' },
  /* 과학 분야 */
  { id:'writing',      name:'문자와 기록',emoji:'📜', branch:'science',    tier:1, cost:{science:8},  perTurn:{science:2},         desc:'과학 +2/턴' },
  { id:'philosophy',   name:'철학',      emoji:'📖', branch:'science',     tier:2, cost:{science:18}, perTurn:{science:3},         desc:'과학 +3/턴', req:'writing' },
  { id:'sci_revolution',name:'과학혁명', emoji:'🔭', branch:'science',     tier:3, cost:{science:30}, perTurn:{science:5},         desc:'과학 +5/턴', req:'philosophy' },
  /* 문화 분야 */
  { id:'arts',         name:'예술',      emoji:'🎨', branch:'culture',     tier:1, cost:{science:8},  perTurn:{culture:2},         desc:'문화 +2/턴' },
  { id:'literature',   name:'문학',      emoji:'📚', branch:'culture',     tier:2, cost:{science:18}, perTurn:{culture:3},         desc:'문화 +3/턴', req:'arts' },
  { id:'renaissance',  name:'문화 황금기',emoji:'🎭', branch:'culture',   tier:3, cost:{science:30}, perTurn:{culture:5},         desc:'문화 +5/턴', req:'literature' },
  /* 군사 분야 */
  { id:'weapons',      name:'무기 제조', emoji:'⚔️', branch:'military',    tier:1, cost:{science:8},  spec:'mil6',                 desc:'군사력 +6' },
  { id:'tactics',      name:'군사 전술', emoji:'🗡️', branch:'military',    tier:2, cost:{science:18}, spec:'mil10',                desc:'군사력 +10', req:'weapons' },
  { id:'grand_strategy',name:'대전략',  emoji:'🏴', branch:'military',    tier:3, cost:{science:30}, spec:'mil16',                desc:'군사력 +16', req:'tactics' },
  /* 외교 분야 */
  { id:'diplomacy_basic',name:'외교술', emoji:'🤝', branch:'diplomacy',   tier:1, cost:{science:8},  spec:'dip15',                desc:'외교 +15점' },
  { id:'alliances',    name:'동맹 조약', emoji:'🕊️', branch:'diplomacy',   tier:2, cost:{science:18}, spec:'dip25',                desc:'외교 +25점', req:'diplomacy_basic' },
  { id:'world_order',  name:'세계 질서',emoji:'🌐', branch:'diplomacy',   tier:3, cost:{science:30}, spec:'dip40',                desc:'외교 +40점', req:'alliances' }
];

/*
  건물: 12개 (T1 6개 + T2 6개), 20턴에 최대 8개 건설 가능
  T2는 T1 선행 + 추가 자원 비용 → 전략 선택 필요
*/
var BUILDINGS = [
  /* 식량 */
  { id:'farm',       name:'농장',     emoji:'🌾', cat:'food',       tier:1, cost:{production:6},          perTurn:{food:2},            desc:'식량 +2/턴', max:2 },
  { id:'aqueduct',   name:'관개수로', emoji:'💧', cat:'food',       tier:2, cost:{production:12,gold:5},   perTurn:{food:3}, spec:'pop1',desc:'식량 +3/턴·인구+1', req:'farm', max:1 },
  /* 생산력 */
  { id:'workshop',   name:'작업장',   emoji:'🔧', cat:'production', tier:1, cost:{production:5},           perTurn:{production:2},      desc:'생산력 +2/턴', max:2 },
  { id:'foundry',    name:'제철소',   emoji:'🏭', cat:'production', tier:2, cost:{production:13,gold:6},   perTurn:{production:4},      desc:'생산력 +4/턴', req:'workshop', max:1 },
  /* 금화 */
  { id:'market',     name:'시장',     emoji:'🏪', cat:'commerce',   tier:1, cost:{production:6,gold:2},    perTurn:{gold:3},            desc:'금화 +3/턴', max:1 },
  { id:'harbor',     name:'항구',     emoji:'⚓', cat:'commerce',   tier:2, cost:{production:12,gold:6},   perTurn:{gold:4,food:1},     desc:'금화 +4·식량 +1/턴', req:'market', max:1 },
  /* 과학 */
  { id:'library',    name:'도서관',   emoji:'📚', cat:'science',    tier:1, cost:{production:6,gold:2},    perTurn:{science:2},         desc:'과학 +2/턴', max:1 },
  { id:'university', name:'대학교',   emoji:'🎓', cat:'science',    tier:2, cost:{production:13,gold:7},   perTurn:{science:4,culture:1},desc:'과학 +4·문화 +1/턴', req:'library', max:1 },
  /* 문화 */
  { id:'temple',     name:'사원',     emoji:'🏛️', cat:'culture',    tier:1, cost:{production:5,gold:1},    perTurn:{culture:2},         desc:'문화 +2/턴', max:2 },
  { id:'theater',    name:'극장',     emoji:'🎭', cat:'culture',    tier:2, cost:{production:11,gold:5},   perTurn:{culture:4},         desc:'문화 +4/턴', req:'temple', max:1 },
  /* 군사 */
  { id:'barracks',   name:'군영',     emoji:'⚔️', cat:'military',   tier:1, cost:{production:7,gold:2},    spec:'mil5',                 desc:'군사력 +5', max:2 },
  { id:'fortress',   name:'요새',     emoji:'🏰', cat:'military',   tier:2, cost:{production:14,gold:7},   spec:'mil12',                desc:'군사력 +12', req:'barracks', max:1 }
];


/* ─── 기후별 고유 건물 (해당 기후 플레이어만 건설 가능) ─ */
/*
  특화 전략의 핵심: 고유 건물은 해당 기후에서만 지을 수 있습니다.
  생산력 비용이 낮은 대신 효과가 강력하여 기후별 차별화를 유도합니다.
*/
var UNIQUE_BUILDINGS = [
  {
  id:'rice_terrace', name:'다랑논', emoji:'🌾', climate:'tropical',
  cost:{ production:6 }, perTurn:{ food:4, culture:1 },
  spec:'pop1', desc:'식량 +4, 문화 +1/턴, 인구 +1', max:1,
  lore:'열대의 풍부한 비로 가득 찬 계단식 논밭'
},
  {
    id:'caravanserai', name:'대상 숙소', emoji:'🏕️', climate:'arid',
    cost:{ production:7, gold:3 }, perTurn:{ gold:4 },
    spec:'dip5', desc:'금화 +4/턴, 외교 +5', max:1,
    lore:'사막의 교역로를 잇는 상인들의 쉼터'
  },
  {
    id:'windmill', name:'풍차 방앗간', emoji:'⚙️', climate:'temperate',
    cost:{ production:7 }, perTurn:{ food:1, production:2 },
    desc:'식량 +1, 생산력 +2/턴', max:1,
    lore:'온대의 바람을 이용한 효율적인 제분 시설'
  },
  {
    id:'fur_post', name:'모피 교역소', emoji:'🦊', climate:'cold',
    cost:{ production:7 }, perTurn:{ gold:3 }, spec:'mil3',
    desc:'금화 +3/턴, 군사력 +3', max:1,
    lore:'혹한 속에서 모피를 거래하는 냉대의 특산 시설'
  },
  {
    id:'rice_paddy', name:'논', emoji:'🌿', climate:'monsoon',
    cost:{ production:6 }, perTurn:{ food:4 },
    spec:'pop1', desc:'식량 +4/턴, 인구 +1', max:1,
    lore:'계절풍의 풍부한 여름 비로 키우는 벼논'
  },
  {
    id:'observatory', name:'천문대', emoji:'🔭', climate:'highland',
    cost:{ production:8, gold:3 }, perTurn:{ science:3 },
    spec:'dip5', desc:'과학 +3/턴, 외교 +5', max:1,
    lore:'맑은 고산의 밤하늘을 관측하는 첨단 시설'
  }
];

/* ─── 정책 ───────────────────────────────────────── */
var POLICIES = [
  { id:'economic',    name:'경제 중심',  emoji:'💰', color:'#f0c040', desc:'이번 턴 금화 생산 +60%' },
  { id:'military',    name:'군사 강화',  emoji:'⚔️', color:'#e05050', desc:'군사력 +4' },
  { id:'science',     name:'과학 진흥',  emoji:'🔬', color:'#50a8e8', desc:'이번 턴 과학 생산 +60%' },
  { id:'culture',     name:'문화 융성',  emoji:'🎨', color:'#b050e8', desc:'이번 턴 문화 생산 +60%' },
  { id:'agriculture', name:'농업 장려',  emoji:'🌾', color:'#60c050', desc:'식량 +5, 인구 성장 촉진' },
  { id:'production',  name:'산업화',     emoji:'⚙️', color:'#80aac8', desc:'이번 턴 생산력 +60%' },
  { id:'diplomacy_pol',name:'외교 강화', emoji:'🤝', color:'#50d0c0', desc:'이번 턴 외교 점수 +8' }
];

/* ─── 이벤트 ─────────────────────────────────────── */
var EVENTS = [
  { id:'harvest',     name:'대풍년',       emoji:'🌾', type:'good', desc:'식량이 크게 증가합니다!',        fx:function(p){ p.resources.food+=6;  return '식량 +6'; } },
  { id:'drought',     name:'극심한 가뭄',  emoji:'☀️', type:'bad',  desc:'가뭄으로 식량이 감소합니다.',     fx:function(p){ p.resources.food=Math.max(0,p.resources.food-4); return '식량 -4'; } },
  { id:'gold_rush',   name:'황금 발견',    emoji:'💰', type:'good', desc:'황금이 발견되었습니다!',          fx:function(p){ p.resources.gold+=8;  return '금화 +8'; } },
  { id:'plague',      name:'전염병 유행',  emoji:'🦠', type:'bad',  desc:'전염병으로 인구가 감소합니다.',   fx:function(p){ p.population=Math.max(1,p.population-1); p.resources.food=Math.max(0,p.resources.food-2); return '인구 -1, 식량 -2'; } },
  { id:'discovery',   name:'위대한 발견',  emoji:'💡', type:'good', desc:'걸출한 과학자가 탄생했습니다!',  fx:function(p){ p.resources.science+=10; return '과학 +10'; } },
  { id:'renaissance_ev',name:'문화 황금기',emoji:'🎨', type:'good', desc:'문화적 황금기가 찾아왔습니다!',  fx:function(p){ p.resources.culture+=8; return '문화 +8'; } },
  { id:'flood',       name:'대홍수',       emoji:'🌊', type:'bad',  desc:'홍수로 농경지가 피해를 입었습니다.', fx:function(p){ p.resources.food=Math.max(0,p.resources.food-3); return '식량 -3'; } },
  { id:'pop_boom',    name:'인구 폭발',    emoji:'👥', type:'good', desc:'인구가 급격히 증가했습니다!',    fx:function(p){ p.population+=2; return '인구 +2'; } },
  { id:'revolt',      name:'민중 봉기',    emoji:'✊', type:'bad',  desc:'봉기로 금화가 감소합니다.',       fx:function(p){ p.resources.gold=Math.max(0,p.resources.gold-5); return '금화 -5'; } },
  { id:'trade_boom',  name:'무역 번영',    emoji:'🚢', type:'good', desc:'무역이 크게 번성했습니다!',      fx:function(p){ p.resources.gold+=5; p.resources.food+=2; return '금화 +5, 식량 +2'; } },
  { id:'storm',       name:'태풍 상륙',    emoji:'🌪️', type:'bad',  desc:'태풍이 휩쓸고 지나갔습니다.',    fx:function(p){ p.resources.production=Math.max(0,p.resources.production-3); return '생산력 -3'; } },
  { id:'invention',   name:'위대한 발명',  emoji:'⚙️', type:'good', desc:'발명으로 나라가 발전합니다!',    fx:function(p){ p.resources.science+=5; p.resources.production+=3; return '과학 +5, 생산력 +3'; } },
  { id:'earthquake',  name:'지진 발생',    emoji:'🌋', type:'bad',  desc:'지진으로 건물이 파손되었습니다.', fx:function(p){ p.resources.production=Math.max(0,p.resources.production-2); p.resources.gold=Math.max(0,p.resources.gold-3); return '생산력 -2, 금화 -3'; } },
  { id:'alliance_ev', name:'우호 관계',    emoji:'🤝', type:'good', desc:'이웃 나라와 우호 관계를 맺었습니다!', fx:function(p){ p.dipBonus=(p.dipBonus||0)+10; return '외교 +10'; } },
  { id:'calm',        name:'풍요로운 계절',emoji:'🌈', type:'good', desc:'평온한 계절이 풍요를 가져왔습니다.', fx:function(p){ p.resources.food+=2; p.resources.gold+=2; return '식량 +2, 금화 +2'; } }
];

/* ─── 무역·외교 액션 ─────────────────────────────── */
var DIPLO_ACTIONS = [
  { id:'trade',     name:'자원 교역',   emoji:'🔄', color:'#f0c040', desc:'다른 나라와 자원을 교환합니다.' },
  { id:'alliance',  name:'동맹 제안',   emoji:'🤝', color:'#50d0c0', desc:'3턴간 좋은 이벤트를 공유하고 +10 외교점수를 얻습니다. (비용: 금화 5)' },
  { id:'mil_pact',  name:'군사 협력',   emoji:'⚔️', color:'#e05050', desc:'상대방과 군사력을 공유합니다. (비용: 금화 5, 양측 군사력 +5)' }
];

var TRADE_RESOURCES = ['food','production','gold','science','culture'];

/* ─── UI 헬퍼 상수 ───────────────────────────────── */
var R_EMOJI = { food:'🌾', production:'⚙️', gold:'💰', science:'🔬', culture:'🎨' };
var R_NAME  = { food:'식량', production:'생산력', gold:'금화', science:'과학', culture:'문화' };

function playerColors() { return ['#e86858','#5890e8','#50d890','#e8c050','#d050e8','#e8a050']; }
function playerEmojis() { return ['👑','🏰','⚓','🔮','🌟','💎']; }
