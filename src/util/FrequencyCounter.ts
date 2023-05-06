export default class FrequencyCouter {
    public counter: Map<string, number>;
    public totalCounted: number;
    constructor() {
        this.counter = new Map();
        this.totalCounted = 0;
    }

    countUp(identifier: string) {
        this.counter.set(identifier, (this.counter.get(identifier) || 0) + 1);
        this.totalCounted++;
    }

    sortAsc() {
        return [...this.counter.entries()].sort(([, freq], [, freq2]) => freq - freq2);
    }

    sortDesc() {
        return [...this.counter.entries()].sort(([, freq], [, freq2]) => freq2 - freq);
    }
}
