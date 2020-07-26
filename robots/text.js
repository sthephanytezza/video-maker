const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algotithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
//importação do arquivo com a key
const watsonApiKey = require('../credentials/watson-nlu.json').apikey

//importação do módulo de linguagem natural
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

//instanciando o módulo para usar
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const state = require('./state.js')

//interface pública
async function robot(){
    //carrega o content com o conteúdo salvo pelo robô
    const content = state.load()
    //baixar conteúdo do Wikipedia
    await fetchContentFromWikipedia(content)
    // Limpar conteúdo
    sanitizeContent(content)
    // Quebrar o conteúdo em sentenças
    breakContentIntoSentences(content)
    limitMaximumSentences(content)

    await fetchKeywordsOfAllSentences(content)

    state.save(content)

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

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(sentence){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject) =>{
            nlu.analyze({
                text: sentence,
                 features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }
     
                //array de textos das keywords
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
    
                resolve(keywords)
            })
        })
    }
}

module.exports = robot