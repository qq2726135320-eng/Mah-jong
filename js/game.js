/* ===== 牌库 ===== */
const tilesPool = [
  '1万','2万','3万','4万','5万','6万','7万','8万','9万',
  '1条','2条','3条','4条','5条','6条','7条','8条','9条',
  '1筒','2筒','3筒','4筒','5筒','6筒','7筒','8筒','9筒'
];

const handEl = document.getElementById('my-hand');
const tableEl = document.getElementById('table');
const statusEl = document.getElementById('status');
const dingqueEl = document.getElementById('dingque');

let selectedTile = null;

/* ===== 工具 ===== */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* ===== 发牌 ===== */
function deal() {
  const hand = shuffle([...tilesPool]).slice(0, 13);
  handEl.innerHTML = '';

  hand.forEach(text => {
    const tile = document.createElement('div');
    tile.className = 'tile hand';
    tile.innerText = text;
    handEl.appendChild(tile);
  });
}

/* ===== 点牌 / 出牌 ===== */
handEl.addEventListener('click', e => {
  const tile = e.target;
  if (!tile.classList.contains('hand')) return;

  if (tile === selectedTile) {
    playTile(tile);
    selectedTile = null;
    return;
  }

  document.querySelectorAll('.tile.hand')
    .forEach(t => t.classList.remove('selected'));

  tile.classList.add('selected');
  selectedTile = tile;
});

function playTile(tile) {
  tile.classList.remove('selected');
  tile.classList.add('played');
  tableEl.appendChild(tile);
  statusEl.innerText = '等待其他玩家…';

  setTimeout(() => {
    statusEl.innerText = '轮到你出牌';
  }, 600);
}

/* ===== 定缺 ===== */
document.querySelectorAll('#dingque button').forEach(btn => {
  btn.onclick = () => {
    dingqueEl.style.display = 'none';
    statusEl.innerText = `你定缺：${btn.dataset.type}`;
  };
});

/* ===== 初始化 ===== */
deal();
