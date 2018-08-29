'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // This is simple Hierarchical Deterministic (HD) BIP32 wallet needed for the purpose of
// signing claims and illustrating the signing of claims in demos.  It is also to be
// used a tool to speed up iterative development.
// Each instance of this wallet has a single address.
// https://medium.com/bitcraft/so-you-want-to-build-an-ethereum-hd-wallet-cb2b7d7e4998
// https://github.com/ethereum/EIPs/issues/84#issue-143651804
// Updated to simply be a wrapper around the ethereumjs-wallet to handle the actors wallets and signing.
// Requirement and assumptions are that the wallet will only have one address to validate the signatures against.
// More testing will be needed!

// import ethUtil from 'ethereumjs-util';
// import hdkey from 'ethereumjs-wallet/hdkey';

// import ProviderEngine from 'web3-provider-engine';
// import FiltersSubprovider from 'web3-provider-engine/subproviders/filters.js';
// import HookedSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
// import ProviderSubprovider from 'web3-provider-engine/subproviders/provider.js';

// import { Wallet } from 'ethereumjs-wallet';

// import { claim } from '../storage/Claim';


var _bip = require('bip39');

var _bip2 = _interopRequireDefault(_bip);

var _hdkey = require('hdkey');

var _hdkey2 = _interopRequireDefault(_hdkey);

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _safeBuffer = require('safe-buffer');

var _clearMeIdentity = require('clear-me-identity');

var _Claim = require('../../lib/storage/Claim');

var _Claim2 = _interopRequireDefault(_Claim);

var _IPFSAgent = require('../../lib/storage/IPFSAgent');

var _IPFSAgent2 = _interopRequireDefault(_IPFSAgent);

var _resolver = require('clear-me-resolver/lib/resolver');

var _resolver2 = _interopRequireDefault(_resolver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// const Wallet = require('ethereumjs-wallet');
var ClearMeWallet = function () {
    function ClearMeWallet(mnemonic, pKey, provider_url, registryAddress) {
        _classCallCheck(this, ClearMeWallet);

        this.mnemonic = mnemonic;
        this.pKey = pKey;
        this.provider_url = provider_url;
        this.registryAddress = registryAddress;
        this.ipfsAgent = new _IPFSAgent2.default('ipfs.infura.io', '5001', 'https');
        this.resolver = new _resolver2.default('ipfs.infura.io', '5001', 'https');
        this.account = '';
        this.address = '';
        this.ethereumWallet = '';
        this.web3 = '';
    }

    _createClass(ClearMeWallet, [{
        key: 'setClaim',
        value: async function setClaim(subjectsAddress, claimData) {
            this.setUpWeb3Provider();
            var issuerAddress = await this.getAddress();
            var registryInstance = await new this.web3.eth.Contract(JSON.parse(JSON.stringify(_clearMeIdentity.registry.abi)), this.registryAddress, { gasPrice: '12345678', from: issuerAddress });
            var claim = new _Claim2.default(this.ipfsAgent, this.web3, registryInstance._address, subjectsAddress, issuerAddress);
            claim.data = claimData;
            await claim.sign(this.pKey);
            var ipfsHash = await claim.save();
        }
    }, {
        key: 'getClaim',
        value: async function getClaim(issuerAddress) {
            var web3 = this.setUpWeb3Provider();
            var ownerAddress = await this.getAddress();
            var registryInstance = await new web3.eth.Contract(JSON.parse(JSON.stringify(_clearMeIdentity.registry.abi)), this.registryAddress, { gasPrice: '12345678', from: ownerAddress });
            var claimHash = await registryInstance.methods.getClaim(ownerAddress, issuerAddress).call();
            var did = 'did:clear:' + claimHash;
            var ddoDoc = await this.resolver.resolve(did);
            var claim = ddoDoc;
            return claim;
        }
    }, {
        key: 'verifyClaim',
        value: async function verifyClaim(signature, subjectsAddress, data) {
            this.setUpWeb3Provider();
            var claim = new _Claim2.default(this.ipfsAgent, this.web3, this.registryAddress, subjectsAddress, this.address);
            claim.data = data;
            return await claim.verify(signature);
        }
    }, {
        key: 'setUpWeb3Provider',
        value: function setUpWeb3Provider() {
            this.web3 = new _web2.default(new _web2.default.providers.HttpProvider(this.provider_url));
            return this.web3;
        }
    }, {
        key: 'getAddress',
        value: async function getAddress() {
            var web3 = await this.setUpWeb3Provider();
            this.account = await web3.eth.accounts.wallet.add(this.pKey);
            this.address = this.account.address;
            return this.address;
        }
    }, {
        key: 'getBalance',
        value: async function getBalance() {
            var web3 = this.setUpWeb3Provider();
            var address = await this.getAddress();
            return await this.web3.eth.getBalance(address);
        }
    }]);

    return ClearMeWallet;
}();

exports.default = ClearMeWallet;