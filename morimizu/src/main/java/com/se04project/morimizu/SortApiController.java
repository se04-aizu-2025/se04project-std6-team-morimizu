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
            List<Integer> result = JavaCodeExecutor.executeUserCode(request.getJavaCode(), request.getArray(), null);
            response.put("success", true);
            response.put("result", result);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    /**
     * コンパイルとテストを一括で行うAPI
     */
    @PostMapping("/compile-and-test")
    public Map<String, Object> compileAndTest(@RequestBody JavaCodeRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Integer> inputData = request.getTestData();
            if (inputData == null) {
                inputData = request.getArray();
            }
            String algorithm = request.getTestAlgorithm();

            // ユーザーコード実行
            List<Integer> userResult = JavaCodeExecutor.executeUserCode(request.getJavaCode(), inputData, algorithm);

            // 正解データの生成（バックエンド実装を利用）
            int[] arr = inputData.stream().mapToInt(Integer::intValue).toArray();
            switch (algorithm) {
                case "bubbleSort": BubbleSort.sort(arr); break;
                case "selectionSort": SelectionSort.sort(arr); break;
                case "insertionSort": InsertionSort.sort(arr); break;
                case "quickSort": QuickSort.sort(arr); break;
                case "mergeSort": MergeSort.sort(arr); break;
                case "heapSort": HeapSort.heapSort(arr); break;
                case "shellSort": ShellSort.sort(arr); break;
                case "bucketSort": BucketSort.bucketSort(arr); break;
                case "radixSort": RadixSort.sort(arr); break;
                default: BubbleSort.sort(arr);
            }
            
            List<Integer> backendResult = new ArrayList<>();
            for (int val : arr) {
                backendResult.add(val);
            }

            response.put("success", true);
            response.put("userResult", userResult);
            response.put("backendResult", backendResult);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }
}
