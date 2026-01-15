function changeAlg() {
    const select = document.getElementById("mySelect");
    const selectedValue = select.value;

    const contentArea = document.getElementById("contentArea");

    if (algData[selectedValue]) {
        contentArea.innerHTML = algData[selectedValue];
    }
};

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