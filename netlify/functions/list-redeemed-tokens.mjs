import { listRedeemedTokens } from "../../common/token-handler.mjs"

export const handler = async (event, context) => {
	try {
		const data = await listRedeemedTokens()
		return {
			statusCode: 200,
			body: JSON.stringify({
				count: data.length,
				tokens: data
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
