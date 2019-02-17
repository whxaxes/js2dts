declare class Cookie {
  constructor(name: any, value: any, attrs: any);
  path: string;
  expires?: any;
  domain?: any;
  httpOnly: boolean;
  sameSite: boolean;
  secure: boolean;
  overwrite: boolean;
  toString(): string;
  toHeader(): string;
  name: any;
  value: any;
}
declare class Cookies {
  constructor(request: any, response: any, options: any);
  get(name: any, opts: any): any;
  set(name: any, value: any, opts: any): Cookies;
  static express(keys: any): (req: any, res: any, next: any) => void;
  static connect(keys: any): (req: any, res: any, next: any) => void;
  static Cookie: typeof Cookie;
  request: any;
  response: any;
  keys: any;
  secure: any;
}
declare const _Cookies: typeof Cookies;
export = _Cookies;
