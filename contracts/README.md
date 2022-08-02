# Contracts

Here are some prior production contracts, modify to suit the needs of current launch


npx hardhat run --network rinkeby ./scripts/rinkeby_deploy.js
npx hardhat run --network mainnet ./scripts/mainnet_deploy.js

npx hardhat verify 0x92543Ff16D69277788259535B256acFb84bBbE28 --network rinkeby --constructor-args ./scripts/materia.js --libraries ./scripts/libraries.js 
npx hardhat verify 0xb60bB63a5FE952A69e966be5d7f7eDd12209910c --network mainnet --constructor-args ./scripts/cyberlionz_merger.js


npx hardhat verify --network rinkeby 0xC147BaC2162B53af4b985213cEF8c5359c0C9D09 "https://antonymnft.s3.us-west-1.amazonaws.com/json/"
## Rinkeby
Antonym Mock deployed to address: 0x21DF2893835edc34606E8808600611e54f5cFC77b
VerifySignature Lib deployed to address: 0xEb7b43EC25957e8b2EbCC342faA2fc3A925fA8B0
Materia deployed to address: 0x57966f291eb9Aa4095cBa71Ba9e3f5A04EBAda4F

# Mainnet Deployment step by step guide
<div>
    <p>Create a .env file in the root and copy-paste the contents of .env.mainnet in it</p>
    <p>Go to the materia.js file located in the scripts folder and fill the values in the module.exports array</p>
    <ul>
        <li>Start and end time are unix like values, you can use https://www.epochconverter.com/ to calculate the values in seconds</li>
        <li>Leave the SIGNER value as it is, this one is in charge of signing metadata on the server side</li>
        <li>Leave the ANTONYM value as it is, just make sure that in the .env file the value corresponds to the Antonym ERC721 token address</li>
        <li>Make sure the array of the 1of1 skin tokens is correct</li>
    </ul>
    <p>From the root folder run the following script:</p>
    <ul>
        <li>npx hardhat run --network mainnet ./scripts/mainnet_deploy.js</li>
        <li>This will launch both the VerifySignature library and the Materia contract, it will auto verify contracts</li>
        <li>Once everything is deployed and process verification fails, let fueledOnBacon know these values so they can verify the contract</li>
    </ul>
</div>

## Mainnet
Antonym 0x7e3Ef31186D1BEc0D3f35aD701D065743B84C790
Paste in the contracts deployed on mainnet (VerifySignature, Materia)


