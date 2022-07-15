import { find, fetchNftById } from "../../common/token-handler.mjs";

const find = async (tokenID) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("tokens");
  let document = await collection.findOne({ tokenID: tokenID });
  if (!document) {
    document = await fetchNftById(tokenID);
  }
  return document;
};

export const handler = async function (event, context) {
  const nftId = event.queryStringParameters.id;
  try {
    const nft = await find(nftId);
    return { statusCode: 200, body: JSON.stringify(nft) };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
