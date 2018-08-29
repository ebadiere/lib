import Web3 from 'web3';
import { identity } from 'clear-me-identity';

export default class Identity {
    constructor(web3, account){
        this.Web3 = web3;
        this.account = account;
        this.address = '';
        this.identityContract = '';
    }
    
    async deploy(){
        this.identityContract = await new this.Web3.eth.Contract(JSON.parse(JSON.stringify(identity.abi)))
            .deploy({ data: identity.bytecode})
            .send({ gas: '1000000', from: this.account });
        return this.identityContract;
    }
} 