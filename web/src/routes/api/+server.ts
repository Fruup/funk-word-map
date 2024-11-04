import { api, type Api } from '$lib/server/api'
import { error, json, type RequestHandler } from '@sveltejs/kit'

const publicApiOperations: (keyof Api)[] = ['getOptions', 'createEntry']

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json()
	const [operation, ...params]: [keyof Api, ...any[]] = body

	if (!publicApiOperations.includes(operation)) {
		throw error(403, 'Forbidden')
	}

	if (!api[operation]) {
		throw error(404, 'Not found')
	}

	// @ts-ignore
	return json(await api[operation](...params))
}
