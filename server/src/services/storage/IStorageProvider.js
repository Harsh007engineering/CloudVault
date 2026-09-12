/**
 * Abstract Base Class for CloudVault Storage Providers
 */
class IStorageProvider {
  /**
   * Upload a file buffer or stream to storage
   * @param {Buffer|ReadableStream} fileData 
   * @param {string} storageKey 
   * @param {string} mimeType 
   * @returns {Promise<{ key: string }>}
   */
  async upload(fileData, storageKey, mimeType) {
    throw new Error('Method upload() must be implemented');
  }

  /**
   * Returns a readable stream for downloading a file
   * @param {string} storageKey 
   * @returns {Promise<ReadableStream>}
   */
  async downloadStream(storageKey) {
    throw new Error('Method downloadStream() must be implemented');
  }

  /**
   * Deletes a file from storage
   * @param {string} storageKey 
   * @returns {Promise<boolean>}
   */
  async delete(storageKey) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Generates a temporary signed download URL (if supported by provider)
   * @param {string} storageKey 
   * @param {string} originalName 
   * @param {number} expiresInSeconds 
   * @returns {Promise<string|null>}
   */
  async getDownloadUrl(storageKey, originalName, expiresInSeconds = 300) {
    return null; // Fallback to stream if not supported
  }
}

module.exports = IStorageProvider;
