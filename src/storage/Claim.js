import ipfsAgent from './IPFSAgent'; 
import { registry } from 'clear-me-identity';
import { bufferToHex, ecsign, ecrecover, fromRpcSig, hashPersonalMessage, privateToPublic, publicToAddress, toBuffer, toRpcSig } from 'ethereumjs-util';
import Web3 from 'web3';
export default class Claim{

    constructor(ipfsAgent, web3, registryContractAddress, subjectAddress, issuerAddress, issuer){
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

    setData(data){
        this.data = data;
    }

    async save(){
        // For now will save the claim to IPFS and record to the registry.
        // Perhaps validate signatures here in the future.  Should a claim's signature 
        // be verified before it is saved?
        // Also, for now will simply save data as is to IPFS, not encoded or encrypted simply
        // to take time and decide later.
        this.simpleVerifiableClaim.issuer = this.issuer;

        let date = this.setUpDate();
       
        this.simpleVerifiableClaim.issued = `${date.year}-${date.month}-${date.day}`;
        this.simpleVerifiableClaim.claim = this.data;

        this.setUpSignature(date);
        this.simpleVerifiableClaim.signature = this.signature;

        this.simpleVerifiableClaim.claim = this.data;
        const claimHash = await this.ipfsAgent.saveJSONData(this.simpleVerifiableClaim);
        let registryContract = new this.web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)), this.registryContractAddress);
        let result = await registryContract.methods.setClaim(this.subjectAddress, claimHash).send({ gas: '1000000', from: this.issuerAddress });
        // open system question.  Now it will simply return the IPFS hash.  Should it go through the registry contract
        // first?
        // return claimHash;
    }

    async sign(pKey){
        this.signature.signatureHash = await this.web3.eth.accounts.sign(JSON.stringify(this.data), pKey);
        return this.signature.signatureHash.signature;
    }

    async verify(signature){
        const addr = await this.web3.eth.accounts.recover(JSON.stringify(this.data), signature);
        return (this.web3.utils.toChecksumAddress(addr) == this.web3.utils.toChecksumAddress(this.issuerAddress));
    }

    toHex(str) {
        var hex = ''
        for(var i=0;i<str.length;i++) {
         hex += ''+str.charCodeAt(i).toString(16)
        }
        return hex
    }

    setUpDate() {
        let dateStruct = {};
        let date = new Date();
        dateStruct.date = date;
        dateStruct.year = date.getFullYear();
        dateStruct.month = date.getMonth() + 1;
        dateStruct.day = date.getDate();
        dateStruct.hours = date.getHours();
        dateStruct.minutes = date.getMinutes();
        dateStruct.seconds = date.getSeconds();
        return dateStruct;
    }

    setUpSignature(date) {
        this.signature.type = 'LinkedDataSignature2015';
        this.signature.created =
            `${date.year}-${date.month}-${date.day}T${date.hours}:${date.minutes}:${date.seconds}`;
        this.signature.creator = this.issuer;
    }

}