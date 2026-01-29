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
     * @param algorithm テスト対象のアルゴリズム名（null可）
     * @return ソート済みの配列
     * @throws Exception 実行時エラー
     */
    public static List<Integer> executeUserCode(String javaCode, List<Integer> testArray, String algorithm) throws Exception {
        // タイムアウト設定
        long startTime = System.currentTimeMillis();
        long timeoutMs = 5000; // 5秒

        try {
            // ユーザーコードをメソッドラッパーで包む
            String wrappedCode = wrapUserCode(javaCode);

            // コンパイル
            compileCode(wrappedCode);

            // ロードと実行
            List<Integer> result = executeCompiledCode(testArray, algorithm);

            // タイムアウトチェック
            if (System.currentTimeMillis() - startTime > timeoutMs) {
                throw new Exception("実行タイムアウト（5秒以上の処理）");
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

        // ユーザーが自分で関数を定義している場合（sortに限らず）は、自動ラップを行わずそのまま利用する
        // これにより、ユーザーは自由にメソッド定義やフィールド定義を行える
        if (javaCode.matches("(?s).*\\b(public|protected|private|static|void|int|boolean|String|double|float|char|long|List)[\\s\\[\\]]+\\w+\\s*\\(.*")) {
            sb.append(javaCode);
            sb.append("}\n");
            return sb.toString();
        }

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
    private static List<Integer> executeCompiledCode(List<Integer> inputList, String algorithm) throws Exception {
        try {
            // クラスローダーでクラスをロード
            URLClassLoader classLoader = new URLClassLoader(
                    new URL[] { new java.io.File(TEMP_DIR).toURI().toURL() },
                    JavaCodeExecutor.class.getClassLoader());

            Class<?> cls = classLoader.loadClass(CLASS_NAME);
            Method method = null;
            Class<?> paramType = null;
            boolean methodIsThreeArgs = false;
            boolean preferThreeArgs = algorithm != null && (algorithm.equals("quickSort") || algorithm.equals("mergeSort"));

            // メソッド探索: int[], Integer[], List のいずれかを受け取る public static void メソッドを探す
            // 引数が1つの場合 (array) または 3つの場合 (array, int, int) を許容する
            for (Method m : cls.getDeclaredMethods()) {
                if (!java.lang.reflect.Modifier.isPublic(m.getModifiers()) ||
                    !java.lang.reflect.Modifier.isStatic(m.getModifiers()) ||
                    m.getReturnType() != void.class) {
                    continue;
                }

                int paramCount = m.getParameterCount();
                if (paramCount != 1 && paramCount != 3) {
                    continue;
                }

                Class<?>[] types = m.getParameterTypes();
                Class<?> pt = types[0];
                boolean isValidParam = (pt == int[].class) || (pt == Integer[].class) || java.util.List.class.isAssignableFrom(pt);

                if (!isValidParam) continue;

                boolean isThree = false;
                if (paramCount == 3) {
                    if (types[1] == int.class && types[2] == int.class) {
                        isThree = true;
                    } else {
                        continue;
                    }
                }

                // 優先順位の決定
                // 1. 名前が "sort" であるか
                // 2. 引数の数がアルゴリズムに適しているか (preferThreeArgs)
                
                if (method == null) {
                    method = m;
                    paramType = pt;
                    methodIsThreeArgs = isThree;
                    continue;
                }

                boolean currentIsSort = method.getName().equals("sort");
                boolean newIsSort = m.getName().equals("sort");

                // "sort" という名前を優先
                if (newIsSort && !currentIsSort) {
                    method = m;
                    paramType = pt;
                    methodIsThreeArgs = isThree;
                    continue;
                } else if (!newIsSort && currentIsSort) {
                    continue;
                }

                // 名前優先度が同じ場合、引数の数で判定
                if (preferThreeArgs) {
                    // 3引数を優先
                    if (isThree && !methodIsThreeArgs) {
                        method = m;
                        paramType = pt;
                        methodIsThreeArgs = isThree;
                    }
                } else {
                    // 1引数を優先
                    if (!isThree && methodIsThreeArgs) {
                        method = m;
                        paramType = pt;
                        methodIsThreeArgs = isThree;
                    }
                }
            }

            if (method == null) {
                classLoader.close();
                throw new Exception("実行可能なメソッド（public static void method(int[] | Integer[] | List [, int, int])）が見つかりません。");
            }

            // 引数の準備と実行
            Object argument;
            List<Integer> result = new ArrayList<>();
            int size = inputList.size();

            if (paramType == int[].class) {
                argument = inputList.stream().mapToInt(Integer::intValue).toArray();
            } else if (paramType == Integer[].class) {
                argument = inputList.toArray(new Integer[0]);
            } else {
                argument = new ArrayList<>(inputList);
            }

            if (methodIsThreeArgs) {
                // 3引数の場合: (array, 0, size - 1)
                method.invoke(null, argument, 0, size - 1);
            } else {
                // 1引数の場合: (array)
                method.invoke(null, argument);
            }

            // 結果の取得
            if (paramType == int[].class) {
                for (int val : (int[]) argument) result.add(val);
            } else if (paramType == Integer[].class) {
                java.util.Collections.addAll(result, (Integer[]) argument);
            } else {
                result = (List<Integer>) argument;
            }

            classLoader.close();
            return result;
        } catch (Exception e) {
            throw new Exception("実行時エラー: " + e.getMessage());
        }
    }
}
