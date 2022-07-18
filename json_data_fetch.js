
import fetch from 'node-fetch'
import fs from 'fs';

main();

async function main() {
    const arr = new Array(8887).fill(0);
    
    

    const json = {
        meta: []
    }
    await Promise.all(arr.map(async (el, index) => {
        try {
            const data = await fetch(`https://antonymnft.s3.us-west-1.amazonaws.com/json/${index}`)
            let jsonRes = await data.json()
            jsonRes.id = index;
            json.meta.push(jsonRes)
        } catch(e) {
            console.log("Error", index)
        }
        
    }))
    fs.writeFileSync('metadata.json', JSON.stringify(json));
    console.log(json.length)
    
    
}