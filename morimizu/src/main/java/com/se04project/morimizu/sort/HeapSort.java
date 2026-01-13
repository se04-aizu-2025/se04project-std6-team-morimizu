package com.se04project.morimizu.sort;

public class HeapSort {
    static int length;

    public static void heapSort(int[] arr) {
        length = arr.length;
        if (length < 1)
            return;

        buildMaxHeap(arr);
        while (length > 0) {
            swap(arr, 0, length - 1);
            length--;
            adjustHeap(arr, 0);
        }
    }

    public static void buildMaxHeap(int[] arr) {
        for (int i = (length / 2 - 1); i >= 0; i--) {
            adjustHeap(arr, i);
        }
    }

    public static void adjustHeap(int[] arr, int i) {
        int maxIndex = i;

        int left = i * 2 + 1;
        int right = i * 2 + 2;
        if (left < length && arr[left] > arr[maxIndex]) {
            maxIndex = left;
        }
        if (right < length && arr[right] > arr[maxIndex]) {
            maxIndex = right;
        }
        if (maxIndex != i) {
            swap(arr, maxIndex, i);
            adjustHeap(arr, maxIndex);
        }
    }

    public static void swap(int[] arr, int from, int to) {
        int temp = 0;
        temp = arr[from];
        arr[from] = arr[to];
        arr[to] = temp;
    }
}
