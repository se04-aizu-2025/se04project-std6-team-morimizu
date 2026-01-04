package com.se04project.morimizu.sort;

/**
 * クイックソートアルゴリズムの実装
 */
public class QuickSort {
    
    /**
     * クイックソートで配列を昇順にソートする
     * @param arr ソート対象の配列
     */
    public static void sort(int[] arr) {
        if (arr == null || arr.length == 0) {
            return;
        }
        quickSort(arr, 0, arr.length - 1);
    }
    
    /**
     * クイックソートの再帰的な実装
     * @param arr ソート対象の配列
     * @param low 開始インデックス
     * @param high 終了インデックス
     */
    private static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int partitionIndex = partition(arr, low, high);
            quickSort(arr, low, partitionIndex - 1);
            quickSort(arr, partitionIndex + 1, high);
        }
    }
    
    /**
     * 配列をパーティショニングする
     * @param arr 配列
     * @param low 開始インデックス
     * @param high 終了インデックス
     * @return パーティショニング後のピボットのインデックス
     */
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                // スワップ
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        // ピボットをスワップ
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        return i + 1;
    }
}
