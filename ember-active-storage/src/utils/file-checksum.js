import SparkMD5 from 'spark-md5';

export default class FileChecksum {
  constructor(file) {
    this.file = file;
    this.chunkSize = 2097152; // 2MB
    this.chunkCount = Math.ceil(this.file.size / this.chunkSize);
    this.chunkIndex = 0;
    this.fileSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice;
  }

  async createMD5() {
    this.md5Buffer = new SparkMD5.ArrayBuffer();
    this.fileReader = new FileReader();

    while (this.chunkIndex < this.chunkCount) {
      const chunk = await this.readNextChunkAsync();
      this.md5Buffer.append(chunk);
    }

    const binaryDigest = this.md5Buffer.end(true);
    const base64digest = btoa(binaryDigest);
    return base64digest;
  }

  static MD5(file) {
    return new FileChecksum(file).createMD5();
  }
  readNextChunk() {
    if (this.chunkIndex < this.chunkCount) {
      const start = this.chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const bytes = this.fileSlice.call(this.file, start, end);
      this.fileReader.readAsArrayBuffer(bytes);
      this.chunkIndex++;
      return true;
    } else {
      return false;
    }
  }
  readNextChunkAsync() {
    return new Promise((resolve, reject) => {
      const start = this.chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.file.size);
      const bytes = this.fileSlice.call(this.file, start, end);

      this.fileReader.onload = (event) => {
        resolve(event.target.result);
      };

      this.fileReader.onerror = (error) => {
        reject(error);
      };

      this.fileReader.readAsArrayBuffer(bytes);
      this.chunkIndex++;
    });
  }
}
