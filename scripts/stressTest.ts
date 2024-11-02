function sendRequest(ctx: { nSuccess: number; nError: number }) {
	return fetch('http://localhost:5173/api', {
		method: 'POST',
		body: JSON.stringify([
			'createEntry',
			{
				value: '_testing',
				zipCode: '55122',
			},
		]),
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((response) => {
			if (response.ok) {
				ctx.nSuccess++
			} else {
				console.error(response)
				ctx.nError++
			}
		})
		.catch((e) => {
			console.error(e)
			ctx.nError++
		})
}

const nBurst = 5000
const burstDuration = 10000

const ctx = {
	nSuccess: 0,
	nError: 0,
}

for (let i = 0; i < nBurst; i++) {
	setTimeout(() => {
		sendRequest(ctx)
	}, Math.random() * burstDuration)
}

process.on('exit', () => {
	console.log(ctx)
})
