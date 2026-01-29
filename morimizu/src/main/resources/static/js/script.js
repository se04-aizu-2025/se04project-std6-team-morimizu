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
const compareBtn = document.getElementById('compareBtn');
const compareResult = document.getElementById('compareResult');

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
    compareBtn.addEventListener('click', compareAlgorithms);

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
function changeAlg(element, targetId) {
    const selectedValue = element.value;

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

/**
 * コード入力タイプ (JavaScript / Java) に応じて UI を切り替え
 */
function updateTestUI() {
    const codeType = document.getElementById('codeType').value;
    const jsPanel = document.getElementById('jsTestPanel');
    const javaPanel = document.getElementById('javaTestPanel');

    if (codeType === 'java') {
        jsPanel.style.display = 'none';
        javaPanel.style.display = 'block';
    } else {
        jsPanel.style.display = 'block';
        javaPanel.style.display = 'none';
    }
}

/**
 * Java コードをコンパイル・実行
 */
async function compileAndTestJava() {
    const userCode = document.getElementById('userCode').value;
    const testAlgorithm = document.getElementById('javaTestAlgorithm').value;
    const testArraySize = parseInt(document.getElementById('javaTestArraySize').value);
    const errorDiv = document.getElementById('error');
    const statusDiv = document.getElementById('status');
    const testResultsDiv = document.getElementById('testResults');

    // バリデーション
    if (!userCode.trim()) {
        alert('Java コードを入力してください');
        return;
    }

    if (!testAlgorithm) {
        alert('テストするアルゴリズムを選択してください');
        return;
    }

    if (!testArraySize || testArraySize < 1 || testArraySize > 100) {
        alert('テストデータサイズは1から100の間で指定してください');
        return;
    }

    // ランダムテストデータを生成
    const testData = generateRandomArray(testArraySize);
    displayTestData(testData);

    try {
        errorDiv.style.display = 'none';

        // バックエンド API を呼び出し
        const response = await fetch('/api/compile-and-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                javaCode: userCode,
                testData: testData,
                testAlgorithm: testAlgorithm
            })
        });

        if (!response.ok) {
            throw new Error('バックエンドエラー: ' + response.statusText);
        }

        const result = await response.json();

        if (result.success) {
            const userResult = result.userResult;
            const backendResult = result.backendResult;

            document.getElementById('yourAnswer').textContent = JSON.stringify(userResult, null, 2);
            document.getElementById('correctAnswer').textContent = JSON.stringify(backendResult, null, 2);

            // 結果を比較
            compareTestResults(userResult, backendResult, testResultsDiv, statusDiv);
        } else {
            errorDiv.textContent = 'コンパイルエラー: ' + result.error;
            errorDiv.style.display = 'block';
            testResultsDiv.innerHTML = '<p style="color: red;">Java コンパイルエラー</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = 'エラー: ' + error.message;
        errorDiv.style.display = 'block';
        testResultsDiv.innerHTML = '<p style="color: red;">通信エラー: ' + error.message + '</p>';
    }
}

/**
 * テストデータを生成して実行
 */
async function generateAndTest() {
    const testAlgorithm = document.getElementById('testAlgorithm').value;
    const testArraySize = parseInt(document.getElementById('testArraySize').value);
    const errorDiv = document.getElementById('error');
    const statusDiv = document.getElementById('status');
    const testResultsDiv = document.getElementById('testResults');

    // バリデーション
    if (!testAlgorithm) {
        alert('テストするアルゴリズムを選択してください');
        return;
    }

    if (!testArraySize || testArraySize < 1 || testArraySize > 100) {
        alert('テストデータサイズは1から100の間で指定してください');
        return;
    }

    // ランダムテストデータを生成
    const testData = generateRandomArray(testArraySize);
    displayTestData(testData);

    // ユーザーコードを実行
    const userCode = document.getElementById('userCode').value;

    if (!userCode.trim()) {
        alert('ユーザーコードを入力してください');
        return;
    }

    try {
        errorDiv.style.display = 'none';

        // バックエンドでJavaコードを実行
        const response = await fetch('/api/execute-java-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                javaCode: userCode,
                array: testData
            })
        });

        if (!response.ok) {
            throw new Error('ユーザーコード実行リクエスト失敗');
        }

        const data = await response.json();

        if (!data.success) {
            errorDiv.textContent = 'ユーザーコードのエラー: ' + data.error;
            errorDiv.style.display = 'block';
            testResultsDiv.innerHTML = '<p style="color: red;">ユーザーコード実行エラー</p>';
            return;
        }

        const userResult = data.result;
        document.getElementById('yourAnswer').textContent = JSON.stringify(userResult, null, 2);
        document.getElementById('result').textContent = JSON.stringify(userResult, null, 2);

        // バックエンドの実装結果を取得して比較
        fetchBackendResult(testData, testAlgorithm, userResult, testResultsDiv, statusDiv);
    } catch (error) {
        errorDiv.textContent = 'ユーザーコードのエラー: ' + error.message;
        errorDiv.style.display = 'block';
        testResultsDiv.innerHTML = '<p style="color: red;">ユーザーコード実行エラー</p>';
    }
}

/**
 * ランダム配列を生成
 */
function generateRandomArray(size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 100) + 1); // 1-100のランダム整数
    }
    return arr;
}

/**
 * テストデータを表示
 */
function displayTestData(testData) {
    const testDataDiv = document.getElementById('testData');
    testDataDiv.textContent = '[' + testData.join(', ') + ']';
}

/**
 * バックエンドから結果を取得して比較
 */
async function fetchBackendResult(testData, testAlgorithm, userResult, testResultsDiv, statusDiv) {
    try {
        // バックエンドAPIを呼び出し
        const response = await fetch('/api/test-algorithm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                array: testData,
                algorithm: testAlgorithm
            })
        });

        if (!response.ok) {
            throw new Error('バックエンドエラー: ' + response.statusText);
        }

        const backendResult = await response.json();

        document.getElementById('correctAnswer').textContent = JSON.stringify(backendResult, null, 2);

        // 結果を比較
        compareTestResults(userResult, backendResult, testResultsDiv, statusDiv);
    } catch (error) {
        console.error('Error:', error);
        testResultsDiv.innerHTML = '<p style="color: red;">バックエンド通信エラー: ' + error.message + '</p>';
    }
}

/**
 * テスト結果を比較
 */
function compareTestResults(userResult, correctResult, testResultsDiv, statusDiv) {
    const isCorrect = arraysEqual(userResult, correctResult);

    if (isCorrect) {
        statusDiv.innerHTML = '<div style="background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px;">合格</div>';
        testResultsDiv.innerHTML = '<p style="color: #4CAF50; font-weight: bold;">あなたの実装は正解です！</p>';
    } else {
        statusDiv.innerHTML = '<div style="background-color: #f44336; color: white; padding: 10px; border-radius: 5px;">不合格</div>';
        testResultsDiv.innerHTML = '<p style="color: #f44336; font-weight: bold;">あなたの実装が正解と異なります</p>' +
            '<p><strong>差分:</strong></p>' +
            '<pre style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; overflow-x: auto;">' +
            '期待値: ' + JSON.stringify(correctResult) + '\n' +
            'あなたの結果: ' + JSON.stringify(userResult) +
            '</pre>';
    }
}

/**
 * 配列が等しいかを判定
 */
function arraysEqual(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return false;
    }
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

const algData = {
    "Default": `
        <p>学びたいアルゴリズムを選択してください。</p>
    `,

    "BubbleSort": `
        <p>バブルソートは、隣り合う要素を比較し、順序が逆であれば交換する操作を繰り返す単純なアルゴリズムです。</p>
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int maxVal = 0;
    for(int i : arr) if(i > maxVal) maxVal = i;
    
    int[] bucket = new int[maxVal + 1];
    for (int i = 0; i < arr.length; i++) bucket[arr[i]]++;

    int outPos = 0;
    for (int i = 0; i < bucket.length; i++) {
        for (int j = 0; j < bucket[i]; j++) arr[outPos++] = i;
    }
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapify(arr, i, 0);
    }
}
private static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int swap = arr[i]; arr[i] = arr[largest]; arr[largest] = swap;
        heapify(arr, n, largest);
    }
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = (left + right) / 2;
        sort(arr, left, mid);
        sort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}
private static void merge(int[] arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    int[] L = new int[n1]; int[] R = new int[n2];
    for (int i = 0; i < n1; ++i) L[i] = arr[left + i];
    for (int j = 0; j < n2; ++j) R[j] = arr[mid + 1 + j];
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) { if (L[i] <= R[j]) arr[k++] = L[i++]; else arr[k++] = R[j++]; }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>private static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int partitionIndex = partition(arr, low, high);
        quickSort(arr, low, partitionIndex - 1);
        quickSort(arr, partitionIndex + 1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int max = arr[0];
    for (int i : arr) if (i > max) max = i;
    for (int exp = 1; max / exp > 0; exp *= 10) countSort(arr, exp);
}
private static void countSort(int[] arr, int exp) {
    int n = arr.length;
    int[] output = new int[n];
    int[] count = new int[10];
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[min_idx]) min_idx = j;
        int temp = arr[min_idx];
        arr[min_idx] = arr[i];
        arr[i] = temp;
    }
}</code></pre>
        </div>
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
        <div class="code-block">
            <h3>実装コード (Java)</h3>
            <pre><code>public static void sort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j;
            for (j = i; j >= gap && arr[j - gap] > temp; j -= gap)
                arr[j] = arr[j - gap];
            arr[j] = temp;
        }
    }
}</code></pre>
        </div>
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

/**
 * 複数アルゴリズムを比較する関数
 */
async function compareAlgorithms() {
    // チェックボックスから選択されたアルゴリズムを取得
    const checkboxes = document.querySelectorAll('.compare-algo:checked');
    const selectedAlgorithms = Array.from(checkboxes).map(cb => cb.value);

    // 入力値を取得
    const array = parseArrayInput();

    // バリデーション
    if (!array || array.length === 0) {
        compareResult.innerHTML = '<p style="color: red;">エラー：数列を入力してください</p>';
        return;
    }

    if (selectedAlgorithms.length < 2) {
        compareResult.innerHTML = '<p style="color: red;">エラー：2つ以上のアルゴリズムを選択してください</p>';
        return;
    }

    // 比較結果表示エリアを初期化
    compareResult.innerHTML = '<p style="color: blue;">比較実行中...</p>';

    try {
        const response = await fetch('/api/compare-algorithms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                array: array,
                algorithms: selectedAlgorithms
            })
        });

        if (!response.ok) {
            throw new Error('API呼び出しに失敗しました');
        }

        const data = await response.json();

        // 結果を表示
        displayCompareResult(data, selectedAlgorithms);

    } catch (error) {
        compareResult.innerHTML = `<p style="color: red;">エラー: ${error.message}</p>`;
    }
}

/**
 * 比較結果を表示する関数
 */
function displayCompareResult(data, selectedAlgorithms) {
    let html = '';

    // メッセージを表示（正解/不正解）
    if (data.allSame) {
        html += `<div style="background-color: #e8f5e9; border: 2px solid #4caf50; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <h3 style="color: #2e7d32; margin: 0;">✓ ${data.message}</h3>
                </div>`;
    } else {
        html += `<div style="background-color: #ffebee; border: 2px solid #f44336; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <h3 style="color: #c62828; margin: 0;">✗ ${data.message}</h3>
                </div>`;
    }

    // 各アルゴリズムの結果を表示
    html += '<h3>各アルゴリズムの結果:</h3>';
    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
    html += '<tr style="background-color: #f5f5f5;"><th style="border: 1px solid #ddd; padding: 8px;">アルゴリズム</th><th style="border: 1px solid #ddd; padding: 8px;">結果</th></tr>';

    const algorithmNames = {
        'bubbleSort': 'バブルソート',
        'selectionSort': '選択ソート',
        'insertionSort': '挿入ソート',
        'quickSort': 'クイックソート',
        'mergeSort': 'マージソート',
        'heapSort': 'ヒープソート',
        'shellSort': 'シェルソート',
        'bucketSort': 'バケットソート',
        'radixSort': '基数ソート'
    };

    for (const algo of selectedAlgorithms) {
        const result = data.results[algo];
        const resultStr = result.join(', ');
        html += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${algorithmNames[algo]}</td><td style="border: 1px solid #ddd; padding: 8px;">[${resultStr}]</td></tr>`;
    }

    html += '</table>';

    compareResult.innerHTML = html;
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', init);