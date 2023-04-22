export default class FrequencyCouter {
    public counter: Map<string, number>;
    constructor() {
        this.counter = new Map();
    }

    countUp(identifier: string) {
        this.counter.set(identifier, (this.counter.get(identifier) || 0) + 1);
    }

    sortAsc() {
        return [...this.counter.entries()].sort(([, freq], [, freq2]) => freq - freq2);
    }

    sortDesc() {
        return [...this.counter.entries()].sort(([, freq], [, freq2]) => freq2 - freq);
    }

}
