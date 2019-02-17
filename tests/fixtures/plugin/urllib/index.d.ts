import { Agent } from 'http';
import { Agent as Agent_1 } from 'https';
export const USER_AGENT: any;
export const TIMEOUT: number;
export const TIMEOUTS: any[];
export const agent: any;
export const httpsAgent: any;
export function curl(url: any, args?: any, callback?: Function, ...args_1: any[]): any;
export function request(url: any, args?: any, callback?: Function, ...args_1: any[]): any;
export function requestWithCallback(url: any, args: any, callback: any, ...args_1: any[]): any;
export function requestThunk(url: any, args: any): (callback: any) => void;
declare class HttpClient_1 {
  constructor(options: any);
  curl(url: any, args: any, callback: any): any;
  request(url: any, args: any, callback: any): any;
  requestThunk(url: any, args: any): (callback: any) => void;
  agent: any;
  hasCustomAgent: any;
  httpsAgent: any;
  hasCustomHttpsAgent: any;
  defaultArgs: any;
}
export const HttpClient: typeof HttpClient_1;
declare class HttpClient2_1 {
  constructor(options: any);
  curl(url: any, args: any): any;
  request(url: any, args: any): any;
  requestThunk(url: any, args: any): (callback: any) => void;
}
export const HttpClient2: typeof HttpClient2_1;
export function create(options: any): HttpClient_1;
export const bbb: number;
export const abc: number;
export const aaaa: string;
declare namespace _Urllib_1 {
  // tests/fixtures/plugin/urllib/urllib.js
  export const USER_AGENT: any;
  export const agent: Agent;
  export const httpsAgent: Agent_1;
  /**
   * The default request timeout(in milliseconds).
   * @type {Number}
   * @const
   */
  export const TIMEOUT: any;
  export const TIMEOUTS: any[];
  /**
   * Handle all http request, both http and https support well.
   *
   * @example
   *
   * // GET http://httptest.cnodejs.net
   * urllib.request('http://httptest.cnodejs.net/test/get', function(err, data, res) {});
   * // POST http://httptest.cnodejs.net
   * var args = { type: 'post', data: { foo: 'bar' } };
   * urllib.request('http://httptest.cnodejs.net/test/post', args, function(err, data, res) {});
   *
   * @param {String|Object} url
   * @param {Object} [args], optional
   *   - {Object} [data]: request data, will auto be query stringify.
   *   - {Boolean} [dataAsQueryString]: force convert `data` to query string.
   *   - {String|Buffer} [content]: optional, if set content, `data` will ignore.
   *   - {ReadStream} [stream]: read stream to sent.
   *   - {WriteStream} [writeStream]: writable stream to save response data.
   *       If you use this, callback's data should be null.
   *       We will just `pipe(ws, {end: true})`.
   *   - {consumeWriteStream} [true]: consume the writeStream, invoke the callback after writeStream close.
   *   - {String} [method]: optional, could be GET | POST | DELETE | PUT, default is GET
   *   - {String} [contentType]: optional, request data type, could be `json`, default is undefined
   *   - {String} [dataType]: optional, response data type, could be `text` or `json`, default is buffer
   *   - {Boolean|Function} [fixJSONCtlChars]: optional, fix the control characters (U+0000 through U+001F)
   *       before JSON parse response. Default is `false`.
   *       `fixJSONCtlChars` can be a function, will pass data to the first argument. e.g.: `data = fixJSONCtlChars(data)`
   *   - {Object} [headers]: optional, request headers
   *   - {Number|Array} [timeout]: request timeout(in milliseconds), default is `exports.TIMEOUTS containing connect timeout and response timeout`
   *   - {Agent} [agent]: optional, http agent. Set `false` if you does not use agent.
   *   - {Agent} [httpsAgent]: optional, https agent. Set `false` if you does not use agent.
   *   - {String} [auth]: Basic authentication i.e. 'user:password' to compute an Authorization header.
   *   - {String} [digestAuth]: Digest authentication i.e. 'user:password' to compute an Authorization header.
   *   - {String|Buffer|Array} [ca]: An array of strings or Buffers of trusted certificates.
   *       If this is omitted several well known "root" CAs will be used, like VeriSign.
   *       These are used to authorize connections.
   *       Notes: This is necessary only if the server uses the self-signed certificate
   *   - {Boolean} [rejectUnauthorized]: If true, the server certificate is verified against the list of supplied CAs.
   *       An 'error' event is emitted if verification fails. Default: true.
   *   - {String|Buffer} [pfx]: A string or Buffer containing the private key,
   *       certificate and CA certs of the server in PFX or PKCS12 format.
   *   - {String|Buffer} [key]: A string or Buffer containing the private key of the client in PEM format.
   *       Notes: This is necessary only if using the client certificate authentication
   *   - {String|Buffer} [cert]: A string or Buffer containing the certificate key of the client in PEM format.
   *       Notes: This is necessary only if using the client certificate authentication
   *   - {String} [passphrase]: A string of passphrase for the private key or pfx.
   *   - {String} [ciphers]: A string describing the ciphers to use or exclude.
   *   - {String} [secureProtocol]: The SSL method to use, e.g. SSLv3_method to force SSL version 3.
   *       The possible values depend on your installation of OpenSSL and are defined in the constant SSL_METHODS.
   *   - {Boolean} [followRedirect]: Follow HTTP 3xx responses as redirects. defaults to false.
   *   - {Number} [maxRedirects]: The maximum number of redirects to follow, defaults to 10.
   *   - {Function(from, to)} [formatRedirectUrl]: Format the redirect url by your self. Default is `url.resolve(from, to)`
   *   - {Function(options)} [beforeRequest]: Before request hook, you can change every thing here.
   *   - {Boolean} [streaming]: let you get the res object when request connected, default is `false`. alias `customResponse`
   *   - {Boolean} [gzip]: Accept gzip response content and auto decode it, default is `false`.
   *   - {Boolean} [timing]: Enable timing or not, default is `false`.
   *   - {Function} [lookup]: Custom DNS lookup function, default is `dns.lookup`.
   *       Require node >= 4.0.0 and only work on `http` protocol.
   *   - {Boolean} [enableProxy]: optional, enable proxy request. Default is `false`.
   *   - {String|Object} [proxy]: optional proxy agent uri or options. Default is `null`.
   * @param {Function} [callback]: callback(error, data, res). If missing callback, will return a promise object.
   * @return {HttpRequest} req object.
   * @api public
   */
  export function request(url: any, args?: any, callback?: Function, ...args_1: any[]): any;
  export function curl(url: any, args?: any, callback?: Function, ...args_1: any[]): any;
  export function requestThunk(url: any, args: any): (callback: any) => void;
  export function requestWithCallback(url: any, args: any, callback: any, ...args_1: any[]): any;
}
declare const urllib: typeof _Urllib_1;
export default urllib;
