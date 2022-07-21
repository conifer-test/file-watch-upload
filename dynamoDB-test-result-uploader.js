const { PutItemCommand, DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');


// TODO: 2 options for ddbClient - either use the existing one in CLI or create a new one. 
// Currently, it is hard coded to a new one for testing purposes.
// const { ddbClient } = require('./ddbClient'); get it from conifer config?

// TODO: Either use ddbClient or set the AWS Region using the config file.
const REGION = 'ap-northeast-1'; 
// TODO: Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({ region: REGION });

const fs = require('fs');
const path = require('path');
const Observer = require('./test-folder-watcher');
const observer = new Observer();
const folder = `./cypress/newResults`;

// TODO: figure out here putItem needs to be called and remove hard-coded values
const updateExisitingTestFileInDynamo  = async (reportFilePath) => {
  try {
    // rawData is the mochawesome generated json report file that is being watched by file watcher
    const rawData = fs.readFileSync(reportFilePath, 'utf-8'); 
    const json = JSON.parse(rawData);

    // TODO: Sync how to get the Test Run ID logic with the rest of the flow.
    //  const testRunID = fs.readFileSync('/Users/ainaasakinah/Code/capstone_research/conifer/test-run-id.txt', 'utf-8');
    const testRunID = '6ff736cd-80da-4694-a1f2-7ec50dcd1933'; 
    const testFileName = json.results[0].fullFile;
    const passPercent = json.results[0].passPercent;

    // The json must include the primary key, testFileName and sort key, testRunID to successfully upload
    // We grab the full spec name from the json file because we need the .cy or .spec file name to update existing file in dynamoDB
    // - .cy and .spec is not included in the mochawesome file name
    json.testFileName = `./${testFileName}`; 
    json.testRunID = testRunID;
    json.status = passPercent === 100 ? 'pass' : 'fail';

    const params = {
      TableName: 'Conifer_Test_Runs',
      Key: { testFileName: testFileName, testRunID: testRunID },
      Item: marshall(json)
    };

    const data = await ddbClient.send(new PutItemCommand(params));
    console.log('Item Updated', data);
    return data;
  } catch (err) {
    console.log('Error', err);
  }
};

observer.on('file-added', (log) => {
  // print error message to console
  console.log(`File was added: ${log.filePath}`);

  // TODO: Need to test and ensure this file path matches file globbing which is the base used to create primary keys
  const fullFilePath = `./${log.filePath}`;

  // Update the corresponsing test file in dynamoDB
  updateExisitingTestFileInDynamo(fullFilePath);
});

observer.watchFolder(folder);