export const carbonCallbackFactory = () => {
    const cache: Record<string, Function> = {};
    return (callback: Function) => {
        const id = callback.toString();
        callback.__carbonCallback = true;
        return (cache[id] ??= callback);
    };
};
