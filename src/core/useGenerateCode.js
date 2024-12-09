/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable no-redeclare */
/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
import { message } from 'antd'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { nanoid } from 'nanoid'

function getQueryParam(url, paramName) {
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)
  return params.get(paramName)
}

function getUrlBaseAndParams(url, wsType) {
  const urlObj = new URL(url)
  const params = new URLSearchParams(urlObj.search)
  const remainingParams = {}

  let version = '1'
  let rootURL = ''
  let serviceUrl = ''
  let method = ''
  let callType = 'json'
  let user = ''
  let password = ''
  let closeUP = false
  let index = url.indexOf('?')
  let parserKey = []
  let serviceNodeId = ''
  let data = []
  let returnType = ''
  let token = ''

  if (wsType === 'ws2_1') {
    rootURL = urlObj.origin
    serviceUrl = urlObj.pathname
    method = url.slice(url.search(/&iquery=/) + 8, url.indexOf('|'))
    returnType = params.get('calltype') || 'json'
    if (returnType == '4') {
      returnType = 'json'
    } else if (returnType == '5') {
      returnType = 'bitJson'
    } else if (returnType == '1') {
      returnType = 'arraybuffer'
    }
    callType = 'json'
    user = params.get('user') || params.get('u') || ''
    password = params.get('password') || params.get('p') || ''
    url = url.replace(/(.*)&tk=.*/g, '$1')
    url = url.split('|')
    version = url[1]
    data = url.slice(2).map((item, index) => {
      let type = item.split(';')[0]
      let value = item.split(';')[1] + ''
      remainingParams[index] = value
      if (type === 'String' && (value === 'false' || value === 'true')) {
        type = 'Boolean'
      } else if (type === 'Decimal') {
        type = 'Float'
      } else if (type === 'Int32') {
        type = 'Number'
      } else if (type === 'DateTime') {
        type = 'Date'
      } else if (type === 'Byte[]') {
        type = 'Uint8Array'
      }
      return {
        type,
        field: index,
        value,
        description: '',
      }
    })
  } else if (wsType === 'ws3_0') {
    rootURL = urlObj.origin + urlObj.pathname
    method = params.get('funname')
    version = params.get('funversion')
    user = params.get('user') || params.get('u') || ''
    password = params.get('password') || params.get('p') || ''
    // 找到 funversion 参数的位置
    const paramEntries = Array.from(params.entries())
    const funversionIndex = paramEntries.findIndex(([key, value]) => key === 'funversion')
    // 提取 funversion 之后的所有参数
    if (funversionIndex !== -1) {
      for (let i = funversionIndex + 1; i < paramEntries.length; i++) {
        const [key, value] = paramEntries[i]
        remainingParams[key] = value
        data.push({
          type: 'String',
          field: key,
          value: value + '',
          description: '',
        })
      }
    }
  } else if (wsType === 'ws4_0') {
    rootURL = urlObj.origin
    serviceUrl = urlObj.pathname
    method = params.get('funname')
    returnType = params.get('returntype') || 'json'
    callType = params.get('calltype') || 'json'
    token = params.get('token')
    // version = params.get('funversion')
    // user = params.get('user') || params.get('u') || ''
    // password = params.get('password') || params.get('p') || ''
    const paramEntries = Array.from(params.entries())
    const returntypeIndex = paramEntries.findIndex(([key, value]) => key === 'returntype')
    // 提取 returntypeIndex 之后的所有参数
    if (returntypeIndex !== -1) {
      for (let i = returntypeIndex + 1; i < paramEntries.length; i++) {
        const [key, value] = paramEntries[i]
        remainingParams[key] = value
        data.push({
          type: 'String',
          field: key,
          value: value + '',
          description: '',
        })
      }
    }
  } else if (wsType === 'tqzc') {
    rootURL = urlObj.origin + urlObj.pathname
    method = params.get('funname')
    version = params.get('funversion')
    user = params.get('userId') || ''
    serviceNodeId = params.get('serviceNodeId') || ''
    // 找到 funversion 参数的位置
    const paramEntries = Array.from(params.entries())
    for (let i = 0; i < paramEntries.length; i++) {
      const [key, value] = paramEntries[i]
      if (
        key !== 'nonce' &&
        key !== 'timestamp' &&
        key !== 'sign' &&
        key !== 'userId' &&
        key !== 'funname' &&
        key !== 'funversion' &&
        key !== 'calltype' &&
        key !== 'serviceNodeId'
      ) {
        remainingParams[key] = value
        data.push({
          type: 'String',
          field: key,
          value: value + '',
          description: '',
        })
      }
    }
  } else if (wsType === 'rf3_0') {
    rootURL = urlObj.origin
    method = urlObj.pathname.slice(0, urlObj.pathname.indexOf('_v'))
    version = url.slice(url.indexOf('_v') + 2, index)
    user = params.get('u') || ''
    password = params.get('p') || ''
    const paramEntries = Array.from(params.entries())
    for (let i = 0; i < paramEntries.length; i++) {
      const [key, value] = paramEntries[i]
      if (key !== 'u' && key !== 'p') {
        remainingParams[key] = value
        data.push({
          type: 'String',
          field: key,
          value: value + '',
          description: '',
        })
      }
    }
  } else if (wsType === 'kunlun') {
    rootURL = urlObj.origin
    method = urlObj.pathname
    const paramEntries = Array.from(params.entries())
    for (let i = 0; i < paramEntries.length; i++) {
      const [key, value] = paramEntries[i]
      remainingParams[key] = value
      data.push({
        type: 'String',
        field: key,
        value: value + '',
        description: '',
      })
    }
    if (url.endsWith('.nc')) {
      returnType = 'arraybuffer'
      parserKey = ['nc']
    } else if (url.endsWith('.int16')) {
      returnType = 'arraybuffer'
      parserKey = ['int16']
    } else if (url.endsWith('.bin')) {
      returnType = 'arraybuffer'
      parserKey = ['int16']
    } else if (url.endsWith('.text')) {
      returnType = 'arraybuffer'
    } else if (url.endsWith('.zip')) {
      returnType = 'zip'
    }
  }
  if (!user && !password) {
    closeUP = true
  }
  return {
    rootURL: rootURL,
    version,
    data: data,
    parameters: {
      query: data.map((item) => {
        return {
          id: nanoid(6),
          name: item.field + '',
          type: item.type,
          enable: true,
          required: true,
          description: item.description,
          example: item.value,
        }
      }),
    },
    params: remainingParams,
    user,
    password,
    closeUP,
    serviceUrl: serviceUrl,
    method: method,
    callType: callType,
    returnType: returnType,
    parserKey,
    serviceNodeId: serviceNodeId,
    token,
  }
}

export function useGenerateCode() {
  let requestParams = null
  let byte = null
  /**
   * 重写toString并调用自定义格式化
   */
  // Date.prototype.toFormat = function (fmt) {
  //   return dayjs(fmt).format('YYYY-MM-DD HH:mm:ss')
  // }
  // Date.prototype.toString = function () {
  //   return this.toFormat()
  // }
  String.prototype.bool = function () {
    return /^true$/i.test(this)
  }
  function isJSON(str) {
    if (typeof str === 'string') {
      try {
        var obj = JSON.parse(str)

        if (typeof obj === 'object' && obj) {
          return true
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    }
  }
  /**
   * 生成接口参数
   * @returns
   */
  function generateParams(data) {
    let params = {}
    // 转换给生成代码用
    data.forEach((item) => {
      if (item.type === 'Number' || item.type === 'Float') {
        params[item.field] = +item.value
      } else if (item.type === 'Date') {
        params[item.field] = 'Date' + dayjs(item.value).format('YYYY-MM-DD HH:mm:ss')
      } else if (item.type === 'Double') {
        params[item.field] = `new Double(${item.value})`
      } else if (item.type === 'Boolean') {
        params[item.field] = item.value
        if (item.value == 'false') {
          params[item.field] = false
        } else if (item.value == 'true') {
          params[item.field] = true
        }
      } else if (item.type === 'Uint8Array') {
        params[item.field] = `Uint8Array`
        byte = "'因数据太大,无法生成'" //new window[item.type](item.value).toString()
      } else if (isJSON(item.value)) {
        params[item.field] = '[~[' + item.value + ']~]'
      } else {
        params[item.field] = new window[item.type](item.value)
      }
    })
    return params
  }
  function configGenerateParams(data) {
    data.forEach((item) => {
      if (typeof item.value === 'number') {
        item.value = item.value + ''
      }
      if (item.type === 'Int32') {
        item.type = 'Number'
      } else if (item.type === 'DateTime') {
        item.type = 'Date'
      } else if (item.type === 'Byte[]') {
        item.type = 'Uint8Array'
      }
    })
    return data
  }
  /**
   * 接口参数对比默认值  如果跟默认值相同直接删减
   * @returns
   */
  function diffWithWsDefault(key, value) {
    if (!value) {
      return ''
    }
    return `${key}: '${value}',`
  }
  function diffWithDefault(key, value) {
    let ins = new SU.Http().defaults[requestParams.wsType]
    if (key === 'requestHeader' && value) {
      return JSON.stringify(ins[key]) === JSON.stringify(JSON.parse(value))
        ? ''
        : `${key}: '${value}',`
    } else if ((key === 'special' || key === 'method' || key === 'requestHeader') && !value) {
      return ''
    }
    if (
      (requestParams.wsType === 'kunlun' || requestParams.wsType === 'ws4_0') &&
      key === 'version'
    ) {
      return ''
    } else if (key === 'version') {
      return `version: '${value}',`
    }
    if (key === 'refresh') {
      if (!value) {
        return ''
      } else {
        return `refresh,`
      }
    }

    if (ins[key] === value) {
      return ''
    } else if (ins[key] === undefined) {
      return ''
    } else {
      if (typeof value === 'number' || key === 'closeUP') {
        return `${key}: ${value},`
      } else if (key === 'parserKey') {
        if (!value || !value.length) {
          return ''
        } else {
          return `${key}: ${JSON.stringify(value)},`
        }
      } else if (key === 'serviceUrl' && !value) {
        return ''
      } else if (key === 'httpProxyUrl' && !value) {
        return ''
      } else {
        return `${key}: '${value}',`
      }
    }
  }
  /**
   * 生成SU.Http/SU.insHttp代码
   * @returns
   */
  function generateCode(type, data) {
    requestParams = cloneDeep(data)
    if (data?.parameters?.query) {
      data.data = data.parameters.query.map((item) => {
        return {
          type: item.type,
          field: item.name,
          value: item.example,
        }
      })
    }
    if (!(data?.data && Array.isArray(data.data))) {
      return ''
    }
    let params = generateParams(data.data)
    let str = ''
    if (type === 'testHttp') {
      str = `
           SU.insHttp.get.kunlun({rootURL:'resources/test/${requestParams.method}.json',
           ${diffWithDefault('version', '')}
           ${diffWithDefault('callType', requestParams.callType)}
           ${diffWithDefault('returnType', requestParams.returnType)}
           ${diffWithDefault('parserKey', requestParams.parserKey)}
           })
          `
    } else if (type === 'insHttp') {
      str = `
           ${Object.keys(params).length ? `let data = '${JSON.stringify(params)}'换行符` : ''}
           ${
             requestParams.refreshTime && requestParams.refreshTime !== '0'
               ? `let refresh = {time:${requestParams.refreshTime}}换行符`
               : ''
           }
           ${`const requestInfo = ${JSON.stringify({
             requestName: requestParams.requestName,
             interfaceAdder: requestParams.interfaceAdder,
           })}换行符`}
           SU.insHttp.${requestParams.type.toLowerCase()}.${requestParams.wsType}({rootURL:'${
             requestParams.rootURL
           }', ${diffWithDefault('token', requestParams.token)}
           ${diffWithDefault('method', requestParams.method)} ${diffWithDefault(
             'serviceUrl',
             requestParams.serviceUrl
           )}
           ${Object.keys(params).length ? `data,` : ''} ${`requestInfo,`} ${diffWithDefault(
             'version',
             requestParams.version
           )}
           ${diffWithDefault('requestHeader', requestParams.requestHeader)}
           ${diffWithDefault('serviceNodeId', requestParams.serviceNodeId)}
           ${diffWithDefault('special', requestParams.special)}
           ${diffWithDefault('refresh', requestParams.refreshTime)}
           ${diffWithDefault('httpProxyUrl', requestParams.httpProxyUrl)}
           ${diffWithDefault('user', requestParams.user)}
           ${diffWithDefault('password', requestParams.password)}
           ${diffWithDefault('callType', requestParams.callType)} 
           ${diffWithDefault('returnType', requestParams.returnType)}
           ${diffWithDefault('closeUP', !!requestParams.closeUP)}
           ${diffWithDefault('parserKey', requestParams.parserKey)}
           ${
             requestParams.refreshTime && requestParams.refreshTime !== '0'
               ? `success: (res) => {}`
               : ''
           } imgPath:'resources/images/loading.png'})
          `
    } else if (type === 'http') {
      str = `
        let proxy = new SU.Http({rootURL:'${requestParams.rootURL}', ${diffWithDefault('token', requestParams.token)} ${diffWithDefault(
          'httpProxyUrl',
          requestParams.httpProxyUrl
        )} ${diffWithDefault('serviceNodeId', requestParams.serviceNodeId)} wsType:'${
          requestParams.wsType
        }', ${diffWithDefault('user', requestParams.user)} ${diffWithDefault(
          'password',
          requestParams.password
        )} ${diffWithDefault(
          'special',
          requestParams.special
        )} imgPath:'resources/images/loading.png'})换行符
        ${Object.keys(params).length ? `let data = '${JSON.stringify(params)}'换行符` : ''}
        ${`const requestInfo = ${JSON.stringify({
          requestName: requestParams.requestName,
          interfaceAdder: requestParams.interfaceAdder,
        })}换行符`}
        ${
          requestParams.refreshTime && requestParams.refreshTime !== '0'
            ? `let refresh = {time:${requestParams.refreshTime}}换行符`
            : ''
        }
        proxy.request({${diffWithDefault('method', requestParams.method)} ${diffWithDefault(
          'serviceUrl',
          requestParams.serviceUrl
        )} ${Object.keys(params).length ? `data,` : ''} ${`requestInfo,`} ${diffWithDefault(
          'type',
          requestParams.type.toLowerCase()
        )} 
      ${diffWithDefault('version', requestParams.version)}
        ${diffWithDefault('callType', requestParams.callType)} ${diffWithDefault(
          'returnType',
          requestParams.returnType
        )} ${diffWithDefault('refresh', requestParams.refreshTime)} ${diffWithDefault(
          'parserKey',
          requestParams.parserKey
        )}
        ${diffWithDefault('closeUP', !!requestParams.closeUP)}
        ${diffWithDefault('requestHeader', requestParams.requestHeader)}
        ${
          requestParams.refreshTime && requestParams.refreshTime !== '0'
            ? `success: (res) => {}`
            : ''
        }})
        `
    }
    str = str
      .replace(/Date(\d{4}.{1}\d{2}.{1}\d{2} \d{2}:\d{2}:\d{2})/g, `new Date($1)`)
      .replace(/"new Date\((.*?)\)"/g, 'new Date("$1")')
      .replace(/"new Double\((.*?)\)"/g, 'new Double("$1")')
      .replace(/"(\w*?)":/g, '$1:')
      .replace(/'{(.*)}'/g, '{$1}')
      .replace(/\,\s*\}\)/g, '})')
      .replace(/"Uint8Array"/g, `new Uint8Array(${`[${byte}]`})`)
      .replace(/(\[~\[.*?\]~\])|"/g, (match, captureGroup) => {
        if (captureGroup) {
          return match
        } else {
          return "'"
        }
      })
      .replace(/(\[~\[|\]~\])/g, '')
      .replace(/\n/g, '')
      .replace(/换行符/g, ';\n\n')
      .replace(/'\[(.*)\]'/g, '[$1]')
    return str
  }
  /**
   * 生成WS代码
   * @returns
   */
  function generateWsCode(type, data) {
    requestParams = data
    let params = ''
    requestParams.data = requestParams.data || '{}'
    try {
      eval(`params = ${requestParams.data}`)
    } catch (error) {
      message.error('消息内容必须是JSON对象格式')
      return ''
    }
    let str = ''
    if (type === 'ws') {
      str = `
        let socket = new SU.Socket({service:'${requestParams.service}', theme:'${
          requestParams.theme
        }', wsType:'${requestParams.wsType}', ${diffWithWsDefault(
          'user',
          requestParams.user
        )} ${diffWithWsDefault(
          'password',
          requestParams.password
        )} imgPath:'resources/images/loading.png'})换行符
        ${Object.keys(params).length ? `let data = '${JSON.stringify(params)}'换行符` : ''}
        ${`const requestInfo = ${JSON.stringify({
          requestName: requestParams.requestName,
          interfaceAdder: requestParams.interfaceAdder,
        })}换行符`}
        socket.request({requestInfo, ${Object.keys(params).length ? `data,` : ''} messageCode:'${
          requestParams.messageCode
        }', callbackCode:'${requestParams.callbackCode}', ${
          requestParams.notifyCode ? `callback:(e)=>{console.log('本次发送返回的所有消息', e)}` : ''
        }})
        `
    } else if (type === 'on') {
      str = `
        let socket = new SU.Socket({service:'${requestParams.service}', theme:'${
          requestParams.theme
        }', wsType:'${requestParams.wsType}', ${diffWithWsDefault(
          'user',
          requestParams.user
        )} ${diffWithWsDefault('password', requestParams.password)}})换行符
        socket.on("update", function (e) {
          if(!e.data){return}
          if(e.data.MessageCode=='${requestParams.callbackCode}'){}
        });
        `
    }
    str = str
      .replace(/Date(\d{4}.{1}\d{2}.{1}\d{2} \d{2}:\d{2}:\d{2})/g, `new Date($1)`)
      .replace(/"new Date\((.*?)\)"/g, 'new Date("$1")')
      .replace(/"new Double\((.*?)\)"/g, 'new Double("$1")')
      .replace(/"(\w*?)":/g, '$1:')
      .replace(/'{(.*)}'/g, '{$1}')
      .replace(/\,\s*\}\)/g, '})')
      .replace(/"Uint8Array"/g, `new Uint8Array(${`[${byte}]`})`)
      .replace(/(\[~\[.*?\]~\])|"/g, (match, captureGroup) => {
        if (captureGroup) {
          return match
        } else {
          return "'"
        }
      })
      .replace(/(\[~\[|\]~\])/g, '')
      .replace(/\n/g, '')
      .replace(/换行符/g, ';\n\n')
    return str
  }

  /**
   * 根据接口平台生成配置
   * @returns
   */
  function configGenerateRequestParams(data) {
    let params = configGenerateParams(data.params)
    delete data.params
    let url = data.rootURL.replace(/.*(https?:\/\/[^\u4e00-\u9fa5|\s]+).*/g, '$1')
    let rootURL = url
    let serviceUrl = ''
    let callType = data.callType
    let returnType = data.returnType
    if (replaceWsType(data.wsType) == 'ws2_1') {
      callType = 'json'
      returnType = 'json'
      var base = getUrlBaseAndParams(url, replaceWsType(data.wsType))
      rootURL = base.rootURL
      serviceUrl = base.serviceUrl || ''
    }
    if (replaceWsType(data.wsType) == 'rf3_0') {
      let index = data.method.indexOf('_v')
      if (index !== -1) {
        data.method = data.method.slice(0, index)
      }
    }
    return {
      ...data,
      rootURL,
      serviceUrl,
      user: data.user ?? 'admin',
      password: data.password ?? '111',
      returnZip: false,
      wsType: replaceWsType(data.wsType),
      data: params,
      parameters: {
        query: params.map((item) => {
          return {
            id: nanoid(6),
            name: item.field + '',
            type: item.type,
            enable: true,
            required: true,
            description: item.description,
            example: item.value,
          }
        }),
      },
      type: params.some((item) => item.type === 'Uint8Array') === true ? 'POST' : data.type,
      callType,
      returnType,
      parserKey: [],
      requestName: data.requestName ?? '',
      interfaceAdder: data.interfaceAdder ?? '',
    }
  }
  /**
   * 根据URL逆向解析
   * @returns
   */
  function URLparse(url) {
    let httpProxyUrl = ''
    let special = ''
    let returnType = 'json'
    if (/aHR0c/.test(url)) {
      httpProxyUrl = url.replace(/(https?:\/\/.+?)aHR0c.+/, '$1')
      url = window.atob(url.replace(/.+(aHR0c.+?)/g, '$1'))
    }
    let getUrlIndex = url.indexOf('getUrl?url=')
    if (url.includes('getUrl?url=')) {
      url = decodeURIComponent(url)
      url = url.replace(/getUrl\?url=\/*/, '/')
      special = 'hangzhou'
    } else if (url.includes('getBytes?url=')) {
      getUrlIndex = url.indexOf('getBytes?url=')
      url = decodeURIComponent(url)
      url = url.replace(/getBytes\?url=\/*/, '/')
      special = 'hangzhou'
      returnType = 'arraybuffer'
    } else {
      url = decodeURI(url)
    }
    let wsType = isVersion(url)
    const {
      rootURL,
      method,
      version,
      data,
      user,
      password,
      closeUP,
      serviceUrl,
      callType,
      returnType: rt,
      parserKey,
      serviceNodeId,
      requestHeader,
      parameters,
      token,
    } = getUrlBaseAndParams(url, wsType)

    return {
      version,
      data: data,
      parameters,
      wsType,
      user,
      password,
      closeUP,
      type: 'GET',
      requestName: '',
      interfaceAdder: '',
      rootURL: rootURL,
      httpProxyUrl,
      serviceUrl: serviceUrl,
      method: method,
      // apiMethod: method,
      callType: callType,
      returnType: rt || returnType,
      special,
      parserKey,
      serviceNodeId: serviceNodeId,
      requestHeader,
      token,
    }
  }
  /**
   * 根据copy as fetch逆向解析
   * @returns
   */
  function optionsParse(url, options) {
    let body
    try {
      body = JSON.parse(options.body)
    } catch (err) {
      body = options.body
    }
    let httpProxyUrl = ''
    url = decodeURI(url)
    if (body.url) {
      url += body.url
      body.params = body.params.params.jsonStr.data
    }
    let wsType = isVersionForBody(url, body)
    let special = ''
    let version = '1'
    let rootURL = ''
    let serviceUrl = ''
    let method = ''
    let callType = 'json'
    let returnType = 'json'
    let user = 'admin'
    let password = '111'
    let SearchParams = {}
    let index = url.indexOf('?')
    let params = []
    let serviceNodeId = ''
    let requestHeader = ''
    let token = ''
    if (url.includes('postJson')) {
      special = 'hangzhou'
    }
    switch (wsType) {
      case 'rf3_0':
        var contentType = options.headers['accept']
        if (contentType && contentType.includes('application/x-hwcalltypeint16')) {
          requestHeader = `[{header:'Accept',value:'application/x-hwcalltypeint16'}]`
        }
        var base = getUrlBaseAndParams(url, wsType)
        rootURL = base.rootURL
        method = base.method
        version = base.version
        user = body.u ?? body.user ?? ''
        password = body.p ?? body.password ?? ''
        SearchParams = body.params
        break
      case 'ws3_0':
        var base = getUrlBaseAndParams(url, wsType)
        rootURL = base.rootURL
        method = body.fun.name
        version = body.fun.version
        user = body.u ?? body.user ?? ''
        password = body.p ?? body.password ?? ''
        SearchParams = body.params
        break
      case 'ws4_0':
        var base = getUrlBaseAndParams(url, wsType)
        rootURL = base.rootURL
        serviceUrl = base.serviceUrl
        method = base.method
        returnType = base.returnType
        callType = base.callType
        token = base.token
        // version = body.fun.version
        // user = body.u ?? body.user?? ''
        // password = body.p ?? body.password?? ''
        SearchParams = body.params
        break
      case 'tqzc':
        var base = getUrlBaseAndParams(url, wsType)
        rootURL = base.rootURL
        method = body.fun.name
        version = body.fun.version
        user = base.user ?? ''
        password = ''
        serviceNodeId = base.serviceNodeId
        SearchParams = body.params
        break
      case 'ws2_1':
        var base = getUrlBaseAndParams(url, wsType)
        rootURL = base.rootURL
        serviceUrl = base.serviceUrl
        method = body.Function.Name
        const urlObj = new URL(url)
        const searchParams = new URLSearchParams(urlObj.search)
        returnType = searchParams.get('returntype')
        if (returnType == '4') {
          returnType = 'json'
        } else if (returnType == '5') {
          returnType = 'bitJson'
        } else if (returnType == '1') {
          returnType = 'arraybuffer'
        }
        callType = searchParams.get('calltype')
        if (callType == '5') {
          callType = 'json'
        } else if (callType == '4') {
          callType = 'stream'
        }
        version = body.Function.Version
        params = body.Params.map((item, index) => {
          let type = item.Type
          let value = item.Value + ''
          if (type === 'Decimal') {
            type = 'Float'
          } else if (type === 'Int32') {
            type = 'Number'
          } else if (type === 'DateTime') {
            type = 'Date'
          } else if (type === 'Byte[]') {
            type = 'Uint8Array'
          }
          return {
            type,
            field: index,
            value,
            description: '',
          }
        })
        break
      case 'kunlun':
        var base = getUrlBaseAndParams(url, wsType)
        rootURL = base.rootURL
        method = base.method
        var contentType = options.headers['content-type']
        if (contentType && contentType.includes('multipart/form-data')) {
          // 解析 body 内容
          callType = 'formData'
          const boundary = contentType.split('boundary=')[1]
          let parts = options.body.split(`--${boundary}`).filter((part) => part.trim())
          parts.forEach((part) => {
            const [header, value] = part.split('\r\n\r\n')
            const nameMatch = header.match(/name="([^"]+)"/)
            if (nameMatch) {
              const name = nameMatch[1]
              SearchParams[name] = value.trim()
            }
          })
        } else {
          SearchParams = body
        }
        break
    }
    if (wsType !== 'ws2_1') {
      for (const key in SearchParams) {
        params.push({
          type: 'String',
          field: key,
          value: SearchParams[key] + '',
          description: '',
        })
      }
    }
    return {
      version,
      data: params,
      parameters: {
        query: params.map((item) => {
          return {
            id: nanoid(6),
            name: item.field + '',
            type: item.type,
            enable: true,
            required: true,
            description: item.description,
            example: item.value,
          }
        }),
      },
      wsType,
      user,
      password,
      type: 'POST',
      requestName: '',
      interfaceAdder: '',
      rootURL: rootURL,
      httpProxyUrl,
      serviceUrl: serviceUrl,
      method: method,
      callType: callType,
      returnType: returnType,
      special,
      parserKey: [],
      serviceNodeId,
      requestHeader,
      token,
    }
  }
  function isVersion(url) {
    if (url.includes('_v')) {
      return 'rf3_0'
    } else if (url.includes('sign=') && url.includes('serviceNodeId=')) {
      return 'tqzc'
    } else if (
      url.includes('funname=') &&
      (getQueryParam(url, 'token') !== null || getQueryParam(url, 'funversion') === null)
    ) {
      return 'ws4_0'
    } else if (url.includes('funname=') && getQueryParam(url, 'version') === '3') {
      return 'ws3_0'
    } else if (url.includes('iquery=')) {
      return 'ws2_1'
    } else {
      return 'kunlun'
    }
  }
  function isVersionForBody(url, body) {
    if (url.includes('_v')) {
      return 'rf3_0'
    } else if (url.includes('sign=') && url.includes('serviceNodeId=')) {
      return 'tqzc'
    } else if (url.includes('funname=') && getQueryParam(url, 'token') !== null) {
      return 'ws4_0'
    } else if (body.fun && body.version === '3') {
      return 'ws3_0'
    } else if (body.Function) {
      return 'ws2_1'
    } else {
      return 'kunlun'
    }
  }
  function replaceWsType(str) {
    switch (str) {
      case 'WebService2.1':
        str = 'ws2_1'
        break
      case 'WebService3.0':
        str = 'ws3_0'
        break
      case 'WebService4.0':
        str = 'ws4_0'
        break
      case 'Restful3.0':
        str = 'rf3_0'
        break
      case 'Web':
        str = 'kunlun'
        break
      default:
        str = 'kunlun'
        break
    }
    return str
  }
  return {
    generateParams,
    generateCode,
    generateWsCode,
    configGenerateRequestParams,
    URLparse,
    optionsParse,
    isJSON,
  }
}
