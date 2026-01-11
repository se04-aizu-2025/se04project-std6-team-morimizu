package com.se04project.morimizu.sort;

/**
 * 挿入ソートアルゴリズムの実装
 */
public class InsertionSort {
    public static void sort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int val = arr[i];
            int j = i - 1;

            while (j >= 0 && arr[j] > val) {
                // 条件に一致した場合、配列のインデックスを上げる
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = val;
        }
    }
}