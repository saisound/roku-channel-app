const _ENDPOINT = "https://portal.sr.roku.com";

function Requester(method = "GET", endPoint = null) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest();

  let _defaultQuery = {};
  let _target = "";
  const headers = {};

  function setDefaultQuery(value) {
    _defaultQuery = value;
  }

  function setHeader(header, value) {
    headers[header] = value;
  }

  function setLocale(locale) {
    const storeCode = locale.split("_")[1].toLowerCase();
    if (storeCode?.length !== 2) {
      throw new Error("Invalid locale");
    }
    setHeader("x-roku-reserved-channel-store-code", storeCode);
    setHeader("x-roku-reserved-culture-code", locale);
  }

  function removeHeader(header) {
    delete headers[header];
  }

  function setTarget(value) {
    _target = value;
  }

  function send(cb, param = null, body = null) {
    function caller() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          cb(result);
        } catch (parseError) {
          cb({ error: "parse_error", details: parseError.message });
        }
      } else {
        cb({ error: "http_error", status: xhr.status, statusText: xhr.statusText });
      }
      xhr.removeEventListener("load", caller);
      xhr.removeEventListener("error", errorHandler);
      xhr.removeEventListener("timeout", timeoutHandler);
    }
    function timeoutHandler() {
      cb({ error: "timeout" });
      xhr.removeEventListener("load", caller);
      xhr.removeEventListener("error", errorHandler);
      xhr.removeEventListener("timeout", timeoutHandler);
    }
    function errorHandler() {
      cb({ error: "network_error" });
      xhr.removeEventListener("load", caller);
      xhr.removeEventListener("error", errorHandler);
      xhr.removeEventListener("timeout", timeoutHandler);
    }

    xhr.addEventListener("load", caller);
    xhr.addEventListener("error", errorHandler);
    xhr.addEventListener("timeout", timeoutHandler);
    xhr.timeout = 4000;

    let add = "";

    if (param) {
      Object.assign(_defaultQuery, param);
      Object.keys(_defaultQuery).forEach((key) => {
        add += `${key}=${_defaultQuery[key]}&`;
      });
    }

    xhr.open(method, `${endPoint || _ENDPOINT}/${_target}?${add}`);
    Object.keys(headers).forEach((h) => {
      xhr.setRequestHeader(h, headers[h]);
    });
    xhr.send(body ? JSON.stringify(body) : undefined);
  }

  setHeader("x-roku-reserved-culture-code", "en_US");
  setHeader("x-roku-reserved-channel-store-code", "us");
  setHeader(
    "x-roku-reserved-client-version",
    "app=globalsearch,version=3.0,platform=rokuplayer,libversion=99.6.00176,tests=search-vsr_api",
  );
  setHeader("x-roku-reserved-display", "fhd");
  setHeader("x-roku-reserved-serial-number", "YN002E232710a"); // setHeader('x-roku-reserved-model-name', '4400X');
  // setHeader('x-roku-reserved-profile-id', '35620eb5-d899-46f8-85d0-9924ddce72f4');
  // setHeader('x-roku-reserved-version', '509.00E04083A');

  setHeader("Content-Type", "application/json");

  function promisifiedSend(param = null, body = null) {
    return new Promise((resolve, reject) => {
      try {
        send(
          (data) => {
            resolve(data);
          },
          param,
          body,
        );
      } catch (ex) {
        reject(ex);
      }
    });
  }

  this.send = send;
  this.promisifiedSend = promisifiedSend;
  this.setHeader = setHeader;
  this.removeHeader = removeHeader;
  this.setDefaultQuery = setDefaultQuery;
  this.setTarget = setTarget;
  this.setLocale = setLocale;
}

export default Requester;
