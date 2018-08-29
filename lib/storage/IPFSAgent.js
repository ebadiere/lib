'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('ipfs-api/dist/index.min.js');

var _ipfsApi = require('ipfs-api');

var _ipfsApi2 = _interopRequireDefault(_ipfsApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IPFSAgent = function () {
    function IPFSAgent(host, port, protocol) {
        _classCallCheck(this, IPFSAgent);

        this.ipfs = (0, _ipfsApi2.default)(host, port, { protocol: protocol });
    }

    _createClass(IPFSAgent, [{
        key: 'addEncodedDataToIPFS',
        value: async function addEncodedDataToIPFS(data) {
            var buffData = Buffer.from(data);
            try {
                return await this.ipfs.files.add(buffData);
            } catch (err) {
                throw new Error('Error adding file to IPFS ' + err);
            }
        }
    }, {
        key: 'addDataToIPFS',
        value: async function addDataToIPFS(data) {
            if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object' || data === null) {
                throw new Error('JSON expected, received ' + (typeof data === 'undefined' ? 'undefined' : _typeof(data)));
            }
            // console.log(`DEBUG: data: ${JSON.stringify(data)}`);
            var buffData = Buffer.from(JSON.stringify(data));
            try {
                return await this.ipfs.files.add(buffData);
            } catch (err) {
                throw new Error('Error adding file to IPFS ' + err);
            }
        }
    }, {
        key: 'catEncodedData',
        value: async function catEncodedData(hash) {
            try {
                var data = await this.ipfs.files.cat(hash);
                return data.toString();
            } catch (err) {
                throw new Error('Error running ipfs cat on ' + hash + ' : ' + err);
            }
        }
    }, {
        key: 'catJSONData',
        value: async function catJSONData(hash) {
            try {
                var data = await this.ipfs.files.cat(hash);
                var jsonData = JSON.parse(data.toString('utf8'));
                return jsonData;
            } catch (err) {
                throw new Error('Error running ipfs cat on ' + hash + ' : ' + err);
            }
        }
    }, {
        key: 'pinJSONDataHash',
        value: async function pinJSONDataHash(hash) {
            try {
                return await this.ipfs.pin.add(hash);
            } catch (err) {
                throw new Error('Error pinning data hash to IPFS ' + err);
            }
        }

        // May not work with infura

    }, {
        key: 'removeJSONData',
        value: async function removeJSONData(hash) {
            try {
                var removed = await this.ipfs.pin.rm(hash);
                return removed[0].hash;
            } catch (err) {
                throw new Error('Error removing hash ' + hash + ' data from IPFS : ' + err);
            }
        }
    }, {
        key: 'saveEncodedData',
        value: async function saveEncodedData(data) {
            var hashData = await this.addEncodedDataToIPFS(data);
            var hash = await this.pinJSONDataHash(hashData[0].hash);
            return hash[0].hash;
        }
    }, {
        key: 'saveJSONData',
        value: async function saveJSONData(data) {
            var hashData = await this.addDataToIPFS(data);
            var hash = await this.pinJSONDataHash(hashData[0].hash);
            return hash[0].hash;
        }
    }]);

    return IPFSAgent;
}();

exports.default = IPFSAgent;