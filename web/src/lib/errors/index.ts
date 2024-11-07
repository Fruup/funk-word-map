import pkg from '../../../package.json'
import { env } from '$env/dynamic/public'
import type { init, isInitialized } from '@sentry/browser'
import { browser } from '$app/environment'

export const initializeSentry = (instance: {
	isInitialized: typeof isInitialized
	init: typeof init
}) => {
	if (instance.isInitialized()) return

	const { protocol, host } = new URL(env.PUBLIC_ORIGIN)

	const dsn = browser
		? `${protocol}//${env.PUBLIC_SENTRY_DSN_KEY}@${host}/${env.PUBLIC_SENTRY_DSN_PROJECT_ID}` // Proxy
		: `https://${env.PUBLIC_SENTRY_DSN_KEY}@${env.PUBLIC_SENTRY_DSN_DOMAIN}/${env.PUBLIC_SENTRY_DSN_PROJECT_ID}`

	const environment = import.meta.env.DEV ? 'development' : env.PUBLIC_ENVIRONMENT || 'production'

	const release = (() => {
		let release = `${pkg.name}@${pkg.version}`

		if (env.PUBLIC_SOURCE_COMMIT) {
			release += `+${env.PUBLIC_SOURCE_COMMIT.slice(0, 7)}`
		}

		return release
	})()

	console.log('Initializing Sentry...', { dsn, release, environment })

	instance.init({
		dsn,
		environment,
		release,
		debug: import.meta.env.DEV,
	})

	console.log('Sentry initialized!')
}
