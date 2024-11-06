import { initializeSentry } from '$lib/errors'

export const ssr = false
export const prerender = false

export const load = async () => {
	initializeSentry()
}
