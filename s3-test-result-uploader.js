const fs = require('fs');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const putInBucket = async (
  pathString,
  uuid,
  bucketName = 'conifer-test-output-bucket'
) => {
  try {
    const REGION = 'us-west-1'; // TODO: how to get users's region? conifer cdk output? 
    const s3Client = new S3Client({ region: REGION });
    const fileStream = fs.createReadStream(pathString);

    const uploadParams = {
      Bucket: bucketName,
      Key: uuid + '.json',
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

