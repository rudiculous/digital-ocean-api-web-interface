'use strict'
require('dotenv').load()

const express = require('express')
const app = express()
app.set('view engine', 'jade')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
  extended: true,
}))

const API = require('./lib/api')
const api = new API()

const pathPrefix = process.env.PATH_PREFIX
app.locals.pathPrefix = pathPrefix


app.get(`${pathPrefix}`, (request, response) => {
  response.render('index')
})

app.get(`${pathPrefix}/tags`, (request, response) => {
  api.getTags()
    .then(data => response.render('tags/index', data))
    .catch(errorHandler(request, response))
})

app.post(`${pathPrefix}/tags`, (request, response) => {
  const name = request.body.name
  const redirect = request.body.redirect || `${pathPrefix}/tags`

  api.createTag(name)
    .then(dataLogger)
    .then(data => {
      // FIXME: Pass message.
      response.redirect(redirect)
    })
    .catch(errorHandler(request, response))
})

app.get(`${pathPrefix}/tag/:name`, (request, response) => {
  const name = request.params.name

  Promise.all([
    api.getTag(name),
    api.getDropletsWithTag(name),
    api.getDroplets(),
  ])
    .then(data => {
      return {
        tag: data[0].tag,
        droplets: data[1].droplets,
        allDroplets: data[2].droplets,
      }
    })
    .then(data => response.render('tags/show', data))
    .catch(errorHandler(request, response))
})

app.post(`${pathPrefix}/tag/:name/destroy`, (request, response) => {
  const name = request.params.name
  const redirect = request.body.redirect || `/tags`

  api.deleteTag(name)
    .then(data => {
      // FIXME: Pass message.
      response.redirect(redirect)
    })
    .catch(errorHandler(request, response))
})

app.post(`${pathPrefix}/tag/:name/tag`, (request, response) => {
  const name = request.params.name
  const dropletId = request.body.dropletId
  const redirect = request.body.redirect || `${pathPrefix}/tag/${name}`

  api.tagDroplet(dropletId, name)
    .then(data => {
      // FIXME: Pass message.
      response.redirect(redirect)
    })
    .catch(errorHandler(request, response))
})

app.post(`${pathPrefix}/tag/:name/untag`, (request, response) => {
  const name = request.params.name
  const dropletId = request.body.dropletId
  const redirect = request.body.redirect || `${pathPrefix}/tag/${name}`

  api.untagDroplet(dropletId, name)
    .then(data => {
      // FIXME: Pass message.
      response.redirect(redirect)
    })
    .catch(errorHandler(request, response))
})

app.get(`${pathPrefix}/droplets`, (request, response) => {
  api.getDroplets()
    .then(data => response.render('droplets/index', data))
    .catch(errorHandler(request, response))
})

app.get(`${pathPrefix}/droplet/:id`, (request, response) => {
  const dropletId = request.params.id

  api.getDroplet(dropletId)
    .then(data => response.render('droplets/show', data))
    .catch(errorHandler(request, response))
})


app.listen(process.env.PORT || 3000, process.env.HOST || 'localhost')


function dataLoggerBrief(data) {
  console.log(data)
  return data
}

function dataLogger(data) {
  console.log(JSON.stringify(data, null, '    '))
  return data
}

function zipData(dataList) {
  const obj = {}

  for (const data of dataList) {
    for (const key of Object.keys(data)) {
      obj[key] = data[key]
    }
  }

  return obj
}

function todo(request, response) {
  return data => response.render('todo', { data })
}

function errorHandler(request, response) {
  return error => response.render('error', { error })
}
