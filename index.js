
module.exports = function (config) {
  var library = config.mock ?
      require('./trim.development') :
      require('./trim.production');

  return library(config.url, config.token);
}
