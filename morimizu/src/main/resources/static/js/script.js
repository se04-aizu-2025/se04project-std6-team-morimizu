// グローバル状態管理
let sortState = {
    isRunning: false,
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    originalArray: [],
    steps: [], // ステップごとのスナップショット {array, comparingIndices}
    selectedAlgorithm: '',
    sortOrder: 'asc'
};

// DOM要素の参照
const arrayInput = document.getElementById('arrayInput');
const sortOrder = document.getElementById('sortOrder');
const algorithmSelect = document.getElementById('algorithmSelect');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const endBtn = document.getElementById('endBtn');
const nextBtn = document.getElementById('nextBtn');
const chartContainer = document.getElementById('chartContainer');
const progressInfo = document.getElementById('progressInfo');

let autoPlayInterval = null;

// 初期化
function init() {
    // 入力欄からの数列変更時に自動でグラフを更新
    arrayInput.addEventListener('input', () => {
        if (!sortState.isRunning) {
            drawChart(getCurrentArray());
            updateProgressInfo();
        }
        updateControlPanel();
    });

    // ソート順変更時にコントロールパネルを更新
    sortOrder.addEventListener('change', () => {
        updateControlPanel();
    });

    // アルゴリズム選択時にコントロールパネルを更新
    algorithmSelect.addEventListener('change', () => {
        updateControlPanel();
    });

    // ボタンイベント
    startBtn.addEventListener('click', startSort);
    stopBtn.addEventListener('click', stopSort);
    playBtn.addEventListener('click', playSort);
    pauseBtn.addEventListener('click', pauseSort);
    resetBtn.addEventListener('click', resetSort);
    endBtn.addEventListener('click', endSort);
    nextBtn.addEventListener('click', nextStep);

    updateControlPanel();
}

// 入力値を配列に変換
function parseArrayInput() {
    const input = arrayInput.value.trim();
    if (!input) return [];
    return input.split(/\s+/).map(x => parseInt(x)).filter(x => !isNaN(x));
}

// 現在の配列を取得
function getCurrentArray() {
    if (!sortState.isRunning) {
        return parseArrayInput();
    }
    if (sortState.currentStep < sortState.steps.length) {
        return [...sortState.steps[sortState.currentStep].array];
    }
    return sortState.originalArray;
}

// ソート開始
async function startSort() {
    const array = parseArrayInput();
    const order = sortOrder.value;
    const algorithm = algorithmSelect.value;

    if (!array.length || !order || !algorithm) {
        alert('数列、ソート順、アルゴリズムをすべて選択してください');
        return;
    }

    sortState.isRunning = true;
    sortState.isPlaying = false;
    sortState.currentStep = 0;
    sortState.originalArray = [...array];
    sortState.selectedAlgorithm = algorithm;
    sortState.sortOrder = order;
    sortState.steps = [];

    // 入力欄を無効化
    arrayInput.disabled = true;
    sortOrder.disabled = true;
    algorithmSelect.disabled = true;

    // バックエンドからステップデータを取得
    try {
        const response = await fetch('/api/sort', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                array: array,
                algorithm: algorithm,
                order: order
            })
        });

        if (!response.ok) {
            throw new Error('ソート実行エラー');
        }

        sortState.steps = await response.json();
        sortState.totalSteps = sortState.steps.length;

        // 初期状態を表示
        displayStep(0);
        updateControlPanel();
    } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました: ' + error.message);
        sortState.isRunning = false;
        arrayInput.disabled = false;
        sortOrder.disabled = false;
        algorithmSelect.disabled = false;
        updateControlPanel();
    }
}

// ソート終了
function stopSort() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }

    sortState.isRunning = false;
    sortState.isPlaying = false;
    sortState.currentStep = 0;
    sortState.steps = [];

    // 入力欄を有効化
    arrayInput.disabled = false;
    sortOrder.disabled = false;
    algorithmSelect.disabled = false;

    // グラフをリセット
    drawChart(parseArrayInput());
    updateControlPanel();
    updateProgressInfo();
}

// 自動再生開始
function playSort() {
    if (!sortState.isRunning || sortState.currentStep >= sortState.totalSteps) {
        return;
    }

    sortState.isPlaying = true;
    updateControlPanel();

    autoPlayInterval = setInterval(() => {
        if (sortState.currentStep < sortState.totalSteps - 1) {
            sortState.currentStep++;
            displayStep(sortState.currentStep);
        } else {
            // ソート完了
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            sortState.isPlaying = false;
            updateControlPanel();
        }
    }, 1000);
}

// 自動再生停止
function pauseSort() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    sortState.isPlaying = false;
    updateControlPanel();
}

// 最初へリセット
function resetSort() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    sortState.isPlaying = false;
    sortState.currentStep = 0;
    displayStep(0);
    updateControlPanel();
}

// 最後へジャンプ
function endSort() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    sortState.isPlaying = false;
    sortState.currentStep = sortState.totalSteps - 1;
    displayStep(sortState.currentStep);
    updateControlPanel();
}

// 1ステップ進める
function nextStep() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
    sortState.isPlaying = false;

    if (sortState.currentStep < sortState.totalSteps - 1) {
        sortState.currentStep++;
        displayStep(sortState.currentStep);
    }
    updateControlPanel();
}

// ステップを表示
function displayStep(stepIndex) {
    if (stepIndex < sortState.steps.length) {
        const step = sortState.steps[stepIndex];
        drawChart(step.array, step.comparingIndices);
    }
    updateProgressInfo();
}

// グラフを描画
function drawChart(array, highlightIndices = []) {
    chartContainer.innerHTML = '';

    if (!array.length) {
        chartContainer.innerHTML = '<p>数列を入力してください</p>';
        return;
    }

    const maxValue = Math.max(...array);
    const maxHeight = 250; // ピクセル
    
    // 数列の長さに応じてバーの幅を調整
    // 最大30個の場合を想定して、コンテナ幅に合わせて調整
    const containerWidth = chartContainer.offsetWidth - 20; // パディングを除く
    const barWidth = Math.max(20, Math.min(35, (containerWidth - (array.length * 4)) / array.length));

    array.forEach((value, index) => {
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        barWrapper.style.minWidth = (barWidth + 4) + 'px'; // gapを考慮

        const bar = document.createElement('div');
        bar.className = 'bar';
        const height = (value / maxValue) * maxHeight;
        bar.style.height = height + 'px';
        bar.style.width = barWidth + 'px';

        // ハイライト状態を設定
        if (highlightIndices && highlightIndices.includes(index)) {
            bar.classList.add('comparing');
        }

        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = value;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(barValue);
        chartContainer.appendChild(barWrapper);
    });
}

// コントロールパネルの状態を更新
function updateControlPanel() {
    const hasInput = parseArrayInput().length > 0;
    const hasOrder = sortOrder.value !== '';
    const hasAlgorithm = algorithmSelect.value !== '';

    // 実行ボタン：入力値と選択があり、実行中でないときのみ有効
    startBtn.disabled = !hasInput || !hasOrder || !hasAlgorithm || sortState.isRunning;

    // 実行終了ボタン：実行中のときのみ有効
    stopBtn.disabled = !sortState.isRunning;

    // 実行制御ボタン
    if (!sortState.isRunning) {
        // 実行中でないときはすべて無効
        playBtn.disabled = true;
        pauseBtn.disabled = true;
        resetBtn.disabled = true;
        endBtn.disabled = true;
        nextBtn.disabled = true;
        pauseBtn.classList.add('btn-active');
        playBtn.classList.remove('btn-active');
    } else if (sortState.isPlaying) {
        // 自動再生中
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        endBtn.disabled = false;
        nextBtn.disabled = true;
        pauseBtn.classList.add('btn-active');
        playBtn.classList.remove('btn-active');
    } else {
        // 停止中
        pauseBtn.disabled = true;
        resetBtn.disabled = false;
        endBtn.disabled = false;
        nextBtn.disabled = false;

        // ソート完了時は自動再生ボタンを無効化
        if (sortState.currentStep >= sortState.totalSteps - 1 && sortState.totalSteps > 0) {
            playBtn.disabled = true;
        } else {
            playBtn.disabled = false;
        }

        pauseBtn.classList.add('btn-active');
        playBtn.classList.remove('btn-active');
    }
}

// 進捗情報を更新
function updateProgressInfo() {
    if (!sortState.isRunning) {
        progressInfo.textContent = '';
    } else {
        progressInfo.textContent = `ステップ: ${sortState.currentStep} / ${sortState.totalSteps}`;
    }
}

// 説明表示用の関数（既存）
function changeAlg() {
    const select = document.getElementById("mySelect");
    const selectedValue = select.value;

    const contentArea = document.getElementById("contentArea");

    if (algData[selectedValue]) {
        contentArea.innerHTML = algData[selectedValue];
    }
}

const algData = {
    "0": `
        <p>学びたいアルゴリズムを選択してください。</p>
    `,
    "1": `
        <p>アルゴリズム1は、効率的なデータソートを実現するための手法です。以下にその詳細を示します。</p>
            <ul>
                <li><strong>時間計算量:</strong> 平均 O(n log n)、最悪 O(n^2)。データの分布によって性能が変動します。</li>
                <li><strong>メリット:</strong>
                    <ul>
                        <li>実装が簡単で、教育用途に適している。</li>
                        <li>小規模なデータセットに対して高速。</li>
                    </ul>
                </li>
                <li><strong>デメリット:</strong>
                    <ul>
                        <li>大規模なデータセットでは効率が低下する可能性がある。</li>
                        <li>安定性が保証されない場合がある。</li>
                    </ul>
                </li>
            </ul>
    `,
    "2": `
        <p>アルゴリズム2は、効率的なデータソートを実現するための手法です。以下にその詳細を示します。</p>
            <ul>
                <li><strong>時間計算量:</strong> 平均 O(n log n)、最悪 O(n^2)。データの分布によって性能が変動します。</li>
                <li><strong>メリット:</strong>
                    <ul>
                        <li>実装が簡単で、教育用途に適している。</li>
                        <li>小規模なデータセットに対して高速。</li>
                    </ul>
                </li>
                <li><strong>デメリット:</strong>
                    <ul>
                        <li>大規模なデータセットでは効率が低下する可能性がある。</li>
                        <li>安定性が保証されない場合がある。</li>
                    </ul>
                </li>
            </ul>
    `
};

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', init);