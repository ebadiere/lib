import "ipfs-api/dist/index.min.js";
import ipfsAPI from 'ipfs-api'


export default class IPFSAgent {

    constructor(host, port, protocol){
        this.ipfs =  ipfsAPI(host, port, {protocol: protocol});
    }

    async addEncodedDataToIPFS(data){
        const buffData = Buffer.from(data);
        try{
            return await this.ipfs.files.add(buffData);
        } catch(err) {
            throw new Error(`Error adding file to IPFS ${err}`);
        }
    }

    async addDataToIPFS(data){
        if (typeof data !== 'object' || data === null) {
            throw new Error(`JSON expected, received ${typeof data}`);
        }
        // console.log(`DEBUG: data: ${JSON.stringify(data)}`);
        const buffData = Buffer.from(JSON.stringify(data));
        try{
            return await this.ipfs.files.add(buffData);
        } catch(err) {
            throw new Error(`Error adding file to IPFS ${err}`);
        }
    }

    async catEncodedData(hash){
        try {
            const data = await this.ipfs.files.cat(hash);
            return data.toString();
        } catch(err) {
            throw new Error(`Error running ipfs cat on ${hash} : ${err}`);
        }
    }

    async catJSONData(hash){
        try {
            const data = await this.ipfs.files.cat(hash);
            const jsonData = JSON.parse(data.toString('utf8'));
            return jsonData;
        } catch(err) {
            throw new Error(`Error running ipfs cat on ${hash} : ${err}`);
        }
    }
    
    async pinJSONDataHash(hash){
        try{
            return await this.ipfs.pin.add(hash);
        } catch(err) {
            throw new Error(`Error pinning data hash to IPFS ${err}`);
        }

    }

    // May not work with infura
    async removeJSONData(hash){
        try {
            const removed = await this.ipfs.pin.rm(hash);
            return removed[0].hash;
        } catch(err) {
            throw new Error(`Error removing hash ${hash} data from IPFS : ${err}`);
        }
    }   

    async saveEncodedData(data){
        const hashData = await this.addEncodedDataToIPFS(data);
        const hash = await this.pinJSONDataHash(hashData[0].hash);
        return hash[0].hash;
    } 

    async saveJSONData(data){
        const hashData = await this.addDataToIPFS(data);
        const hash = await this.pinJSONDataHash(hashData[0].hash);
        return hash[0].hash;
    } 


}
