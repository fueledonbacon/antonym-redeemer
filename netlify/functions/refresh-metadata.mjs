import { post } from 'axios'

export const handler = async (event, context) => {
	try {
		const id = event.queryStringParameters.id
		const data = await post(
			`https://api.opensea.io/api/v1/asset/${process.env.VITE_CONTRACT_ADDRESS}/${id}/?force_update=true`
		)

		return {
			statusCode: 200,
			body: JSON.stringify(data),
		}
	} catch (error) {
		console.log('Error:', error)

		return {
			statusCode: 200,
			body: JSON.stringify({ ok: false }),
		}
	}
}
