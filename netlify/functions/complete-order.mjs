import { updateFile } from "../../common/aws-helper.mjs";
import { completeOrder, updateOrder,setShipping, getOrder } from "../../common/orders-helper.mjs";
import {
  updateToken,
  updateTokens,
  refreshMeta,
  findToken,
} from "../../common/token-handler.mjs";
import { userRedeemBlack } from "../../common/users.mjs";
import { utils } from "ethers";

export const handler = async function (event, context) {
  const { id, address, txhash, redeemItems,shippingDetails } = JSON.parse(event.body);


  let ethAddress = utils.getAddress(address);

  try {
    
    let hasBlack = redeemItems.some((item) => item.trait_type === "black");
  const { token_ids } =  await getOrder(id)

    for (let index = 0; index < token_ids.length; index++) {
      const token = await findToken(token_ids[index]);
      if (token && token.redeemed) {
        return {
          statusCode: 400,
          body: `Token ${token.tokenID} already redeemed`,
        };
      }
    }


    let updateQuery = {
      $set: {
        redeemed: true
      }
    }
    let filter = {draft_order_id: id}
    await updateTokens(filter, updateQuery);
    for (let index = 0; index < token_ids.length; index++) {
      const element = token_ids[index];
      await updateFile(element);
      await refreshMeta(element);
    }
    
    paymentData = {
    	payerAddress: ethAddress,
    	confirmed: true,
    	txhash: txhash,
    }

    await setShipping(id, shippingDetails)
    await updateOrder(id, paymentData); // UPDATE RECORD IN OUR COLLECTION
    await completeOrder(id) // UPDATE FROM DRAFT TO ORDER SHOPIFY
    // if (hasBlack) {
    //   await userRedeemBlack(ethAddress);
    // }
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
