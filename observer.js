const Observer = require('./test-folder-watcher');
const observer = new Observer();
const config = JSON.parse(fs.readFileSync(CONIFER_CONFIG_FILE));
const folder = `${config.testDirectory}/results`;

observer.on('file-added', (log) => {
  // print error message to console
  console.log(`File was added: ${log.filePath}`);

  const uuid = path.parse(log.filePath).name;

  // Export file to s3 bucket
  putInBucket(log.filePath, uuid);

  // TODO: Need to test and ensure this file path matches file globbing which is the base used to create primary keys
  const fullFilePath = `./${log.filePath}`;

  // Update the corresponsing test file in dynamoDB
  updateExisitingTestFileInDynamo(fullFilePath);
});

observer.watchFolder(folder);