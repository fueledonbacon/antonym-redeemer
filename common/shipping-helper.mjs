import * as prices from "../src/consts/shipping_fees.json"
export const calculateShipping = (items,address) => {
  try {
    let air = 0
    let bundled = 0
    items.forEach((item) => air += prices["AIR"][address.country][item.size])
    items.forEach((item) => bundled += prices['BUNDLED'][address.country][item.size])
    const fee = {
      'air': air,
      'bundled': bundled
    }
    return fee

  } catch (error) {
    console.log(error);
  }
};