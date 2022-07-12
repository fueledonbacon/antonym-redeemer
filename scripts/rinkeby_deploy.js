const { ethers } = require('hardhat');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const args = require("./materia")
const path = "./scripts/materia.js";


async function main() {

  console.log("Deploying Lib contract")
  const Lib = await ethers.getContractFactory("VerifySignatureMock");
  const lib = await Lib.deploy();
  await lib.deployed();
  console.log("VerifySignature Lib deployed to address:", lib.address)

  console.log("Waiting for one minute for library contract propagation")
  await new Promise(r => setTimeout(r, 60000));
  await verifyLib(lib.address, "rinkeby", path)

  const Materia = await ethers.getContractFactory("MateriaMock", {
      libraries: {
          VerifySignatureMock: lib.address,
      },
  });
  console.log(args)
  console.log("Deploying Materia contract")
  const materia = await Materia.deploy(...args)
  await materia.deployed()
  console.log("Materia deployed to address:", materia.address)

  console.log("Waiting for one minute for contract propagation")
  await new Promise(r => setTimeout(r, 60000));
  await verify(materia.address, "rinkeby", path)
}

async function verifyLib(address, network, path) {
  console.log("Start Lib contract verification")
  try {
    const { stdout, stderr } = await exec(`npx hardhat verify ${address} --network ${network} `);
    if(stderr) return console.log('stderr:', stderr);
    console.log('stdout:', stdout);
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
}

async function verify(address, network, path) {
  console.log("Start contract verification")
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
  