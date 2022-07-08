const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers, waffle } = require("hardhat");
const {MerkleTree} = require("merkletreejs");
const { getLatestTimestamp, timeIncreaseTo } = require("../scripts/time");

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const NULL_SIGNATURE = "0x0000000000000000000000000000000000000000000000000000000000000000"

const provider = waffle.provider;


describe("Materia ERC1155 Contract", function () {
  
    let signers;
    let antonym;
    let materia;    
    let timestamp;
    let start;
    let end;
    let merkleRoot, merkleRoot2;
   
  
    this.beforeAll(async function() {
        signers = await ethers.getSigners();
        REVENUE_RECIPIENT = signers[0].address
    })
  
    beforeEach(async function () {
        const Antonym = await ethers.getContractFactory("AntonymMock");
        antonym = await Antonym.deploy("https://antonymnft.s3.us-west-1.amazonaws.com/json/")
        await Promise.all(await signers.map(async (s, i) => {
            if(i > 0 && i <= 11) {
                await antonym.releaseReserve(s.address, 1000)}
        }))
        await antonym.releaseReserve(signers[1].address, 1000)
        await antonym.deployed();

        const Lib = await ethers.getContractFactory("VerifySignature");
        const lib = await Lib.deploy();
        await lib.deployed();

        const Materia = await ethers.getContractFactory("Materia", {
            libraries: {
                VerifySignature: lib.address,
            },
        });
        

        merkleRoot = merkleTree();
        merkleRoot2 = merkleTree2()
    
        timestamp = (await getLatestTimestamp()).toNumber()
        start = timestamp + 60*5 //starts in 5 minutes
        end = timestamp + 1*60*10; //ends in 10 minutes

        materia = await Materia.deploy(
            "MATERIA",
            "MAT",
            "https://antonymnft.s3.us-west-1.amazonaws.com/json/",
            start,
            end,
            merkleRoot.getHexRoot(),
            signers[0].address,
            antonym.address
        );
        await materia.deployed()
    })

    it("CanMint Modifier", async function() {
        
        //tries to mint where minting is not yet started
        await expect(
            materia.connect(signers[1]).mintMateria(1,NULL_SIGNATURE)
        ).to.be.revertedWith('Minting not yet started');

        //tries to mint where minting is paused
        await materia.allowMinting(false)
        await expect(
            materia.connect(signers[1]).mintMateria(1,NULL_SIGNATURE)
        ).to.be.revertedWith('Minting is Paused');

        //tries to mint where is finished
        await materia.allowMinting(true)
        await timeIncreaseTo(timestamp + 1*60*11)
        await expect(
            materia.connect(signers[1]).mintMateria(1,NULL_SIGNATURE)
        ).to.be.revertedWith('Minting already ended');
    })

    it("Mints Materia", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //tries to mint where wrong signature
        let messageHash = await materia.messageHash(signers[2].address, 999);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));

        await expect(
            materia.connect(signers[1]).mintMateria(999, signature)
        ).to.be.revertedWith('Wrong signature');

        //tries to mint where not token owner
        await expect(
            materia.connect(signers[1]).mintMateria(1001,NULL_SIGNATURE)
        ).to.be.revertedWith('Not token owner');

        messageHash = await materia.messageHash(signers[1].address, 999);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        await materia.connect(signers[1]).mintMateria(999, signature);
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(1);

        let balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(1)
        
        //tries to mint again with same tokenId
        await expect(
            materia.connect(signers[1]).mintMateria(999, signature)
        ).to.be.revertedWith('Token already used');

        messageHash = await materia.messageHash(signers[1].address, 1);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[1]).mintMateria(1, signature);
        totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(2);
        balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(2)



    })

    it("Mints Prima Materia", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //tries to mint where wrong signature
        let messageHash = await materia.messageHash(signers[2].address, 1);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        const proof = getProof(merkleRoot, 1);
        const invalidProof = getProof(merkleRoot2, 1);

         //tries to mint with wrong signature
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(1, signature, proof)
        ).to.be.revertedWith('Wrong signature');

        messageHash = await materia.messageHash(signers[1].address, 1);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        //tries to mint where not token owner
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(1001, signature, proof)
        ).to.be.revertedWith('Not token owner');

        //tries to mint where not at least one Materia created
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(1, signature, proof)
        ).to.be.revertedWith('A Materia should be created first');

        //create a Materia first
        await materia.connect(signers[1]).mintMateria(1, signature);

        //tries to mint where invalid merkle proof
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(1, signature, invalidProof)
        ).to.be.revertedWith('Invalid merkle proof');

        await materia.connect(signers[1]).mintPrimaMateria(1, signature, proof);
        let totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(1);
        let balance = await materia.balanceOf(signers[1].address, 2)
        expect(balance).to.be.equal(1)
        
        //tries to mint again with same tokenId
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(1, signature, proof)
        ).to.be.revertedWith('Token already used');
    })

    it("Mints batch", async function() {

        await timeIncreaseTo(timestamp + 60*5+10)
        //mint materias
        let messageHash = await materia.messageHash(signers[1].address, 1);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        const proof1 = getProof(merkleRoot, 1);
        const proof2 = getProof(merkleRoot, 2);

         //tries to batch mint whre deadline not over
         await expect(
            materia.mintBatchMateria(signers[0].address, 50, 10)
        ).to.be.revertedWith("Deadline not yet over")

        //mint materias, (2)
        await materia.connect(signers[1]).mintMateria(1, signature);
        messageHash = await materia.messageHash(signers[2].address, 1001);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[2]).mintMateria(1001, signature);

        //mint primas(2)
        messageHash = await materia.messageHash(signers[1].address, 1);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[1]).mintPrimaMateria(1, signature, proof1);

        messageHash = await materia.messageHash(signers[1].address, 2);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[1]).mintPrimaMateria(2, signature, proof2);

        await timeIncreaseTo(timestamp + 1*60*11)
        
        //tries to mint more than max per token
        await expect(
            materia.mintBatchMateria(signers[0].address, 9999, 1)
        ).to.be.revertedWith("Amount Materia exceeded")

        await expect(
            materia.mintBatchMateria(signers[0].address, 1, 51)
        ).to.be.revertedWith("Amount Prima Materia exceeded")


        await materia.mintBatchMateria(signers[0].address, 20, 5)
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(22);

        totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(7);


    })
})

function merkleTree() {
    //first 52 tokens will be 1/1 skin
    let tokenPrimaMateriaIds = [];
    for(let j = 0; j < 52; j++) {
        tokenPrimaMateriaIds.push(hashData(j+1))
    }
    return new MerkleTree(tokenPrimaMateriaIds, utils.keccak256, { sortPairs: true });
} 

function merkleTree2() {
    //token 52 to 103 tokens will be 1/1 skin
    let tokenPrimaMateriaIds = [];
    for(let j = 52; j < 104; j++) {
        tokenPrimaMateriaIds.push(hashData(j+1))
    }
    return new MerkleTree(tokenPrimaMateriaIds, utils.keccak256, { sortPairs: true });
} 

const getProof = (merkleTree, tokenId) => {
    return merkleTree.getHexProof(hashData(tokenId));
}

const hashData = (tokenId) => {
    return Buffer.from(ethers.utils.solidityKeccak256(['uint256'], [tokenId]).slice(2), 'hex')
}

async function signData(signer, account, tokenId) {
    const encoded = ethers.utils.solidityKeccak256(["address", "uint256"], [account, tokenId]);
    const signature = await signer.signMessage(encoded);
    return signature
}


function toEthSignedMessageHash (messageHex) {
    const messageBuffer = Buffer.from(messageHex.substring(2), 'hex');
    const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${messageBuffer.length}`);
    return web3.utils.sha3(Buffer.concat([prefix, messageBuffer]));
}

