// Generic debounce hook: delays updating the returned value until the
// specified number of milliseconds have elapsed since the last change.
// Used primarily to throttle API calls during user input (e.g., address search).
import {useState, useEffect} from "react"

//Good for abstracting useEffect that can now be used as where as a hook.
//useDebounce function is now a hook that can be used elsewhere, value taking any value, and delay being the time in number
export default function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]) //Calls useffect to refire upon change in any of these variable

    return debouncedValue;

}