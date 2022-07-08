
const { utils } = require('ethers');
const { MerkleTree } = require('merkletreejs');

module.exports = {
    //antonym1on1TokenIds = array of the 52 1/1 skin antonym tokens
    merkleTree(antonym1on1TokenIds) {
        return new MerkleTree(antonym1on1TokenIds, utils.keccak256, { sortPairs: true });
    }
}
