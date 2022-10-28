const fs = require("fs/promises");
const jsonFormat = require("json-format")


async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch (err) {
        return false;
    }
}

const updateOutput = async (filePath, data) => {
    let file = {}

    if(await fileExists(filePath)){
        file = await fs.readFile(filePath, { encoding: 'utf-8'})
        file = JSON.parse(file)
    }

    file = Object.assign({}, file, data)
    await fs.writeFile(filePath, jsonFormat(file))
}

module.exports =  updateOutput;