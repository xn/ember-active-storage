import Uploader from '@algonauti/ember-active-storage/-private/uploader';
import Blob from '@algonauti/ember-active-storage/model/blob';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import Service from '@ember/service';
import { isPresent, typeOf } from '@ember/utils';

export default class ActiveStorageService extends Service {
  get _config() {
    const config =
      getOwner(this).resolveRegistration('config:environment') || {};

    return config['ember-active-storage'] || {};
  }

  async upload(file, urlOrOptions, options = {}) {
    let url;

    if (isPresent(urlOrOptions)) {
      if (typeOf(urlOrOptions) == 'string') {
        url = urlOrOptions;
      } else if (typeOf(urlOrOptions) == 'object') {
        assert(
          "If not explicitly passed, URL must be set on ENV['ember-active-storage'] = { url: '...' }",
          isPresent(this._config['url']),
        );

        options = urlOrOptions;
        url = this._config['url'];
      }
    } else {
      assert(
        "If not explicitly passed, URL must be set on ENV['ember-active-storage'] = { url: '...' }",
        isPresent(this._config['url']),
      );

      url = this._config['url'];
    }

    let { metadata, ...callbacks } = options;

    const uploader = new Uploader({
      headers: this.headers,
      metadata: metadata,
      ...callbacks,
    });

    const blob = await Blob.build(file);
    return await uploader._uploadTask(blob, url);
  }
}
