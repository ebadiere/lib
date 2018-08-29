'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _IPFSAgent = require('./IPFSAgent');

var _IPFSAgent2 = _interopRequireDefault(_IPFSAgent);

var _clearMeIdentity = require('clear-me-identity');

var _ethereumjsUtil = require('ethereumjs-util');

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Claim = function () {
    function Claim(ipfsAgent, web3, registryContractAddress, subjectAddress, issuerAddress, issuer) {
        _classCallCheck(this, Claim);

        this.ipfsAgent = ipfsAgent;
        this.web3 = web3;
        this.registryContractAddress = registryContractAddress;
        this.subjectAddress = subjectAddress;
        this.issuerAddress = issuerAddress;
        this.issuer = issuer;
        this.data = {};
        this.signature = {};
        this.simpleVerifiableClaim = {};
        this.encodedDDo = '';
    }

    _createClass(Claim, [{
        key: 'setData',
        value: function setData(data) {
            this.data = data;
        }
    }, {
        key: 'save',
        value: async function save() {
            // For now will save the claim to IPFS and record to the registry.
            // Perhaps validate signatures here in the future.  Should a claim's signature 
            // be verified before it is saved?
            // Also, for now will simply save data as is to IPFS, not encoded or encrypted simply
            // to take time and decide later.
            this.simpleVerifiableClaim.issuer = this.issuer;

            var date = this.setUpDate();

            this.simpleVerifiableClaim.issued = date.year + '-' + date.month + '-' + date.day;
            this.simpleVerifiableClaim.claim = this.data;

            this.setUpSignature(date);
            this.simpleVerifiableClaim.signature = this.signature;

            this.simpleVerifiableClaim.claim = this.data;
            var claimHash = await this.ipfsAgent.saveJSONData(this.simpleVerifiableClaim);
            var registryContract = new this.web3.eth.Contract(JSON.parse(JSON.stringify(_clearMeIdentity.registry.abi)), this.registryContractAddress);
            var result = await registryContract.methods.setClaim(this.subjectAddress, claimHash).send({ gas: '1000000', from: this.issuerAddress });
            // open system question.  Now it will simply return the IPFS hash.  Should it go through the registry contract
            // first?
            // return claimHash;
        }
    }, {
        key: 'sign',
        value: async function sign(pKey) {
            this.signature.signatureHash = await this.web3.eth.accounts.sign(JSON.stringify(this.data), pKey);
            return this.signature.signatureHash.signature;
        }
    }, {
        key: 'verify',
        value: async function verify(signature) {
            var addr = await this.web3.eth.accounts.recover(JSON.stringify(this.data), signature);
            return this.web3.utils.toChecksumAddress(addr) == this.web3.utils.toChecksumAddress(this.issuerAddress);
        }
    }, {
        key: 'toHex',
        value: function toHex(str) {
            var hex = '';
            for (var i = 0; i < str.length; i++) {
                hex += '' + str.charCodeAt(i).toString(16);
            }
            return hex;
        }
    }, {
        key: 'setUpDate',
        value: function setUpDate() {
            var dateStruct = {};
            var date = new Date();
            dateStruct.date = date;
            dateStruct.year = date.getFullYear();
            dateStruct.month = date.getMonth() + 1;
            dateStruct.day = date.getDate();
            dateStruct.hours = date.getHours();
            dateStruct.minutes = date.getMinutes();
            dateStruct.seconds = date.getSeconds();
            return dateStruct;
        }
    }, {
        key: 'setUpSignature',
        value: function setUpSignature(date) {
            this.signature.type = 'LinkedDataSignature2015';
            this.signature.created = date.year + '-' + date.month + '-' + date.day + 'T' + date.hours + ':' + date.minutes + ':' + date.seconds;
            this.signature.creator = this.issuer;
        }
    }]);

    return Claim;
}();

exports.default = Claim;