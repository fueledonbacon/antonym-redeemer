const { ethers } = require('hardhat');
const { merkleTree } = require('./merkletree');
require('dotenv').config({path:__dirname+'/.env'});


const antonym1on1TokenIds = []
for(let j =1; j <=52; j++) {
    antonym1on1TokenIds.push(j)
}
const merkleRoot = merkleTree(antonym1on1TokenIds);

const {
    SIGNER,
    ANTONYM
  } = process.env

module.exports = [
    "MATERIA", //Token Name
    "MAT", //Token Symbol
    "https://antonymnft.s3.us-west-1.amazonaws.com/json/", //Token URI
    parseInt(Date.now()/1000) + 60*10, //starts in 10 minutes,
    parseInt(Date.now()/1000) + 1*60*60*10 ,//ends in 10 hrs,
    merkleRoot.getHexRoot(),
    SIGNER,
    ANTONYM
  ];