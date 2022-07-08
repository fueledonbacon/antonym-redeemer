
const { time } = require('@openzeppelin/test-helpers');

module.exports = {
    async timeIncreaseTo(seconds) {
        await time.increaseTo(seconds);
        await time.advanceBlock()
    },
    
    
    async getLatestBlock() {
        const latestBlock = await time.latestBlock();
        return latestBlock;
    },
    
    async getLatestTimestamp() {
        const latestTimestamp = await time.latest();
        return latestTimestamp;
    }
}

