import axios from 'axios'

export const handler = async (event, context) => {
	try {
		const id = event.queryStringParameters.id
		const uri = `https://api.opensea.io/api/v1/asset/${process.env.VITE_CONTRACT_ADDRESS}/${id}?force_update=true`
		const data = await axios.get(uri)

		return {
			statusCode: 200,
			body: JSON.stringify({
				called: uri,
				data
			}),
		}
	} catch (error) {
		console.log('Error:', error)

		return {
			statusCode: 500,
			body: JSON.stringify({ ok: false, error }),
		}
	}
}
