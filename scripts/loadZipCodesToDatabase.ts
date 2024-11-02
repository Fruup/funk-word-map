import Pocketbase from 'pocketbase'

const pb = new Pocketbase(import.meta.env.DB_URL)
await pb
	.collection('_superusers')
	.authWithPassword(import.meta.env.DB_ADMIN_USER!, import.meta.env.DB_ADMIN_PASSWORD!)
const zipCodesCollection = pb.collection('zipCodes')

const resolveFilePath = (path: string) => Bun.fileURLToPath(new URL(path, import.meta.url))

if (import.meta.main) {
	const { default: zipCodes }: { default: ZipCode[] } = await import(
		resolveFilePath('../data/zipcodes.de.json')
	)

	console.log(zipCodes.length)

	for (let i = 0; i < zipCodes.length; i++) {
		const zipCode = zipCodes[i]

		process.stdout.write(
			`${i.toString().padStart(zipCodes.length.toString().length, ' ')} / ${zipCodes.length}`,
		)

		try {
			await zipCodesCollection.create({
				countryCode: zipCode.country_code,
				zipCode: zipCode.zipcode,
				place: zipCode.place,
				state: zipCode.state,
				stateCode: zipCode.state_code,
				community: zipCode.community,
				lat: parseFloat(zipCode.latitude),
				long: parseFloat(zipCode.longitude),
			})
		} catch (e) {
			console.error(e, e?.toJSON())
		}

		process.stdout.clearLine(0)
		process.stdout.cursorTo(0)
	}
}

interface ZipCode {
	country_code: string
	zipcode: string
	place: string
	state: string
	state_code: string
	province: string
	province_code: string
	community: string
	community_code: string
	latitude: string
	longitude: string
}
