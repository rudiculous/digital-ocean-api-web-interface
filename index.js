'use strict'
require('dotenv').load()

const express = require('express')
const app = express()
app.set('view engine', 'jade')

const API = require('./lib/api')
const api = new API()


app.get('/tags', (request, response) => {
  api.getTags()
    .then(data => response.render('tags/index', data))
    .catch(errorHandler(request, response))
})

app.get('/tag/:name', (request, response) => {
  const name = request.params.name

  Promise.all([
    api.getTag(name),
    api.getDropletsWithTag(name),
  ])
    .then(zipData)
    .then(data => response.render('tags/show', data))
    .catch(errorHandler(request, response))
})

app.get('/droplet/:id', (request, response) => {
  const dropletId = request.params.id

  api.getDroplet(dropletId)
    .then(data => response.render('droplets/show', data))
    .catch(errorHandler(request, response))
})


app.listen(3000)


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

function errorHandler(request, response) {
  return error => response.render('error', { error })
}
