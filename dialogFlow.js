const dialogFlowConnector = require('dialogflow');
const LANGUAGE_CODE = 'en-US';
require('dotenv').config();

exports.DialogFlow = class {

    constructor(projectID) {
        this.projectID = projectID;

        let privateKey = process.env.DIALOGFLOW_PRIVATE_KEY;
        // console.log(privateKey);
        let clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
        // console.log(clientEmail);
        let config = {
            credentials: {
                private_key: privateKey,
                client_email: clientEmail
            }
        };
        // console.log(config);
        this.sessionClient = new dialogFlowConnector.SessionsClient(config);
    }

    sendDialogFlowQuery = async function (text, sessionId) {
        // Define Session Path
        const sessionPath = this.sessionClient.sessionPath(this.projectID, sessionId);
        // The query request
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: LANGUAGE_CODE
                }
            }
        };
        try {
            let response = await this.sessionClient.detectIntent(request);
            console.log("DialogFlow::sendDialogFlowQuery: Detected Intent");
            return response;
        } catch (err) {
            throw err;
        }
    }
};
