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

    const contentArea = document.getElementById(targetId);

    if (algData[selectedValue]) {
        contentArea.innerHTML = algData[selectedValue];
    }
    if (window.MathJax) {
        MathJax.typesetPromise([contentArea]).catch((err) => console.log(err));
    }
};

function executeCode() {
    const userCode = document.getElementById('userCode').value;
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');

    errorDiv.style.display = 'none';

    try {
        const userResult = eval('(function() { ' + userCode + ' })()');
        resultDiv.textContent = JSON.stringify(userResult, null, 2);
        document.getElementById('yourAnswer').textContent = JSON.stringify(userResult, null, 2);

        compareResults(userResult);
    } catch (error) {
        errorDiv.textContent = 'エラー: ' + error.message;
        errorDiv.style.display = 'block';
    }
}

function compareResults(userResult) {
    const statusDiv = document.getElementById('status');
    if (userResult) {
        statusDiv.innerHTML = '<div class="success">実装完了</div>';
    }
}

const algData = {
    "Default": `
        <p>学びたいアルゴリズムを選択してください。</p>
    `,

    "BubbleSort": `
        <p>バブルソートは、隣り合う要素を比較し、順序が逆であれば交換する操作を繰り返す単純なアルゴリズムです。</p>
        <ul>
            <li><strong>時間計算量:</strong> 最悪・平均ともに O(n<sup>2</sup>)。すでにソート済みの場合はO(n)で完了します。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>アルゴリズムの理解と実装が非常に容易。</li>
                    <li>安定ソートである（同じ値の順序が保存される）。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>計算効率が悪く、大規模データには不向き。</li>
                    <li>交換回数が多くなる傾向がある。</li>
                </ul>
            </li>
        </ul>
    `,

    "BucketSort": `
        <p>バケットソートは、データをいくつかのバケツ（バケット）に分割し、それぞれのバケツ内で個別にソートを行う手法です。</p>
        <ul>
            <li><strong>時間計算量:</strong> データが一様に分布している場合、平均O(n + k)。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>分布が均等であれば、比較ソートの限界 O(n log n) を超える高速化が可能。</li>
                    <li>並列処理に適している。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>データの分布に偏りがあると効率が劇的に低下する。</li>
                    <li>バケツ用のメモリ領域が別途必要になる。</li>
                </ul>
            </li>
        </ul>
    `,

    "HeapSort": `
        <p>ヒープソートは、ヒープ（二分ヒープ）というデータ構造を利用して最大値（または最小値）を取り出し続けることで整列を行います。</p>
        <ul>
            <li><strong>時間計算量:</strong> 最悪・平均ともに O(nlog n) で安定しています。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>追加のメモリ領域をほとんど必要としない（定数空間）。</li>
                    <li>最悪のケースでも計算量が O(nlog n) に収まる。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>安定ソートではない。</li>
                    <li>キャッシュ効率がQuickSortに比べて劣る場合がある。</li>
                </ul>
            </li>
        </ul>
    `,

    "InsertionSort": `
        <p>挿入ソートは、整列済みの部分列に対して、新しい要素を適切な位置に挿入していく手法です。</p>
        <ul>
            <li><strong>時間計算量:</strong> 平均・最悪 (n<sup>2</sup>)。しかしデータがほぼ整列している場合はO(n)に近づきます。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>実装が簡単で、小規模データや「ほぼソート済み」のデータに非常に高速。</li>
                    <li>安定ソートであり、オンラインアルゴリズムとして利用可能。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>逆順に並んでいるデータや大規模データに対しては非常に遅い。</li>
                </ul>
            </li>
        </ul>
    `,

    "MergeSort": `
        <p>マージソートは、データを半分に分割し続け、それらを整列しながら併合（マージ）する分割統治法のアルゴリズムです。</p>
        <ul>
            <li><strong>時間計算量:</strong> 最悪・平均ともに O(nlog n)。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>安定ソートである。</li>
                    <li>データの並び順に関わらず計算量が一定で予測しやすい。</li>
                    <li>連結リスト（Linked List）のソートに適している。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>配列をソートする場合、O(n)の外部メモリが必要になる。</li>
                </ul>
            </li>
        </ul>
    `,

    "QuickSort": `
        <p>クイックソートは、基準値（ピボット）を選び、それより小さいグループと大きいグループに分割して再帰的にソートする手法です。</p>
        <ul>
            <li><strong>時間計算量:</strong> 平均 O(n<sup>2</sup>)。ピボットの選び方が悪いと最悪O(n<sup>2</sup>) になります。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>実用上、最も高速なソートの一つであることが多い。</li>
                    <li>内部ソートが可能で、追加メモリが少なくて済む。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>安定ソートではない。</li>
                    <li>最悪のケースを避けるためにピボット選択の工夫が必要。</li>
                </ul>
            </li>
        </ul>
    `,

    "RadixSort": `
        <p>基数ソートは、要素同士の比較を行わず、数値の桁（基数）ごとの値に基づいてバケツに振り分ける手法です。</p>
        <ul>
            <li><strong>時間計算量:</strong> O(nk)（kは桁数）。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>整数や固定長の文字列など特定のデータ形式に対して非常に高速。</li>
                    <li>安定ソートの実装が可能。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>浮動小数点数など、複雑なデータのソートには適用しにくい。</li>
                    <li>大きなメモリ空間が必要になる場合がある。</li>
                </ul>
            </li>
        </ul>
    `,

    "SelectionSort": `
        <p>選択ソートは、未ソート部分から最小（または最大）の要素を選び出し、先頭の要素と交換していく手法です。</p>
        <ul>
            <li><strong>時間計算量:</strong> 常に O(n<sup>2</sup>)。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>データの書き込み（交換）回数が最大でもn-1回で済むため、書き込みコストが高い場合に有利。</li>
                    <li>アルゴリズムが直感的で単純。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>比較回数が多く、基本的には遅い。</li>
                    <li>通常は安定ソートではない。</li>
                </ul>
            </li>
        </ul>
    `,

    "ShellSort": `
        <p>シェルソートは、一定の間隔（ギャップ）を空けた要素同士で挿入ソートを行い、徐々に間隔を縮めていく手法です。</p>
        <ul>
            <li><strong>時間計算量:</strong> ギャップの選び方に依存し、O(n<sup>1.3</sup>) から O(n<sup>2</sup>) の間。</li>
            <li><strong>メリット:</strong>
                <ul>
                    <li>InsertionSortの改良版であり、中規模データまでは比較的高速。</li>
                    <li>メモリ消費が少なく、実装コードも比較的短い。</li>
                </ul>
            </li>
            <li><strong>デメリット:</strong>
                <ul>
                    <li>最適なギャップ列の選定が難しく、最悪計算量の見積もりが複雑。</li>
                    <li>安定ソートではない。</li>
                </ul>
            </li>
        </ul>
    `
};

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', init);