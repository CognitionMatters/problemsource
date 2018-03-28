import { Logger } from "@jwmb/pixelmagic/lib/toReplace/logging";

export enum RequestState {
    Initialized,
    Working,
    Complete
}
export class WebRequest {
    mode: RequestState = RequestState.Initialized;
    promise: Promise<AJAXResult>;

    baseUrl: string;
    method: string;
    defaultData: any;
    timeout: number;
    headers: any;
    constructor(baseUrl: string, method: string = 'GET', defaultData: any = null, timeout: number = -1) {
        this.baseUrl = baseUrl;
        this.method = method;
        this.defaultData = defaultData;
        this.timeout = timeout;
    }

    start(data: any = null, timeout: number = -1): Promise<AJAXResult> {
        this.promise = new Promise<AJAXResult>((res, rej) => {

            this.mode = RequestState.Working;
            if (!data) {
                data = this.defaultData;
            }
            if (timeout < 0) {
                timeout = this.timeout;
            }

            // const self = this;

            const fSuccess = (data_: AJAXResult) => {
                if (this.mode === RequestState.Complete) {
                    return; // Ignore - we probably had a timeout
                }
                this.mode = RequestState.Complete;
                res(data_);
            };
            const fError = (msg) => {
                if (this.mode === RequestState.Complete) {
                    return; // Ignore - we probably had a timeout
                }
                this.mode = RequestState.Complete;
                rej(msg); // { message: msg });
            };
            if (timeout > 0) {
                setTimeout(() => {
                    if (this.mode === RequestState.Working) {
                        const result = new AJAXResult();
                        result.status = 408;
                        result.statusText = 'Timeout';
                        result.responseText = result.statusText;
                        fError(result); // "Timeout");
                    }
                }, timeout);
            }
            if (this.method === 'POST') {
                AJAX.post(this.baseUrl, data, fSuccess, fError, this.headers, true);
            } else {
                AJAX.get(this.baseUrl, data, fSuccess, fError, this.headers, true);
            }
        });
        return this.promise;
    }
}
export class RouterRequest {
    private req: WebRequest;
    get mode(): RequestState { return this.req.mode; }
    retrievedData: any[] = null;
    promise: Promise<any[]>;

    private _url: string;
    private _uuid: string;
    constructor(url: string, uuid: string) {
        this.req = new WebRequest(url, 'GET');
        this._url = url;
        this._uuid = uuid;
    }
    start(timeout: number): Promise<any[]> {
        this.promise = new Promise<any[]>((res, rej) => {
            if (!this._url) {
                rej({ message: 'url missing' });
            } else {
                const self = this;
                this.req.start({ uuid: this._uuid }, timeout)
                    .then(data => {
                        try {
                            self.retrievedData = [JSON.parse(data.responseText)];
                            // TODO: how come we need to parse it?  We have header Accept: application/json!
                            res(self.retrievedData);
                        } catch (parseErr) {
                            rej({ message: 'Routing failed: ' + (data.responseText ? data.responseText.substr(0, 100) : 'N/A') });
                        }
                    }, err => {
                        rej(err);
                    });
            }
        });
        return this.promise;
    }
}

export class AJAXResult {
    status: number;
    statusText: string;
    responseText: string;
    message: string;
    // response
    // responseBody
    // responseXML
    // responseType
}
export class AJAX {
    private static x(): any {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        const versions = [
            'MSXML2.XmlHttp.5.0',
            'MSXML2.XmlHttp.4.0',
            'MSXML2.XmlHttp.3.0',
            'MSXML2.XmlHttp.2.0',
            'Microsoft.XmlHttp'
        ];

        let xhr = null;
        for (let i = 0; i < versions.length; i++) {
            try {
                // TODO: xhr = new ActiveXObject(versions[i]);
                xhr = null;
                break;
            } catch (e) {
            }
        }
        return xhr;
    }

    static send(url: string, callbackSuccess: (r: AJAXResult) => void,
        callbackError: (r: AJAXResult) => void, method: string, data: any,
        async?: boolean, requestHeaders: any = null): void {
        const tmp = AJAX.x();
        tmp.open(method, url, async);
        // tmp.addEventListener("error", (err) => {
        //    Logger.info("Error event: " + JSON.stringify(err, null, " "));
        // });

        tmp.onerror = (err) => { // failure on the network level, or denied cross-domain request
            Logger.info('AJAX onerror');
            // if (err) { Logger.info(JSON.stringify(err, null, " ")); }
            const r = new AJAXResult();
            r.message = tmp.responseText;
            r.responseText = tmp.responseText;
            r.status = tmp.status;
            r.statusText = tmp.statusText;
            // tmp.getAllResponseHeaders()
            callbackError(r);
        };
        tmp.ontimeout = () => {
            const result = new AJAXResult();
            result.status = 408;
            result.statusText = 'Timeout';
            result.responseText = result.statusText;
            Logger.info('AJAX timeout ' + tmp);
            // callbackError(result);
        };
        tmp.onreadystatechange = function () {
            if (tmp.readyState === 4) {
                const result = new AJAXResult();
                result.status = tmp.status;
                result.statusText = tmp.statusText;
                result.responseText = tmp.responseText;
                if (tmp.status === 200 || tmp.status === 304) {
                    callbackSuccess(result);
                } else {
                    const dbgData = data;
                    callbackError(result);
                }
            } else {
            }
        };
        // var requestHeaderNames: string[] = [];
        const defaultHeaders = {
            'Accept': 'application/json', 'Cache-Control': 'no-cache'
        };
        if (method === 'POST' || method === 'PUT') {
            defaultHeaders['Content-Type'] = 'application/json';
        }
        if (requestHeaders != null) {
            Object.keys(requestHeaders).forEach(_ => {
                // requestHeaderNames.push(_);
                defaultHeaders[_] = requestHeaders[_];
                // tmp.setRequestHeader(_, requestHeaders[_]);
            });
        }
        Object.keys(defaultHeaders).forEach(_ => {
            tmp.setRequestHeader(_, defaultHeaders[_]);
        });
        // } else {
        //    //TODO: additional user-supplied headers, e.g. gzip?
        //    //TODO: doesn't work? tmp.setRequestHeader("Date", new Date().toString());
        //    AJAX.setHeaderIfNotSet(tmp, "Accept", "application/json", requestHeaderNames);
        //    //tmp.setRequestHeader("Accept", "application/json");
        //    if (method == "POST" || method == "PUT") {
        //        AJAX.setHeaderIfNotSet(tmp, "Content-Type", "application/json", requestHeaderNames);
        //        //tmp.setRequestHeader("Content-Type", "application/json"); //text/plain application/x-www-form-urlencoded
        //    }
        //    AJAX.setHeaderIfNotSet(tmp, "Cache-Control", "no-cache", requestHeaderNames);
        //    //tmp.setRequestHeader("Cache-Control", "no-cache");
        // }
        // tmp.setRequestHeader("Accept-Encoding", "gzip");
        tmp.send(data);
    }
    // static setHeaderIfNotSet(request: any, headerName: string, value: string, alreadySetHeaders: string[]) {
    //    if (alreadySetHeaders.indexOf(headerName) < 0) {
    //        request.setRequestHeader(headerName, value);
    //    }
    // }
    // static start()
    static get(url: string, data: any, callbackSuccess: (r: AJAXResult) => void,
        callbackError: (r: AJAXResult) => void, headers: any, async?: boolean): void {
        const query: string[] = [];
        Object.keys(data).forEach(key =>
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key])));
        AJAX.send(url + (query.length ? '?' + query.join('&') : ''), callbackSuccess, callbackError, 'GET', null, async, headers);
    }
    static post(url: string, data: any, callbackSuccess: (r: AJAXResult) => void,
        callbackError: (r: AJAXResult) => void, headers: any, async?: boolean): void {
        const query: string[] = [];
        if (typeof data === 'string') {
            query.push(<string>data);
        } else {
            query.push(JSON.stringify(data));
            // for (var key in data) {
            //    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            // }
        }
        AJAX.send(url, callbackSuccess, callbackError, 'POST', query.join('&'), async, headers);
    }
}
