package com.se04project.morimizu.sort;

/**
 * マージソートアルゴリズムの実装
 */
public class MergeSort {
    
    /**
     * マージソートで配列を昇順にソートする
     * @param arr ソート対象の配列
     */
    public static void sort(int[] arr) {
        if (arr == null || arr.length == 0) {
            return;
        }
        mergeSort(arr, 0, arr.length - 1);
    }
    
    /**
     * マージソートの再帰的な実装
     * @param arr ソート対象の配列
     * @param left 開始インデックス
     * @param right 終了インデックス
     */
    private static void mergeSort(int[] arr, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }
    
    /**
     * 2つのソート済み部分配列をマージする
     * @param arr 配列
     * @param left 左の開始インデックス
     * @param mid 中間インデックス
     * @param right 右の終了インデックス
     */
    private static void merge(int[] arr, int left, int mid, int right) {
        int[] leftArr = new int[mid - left + 1];
        int[] rightArr = new int[right - mid];
        
        // 左の部分配列をコピー
        for (int i = 0; i < leftArr.length; i++) {
            leftArr[i] = arr[left + i];
        }
        
        // 右の部分配列をコピー
        for (int i = 0; i < rightArr.length; i++) {
            rightArr[i] = arr[mid + 1 + i];
        }
        
        int i = 0, j = 0, k = left;
        
        // マージ処理
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k++] = leftArr[i++];
            } else {
                arr[k++] = rightArr[j++];
            }
        }
        
        // 残りの要素をコピー
        while (i < leftArr.length) {
            arr[k++] = leftArr[i++];
        }
        
        while (j < rightArr.length) {
            arr[k++] = rightArr[j++];
        }
    }
}
