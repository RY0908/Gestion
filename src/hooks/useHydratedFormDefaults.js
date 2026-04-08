import { useEffect, useRef } from 'react'

/**
 * Re-applies form defaults when the source data becomes available.
 * Keeps dirty values by default so user edits are not lost.
 */
export function useHydratedFormDefaults({
    enabled = true,
    reset,
    values,
    signature,
    keepDirtyValues = true,
    keepTouched = true,
}) {
    const latestValues = useRef(values)

    useEffect(() => {
        latestValues.current = values
    }, [values])

    useEffect(() => {
        if (!enabled) return
        if (!latestValues.current) return
        reset(latestValues.current, { keepDirtyValues, keepTouched })
    }, [enabled, keepDirtyValues, keepTouched, reset, signature])
}
