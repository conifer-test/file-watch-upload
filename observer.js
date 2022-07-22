const fs = require('fs');
const path = require('path');
const Observer = require('./test-folder-watcher');
const observer = new Observer();
const config = JSON.parse(fs.readFileSync('/app/.conifer/conifer-config.json'));

// const folder = `${config.testDirectory}/results`;
const folder = `/app/cypress/results`;

const putInBucket = require('./s3-test-result-uploader');
const updateExisitingTestFileInDynamo = require('./dynamoDB-test-result-uploader');

observer.on('file-added', (log) => {
  // print error message to console
  console.log(`File was added: ${log.filePath}`);

  const uuid = path.parse(log.filePath).name;

  // Export file to s3 bucket
  putInBucket(log.filePath, uuid, config.bucketName);

  // TODO: Need to test and ensure this file path matches file globbing which is the base used to create primary keys
  const fullFilePath = `${log.filePath}`;

  // Update the corresponsing test file in dynamoDB
  updateExisitingTestFileInDynamo(fullFilePath);
});

observer.watchFolder(folder);
