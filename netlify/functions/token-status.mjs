
import { findToken } from '../../common/token-handler.mjs'

export const handler = async (event, context) => {
  const { tokenID } = JSON.parse(event.body)
  const token = await findToken(tokenID)

  return {
    statusCode: 200,
    body: JSON.stringify({ redeemed: token.redeemed })
  }
}
