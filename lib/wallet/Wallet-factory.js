'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ClearMeWallet = require('./Clear-me-wallet');

var _ClearMeWallet2 = _interopRequireDefault(_ClearMeWallet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WalletFactory = function () {
    function WalletFactory() {
        _classCallCheck(this, WalletFactory);
    }

    _createClass(WalletFactory, null, [{
        key: 'createWallet',
        value: async function createWallet(mnemonic, pKey, provider_url, registryAddress) {
            var clearmeWallet = new _ClearMeWallet2.default(mnemonic, pKey, provider_url, registryAddress);
            var address = await clearmeWallet.getAddress();

            return clearmeWallet;
        }
    }]);

    return WalletFactory;
}();

exports.default = WalletFactory;