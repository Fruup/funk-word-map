import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
// Import your language translation files
import translation from 'zod-i18n-map/locales/de/zod.json'

// lng and resources key depend on your locale.
i18next.init({
	lng: 'de',
	resources: {
		de: { zod: translation },
	},
})

z.setErrorMap(zodI18nMap)

export const formSchema = z.object({
	zipCode: z.string().regex(/\d{5}/g, 'Muss aus 5 Ziffern bestehen'),
	value: z.string().min(3).max(50),
})

export type FormSchema = typeof formSchema
