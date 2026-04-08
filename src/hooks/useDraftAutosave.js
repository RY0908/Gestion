import { useCallback, useEffect, useRef } from 'react'

export function useDraftAutosave({
    draftKey,
    watch,
    reset,
    onLoadDraft,
    buildDraft,
    intervalMs = 30000,
}) {
    const watchRef = useRef(watch)
    const buildDraftRef = useRef(buildDraft)
    const onLoadDraftRef = useRef(onLoadDraft)

    useEffect(() => {
        watchRef.current = watch
    }, [watch])

    useEffect(() => {
        buildDraftRef.current = buildDraft
    }, [buildDraft])

    useEffect(() => {
        onLoadDraftRef.current = onLoadDraft
    }, [onLoadDraft])

    useEffect(() => {
        if (!draftKey || typeof window === 'undefined') return

        const saved = localStorage.getItem(draftKey)
        if (!saved) return

        try {
            const draft = JSON.parse(saved)
            onLoadDraftRef.current?.(draft, reset)
        } catch {
            // Ignore malformed drafts.
        }
    }, [draftKey, reset])

    const saveDraft = useCallback(() => {
        if (!draftKey || typeof window === 'undefined') return

        const formData = watchRef.current?.()
        const payload = buildDraftRef.current ? buildDraftRef.current(formData) : { formData }
        localStorage.setItem(
            draftKey,
            JSON.stringify({ ...payload, savedAt: Date.now() })
        )
    }, [draftKey])

    useEffect(() => {
        const interval = setInterval(saveDraft, intervalMs)
        return () => clearInterval(interval)
    }, [saveDraft, intervalMs])

    return saveDraft
}
