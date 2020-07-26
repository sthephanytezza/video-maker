const robot = require('./robots/input.js')

const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js')
}

async function start(){
    

    robots.input()
    //passa para o robô o texto do content
    await robots.text()

    const content = robots.state.load()
    console.dir(content, { depth: null } )
}

start()