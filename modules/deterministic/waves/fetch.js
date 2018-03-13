//https://github.com/bitinn/node-fetch/blob/master/src/index.js

fetch = function(url, opts){

  // we don't return anything usefull, just let it burn. We've got we came for and we'll capture the request with a catch
  return new global.Promise((resolve, reject) => {

    resolve({json:function(response){

      return new global.Promise((resolve, reject) => {
        var signature =  JSON.parse(opts.body).signature;
        resolve(signature);
      });
    }});});
}

module.exports = fetch;
