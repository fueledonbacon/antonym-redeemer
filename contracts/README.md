# Contracts

Here are some prior production contracts, modify to suit the needs of current launch


npx hardhat run --network rinkeby ./scripts/rinkeby_deploy.js
npx hardhat run --network mainnet ./scripts/mainnet_deploy.js

npx hardhat verify 0x92543Ff16D69277788259535B256acFb84bBbE28 --network rinkeby --constructor-args ./scripts/materia.js --libraries ./scripts/libraries.js 
npx hardhat verify 0xb60bB63a5FE952A69e966be5d7f7eDd12209910c --network mainnet --constructor-args ./scripts/cyberlionz_merger.js


npx hardhat verify --network rinkeby 0xC147BaC2162B53af4b985213cEF8c5359c0C9D09 "https://antonymnft.s3.us-west-1.amazonaws.com/json/"
## GOERLI
npx hardhat run --network goerli ./scripts/goerli/deploy_all.js

## Mainnet
npx hardhat run --network mainnet ./scripts/mainnet/deploy_all.js


