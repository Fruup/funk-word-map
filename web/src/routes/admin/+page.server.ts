import { api } from '$lib/server/api'

export const load = async () => {
	const entries = await api.getAllEntries()

	return {
		entries,
	}
}
