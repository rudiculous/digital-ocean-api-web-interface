'use strict'

const GET = 'GET'
const POST = 'POST'
const PUT = 'PUT'
const DELETE = 'DELETE'

const https = require('https')
const http = require('http')
const url = require('url')


class API {

  //ES6: constructor(baseUrl = 'https://api.digitalocean.com/v2', token = process.env.DO_TOKEN) {
  constructor(baseUrl, token) {
    if (baseUrl == null) baseUrl = 'https://api.digitalocean.com/v2'
    if (token == null) token = process.env.DO_TOKEN

    Object.defineProperties(this, {
      timeout: {
        value: 2000, // FIXME
      },
      http: {
        value: baseUrl.startsWith('https') ? https : http
      },
      token: {
        enumerable: true,
        value: token,
      },
      baseUrl: {
        enumerable: true,
        value: baseUrl,
      },
    })

  }

  getTags() {
    return _.call(this, GET, '/tags')
  }

  getTag(name) {
    return _.call(this, GET, `/tags/${name}`)
  }

  createTag(name) {
    return _.call(this, POST, '/tags', { name })
  }

  deleteTag(name) {
    return _.call(this, DELETE, `/tags/${name}`)
  }

  getDroplets() {
    return _.call(this, GET, '/droplets')
  }

  getDroplet(id) {
    return _.call(this, GET, `/droplets/${id}`)
  }

  getDropletsWithTag(name) {
    return _.call(this, GET, `/droplets?tag_name=${name}`)
  }

  tagDroplet(droplet, tag) {
    return _.call(this, POST, `/tags/${tag}/resources`, {
      resources: [
        {
          resource_id: droplet,
          resource_type: 'droplet',
        },
      ],
    })
  }

  untagDroplet(droplet, tag) {
    return _.call(this, DELETE, `/tags/${tag}/resources`, {
      resources: [
        {
          resource_id: droplet,
          resource_type: 'droplet',
        },
      ],
    })
  }

}

exports = module.exports = API

function _(method, location, payload) {
  return new Promise((resolve, reject) => {

    const timer = setTimeout(() => reject(new Error('timeout')), this.timeout)

    const requestOptions = url.parse(this.baseUrl + location)
    requestOptions.method = method
    const headers = requestOptions.headers = {}

    headers['Authorization'] = `Bearer ${this.token}`

    if (payload) {
      payload = JSON.stringify(payload)
      headers['Content-Type'] = 'application/json'
      headers['Content-Length'] = payload.length
    }

    const request = this.http.request(requestOptions, response => {
      response.setEncoding('utf8')

      let data = ''
      response.on('data', buffer => data += buffer)

      response.on('error', error => reject(error))

      response.on('end', () => {
        clearTimeout(timer)

        try {
          if (response.statusCode < 300) {
            resolve(data ? JSON.parse(data) : {})
          }
          else {
            reject({
              request: {
                payload,
                options: requestOptions,
              },
              response: {
                status: response.statusCode,
                body: data ? JSON.parse(data) : {},
              },
            })
          }
        }
        catch(err) {
          console.error({data})
          reject(err)
        }
      })
    })

    request.on('error', error => reject(error))

    if (payload) {
      request.end(payload, 'utf8')
    }
    else {
      request.end()
    }

  })
}
