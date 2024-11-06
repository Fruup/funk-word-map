import { initializeSentry, Sentry } from '$lib/errors'
initializeSentry()

import { type Handle, type HandleServerError } from '@sveltejs/kit'
import { api } from './lib/server/api'
import { env } from '$env/dynamic/private'

await api.init()

const ADMIN_AUTH = env.ADMIN_AUTH
	? env.ADMIN_AUTH.split(',').map((auth) => Buffer.from(auth).toString('base64'))
	: null

export const handle: Handle = async ({ event, resolve }) => {
	if (ADMIN_AUTH && event.url.pathname.startsWith('/admin')) {
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

export const handleError: HandleServerError = ({ error, event, message, status }) => {
	console.error(error)

	const errorId = Sentry.captureException(error)

	return {
		status,
		message,
		errorId,
	}
}
