package com.se04project.morimizu.sort;

import java.util.ArrayList;

public class RadixSort {
    public static void sort(int[] arr) {
        if (arr == null || arr.length < 2) {
            return;
        }
        int max = arr[0];
        for (int i = 1; i < arr.length; i++) {
            max = Math.max(max, arr[i]);
        }
        int maxDigit = 0;
        while (max != 0) {
            max /= 10;
            maxDigit++;
        }
        int mod = 10;
        int div = 1;
        ArrayList<ArrayList<Integer>> bucketList = new ArrayList<ArrayList<Integer>>();
        for (int i = 0; i < 10; i++) {
            bucketList.add(new ArrayList<>());
        }
        for (int i = 0; i < maxDigit; i++) {
            for (int j = 0; j < arr.length; j++) {
                int num = (arr[j] % mod) / div;
                bucketList.get(num).add(arr[j]);
            }
            int index = 0;
            for (int j = 0; j < bucketList.size(); j++) {
                ArrayList<Integer> bucket = bucketList.get(j);
                for (Integer val : bucket) {
                    arr[index++] = val;
                }
                bucket.clear();
            }
            mod *= 10;
            div *= 10;
        }
    }
}
