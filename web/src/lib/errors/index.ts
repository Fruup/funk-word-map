import { browser } from '$app/environment'
import pkg from '../../../package.json'
import { env } from '$env/dynamic/public'

export const Sentry = await (browser ? import('@sentry/browser') : import('@sentry/node'))

export const initializeSentry = () => {
	if (Sentry.isInitialized()) return

	Sentry.init({
		dsn: import.meta.env.PUBLIC_SENTRY_DSN,
		environment: import.meta.env.DEV
			? 'development'
			: import.meta.env.PUBLIC_ENVIRONMENT || 'production',
		release: (() => {
			let release = `${pkg.name}@${pkg.version}`

			if (env.PUBLIC_SOURCE_COMMIT) {
				release += `+${env.PUBLIC_SOURCE_COMMIT.slice(0, 7)}`
			}

			return release
		})(),
	})
}
