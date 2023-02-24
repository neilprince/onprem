const cds = require("@sap/cds");
const axios = require('axios');
const { executeHttpRequestWithOrigin } = require('@sap-cloud-sdk/http-client');
const { getReqOptions } = require('@sap/cds/libx/_runtime/remote/utils/client');
//const { resolveView, getTransition, restoreLink, findQueryTarget } = require('@sap/cds/libx/_runtime/common/utils/resolveView');


const userRole1 = {
    User : "EAMTEST",
    AgrName : "Z_EAM_ROLE1",
    FromDat : "2023-02-23T00:00:00",
    ToDat : "2023-02-23T00:00:00"
};

const userRole2 = {
    User : "EAMTEST",
    AgrName : "Z_EAM_ROLE2",
    FromDat : "2023-02-23T00:00:00",
    ToDat : "2023-02-23T00:00:00"
};


module.exports = async (srv) => {
    const prov = await cds.connect.to("EAM_SRV");
    cds.env.features.fetch_csrf = true;

    srv.on("READ", "roles", async (req) => {
        
        console.log("Host: " + req.headers.host);
        let response = await prov.run(req.query);
        return response;
        
    });


    srv.on('PUT', 'roles', async (req) => {
        
        try {
            const { query } = req;
            let destination = {"destinationName" : prov.destination};
            const reqConfig = getReqOptions(req, query, prov);
            reqConfig.url = reqConfig.url.replace('EAM_SRV/roles', 'EAM_SRV/ROLESSet');
            let requestOptions = { "fetchCsrfToken": true };
            response = await executeHttpRequestWithOrigin(destination, reqConfig, requestOptions);
        } catch (error) {
            console.log(error);
            return req.reject(400, error.response.data.error.innererror.errordetails[0].message);
        }
        

    })

    srv.on('DELETE', 'roles', async (req) => {

        try {
            const approach = 2;
            let response;
            switch (approach) {
                case 1:
                    response = await prov.run(req.query);
                    break;
                case 2:
                    const { query } = req;
                    let destination = {"destinationName" : prov.destination};
                    const reqConfig = getReqOptions(req, query, prov);
                    reqConfig.url = reqConfig.url.replace('EAM_SRV/roles', 'EAM_SRV/ROLESSet');
                    let requestOptions = { "fetchCsrfToken": true };
                    response = await executeHttpRequestWithOrigin(destination, reqConfig, requestOptions);
                    break;
              }
            return response;  
        } catch (error) {
            console.log(error);
            return req.reject(400, error.response.data.error.innererror.errordetails[0].message);
        }

    });


    srv.on('provisionRoles', async (req) => {
        var actParms = {};
        actParms.eamRecord = req.data.eamRecord;
        console.log(actParms.eamRecord);
        //select the eam record from the db to get the user and the roles
        var configItem = {};
        configItem.sourceSrv = 'eam-provisioning';
        configItem.sourceEntity = 'roles';

        let payload, user, role;
        for (let i = 0; i < actParms.eamRecord; i++ ) {
            switch (i) {
                case 0:
                    payload = userRole1;
                    user = userRole1.User;
                    role = userRole1.AgrName;
                    break;
                case 1:
                    payload = userRole2;
                    user = userRole2.User;
                    role = userRole2.AgrName;                    
                    break;
            }

            //Construct axios call
            let hostname = await _getHostName(req);
            let url = `https://${hostname}/v2/${configItem.sourceSrv}/${configItem.sourceEntity}(User='${user}',AgrName='${role}')`;
            let header = await _getHeader(req);
            console.log(url);
            let result = await axios.put(url, payload, header);
        };

    });

    srv.on('deProvisionRoles',  async (req) => {
        var actParms = {};
        actParms.eamRecord = req.data.eamRecord;
        console.log(actParms.eamRecord);
        //select the eam record from the db to get the user and the roles
        var configItem = {};
        configItem.sourceSrv = 'eam-provisioning';
        configItem.sourceEntity = 'roles';

        let user, role;
        for (let i = 0; i < actParms.eamRecord; i++ ) {
            switch (i) {
                case 0:
                    user = userRole1.User;
                    role = userRole1.AgrName;
                    break;
                case 1:
                    user = userRole2.User;
                    role = userRole2.AgrName;                    
                    break;
            }

            //Construct axios call
            let hostname = await _getHostName(req);
            let url = `https://${hostname}/v2/${configItem.sourceSrv}/${configItem.sourceEntity}(User='${user}',AgrName='${role}')`;
            let header = await _getHeader(req);
            console.log(url);
            let result = await axios.delete(url, header);
        };   
    });


//*********************************************
// Axios functions
//*********************************************

async function _getUrl(configItem, req) {
    let hostname = await _getHostName(req);
    let url = `https://${hostname}/v2/${configItem.sourceSrv}/${configItem.sourceEntity}`;
    return url;
   
}

async function _getHostName(req) {
    //When testing locally, you will need to uncomment the hardcoded url to a deployed app and comment out the second line - do not commit this change
    let hostname = 'dev-ap10-neil-eam-onprem-srv.cfapps.ap10.hana.ondemand.com';
    //let hostname = req.headers.host;
    return hostname;
}

async function _getHeader(req) {
    
    let header = {};

    if (req.headers.authorization === undefined) {
        header = {
            headers: {
                'Content-Type': 'application/json'
            },
        }
    } else {
        header = {
            headers: { 
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
            }
        }
    
    }
    return header;
}


}


