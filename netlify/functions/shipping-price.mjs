import { calculateShipping } from "../../common/shipping-helper.mjs";

export const handler = async function (event, context) {
	const { address, items } = JSON.parse(event.body);
	try {
		const shippingFee = calculateShipping(items, address);
		return {
			statusCode: 200,
			body: JSON.stringify({ shippingOptions: shippingFee })
		}
	} catch (error) {
		return { statusCode: 500, body: error.toString() }
	}
}