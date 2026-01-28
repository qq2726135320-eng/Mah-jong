class MahjongGame {
    constructor() {
        // DOM 元素
        this.elements = {
            app: document.getElementById('app'),
            status: document.getElementById('status'),
            table: document.getElementById('table'),
            deckCount: document.getElementById('deck-count'),
            currentTurn: document.getElementById('current-turn'),
            timer: document.getElementById('timer'),
            
            // 玩家手牌区域
            myHand: document.getElementById('my-hand'),
            topHand: document.getElementById('top-hand'),
            leftHand: document.getElementById('left-hand'),
            rightHand: document.getElementById('right-hand'),
            
            // 已出牌区域
            myPlayed: document.getElementById('my-played'),
            topPlayed: document.getElementById('top-played'),
            leftPlayed: document.getElementById('left-played'),
            rightPlayed: document.getElementById('right-played'),
            
            // 操作按钮
            btnChi: document.getElementById('btn-chi'),
            btnPeng: document.getElementById('btn-peng'),
            btnGang: document.getElementById('btn-gang'),
            btnHu: document.getElementById('btn-hu'),
            btnPass: document.getElementById('btn-pass'),
            btnSort: document.getElementById('btn-sort'),
            
            // 控制按钮
            btnVoice: document.getElementById('btn-voice'),
            btnSettings: document.getElementById('btn-settings'),
            btnEmojis: document.getElementById('btn-emojis'),
            
            // 模态框
            dingque: document.getElementById('dingque'),
            winModal: document.getElementById('win-modal'),
            settingsMenu: document.getElementById('settings-menu'),
            emojiPanel: document.getElementById('emoji-panel'),
            
            // 音频
            soundDraw: document.getElementById('sound-draw'),
            soundPlay: document.getElementById('sound-play'),
            soundWin: document.getElementById('sound-win')
        };
        
        // 游戏状态
        this.state = {
            tilesPool: this.generateTilesPool(),
            players: {
                self: { tiles: [], played: [], score: 0 },
                top: { tiles: [], played: [], score: 0 },
                left: { tiles: [], played: [], score: 0 },
                right: { tiles: [], played: [], score: 0 }
            },
            currentPlayer: 'self',
            selectedTile: null,
            dingqueType: null,
            remainingTiles: 84,
            gameStarted: false,
            timerInterval: null,
            gameTime: 0,
            settings: {
                sound: true,
                vibration: true,
                autoSort: true
            }
        };
        
        // 初始化游戏
        this.init();
    }
    
    generateTilesPool() {
        const tiles = [];
        const types = ['万', '条', '筒'];
        const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        // 每种牌4张
        for (let i = 0; i < 4; i++) {
            types.forEach(type => {
                numbers.forEach(num => {
                    tiles.push(num + type);
                });
            });
        }
        
        return this.shuffle(tiles);
    }
    
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    init() {
        this.setupEventListeners();
        this.startNewGame();
        this.updateTimer();
    }
    
    setupEventListeners() {
        // 手牌点击事件
        this.elements.myHand.addEventListener('click', (e) => {
            const tile = e.target;
            if (tile.classList.contains('tile') && !tile.classList.contains('back')) {
                this.selectTile(tile);
            }
        });
        
        // 操作按钮事件
        this.elements.btnChi.addEventListener('click', () => this.chi());
        this.elements.btnPeng.addEventListener('click', () => this.peng());
        this.elements.btnGang.addEventListener('click', () => this.gang());
        this.elements.btnHu.addEventListener('click', () => this.hu());
        this.elements.btnPass.addEventListener('click', () => this.pass());
        this.elements.btnSort.addEventListener('click', () => this.sortHand());
        
        // 定缺按钮
        document.querySelectorAll('.dingque-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDingque(e.target.closest('.dingque-btn').dataset.type);
            });
        });
        
        // 控制按钮
        this.elements.btnVoice.addEventListener('click', () => this.toggleVoice());
        this.elements.btnSettings.addEventListener('click', () => this.showSettings());
        this.elements.btnEmojis.addEventListener('click', () => this.showEmojiPanel());
        
        // 模态框关闭按钮
        document.getElementById('btn-close-settings').addEventListener('click', () => this.hideSettings());
        document.getElementById('btn-close-emoji').addEventListener('click', () => this.hideEmojiPanel());
        document.getElementById('btn-next').addEventListener('click', () => this.nextGame());
        
        // 设置开关
        document.getElementById('sound-switch').addEventListener('change', (e) => {
            this.state.settings.sound = e.target.checked;
        });
        
        document.getElementById('vibration-switch').addEventListener('change', (e) => {
            this.state.settings.vibration = e.target.checked;
        });
        
        document.getElementById('auto-sort-switch').addEventListener('change', (e) => {
            this.state.settings.autoSort = e.target.checked;
        });
        
        // 表情按钮
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.sendEmoji(e.target.textContent));
        });
    }
    
    startNewGame() {
        this.resetGame();
        this.dealTiles();
        this.showDingque();
        this.startTimer();
        this.updateStatus('新游戏开始，请选择定缺花色');
    }
    
    resetGame() {
        this.state.tilesPool = this.generateTilesPool();
        this.state.remainingTiles = 84;
        this.state.dingqueType = null;
        this.state.selectedTile = null;
        this.state.currentPlayer = 'self';
        
        // 清空所有牌
        Object.values(this.elements).forEach(el => {
            if (el && el.classList && (el.classList.contains('tiles') || el.classList.contains('played-tiles'))) {
                el.innerHTML = '';
            }
        });
        
        // 更新剩余牌数
        this.updateDeckCount();
        
        // 重置操作按钮
        this.setActionButtons(false);
    }
    
    dealTiles() {
        // 每个玩家发13张牌
        const players = ['self', 'top', 'left', 'right'];
        players.forEach(player => {
            this.state.players[player].tiles = this.state.tilesPool.splice(0, 13);
            this.renderPlayerTiles(player);
        });
        
        // 播放发牌音效
        if (this.state.settings.sound) {
            this.elements.soundDraw.currentTime = 0;
            this.elements.soundDraw.play();
        }
    }
    
    renderPlayerTiles(player) {
        const tiles = this.state.players[player].tiles;
        const handEl = this.elements[player + 'Hand'];
        
        handEl.innerHTML = '';
        
        tiles.forEach((tileText, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile hand';
            tile.dataset.index = index;
            tile.dataset.player = player;
            
            if (player === 'self') {
                tile.textContent = tileText;
                tile.classList.add(tileText.includes('万') ? 'wan' : 
                                 tileText.includes('条') ? 'tiao' : 'tong');
            } else {
                tile.classList.add('back');
            }
            
            handEl.appendChild(tile);
        });
        
        // 自动理牌
        if (player === 'self' && this.state.settings.autoSort) {
            this.sortHand();
        }
    }
    
    showDingque() {
        this.elements.dingque.style.display = 'flex';
    }
    
    selectDingque(type) {
        this.state.dingqueType = type;
        this.elements.dingque.style.display = 'none';
        this.updateStatus(`您选择了定缺: ${type}子`);
        this.startGamePlay();
    }
    
    startGamePlay() {
        this.state.gameStarted = true;
        this.updateStatus('轮到你出牌');
        this.setCurrentTurn('self');
    }
    
    selectTile(tile) {
        // 取消之前的选择
        if (this.state.selectedTile) {
            this.state.selectedTile.classList.remove('selected');
        }
        
        // 选中新牌
        tile.classList.add('selected');
        this.state.selectedTile = tile;
        
        // 显示操作提示
        this.updateStatus('点击选中的牌可以打出');
    }
    
    playTile() {
        if (!this.state.selectedTile || this.state.currentPlayer !== 'self') return;
        
        const tile = this.state.selectedTile;
        const tileIndex = parseInt(tile.dataset.index);
        const player = tile.dataset.player;
        
        // 从手牌中移除
        const tileText = this.state.players[player].tiles[tileIndex];
        this.state.players[player].tiles.splice(tileIndex, 1);
        
        // 添加到已出牌
        this.state.players[player].played.push(tileText);
        
        // 渲染已出牌
        this.renderPlayedTile(player, tileText);
        
        // 重新渲染手牌
        this.renderPlayerTiles(player);
        
        // 播放音效
        if (this.state.settings.sound) {
            this.elements.soundPlay.currentTime = 0;
            this.elements.soundPlay.play();
        }
        
        // 震动反馈
        if (this.state.settings.vibration && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 轮到下一位玩家
        this.nextPlayer();
        this.state.selectedTile = null;
        
        // 减少剩余牌数
        this.state.remainingTiles--;
        this.updateDeckCount();
        
        // 检查是否可吃碰杠
        this.checkAvailableActions();
    }
    
    renderPlayedTile(player, tileText) {
        const playedEl = this.elements[player + 'Played'];
        const tile = document.createElement('div');
        tile.className = 'tile played';
        tile.textContent = tileText;
        
        // 添加花色类
        if (tileText.includes('万')) tile.classList.add('wan');
        if (tileText.includes('条')) tile.classList.add('tiao');
        if (tileText.includes('筒')) tile.classList.add('tong');
        
        // 标记为最新出的牌
        playedEl.querySelectorAll('.tile').forEach(t => t.classList.remove('latest'));
        tile.classList.add('latest');
        
        playedEl.appendChild(tile);
    }
    
    nextPlayer() {
        const players = ['self', 'top', 'left', 'right'];
        const currentIndex = players.indexOf(this.state.currentPlayer);
        const nextIndex = (currentIndex + 1) % 4;
        
        this.state.currentPlayer = players[nextIndex];
        this.setCurrentTurn(this.state.currentPlayer);
        
        if (this.state.currentPlayer === 'self') {
            this.updateStatus('轮到你出牌');
            this.drawTile();
        } else {
            this.updateStatus(`${this.getPlayerName(this.state.currentPlayer)}正在思考...`);
            this.simulateAIPlay();
        }
    }
    
    setCurrentTurn(player) {
        // 更新当前回合指示器位置
        const positions = {
            self: { bottom: '100px', left: '50%' },
            top: { top: '50px', left: '50%' },
            left: { top: '50%', left: '10px' },
            right: { top: '50%', right: '10px' }
        };
        
        const pos = positions[player];
        Object.assign(this.elements.currentTurn.style, pos);
    }
    
    drawTile() {
        if (this.state.tilesPool.length === 0) {
            this.endGame();
            return;
        }
        
        // 摸一张牌
        const newTile = this.state.tilesPool.shift();
        this.state.players.self.tiles.push(newTile);
        
        // 重新渲染手牌
        this.renderPlayerTiles('self');
        
        // 更新状态
        this.updateStatus(`摸到: ${newTile}`);
        
        // 播放音效
        if (this.state.settings.sound) {
            this.elements.soundDraw.currentTime = 0;
            this.elements.soundDraw.play();
        }
        
        // 检查是否可胡
        if (this.checkHu()) {
            this.setActionButtons(true, false, false, true, true);
        } else {
            this.setActionButtons(false);
        }
    }
    
    simulateAIPlay() {
        // 模拟AI玩家思考时间
        setTimeout(() => {
            const player = this.state.currentPlayer;
            const tiles = this.state.players[player].tiles;
            
            // 随机选择一张牌打出
            const randomIndex = Math.floor(Math.random() * tiles.length);
            const tileText = tiles[randomIndex];
            
            // 从手牌移除
            this.state.players[player].tiles.splice(randomIndex, 1);
            this.state.players[player].played.push(tileText);
            
            // 渲染已出牌
            this.renderPlayedTile(player, tileText);
            
            // 减少剩余牌数
            this.state.remainingTiles--;
            this.updateDeckCount();
            
            // 轮到下一位玩家
            this.nextPlayer();
        }, 1000);
    }
    
    checkHu() {
        // 简化版胡牌检查（实际需要完整的麻将规则）
        const tiles = this.state.players.self.tiles;
        return tiles.length >= 14; // 这里只是示例
    }
    
    checkAvailableActions() {
        // 检查是否可以吃碰杠（简化版）
        const canPeng = Math.random() > 0.7;
        const canGang = Math.random() > 0.8;
        const canChi = Math.random() > 0.6;
        
        this.setActionButtons(canChi, canPeng, canGang, false, true);
    }
    
    setActionButtons(chi = false, peng = false, gang = false, hu = false, pass = false) {
        this.elements.btnChi.disabled = !chi;
        this.elements.btnPeng.disabled = !peng;
        this.elements.btnGang.disabled = !gang;
        this.elements.btnHu.disabled = !hu;
        this.elements.btnPass.disabled = !pass;
    }
    
    chi() {
        this.updateStatus('执行了吃牌操作');
        this.setActionButtons(false);
        this.nextPlayer();
    }
    
    peng() {
        this.updateStatus('执行了碰牌操作');
        this.setActionButtons(false);
        this.nextPlayer();
    }
    
    gang() {
        this.updateStatus('执行了杠牌操作');
        this.setActionButtons(false);
        this.nextPlayer();
    }
    
    hu() {
        this.showWinModal();
        this.playWinSound();
    }
    
    pass() {
        this.updateStatus('选择了过');
        this.setActionButtons(false);
        this.nextPlayer();
    }
    
    sortHand() {
        const tiles = this.state.players.self.tiles;
        
        // 按花色和数字排序
        tiles.sort((a, b) => {
            const typeOrder = { '万': 1, '条': 2, '筒': 3 };
            const typeA = a.charAt(a.length - 1);
            const typeB = b.charAt(b.length - 1);
            const numA = parseInt(a);
            const numB = parseInt(b);
            
            if (typeOrder[typeA] !== typeOrder[typeB]) {
                return typeOrder[typeA] - typeOrder[typeB];
            }
            return numA - numB;
        });
        
        this.renderPlayerTiles('self');
        this.updateStatus('手牌已整理');
    }
    
    showWinModal() {
        // 计算得分
        const score = Math.floor(Math.random() * 50) + 10;
        document.querySelector('.score-change').textContent = `+${score} `;
        
        this.elements.winModal.style.display = 'flex';
        this.stopTimer();
    }
    
    playWinSound() {
        if (this.state.settings.sound) {
            this.elements.soundWin.currentTime = 0;
            this.elements.soundWin.play();
        }
    }
    
    nextGame() {
        this.elements.winModal.style.display = 'none';
        this.startNewGame();
    }
    
    updateStatus(text) {
        this.elements.status.textContent = text;
    }
    
    updateDeckCount() {
        this.elements.deckCount.textContent = `剩余: ${this.state.remainingTiles}张`;
    }
    
    updateTimer() {
        this.state.timerInterval = setInterval(() => {
            this.state.gameTime++;
            const minutes = Math.floor(this.state.gameTime / 60);
            const seconds = this.state.gameTime % 60;
            this.elements.timer.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    startTimer() {
        this.state.gameTime = 0;
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }
        this.updateTimer();
    }
    
    stopTimer() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
        }
    }
    
    getPlayerName(player) {
        const names = {
            self: '我',
            top: '玩家A',
            left: '玩家B',
            right: '玩家C'
        };
        return names[player];
    }
    
    toggleVoice() {
        this.state.settings.sound = !this.state.settings.sound;
        const icon = this.elements.btnVoice.querySelector('i');
        icon.className = this.state.settings.sound ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        this.updateStatus(this.state.settings.sound ? '音效已开启' : '音效已关闭');
    }
    
    showSettings() {
        this.elements.settingsMenu.style.display = 'flex';
    }
    
    hideSettings() {
        this.elements.settingsMenu.style.display = 'none';
    }
    
    showEmojiPanel() {
        this.elements.emojiPanel.style.display = 'flex';
    }
    
    hideEmojiPanel() {
        this.elements.emojiPanel.style.display = 'none';
    }
    
    sendEmoji(emoji) {
        this.updateStatus(`发送表情: ${emoji}`);
        this.hideEmojiPanel();
        
        // 在实际应用中，这里应该发送给其他玩家
        setTimeout(() => {
            this.updateStatus('轮到你出牌');
        }, 2000);
    }
    
    endGame() {
        this.updateStatus('牌已摸完，游戏结束');
        this.setActionButtons(false);
        this.stopTimer();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new MahjongGame();
    
    // 添加双击出牌功能
    document.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('tile') && 
            e.target.classList.contains('hand') &&
            !e.target.classList.contains('back')) {
            game.selectTile(e.target);
            game.playTile();
        }
    });
    
    // 触摸设备优化
    if ('ontouchstart' in window) {
        // 添加触摸反馈
        document.querySelectorAll('.tile').forEach(tile => {
            tile.addEventListener('touchstart', () => {
                tile.style.opacity = '0.8';
            });
            
            tile.addEventListener('touchend', () => {
                tile.style.opacity = '1';
            });
        });
    }
});
