const fs = require('fs')
const contentFilePath = './content.json'
const scriptFilePath = './content/after-effects-script.js'

function save(content) {
    //stringify transforma o objeto em uma string
    const contentString = JSON.stringify(content)
    //salva de forma assíncrona no contentFilePath no disco do projeto
    return fs.writeFileSync(contentFilePath, contentString)
}

/*
function saveScript(content) {
    const contentString = JSON.stringify(content)
    const scriptString = `var content = ${contentString}`
    return fs.writeFileSync(scriptFilePath, scriptString)
}
*/


function load() {
    //lê o arquivo
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    //transforma a string em uma objeto javascript
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = {
    save,
    //saveScript,
    load
}