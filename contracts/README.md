# Contracts

Here are some prior production contracts, modify to suit the needs of current launch


npx hardhat run --network rinkeby ./scripts/rinkeby_deploy.js
npx hardhat run --network mainnet ./scripts/mainnet_deploy.js

npx hardhat verify 0x92543Ff16D69277788259535B256acFb84bBbE28 --network rinkeby --constructor-args ./scripts/materia.js --libraries ./scripts/libraries.js 
npx hardhat verify 0xb60bB63a5FE952A69e966be5d7f7eDd12209910c --network mainnet --constructor-args ./scripts/cyberlionz_merger.js


npx hardhat verify --network rinkeby 0x21DF2893835edc34606E8808600611e54f5cFC77 "https://antonymnft.s3.us-west-1.amazonaws.com/json/"
## Rinkeby
Antonym Mock deployed to address: 0x21DF2893835edc34606E8808600611e54f5cFC77b
VerifySignature Lib deployed to address: 0x6294c942A060807009Bfe8C0EA18bC39151d7fdE
Materia deployed to address: 0xcbDBB600E004c03F6Bae36162f2628CEf3E24999

# Mainnet Deployment step by step guide
<div>
    <p>Create a .env file in the root and copy-paste the contents of .env.mainnet in it</p>
    <p>Go to the materia.js file located in the scripts folder and fill the values in the module.exports array</p>
    <ul>
        <li>Start and end time are unix like values, you can use https://www.epochconverter.com/ to calculate the values in seconds</li>
        <li>The merkleroot value corresponds to the 1/1 skin name antonym tokens, make sure these values are ok</li>
        <li>The merkleroot value corresponds to the 1/1 skin name antonym tokens, make sure these values are ok (there has to be 52 1/1 tokens), 
        a script was written to obtain these tokens, just make sure these are ok</li>
        <li>Leave the SIGNER value as it is, this one is in charge of signing metadata on the server side</li>
        <li>Leave the ANTONYM value as it is, just make sure that in the .env file the value corresponds to the antonym token address</li>
    </ul>
    <p>From the root folder run the following script:</p>
    <ul>
        <li>npx hardhat run --network mainnet ./scripts/mainnet_deploy.js</li>
        <li>This will launch both the VerifySignature library and the Materia contract, make sure you copy-paste the contract addresses below and the args values, this will be used for contract verification on etherscan, dont miss these values, they are really important</li>
        <li>Once everything is deployed, let fueledOnBacon know these values</li>
    </ul>
</div>

## Mainnet

