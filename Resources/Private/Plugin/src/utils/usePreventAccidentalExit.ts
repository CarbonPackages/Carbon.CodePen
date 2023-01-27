import { useEffect } from "react"

export const usePreventAccidentalExit = () => {
    useEffect(() => {
        const listener = (event: Event) => {
            event.preventDefault();
            return event.returnValue = true;
        };

        window.addEventListener(
            "beforeunload",
            listener
        );

        return () => window.removeEventListener(
            "beforeunload",
            listener
        );
    }, [])
}
