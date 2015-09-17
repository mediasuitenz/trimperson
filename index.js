
module.exports = function (config) {
  var library = config.mock === false ?  // mock is on by default
      require('./trim.production') :
      require('./trim.development');

  if (config.mock) {
    console.log('TRIM adapter is loading mock data');
  } else {
    console.log('TRIM adapter is live');
  }
  return library(config.url, config.token, config.debug);
}
