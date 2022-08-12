import { updateFile } from "../../common/aws-helper.mjs";
import { completeOrder, updateOrder,setShipping, getOrder } from "../../common/orders-helper.mjs";
import {
  updateToken,
  updateTokens,
  refreshMeta,
  findToken,
  getTokens,
} from "../../common/token-handler.mjs";
import { userRedeemBlack } from "../../common/users.mjs";
import { utils } from "ethers";

export const handler = async function (event, context) {
  const { id, address, txhash,shippingDetails } = JSON.parse(event.body);


  let ethAddress = utils.getAddress(address);

  try {

    let fitler = { draft_order_id: id}
    const tokens = await getTokens(fitler)
    const order = await getOrder(id)
    const token_ids = tokens.map((token) => token.tokenID)

   
    if(tokens.some((token) => token.redeemed===true)){ 
      return {
        statusCode: 400,
        body: `Token already redeemed`,
      }
    }

    let updateQuery = {
      $set: {
        redeemed: true
      }
    }    
    let filter = {draft_order_id: id}
    if(order.hasBlack){
      await userRedeemBlack(order.userAddress);
    }
    await updateTokens(filter, updateQuery);

    for (let index = 0; index < token_ids.length; index++) {
      const element = token_ids[index];
      await updateFile(element);
      await refreshMeta();
    }
    

    paymentData = {
    	payerAddress: ethAddress,
    	confirmed: true,
    	txhash: txhash,
    }

    await setShipping(id, shippingDetails)
    await updateOrder(id, paymentData); // UPDATE RECORD IN OUR COLLECTION
    await completeOrder(id) // UPDATE FROM DRAFT TO ORDER SHOPIFY

    return { statusCode: 200, body: "OK" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
