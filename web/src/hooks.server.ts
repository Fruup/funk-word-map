import { type Handle } from '@sveltejs/kit'
import { api } from './lib/server/api'
import { env } from '$env/dynamic/private'

await api.init()

if (!env.ADMIN_AUTH) throw new Error('ADMIN_AUTH is not set')

const ADMIN_AUTH = env.ADMIN_AUTH.split(',').map((auth) => Buffer.from(auth).toString('base64'))

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		const auth = event.request.headers.get('authorization')

		if (!auth || !ADMIN_AUTH.some((adminAuth) => auth === `Basic ${adminAuth}`)) {
			return new Response('Unauthorized', {
				status: 401,
				headers: {
					'WWW-Authenticate': 'Basic',
				},
			})
		}
	}

	return resolve(event)
}
