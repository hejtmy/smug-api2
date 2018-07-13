
// const objectAssign = require('object-assign');

module.exports = function (options) {
  'use strict'

  const rq = require('request-promise-native')
// const util = require('util')
  const fs = require('fs-extra')
  const path = require('path')
  const get_api_url = require('./lib/get-api.js')(options)

  //  rq.debug = true

  let config = {
    username: '',
    api_key: ''
  }

  let api = {}
  let Parameters = {
    start: 1,
    count: 200
  }

  const rootURL = 'http://www.smugmug.com'
  const Headers = {
    'User-Agent': 'request',
    'Accept': ' application/json',
    'Response': ' application/json'
  }

  function makeRequestOptions (base, params) {
    const apiKey = {APIKey: config.api_key}

    let url
    let queryParamas = Object.assign({}, apiKey, Parameters, params)

    switch (base) {
      case 'get-api':
        url = rootURL + '/api/v2'
        queryParamas = Object.assign({}, apiKey, params)
        break
      case 'connect':
        url = rootURL + API.urls.UserBase
        queryParamas = Object.assign({}, apiKey, params)
        break
      case '':
        url = config.UserBase
        break
    }

    return {
      uri: url,
      qs: queryParamas,
      headers: Headers,
      json: true
    }
  }

  function getAPI (options) {
    return rq(makeRequestOptions('get-api', Object.assign({}, options))) // , ,  {_filteruri:'AlbumBase'}
      .then(function (body) {
        if (options && options.raw === true) {
          return body.Response
        } else {
          const URLs = body.Response.Uris
          for (let i in URLs) {
            api[i] = URLs[i].Uri
          }
          return api
        }
      })
      .then(function (URLs) {
        if (options && options.save === true) {
          const FilePath = path.join(__dirname, 'lib/api-urls.json')
          fs.outputJson(FilePath, URLs)
            .then(function (data) {
              console.info(FilePath + ' has been saved')
            })
            .catch(function (err) {
              throw err
            })

          fs.writeFileSync(path.join(__dirname, 'lib/api-urls.json'), JSON.stringify(URLs, null, 2), 'utf-8')
        }
        return URLs
      })
      .catch(function (err) {
        throw err
      })
  }

  function connect (options) {
    return rq(makeRequestOptions('connect', Object.assign({}, {_filter: 'EndpointType', _filteruri: ''}, options)))
      .then(function (body) {
        //        console.log(body.Code)
        // console.log( util.inspect(body, {showHidden: false, depth: null})  );

        return body.Response
      })
      .catch(function (err) {
        throw err
      })
  }

  function User (oParam, oExtraMethods) {
    return rq(get_api_url.getUrl('User', oParam, oExtraMethods))
      .then(function (body) {
        //let User = body.Response.User
        //User.Node = User.Uris.Node.split('/')[4]
        return body
      })
      .catch(function (err) {
        throw err
      })
  }

  function Node (oParam, oExtraMethods) {
    return rq(get_api_url.getUrl('Node', oParam, oExtraMethods))
      .then(function (body) {
        //let User = body.Response.User
        //User.Node = User.Uris.Node.split('/')[4]
        return body.Response.Node
      })
      .catch(function (err) {
        throw err
      })
  }


  return {
    getAPI: getAPI,
    connect: connect,
    user: User,
    node: Node
  }
}
