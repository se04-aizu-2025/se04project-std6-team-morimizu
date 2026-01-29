package com.se04project.morimizu;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import com.se04project.morimizu.sort.*;

@RestController
@RequestMapping("/api")
public class SortApiController {
    private SortService sortService = new SortService();

    @PostMapping("/sort")
    public List<SortStep> sort(@RequestBody SortRequest request) {
        return sortService.executeSortWithSteps(request.getArray(), request.getAlgorithm(), request.getOrder());
    }

    /**
     * テスト用API：指定されたアルゴリズムで配列をソート
     * 
     * @param request - array（整数リスト）、algorithm（アルゴリズム名）を含むリクエスト
     * @return ソート済みの配列（昇順）
     */
    @PostMapping("/test-algorithm")
    public List<Integer> testAlgorithm(@RequestBody SortRequest request) {
        // リストを配列に変換
        int[] arr = request.getArray().stream().mapToInt(Integer::intValue).toArray();
        String algorithm = request.getAlgorithm();

        // 既存の実装を呼び出し
        switch (algorithm) {
            case "bubbleSort":
                BubbleSort.sort(arr);
                break;
            case "selectionSort":
                SelectionSort.sort(arr);
                break;
            case "insertionSort":
                InsertionSort.sort(arr);
                break;
            case "quickSort":
                QuickSort.sort(arr);
                break;
            case "mergeSort":
                MergeSort.sort(arr);
                break;
            case "heapSort":
                HeapSort.heapSort(arr);
                break;
            case "shellSort":
                ShellSort.sort(arr);
                break;
            case "bucketSort":
                BucketSort.bucketSort(arr);
                break;
            case "radixSort":
                RadixSort.sort(arr);
                break;
            default:
                BubbleSort.sort(arr);
        }

        // 配列をリストに変換して返す
        List<Integer> result = new ArrayList<>();
        for (int value : arr) {
            result.add(value);
        }
        return result;
    }

    /**
     * ユーザーが記述したJavaコードを実行
     * 
     * @param request - javaCode（ソートメソッド実装）、array（テストデータ）を含むリクエスト
     * @return 実行結果（ソート済みの配列またはエラーメッセージ）
     */
    @PostMapping("/execute-java-code")
    public Map<String, Object> executeJavaCode(@RequestBody JavaCodeRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // ユーザーコードを実行
            List<Integer> result = JavaCodeExecutor.executeUserCode(request.getJavaCode(), request.getArray());
            response.put("success", true);
            response.put("result", result);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    /**
     * TestDataGeneratorを使用してテストデータを生成
     * 
     * @param request - dataType（生成するデータのタイプ）、size（配列サイズ）を含むリクエスト
     * @return 生成されたテストデータ
     */
    @PostMapping("/generate-test-data")
    public Map<String, Object> generateTestData(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String dataType = (String) request.get("dataType");
            Integer size = ((Number) request.get("size")).intValue();

            if (size <= 0 || size > 1000) {
                throw new IllegalArgumentException("サイズは1から1000の間で指定してください");
            }

            int[] testData = null;

            switch (dataType) {
                case "random":
                    testData = TestDataGenerator.generateRandomArray(size);
                    break;
                case "sorted":
                    testData = TestDataGenerator.generateSortedArray(size);
                    break;
                case "reverseSorted":
                    testData = TestDataGenerator.generateReverseSortedArray(size);
                    break;
                case "duplicates":
                    int uniqueElements = Math.max(1, size / 5);
                    testData = TestDataGenerator.generateArrayWithDuplicates(size, uniqueElements);
                    break;
                case "negative":
                    testData = TestDataGenerator.generateArrayWithNegativeNumbers(size);
                    break;
                case "nearlySorted":
                    int perturbations = Math.max(1, size / 10);
                    testData = TestDataGenerator.generateNearlySortedArray(size, perturbations);
                    break;
                default:
                    testData = TestDataGenerator.generateRandomArray(size);
            }

            // 配列をリストに変換
            List<Integer> result = new ArrayList<>();
            for (int value : testData) {
                result.add(value);
            }

            response.put("success", true);
            response.put("data", result);
            response.put("dataType", dataType);
            response.put("size", size);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }
}
