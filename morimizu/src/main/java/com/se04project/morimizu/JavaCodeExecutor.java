package com.se04project.morimizu;

import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class JavaCodeExecutor {
    private static final String TEMP_DIR = System.getProperty("java.io.tmpdir");
    private static final String CLASS_NAME = "UserSortCode";

    /**
     * ユーザーが記述したJavaコードを実行
     * 
     * @param javaCode  ユーザーが記述したコード
     * @param testArray テスト対象の配列
     * @return ソート済みの配列
     * @throws Exception 実行時エラー
     */
    public static List<Integer> executeUserCode(String javaCode, List<Integer> testArray) throws Exception {
        // タイムアウト設定
        long startTime = System.currentTimeMillis();
        long timeoutMs = 5000; // 5秒

        // テスト配列をint配列に変換
        int[] arr = testArray.stream().mapToInt(Integer::intValue).toArray();

        try {
            // ユーザーコードをメソッドラッパーで包む
            String wrappedCode = wrapUserCode(javaCode);

            // コンパイル
            compileCode(wrappedCode);

            // ロードと実行
            executeCompiledCode(arr);

            // タイムアウトチェック
            if (System.currentTimeMillis() - startTime > timeoutMs) {
                throw new Exception("実行タイムアウト（5秒以上の処理）");
            }

            // 結果をListに変換
            List<Integer> result = new ArrayList<>();
            for (int value : arr) {
                result.add(value);
            }
            return result;

        } catch (Exception e) {
            throw new Exception("コード実行エラー: " + e.getMessage());
        }
    }

    /**
     * ユーザーコードをクラスメソッドで包む
     */
    private static String wrapUserCode(String javaCode) {
        StringBuilder sb = new StringBuilder();
        sb.append("import java.util.*;\n");
        sb.append("public class ").append(CLASS_NAME).append(" {\n");
        sb.append("    public static void sort(int[] arr) {\n");

        // ユーザーコードを分析して、メソッド定義とメソッド呼び出しを分離
        String[] lines = javaCode.split("\n");
        StringBuilder methodCalls = new StringBuilder();
        StringBuilder methodDefs = new StringBuilder();

        boolean inMethod = false;
        int braceCount = 0;

        for (String line : lines) {
            String trimmed = line.trim();

            // メソッド定義の開始判定
            if (trimmed.matches(".*\\b(void|int|boolean|String|double|float)\\s+\\w+\\s*\\(.*")) {
                inMethod = true;
                methodDefs.append("    ").append(line).append("\n");
                braceCount += countChar(line, '{') - countChar(line, '}');
            } else if (inMethod) {
                methodDefs.append("    ").append(line).append("\n");
                braceCount += countChar(line, '{') - countChar(line, '}');
                if (braceCount == 0) {
                    inMethod = false;
                }
            } else {
                // メソッド本体のコード
                methodCalls.append("        ").append(line).append("\n");
            }
        }

        // sort メソッド本体
        sb.append(methodCalls);
        sb.append("    }\n");

        // ヘルパーメソッド定義
        sb.append(methodDefs);

        sb.append("}\n");
        return sb.toString();
    }

    /**
     * 文字列内の特定の文字をカウント
     */
    private static int countChar(String str, char ch) {
        int count = 0;
        for (char c : str.toCharArray()) {
            if (c == ch)
                count++;
        }
        return count;
    }

    /**
     * Javaコードをコンパイル
     */
    private static void compileCode(String sourceCode) throws Exception {
        String sourceFile = TEMP_DIR + CLASS_NAME + ".java";
        String classFile = TEMP_DIR + CLASS_NAME + ".class";

        // ソースファイルを書き込み
        Files.write(Paths.get(sourceFile), sourceCode.getBytes());

        // コンパイル実行
        ProcessBuilder pb = new ProcessBuilder("javac", "-cp", TEMP_DIR, sourceFile);
        pb.directory(new java.io.File(TEMP_DIR));
        Process p = pb.start();

        int exitCode = p.waitFor();
        if (exitCode != 0) {
            String error = new String(p.getErrorStream().readAllBytes());
            throw new Exception("コンパイルエラー: " + error);
        }
    }

    /**
     * コンパイルされたクラスを実行
     */
    private static void executeCompiledCode(int[] arr) throws Exception {
        try {
            // クラスローダーでクラスをロード
            URLClassLoader classLoader = new URLClassLoader(
                    new URL[] { new java.io.File(TEMP_DIR).toURI().toURL() },
                    JavaCodeExecutor.class.getClassLoader());

            Class<?> cls = classLoader.loadClass(CLASS_NAME);
            Method method = cls.getMethod("sort", int[].class);
            method.invoke(null, (Object) arr);

            classLoader.close();
        } catch (Exception e) {
            throw new Exception("実行時エラー: " + e.getMessage());
        }
    }
}
