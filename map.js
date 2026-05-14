/* =========================================================
   나라 경영 시뮬레이션 · map.js
   Canvas 기반 세계 지도 렌더링
   made by 박선생

   외부에서 호출하는 함수:
     scheduleMapDraw(players, currentPlayerId)
       - render() 후 DOM이 준비되면 자동 호출
       - canvasId = 'worldMap' 고정
========================================================= */

/* ─── 지도 상수 ──────────────────────────────────── */
var MAP_W = 760;
var MAP_H = 420;

/*
  6개 영토가 전체 지도 면적을 분할합니다.
  경계는 정규화 좌표(0~1)로 정의하며 실제 픽셀로 변환해 그립니다.

  냉대  │ 고산
  ──────┼──────────────
  온대  │ 건조 │ 계절풍
  ──────┴──────┴───────
       열대 (전폭)
*/

/* 영토 경계 그리기 함수들 (ctx, W, H 를 인자로 받음) */
var TERRITORY_DRAW = {

  cold: function(ctx, W, H) {
    /* 냉대: 상단 좌측 (시베리아·캐나다·북유럽) */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.50, 0);
    ctx.bezierCurveTo(W*0.52, H*0.08,  W*0.54, H*0.22, W*0.52, H*0.33);
    ctx.bezierCurveTo(W*0.44, H*0.36,  W*0.34, H*0.37, W*0.26, H*0.36);
    ctx.bezierCurveTo(W*0.16, H*0.36,  W*0.06, H*0.37, W*0,    H*0.36);
    ctx.closePath();
  },

  highland: function(ctx, W, H) {
    /* 고산: 상단 우측 (히말라야·티베트·안데스) */
    ctx.beginPath();
    ctx.moveTo(W * 0.50, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H * 0.33);
    ctx.bezierCurveTo(W*0.82, H*0.33,  W*0.66, H*0.33, W*0.52, H*0.33);
    ctx.bezierCurveTo(W*0.54, H*0.22,  W*0.52, H*0.08, W*0.50, 0);
    ctx.closePath();
  },

  temperate: function(ctx, W, H) {
    /* 온대: 좌측 중간 (서유럽·북아메리카 중위도) */
    ctx.beginPath();
    ctx.moveTo(0, H * 0.36);
    ctx.bezierCurveTo(W*0.06, H*0.37,  W*0.16, H*0.36, W*0.26, H*0.36);
    ctx.bezierCurveTo(W*0.28, H*0.46,  W*0.32, H*0.58, W*0.33, H*0.69);
    ctx.bezierCurveTo(W*0.22, H*0.70,  W*0.10, H*0.70, W*0,    H*0.68);
    ctx.closePath();
  },

  arid: function(ctx, W, H) {
    /* 건조: 중앙 (북아프리카·중동·중앙아시아) */
    ctx.beginPath();
    ctx.moveTo(W * 0.26, H * 0.36);
    ctx.bezierCurveTo(W*0.34, H*0.37,  W*0.44, H*0.36, W*0.52, H*0.33);
    ctx.bezierCurveTo(W*0.66, H*0.33,  W*0.70, H*0.36, W*0.72, H*0.40);
    ctx.bezierCurveTo(W*0.74, H*0.52,  W*0.70, H*0.64, W*0.62, H*0.69);
    ctx.bezierCurveTo(W*0.54, H*0.70,  W*0.44, H*0.70, W*0.33, H*0.69);
    ctx.bezierCurveTo(W*0.32, H*0.58,  W*0.28, H*0.46, W*0.26, H*0.36);
    ctx.closePath();
  },

  monsoon: function(ctx, W, H) {
    /* 계절풍: 우측 중간 (동아시아·인도·동남아) */
    ctx.beginPath();
    ctx.moveTo(W * 0.52, H * 0.33);
    ctx.lineTo(W, H * 0.33);
    ctx.lineTo(W, H * 0.69);
    ctx.bezierCurveTo(W*0.88, H*0.70,  W*0.76, H*0.70, W*0.62, H*0.69);
    ctx.bezierCurveTo(W*0.70, H*0.64,  W*0.74, H*0.52, W*0.72, H*0.40);
    ctx.bezierCurveTo(W*0.70, H*0.36,  W*0.66, H*0.33, W*0.52, H*0.33);
    ctx.closePath();
  },

  tropical: function(ctx, W, H) {
    /* 열대: 하단 전폭 (적도 아프리카·아마존·동남아) */
    ctx.beginPath();
    ctx.moveTo(0, H * 0.68);
    ctx.bezierCurveTo(W*0.10, H*0.70,  W*0.22, H*0.70, W*0.33, H*0.69);
    ctx.bezierCurveTo(W*0.44, H*0.70,  W*0.54, H*0.70, W*0.62, H*0.69);
    ctx.bezierCurveTo(W*0.76, H*0.70,  W*0.88, H*0.70, W,      H*0.69);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
  }
};

/* ─── 영토 베이스 색상 (플레이어 없을 때) ────────── */
var TERRITORY_BASE_COLOR = {
  cold:      { fill: '#0d1f38', stroke: '#1e3a5c' },
  highland:  { fill: '#18182e', stroke: '#2e2e56' },
  temperate: { fill: '#0c1e0e', stroke: '#1a3a1c' },
  arid:      { fill: '#2a1e06', stroke: '#4a3410' },
  monsoon:   { fill: '#0e2010', stroke: '#1c3e18' },
  tropical:  { fill: '#0a1e10', stroke: '#163a1e' }
};

/* ─── 지리적 특징 텍스처 (점·점선으로 표현) ──────── */
var GEO_FEATURES = [
  /* 산맥 */
  { type:'mountain', x:0.49, y:0.21, label:'▲' },
  { type:'mountain', x:0.52, y:0.16, label:'▲' },
  { type:'mountain', x:0.55, y:0.12, label:'▲' },
  { type:'mountain', x:0.14, y:0.22, label:'▲' },
  /* 사막 */
  { type:'desert',   x:0.35, y:0.50, label:'···' },
  { type:'desert',   x:0.42, y:0.55, label:'···' },
  /* 열대우림 */
  { type:'forest',   x:0.15, y:0.80, label:'🌿' },
  { type:'forest',   x:0.72, y:0.82, label:'🌿' },
  /* 바다 이름 */
  { type:'sea', x:0.08, y:0.55, label:'대서양' },
  { type:'sea', x:0.85, y:0.55, label:'태평양' },
  { type:'sea', x:0.46, y:0.86, label:'인도양' }
];

/* ─── 위도선·경도선 (장식용) ─────────────────────── */
var GRID_LINES = [
  /* 위도선 (가로) */
  { type:'lat', y:0.095, label:'60°N', dashed:false },
  { type:'lat', y:0.33,  label:'30°N', dashed:true  },
  { type:'lat', y:0.495, label:'적도', dashed:false  },
  { type:'lat', y:0.69,  label:'30°S', dashed:true  }
];

/* ─── 유틸리티 ───────────────────────────────────── */
function hexToRgb(hex) {
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

function rgbaFromHex(hex, alpha) {
  var rgb = hexToRgb(hex);
  return 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha+')';
}

/* ─── 메인 드로우 함수 ───────────────────────────── */
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Array}  players         - G.players 배열
 * @param {number} currentPlayerId - 현재 플레이어 id (하이라이트용, null이면 전체 순위 표시)
 */
function drawWorldMap(canvas, players, currentPlayerId) {
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W   = canvas.width;
  var H   = canvas.height;

  ctx.clearRect(0, 0, W, H);

  /* 플레이어 → 기후 매핑 */
  var playerByClimate = {};
  if (players) {
    players.forEach(function(p) {
      playerByClimate[p.climate] = p;
    });
  }

  /* ① 해양 배경 */
  drawOcean(ctx, W, H);

  /* ② 위도·경도선 */
  drawGrid(ctx, W, H);

  /* ③ 영토 (뒤에서 앞으로) */
  var climateOrder = ['cold','highland','temperate','arid','monsoon','tropical'];
  climateOrder.forEach(function(cid) {
    drawTerritory(ctx, W, H, cid, playerByClimate[cid]);
  });

  /* ④ 영토 경계선 (위에 덧그림) */
  drawBorders(ctx, W, H);

  /* ⑤ 지리적 레이블 */
  drawGeoLabels(ctx, W, H);

  /* ⑥ 플레이어 마커 */
  climateOrder.forEach(function(cid) {
    var p = playerByClimate[cid];
    if (p) drawPlayerMarker(ctx, W, H, p, p.id === currentPlayerId);
  });

  /* ⑦ 비어있는 영토 레이블 */
  climateOrder.forEach(function(cid) {
    if (!playerByClimate[cid]) drawEmptyLabel(ctx, W, H, cid);
  });

  /* ⑧ 범례 */
  drawLegend(ctx, W, H, players);

  /* ⑨ 워터마크 */
  ctx.font = '10px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.textAlign = 'right';
  ctx.fillText('made by 박선생', W-8, H-6);
}

/* ─── 해양 배경 ──────────────────────────────────── */
function drawOcean(ctx, W, H) {
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   '#04101e');
  grad.addColorStop(0.5, '#061426');
  grad.addColorStop(1,   '#081832');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  /* 해양 반짝임 효과 */
  ctx.globalAlpha = 0.04;
  for (var i = 0; i < 8; i++) {
    var gx = ctx.createLinearGradient(0, (H/8)*i, W, (H/8)*(i+1));
    gx.addColorStop(0,   'rgba(100,160,255,0)');
    gx.addColorStop(0.5, 'rgba(100,160,255,0.6)');
    gx.addColorStop(1,   'rgba(100,160,255,0)');
    ctx.fillStyle = gx;
    ctx.fillRect(0, (H/8)*i, W, H/8);
  }
  ctx.globalAlpha = 1;
}

/* ─── 위도·경도선 ────────────────────────────────── */
function drawGrid(ctx, W, H) {
  ctx.save();
  ctx.strokeStyle = 'rgba(100,140,200,0.12)';
  ctx.lineWidth   = 0.8;

  /* 위도선 */
  GRID_LINES.forEach(function(gl) {
    ctx.setLineDash(gl.dashed ? [4,6] : []);
    ctx.beginPath();
    ctx.moveTo(0, H * gl.y);
    ctx.lineTo(W, H * gl.y);
    ctx.stroke();

    /* 레이블 */
    ctx.setLineDash([]);
    ctx.font       = '9px sans-serif';
    ctx.fillStyle  = 'rgba(120,160,220,0.45)';
    ctx.textAlign  = 'left';
    ctx.fillText(gl.label, 4, H * gl.y - 2);
  });

  /* 경도선 */
  ctx.setLineDash([3, 7]);
  ctx.strokeStyle = 'rgba(100,140,200,0.08)';
  [0.15, 0.30, 0.45, 0.60, 0.75, 0.88].forEach(function(x) {
    ctx.beginPath();
    ctx.moveTo(W * x, 0);
    ctx.lineTo(W * x, H);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.restore();
}

/* ─── 영토 채우기 ────────────────────────────────── */
function drawTerritory(ctx, W, H, climateId, player) {
  var base = TERRITORY_BASE_COLOR[climateId];
  var cl   = CLIMATES[climateId];
  var draw = TERRITORY_DRAW[climateId];
  if (!draw) return;

  ctx.save();

  /* 기본 채우기 */
  draw(ctx, W, H);
  ctx.fillStyle = base.fill;
  ctx.fill();

  /* 플레이어 색상 오버레이 */
  if (player) {
    draw(ctx, W, H);
    var grad = ctx.createRadialGradient(
      cl.mapX * (W/MAP_W), cl.mapY * (H/MAP_H), 10,
      cl.mapX * (W/MAP_W), cl.mapY * (H/MAP_H), W * 0.30
    );
    grad.addColorStop(0,   rgbaFromHex(player.color, 0.38));
    grad.addColorStop(0.6, rgbaFromHex(player.color, 0.18));
    grad.addColorStop(1,   rgbaFromHex(player.color, 0.04));
    ctx.fillStyle = grad;
    ctx.fill();
  }

  /* 기후 고유 텍스처 패턴 */
  drawClimateTexture(ctx, W, H, climateId, cl, player);

  ctx.restore();
}

/* ─── 기후 텍스처 ────────────────────────────────── */
function drawClimateTexture(ctx, W, H, cid, cl, player) {
  var cx = cl.mapX * (W / MAP_W);
  var cy = cl.mapY * (H / MAP_H);
  var alpha = player ? 0.18 : 0.10;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font        = '11px sans-serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  var patterns = {
    cold:      ['❄','❄','❄','❄'],
    highland:  ['▲','▲','▲'],
    temperate: ['·','·','·','·'],
    arid:      ['·','·','·'],
    monsoon:   ['〜','〜','〜'],
    tropical:  ['🌿','🌿','🌿']
  };
  var pat = patterns[cid] || [];
  var offsets = [
    [-30,-20],[20,-15],[-15,18],[25,22],[0,-5],[-20,5],[30,-5]
  ];
  for (var i = 0; i < Math.min(pat.length, offsets.length); i++) {
    ctx.globalAlpha = alpha * (0.7 + Math.random() * 0.3);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(pat[i], cx + offsets[i][0]*W/MAP_W, cy + offsets[i][1]*H/MAP_H);
  }

  ctx.restore();
}

/* ─── 영토 경계선 ────────────────────────────────── */
function drawBorders(ctx, W, H) {
  ctx.save();
  ctx.lineWidth   = 1.2;
  ctx.strokeStyle = 'rgba(200,220,255,0.20)';
  ctx.setLineDash([]);

  Object.keys(TERRITORY_DRAW).forEach(function(cid) {
    TERRITORY_DRAW[cid](ctx, W, H);
    ctx.stroke();
  });

  /* 해안선 강조 */
  ctx.lineWidth   = 0.6;
  ctx.strokeStyle = 'rgba(100,160,255,0.30)';
  Object.keys(TERRITORY_DRAW).forEach(function(cid) {
    TERRITORY_DRAW[cid](ctx, W, H);
    ctx.stroke();
  });

  ctx.restore();
}

/* ─── 지리 레이블 (바다 이름 등) ─────────────────── */
function drawGeoLabels(ctx, W, H) {
  ctx.save();
  ctx.font        = '9px sans-serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  GEO_FEATURES.forEach(function(f) {
    var x = f.x * W;
    var y = f.y * H;
    if (f.type === 'sea') {
      ctx.fillStyle = 'rgba(100,150,220,0.35)';
      ctx.font = 'italic 9px sans-serif';
      ctx.fillText(f.label, x, y);
    } else if (f.type === 'mountain') {
      ctx.fillStyle = 'rgba(200,200,220,0.30)';
      ctx.font = '10px sans-serif';
      ctx.fillText(f.label, x, y);
    } else if (f.type === 'desert') {
      ctx.fillStyle = 'rgba(200,180,100,0.22)';
      ctx.font = '9px sans-serif';
      ctx.fillText(f.label, x, y);
    }
  });

  ctx.restore();
}

/* ─── 비어있는 영토 레이블 ───────────────────────── */
function drawEmptyLabel(ctx, W, H, cid) {
  var cl = CLIMATES[cid];
  var x  = cl.mapX * (W / MAP_W);
  var y  = cl.mapY * (H / MAP_H);

  ctx.save();
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  /* 기후 이모지 (작게) */
  ctx.font      = '16px sans-serif';
  ctx.globalAlpha = 0.35;
  ctx.fillText(cl.emoji, x, y);

  /* 기후 이름 */
  ctx.font        = '9px sans-serif';
  ctx.fillStyle   = 'rgba(180,180,200,0.40)';
  ctx.globalAlpha = 1;
  ctx.fillText(cl.name + ' 기후', x, y + 16);

  ctx.restore();
}

/* ─── 플레이어 마커 ──────────────────────────────── */
function drawPlayerMarker(ctx, W, H, player, isHighlight) {
  var cl = CLIMATES[player.climate];
  var cx = cl.mapX * (W / MAP_W);
  var cy = cl.mapY * (H / MAP_H);

  ctx.save();

  /* 하이라이트 펄스 링 */
  if (isHighlight) {
    var t   = (Date.now() % 2000) / 2000;
    var rad = 28 + t * 18;
    var rg  = ctx.createRadialGradient(cx, cy, rad*0.5, cx, cy, rad);
    rg.addColorStop(0,   rgbaFromHex(player.color, 0.4 * (1-t)));
    rg.addColorStop(1,   rgbaFromHex(player.color, 0));
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI*2);
    ctx.fill();
  }

  /* 영토 원형 배경 */
  var markerR = isHighlight ? 28 : 24;
  ctx.shadowColor = player.color;
  ctx.shadowBlur  = isHighlight ? 18 : 10;
  ctx.beginPath();
  ctx.arc(cx, cy, markerR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8,9,26,0.82)';
  ctx.fill();
  ctx.lineWidth   = isHighlight ? 2.5 : 1.8;
  ctx.strokeStyle = player.color;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  /* 플레이어 이모지 */
  ctx.font        = (isHighlight ? '16px' : '14px') + ' sans-serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.emoji, cx, cy);

  /* 정보 카드 (마커 아래) */
  drawInfoCard(ctx, W, H, cx, cy + markerR + 4, player, isHighlight);

  ctx.restore();
}

/* ─── 플레이어 정보 카드 ─────────────────────────── */
function drawInfoCard(ctx, W, H, cx, topY, player, isHighlight) {
  var cardW = isHighlight ? 110 : 96;
  var cardH = 44;
  var x     = cx - cardW / 2;
  var y     = topY;

  /* 화면 밖으로 나가지 않도록 조정 */
  if (x < 2)         x = 2;
  if (x + cardW > W - 2) x = W - cardW - 2;
  if (y + cardH > H - 2) y = topY - cardH - 48;

  ctx.save();

  /* 카드 배경 */
  ctx.fillStyle = 'rgba(8,9,26,0.88)';
  roundRect(ctx, x, y, cardW, cardH, 5);
  ctx.fill();

  ctx.lineWidth   = isHighlight ? 1.5 : 1;
  ctx.strokeStyle = rgbaFromHex(player.color, isHighlight ? 0.8 : 0.45);
  roundRect(ctx, x, y, cardW, cardH, 5);
  ctx.stroke();

  /* 플레이어 이름 */
  ctx.font        = 'bold 9px sans-serif';
  ctx.fillStyle   = isHighlight ? player.color : '#e8dfc8';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'top';
  var name = player.name.length > 7 ? player.name.slice(0,7) + '…' : player.name;
  ctx.fillText(name, x + cardW/2, y + 4);

  /* 나라 이름 */
  ctx.font      = '8px sans-serif';
  ctx.fillStyle = rgbaFromHex(player.color, 0.75);
  var country = player.country.length > 8 ? player.country.slice(0,8)+'…' : player.country;
  ctx.fillText(country, x + cardW/2, y + 15);

  /* 종합 국력 */
  ctx.font      = 'bold 11px sans-serif';
  ctx.fillStyle = '#f0c040';
  ctx.fillText('★ ' + (player.scores ? player.scores.total : 0), x + cardW/2, y + 26);

  /* 자원 미니바 */
  drawMiniResBar(ctx, x + 6, y + 38, cardW - 12, player);

  ctx.restore();
}

/* ─── 자원 미니바 ────────────────────────────────── */
function drawMiniResBar(ctx, x, y, w, player) {
  var res    = player.resources || {};
  var items  = [
    { key:'food',       color:'#60d060', val: Math.floor(res.food       || 0) },
    { key:'gold',       color:'#f0c040', val: Math.floor(res.gold       || 0) },
    { key:'production', color:'#80aac8', val: Math.floor(res.production || 0) },
    { key:'science',    color:'#50a8e8', val: Math.floor(res.science    || 0) },
    { key:'culture',    color:'#b050e8', val: Math.floor(res.culture    || 0) }
  ];

  var maxVal = Math.max.apply(null, items.map(function(i){ return i.val; }).concat([1]));
  var segW   = (w - (items.length - 1) * 2) / items.length;

  ctx.save();
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  items.forEach(function(item, idx) {
    var sx  = x + idx * (segW + 2);
    var pct = Math.min(1, item.val / maxVal);
    var bh  = 3;
    var by  = y - bh;

    /* 배경 */
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(sx, by, segW, bh);

    /* 값 바 */
    ctx.fillStyle = item.color;
    ctx.fillRect(sx, by, segW * pct, bh);
  });

  ctx.restore();
}

/* ─── 범례 ───────────────────────────────────────── */
function drawLegend(ctx, W, H, players) {
  if (!players || players.length === 0) return;

  /* 점수 순위 미니 리스트 */
  var sorted = players.slice().sort(function(a,b){
    return (b.scores ? b.scores.total : 0) - (a.scores ? a.scores.total : 0);
  });

  var legendW = 130;
  var legendH = 14 + sorted.length * 16;
  var lx = W - legendW - 6;
  var ly = H - legendH - 6;

  ctx.save();

  /* 배경 */
  ctx.fillStyle = 'rgba(6,8,20,0.82)';
  roundRect(ctx, lx, ly, legendW, legendH, 5);
  ctx.fill();

  ctx.lineWidth   = 0.8;
  ctx.strokeStyle = 'rgba(240,192,64,0.22)';
  roundRect(ctx, lx, ly, legendW, legendH, 5);
  ctx.stroke();

  /* 제목 */
  ctx.font        = 'bold 9px sans-serif';
  ctx.fillStyle   = 'rgba(240,192,64,0.7)';
  ctx.textAlign   = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('🏆 국력 순위', lx + 7, ly + 4);

  /* 각 플레이어 */
  sorted.forEach(function(p, idx) {
    var ry = ly + 14 + idx * 16;
    var total = p.scores ? p.scores.total : 0;
    var maxTotal = sorted[0].scores ? sorted[0].scores.total : 1;

    /* 바 배경 */
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(lx+7, ry+3, legendW-14, 9);

    /* 바 값 */
    var barW = Math.max(4, (legendW-14) * (total / Math.max(maxTotal, 1)));
    ctx.fillStyle = rgbaFromHex(p.color, 0.65);
    ctx.fillRect(lx+7, ry+3, barW, 9);

    /* 텍스트: 순위 + 이름 + 점수 */
    ctx.font        = '8px sans-serif';
    ctx.fillStyle   = '#e8dfc8';
    ctx.textAlign   = 'left';
    ctx.textBaseline = 'middle';
    var label = (idx+1)+'. '+p.emoji+' '+(p.name.length>5?p.name.slice(0,5)+'…':p.name);
    ctx.fillText(label, lx+9, ry+7);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f0c040';
    ctx.fillText(total, lx + legendW - 4, ry + 7);
  });

  ctx.restore();
}

/* ─── roundRect 헬퍼 ─────────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ─── 외부 진입점 ────────────────────────────────── */

var _mapAnimId = null;
var _mapLastPlayers = null;
var _mapLastCurId   = null;

/**
 * render() 호출 직후 사용.
 * DOM에 canvas#worldMap 이 삽입된 뒤 그림을 그립니다.
 * highlight=true 면 currentPlayerId 영토에 펄스 애니메이션 적용.
 *
 * @param {Array}  players
 * @param {number|null} currentPlayerId
 */
function scheduleMapDraw(players, currentPlayerId) {
  /* 이전 애니메이션 루프 중단 */
  if (_mapAnimId) {
    cancelAnimationFrame(_mapAnimId);
    _mapAnimId = null;
  }

  _mapLastPlayers = players ? players.slice() : [];
  _mapLastCurId   = currentPlayerId != null ? currentPlayerId : null;

  /* 펄스 애니메이션이 필요한 경우 (현재 플레이어 있음) */
  var animate = (currentPlayerId != null);

  function loop() {
    var canvas = document.getElementById('worldMap');
    if (!canvas) return; /* 화면이 바뀌었으면 중단 */
    drawWorldMap(canvas, _mapLastPlayers, _mapLastCurId);
    if (animate) {
      _mapAnimId = requestAnimationFrame(loop);
    }
  }

  /* DOM 업데이트 후 첫 프레임 */
  requestAnimationFrame(function() {
    var canvas = document.getElementById('worldMap');
    if (!canvas) return;
    loop();
  });
}

/**
 * 애니메이션 없이 1회만 그리기 (이벤트·요약 화면용)
 */
function drawMapOnce(players) {
  scheduleMapDraw(players, null);
}
