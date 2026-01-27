package com.se04project.morimizu;

import com.se04project.morimizu.sort.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * ソートアルゴリズムのテストクラス
 * TestDataGeneratorを使用してテストデータを生成
 */
public class SortAlgorithmTests {
    
    /**
     * ランダムな配列でのテスト
     */
    @Test
    public void testAllSortAlgorithmsWithRandomArray() {
        int[] originalArray = TestDataGenerator.generateRandomArray(10, 0, 100);
        int[] expected = TestDataGenerator.copyArray(originalArray);
        
        // 期待値をソート
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(originalArray, expected, "ランダム配列");
    }
    
    /**
     * 空の配列のテスト
     */
    @Test
    public void testWithEmptyArray() {
        int[] emptyArray = TestDataGenerator.generateEmptyArray();
        int[] expected = TestDataGenerator.copyArray(emptyArray);
        
        testAllAlgorithms(emptyArray, expected, "空の配列");
    }
    
    /**
     * 1要素の配列のテスト
     */
    @Test
    public void testWithSingleElement() {
        int[] singleArray = TestDataGenerator.generateSingleElementArray(5);
        int[] expected = TestDataGenerator.copyArray(singleArray);
        
        testAllAlgorithms(singleArray, expected, "単一要素の配列");
    }
    
    /**
     * 2要素の配列のテスト
     */
    @Test
    public void testWithTwoElements() {
        int[] twoArray = TestDataGenerator.generateTwoElementArray(10, 5);
        int[] expected = TestDataGenerator.copyArray(twoArray);
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(twoArray, expected, "2要素の配列");
    }
    
    /**
     * 既にソート済みの配列のテスト
     */
    @Test
    public void testWithSortedArray() {
        int[] sortedArray = TestDataGenerator.generateSortedArray(20, 0, 100);
        int[] expected = TestDataGenerator.copyArray(sortedArray);
        
        testAllAlgorithms(sortedArray, expected, "ソート済み配列");
    }
    
    /**
     * 逆順ソート済みの配列のテスト
     */
    @Test
    public void testWithReverseSortedArray() {
        int[] reverseSortedArray = TestDataGenerator.generateReverseSortedArray(20, 0, 100);
        int[] expected = TestDataGenerator.copyArray(reverseSortedArray);
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(reverseSortedArray, expected, "逆順ソート配列");
    }
    
    /**
     * 重複要素を含む配列のテスト
     */
    @Test
    public void testWithDuplicateElements() {
        int[] duplicateArray = TestDataGenerator.generateArrayWithDuplicates(30, 5);
        int[] expected = TestDataGenerator.copyArray(duplicateArray);
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(duplicateArray, expected, "重複要素を含む配列");
    }
    
    /**
     * 負の数を含む配列のテスト
     */
    @Test
    public void testWithNegativeNumbers() {
        int[] negativeArray = TestDataGenerator.generateArrayWithNegativeNumbers(20);
        int[] expected = TestDataGenerator.copyArray(negativeArray);
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(negativeArray, expected, "負の数を含む配列");
    }
    
    /**
     * すべて同じ値の配列のテスト
     */
    @Test
    public void testWithIdenticalElements() {
        int[] identicalArray = TestDataGenerator.generateIdenticalElementsArray(15, 42);
        int[] expected = TestDataGenerator.copyArray(identicalArray);
        
        testAllAlgorithms(identicalArray, expected, "すべて同じ値の配列");
    }
    
    /**
     * ほぼソート済みの配列のテスト
     */
    @Test
    public void testWithNearlySortedArray() {
        int[] nearlySortedArray = TestDataGenerator.generateNearlySortedArray(50, 5);
        int[] expected = TestDataGenerator.copyArray(nearlySortedArray);
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(nearlySortedArray, expected, "ほぼソート済み配列");
    }
    
    /**
     * 大きなランダム配列のテスト
     */
    @Test
    public void testWithLargeRandomArray() {
        int[] largeArray = TestDataGenerator.generateRandomArray(1000, -10000, 10000);
        int[] expected = TestDataGenerator.copyArray(largeArray);
        java.util.Arrays.sort(expected);
        
        testAllAlgorithms(largeArray, expected, "大規模ランダム配列");
    }
    
    /**
     * すべてのソートアルゴリズムをテストするヘルパーメソッド
     * @param originalArray テスト対象の配列
     * @param expected 期待される結果
     * @param testName テスト名
     */
    private void testAllAlgorithms(int[] originalArray, int[] expected, String testName) {
        // バブルソートのテスト
        int[] bubbleArray = TestDataGenerator.copyArray(originalArray);
        BubbleSort.sort(bubbleArray);
        assertArrayEquals(expected, bubbleArray, "バブルソート - " + testName);
        assertTrue(TestDataGenerator.isSortedAscending(bubbleArray), "バブルソート結果が昇順ではありません - " + testName);
        
        // 選択ソートのテスト
        int[] selectionArray = TestDataGenerator.copyArray(originalArray);
        SelectionSort.sort(selectionArray);
        assertArrayEquals(expected, selectionArray, "選択ソート - " + testName);
        assertTrue(TestDataGenerator.isSortedAscending(selectionArray), "選択ソート結果が昇順ではありません - " + testName);
        
        // クイックソートのテスト
        int[] quickArray = TestDataGenerator.copyArray(originalArray);
        QuickSort.sort(quickArray);
        assertArrayEquals(expected, quickArray, "クイックソート - " + testName);
        assertTrue(TestDataGenerator.isSortedAscending(quickArray), "クイックソート結果が昇順ではありません - " + testName);
        
        // マージソートのテスト
        int[] mergeArray = TestDataGenerator.copyArray(originalArray);
        MergeSort.sort(mergeArray);
        assertArrayEquals(expected, mergeArray, "マージソート - " + testName);
        assertTrue(TestDataGenerator.isSortedAscending(mergeArray), "マージソート結果が昇順ではありません - " + testName);
        
        // シェルソートのテスト
        int[] shellArray = TestDataGenerator.copyArray(originalArray);
        ShellSort.sort(shellArray);
        assertArrayEquals(expected, shellArray, "シェルソート - " + testName);
        assertTrue(TestDataGenerator.isSortedAscending(shellArray), "シェルソート結果が昇順ではありません - " + testName);
    }
}
