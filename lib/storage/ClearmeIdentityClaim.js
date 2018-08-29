'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Claim2 = require('./Claim');

var _Claim3 = _interopRequireDefault(_Claim2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ClearmeIdentityClaim = function (_Claim) {
    _inherits(ClearmeIdentityClaim, _Claim);

    // Hold over from my java background.  Perhaps may not be necessary.

    function ClearmeIdentityClaim(ipfsAgent, web3, ownerAddress, issuerAddress, issuer, registryContract, firstName, lastName, email, phoneNumber) {
        _classCallCheck(this, ClearmeIdentityClaim);

        var _this = _possibleConstructorReturn(this, (ClearmeIdentityClaim.__proto__ || Object.getPrototypeOf(ClearmeIdentityClaim)).call(this, ipfsAgent, web3, ownerAddress, issuerAddress, issuer, registryContract));

        _this.firstName = firstName;
        _this.lastName = lastName;
        _this.email = email;
        _this.phoneNumber = phoneNumber;
        return _this;
    }

    return ClearmeIdentityClaim;
}(_Claim3.default);

exports.default = ClearmeIdentityClaim;