const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers, waffle } = require("hardhat");
const {MerkleTree} = require("merkletreejs");
const { getLatestTimestamp, timeIncreaseTo } = require("../scripts/time");

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
                await antonym.releaseReserve(s.address, 10)}
        }))
        await antonym.deployed();

        const Lib = await ethers.getContractFactory("VerifySignatureMock");
        const lib = await Lib.deploy();
        await lib.deployed();

        const Materia = await ethers.getContractFactory("MateriaMock", {
            libraries: {
                VerifySignatureMock: lib.address,
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
            materia.connect(signers[1]).mintMateria(10, NULL_SIGNATURE)
        ).to.be.revertedWith('Minting not yet started');

        //tries to mint where minting is paused
        await materia.allowMinting(false)
        await expect(
            materia.connect(signers[1]).mintMateria(10, NULL_SIGNATURE)
        ).to.be.revertedWith('Minting is Paused');

        //tries to mint where is finished
        await materia.allowMinting(true)
        await timeIncreaseTo(timestamp + 1*60*11)
        await expect(
            materia.connect(signers[1]).mintMateria(10, NULL_SIGNATURE)
        ).to.be.revertedWith('Minting already ended');
    })

    it("Checks signatures", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //signs token 1 and tries to mint token2
        //                                        //userAccAddress, antonymTokenId
        let messageHash = await materia.messageHash(signers[1].address, 1);

        //              privatekey
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        /*
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
        
        */
        //para mintar Materia:
        //devolver la firma al usuario y luego llamar funcion:
        //materia.connect(signers[1]).mintMateria(1, signature)

        //para mintar Prima Materia:
        //const merkleRoot = merkleTree(antonym1on1TokenIds);
        // const getProof = (merkleRoot, tokenId) => {
        //     return merkleRoot.getHexProof(hashData(tokenId));
        // }
        //const proof = getProof(merkleRoot, 10);
        //materia.connect(signers[1]).mintPrimaMateria(9, signature, proof)

        await expect(
            materia.connect(signers[1]).mintMateria(2, signature)
        ).to.be.revertedWith('Wrong signature');

        //signer 2 signs token 1
        messageHash = await materia.messageHash(signers[1].address, 1);
        signature = signers[1].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mintMateria(1, signature)
        ).to.be.revertedWith('Wrong signature');

        //signs for signer1 and signer2 sends tx
        messageHash = await materia.messageHash(signers[1].address, 11);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mintMateria(11, signature)
        ).to.be.revertedWith('Wrong signature');
    })

    it("Mints Materia", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //tries to mint where wrong signature
        let messageHash = await materia.messageHash(signers[2].address, 1);
        let wrongSignature = signers[0].signMessage(utils.arrayify(messageHash));

        await expect(
            materia.connect(signers[1]).mintMateria(1, wrongSignature)
        ).to.be.revertedWith('Wrong signature');

        //tries to mint where not token owner
        await expect(
            materia.connect(signers[1]).mintMateria(11, NULL_SIGNATURE)
        ).to.be.revertedWith('Not token owner');

        messageHash = await materia.messageHash(signers[1].address, 1);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));

        await materia.connect(signers[1]).mintMateria(1, signature);
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(1);

        let balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(1)
        
        //tries to mint again with same tokenId
        await expect(
            materia.connect(signers[1]).mintMateria(1, signature)
        ).to.be.revertedWith('Token already used');

        messageHash = await materia.messageHash(signers[1].address, 2);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        await materia.connect(signers[1]).mintMateria(2, signature);
        totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(2);
        balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(2)
    })

    it("Mints Prima Materia", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //tries to mint where wrong signature
        let messageHash = await materia.messageHash(signers[2].address, 9);
        let wrongSignature = signers[0].signMessage(utils.arrayify(messageHash));
        const proof = getProof(merkleRoot, 10);
        const invalidProof = getProof(merkleRoot2, 10);

         //tries to mint with wrong signature
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(9, wrongSignature, proof)
        ).to.be.revertedWith('Wrong signature');

        //tries to mint where not token owner
        messageHash = await materia.messageHash(signers[1].address, 20);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(20, signature, proof)
        ).to.be.revertedWith('Not token owner');

        //tries to mint where not at least one Materia created
        messageHash = await materia.messageHash(signers[2].address, 10);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mintPrimaMateria(10, signature, proof)
        ).to.be.revertedWith('A Materia should be created first');

        //create a Materia first
        messageHash = await materia.messageHash(signers[1].address, 1);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[1]).mintMateria(1, signature);

        //tries to mint where invalid merkle proof
        messageHash = await materia.messageHash(signers[2].address, 10);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mintPrimaMateria(10, signature, invalidProof)
        ).to.be.revertedWith('Invalid merkle proof');

        await materia.connect(signers[2]).mintPrimaMateria(10, signature, proof);
        let totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(1);
        let balance = await materia.balanceOf(signers[2].address, 2)
        expect(balance).to.be.equal(1)
        
        //tries to mint again with same tokenId
        await expect(
            materia.connect(signers[1]).mintPrimaMateria(10, signature, proof)
        ).to.be.revertedWith('Token already used');
    })

    it("Mints batch", async function() {

        await timeIncreaseTo(timestamp + 60*5+10)
        //mint materias
        let messageHash = await materia.messageHash(signers[1].address, 1);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        const proof1 = getProof(merkleRoot, 10);
        const proof2 = getProof(merkleRoot, 20);

         //tries to batch mint whre deadline not over
         await expect(
            materia.mintBatchMateria(signers[0].address, 50, 10)
        ).to.be.revertedWith("Deadline not yet over")

        //mint materias, (2)
        await materia.connect(signers[1]).mintMateria(1, signature);
        messageHash = await materia.messageHash(signers[2].address, 11);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[2]).mintMateria(11, signature);

        //mint primas(2)
        messageHash = await materia.messageHash(signers[2].address, 10);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[2]).mintPrimaMateria(10, signature, proof1);

        messageHash = await materia.messageHash(signers[3].address, 20);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await materia.connect(signers[3]).mintPrimaMateria(20, signature, proof2);

        await timeIncreaseTo(timestamp + 1*60*11)
        
        //tries to mint more than max per token
        await expect(
            materia.mintBatchMateria(signers[0].address, 99, 1)
        ).to.be.revertedWith("Amount Materia exceeded")

        await expect(
            materia.mintBatchMateria(signers[0].address, 1, 4)
        ).to.be.revertedWith("Amount Prima Materia exceeded")


        await materia.mintBatchMateria(signers[0].address, 98, 3)
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(100);

        totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(5);


        //tries to mint one more materia
        await materia.setDeadline(timestamp + 1*60*60);
        messageHash = await materia.messageHash(signers[2].address, 12);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mintMateria(12, signature)
        ).to.be.revertedWith("Amount Materia exceeded")

        //tries to mint one prima more materia
        const proof3 = getProof(merkleRoot, 30);
        messageHash = await materia.messageHash(signers[4].address, 30);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[4]).mintPrimaMateria(30, signature, proof3)
        ).to.be.revertedWith("Amount Prima Materia exceeded")
    })
})

function merkleTree() {
    //tokens 10, 20, 30, 40, 50
    let tokenPrimaMateriaIds = [];
    for(let j = 1; j <= 5; j++) {
        tokenPrimaMateriaIds.push(hashData(j*10))
    }
    return new MerkleTree(tokenPrimaMateriaIds, utils.keccak256, { sortPairs: true });
} 

function merkleTree2() {
    //tokens 9, 19, 29, 39, 49
    let tokenPrimaMateriaIds = [];
    for(let j = 1; j <= 5; j++) {
        tokenPrimaMateriaIds.push(hashData(j*10-1))
    }
    return new MerkleTree(tokenPrimaMateriaIds, utils.keccak256, { sortPairs: true });
} 

const getProof = (merkleTree, tokenId) => {
    return merkleTree.getHexProof(hashData(tokenId));
}

const hashData = (tokenId) => {
    return Buffer.from(ethers.utils.solidityKeccak256(['uint256'], [tokenId]).slice(2), 'hex')
}



