const { ethers } = require('hardhat');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const args = require("./materia")
const path = "./scripts/materia.js";


async function main() {

  // console.log("Deploying contracts")

  // const Lib = await ethers.getContractFactory("VerifySignature");
  // const lib = await Lib.deploy();
  // await lib.deployed();
  // console.log("VerifySignature Lib deployed to address:", lib.address)

  // const Materia = await ethers.getContractFactory("Materia", {
  //     libraries: {
  //         VerifySignature: lib.address,
  //     },
  // });

  // const materia = await Materia.deploy(...args)
  // await materia.deployed()
  // console.log("Materia deployed to address:", materia.address)

  // console.log("Waiting 1 minute for contract propagation")
  // await new Promise(r => setTimeout(r, 60000));

  await verify("0x7579e31D8e8F326e7CB4830797Cd617e7A9ee9bB", "rinkeby", path)
}


async function verify(address, network, path) {
  try {
    const { stdout, stderr } = await exec(`npx hardhat verify ${address} --network ${network} --constructor-args ${path} `);
    if(stderr) return console.log('stderr:', stderr);
    console.log('stdout:', stdout);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
  