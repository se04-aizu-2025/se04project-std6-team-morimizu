package com.se04project.morimizu;

import java.util.List;

public class JavaCodeRequest {
    private String javaCode;
    private List<Integer> array;

    public JavaCodeRequest() {
    }

    public JavaCodeRequest(String javaCode, List<Integer> array) {
        this.javaCode = javaCode;
        this.array = array;
    }

    public String getJavaCode() {
        return javaCode;
    }

    public void setJavaCode(String javaCode) {
        this.javaCode = javaCode;
    }

    public List<Integer> getArray() {
        return array;
    }

    public void setArray(List<Integer> array) {
        this.array = array;
    }
}
