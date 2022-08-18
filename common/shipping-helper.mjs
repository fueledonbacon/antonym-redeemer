import * as prices from "../src/consts/shipping_fees.json"
export const calculateShipping = (items,address) => {
  try {
    let air = 0
    let bundled = 0
    items.forEach((item) => {
      if(prices["AIR"][address.country][item.size]==0){
        air=null
        console.log("error");
        return false;
      } else {
        air += prices["AIR"][address.country][item.size]
      }
    })
    items.forEach((item) => {
      if(prices["BUNDLED"][address.country][item.size]==0){
        console.log("error");
        bundled=null
        return false;
      } else {
        console.log('entro')
        bundled += prices["BUNDLED"][address.country][item.size]
      }
    })
    
    const fee = {
      'air':  (air)? Number.parseFloat(air).toFixed(2): null,
      'bundled': (bundled)? Number.parseFloat(bundled).toFixed(2): null
    }
    return fee

  } catch (error) {
    console.log(error);
  }
};