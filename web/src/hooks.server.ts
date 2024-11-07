import { initializeSentry } from '$lib/errors'
import { Sentry } from '$lib/errors/server'
initializeSentry(Sentry)

import { type Handle, type HandleServerError, type RequestEvent } from '@sveltejs/kit'
import { api } from './lib/server/api'
import { env } from '$env/dynamic/private'
import { env as publicEnv } from '$env/dynamic/public'

await api.init()

const ADMIN_AUTH = env.ADMIN_AUTH
	? env.ADMIN_AUTH.split(',').map((auth) => Buffer.from(auth).toString('base64'))
	: null

const proxy = proxyHandle(
	{
		/**
		 * Proxy sentry endpoints to monitoring service.
		 * Prevents the requests from being blocked.
		 */
		[`/api/${publicEnv.PUBLIC_SENTRY_DSN_PROJECT_ID}/envelope`]: publicEnv.PUBLIC_SENTRY_DSN_DOMAIN,
	},
	{
		changeOrigin: true,
		credentials: 'include',
	},
)

export const handle: Handle = async ({ event, resolve }) => {
	// Catch sentry requests.
	const proxiedResponse = await proxy(event)
	if (proxiedResponse) return proxiedResponse

	// Secure routes.
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

	const errorId = Sentry.captureException(error, { extra: { event, status } })

	return {
		status,
		message,
		errorId,
	}
}

/**
 * Extension of https://github.com/born05/sveltekit-proxy.
 */
export function proxyHandle(
	proxy: { [key: string]: string },
	options: { debug?: boolean; changeOrigin?: boolean; credentials?: RequestInit['credentials'] } = {
		changeOrigin: true,
	},
): (event: RequestEvent) => Promise<Response | undefined> {
	return async function (event) {
		const { url, request } = event
		const { pathname, search } = url

		/**
		 * Find first matching path
		 */
		const matchingProxy = Object.keys(proxy).find((proxyPath) => pathname.match(proxyPath))
		if (!matchingProxy) return

		const proxyTarget = proxy[matchingProxy]

		/**
		 * Collect request headers
		 */
		const requestHeaders = new Headers(request.headers)
		if (options.changeOrigin) {
			requestHeaders.delete('host')
		}

		if (options.debug) {
			console.debug(`Proxy: ${proxyTarget}${pathname}`, requestHeaders)
		}

		/**
		 * Fetch data from remote server
		 */
		try {
			const response = await fetch(`${proxyTarget}${pathname}${search}`, {
				redirect: 'manual',
				method: request.method,
				headers: requestHeaders,
				body: await request.arrayBuffer(),
				credentials: options.credentials,
			})

			/**
			 * Clean up response headers
			 */
			const responseHeaders = new Headers(response.headers)
			responseHeaders.delete('content-encoding')

			if (options.debug) {
				console.debug(`Proxy response (${response.status}) headers:`, responseHeaders)
			}

			/**
			 * Return response from remote server
			 */
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
			})
		} catch (error) {
			console.error(error)
		}
	}
}
