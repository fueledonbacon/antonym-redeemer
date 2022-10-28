const { ethers } = require('hardhat');
const util = require('util')
const axios = require('axios')
const updateOutput = require('../update_output')
const exec = util.promisify(require('child_process').exec);

require('dotenv').config({ path: __dirname + '/.env' })

const outputPath = "./scripts/mainnet/deploy_output.json";
const api = "https://api.etherscan.io/api"
const args = require("./args")
const path = "./scripts/mainnet/args.js";
const NETWORK = "mainnet"

async function main() {

    console.log("Deploying Materia contract")
    const Materia = await ethers.getContractFactory("Materia");
    const materia = await Materia.deploy(...args)
    await materia.deployed()
    console.log("Materia deployed to address:", materia.address)
    updateOutput(outputPath, { MATERIA: materia.address })

    console.log("Waiting for one minute for contracts propagation")
    await new Promise(r => setTimeout(r, 30000));

    console.log("Verifying Materia contract")
    try {
        await attemptVerification(
            materia.address,
            path
        );
    } catch (e) {
        console.log("There was an issue trying to verify Materia contract", e.message)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    }
    )

async function attemptVerification(address, path) {
    try {
        const verified = await isVerified(buildApi(address))
        if (!verified) {
            await verify(address, path);
        }
    } catch (e) {
        throw (e)
    }
}

async function verify(address, path) {
    try {
        const { stdout, stderr } = await exec(`npx hardhat verify ${address} --network ${NETWORK} --constructor-args ${path}  `);
        console.log('stdout:', stdout);
    } catch (e) {
        console.error(e); // should contain code (exit code) and signal (that caused the termination).
    }
}


function buildApi(address) {
    return `${api}?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
}

async function isVerified(url) {
    const res = await axios.get(url);
    const { data } = res
    if (data) {
        if (data.result === 'Contract source code not verified') {
            console.log("Contract not yet verified, attempting verification");
            return false
        } else if (data.message === "OK") {
            console.log("Contract already verified");
            return true;
        }
        throw new Error("Unable to fetch URL data");
    }
    throw new Error("There was an issue in the request");


}