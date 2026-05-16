/* =========================================================
   나라 경영 시뮬레이션 · map.js
   버튼식 문명형 육각 타일 지도 전용 버전
   made by 박선생

   핵심 기능:
   1. Canvas를 사용하지 않음
   2. 기존 <canvas id="worldMap">가 있으면 자동으로 제거
   3. <div id="worldMapButtonHost"> 버튼식 지도 전용 host 생성
   4. 실제 button 요소로 육각형 타일 생성
   5. 타일 하나하나가 클릭 가능한 개체
   6. 인구가 늘어날수록 영토가 점차 확장됨
   7. 영토는 타일색으로 칠하지 않고 진한 선으로만 구분
========================================================= */

/* ─── 전역 상태 ─────────────────────────────────── */
var MAP_TILES = [];
var MAP_TILE_INDEX = {};
var SELECTED_TILE = null;

var CURRENT_MAP_PROFILE = null;
var CURRENT_MAP_KEY = null;

var _mapLastPlayers = [];
var _mapLastCurId = null;

/* ─── 기본 상수 ─────────────────────────────────── */
var HEX_W = 72;
var HEX_H = 82;
var HEX_X_GAP = 62;
var HEX_Y_GAP = 62;

var CLIMATE_ORDER = ['cold', 'highland', 'temperate', 'arid', 'monsoon', 'tropical'];

/* ─── 타일 지형 정의 ─────────────────────────────── */
var TILE_TYPES = {
  o: { id:'ocean',    name:'바다',     color:'#12395f', edge:'#1e5a88', icon:'≈',  yield:{ gold:1 }, buildable:false },
  t: { id:'tundra',   name:'설원',     color:'#9fc7d7', edge:'#d4eef8', icon:'❄', yield:{ science:1, production:1 }, buildable:true },
  p: { id:'plains',   name:'초원',     color:'#3f8d3d', edge:'#66c466', icon:'·',  yield:{ food:2 }, buildable:true },
  f: { id:'forest',   name:'숲',       color:'#1f6436', edge:'#3fa05a', icon:'♣',  yield:{ food:1, production:1 }, buildable:true },
  d: { id:'desert',   name:'사막',     color:'#b88932', edge:'#e4c15d', icon:'·',  yield:{ gold:2 }, buildable:true },
  m: { id:'mountain', name:'산악',     color:'#666a74', edge:'#b8bdc8', icon:'▲', yield:{ production:2, science:1 }, buildable:false },
  j: { id:'jungle',   name:'열대우림', color:'#157a3a', edge:'#35b85d', icon:'🌿', yield:{ food:2, culture:1 }, buildable:true },
  h: { id:'highland', name:'고원',     color:'#555372', edge:'#b0b0d8', icon:'▲', yield:{ science:2 }, buildable:true }
};

/* ─── 턴 수별 지도 프로필 ───────────────────────── */
var MAP_PROFILES = {
  short: {
    key:'short',
    label:'확장형 소형 지도',
    turnLabel:'15턴',
    map:[
      ['o','o','t','t','t','m','m','h','h','o','o','o','o'],
      ['o','t','t','p','p','m','h','h','p','p','o','o','o'],
      ['o','t','p','p','f','m','d','d','p','f','f','o','o'],
      ['o','p','p','f','d','d','d','p','p','f','j','j','o'],
      ['o','p','f','f','p','d','d','p','f','j','j','j','o'],
      ['o','o','f','p','p','p','p','f','j','j','j','o','o'],
      ['o','o','o','j','j','p','f','f','j','j','o','o','o'],
      ['o','o','o','o','j','j','f','p','p','o','o','o','o']
    ],
    starts:{
      cold:{row:1,col:2},
      highland:{row:1,col:7},
      temperate:{row:3,col:2},
      arid:{row:3,col:5},
      monsoon:{row:3,col:9},
      tropical:{row:6,col:4}
    }
  },

  standard: {
    key:'standard',
    label:'대형 표준 지도',
    turnLabel:'20턴',
    map:[
      ['o','o','t','t','t','t','m','m','h','h','h','o','o','o','o'],
      ['o','t','t','t','p','p','m','h','h','p','p','p','o','o','o'],
      ['o','t','p','p','p','f','m','d','d','p','p','f','f','o','o'],
      ['o','p','p','f','f','d','d','d','d','p','f','f','j','j','o'],
      ['o','p','f','f','p','p','d','d','p','p','f','j','j','j','o'],
      ['o','o','f','p','p','p','p','p','f','f','j','j','j','j','o'],
      ['o','o','o','j','j','p','p','f','f','j','j','j','j','o','o'],
      ['o','o','o','o','j','j','p','f','p','p','j','j','o','o','o'],
      ['o','o','o','o','o','j','j','f','f','p','p','o','o','o','o'],
      ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o']
    ],
    starts:{
      cold:{row:1,col:2},
      highland:{row:1,col:8},
      temperate:{row:3,col:2},
      arid:{row:3,col:7},
      monsoon:{row:3,col:12},
      tropical:{row:7,col:5}
    }
  },

  long: {
    key:'long',
    label:'초대형 장기 지도',
    turnLabel:'30턴',
    map:[
      ['o','o','o','t','t','t','t','m','m','h','h','h','h','o','o','o','o'],
      ['o','o','t','t','t','p','p','m','m','h','h','p','p','p','o','o','o'],
      ['o','t','t','p','p','p','f','m','d','d','p','p','f','f','o','o','o'],
      ['o','t','p','p','f','f','d','d','d','d','p','f','f','j','j','o','o'],
      ['o','p','p','f','f','p','p','d','d','p','p','f','j','j','j','j','o'],
      ['o','p','f','f','p','p','p','p','p','f','f','j','j','j','j','j','o'],
      ['o','o','f','p','p','p','p','f','f','f','j','j','j','j','j','o','o'],
      ['o','o','o','j','j','p','p','p','f','j','j','j','j','j','o','o','o'],
      ['o','o','o','o','j','j','p','f','f','p','p','j','j','o','o','o','o'],
      ['o','o','o','o','o','j','j','f','f','p','p','p','o','o','o','o','o'],
      ['o','o','o','o','o','o','j','j','f','f','p','o','o','o','o','o','o'],
      ['o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o']
    ],
    starts:{
      cold:{row:1,col:3},
      highland:{row:1,col:10},
      temperate:{row:4,col:2},
      arid:{row:4,col:8},
      monsoon:{row:4,col:14},
      tropical:{row:8,col:6}
    }
  }
};

/* ─── 기본 유틸 ─────────────────────────────────── */
function tileKey(row, col) {
  return row + ',' + col;
}

function getTile(row, col) {
  return MAP_TILE_INDEX[tileKey(row, col)] || null;
}

function getMaxTurnsForMap() {
  if (typeof G !== 'undefined' && G && G.maxTurns) return parseInt(G.maxTurns, 10);
  return 20;
}

function getMapProfile() {
  var turns = getMaxTurnsForMap();
  if (turns <= 15) return MAP_PROFILES.short;
  if (turns >= 30) return MAP_PROFILES.long;
  return MAP_PROFILES.standard;
}

function getClimateStart(climateId) {
  var profile = CURRENT_MAP_PROFILE || getMapProfile();
  return profile.starts[climateId];
}

function getClimateName(climateId) {
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) return CLIMATES[climateId].name;
  return climateId || '없음';
}

function getClimateEmoji(climateId) {
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) return CLIMATES[climateId].emoji;
  return '🏛️';
}

function getPlayerColor(player, climateId) {
  if (player && player.color) return player.color;
  if (typeof CLIMATES !== 'undefined' && CLIMATES[climateId]) return CLIMATES[climateId].color;
  return '#f0c040';
}

function getPlayerById(players, id) {
  if (!players || id === null || typeof id === 'undefined') return null;
  for (var i = 0; i < players.length; i++) {
    if (players[i].id === id) return players[i];
  }
  return null;
}

function getPlayerByClimate(players, climateId) {
  if (!players) return null;
  for (var i = 0; i < players.length; i++) {
    if (players[i].climate === climateId) return players[i];
  }
  return null;
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') return [255, 255, 255];
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];
}

function rgbaFromHex(hex, alpha) {
  var rgb = hexToRgb(hex);
  return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
}

function formatYield(yieldObj) {
  if (!yieldObj) return '없음';

  var labels = {
    food:'🌾 식량',
    production:'⚙️ 생산력',
    gold:'💰 금화',
    science:'🔬 과학',
    culture:'🎨 문화'
  };

  var result = [];

  Object.keys(yieldObj).forEach(function(key) {
    if (yieldObj[key]) result.push(labels[key] + ' +' + yieldObj[key]);
  });

  return result.length ? result.join(', ') : '없음';
}

function safeText(value) {
  if (value === null || typeof value === 'undefined') return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── 스타일 주입 ───────────────────────────────── */
function ensureButtonMapStyles() {
  if (document.getElementById('buttonHexMapStyles')) return;

  var style = document.createElement('style');
  style.id = 'buttonHexMapStyles';

  style.textContent =
    '.hex-map-shell{' +
      'width:100%;max-width:1740px;margin:0 auto;border-radius:16px;' +
      'border:1px solid rgba(240,192,64,.22);' +
      'background:linear-gradient(135deg,#04101e,#071a2f 45%,#10243a);' +
      'box-shadow:0 18px 40px rgba(0,0,0,.30);overflow:hidden;' +
    '}' +

    '.hex-map-header{' +
      'display:flex;justify-content:space-between;align-items:center;gap:12px;' +
      'padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08);' +
      'background:rgba(4,6,15,.62);' +
    '}' +

    '.hex-map-title{font-weight:900;color:#f6e7b5;font-size:15px;}' +
    '.hex-map-subtitle{font-size:11px;color:rgba(210,225,245,.66);margin-top:2px;}' +
    '.hex-map-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;}' +
    '.hex-map-badge{font-size:11px;color:#f6e7b5;background:rgba(240,192,64,.10);border:1px solid rgba(240,192,64,.22);border-radius:999px;padding:4px 8px;white-space:nowrap;}' +

    '.hex-map-scroll{width:100%;overflow:auto;padding:18px;box-sizing:border-box;}' +

    '.hex-map-board{' +
      'position:relative;margin:0 auto;' +
      'background:radial-gradient(circle at 20% 20%,rgba(120,180,255,.08),transparent 28%),radial-gradient(circle at 75% 65%,rgba(240,192,64,.07),transparent 30%),rgba(4,8,18,.32);' +
      'border-radius:16px;min-width:max-content;' +
    '}' +

    '.hex-tile-btn{' +
      'position:absolute;width:72px;height:82px;border:0;padding:0;margin:0;cursor:pointer;' +
      'clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);' +
      'background:var(--tile-color);' +
      'box-shadow:inset 0 0 0 2px rgba(255,255,255,.16),inset 0 -16px 22px rgba(0,0,0,.22),inset 0 10px 16px rgba(255,255,255,.12);' +
      'transition:transform .08s ease, filter .08s ease;' +
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;user-select:none;overflow:hidden;' +
    '}' +

    '.hex-tile-btn:hover{' +
      'transform:translateY(-2px) scale(1.035);' +
      'filter:brightness(1.12);' +
      'z-index:40!important;' +
    '}' +

    '.hex-tile-btn:focus{' +
      'outline:none!important;' +
    '}' +

    '.hex-tile-btn:focus-visible{' +
      'outline:none!important;' +
    '}' +

    '.hex-tile-btn:active{' +
      'outline:none!important;' +
    '}' +

    '.hex-tile-btn::-moz-focus-inner{' +
      'border:0;' +
    '}' +

    '.hex-tile-btn.owned{' +
      'background:var(--tile-color);' +
      'box-shadow:inset 0 0 0 2px rgba(255,255,255,.16),inset 0 -16px 22px rgba(0,0,0,.22),inset 0 10px 16px rgba(255,255,255,.12);' +
      'z-index:10;' +
    '}' +

    '.hex-territory-line{' +
      'position:absolute;inset:3px;' +
      'clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);' +
      'background:var(--owner-strong);' +
      'pointer-events:none;z-index:1;' +
    '}' +

    '.hex-territory-line::after{' +
      'content:"";position:absolute;inset:7px;' +
      'clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);' +
      'background:var(--tile-color);' +
    '}' +

    '.hex-territory-glow{' +
      'position:absolute;inset:0;' +
      'clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);' +
      'box-shadow:inset 0 0 0 5px var(--owner-strong),inset 0 0 20px var(--owner-soft);' +
      'pointer-events:none;z-index:2;' +
    '}' +

    '.hex-tile-btn.capital{' +
      'box-shadow:inset 0 0 0 6px var(--owner-strong),inset 0 0 0 11px rgba(240,192,64,.75),inset 0 0 24px var(--owner-soft),inset 0 -16px 22px rgba(0,0,0,.24);' +
      'z-index:22;' +
    '}' +

    '.hex-tile-btn.current-capital{' +
      'animation:hexPulse 1.4s ease-in-out infinite;' +
    '}' +

    /*
      선택된 타일 자체에는 box-shadow를 거의 주지 않습니다.
      사각형처럼 보이는 문제를 막기 위해 선택 효과는 내부 span에서 처리합니다.
    */
    '.hex-tile-btn.selected{' +
      'z-index:60!important;' +
      'filter:brightness(1.08);' +
    '}' +

    '.hex-selection-pulse{' +
      'position:absolute;' +
      'inset:5px;' +
      'clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);' +
      'border:3px solid rgba(240,192,64,.95);' +
      'background:rgba(240,192,64,.08);' +
      'box-shadow:inset 0 0 12px rgba(240,192,64,.65),0 0 12px rgba(240,192,64,.42);' +
      'pointer-events:none;' +
      'z-index:7;' +
      'animation:hexSelectPulse 1.35s ease-in-out infinite;' +
    '}' +

    '@keyframes hexSelectPulse{' +
      '0%{opacity:.35;transform:scale(.96);}' +
      '50%{opacity:1;transform:scale(1.02);}' +
      '100%{opacity:.35;transform:scale(.96);}' +
    '}' +

    '@keyframes hexPulse{' +
      '0%,100%{filter:brightness(1);}' +
      '50%{filter:brightness(1.28);}' +
    '}' +

    '.hex-icon{' +
      'position:absolute;left:0;right:0;top:21px;text-align:center;font-size:18px;line-height:1;' +
      'color:rgba(255,255,255,.92);text-shadow:0 1px 3px rgba(0,0,0,.65);pointer-events:none;z-index:8;' +
    '}' +

    '.hex-yield{' +
      'position:absolute;right:15px;bottom:17px;font-size:12px;line-height:1;opacity:.86;' +
      'filter:drop-shadow(0 1px 2px rgba(0,0,0,.7));pointer-events:none;z-index:8;' +
    '}' +

    '.hex-owner-mark{' +
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;' +
      'background:rgba(6,8,20,.88);display:flex;align-items:center;justify-content:center;font-size:14px;' +
      'border:2px solid var(--owner-strong);box-shadow:0 0 12px var(--owner-soft);pointer-events:none;z-index:9;' +
    '}' +

    '.hex-building-mark{' +
      'position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:24px;height:24px;border-radius:50%;' +
      'background:rgba(6,8,20,.88);border:2px solid rgba(240,192,64,.85);display:flex;align-items:center;justify-content:center;' +
      'font-size:14px;z-index:9;pointer-events:none;' +
    '}' +

    '.hex-country-label{' +
      'position:absolute;z-index:55;transform:translate(-50%,-50%);padding:4px 9px;border-radius:999px;' +
      'background:rgba(6,8,20,.80);border:1px solid var(--owner-strong);color:#f6e7b5;font-size:12px;font-weight:800;white-space:nowrap;pointer-events:none;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.28);text-shadow:0 1px 2px rgba(0,0,0,.7);' +
    '}' +

    '.hex-info-box{' +
      'margin-top:10px;padding:12px 14px;border:1px solid rgba(255,255,255,.20);border-radius:12px;' +
      'background:rgba(8,9,26,.92);color:#f6e7b5;font-size:13px;line-height:1.55;box-shadow:0 10px 24px rgba(0,0,0,.25);' +
    '}' +

    '.hex-info-title{' +
      'font-weight:800;font-size:15px;margin-bottom:6px;' +
    '}' +

    '.hex-map-footer{' +
      'display:flex;justify-content:space-between;gap:10px;padding:9px 14px 12px;font-size:11px;color:rgba(210,225,245,.62);background:rgba(4,6,15,.38);' +
    '}' +

    '@media (max-width:768px){.hex-map-scroll{padding:12px;}.hex-map-header{align-items:flex-start;flex-direction:column;}.hex-map-badges{justify-content:flex-start;}}';

  document.head.appendChild(style);
}

/* ─── 타일 건설 저장소 ───────────────────────────── */

function ensureTileBuildingStore() {
  if (typeof G === 'undefined') return;
  if (!G.mapBuildings) G.mapBuildings = {};
}

function getTileBuildingId(row, col) {
  ensureTileBuildingStore();
  if (typeof G === 'undefined' || !G.mapBuildings) return null;
  return G.mapBuildings[tileKey(row, col)] || null;
}

function getSelectedBuildTile() {
  if (typeof G === 'undefined') return null;
  if (!G.selBuildTile) return null;
  return getTile(G.selBuildTile.row, G.selBuildTile.col);
}

function canPlaceBuildingOnTile(player, buildingId, tilePos) {
  if (!player || !buildingId || !tilePos) return false;

  var tile = getTile(tilePos.row, tilePos.col);
  if (!tile) return false;

  if (!tile.buildable) return false;
  if (tile.type === 'o' || tile.type === 'm') return false;
  if (tile.ownerPlayerId !== player.id) return false;
  if (tile.buildingId) return false;

  return true;
}

function placeBuildingOnSelectedTile(player, buildingId, tilePos) {
  ensureTileBuildingStore();

  if (!canPlaceBuildingOnTile(player, buildingId, tilePos)) {
    return false;
  }

  var key = tileKey(tilePos.row, tilePos.col);
  G.mapBuildings[key] = buildingId;

  var tile = getTile(tilePos.row, tilePos.col);
  if (tile) {
    tile.buildingId = buildingId;
  }

  return true;
}

/* ─── 타일 데이터 생성 ───────────────────────────── */
function buildMapTiles(force) {
  var profile = getMapProfile();

  if (!force && CURRENT_MAP_KEY === profile.key && MAP_TILES.length > 0) return;

  CURRENT_MAP_PROFILE = profile;
  CURRENT_MAP_KEY = profile.key;

  MAP_TILES = [];
  MAP_TILE_INDEX = {};

  var map = profile.map;

  for (var row = 0; row < map.length; row++) {
    for (var col = 0; col < map[row].length; col++) {
      var typeCode = map[row][col];
      var typeDef = TILE_TYPES[typeCode] || TILE_TYPES.p;

      var tile = {
        id:tileKey(row, col),
        row:row,
        col:col,
        type:typeCode,
        typeId:typeDef.id,
        typeName:typeDef.name,
        ownerClimate:null,
        ownerPlayerId:null,
        ownerDistance:null,
        buildingId:getTileBuildingId(row, col),
        unitId:null,
        isCapital:false,
        capitalClimate:null,
        discovered:true,
        selected:false,
        yield:Object.assign({}, typeDef.yield || {}),
        buildable:!!typeDef.buildable
      };

      MAP_TILES.push(tile);
      MAP_TILE_INDEX[tile.id] = tile;
    }
  }

  markCapitalTiles();

  if (SELECTED_TILE) {
    var restored = getTile(SELECTED_TILE.row, SELECTED_TILE.col);
    SELECTED_TILE = restored || null;
  }
}

function ensureMapTiles() {
  buildMapTiles(false);
}

function markCapitalTiles() {
  CLIMATE_ORDER.forEach(function(climateId) {
    var pos = getClimateStart(climateId);
    if (!pos) return;

    var tile = getTile(pos.row, pos.col);
    if (tile) {
      tile.isCapital = true;
      tile.capitalClimate = climateId;
    }
  });
}

/* ─── 영토 계산 ─────────────────────────────────── */
function offsetToCube(row, col) {
  var x = col - (row - (row & 1)) / 2;
  var z = row;
  var y = -x - z;
  return { x:x, y:y, z:z };
}

function getHexDistance(a, b) {
  var ac = offsetToCube(a.row, a.col);
  var bc = offsetToCube(b.row, b.col);
  return Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
}

function getBaseTerritoryRadiusByTurns() {
  var turns = getMaxTurnsForMap();
  if (turns <= 15) return 1;
  if (turns >= 30) return 2;
  return 1;
}

function getTerritoryRadiusForPlayer(player) {
  var pop = player && player.population ? parseInt(player.population, 10) : 3;
  var base = getBaseTerritoryRadiusByTurns();
  var bonus = 0;

  if (pop >= 5) bonus += 1;
  if (pop >= 9) bonus += 1;
  if (pop >= 14) bonus += 1;
  if (pop >= 20) bonus += 1;

  var turns = getMaxTurnsForMap();
  var maxRadius = turns >= 30 ? 5 : 4;

  return Math.min(maxRadius, base + bonus);
}

function claimTileForPlayer(tile, player, dist) {
  if (!tile || tile.type === 'o' || !player) return;

  if (tile.ownerPlayerId === null || typeof tile.ownerPlayerId === 'undefined') {
    tile.ownerClimate = player.climate;
    tile.ownerPlayerId = player.id;
    tile.ownerDistance = dist;
    return;
  }

  var currentOwner = getPlayerById(_mapLastPlayers, tile.ownerPlayerId);
  var currentPop = currentOwner && currentOwner.population ? currentOwner.population : 0;
  var nextPop = player.population || 0;

  if (dist < tile.ownerDistance) {
    tile.ownerClimate = player.climate;
    tile.ownerPlayerId = player.id;
    tile.ownerDistance = dist;
    return;
  }

  if (dist === tile.ownerDistance && nextPop > currentPop) {
    tile.ownerClimate = player.climate;
    tile.ownerPlayerId = player.id;
    tile.ownerDistance = dist;
  }
}

/* ─── 플레이어 데이터와 타일 연결 ───────────────── */
function syncTilesWithPlayers(players) {
  ensureMapTiles();

  MAP_TILES.forEach(function(tile) {
    tile.ownerClimate = null;
    tile.ownerPlayerId = null;
    tile.ownerDistance = null;
  });

  if (!players) return;

  players.forEach(function(player) {
    if (!player || !player.climate) return;

    var start = getClimateStart(player.climate);
    if (!start) return;

    var radius = getTerritoryRadiusForPlayer(player);

    MAP_TILES.forEach(function(tile) {
      if (tile.type === 'o') return;

      var dist = getHexDistance(start, tile);

      if (dist <= radius) {
        claimTileForPlayer(tile, player, dist);
      }
    });
  });
}

/* ─── 버튼 지도 전용 host 준비 ──────────────────── */
function getOrCreateButtonMapHost() {
  /*
    지도 host를 최대한 안정적으로 찾거나 생성합니다.

    우선순위:
    1. 이미 있는 #worldMapButtonHost 사용
    2. 예전 canvas #worldMap이 있으면 그 자리에 host 생성 후 canvas 제거
    3. 새 지도 레이아웃의 .map-center-col 안에 host 생성
    4. 마지막 fallback으로 #app 안에 host 생성
  */

  var host = document.getElementById('worldMapButtonHost');

  if (host) {
    return host;
  }

  var canvas = document.getElementById('worldMap');

  if (canvas && canvas.parentNode) {
    host = document.createElement('div');
    host.id = 'worldMapButtonHost';

    canvas.parentNode.insertBefore(host, canvas);
    canvas.remove();

    return host;
  }

  var centerCol = document.querySelector('.map-center-col');

  if (centerCol) {
    host = document.createElement('div');
    host.id = 'worldMapButtonHost';
    centerCol.appendChild(host);

    return host;
  }

  var app = document.getElementById('app');

  if (app) {
    host = document.createElement('div');
    host.id = 'worldMapButtonHost';
    app.appendChild(host);

    return host;
  }

  return null;
}
/* ─── 버튼 지도 렌더링 ───────────────────────────── */
function scheduleMapDraw(players, currentPlayerId) {
  _mapLastPlayers = players || [];
  _mapLastCurId = currentPlayerId;

  ensureButtonMapStyles();

  /*
    턴이 바뀌면 인구, 영토, 건물 배치가 바뀔 수 있으므로
    같은 지도 프로필이어도 타일 데이터를 다시 동기화합니다.
  */
  buildMapTiles(false);
  syncTilesWithPlayers(_mapLastPlayers);

  /*
    render() 직후 DOM이 아직 안정화되지 않았을 수 있어
    1차, 2차로 나누어 렌더링합니다.
    두 번째 턴부터 지도가 사라지는 문제를 방지합니다.
  */
  setTimeout(function() {
    renderButtonHexMap(_mapLastPlayers, _mapLastCurId);
  }, 0);

  setTimeout(function() {
    var host = getOrCreateButtonMapHost();

    if (host && host.innerHTML.trim() === '') {
      renderButtonHexMap(_mapLastPlayers, _mapLastCurId);
    }

    if (!host) {
      renderButtonHexMap(_mapLastPlayers, _mapLastCurId);
    }
  }, 50);
}

function renderButtonHexMap(players, currentPlayerId) {
  var host = getOrCreateButtonMapHost();

  if (!host) {
    console.warn('지도 host를 찾거나 만들 수 없습니다.');
    return;
  }

  players = players || [];

  var profile = CURRENT_MAP_PROFILE || getMapProfile();
  var map = profile.map;

  var rows = map.length;
  var cols = map[0].length;

  var boardW = cols * HEX_X_GAP + HEX_W + 60;
  var boardH = rows * HEX_Y_GAP + HEX_H + 50;

  var ownedCount = MAP_TILES.filter(function(t) {
    return t.ownerPlayerId !== null && typeof t.ownerPlayerId !== 'undefined';
  }).length;

  var html = '';

  html += '<div class="hex-map-shell">';
  html += '<div class="hex-map-header">';
  html += '<div>';
  html += '<div class="hex-map-title">🗺️ 문명 지도</div>';
  html += '<div class="hex-map-subtitle">' + profile.turnLabel + ' · ' + profile.label + ' · 진한 선 영토 표시</div>';
  html += '</div>';
  html += '<div class="hex-map-badges">';
  html += '<div class="hex-map-badge">타일 ' + MAP_TILES.length + '개</div>';
  html += '<div class="hex-map-badge">영토 ' + ownedCount + '칸</div>';
  html += '<div class="hex-map-badge">인구 성장형 영토</div>';
  html += '</div>';
  html += '</div>';

  html += '<div class="hex-map-scroll">';
  html += '<div class="hex-map-board" style="width:' + boardW + 'px;height:' + boardH + 'px;">';

  MAP_TILES.forEach(function(tile) {
    html += renderTileButton(tile, players, currentPlayerId);
  });

  html += renderCountryLabels(players);

  html += '</div>';
  html += '</div>';

  html += '<div class="hex-map-footer">';
  html += '<div>인구 5, 9, 14, 20에 도달하면 영토 반경이 점차 넓어집니다.</div>';
  html += '<div>made by 박선생</div>';
  html += '</div>';
  html += '</div>';

  html += '<div id="tileInfoBox" class="hex-info-box">';
  html += '<div class="hex-info-title">🧭 선택한 타일</div>';
  html += '<div style="color:rgba(246,231,181,.72);">지도에서 육각형 타일을 선택하세요.</div>';
  html += '</div>';

  host.innerHTML = html;

  bindButtonMapEvents(host);

  if (SELECTED_TILE) {
    var selected = getTile(SELECTED_TILE.row, SELECTED_TILE.col);

    if (selected) {
      showTileInfo(selected, players);
    }
  }
}

function renderTileButton(tile, players, currentPlayerId) {
  var tileType = TILE_TYPES[tile.type] || TILE_TYPES.p;
  var owner = getPlayerById(players, tile.ownerPlayerId);
  var ownerColor = owner ? getPlayerColor(owner, owner.climate) : null;

  var isOwnedCapital = !!(
    owner &&
    tile.isCapital &&
    tile.capitalClimate &&
    owner.climate === tile.capitalClimate
  );

  var isSelected = !!(
    SELECTED_TILE &&
    SELECTED_TILE.row === tile.row &&
    SELECTED_TILE.col === tile.col
  );

  var left = 30 + tile.col * HEX_X_GAP + (tile.row % 2) * (HEX_X_GAP / 2);
  var top = 24 + tile.row * HEX_Y_GAP;

  var classes = ['hex-tile-btn'];

  if (owner) {
    classes.push('owned');
  }

  if (isOwnedCapital) {
    classes.push('capital');
  }

  if (isOwnedCapital && owner.id === currentPlayerId) {
    classes.push('current-capital');
  }

  if (isSelected) {
    classes.push('selected');
  }

  var style = '';
  style += 'left:' + left + 'px;';
  style += 'top:' + top + 'px;';
  style += '--tile-color:' + tileType.color + ';';
  style += '--tile-edge:' + tileType.edge + ';';

  if (ownerColor) {
    style += '--owner-strong:' + ownerColor + ';';
    style += '--owner-soft:' + rgbaFromHex(ownerColor, 0.55) + ';';
  } else {
    style += '--owner-strong:rgba(255,255,255,.25);';
    style += '--owner-soft:rgba(255,255,255,.10);';
  }

  var title = tileType.name + ' / ' + tile.row + '행 ' + tile.col + '열';

  if (owner) {
    title += ' / ' + owner.name + '의 영토';
  }

  var html = '';

  html += '<button type="button"';
  html += ' class="' + classes.join(' ') + '"';
  html += ' style="' + style + '"';
  html += ' data-row="' + tile.row + '"';
  html += ' data-col="' + tile.col + '"';
  html += ' title="' + safeText(title) + '"';
  html += ' aria-label="' + safeText(title) + '">';

  if (owner) {
    html += '<span class="hex-territory-line"></span>';
    html += '<span class="hex-territory-glow"></span>';
  }

  if (isSelected) {
    html += '<span class="hex-selection-pulse"></span>';
  }

  html += '<span class="hex-icon">' + tileType.icon + '</span>';
  html += '<span class="hex-yield">' + getYieldIcon(tile) + '</span>';

  if (tile.buildingId) {
    html += '<span class="hex-building-mark">' + getBuildingEmojiById(tile.buildingId) + '</span>';
  }

  if (isOwnedCapital) {
    html += '<span class="hex-owner-mark">' + safeText(owner.emoji || '👑') + '</span>';
  }

  html += '</button>';

  return html;
}

function getYieldIcon(tile) {
  var y = tile.yield || {};
  if (y.food) return '🌾';
  if (y.production) return '⚙️';
  if (y.gold) return '💰';
  if (y.science) return '🔬';
  if (y.culture) return '🎨';
  return '';
}

function renderCountryLabels(players) {
  if (!players || players.length === 0) return '';

  var html = '';

  players.forEach(function(player) {
    var ownedTiles = MAP_TILES.filter(function(tile) {
      return tile.ownerPlayerId === player.id;
    });

    if (ownedTiles.length === 0) return;

    var sumX = 0;
    var sumY = 0;

    ownedTiles.forEach(function(tile) {
      var left = 30 + tile.col * HEX_X_GAP + (tile.row % 2) * (HEX_X_GAP / 2);
      var top = 24 + tile.row * HEX_Y_GAP;
      sumX += left + HEX_W / 2;
      sumY += top + HEX_H / 2;
    });

    var cx = sumX / ownedTiles.length;
    var cy = sumY / ownedTiles.length;

    var color = getPlayerColor(player, player.climate);
    var label = player.country || player.name || '문명';

    if (label.length > 7) label = label.slice(0, 7) + '…';

    html += '<div class="hex-country-label"';
    html += ' style="left:' + cx + 'px;top:' + cy + 'px;--owner-strong:' + color + ';">';
    html += safeText(label);
    html += '</div>';
  });

  return html;
}

function bindButtonMapEvents(host) {
  if (!host || host._hexMapBound) return;

  host._hexMapBound = true;

  host.addEventListener('click', function(event) {
    var btn = event.target.closest('.hex-tile-btn');
    if (!btn) return;

    var row = parseInt(btn.getAttribute('data-row'), 10);
    var col = parseInt(btn.getAttribute('data-col'), 10);
    var tile = getTile(row, col);

    if (!tile) return;

    /*
      클릭 후 브라우저 기본 포커스 표시 제거.
      이상한 사각형 선이나 잔상처럼 보이는 선을 방지합니다.
    */
    if (typeof btn.blur === 'function') {
      btn.blur();
    }

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    selectTile(tile);
  });
}

function selectTile(tile) {
  ensureMapTiles();

  MAP_TILES.forEach(function(t) {
    t.selected = false;
  });

  tile.selected = true;
  SELECTED_TILE = tile;

  if (typeof G !== 'undefined') {
    G.selBuildTile = {
      row: tile.row,
      col: tile.col
    };
  }

  renderButtonHexMap(_mapLastPlayers || [], _mapLastCurId);
  showTileInfo(tile, _mapLastPlayers || []);
}

/* ─── 타일 정보 표시 ────────────────────────────── */
function showTileInfo(tile, players) {
  var box = document.getElementById('tileInfoBox');
  if (!box) return;

  var tileType = TILE_TYPES[tile.type] || TILE_TYPES.p;
  var owner = getPlayerById(players, tile.ownerPlayerId);
  var profile = CURRENT_MAP_PROFILE || getMapProfile();

  var isOwnedCapital = !!(
    owner &&
    tile.isCapital &&
    tile.capitalClimate &&
    owner.climate === tile.capitalClimate
  );

  var ownerText = owner
    ? safeText((owner.emoji || '👑') + ' ' + owner.name + ' / ' + owner.country)
    : '없음';

  var capitalText = isOwnedCapital
    ? safeText(getClimateEmoji(tile.capitalClimate) + ' ' + getClimateName(tile.capitalClimate) + ' 수도')
    : '아님';

  var buildableText = tile.buildable ? '가능' : '불가';

  var ownerPopText = owner && owner.population
    ? ' / 인구 ' + owner.population + '명 / 영토 반경 ' + getTerritoryRadiusForPlayer(owner)
    : '';

  box.innerHTML =
    '<div class="hex-info-title">🧭 선택한 타일</div>' +
    '<div>지도 유형: ' + safeText(profile.turnLabel + ' · ' + profile.label) + '</div>' +
    '<div>위치: ' + tile.row + '행 ' + tile.col + '열</div>' +
    '<div>지형: ' + safeText(tileType.icon + ' ' + tileType.name) + '</div>' +
    '<div>생산량: ' + safeText(formatYield(tile.yield)) + '</div>' +
    '<div>소유자: ' + ownerText + safeText(ownerPopText) + '</div>' +
    '<div>수도 여부: ' + capitalText + '</div>' +
    '<div>건설 가능: ' + buildableText + '</div>' +
    '<div>건물: ' + safeText(tile.buildingId || '없음') + '</div>' +
    '<div style="margin-top:8px;color:rgba(246,231,181,.68);font-size:12px;">' +
      '※ 영토는 인구에 따라 확장되며, 진한 국가색 선으로 표시됩니다.' +
    '</div>';
}
/* ─── 리사이즈 시 다시 그림 ─────────────────────── */
if (typeof window !== 'undefined') {
  window.addEventListener('resize', function() {
    var host = document.getElementById('worldMapButtonHost');
    if (host) renderButtonHexMap(_mapLastPlayers || [], _mapLastCurId);
  });
}
