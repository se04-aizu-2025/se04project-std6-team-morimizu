package com.se04project.morimizu.sort;

import java.util.Random;

/**
 * ソートアルゴリズムのテスト用データを生成するクラス
 */
public class TestDataGenerator {
    
    private static final Random random = new Random();
    
    /**
     * ランダムな配列を生成する
     * @param size 配列のサイズ
     * @return ランダムな整数配列
     */
    public static int[] generateRandomArray(int size) {
        if (size <= 0) {
            return new int[0];
        }
        
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = random.nextInt(1000);
        }
        return arr;
    }
    
    /**
     * 指定範囲内のランダムな配列を生成する
     * @param size 配列のサイズ
     * @param min 最小値（含む）
     * @param max 最大値（含む）
     * @return ランダムな整数配列
     */
    public static int[] generateRandomArray(int size, int min, int max) {
        if (size <= 0) {
            return new int[0];
        }
        
        if (min > max) {
            throw new IllegalArgumentException("最小値は最大値以下である必要があります");
        }
        
        int[] arr = new int[size];
        int range = max - min + 1;
        for (int i = 0; i < size; i++) {
            arr[i] = random.nextInt(range) + min;
        }
        return arr;
    }
    
    /**
     * 昇順にソート済みの配列を生成する
     * @param size 配列のサイズ
     * @return 昇順の整数配列
     */
    public static int[] generateSortedArray(int size) {
        if (size <= 0) {
            return new int[0];
        }
        
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = i;
        }
        return arr;
    }
    
    /**
     * 指定範囲内の昇順にソート済みの配列を生成する
     * @param size 配列のサイズ
     * @param min 最小値
     * @param max 最大値
     * @return 昇順の整数配列
     */
    public static int[] generateSortedArray(int size, int min, int max) {
        if (size <= 0) {
            return new int[0];
        }
        
        if (min > max) {
            throw new IllegalArgumentException("最小値は最大値以下である必要があります");
        }
        
        int[] arr = new int[size];
        int range = max - min + 1;
        int step = Math.max(1, range / size);
        
        for (int i = 0; i < size; i++) {
            arr[i] = min + (i * step);
            if (arr[i] > max) {
                arr[i] = max;
            }
        }
        return arr;
    }
    
    /**
     * 逆順にソート済みの配列を生成する
     * @param size 配列のサイズ
     * @return 降順の整数配列
     */
    public static int[] generateReverseSortedArray(int size) {
        if (size <= 0) {
            return new int[0];
        }
        
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = size - i - 1;
        }
        return arr;
    }
    
    /**
     * 指定範囲内の逆順にソート済みの配列を生成する
     * @param size 配列のサイズ
     * @param min 最小値
     * @param max 最大値
     * @return 降順の整数配列
     */
    public static int[] generateReverseSortedArray(int size, int min, int max) {
        if (size <= 0) {
            return new int[0];
        }
        
        if (min > max) {
            throw new IllegalArgumentException("最小値は最大値以下である必要があります");
        }
        
        int[] arr = new int[size];
        int range = max - min + 1;
        int step = Math.max(1, range / size);
        
        for (int i = 0; i < size; i++) {
            arr[i] = max - (i * step);
            if (arr[i] < min) {
                arr[i] = min;
            }
        }
        return arr;
    }
    
    /**
     * 重複要素を含む配列を生成する
     * @param size 配列のサイズ
     * @param uniqueElements ユニークな要素の数
     * @return 重複を含む整数配列
     */
    public static int[] generateArrayWithDuplicates(int size, int uniqueElements) {
        if (size <= 0) {
            return new int[0];
        }
        
        if (uniqueElements <= 0) {
            uniqueElements = 1;
        }
        
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = random.nextInt(uniqueElements);
        }
        return arr;
    }
    
    /**
     * 負の数を含む配列を生成する
     * @param size 配列のサイズ
     * @return 負の数を含む整数配列
     */
    public static int[] generateArrayWithNegativeNumbers(int size) {
        return generateRandomArray(size, -500, 500);
    }
    
    /**
     * 空の配列を生成する
     * @return 空の整数配列
     */
    public static int[] generateEmptyArray() {
        return new int[0];
    }
    
    /**
     * 単一要素の配列を生成する
     * @param value 要素の値
     * @return 単一要素の整数配列
     */
    public static int[] generateSingleElementArray(int value) {
        return new int[]{value};
    }
    
    /**
     * 2つの要素の配列を生成する
     * @param first 最初の要素
     * @param second 次の要素
     * @return 2要素の整数配列
     */
    public static int[] generateTwoElementArray(int first, int second) {
        return new int[]{first, second};
    }
    
    /**
     * すべて同じ値の配列を生成する
     * @param size 配列のサイズ
     * @param value 値
     * @return すべて同じ値の整数配列
     */
    public static int[] generateIdenticalElementsArray(int size, int value) {
        if (size <= 0) {
            return new int[0];
        }
        
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = value;
        }
        return arr;
    }
    
    /**
     * ほぼソート済みの配列を生成する（わずかな乱れを含む）
     * @param size 配列のサイズ
     * @param perturbationCount 乱れの数
     * @return ほぼソート済みの整数配列
     */
    public static int[] generateNearlySortedArray(int size, int perturbationCount) {
        if (size <= 0) {
            return new int[0];
        }
        
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = i;
        }
        
        // ランダムな位置で値を入れ替える
        perturbationCount = Math.min(perturbationCount, size);
        for (int i = 0; i < perturbationCount; i++) {
            int index1 = random.nextInt(size);
            int index2 = random.nextInt(size);
            
            int temp = arr[index1];
            arr[index1] = arr[index2];
            arr[index2] = temp;
        }
        
        return arr;
    }
    
    /**
     * 指定配列のコピーを作成する
     * @param arr コピー元の配列
     * @return 配列のコピー
     */
    public static int[] copyArray(int[] arr) {
        if (arr == null) {
            return null;
        }
        return java.util.Arrays.copyOf(arr, arr.length);
    }
    
    /**
     * 2つの配列が等しいか比較する
     * @param arr1 配列1
     * @param arr2 配列2
     * @return 配列が等しい場合true
     */
    public static boolean arraysEqual(int[] arr1, int[] arr2) {
        if (arr1 == null && arr2 == null) {
            return true;
        }
        
        if (arr1 == null || arr2 == null) {
            return false;
        }
        
        if (arr1.length != arr2.length) {
            return false;
        }
        
        for (int i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 配列が昇順にソート済みか検証する
     * @param arr 検証対象の配列
     * @return ソート済みの場合true
     */
    public static boolean isSortedAscending(int[] arr) {
        if (arr == null || arr.length <= 1) {
            return true;
        }
        
        for (int i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                return false;
            }
        }
        
        return true;
    }
}
