const { ethers } = require('hardhat');
const args = require("./materia")


async function main() {

  console.log("Deploying contracts")
  const Lib = await ethers.getContractFactory("VerifySignature");
  const lib = await Lib.deploy();
  await lib.deployed();
  console.log("VerifySignature Lib deployed to address:", lib.address);

  const Materia = await ethers.getContractFactory("Materia", {
      libraries: {
          VerifySignature: lib.address,
      },
  });

  console.log("Make sure you save these values in the README.md file located in the contracts folder, we will need this for contract verification on etherscan")
  console.log(args)

  const materia = await Materia.deploy(...args)
  await materia.deployed()
  console.log("Materia deployed to address:", materia.address)

}

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  