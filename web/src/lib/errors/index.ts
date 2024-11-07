import pkg from '../../../package.json'
import { env } from '$env/dynamic/public'
import type { init, isInitialized } from '@sentry/browser'
import { browser } from '$app/environment'

export const initializeSentry = (instance: {
	isInitialized: typeof isInitialized
	init: typeof init
}) => {
	if (instance.isInitialized()) return

	console.log('Initializing Sentry...')

	const { protocol, host } = new URL(env.PUBLIC_ORIGIN)

	const dsn = browser
		? `${protocol}//${env.PUBLIC_SENTRY_DSN_KEY}@${host}/${env.PUBLIC_SENTRY_DSN_PROJECT_ID}` // Proxy
		: `https://${env.PUBLIC_SENTRY_DSN_KEY}@${env.PUBLIC_SENTRY_DSN_DOMAIN}/${env.PUBLIC_SENTRY_DSN_PROJECT_ID}`

	console.log({ dsn })

	instance.init({
		dsn,
		environment: import.meta.env.DEV ? 'development' : env.PUBLIC_ENVIRONMENT || 'production',
		release: (() => {
			let release = `${pkg.name}@${pkg.version}`

			if (env.PUBLIC_SOURCE_COMMIT) {
				release += `+${env.PUBLIC_SOURCE_COMMIT.slice(0, 7)}`
			}

			return release
		})(),
	})

	console.log('Sentry initialized!')
}
