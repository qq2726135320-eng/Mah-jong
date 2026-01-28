const tiles = [
  '1万','2万','3万','4万','5万','6万','7万','8万','9万',
  '1条','2条','3条','4条','5条','6条','7条','8条','9条',
  '1筒','2筒','3筒','4筒','5筒','6筒','7筒','8筒','9筒'
];

const handEl = document.getElementById('my-hand');
const table = document.getElementById('table');
const status = document.getElementById('status');

let selected = null;

/* 洗牌 */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

/* 发牌 */
function deal() {
  const hand = shuffle([...tiles]).slice(0, 13);
  hand.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tile hand';
    el.innerText = t;
    handEl.appendChild(el);
  });
}

/* 点牌 / 出牌 */
handEl.addEventListener('click', e => {
  const tile = e.target;
  if (!tile.classList.contains('hand')) return;

  if (tile === selected) {
    play(tile);
    selected = null;
    return;
  }

  document.querySelectorAll('.tile.hand')
    .forEach(t => t.classList.remove('selected'));

  tile.classList.add('selected');
  selected = tile;
});

function play(tile) {
  tile.classList.remove('selected');
  tile.classList.add('played');
  table.appendChild(tile);
}

/* 定缺 */
document.querySelectorAll('#dingque button').forEach(btn => {
  btn.onclick = () => {
    document.getElementById('dingque').style.display = 'none';
    status.innerText = `你定缺：${btn.dataset.type}`;
  };
});

/* 初始化 */
deal();

