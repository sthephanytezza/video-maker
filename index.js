//importantando biblioteca
const readline = require('readline-sync')
const robots = {
    text: require('./robots/text.js')
}

async function start(){
    // content guarda tudo que foi encontrado na busca
    const content = {
        maximumSentences: 7
    }

    //termo de busca
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.lang = askAndReturnLanguage() 

    //passa para o robô o texto do content
    await robots.text(content)

    function askAndReturnSearchTerm(){
        //armazena o que será procurado na Wikipedia
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        //select de opções que retorna uma chave como resultado
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }

    function askAndReturnLanguage(){
        const language = ['pt','en']
        const selectedLangIndex = readline.keyInSelect(language,'Choice Language: ')
        const selectedLangText = language[selectedLangIndex]
        return selectedLangText
    }

    console.log(JSON.stringify(content, null, 4))
}

start()