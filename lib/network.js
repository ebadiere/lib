"use strict";

var _truffleHdwalletProvider = require("truffle-hdwallet-provider");

var _truffleHdwalletProvider2 = _interopRequireDefault(_truffleHdwalletProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: new _truffleHdwalletProvider2.default(process.env.NMEMONIC, "https://rinkeby.infura.io/" + process.env.INFURA_KEY),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000
    }
  }
};