import { initializeSentry } from '$lib/errors'
import { Sentry } from '$lib/errors/client'

export const ssr = false
export const prerender = false

export const load = async () => {
	initializeSentry(Sentry)
}
