export const storedState = <T = any>(
	key: string,
	initialValue: T,
	options?: { debounce?: number },
): { value: T } => {
	let value = $state<T>(
		(() => {
			const stored = localStorage.getItem(key)
			if (stored) {
				try {
					return JSON.parse(stored) as T
				} catch {}
			}

			return initialValue
		})(),
	)

	let timer: ReturnType<typeof setTimeout>

	$effect(() => {
		JSON.stringify(value)
		if (!value) return

		clearTimeout(timer)
		timer = setTimeout(() => {
			localStorage.setItem(key, JSON.stringify(value))
		}, options?.debounce ?? 0)
	})

	return {
		get value() {
			return value
		},
		set value(newValue: T) {
			value = newValue
		},
	}
}

export const controlledEffect = (effect: (cleanup: () => void) => any) => {
	const cleanup = $effect.root(() => {
		$effect(() => {
			effect(cleanup)
		})
	})
}
