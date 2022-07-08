const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { getLatestTimestamp } = require("../scripts/time");

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const provider = waffle.provider;


describe("Escrow Contract", function () {
  
    let signers;
    let antonym;
    let materia;    
   
  
    this.beforeAll(async function() {
        signers = await ethers.getSigners();
        REVENUE_RECIPIENT = signers[0].address
    })
  
    beforeEach(async function () {
        const Antonym = await ethers.getContractFactory("AntonymMock");
        antonym = await Antonym.deploy("https://antonymnft.s3.us-west-1.amazonaws.com/json/")
        await antonym.deployed();
    })

    it("Do", async function() {
        expect(true).to.be.true
    })

})