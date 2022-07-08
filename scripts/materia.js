const { ethers } = require('hardhat');
const { merkleTree } = require('./merkletree');
require('dotenv').config({path:__dirname+'/.env'});


const antonym1on1TokenIds = [
  270,  397,  474,  545,  965, 1106, 1224,
 1275, 1280, 1940, 2598, 2626, 2657, 2670,
 2818, 2928, 3138, 3147, 3288, 3333, 3516,
 3681, 3760, 4297, 4336, 4501, 4509, 4513,
 4864, 5229, 5537, 5769, 6271, 6307, 6448,
 6531, 6554, 7012, 7132, 7165, 7495, 7555,
 7627, 7724, 7764, 8301, 8387, 8397, 8492,
 8683, 8763, 8876
]

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