
const { utils } = require('ethers');
const { MerkleTree } = require('merkletreejs');

module.exports = {
    //antonym1on1TokenIds = array of the 52 1/1 skin antonym tokens
    merkleTree(antonym1on1TokenIds) {
        let data = [];
        for(let j = 0; j < antonym1on1TokenIds.length; j++) {
            data.push(hashData(antonym1on1TokenIds[j]))
        }
        return new MerkleTree(data, ethers.utils.keccak256, { sortPairs: true });
    }
}

const hashData = (tokenId) => {
    return Buffer.from(ethers.utils.solidityKeccak256(['uint256'], [tokenId]).slice(2), 'hex')
}

