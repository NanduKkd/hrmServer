async function sendError(message: string, misc?: object) {
	try {
		await fetch("/error", {
			method: 'POST',
			headers: {
				Authorization: 'Bearer '+auth,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({message, misc})
		})
	} catch (e) {
		console.log('Couldn\'t send error')
		console.error(e)
	}
}