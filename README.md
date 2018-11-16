# API Poller

An event driven external API poller designed for real-time applications.

Documentation is in the JSDocs.

## Example

```javascript
const Poller = require('api-poll')

const endpoint = 'https://cat-fact.herokuapp.com/facts/random?animal=cat&amount=1'
const randomFact = new Poller(endpoint, {
    repeat: 2000, //ms
    variance: {
        min: 200, //ms
        max: 2500 //ms
    },
    // variance: true,
    fetchHeaders: {
        "Origin": "example.com"
    }
})

randomFact
    .start()
    .on('data', data => console.log('got new data: ', data))

setTimeout(randomFact.stop, 20000)
```