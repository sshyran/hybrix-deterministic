//https://github.com/bitinn/node-fetch/blob/master/src/index.js


gotcha = {
  url: null,
  opts: null
};

fetch = function(url, opts){
  console.log("url:"+url);
  console.log("opts:"+JSON.stringify(opts));
  gotcha.url = url;
  gotcha.opts = opts;
  // we don't return anything usefull, just let it burn. We've got we came for and we'll capture any errors with a try-catch
  return new global.Promise((resolve, reject) => {


    resolve({json:function(response){

      return new global.Promise((resolve, reject) => {

      });
    }});



//    reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));

  });


}

fetch.q = gotcha;

module.exports = fetch;
