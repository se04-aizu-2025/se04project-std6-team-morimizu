package com.se04project.morimizu.sort;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * バケットソートアルゴリズム
 */
public class BucketSort {
    public static void bucketSort(int[] arr) {
        if (arr.length == 0) {
            return;
        }

        int max = arr[0];
        int min = arr[0];
        for (int num : arr) {
            if (num > max) {
                max = num;
            } else if (num < min) {
                min = num;
            }
        }

        // バケットを作成
        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i <= max - min; i++) {
            buckets.add(new ArrayList<>());
        }

        // 各要素をバケットに分配
        for (int num : arr) {
            int bucketIndex = num - min;
            buckets.get(bucketIndex).add(num);
        }

        // 各バケットをソート＆元の配列に戻す
        int index = 0;
        for (List<Integer> bucket : buckets) {
            Collections.sort(bucket);
            for (int num : bucket) {
                arr[index++] = num;
            }
        }
    }
}
