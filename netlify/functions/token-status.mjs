
import { findToken, fetchNftById } from '../../common/token-handler.mjs'

export const handler = async (event, context) => {
  const { tokenID } = JSON.parse(event.body)
  const metadata = await fetchNftById(tokenID)
  if(!metadata) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Token not found' })
    }
  }
  
  const statusTrait = metadata.attributes.find((attr) => attr.trait_type === 'STATUS')

  if(!statusTrait) {
    return {
      statusCode: 200,
      body: JSON.stringify({ redeemed: false })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ redeemed: statusTrait.value === 'redeemed' })
  }
}
