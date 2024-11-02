import { api, type Api } from '$lib/server/api'
import { error, json, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json()
	const [operation, ...params]: [keyof Api, ...any[]] = body

	if (!api[operation]) {
		throw error(404, 'Not found')
	}

	// @ts-ignore
	return json(await api[operation](...params))
}
