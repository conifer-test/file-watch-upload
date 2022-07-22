const { PutItemCommand, DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/app/.conifer/conifer-config.json'));
require('dotenv').config();

const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const REGION = config.awsRegion;  
const ddbClient = new DynamoDBClient({ region: REGION });
const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);



// TODO: figure out here putItem needs to be called and remove hard-coded values
const updateExisitingTestFileInDynamo  = async (reportFilePath) => {
  try {
    // rawData is the mochawesome generated json report file that is being watched by file watcher
    const rawData = fs.readFileSync(reportFilePath, 'utf-8'); 
    const json = JSON.parse(rawData);

    // TODO: Sync how to get the Test Run ID logic with the rest of the flow.
    // const testRunID = fs.readFileSync('/Users/ainaasakinah/Code/capstone_research/conifer/test-run-id.txt', 'utf-8');
    const testRunID = process.env.TEST_RUN_ID; 
    const testFileName = json.results[0].fullFile;
    const passPercent = json.results[0].passPercent;

    // The json must include the primary key, testFileName and sort key, testRunID to successfully upload
    // We grab the full spec name from the json file because we need the .cy or .spec file name to update existing file in dynamoDB
    // - .cy and .spec is not included in the mochawesome file name
    json.testFileName = `./${testFileName}`; 
    json.testRunID = testRunID;

    const TARGET_PERCENTAGE = 100;
    if (passPercent === TARGET_PERCENTAGE) {
      json.status = 'pass';
    } else {
      json.status = 'fail';
    }

    const params = {
      TableName: 'Conifer_Test_Runs',
      Key: { testFileName: testFileName, testRunID: testRunID },
      Item: marshall(json)
    };

    const data = await ddbDocClient.send(new PutItemCommand(params));
    console.log('Item Updated', data);
    return data;
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = updateExisitingTestFileInDynamo;