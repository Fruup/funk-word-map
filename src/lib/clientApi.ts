import type { Api } from './server/api'

export const clientApi = {
	async call<Operation extends keyof Api>(
		operation: Operation,
		...params: Parameters<Api[Operation]>
	): Promise<ReturnType<Api[Operation]>> {
		const response = await fetch(`/api`, {
			method: 'POST',
			body: JSON.stringify([operation, ...params]),
		})

		return response.json()
	},
}
