import fetch from 'node-fetch'
async function main(){
    const res = await fetch('https://redemption.antonymnft.com/.netlify/functions/list-redeemed-tokens');
    const json = await res.json()
    const ids = json.tokens

    for(const id of ids){
        await fetch(`https://opensea.io/api/v1/asset/0x7e3Ef31186D1BEc0D3f35aD701D065743B84C790/${id}/?force_update=true`)
        console.log('kicking id '+id)
    }
}

main()