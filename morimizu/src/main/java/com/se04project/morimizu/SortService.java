package com.se04project.morimizu;

import com.se04project.morimizu.sort.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

public class SortService {
    private List<SortStep> steps;

    public List<SortStep> executeSortWithSteps(List<Integer> array, String algorithm, String order) {
        steps = new ArrayList<>();
        List<Integer> workArray = new ArrayList<>(array);

        // 最初の状態を記録
        steps.add(new SortStep(new ArrayList<>(workArray), new ArrayList<>()));

        boolean isAsc = "asc".equals(order);

        switch (algorithm) {
            case "bubbleSort":
                bubbleSortWithSteps(workArray, isAsc);
                break;
            case "selectionSort":
                selectionSortWithSteps(workArray, isAsc);
                break;
            case "insertionSort":
                insertionSortWithSteps(workArray, isAsc);
                break;
            case "quickSort":
                quickSortWithSteps(workArray, 0, workArray.size() - 1, isAsc);
                break;
            case "mergeSort":
                mergeSortWithSteps(workArray, 0, workArray.size() - 1, isAsc);
                break;
            case "heapSort":
                heapSortWithSteps(workArray, isAsc);
                break;
            case "shellSort":
                shellSortWithSteps(workArray, isAsc);
                break;
            case "bucketSort":
                bucketSortWithSteps(workArray, isAsc);
                break;
            case "radixSort":
                radixSortWithSteps(workArray, isAsc);
                break;
            default:
                bubbleSortWithSteps(workArray, isAsc);
        }

        return steps;
    }

    private void addStep(List<Integer> array, int... indices) {
        List<Integer> comparingIndices = new ArrayList<>();
        for (int index : indices) {
            if (index >= 0 && index < array.size()) {
                comparingIndices.add(index);
            }
        }
        steps.add(new SortStep(new ArrayList<>(array), comparingIndices));
    }

    private void bubbleSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                boolean needSwap = ascending ? array.get(j) > array.get(j + 1) : array.get(j) < array.get(j + 1);
                if (needSwap) {
                    int temp = array.get(j);
                    array.set(j, array.get(j + 1));
                    array.set(j + 1, temp);
                    addStep(array, j, j + 1); // 入れ替え発生時のみ記録
                }
            }
        }
    }

    private void selectionSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int i = 0; i < n - 1; i++) {
            int targetIdx = i;
            for (int j = i + 1; j < n; j++) {
                boolean isTarget = ascending ? array.get(j) < array.get(targetIdx) : array.get(j) > array.get(targetIdx);
                if (isTarget) {
                    targetIdx = j;
                }
            }
            if (targetIdx != i) {
                int temp = array.get(i);
                array.set(i, array.get(targetIdx));
                array.set(targetIdx, temp);
                addStep(array, i, targetIdx); // 入れ替え発生時のみ記録
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
                addStep(array, j + 1, j); // シフト（代入）ごとに記録
                j--;
            }
            array.set(j + 1, key);
            addStep(array, j + 1); // 挿入位置の確定を記録
        }
    }

    private void quickSortWithSteps(List<Integer> array, int low, int high, boolean ascending) {
        if (low < high) {
            int pivot = array.get(high);
            int i = low - 1;
            for (int j = low; j < high; j++) {
                boolean compare = ascending ? array.get(j) < pivot : array.get(j) > pivot;
                if (compare) {
                    i++;
                    int temp = array.get(i);
                    array.set(i, array.get(j));
                    array.set(j, temp);
                    addStep(array, i, j); // スワップを記録
                }
            }
            int temp = array.get(i + 1);
            array.set(i + 1, array.get(high));
            array.set(high, temp);
            addStep(array, i + 1, high); // ピボットの確定を記録

            quickSortWithSteps(array, low, i, ascending);
            quickSortWithSteps(array, i + 2, high, ascending);
        }
    }

    private void mergeSortWithSteps(List<Integer> array, int left, int right, boolean ascending) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortWithSteps(array, left, mid, ascending);
            mergeSortWithSteps(array, mid + 1, right, ascending);
            
            // 分けるタイミングを可視化（コピー）
            List<Integer> leftPart = new ArrayList<>(array.subList(left, mid + 1));
            List<Integer> rightPart = new ArrayList<>(array.subList(mid + 1, right + 1));
            
            // 範囲を一度クリアして「分けた」ことを表現
            for (int m = left; m <= right; m++) {
                array.set(m, 0); 
            }
            addStep(array); // 分けられた状態を記録

            int i = 0, j = 0, k = left;
            while (i < leftPart.size() && j < rightPart.size()) {
                boolean compare = ascending ? leftPart.get(i) <= rightPart.get(j) : leftPart.get(i) >= rightPart.get(j);
                if (compare) {
                    array.set(k++, leftPart.get(i++));
                } else {
                    array.set(k++, rightPart.get(j++));
                }
                addStep(array, k - 1); // 元に戻る（代入）タイミングで記録
            }
            while (i < leftPart.size()) {
                array.set(k++, leftPart.get(i++));
                addStep(array, k - 1);
            }
            while (j < rightPart.size()) {
                array.set(k++, rightPart.get(j++));
                addStep(array, k - 1);
            }
        }
    }

    private void heapSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapifyWithSteps(array, n, i, ascending);
        }
        for (int i = n - 1; i > 0; i--) {
            int temp = array.get(0);
            array.set(0, array.get(i));
            array.set(i, temp);
            addStep(array, 0, i);
            heapifyWithSteps(array, i, 0, ascending);
        }
    }

    private void heapifyWithSteps(List<Integer> array, int n, int i, boolean ascending) {
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
            addStep(array, i, largest);
            heapifyWithSteps(array, n, largest, ascending);
        }
    }

    private void shellSortWithSteps(List<Integer> array, boolean ascending) {
        int n = array.size();
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = array.get(i);
                int j = i;
                while (j >= gap && (ascending ? array.get(j - gap) > temp : array.get(j - gap) < temp)) {
                    array.set(j, array.get(j - gap));
                    addStep(array, j, j - gap);
                    j -= gap;
                }
                array.set(j, temp);
                addStep(array, j);
            }
        }
    }

    private void bucketSortWithSteps(List<Integer> array, boolean ascending) {
        if (array.isEmpty()) return;
        int max = Collections.max(array);
        int min = Collections.min(array);
        int range = max - min + 1;
        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i < range; i++) buckets.add(new ArrayList<>());

        // バケットに分ける
        for (int i = 0; i < array.size(); i++) {
            int val = array.get(i);
            buckets.get(val - min).add(val);
            array.set(i, 0); // 分けられたことを表現
            addStep(array, i); 
        }

        // 戻す
        int index = 0;
        for (List<Integer> bucket : buckets) {
            if (!ascending) Collections.sort(bucket, Collections.reverseOrder());
            else Collections.sort(bucket);
            for (int val : bucket) {
                array.set(index++, val);
                addStep(array, index - 1);
            }
        }
    }

    private void radixSortWithSteps(List<Integer> array, boolean ascending) {
        if (array.isEmpty()) return;
        int max = Collections.max(array);
        for (int exp = 1; max / exp > 0; exp *= 10) {
            List<List<Integer>> buckets = new ArrayList<>();
            for (int i = 0; i < 10; i++) buckets.add(new ArrayList<>());

            // 桁ごとに分ける
            for (int i = 0; i < array.size(); i++) {
                int val = array.get(i);
                int digit = (val / exp) % 10;
                buckets.get(digit).add(val);
                array.set(i, 0);
                addStep(array, i);
            }

            // 戻す
            int index = 0;
            if (ascending) {
                for (int i = 0; i < 10; i++) {
                    for (int val : buckets.get(i)) {
                        array.set(index++, val);
                        addStep(array, index - 1);
                    }
                }
            } else {
                for (int i = 9; i >= 0; i--) {
                    for (int val : buckets.get(i)) {
                        array.set(index++, val);
                        addStep(array, index - 1);
                    }
                }
            }
        }
    }
}