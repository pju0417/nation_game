/* =========================================================
   나라 경영 시뮬레이션 · constants.js
   게임 데이터 상수 정의
   made by 박선생
========================================================= */

/* ─── 기후 데이터 ─────────────────────────────────── */
const CLIMATES = {
  tropical: {
    id: 'tropical', name: '열대', emoji: '🌴',
    color: '#50d878',
    bg: 'linear-gradient(135deg, #0d2e14, #060f08)',
    desc: '풍부한 강수량으로 식량이 넘치는 열대우림 기후. 연중 기온이 높고 다양한 생물이 서식합니다.',
    geo: '동남아시아 · 아프리카 중부 · 아마존',
    base: { food:4, production:1, gold:2, science:1, culture:2 },
    perk: '🌾 식량 생산 탁월',
    weakness: '🔬 과학 발전 느림'
  },
  arid: {
    id: 'arid', name: '건조', emoji: '🏜️',
    color: '#d4a845',
    bg: 'linear-gradient(135deg, #2e1e08, #100a02)',
    desc: '강수량이 매우 적어 사막이 발달한 건조 기후. 지하에 풍부한 광물 자원이 매장되어 있습니다.',
    geo: '북아프리카 · 중동 · 중앙아시아',
    base: { food:1, production:2, gold:4, science:2, culture:1 },
    perk: '💰 금화·광물 풍부',
    weakness: '🌾 식량 생산 어려움'
  },
  temperate: {
    id: 'temperate', name: '온대', emoji: '🌿',
    color: '#60c868',
    bg: 'linear-gradient(135deg, #0e2216, #050e09)',
    desc: '사계절이 뚜렷하고 농업과 산업 모두에 적합한 균형 잡힌 온대 기후.',
    geo: '서유럽 · 동아시아 · 북아메리카',
    base: { food:2, production:2, gold:2, science:2, culture:2 },
    perk: '⚖️ 모든 자원 균형',
    weakness: '✨ 특별 보너스 없음'
  },
  cold: {
    id: 'cold', name: '냉대', emoji: '🌲',
    color: '#6aacdc',
    bg: 'linear-gradient(135deg, #0a1826, #040810)',
    desc: '겨울이 길고 혹독하게 추운 냉대 기후. 풍부한 산림 자원과 지하 광물이 매장되어 있습니다.',
    geo: '러시아 · 캐나다 · 북유럽',
    base: { food:1, production:3, gold:1, science:3, culture:1 },
    perk: '🔬 과학·생산력 강함',
    weakness: '🌾 식량·금화 부족'
  },
  monsoon: {
    id: 'monsoon', name: '계절풍', emoji: '🌾',
    color: '#98cc50',
    bg: 'linear-gradient(135deg, #162210, #080e06)',
    desc: '여름철 집중 강수로 벼농사가 발달한 계절풍 기후. 문화가 풍부하게 발전합니다.',
    geo: '한국 · 중국 · 일본 · 인도',
    base: { food:3, production:2, gold:2, science:1, culture:3 },
    perk: '🌾 식량·문화 강함',
    weakness: '🌪️ 태풍·홍수 위험'
  },
  highland: {
    id: 'highland', name: '고산', emoji: '⛰️',
    color: '#b0b0d8',
    bg: 'linear-gradient(135deg, #16162a, #080810)',
    desc: '높은 고도로 서늘하고 독특한 자연환경을 가진 고산 기후. 천문학과 광업이 발달합니다.',
    geo: '안데스 산맥 · 히말라야 · 티베트',
    base: { food:1, production:2, gold:3, science:3, culture:2 },
    perk: '🔭 과학·금화 강함',
    weakness: '🌾 식량 생산 제한'
  }
};

/* ─── 나라 이름 ──────────────────────────────────── */
const COUNTRY_NAMES = {
  tropical: ['야자 왕국','정글 제국','에메랄드 연방','열대 문명'],
  arid:     ['사막 제국','황금 왕국','오아시스 연방','사하라 문명'],
  temperate:['초원 연방','사계 왕국','녹원 제국','평야 문명'],
  cold:     ['설원 왕국','빙하 제국','침엽 연방','극지 공화국'],
  monsoon:  ['계절 왕국','논밭 제국','계절풍 연방','동아시아 문명'],
  highland: ['봉우리 왕국','운무 제국','고원 연방','천산 문명']
};

/* ─── 건물 목록 ──────────────────────────────────── */
const BUILDINGS = [
  {
    id:'farm',     name:'농장',     emoji:'🌾', cat:'economy',
    cost:{ production:4 },
    perTurn:{ food:2 },
    desc:'식량 +2/턴',   max:3
  },
  {
    id:'granary',  name:'곡물창고', emoji:'🏚️', cat:'economy',
    cost:{ production:3, gold:1 },
    perTurn:{ food:1 },
    spec:'pop',
    desc:'식량 +1/턴, 인구 성장 ↑', max:1
  },
  {
    id:'mine',     name:'광산',     emoji:'⛏️', cat:'economy',
    cost:{ production:4 },
    perTurn:{ gold:2, production:1 },
    desc:'금화 +2, 생산 +1/턴',   max:2
  },
  {
    id:'market',   name:'시장',     emoji:'🏪', cat:'economy',
    cost:{ production:3, gold:2 },
    perTurn:{ gold:3 },
    desc:'금화 +3/턴',   max:2
  },
  {
    id:'harbor',   name:'항구',     emoji:'⚓', cat:'economy',
    cost:{ production:5, gold:3 },
    perTurn:{ gold:2, food:1 },
    desc:'금화 +2, 식량 +1/턴',   max:1
  },
  {
    id:'workshop', name:'작업장',   emoji:'🔧', cat:'production',
    cost:{ production:3 },
    perTurn:{ production:2 },
    desc:'생산력 +2/턴',  max:2
  },
  {
    id:'library',  name:'도서관',   emoji:'📚', cat:'science',
    cost:{ production:3, gold:2 },
    perTurn:{ science:2 },
    desc:'과학 +2/턴',   max:2
  },
  {
    id:'university',name:'대학교',  emoji:'🎓', cat:'science',
    cost:{ production:6, gold:4 },
    perTurn:{ science:3, culture:1 },
    desc:'과학 +3, 문화 +1/턴',
    req:'library', max:1
  },
  {
    id:'temple',   name:'사원',     emoji:'🏛️', cat:'culture',
    cost:{ production:3, gold:1 },
    perTurn:{ culture:2 },
    desc:'문화 +2/턴',   max:2
  },
  {
    id:'theater',  name:'극장',     emoji:'🎭', cat:'culture',
    cost:{ production:5, gold:3 },
    perTurn:{ culture:3 },
    desc:'문화 +3/턴',
    req:'temple',  max:1
  },
  {
    id:'barracks', name:'군영',     emoji:'⚔️', cat:'military',
    cost:{ production:5, gold:2 },
    spec:'mil5',
    desc:'군사력 +5',    max:2
  },
  {
    id:'fortress', name:'요새',     emoji:'🏰', cat:'military',
    cost:{ production:8, gold:5 },
    spec:'mil10',
    desc:'군사력 +10',
    req:'barracks', max:1
  }
];

/* ─── 기술 목록 ──────────────────────────────────── */
const TECHS = [
  {
    id:'adv_farming',  name:'발달된 농업기술', emoji:'🌱',
    cost:{ science:8 },  perTurn:{ food:2 },
    desc:'식량 +2/턴'
  },
  {
    id:'construction', name:'건축술',         emoji:'🏗️',
    cost:{ science:8 },  perTurn:{ production:2 },
    desc:'생산력 +2/턴'
  },
  {
    id:'trade_routes', name:'교역로 개척',    emoji:'🚢',
    cost:{ science:10 }, perTurn:{ gold:3 },
    desc:'금화 +3/턴'
  },
  {
    id:'philosophy',   name:'철학',           emoji:'📖',
    cost:{ science:8 },  perTurn:{ culture:3 },
    desc:'문화 +3/턴'
  },
  {
    id:'mil_tactics',  name:'군사전술',       emoji:'🗡️',
    cost:{ science:10 }, spec:'mil8',
    desc:'군사력 +8'
  },
  {
    id:'medicine',     name:'의학',           emoji:'💊',
    cost:{ science:12 }, spec:'pop1',
    desc:'인구 성장 +1'
  },
  {
    id:'astronomy',    name:'천문학',          emoji:'🔭',
    cost:{ science:14 }, perTurn:{ science:3 },
    desc:'과학 +3/턴'
  },
  {
    id:'economics',    name:'경제학',          emoji:'💹',
    cost:{ science:12 }, perTurn:{ gold:2, production:1 },
    desc:'금화 +2, 생산 +1/턴'
  },
  {
    id:'art_culture',  name:'예술과 문화',    emoji:'🎨',
    cost:{ science:12 }, perTurn:{ culture:4 },
    desc:'문화 +4/턴'
  },
  {
    id:'diplomacy',    name:'외교술',          emoji:'🤝',
    cost:{ science:10 }, spec:'dip15',
    desc:'외교 점수 +15'
  }
];

/* ─── 정책 목록 ──────────────────────────────────── */
const POLICIES = [
  { id:'economic',    name:'경제 중심 정책', emoji:'💰', color:'#f0c040', desc:'이번 턴 금화 생산량 +60%' },
  { id:'military',    name:'군사 강화 정책', emoji:'⚔️', color:'#e05050', desc:'군사력 +4' },
  { id:'science',     name:'과학 진흥 정책', emoji:'🔬', color:'#50a8e8', desc:'이번 턴 과학 생산량 +60%' },
  { id:'culture',     name:'문화 융성 정책', emoji:'🎨', color:'#b050e8', desc:'이번 턴 문화 생산량 +60%' },
  { id:'agriculture', name:'농업 장려 정책', emoji:'🌾', color:'#60c050', desc:'식량 +5, 인구 성장 촉진' },
  { id:'production',  name:'산업화 정책',    emoji:'⚙️', color:'#80aac8', desc:'이번 턴 생산력 +60%' }
];

/* ─── 이벤트 목록 ────────────────────────────────── */
const EVENTS = [
  {
    id:'harvest', name:'대풍년', emoji:'🌾', type:'good',
    desc:'이번 턴 식량이 크게 증가합니다!',
    fx: function(p) { p.resources.food += 6; return '식량 +6'; }
  },
  {
    id:'drought', name:'극심한 가뭄', emoji:'☀️', type:'bad',
    desc:'가뭄으로 식량이 감소합니다.',
    fx: function(p) { p.resources.food = Math.max(0, p.resources.food - 4); return '식량 -4'; }
  },
  {
    id:'gold_rush', name:'황금 발견', emoji:'💰', type:'good',
    desc:'땅에서 황금이 발견되었습니다!',
    fx: function(p) { p.resources.gold += 8; return '금화 +8'; }
  },
  {
    id:'plague', name:'전염병 유행', emoji:'🦠', type:'bad',
    desc:'전염병으로 인구가 감소합니다.',
    fx: function(p) {
      p.population = Math.max(1, p.population - 1);
      p.resources.food = Math.max(0, p.resources.food - 2);
      return '인구 -1, 식량 -2';
    }
  },
  {
    id:'discovery', name:'위대한 발견', emoji:'💡', type:'good',
    desc:'걸출한 과학자가 탄생했습니다!',
    fx: function(p) { p.resources.science += 10; return '과학 +10'; }
  },
  {
    id:'renaissance', name:'문화 황금기', emoji:'🎨', type:'good',
    desc:'문화적 황금기가 찾아왔습니다!',
    fx: function(p) { p.resources.culture += 8; return '문화 +8'; }
  },
  {
    id:'flood', name:'대홍수', emoji:'🌊', type:'bad',
    desc:'홍수로 농경지가 피해를 입었습니다.',
    fx: function(p) { p.resources.food = Math.max(0, p.resources.food - 3); return '식량 -3'; }
  },
  {
    id:'pop_boom', name:'인구 폭발', emoji:'👥', type:'good',
    desc:'인구가 급격히 증가했습니다!',
    fx: function(p) { p.population += 2; return '인구 +2'; }
  },
  {
    id:'revolt', name:'민중 봉기', emoji:'✊', type:'bad',
    desc:'불만이 폭발하여 봉기가 발생했습니다.',
    fx: function(p) { p.resources.gold = Math.max(0, p.resources.gold - 5); return '금화 -5'; }
  },
  {
    id:'trade_boom', name:'무역 번영', emoji:'🚢', type:'good',
    desc:'무역이 크게 번성했습니다!',
    fx: function(p) { p.resources.gold += 5; p.resources.food += 2; return '금화 +5, 식량 +2'; }
  },
  {
    id:'storm', name:'태풍 상륙', emoji:'🌪️', type:'bad',
    desc:'강력한 태풍이 휩쓸고 지나갔습니다.',
    fx: function(p) { p.resources.production = Math.max(0, p.resources.production - 3); return '생산력 -3'; }
  },
  {
    id:'invention', name:'위대한 발명', emoji:'⚙️', type:'good',
    desc:'뛰어난 발명으로 나라가 발전합니다!',
    fx: function(p) { p.resources.science += 5; p.resources.production += 3; return '과학 +5, 생산력 +3'; }
  },
  {
    id:'earthquake', name:'지진 발생', emoji:'🌋', type:'bad',
    desc:'지진으로 건물이 파손되었습니다.',
    fx: function(p) {
      p.resources.production = Math.max(0, p.resources.production - 2);
      p.resources.gold = Math.max(0, p.resources.gold - 3);
      return '생산력 -2, 금화 -3';
    }
  },
  {
    id:'alliance', name:'우호 관계 수립', emoji:'🤝', type:'good',
    desc:'이웃 나라와 우호 관계를 맺었습니다!',
    fx: function(p) { p.dipBonus = (p.dipBonus || 0) + 10; return '외교 보너스 +10'; }
  },
  {
    id:'calm', name:'풍요로운 계절', emoji:'🌈', type:'good',
    desc:'평온한 계절이 나라를 풍요롭게 합니다.',
    fx: function(p) { p.resources.food += 2; p.resources.gold += 2; return '식량 +2, 금화 +2'; }
  }
];

/* ─── 자원 표시 헬퍼 ─────────────────────────────── */
const R_EMOJI = { food:'🌾', production:'⚙️', gold:'💰', science:'🔬', culture:'🎨' };
const R_NAME  = { food:'식량', production:'생산력', gold:'금화', science:'과학', culture:'문화' };

/* ─── 플레이어 색상·이모지 ───────────────────────── */
function playerColors() {
  return ['#e86858','#5890e8','#50d890','#e8c050','#d050e8','#e8a050'];
}
function playerEmojis() {
  return ['👑','🏰','⚓','🔮','🌟','💎'];
}
