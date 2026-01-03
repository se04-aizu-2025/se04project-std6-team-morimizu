package com.se04project.morimizu.sort;

/**
 * 選択ソートアルゴリズムの実装
 */
public class SelectionSort {
    
    /**
     * 選択ソートで配列を昇順にソートする
     * @param arr ソート対象の配列
     */
    public static void sort(int[] arr) {
        if (arr == null || arr.length == 0) {
            return;
        }
        
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            
            // スワップ
            if (minIndex != i) {
                int temp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = temp;
            }
        }
    }
}
