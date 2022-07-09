const { ethers } = require('hardhat');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const args = require("./materia")
const path = "./scripts/materia.js";


async function main() {

  // console.log("Deploying contracts")
  const Lib = await ethers.getContractFactory("VerifySignatureMock");
  const lib = await Lib.deploy();
  await lib.deployed();
  console.log("VerifySignature Lib deployed to address:", lib.address)

  const Materia = await ethers.getContractFactory("MateriaMock", {
      libraries: {
          VerifySignatureMock: lib.address,
      },
  });

  console.log(args)

  const materia = await Materia.deploy(...args)
  await materia.deployed()
}

  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  