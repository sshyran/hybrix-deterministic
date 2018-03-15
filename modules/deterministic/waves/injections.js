const randomBytes = crypto.randomBytes;
if (typeof window === 'object') {
  const wCrypto = window.crypto = window.crypto || {};
  if (!wCrypto.getRandomValues) {
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length);
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i];
      }
    }
  }
}


altFetch = function(url, opts){

  // we don't return anything usefull, just let it burn. We've got we came for and we'll capture the request with a catch
  return new Promise((resolve, reject) => {

    resolve({json:function(response){

      return new Promise((resolve, reject) => {
        resolve(opts);
      });
    }});});
};
