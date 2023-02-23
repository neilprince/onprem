const cds = require("@sap/cds");
//const axios = require('axios');
const { executeHttpRequestWithOrigin } = require('@sap-cloud-sdk/http-client');
const { getReqOptions } = require('@sap/cds/libx/_runtime/remote/utils/client');
//const { resolveView, getTransition, restoreLink, findQueryTarget } = require('@sap/cds/libx/_runtime/common/utils/resolveView');

module.exports = async (srv) => {
    const prov = await cds.connect.to("EAM_SRV");
    cds.env.features.fetch_csrf = true;
    
    srv.on("READ", "roles", async (req) => {
        
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

}


