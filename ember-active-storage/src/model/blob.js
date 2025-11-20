import FileChecksum from '@algonauti/ember-active-storage/utils/file-checksum';

export default class Blob {
  checksum = null;
  directUploadData = null;
  // Default Values
  file = null;

  id = null;
  key = null;
  signedId = null;

  // Getters
  get name() {
    return this.file.name;
  }
  get size() {
    return this.file.size;
  }
  get type() {
    return this.file.type;
  }
  constructor(file, checksum) {
    this.file = file;
    this.checksum = checksum;
  }

  static async build(file) {
    const checksum = await FileChecksum.MD5(file);
    return new Blob(file, checksum);
  }
  slice() {
    return this.file.slice();
  }
  toString() {
    return `Blob: ${this.name} with checksum ${this.checksum}`;
  }
}
