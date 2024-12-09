/** HTTP 请求方法。 */
export const enum HttpMethod {
  Get = 'GET',
  Post = 'POST',
  // Put = 'PUT',
  // Delete = 'DELETE',
  // Head = 'HEAD',
  // Options = 'OPTIONS',
  // Patch = 'PATCH',
  // Trace = 'TRACE',
}

/** API 状态。 */
export const enum ApiStatus {
  Developing = 'developing',
  Testing = 'testing',
  Exception = 'exception',
  Tested = 'tested',
  Released = 'released',
  Deprecated = 'deprecated',
}

/** 接口菜单顶级目录的分类类型。 */
export const enum CatalogType {
  /** 项目概况。 */
  Overview = 'overview',
  /** 接口。 */
  Http = 'http',
  /** 数据模型。 */
  Schema = 'schema',
  /** 快捷请求。 */
  Request = 'request',
  /** 回收站。 */
  Recycle = 'recycle',
  /** Markdown 文件。 */
  Markdown = 'markdown',
}

export const enum MenuItemType {
  /** 接口用例 */
  ApiCase = 'apiCase',
  /** 接口详情 */
  ApiDetail = 'apiDetail',
  /** 接口分组 */
  ApiDetailFolder = 'apiDetailFolder',
  /** 数据引用模型 */
  ApiSchema = 'apiSchema',
  /** 数据引用模型分组 */
  ApiSchemaFolder = 'apiSchemaFolder',
  /** 快捷请求分组 */
  RequestFolder = 'requestFolder',
  /** 快捷请求 */
  HttpRequest = 'httpRequest',
  /** 文档 */
  Doc = 'doc',
}

export const enum MenuId {
  默认分组 = '.0',
  嵌套分组 = '.0.1',
  xx = '.0.1.0',
  示例接口 = '.0.1.1',
  示例接口2 = '.0.1.2',
  宠物店 = '.1',
  查询宠物详情 = '.1.2',
  查询宠物详情用例 = '.1.2.1',
  查询宠物详情用例2 = '.1.2.2',
  新建宠物信息 = '.1.3',
  文档 = '.2',
  宠物店S = ',1',
  SchemaPet = ',1.1',
  SchemaCategory = ',1.2',
  SchemaTag = ',1.3',
  引用模型 = ',2',
  Request = '/1',
  Request2 = '/1.1',
}

export const enum ParamType {
  String = 'String',
  Int32 = 'Number',
  Float = 'Float',
  Double = 'Double',
  Boolean = 'Boolean',
  DateTime = 'Date',
  Byte = 'Uint8Array',
  Array = 'array',
}

export const enum ContentType {
  JSON = 'json',
  XML = 'xml',
  HTML = 'html',
  Raw = 'raw',
  Binary = 'binary',
}

export const enum BodyType {
  None = 'none',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Json = 'application/json',
  Xml = 'application/xml',
  Raw = 'text/plain',
  Binary = 'application/octet-stream',
}
