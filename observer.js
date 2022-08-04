const fs = require('fs');
const path = require('path');
const Observer = require('./test-folder-watcher');
const observer = new Observer();
const config = JSON.parse(fs.readFileSync('/app/.conifer/conifer-config.json'));

// const folder = `${config.testDirectory}/results`;

const putInBucket = require('./s3-test-result-uploader');
const updateExisitingTestFileInDynamo = require('./dynamoDB-test-result-uploader');

observer.on('json-file-added', (log) => {
  // print error message to console
  console.log(`File was added: ${log.filePath}`);

  const uuid = path.parse(log.filePath).name;

  // Export file to s3 bucket
  putInBucket(log.filePath, uuid, config.bucketName, 'json');

  // TODO: Need to test and ensure this file path matches file globbing which is the base used to create primary keys
  const fullFilePath = `${log.filePath}`;

  // Update the corresponsing test file in dynamoDB
  if (!/mochawesome/.test(log.filePath)) {
    updateExisitingTestFileInDynamo(fullFilePath);
  }
});

observer.on('mp4-file-added', (log) => {
  // print error message to console
  console.log(`File was added: ${log.filePath}`);

  const uuid = path.parse(log.filePath).name;

  // Export file to s3 bucket
  putInBucket(log.filePath, uuid, config.bucketName, 'mp4');
});

observer.on('png-file-added', (log) => {
  // print error message to console
  console.log(`File was added: ${log.filePath}`);

  const uuid = path.parse(log.filePath).name;

  // Export file to s3 bucket
  putInBucket(log.filePath, uuid, config.bucketName, 'png');
});

// NEED to make folder names dynamic
const resultsFolder = '/app/cypress/results';
observer.watchFolder(resultsFolder);

const videosFolder = '/app/cypress/videos';
observer.watchFolder(videosFolder);

const screenshotsFolder = '/app/cypress/screenshots';
observer.watchFolder(screenshotsFolder);

