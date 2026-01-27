package com.se04project.morimizu;

import java.util.List;

public class SortRequest {
    private List<Integer> array;
    private String algorithm;
    private String order;

    public SortRequest() {
    }

    public SortRequest(List<Integer> array, String algorithm, String order) {
        this.array = array;
        this.algorithm = algorithm;
        this.order = order;
    }

    public List<Integer> getArray() {
        return array;
    }

    public void setArray(List<Integer> array) {
        this.array = array;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }
}
