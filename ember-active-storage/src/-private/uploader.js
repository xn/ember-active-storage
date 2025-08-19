import request from '@algonauti/ember-active-storage/-private/request';
import { setProperties } from '@ember/object';
import { capitalize } from '@ember/string';

export default class Uploader {
  constructor({ headers, metadata, ...events }) {
    this.headers = headers;
    this.metadata = metadata;
    this.events = events;
  }

  _addCreatedListener(xhr) {
    xhr.addEventListener('XHROpened', ({ detail }) => {
      this.events['onXHROpened']?.(detail);
    });
  }

  _addListeners(xhr) {
    ['loadstart', 'load', 'loadend', 'error', 'abort', 'timeout'].forEach(
      (name) => {
        xhr.addEventListener(name, (event) => {
          this._handleEvent(event);
        });
      },
    );
  }

  _blobUpdate(blob, response) {
    setProperties(blob, {
      id: response.id,
      signedId: response.signed_id,
      key: response.key,
      directUploadData: response.direct_upload,
    });
  }

  _blobUpload(blob) {
    const xhr = new XMLHttpRequest();
    this._addListeners(xhr);
    this._addCreatedListener(xhr);
    xhr.upload.addEventListener('progress', (event) => {
      this._uploadRequestDidProgress(event);
    });

    return request(xhr, blob.directUploadData.url, {
      method: 'PUT',
      headers: blob.directUploadData.headers,
      dataType: 'text',
      data: blob.slice(),
    });
  }

  _directUpload(blob, url) {
    const xhr = new XMLHttpRequest();
    this._addCreatedListener(xhr);

    return request(xhr, url, {
      method: 'POST',
      headers: this.headers,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        blob: {
          filename: blob.name,
          content_type: blob.type,
          byte_size: blob.size,
          checksum: blob.checksum,
          metadata: this.metadata,
        },
      }),
    });
  }

  _handleEvent(e) {
    this.events[`on${capitalize(e.type)}`]?.(e);
  }

  _uploadRequestDidProgress(event) {
    const progress = Math.ceil((event.loaded / event.total) * 100);

    if (progress) {
      this.events.onProgress?.(progress, event);
    }
  }

  async _uploadTask(blob, url) {
    const response = await this._directUpload(blob, url);
    this._blobUpdate(blob, response);
    await this._blobUpload(blob);

    return blob;
  }

  async upload(blob, url, resolve, reject) {
    try {
      const result = await this._uploadTask(blob, url);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }
}
