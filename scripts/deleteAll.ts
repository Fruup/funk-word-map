import Pocketbase from 'pocketbase'

const pb = new Pocketbase(import.meta.env.DB_URL)
await pb
	.collection('_superusers')
	.authWithPassword(import.meta.env.DB_ADMIN_USER!, import.meta.env.DB_ADMIN_PASSWORD!)

const collectionName = Bun.argv[2]
console.log(`Deleting collection: ${collectionName}`)
const collection = pb.collection(collectionName)

const items = await collection.getFullList({ batch: 10000 })
for (const item of items) {
	await collection.delete(item.id)
}
