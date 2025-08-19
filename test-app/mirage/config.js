import { createServer, Response } from 'miragejs';
import { uploadResponse } from '@algonauti/ember-active-storage/utils/tests';

export default function (config) {
  const server = createServer({
    ...config,
  });

  server.logging = true;
  server.namespace = '/api';

  server.post('/attachments/upload', (_, request) => {
    const response = uploadResponse(request.requestBody, {
      directUploadURL: '/api/attachments/direct-upload',
    });
    return new Response(200, response.headers, response.body);
  });

  server.put(
    '/attachments/direct-upload',
    () => {
      return new Response(204);
    },
    { timing: 150 },
  );

  return server;
}
