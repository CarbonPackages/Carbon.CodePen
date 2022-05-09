type Subscription<S> = (state: S) => void;

export abstract class Bloc<S> {
    private internalState: S;
    private listeners: Subscription<S>[] = [];

    public constructor(initalState: S) {
        this.internalState = initalState;
    }

    public get state(): S {
        return this.internalState;
    }

    protected publishState(state: S) {
        this.internalState = state;
        if (this.listeners.length > 0) {
            for (const listener of this.listeners) {
                listener(this.state);
            }
        }
    }

    public subscribe(listener: Subscription<S>) {
        this.listeners.push(listener);
    }

    public unsubscribe(listener: Subscription<S>) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
}
