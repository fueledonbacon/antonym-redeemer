import { find } from "../../common/token-handler.mjs";

export const handler = async function (event, context) {
  const nftId = event.queryStringParameters.id;
  try {
    const nft = await find(nftId);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify(nft),
    };
  } catch (error) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 500,
      body: error.toString(),
    };
  }
};
