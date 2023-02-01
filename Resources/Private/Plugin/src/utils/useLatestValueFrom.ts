import React from "react";
import { Observable } from "rxjs";

export const useLatestValueFrom = <T>(observable$: Observable<T>) => {
    const [value, setValue] = React.useState<T | undefined>();

    React.useEffect(() => {
        const subscription = observable$.subscribe({
            next: (incomingValue) => {
                if (incomingValue !== value) {
                    setValue(incomingValue);
                }
            },
        });

        return () => subscription.unsubscribe();
    }, [observable$]);

    return value;
};
