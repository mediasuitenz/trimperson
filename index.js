
module.exports = function (config) {
  var library = config.mock === false ?  // mock is on by default
      require('./trim.production') :
      require('./trim.development')

  return library(config)
}
