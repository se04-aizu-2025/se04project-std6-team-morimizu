package com.se04project.morimizu;

import com.se04project.morimizu.sort.*;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import static org.junit.jupiter.api.Assertions.*;

/**
 * ソートアルゴリズムのテストクラス
 */
public class SortAlgorithmTests {
    
    /**
     * テスト用の配列をコピーするメソッド
     */
    private int[] copyArray(int[] arr) {
        return Arrays.copyOf(arr, arr.length);
    }
    
    /**
     * テストデータの準備
     */
    @Test
    public void testAllSortAlgorithmsWithRandomArray() {
        // テスト用の配列
        int[] originalArray = {64, 34, 25, 12, 22, 11, 90, 88, 45, 50};
        int[] expected = {11, 12, 22, 25, 34, 45, 50, 64, 88, 90};
        
        // バブルソートのテスト
        int[] bubbleArray = copyArray(originalArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray, "バブルソートが正しく動作していません");
        
        // 選択ソートのテスト
        int[] selectionArray = copyArray(originalArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray, "選択ソートが正しく動作していません");
        
        // クイックソートのテスト
        int[] quickArray = copyArray(originalArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray, "クイックソートが正しく動作していません");
        
        // マージソートのテスト
        int[] mergeArray = copyArray(originalArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray, "マージソートが正しく動作していません");
        
        // シェルソートのテスト
        int[] shellArray = copyArray(originalArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray, "シェルソートが正しく動作していません");
    }
    
    /**
     * 空の配列のテスト
     */
    @Test
    public void testWithEmptyArray() {
        int[] emptyArray = {};
        
        BubbleSort.sort(copyArray(emptyArray));
        SelectionSort.sort(copyArray(emptyArray));
        QuickSort.sort(copyArray(emptyArray));
        MergeSort.sort(copyArray(emptyArray));
        ShellSort.sort(copyArray(emptyArray));
        
        // 空の配列でもエラーが発生しないことを確認
        assertTrue(true);
    }
    
    /**
     * 1要素の配列のテスト
     */
    @Test
    public void testWithSingleElement() {
        int[] singleArray = {5};
        int[] expected = {5};
        
        int[] bubbleArray = copyArray(singleArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray);
        
        int[] selectionArray = copyArray(singleArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray);
        
        int[] quickArray = copyArray(singleArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray);
        
        int[] mergeArray = copyArray(singleArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray);
        
        int[] shellArray = copyArray(singleArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray);
    }
    
    /**
     * 既にソート済みの配列のテスト
     */
    @Test
    public void testWithSortedArray() {
        int[] sortedArray = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        int[] bubbleArray = copyArray(sortedArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray);
        
        int[] selectionArray = copyArray(sortedArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray);
        
        int[] quickArray = copyArray(sortedArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray);
        
        int[] mergeArray = copyArray(sortedArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray);
        
        int[] shellArray = copyArray(sortedArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray);
    }
    
    /**
     * 逆順ソート済みの配列のテスト
     */
    @Test
    public void testWithReverseSortedArray() {
        int[] reverseSortedArray = {10, 9, 8, 7, 6, 5, 4, 3, 2, 1};
        int[] expected = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        
        int[] bubbleArray = copyArray(reverseSortedArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray);
        
        int[] selectionArray = copyArray(reverseSortedArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray);
        
        int[] quickArray = copyArray(reverseSortedArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray);
        
        int[] mergeArray = copyArray(reverseSortedArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray);
        
        int[] shellArray = copyArray(reverseSortedArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray);
    }
    
    /**
     * 重複要素を含む配列のテスト
     */
    @Test
    public void testWithDuplicateElements() {
        int[] duplicateArray = {5, 2, 8, 2, 9, 1, 5, 5, 3, 8};
        int[] expected = {1, 2, 2, 3, 5, 5, 5, 8, 8, 9};
        
        int[] bubbleArray = copyArray(duplicateArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray);
        
        int[] selectionArray = copyArray(duplicateArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray);
        
        int[] quickArray = copyArray(duplicateArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray);
        
        int[] mergeArray = copyArray(duplicateArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray);
        
        int[] shellArray = copyArray(duplicateArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray);
    }
    
    /**
     * 負の数を含む配列のテスト
     */
    @Test
    public void testWithNegativeNumbers() {
        int[] negativeArray = {-5, 10, -2, 8, -15, 0, 3, -1};
        int[] expected = {-15, -5, -2, -1, 0, 3, 8, 10};
        
        int[] bubbleArray = copyArray(negativeArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray);
        
        int[] selectionArray = copyArray(negativeArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray);
        
        int[] quickArray = copyArray(negativeArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray);
        
        int[] mergeArray = copyArray(negativeArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray);
        
        int[] shellArray = copyArray(negativeArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray);
    }
    
    /**
     * nullの入力のテスト
     */
    @Test
    public void testWithNullArray() {
        // nullが渡されてもエラーが発生しないことを確認
        BubbleSort.sort(null);
        SelectionSort.sort(null);
        QuickSort.sort(null);
        MergeSort.sort(null);
        ShellSort.sort(null);
        
        assertTrue(true);
    }
}
