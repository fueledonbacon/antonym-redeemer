import { Shopify, DataType } from "@shopify/shopify-api";
import {
  getTokenOwner,
  updateToken,
  findToken,
} from "../../common/token-handler.mjs";
import { verifySignature } from "../../common/verify-signer.mjs";
import { storeOrder } from "../../common/orders-helper.mjs";
import {
  createUser,
  getUser,
  userHasRedeemedBlack,
  userRedeemBlack,
} from "../../common/users.mjs";
import { utils } from "ethers";

const adminToken = process.env.VITE_SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_HOST = process.env.VITE_SHOPIFY_HOST;

const shopifyRestClient = new Shopify.Clients.Rest(SHOPIFY_HOST, adminToken);

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const {
      ethAddress,
      signature,
      message,
      email,
      discordId,
      name,
      address,
      items,
    } = body;

    let normalizedAddress = utils.getAddress(ethAddress);

    // verify valid user
    try {
      let verified = await verifySignature(
        normalizedAddress,
        message,
        signature
      );
      if (!verified) {
        return { statusCode: 401, body: "Signature is invalid." };
      }
    } catch (error) {
      return { statusCode: 500, body: "Signature is invalid." };
    }

    let tokens = [];
    shipitems = [];

    // check for antonym redemption
    let hasBlack = items.some((item) => item.trait_type === "black");
    if (hasBlack) {
      const hasRedeemedBlack = await userHasRedeemedBlack(normalizedAddress);
      if (hasRedeemedBlack) {
        throw new Error("User has already redeemed black");
      }
    }

    for (const item of items) {
      if (!item) {
        console.debug("item null or undefined");
        continue;
      }
      if (item.trait_type != "black") {
        if (item.selectedTokens.length < 1)
          return { statusCode: 401, body: "NOT_SELECTED_ITEMS." };
        if (item.size == 24 && item.selectedTokens.length < 4) {
          return { statusCode: 401, body: "NEED_MORE_ITEMS." };
        }
        if (item.size == 60 && item.selectedTokens.length < 20) {
          return { statusCode: 401, body: "NEED_MORE_ITEMS." };
        }
        tokens.push(...item.selectedTokens);
      }

      shipitems.push({
        price: 0,
        quantity: 1,
        title: `NFT Capsule: ${item.trait_type} size ${item.size}`,
        grams: 100,
        requires_shipping: true,
      });
    }

    // check that none of the tokens have been redeemed
    for (let index = 0; index < tokens.length; index++) {
      const token = await findToken(tokens[index]);
      if (token && token.redeemed) {
        return {
          statusCode: 400,
          body: `Token ${token.tokenID} already redeemed`,
        };
      }
    }

    // update tokens to have redeemed status, but don't update metadata
    for (let index = 0; index < tokens.length; index++) {
      await updateToken(tokens[index].tokenID, { redeemed: true });
    }

    if (hasBlack) {
      await userRedeemBlack(normalizedAddress);
    }

    // verify ownership
    tokens.forEach(async (element) => {
      if ((await getTokenOwner(element.tokenID)) != normalizedAddress) {
        return { statusCode: 401, body: "NOT_OWNER." };
      }
    });

    // create the draft order
    const data = await shopifyRestClient.post({
      path: "draft_orders",
      data: {
        draft_order: {
          note: `DISCORDID:${discordId}`,
          line_items: shipitems,
          customer: {
            email: email,
            first_name: name,
            note: discordId,
          },
          shipping_line: {
            custom: true,
            title: `STANDARD - ${address.country} `,
            price: 0,
            code: "Standard",
          },
          shipping_address: {
            first_name: name,
            address1: address.address1,
            address2: address.address2,
            province: address.province,
            zip: address.zip,
            city: address.city,
            country: address.country,
          },
          email: email
        },
      },
      type: DataType.JSON,
    });

    let tokenIDs = tokens.map((token) => token.tokenID);

    await storeOrder(data.body.draft_order.id, normalizedAddress, tokenIDs);

    // update tokens to have draft order ID
    for (let index = 0; index < tokens.length; index++) {
      await updateToken(tokens[index].tokenID, {
        draft_order_id: data.body.draft_order.id,
      });
    }

    if ((await getUser(normalizedAddress)) == null) {
      await createUser({
        address: normalizedAddress,
        discordID: discordId,
        email: email,
      });
    }

    return { statusCode: 200, body: JSON.stringify(data.body.draft_order) };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
