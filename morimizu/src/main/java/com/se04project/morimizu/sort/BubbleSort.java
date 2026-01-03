package com.se04project.morimizu.sort;

/**
 * バブルソートアルゴリズムの実装
 */
public class BubbleSort {
    
    /**
     * バブルソートで配列を昇順にソートする
     * @param arr ソート対象の配列
     */
    public static void sort(int[] arr) {
        if (arr == null || arr.length == 0) {
            return;
        }
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // スワップ
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}
