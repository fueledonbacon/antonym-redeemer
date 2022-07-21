import { ethers } from "ethers";
import {
  getAntonymAbi,
  getMateriaAbi,
} from "../../common/materia-functions.mjs";

async function getSignature(tokens, address) {
  const provider = new ethers.providers.AlchemyProvider(
    "rinkeby",
    "zd8NKfBhzD-IV3B9YSpMd1rTMxqBBe3E"
  );
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const signer = new ethers.Wallet(privateKey, provider);

  const materiaAdd = "0x65dDF3952AEFbe94e223715caC15f5C86bAe9F5a";
  const antonymAdd = "0xA0B69178DDc67E8870C39Ea8589b2A8dBf28CBD2";

  const materia = new ethers.Contract(materiaAdd, getMateriaAbi(), signer);

  const antonym = new ethers.Contract(antonymAdd, getAntonymAbi(), signer);

  const verified = [];
  await Promise.all(
    tokens.map(async (t) => {
      const owner = await antonym.ownerOf(t);
      if (owner.toLowerCase() !== address.toLowerCase())
        throw new Error(`You are not owner of token ID #${t}`);
      const redeemed = (await materia.isAntonymTokenUsed(t)).toNumber();
      console.log(t, redeemed);
      if (redeemed === 1) throw new Error(`Token ID #${t} already used`);
      verified.push(t);
    })
  );
  console.log(verified);

  let messageHash = await materia.messageHash(address, tokens);
  return signer.signMessage(ethers.utils.arrayify(messageHash));
}

export const handler = async function (event, context) {
  try {
    const { tokens, address } = JSON.parse(event.body);
    const signedMessage = await getSignature(tokens, address);
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify({ signature: signedMessage }),
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
