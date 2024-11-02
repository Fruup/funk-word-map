import Pocketbase, { ClientResponseError, type RecordModel } from 'pocketbase'
import { env } from '$env/dynamic/private'

const pb = new Pocketbase(env.DB_URL)

const zipCodesCollection = pb.collection('zipCodes')
const entriesCollection = pb.collection('entries')

export const api = {
	async init() {
		pb.autoCancellation(false)
		await pb.collection('_superusers').authWithPassword(env.DB_ADMIN_USER!, env.DB_ADMIN_PASSWORD!)
	},

	async getOptions(query: string) {
		query = query.trim()

		const n = 10

		if (/^\d+$/g.test(query)) {
			return await zipCodesCollection
				.getList(1, n, {
					filter: `zipCode ~ "${query}"`,
				})
				.then(({ items }) => items)
		} else {
			return await zipCodesCollection
				.getList(1, n, {
					filter: `place ~ "${query}"`,
				})
				.then(({ items }) => items)
		}
	},

	async createEntry(data: {
		zipCode: string
		value: string
	}): Promise<{ value: string; lngLat: [number, number] } | undefined> {
		try {
			const { id, long, lat } = await zipCodesCollection.getFirstListItem(
				`zipCode = "${data.zipCode}"`,
			)

			await entriesCollection.create({
				zipCode: id,
				value: data.value,
			})

			return {
				value: data.value,
				lngLat: [long, lat],
			}
		} catch (error) {
			console.log(error)

			if (error instanceof ClientResponseError) {
				console.error(error.response)
			}
		}
	},

	async getAllEntries() {
		const entries = await entriesCollection.getFullList<
			{
				value: string
				expand: {
					zipCode: { zipCode: string; long: number; lat: number }
				}
			} & RecordModel
		>({
			batch: 10000,
			fields: `expand.zipCode.long, expand.zipCode.lat, expand.zipCode.zipCode, value`,
			expand: 'zipCode',
		})

		return entries
	},
}

export type Api = typeof api
