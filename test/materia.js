const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers, waffle } = require("hardhat");
const {MerkleTree} = require("merkletreejs");
const keccak256 = require('keccak256')
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

        const Materia = await ethers.getContractFactory("Materia");

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
        expect(true).to.be.true
        let messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        let signature = signers[0].signMessage(utils.arrayify(messageHash));
        
        //tries to mint where minting is not yet started
        await expect(
            materia.connect(signers[1]).mint(
                [10], 
                [],
                signature,
                0x0,
                [],
                [],
                []
            )
        ).to.be.revertedWith('Minting not yet started');

        //tries to mint where minting is paused
        await materia.allowMinting(false)
        await expect(
             materia.connect(signers[1]).mint(
                [10], 
                [],
                signature,
                0x0,
                [],
                [],
                []
            )
        ).to.be.revertedWith('Minting is Paused');

        //tries to mint where is finished
        await materia.allowMinting(true)
        await timeIncreaseTo(timestamp + 1*60*11)
        await expect(
             materia.connect(signers[1]).mint(
                [10], 
                [],
                signature,
                0x0,
                [],
                [],
                []
            )
        ).to.be.revertedWith('Minting already ended');
    })

    it('returns true for a valid Merkle multi proof', async function () {
        const Wrapper = await ethers.getContractFactory("MerkleProofWrapper");
        const wrapper = await Wrapper.deploy();
        await wrapper.deployed();
  
        const root = merkleRoot.getRoot();
        const { leaves, proof, proofFlags } = getProof([10, 20], merkleRoot)
  
        expect(await wrapper.multiProofVerify(proof, proofFlags, root, leaves)).to.equal(true);
        expect(await wrapper.multiProofVerifyCalldata(proof, proofFlags, root, leaves)).to.equal(true);
      });

    it("Checks signatures", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //signs tokens and tries to mint other tokens
        //                                        //userAccAddress, antonymTokenId
        let messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        //              privatekey
        let signature = signers[0].signMessage(utils.arrayify(messageHash));

        await expect(
            materia.connect(signers[1]).mint(
                [2, 3], 
                [], 
                signature, 
                0x0, 
                [],
                [],
                []
            )
        ).to.be.revertedWith('Wrong Materia Signature');

        //signer 2 signs tokens
        messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        signature = signers[2].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[1]).mint(
                [1, 2, 3], 
                [], 
                signature, 
                0x0, 
                [],
                [],
                []
            )
        ).to.be.revertedWith('Wrong Materia Signature');

        //signs for signer1 and signer2 sends tx
        messageHash = await materia.messageHash(signers[1].address, [1, 2, 3]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));
        await expect(
            materia.connect(signers[2]).mint(
                [1, 2, 3], 
                [], 
                signature, 
                0x0, 
                [],
                [],
                []
            )
        ).to.be.revertedWith('Wrong Materia Signature');
    })

    it("Mints Materia", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)


        //signs tokens and tries to mint other tokens
        //                                        //userAccAddress, antonymTokenId
        let messageHash = await materia.messageHash(signers[1].address, [11, 12, 13]);
        //              privatekey
        let signature = signers[0].signMessage(utils.arrayify(messageHash));

        //tries to mint where not token owner
        await expect(
            materia.connect(signers[1]).mint(
                [11, 12, 13], 
                [], 
                signature, 
                0x0, 
                [],
                [],
                []
            )
        ).to.be.revertedWith('Not token owner');

        messageHash = await materia.messageHash(signers[1].address, [1, 2, 3, 4]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        let tx = await materia.connect(signers[1]).mint(
            [1, 2, 3, 4], 
            [], 
            signature, 
            0x0, 
            [],
            [],
            []
        );
        tx = await tx.wait();
        console.log("Mint materia tokenIds [1, 2, 3, 4]: ", tx.gasUsed.toNumber())
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(4);

        let balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(4)
        
        //tries to mint again with same tokenId
        await expect(
            materia.connect(signers[1]).mint(
                [1, 2, 3, 4], 
                [], 
                signature, 
                0x0, 
                [],
                [],
                []
            )
        ).to.be.revertedWith('Token already used');

        messageHash = await materia.messageHash(signers[1].address, [5, 6, 7, 8]);
        signature = signers[0].signMessage(utils.arrayify(messageHash));

        tx = await materia.connect(signers[1]).mint(
            [5, 6, 7, 8], 
            [], 
            signature, 
            0x0, 
            [],
            [],
            []
        );
        tx = await tx.wait();
        console.log("Mint materia tokenId [5, 6, 7, 8]: ", tx.gasUsed.toNumber())
        totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(8);
        balance = await materia.balanceOf(signers[1].address, 1)
        expect(balance).to.be.equal(8)
    })

    it("Mints Prima Materia", async function() {
        await timeIncreaseTo(timestamp + 60*5+10)

        //tries to mint where wrong signature
        let messageHashMateria = await materia.messageHash(signers[1].address, [8, 9]);
        let signatureMateria = signers[0].signMessage(utils.arrayify(messageHashMateria));
        
        const invalidProof = getProof([9, 19], merkleRoot2);

        //tries to mint where not token owner
        let messageHashPrima = await materia.messageHash(signers[1].address, [20, 30]);
        let signaturePrima = signers[0].signMessage(utils.arrayify(messageHashPrima));
        const {proof, leaves, proofFlags} = getProof([20, 30], merkleRoot);
        
        await expect(
            materia.connect(signers[1]).mint(
                [8, 9], 
                [20, 30],
                signatureMateria, 
                signaturePrima,
                proof,
                leaves,
                proofFlags
            )
        ).to.be.revertedWith('Not Prima token owner');

        //tries to mint where not at least one Materia created
        messageHashPrima = await materia.messageHash(signers[2].address, [10, 110]);
        signaturePrima = signers[0].signMessage(utils.arrayify(messageHashPrima));
        await expect(
            materia.connect(signers[1]).mint(
                [], 
                [10, 110],
                0x0, 
                signaturePrima,
                proof,
                leaves,
                proofFlags
            )
        ).to.be.revertedWith('A Materia should be created first');

        //create a Materia first
        messageHashMateria = await materia.messageHash(signers[1].address, [1, 5]);
        signatureMateria = signers[0].signMessage(utils.arrayify(messageHashMateria));
        await materia.connect(signers[1]).mint(
            [1, 5], 
            [],
            signatureMateria, 
            [],
            [],
            [],
            []
        )


        //tries to mint where invalid merkle proof
        messageHashPrima = await materia.messageHash(signers[2].address, [10, 110]);
        signaturePrima = signers[0].signMessage(utils.arrayify(messageHashPrima));
        await expect(
            materia.connect(signers[2]).mint(
                [], 
                [10, 110],
                0x0, 
                signaturePrima,
                invalidProof.proof,
                leaves,
                proofFlags
            )
        ).to.be.revertedWith('Invalid merkle proof');

        let tx = await materia.connect(signers[2]).mint(
            [], 
            [10, 110],
            0x0, 
            signaturePrima,
            proof,
            leaves,
            proofFlags
        )
        tx = await tx.wait()
        console.log("Mint prima tokenIds [10, 110]: ", tx.gasUsed.toNumber())
        let totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(2);
        let balance = await materia.balanceOf(signers[2].address, 2)
        expect(balance).to.be.equal(2)
        
        //tries to mint again with same tokenId
        await expect(
            materia.connect(signers[2]).mint(
                [], 
                [10, 110],
                0x0, 
                signaturePrima,
                proof,
                leaves,
                proofFlags
            )
        ).to.be.revertedWith('Token already used');
    })

    it("Mints batch", async function() {

        await timeIncreaseTo(timestamp + 60*5+10)
        //mint materias
        let messageHashMateria = await materia.messageHash(signers[1].address, [1, 5]);
        let signatureMateria = signers[0].signMessage(utils.arrayify(messageHashMateria));
        await materia.connect(signers[1]).mint(
            [1, 5], 
            [],
            signatureMateria, 
            [],
            [],
            [],
            []
        )
         //tries to batch mint whre deadline not over
         await expect(
            materia.mintBatchMateria(signers[0].address, 50, 10)
        ).to.be.revertedWith("Deadline not yet over")

        //mint materias, (2)
        let messageHashPrima = await materia.messageHash(signers[2].address, [10, 110]);
        let signaturePrima = signers[0].signMessage(utils.arrayify(messageHashPrima));
        let {proof, leaves, proofFlags} = getProof([20, 110], merkleRoot);
        await materia.connect(signers[2]).mint(
            [], 
            [10, 110],
            0x0, 
            signaturePrima,
            proof,
            leaves,
            proofFlags
        )

        await timeIncreaseTo(timestamp + 1*60*11)
        
        // //tries to mint more than max per token
        await expect(
            materia.mintBatchMateria(signers[0].address, 99, 1)
        ).to.be.revertedWith("Amount Materia exceeded")

        await expect(
            materia.mintBatchMateria(signers[0].address, 1, 4)
        ).to.be.revertedWith("Amount Prima Materia exceeded")


        let tx = await materia.mintBatchMateria(signers[0].address, 98, 3)
        tx = await tx.wait();
        console.log("Mint batch, 98 tokens: ", tx.gasUsed.toNumber())
        let totalSupply = await materia.totalSupply(1);
        expect(totalSupply).to.be.equal(100);

        totalSupply = await materia.totalSupply(2);
        expect(totalSupply).to.be.equal(5);


        //tries to mint one more materia
        await materia.setDeadline(timestamp + 1*60*60);
        messageHashMateria = await materia.messageHash(signers[1].address, [2, 3]);
        signatureMateria = signers[0].signMessage(utils.arrayify(messageHashMateria));
        await expect(
            materia.connect(signers[2]).mint(
                [2, 3], 
                [],
                signatureMateria, 
                [],
                [],
                [],
                []
            )
        ).to.be.revertedWith("Amount Materia exceeded")

        //tries to mint one prima more materia
        messageHashPrima = await materia.messageHash(signers[3].address, [30]);
        signaturePrima = signers[0].signMessage(utils.arrayify(messageHashPrima));
        ({proof, leaves, proofFlags} = getProof([20], merkleRoot));
        await expect(
            materia.connect(signers[3]).mint(
                [], 
                [30],
                0x0, 
                signaturePrima,
                proof,
                leaves,
                proofFlags
            )
        ).to.be.revertedWith("Amount Prima Materia exceeded")
    })
})

function merkleTree() {
    //tokens 10, 20, 30, 40, 50. 110
    let tokenPrimaMateriaIds = [];
    for(let j = 1; j <= 5; j++) {
        tokenPrimaMateriaIds.push(j*10)
    }
    tokenPrimaMateriaIds.push(110)
    tokenPrimaMateriaIds = tokenPrimaMateriaIds.map(keccak256).sort(Buffer.compare);
    return new MerkleTree(tokenPrimaMateriaIds, keccak256, { sort: true });
} 

function merkleTree2() {
    //tokens 9, 19, 29, 39, 49
    let tokenPrimaMateriaIds = [];
    for(let j = 1; j <= 5; j++) {
        tokenPrimaMateriaIds.push(j*10-1)
    }
    tokenPrimaMateriaIds = tokenPrimaMateriaIds.map(keccak256).sort(Buffer.compare);
    return new MerkleTree(tokenPrimaMateriaIds, keccak256, { sort: true });
} 

function getProof(tokenIds, merkleTree) {
    const proofLeaves = tokenIds.map(keccak256).sort(Buffer.compare);
    const proof = merkleTree.getMultiProof(proofLeaves);
    const proofFlags = merkleTree.getProofFlags(proofLeaves, proof);
    const leaves = tokenIds.map(keccak256).sort(Buffer.compare);
    return {
        proof,
        proofFlags,
        leaves
    }
}