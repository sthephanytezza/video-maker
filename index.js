//importantando biblioteca
const readline = require('readline-sync')

function start(){
    // content guarda tudo que foi encontrado na busca
    const content = {}

    //termo de busca
    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix();

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

    console.log(content)
}

start()