const fetch = require('node-fetch')
const EventEmitter = require('events')

class Poller {

    /**
     * 
     * @param {String} endpoint The endpoint to poll
     * @param {Object} options Configuration options
     * @param {Number} options.repeat How frequently to poll (ms). Default is `10000`.
     * @param {String} options.method Request method. "GET" or "POST"
     * @param {Boolean|Object} options.variance Vary the poll repeating interval to be less obviously robotic
     * 
     * If set to `true` then the default spread is `0.5`. E.g. if `repeat` is `2000` then the variance will be
     * `2000` + a random number between `2000` and `2000 * 0.5`. So in this case the overall repeating interval will
     * vary between `2000` and `2100`.
     * 
     * Otherwise, an explict range can be set with `min` and `max`, both of which represent the minumum and maximum
     * variance. E.g. if `repeat` is `2000`, `min` is `200` and `max` is `1000` then the overall repeating interval
     * will vary between `2200` and `3000`.
     * 
     * Default is `false`, i.e. no variance.
     * @param {Number} options.variance.min The minumum variance for the repeating interval (ms)
     * @param {Number} options.variance.max The maximum variance for the repeating interval (ms)
     * @param {Object} options.fetchHeaders Headers to include in the fetch request
     */
    constructor(endpoint, options = {}) {
        if (!endpoint)
            throw new Error('URL must be provided')

        // Set initial properties
        this.isPolling = false
        this.emitter = new EventEmitter()

        // Set default values
        options.repeat = options.repeat || 10000
        options.method = options.method
            ? options.method.toUpperCase()
            : 'GET'

        if (!('variance' in options))
            options.variance = false

        if (typeof options.variance === 'object') {
            if (isNaN(options.variance.min))
                throw new Error('Minimum variance must be a number')

            if (isNaN(options.variance.max))
                throw new Error('Maximum variance must be a number')

            if (options.variance.min < 0)
                throw new Error('Minimum variance must be a positive integer')

            if (options.variance.max < 0)
                throw new Error('Maximum variance must be a positive integer')
        }

        options.fetchHeaders = options.fetchHeaders || {}

        // Use inputs
        this.endpoint = endpoint
        this.repeat = options.repeat
        this.variance = options.variance
        this.fetchHeaders = options.fetchHeaders

        // Bind methods to `this`
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    /**
     * Start polling the endpoint and return the event emitter which emits an
     * event when the requested data is returned from the poll
     * @returns EventEmitter
     */
    start() {
        let repeat = this.repeat

        const poll = async () => {
            const req = await fetch(this.endpoint, {
                method: this.method,
                headers: {
                    ...this.fetchHeaders
                }
            })
            const json = await req.json()

            this.emitter.emit('data', json)

            if (this.variance) {
                if (typeof this.variance === 'boolean') {
                    repeat = parseInt(
                        this.repeat
                        + Math.random() * this.repeat * 0.5
                    )
                } else if (typeof this.variance === 'object') {
                    repeat = parseInt(
                        this.repeat
                        + Math.floor(Math.random() * (this.variance.max - this.variance.min + 1))
                        + this.variance.min
                    )
                }

                this.stop()
                this.interval = setInterval(poll, repeat)
            }
        }

        this.interval = setInterval(poll, repeat)
        this.isPolling = true

        return this.emitter
    }

    /**
     * Stop the polling
     */
    stop() {
        clearInterval(this.interval)
        this.isPolling = false
    }
}

module.exports = Poller