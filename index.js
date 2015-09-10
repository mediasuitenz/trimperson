
module.exports = function (config) {
  var library = config.mock ?
      require('./trim.development') :
      require('./trim.production');

  if (config.mock) {
    console.log('TRIM adapter is loading mock data');

  }
  return library(config.url, config.token);
}
