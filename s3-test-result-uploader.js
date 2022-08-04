const fs = require('fs');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const config = JSON.parse(fs.readFileSync('/app/.conifer/conifer-config.json'));
require('dotenv').config();

const fileEndingToFileType = (fileEnding) => {
  switch (fileEnding) {
  case 'json':
    return 'results';
  case 'mp4':
    return 'videos';
  case 'png':
    return 'screenshots';
  default:
    return new Error();
  }
};

const putInBucket = async (
  pathString,
  uuid,
  bucketName,
  fileType
) => {
  try {
    const REGION = config.awsRegion; // TODO: how to get users's region? conifer cdk output? 
    const s3Client = new S3Client({ region: REGION });
    const fileStream = fs.createReadStream(pathString);
    const uploadParams = {
      Bucket: bucketName,
      Key: `${process.env.TEST_RUN_ID}/${fileEndingToFileType(fileType)}/${uuid}.${fileType}`,
      Body: fileStream,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('Success', data);
    return data; // For unit tests.
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = putInBucket;
