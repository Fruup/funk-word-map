import { initializeSentry } from '$lib/errors'
import { Sentry } from '$lib/errors/client'
initializeSentry(Sentry)

import { type HandleClientError } from '@sveltejs/kit'

export const handleError: HandleClientError = ({ error, event, message, status }) => {
	console.error(error)

	const errorId = Sentry.captureException(error, {
		extra: { event, status },
	})

	return {
		status,
		message,
		errorId,
	}
}
