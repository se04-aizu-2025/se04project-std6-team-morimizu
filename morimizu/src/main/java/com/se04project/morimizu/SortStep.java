package com.se04project.morimizu;

import java.util.List;

public class SortStep {
    private List<Integer> array;
    private List<Integer> comparingIndices;

    public SortStep(List<Integer> array, List<Integer> comparingIndices) {
        this.array = array;
        this.comparingIndices = comparingIndices;
    }

    public List<Integer> getArray() {
        return array;
    }

    public void setArray(List<Integer> array) {
        this.array = array;
    }

    public List<Integer> getComparingIndices() {
        return comparingIndices;
    }

    public void setComparingIndices(List<Integer> comparingIndices) {
        this.comparingIndices = comparingIndices;
    }
}
