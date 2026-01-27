package com.se04project.morimizu;

import com.se04project.morimizu.sort.*;
import java.util.ArrayList;
import java.util.List;

public class SortService {
    private List<SortStep> steps;

    public List<SortStep> executeSortWithSteps(List<Integer> array, String algorithm, String order) {
        steps = new ArrayList<>();
        List<Integer> workArray = new ArrayList<>(array);

        // 最初のステップを記録
        steps.add(new SortStep(new ArrayList<>(workArray), new ArrayList<>()));

        // アルゴリズムに応じてソートを実行
        switch (algorithm) {
            case "bubbleSort":
                bubbleSortWithSteps(workArray, order.equals("asc"));
                break;
            case "selectionSort":
                selectionSortWithSteps(workArray, order.equals("asc"));
                break;
            case "insertionSort":
                insertionSortWithSteps(workArray, order.equals("asc"));
                break;
            case "quickSort":
                quickSortWithSteps(workArray, 0, workArray.size() - 1, order.equals("asc"));
                break;
            case "mergeSort":
                mergeSortWithSteps(workArray, 0, workArray.size() - 1, order.equals("asc"));
                break;
            case "heapSort":
                heapSortWithSteps(workArray, order.equals("asc"));
                break;
            case "shellSort":
                shellSortWithSteps(workArray, order.equals("asc"));
                break;
            case "bucketSort":
                bucketSortWithSteps(workArray, order.equals("asc"));
                break;
            case "radixSort":
                radixSortWithSteps(workArray, order.equals("asc"));
                break;
            default:
                bubbleSortWithSteps(workArray, order.equals("asc"));
        }

        return steps;
    }

    private void bubbleSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                boolean needSwap = ascending ? array.get(j) > array.get(j + 1) : array.get(j) < array.get(j + 1);
                if (needSwap) {
                    // スワップ
                    int temp = array.get(j);
                    array.set(j, array.get(j + 1));
                    array.set(j + 1, temp);

                    // ステップを記録
                    List<Integer> comparingIndices = new ArrayList<>();
                    comparingIndices.add(j);
                    comparingIndices.add(j + 1);
                    steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
                }
            }
        }
    }

    private void selectionSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                boolean isSmaller = ascending ? array.get(j) < array.get(minIdx) : array.get(j) > array.get(minIdx);
                if (isSmaller) {
                    minIdx = j;
                }
            }
            if (minIdx != i) {
                int temp = array.get(i);
                array.set(i, array.get(minIdx));
                array.set(minIdx, temp);

                List<Integer> comparingIndices = new ArrayList<>();
                comparingIndices.add(i);
                comparingIndices.add(minIdx);
                steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
            }
        }
    }

    private void insertionSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int i = 1; i < n; i++) {
            int key = array.get(i);
            int j = i - 1;

            while (j >= 0 && (ascending ? array.get(j) > key : array.get(j) < key)) {
                array.set(j + 1, array.get(j));
                j--;

                List<Integer> comparingIndices = new ArrayList<>();
                comparingIndices.add(j + 1);
                comparingIndices.add(j);
                steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
            }
            array.set(j + 1, key);

            List<Integer> comparingIndices = new ArrayList<>();
            comparingIndices.add(j + 1);
            steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
        }
    }

    private void quickSortWithSteps(List<Integer> array, int low, int high, boolean ascending) {
        if (low < high) {
            int pi = partitionForQuickSort(array, low, high, ascending);
            quickSortWithSteps(array, low, pi - 1, ascending);
            quickSortWithSteps(array, pi + 1, high, ascending);
        }
    }

    private int partitionForQuickSort(List<Integer> array, int low, int high, boolean ascending) {
        int pivot = array.get(high);
        int i = low - 1;

        for (int j = low; j < high; j++) {
            boolean compare = ascending ? array.get(j) < pivot : array.get(j) > pivot;
            if (compare) {
                i++;
                int temp = array.get(i);
                array.set(i, array.get(j));
                array.set(j, temp);

                List<Integer> comparingIndices = new ArrayList<>();
                comparingIndices.add(i);
                comparingIndices.add(j);
                steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
            }
        }
        int temp = array.get(i + 1);
        array.set(i + 1, array.get(high));
        array.set(high, temp);

        List<Integer> comparingIndices = new ArrayList<>();
        comparingIndices.add(i + 1);
        comparingIndices.add(high);
        steps.add(new SortStep(new ArrayList<>(array), comparingIndices));

        return i + 1;
    }

    private void mergeSortWithSteps(List<Integer> array, int left, int right, boolean ascending) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortWithSteps(array, left, mid, ascending);
            mergeSortWithSteps(array, mid + 1, right, ascending);
            mergeForMergeSort(array, left, mid, right, ascending);
        }
    }

    private void mergeForMergeSort(List<Integer> array, int left, int mid, int right, boolean ascending) {
        List<Integer> leftArray = new ArrayList<>(array.subList(left, mid + 1));
        List<Integer> rightArray = new ArrayList<>(array.subList(mid + 1, right + 1));

        int i = 0, j = 0, k = left;

        while (i < leftArray.size() && j < rightArray.size()) {
            boolean compare = ascending ? leftArray.get(i) <= rightArray.get(j) : leftArray.get(i) >= rightArray.get(j);
            if (compare) {
                array.set(k++, leftArray.get(i++));
            } else {
                array.set(k++, rightArray.get(j++));
            }

            List<Integer> comparingIndices = new ArrayList<>();
            comparingIndices.add(k - 1);
            steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
        }

        while (i < leftArray.size()) {
            array.set(k++, leftArray.get(i++));
            List<Integer> comparingIndices = new ArrayList<>();
            comparingIndices.add(k - 1);
            steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
        }

        while (j < rightArray.size()) {
            array.set(k++, rightArray.get(j++));
            List<Integer> comparingIndices = new ArrayList<>();
            comparingIndices.add(k - 1);
            steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
        }
    }

    private void heapSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();

        // ヒープを構築
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapifyForHeapSort(array, n, i, ascending);
        }

        // ソートを実行
        for (int i = n - 1; i > 0; i--) {
            int temp = array.get(0);
            array.set(0, array.get(i));
            array.set(i, temp);

            List<Integer> comparingIndices = new ArrayList<>();
            comparingIndices.add(0);
            comparingIndices.add(i);
            steps.add(new SortStep(new ArrayList<>(array), comparingIndices));

            heapifyForHeapSort(array, i, 0, ascending);
        }
    }

    private void heapifyForHeapSort(List<Integer> array, int n, int i, boolean ascending) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n && (ascending ? array.get(left) > array.get(largest) : array.get(left) < array.get(largest))) {
            largest = left;
        }

        if (right < n && (ascending ? array.get(right) > array.get(largest) : array.get(right) < array.get(largest))) {
            largest = right;
        }

        if (largest != i) {
            int temp = array.get(i);
            array.set(i, array.get(largest));
            array.set(largest, temp);

            List<Integer> comparingIndices = new ArrayList<>();
            comparingIndices.add(i);
            comparingIndices.add(largest);
            steps.add(new SortStep(new ArrayList<>(array), comparingIndices));

            heapifyForHeapSort(array, n, largest, ascending);
        }
    }

    private void shellSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = array.get(i);
                int j;

                for (j = i; j >= gap && (ascending ? array.get(j - gap) > temp : array.get(j - gap) < temp); j -= gap) {
                    array.set(j, array.get(j - gap));

                    List<Integer> comparingIndices = new ArrayList<>();
                    comparingIndices.add(j);
                    comparingIndices.add(j - gap);
                    steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
                }
                array.set(j, temp);

                List<Integer> comparingIndices = new ArrayList<>();
                comparingIndices.add(j);
                steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
            }
        }
    }

    private void bucketSortWithSteps(List<Integer> array, boolean ascending) {
        // シンプルな実装: まずバブルソートにフォールバック
        bubbleSortWithSteps(array, ascending);
    }

    private void radixSortWithSteps(List<Integer> array, boolean ascending) {
        // シンプルな実装: まずバブルソートにフォールバック
        bubbleSortWithSteps(array, ascending);
    }
}
