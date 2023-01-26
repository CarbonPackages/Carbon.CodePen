import React from "react";
import { Observable } from "rxjs";

export const useLatestValueFrom = <V>(
    observable$: Observable<V>,
) => {
    const [value, setValue] = React.useState<null | V>(null);

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
