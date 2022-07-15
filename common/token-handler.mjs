import { MongoClient, ServerApiVersion } from "mongodb";
import { ethers } from "ethers";
import { abi } from "../contracts/antonym_abi.json";

const https = require("https");

const URI = process.env.VITE_MONGODB_URL;
const dbName = process.env.VITE_MONGODB_NAME;
const scAddress = process.env.VITE_CONTRACT_ADDRESS;
const isTestnet = true;
const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

export const find = async (tokenID) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("tokens");
  let document = await collection.findOne({ tokenID: tokenID });
  if (!document) {
    document = await fetchNftById(tokenID);
  }
  return document;
};

export const findOrFetch = async (tokenuri, ownerAddress) => {
  await client.connect();
  const nftID = tokenuri.substring(tokenuri.lastIndexOf("/") + 1);
  const db = client.db(dbName);
  const collection = db.collection("tokens");
  const document = await collection.findOne({ tokenID: nftID });
  if (document == null) {
    try {
      const nftmeta = await fetchNft(tokenuri);

      const nftObj = JSON.parse(nftmeta);
      collection.insertOne({ ...nftObj, tokenID: nftID, owner: ownerAddress });
      return JSON.stringify(nftObj);
    } catch (error) {
      return JSON.stringify(error);
    }
  }
  return document;
};

export const updateToken = async (tokenID, _data) => {
  const client = await MongoClient.connect(URI, { useUnifiedTopology: true });
  const db = client.db(dbName);
  const collection = db.collection("tokens");

  await collection.updateOne({ tokenID }, { $set: { ..._data } });
  await client.close();
  return true;
};
export const refreshMeta = async (tokenID) => {
  https.get(
    `https://testnets-api.opensea.io/api/v1/asset/${scAddress}/${tokenID}/?force_update=true`
  );
};
export const getTokenOwner = async (tokenID) => {
  const provider = new ethers.providers.InfuraProvider(
    process.env.VITE_CHAIN_NETWORK,
    process.env.VITE_INFURA_PROJECT
  );
  // const signer = new ethers.Wallet(
  //   process.env.VITE_CONTRACT_OWNER_PRIVATE_KEY,
  //   provider
  // )
  const contract = new ethers.Contract(
    process.env.VITE_CONTRACT_ADDRESS,
    abi,
    provider
  );
  return await contract.ownerOf(tokenID);
};

const fetchNft = async (tokenuri) => {
  const httpRequest = (url) => {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          res.setEncoding("utf8");
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve(body));
        })
        .on("error", reject);
    });
  };
  return await httpRequest(tokenuri);
};

export const fetchNftById = async (tokenId) => {
  const httpRequest = (url) => {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          res.setEncoding("utf8");
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve(body));
        })
        .on("error", reject);
    });
  };
  return await httpRequest(
    "https://antonymnft.s3.us-west-1.amazonaws.com/json/" + tokenId
  );
};

export const findToken = async (tokenID) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("tokens");
  const document = await collection.findOne({ tokenID });
  return document;
};
