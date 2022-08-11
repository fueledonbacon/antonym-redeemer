import { MongoClient } from "mongodb";
import { Shopify, DataType } from "@shopify/shopify-api";

const dbName = process.env.VITE_MONGODB_NAME;
const URI = process.env.VITE_MONGODB_URL;
const adminToken = process.env.VITE_SHOPIFY_ADMIN_TOKEN;
const SHOPIFY_HOST = process.env.VITE_SHOPIFY_HOST;
const shopifyRestClient = new Shopify.Clients.Rest(SHOPIFY_HOST, adminToken);


export const storeOrder = async (orderID, address, tokenIDs) => {
	const client = await MongoClient.connect(URI, { useUnifiedTopology: true });
	const db = client.db(dbName);
	const collection = db.collection("orders");

	await collection.insertOne({
		userAddress: address,
		payerAddress: null,
		payment_tx: null,
		order_id: orderID,
		token_ids: tokenIDs,
	});
	await client.close();
	return true;
};

export const getOrder = async (orderID) => {
	const client = await MongoClient.connect(URI, { useUnifiedTopology: true });
	await client.connect()
	const db = client.db(dbName)
	const collection = db.collection('orders')
	const document = await collection.findOne({order_id: orderID })
	console.log(document);
	await client.close()
	return document
}

export const updateOrder = async (orderID, _data) => {
	const client = await MongoClient.connect(URI, { useUnifiedTopology: true });
	const db = client.db(dbName);
	const collection = db.collection("orders");

	await collection.updateOne({ order_id: orderID }, { $set: { ..._data } });
	await client.close();
	return true;
};
export const setShipping = async (orderID, _data) => {
  console.log(orderID);
  console.log(_data.provider);
	const order = await shopifyRestClient.put({
		path: `draft_orders/${orderID}`,
		data: {
      draft_order: {
      id: orderID,
      shipping_line: {
			  custom: true,
			  title: `${_data.provider} - ${_data.country}`,
			  price: _data.price,
			  code: `${_data.provider}-${_data.country}`
      }}
		},
		type: DataType.JSON,
	});
	return order;
};

export const completeOrder = async orderID => {
	const order = await shopifyRestClient.put({
		path: `draft_orders/${orderID}/complete`,
		data: {
			draft_order_id: orderID,
			payment_pending: false,
		},
		type: DataType.JSON,
	});
	return order;
};
