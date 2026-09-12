const fs = require('fs');
const path = require('path');
const IStorageProvider = require('./IStorageProvider');

class LocalStorageProvider extends IStorageProvider {
  constructor(baseDir) {
    super();
    this.baseDir = baseDir || path.resolve(__dirname, '../../../uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  _resolvePath(storageKey) {
    // Prevent directory traversal attacks
    const safeKey = storageKey.replace(/\\/g, '/');
    const fullPath = path.resolve(this.baseDir, safeKey);
    if (!fullPath.startsWith(this.baseDir)) {
      throw new Error('Invalid storage path');
    }
    return fullPath;
  }

  async upload(fileData, storageKey, mimeType) {
    const fullPath = this._resolvePath(storageKey);
    const parentDir = path.dirname(fullPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (Buffer.isBuffer(fileData)) {
      await fs.promises.writeFile(fullPath, fileData);
    } else {
      // Pipe stream to file
      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(fullPath);
        fileData.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    }

    return { key: storageKey };
  }

  async downloadStream(storageKey) {
    const fullPath = this._resolvePath(storageKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found in storage');
    }
    return fs.createReadStream(fullPath);
  }

  async delete(storageKey) {
    try {
      const fullPath = this._resolvePath(storageKey);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
      return true;
    } catch (err) {
      console.error(`[LocalStorageProvider] Failed to delete file ${storageKey}:`, err);
      return false;
    }
  }
}

module.exports = LocalStorageProvider;
