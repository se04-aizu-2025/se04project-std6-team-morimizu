package com.se04project.morimizu.sort;

/**
 * シェルソートアルゴリズムの実装
 */
public class ShellSort {
    
    /**
     * シェルソートで配列を昇順にソートする
     * @param arr ソート対象の配列
     */
    public static void sort(int[] arr) {
        if (arr == null || arr.length == 0) {
            return;
        }
        
        int n = arr.length;
        
        // ギャップの初期値を設定（nの1/3）
        for (int gap = n / 2; gap > 0; gap /= 2) {
            // ギャップシェルソート
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j;
                
                for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
                    arr[j] = arr[j - gap];
                }
                
                arr[j] = temp;
            }
        }
    }
}
