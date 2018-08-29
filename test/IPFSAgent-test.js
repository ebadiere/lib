import { expect } from 'chai';
import IPFSAgent from '../lib/storage/IPFSAgent';
import jwt from 'jsonwebtoken';

describe('Clearme IPFSAgent', function(){

    let ipfsAgent;
    this.timeout(0);
    let person;
    let personHash;

    before('Create an ipfsAgent and setup some data, which also tests the saveJSONData', async function(){
        ipfsAgent = new IPFSAgent('ipfs.infura.io', '5001', 'https');
        person = require('./data/Person.json');
        personHash = await ipfsAgent.saveJSONData(person);
    })

    it('Can pin (store) an encoded file on IPFS', async function(){
        //const testData = {value: 'A super cool DDO'};
        const testData = '{\n' +
            '  "address": "0x3d16e210c016A4Aa66f1aBa3fC3Ab4980543768E",\n' +
            '  "type": "verification",\n' +
            '  "education": {\n' +
            '    "University of Colorado, Boulder": [\n' +
            '      {\n' +
            '        "student_id": "1001",\n' +
            '        "enrolled": "09/01/2016",\n' +
            '        "major": "BS, Business Administration"\n' +
            '      }\n' +
            '    ]\n' +
            '  },\n' +
            '  "emails": [\n' +
            '    {\n' +
            '      "email": "maildanellis@yahoo.com",\n' +
            '      "valid": "true"\n' +
            '    },\n' +
            '    {\n' +
            '      "email": "maildanellis@gmail.com",\n' +
            '      "valid": "true"\n' +
            '    },\n' +
            '    {\n' +
            '      "email": "dan@clear.me",\n' +
            '      "valid": "true"\n' +
            '    },\n' +
            '    {\n' +
            '      "email": "dan@clearchecks.com",\n' +
            '      "valid": "true"\n' +
            '    }\n' +
            '  ]\n' +
            '}';

        const token = jwt.sign({
            data: testData
        }, 'clearmeSecret');

        console.log('Example signed CU web token: ' + token);

        const hash = await ipfsAgent.saveEncodedData(token);
        console.log(`IPFS Hash: ${hash}`);
        const retrievedEncodedData = await ipfsAgent.catEncodedData(hash);
        expect(retrievedEncodedData).to.equal(token);
        const decodedToken = jwt.verify(
            retrievedEncodedData, 'clearmeSecret'
        );
        expect(decodedToken.data).to.equal(testData); // for now
    })

    it('Can pin (store) a file on IPFS', async function(){
        const testData = {value: 'A super cool DDO'};
        let hash = await ipfsAgent.saveJSONData(testData);
        expect(hash).to.equal('QmNNohUzTDLy3pxWoL2BdcZxdJTmMcaWafFLHSS8k6SCQL');
    })

    it('Can retrieve the data from IPFS using cat', async function(){
        let personRetrieved = await ipfsAgent.catJSONData(personHash);
        expect(personRetrieved).to.eql(person);
    })

    // This does not work with infura, so local ipfs daemon is used
    it ('Can remove a hash from IPFS to allow the data to be garbage collected', async function(){
        let localIpfsAgent = new IPFSAgent('localhost', '5001', 'http');
        const testData = {value: 'A super cool DDO that will be removed'};
        let hash = await localIpfsAgent.saveJSONData(testData);
        expect(hash).to.equal('QmUys2KFnwtGoXCuv44rDx9UUFEa8YhEUJeSbtCAzgRU97');
        console.log('Hash to be unpinned: ' + hash);
        console.log('pin.rm does not seem to work through infura so local daemon needs to be running to pass');
        let unPinned = await localIpfsAgent.removeJSONData(hash);
        console.log('Unpinned hash: ' + unPinned);
        expect(unPinned).to.equal(hash);
    })

})