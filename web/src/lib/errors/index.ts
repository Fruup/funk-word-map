import pkg from '../../../package.json'
import { env } from '$env/dynamic/public'
import type { init, isInitialized } from '@sentry/browser'

export const initializeSentry = (instance: {
	isInitialized: typeof isInitialized
	init: typeof init
}) => {
	if (instance.isInitialized()) return

	console.log('Initializing Sentry...')

	instance.init({
		dsn: env.PUBLIC_SENTRY_DSN,
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
