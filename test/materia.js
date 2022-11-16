const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers, waffle } = require("hardhat");
const {MerkleTree} = require("merkletreejs");
const keccak256 = require('keccak256')
const { getLatestTimestamp, timeIncreaseTo } = require("../scripts/time");

const NULL_SIGNATURE = "0x0000000000000000000000000000000000000000000000000000000000000000"

const provider = waffle.provider;

const antonym1on1TokenIdsMock = [
    1,  5,  10,  15, 19, 20, 25,
   35, 45, 50, 55, 60, 65, 70,
   75
  ]


describe("Materia ERC1155 Contract", function () {
  
    let signers;
    let antonym;
    let materia;    
    let timestamp;
    let end;
   
  
    this.beforeAll(async function() {
        signers = await ethers.getSigners();
        REVENUE_RECIPIENT = signers[0].address

        
    })
  
    beforeEach(async function () {
        const Antonym = await ethers.getContractFactory("AntonymMock");
        antonym = await Antonym.deploy()
        await Promise.all(await signers.map(async (s, i) => {
            if(i > 0 && i <= 11) {
                await antonym.releaseReserve(s.address, 10)}
        }))
        await antonym.releaseReserve(signers[2].address, 1); //110
        await antonym.deployed();

        const Lib = await ethers.getContractFactory("VerifySignature");
        const lib = await Lib.deploy();
        await lib.deployed();

        const Materia = await ethers.getContractFactory("MateriaMock");

        timestamp = (await getLatestTimestamp()).toNumber()
        end = timestamp + 1*60*10; //ends in 10 minutes

        materia = await Materia.deploy(
            "MATERIA",
            "MAT",
            "https://antonymnft.s3.us-west-1.amazonaws.com/json/",
            end,
            signers[0].address,
            antonym.address, 
            antonym1on1TokenIdsMock
        );
        const txHash = materia.deployTransaction.hash;
        await materia.deployed()
        const receipt = await provider.getTransactionReceipt(txHash)
        console.log(receipt.gasUsed.toNumber())
    })

    it("CanMint Modifier", async function() {
        let messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        
        //tries to mint where minting is paused
        await expect(
            materia.connect(signers[1]).mint([1, 2, 3], signature)
        ).to.be.revertedWith('Minting is Paused');

        //tries to mint where is finished
        await materia.allowMinting(true)
        await timeIncreaseTo(timestamp + 1*60*11)
        await expect(
            materia.connect(signers[1]).mint([1, 2, 3], signature)
        ).to.be.revertedWith('Minting already ended');
    })

    it("Checks signatures", async function() {
        await materia.allowMinting(true)

        let messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));

        await expect(
            materia.connect(signers[1]).mint([1, 2, 4], signature)
        ).to.be.revertedWith('Wrong Materia Signature');

        //signer 2 signs tokens
        messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        signature = signers[2].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mint([1, 2, 3], signature)
        ).to.be.revertedWith('Wrong Materia Signature');

        //signs for signer1 and signer2 sends tx
        messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mint([1, 2, 3], signature)
        ).to.be.revertedWith('Wrong Materia Signature');
    })

    it("Mints Materia", async function() {
        await materia.allowMinting(true)

        let messageHash = await materia.messageHash(signers[1].address, [11, 12, 13]);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));

        //tries to mint where not token owner
        await expect(
            materia.connect(signers[1]).mint([11, 12, 13], signature)
        ).to.be.revertedWith('Not token owner');

        messageHash = await materia.messageHash(signers[1].address, [2, 3, 4]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        let tx = await materia.connect(signers[1]).mint([2, 3, 4], signature);
        tx = await tx.wait();
        console.log("Mint materia tokenIds [2, 3, 4]: ", tx.gasUsed.toNumber())
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(3);

        let balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(3)
        
        //tries to mint again with same tokenId
        messageHash = await materia.messageHash(signers[1].address, [2, 5, 6]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mint([2, 5, 6], signature)
        ).to.be.revertedWith('Token already used');

        messageHash = await materia.messageHash(signers[1].address, [6, 7, 8]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        tx = await materia.connect(signers[1]).mint([6, 7, 8], signature);
        tx = await tx.wait();
        console.log("Mint materia tokenId [6, 7, 8]: ", tx.gasUsed.toNumber())
        totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(6);
        balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(6)
    })

    it("Mints Prima Materia", async function() {
        await materia.allowMinting(true)


        //tries to mint where not at least one Materia created
        let messageHash = await materia.messageHash(signers[2].address, [10, 15]);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mint([10, 15], signature)
        ).to.be.revertedWith('A Materia should be created first');

        
        // tries to mint where not token owner
        messageHash = await materia.messageHash(signers[1].address, [11, 20]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mint([11, 20], signature)
        ).to.be.revertedWith('Not token owner');


        //create Materia and Prima Materia
        messageHash = await materia.messageHash(signers[2].address, [11, 15, 19]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        let tx = await materia.connect(signers[2]).mint([11, 15, 19], signature)
        tx = await tx.wait();
        console.log("Mint materia and prima tokenIds [11, 15, 19]: ", tx.gasUsed.toNumber())

        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(1);
        let balance = await materia.balanceOf(signers[2].address, 1)
        expect(balance).to.be.equal(1)

        totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(2);
        balance = await materia.balanceOf(signers[2].address, 2)
        expect(balance).to.be.equal(2)
        
        //tries to mint again with same tokenId
        messageHash = await materia.messageHash(signers[2].address, [15]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mint([15], signature)
        ).to.be.revertedWith('Token already used');
    })

    it("Mints batch", async function() {

        await materia.allowMinting(true)
        //mint materias
        let messageHash = await materia.messageHash(signers[1].address, [2, 3]);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[1]).mint([2, 3], signature)

         //tries to batch mint where deadline not over
         await expect(
            materia.mintBatchMateria(signers[0].address, 50, 10)
        ).to.be.revertedWith("Deadline not yet over")

        //mint prima materias, (2)
        messageHash = await materia.messageHash(signers[2].address, [10, 15]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[2]).mint([10, 15], signature)

        await timeIncreaseTo(timestamp + 1*60*11)
        
        // //tries to mint more than max per token
        await expect(
            materia.mintBatchMateria(signers[0].address, 84, 1)
        ).to.be.revertedWith("Amount Materia exceeded")

        await expect(
            materia.mintBatchMateria(signers[0].address, 1, 14)
        ).to.be.revertedWith("Amount Prima Materia exceeded")


        let tx = await materia.mintBatchMateria(signers[0].address, 83, 13)
        tx = await tx.wait();
        console.log("Mint batch, 83 tokens: ", tx.gasUsed.toNumber())
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(85);

        totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(15);


        //tries to mint one more materia
        await materia.setDeadline(timestamp + 1*60*60);
        messageHash = await materia.messageHash(signers[1].address, [4]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mint([4], signature)
        ).to.be.revertedWith("Amount Materia exceeded")

        //tries to mint one prima more materia
        messageHash = await materia.messageHash(signers[2].address, [19]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mint([19], signature)
        ).to.be.revertedWith("Amount Prima Materia exceeded")
    })
})


