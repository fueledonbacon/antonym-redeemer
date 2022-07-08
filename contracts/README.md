# Contracts

Here are some prior production contracts, modify to suit the needs of current launch


npx hardhat run --network rinkeby ./scripts/rinkeby_deploy.js
npx hardhat run --network mainnet ./scripts/mainnet_deploy.js

npx hardhat verify 0x7579e31D8e8F326e7CB4830797Cd617e7A9ee9bB --network rinkeby --constructor-args ./scripts/materia.js
npx hardhat verify 0xb60bB63a5FE952A69e966be5d7f7eDd12209910c --network mainnet --constructor-args ./scripts/cyberlionz_merger.js


npx hardhat verify --network rinkeby 0x21DF2893835edc34606E8808600611e54f5cFC77 "https://antonymnft.s3.us-west-1.amazonaws.com/json/"
## Rinkeby
Antonym Mock deployed to address: 0x21DF2893835edc34606E8808600611e54f5cFC77


## Mainnet

