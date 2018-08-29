'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _clearMeIdentity = require('clear-me-identity');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Identity = function () {
    function Identity(web3, account) {
        _classCallCheck(this, Identity);

        this.Web3 = web3;
        this.account = account;
        this.address = '';
        this.identityContract = '';
    }

    _createClass(Identity, [{
        key: 'deploy',
        value: async function deploy() {
            this.identityContract = await new this.Web3.eth.Contract(JSON.parse(JSON.stringify(_clearMeIdentity.identity.abi))).deploy({ data: _clearMeIdentity.identity.bytecode }).send({ gas: '1000000', from: this.account });
            return this.identityContract;
        }
    }]);

    return Identity;
}();

exports.default = Identity;