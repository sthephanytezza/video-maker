const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algotithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

//interface pública
async function robot(content){
    //baixar conteúdo do Wikipedia
    await fetchContentFromWikipedia(content)
    // Limpar conteúdo
    sanitizeContent(content)
    // Quebrar o conteúdo em sentenças
    breakContentIntoSentences(content)

    //Função precisa ser assíncrona
    async function fetchContentFromWikipedia(content){
        /** 1. Autentica
         * 2. Define o algoritmo
         * 3. Executa
         * 4. Captura o valor
         */

        //retorna uma instância autenticada do algorithmia
        const algorithmiaAutenticad = algorithmia(algorithmiaApiKey)
        // instância do Wikipedia
        const wikipediaAlgorithm = algorithmiaAutenticad.algo("web/WikipediaParser/0.1.2?timeout=300")
        //pipe busca no Wikipedia o termo desejado | await avisa que a função deve ser esperada para seguir o código
        //em lang é atribuído a linguagem escolhida pela pessoa
        const wikipediaResponse = await wikipediaAlgorithm.pipe({
            "lang": content.lang,
            "articleName": content.searchTerm
        })
        //conteudo do Wikipedia  vai para variável
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
        
    }

    function sanitizeContent(content){
        //quebra conteúdo em linhas
        const withoutBlankLinhasAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinhasAndMarkdown)
       
        //salva tudo que foi feito dentro da função no content
        content.sourceContentOriginal = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')
      
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
              if (line.trim().length === 0 || line.trim().startsWith('=')) {
                return false
              }
      
              return true
            })
      
            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }

    }

    function breakContentIntoSentences(content){
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentOriginal)
        
        //em cada sentença encontrada, adiciona no vetor sentences um objeto de sentenças
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })

    }
}

module.exports = robot