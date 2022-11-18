import { ethers } from "ethers";
import {
  getAntonymAbi,
  getMateriaAbi,
} from "../../common/materia-functions.mjs";
import { findToken } from "../../common/token-handler.mjs";

const {
  MATERIA_NETWORK,
  MATERIA_SIGNING_KEY,
  MATERIA_ALCHEMY_API_KEY,
  MATERIA_CONTRACT_ADDRESS,
  MATERIA_GENESIS_ADDRESS,
} = process.env;

async function getSignature(tokens, address) {
  const provider = new ethers.providers.AlchemyProvider(
    MATERIA_NETWORK,
    MATERIA_ALCHEMY_API_KEY
  );
  const privateKey = MATERIA_SIGNING_KEY;
  const signer = new ethers.Wallet(privateKey, provider);

  const materiaAdd = MATERIA_CONTRACT_ADDRESS;
  const antonymAdd = MATERIA_GENESIS_ADDRESS;

  const materia = new ethers.Contract(materiaAdd, getMateriaAbi(), signer);

  const antonym = new ethers.Contract(antonymAdd, getAntonymAbi(), signer);

  const verified = [];
  console.log(tokens)
  await Promise.all(
    tokens.map(async (t) => {
      const owner = await antonym.ownerOf(t);
      let res = await findToken(t.toString());
      if (!res.redeemed) {
        throw new Error(`Resource not redeemable #${t}`);
      }
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

