const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const IStorageProvider = require('./IStorageProvider');

class R2StorageProvider extends IStorageProvider {
  constructor({ endpoint, bucket, accessKeyId, secretAccessKey, region = 'auto' }) {
    super();
    this.bucket = bucket;
    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  async upload(fileData, storageKey, mimeType) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: fileData,
      ContentType: mimeType
    });

    await this.client.send(command);
    return { key: storageKey };
  }

  async downloadStream(storageKey) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey
    });

    const response = await this.client.send(command);
    return response.Body;
  }

  async delete(storageKey) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      console.error(`[R2StorageProvider] Failed to delete file ${storageKey}:`, err);
      return false;
    }
  }

  async getDownloadUrl(storageKey, originalName, expiresInSeconds = 300) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(originalName)}"`
    });

    return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}

module.exports = R2StorageProvider;
