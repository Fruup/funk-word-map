import { superValidate } from 'sveltekit-superforms'
import type { Actions } from './$types'
import { zod } from 'sveltekit-superforms/adapters'
import { formSchema } from './schema'
import { fail } from '@sveltejs/kit'
import { api } from '$lib/server/api'

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema))
		if (!form.valid) return fail(400, { form })

		const data = await api.createEntry(form.data)

		return { form, data }
	},
}
