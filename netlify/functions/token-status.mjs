
import { findToken } from '../../common/token-handler.mjs'

export const handler = async function (event, context) {
	const { tokenID } = JSON.parse(event.body)
	let token = await findToken(tokenID)
	return { statusCode: 200, body: JSON.stringify({ redeemed: token.redeemed }) }

}
