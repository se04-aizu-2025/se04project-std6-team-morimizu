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