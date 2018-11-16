const Poller = require('api-poller')

const endpoint = 'https://cat-fact.herokuapp.com/facts/random?animal=cat&amount=1'
const randomFact = new Poller(endpoint, {
    repeat: 2000, //ms
    variance: {
        min: 200, //ms
        max: 2500 //ms
    },
    fetchHeaders: {
        "Origin": "google.com"
    }
})

randomFact
    .start()
    .on('data', data => console.log('got new data: ', data))

setTimeout(randomFact.stop, 20000)