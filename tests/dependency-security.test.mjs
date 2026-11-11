import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { zodResolver } from '@hookform/resolvers/zod';
import { sql } from 'drizzle-orm';
import { PgDialect, pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { deleteApp, initializeApp } from 'firebase/app';
import { getFirestore, terminate } from 'firebase/firestore';
import OpenAI from 'openai';
import { z } from 'zod';

test('Firestore initializes with a gRPC transport that completes a loopback RPC', async () => {
  const require = createRequire(import.meta.url);
  const firestoreRequire = createRequire(require.resolve('@firebase/firestore/package.json'));
  const grpc = firestoreRequire('@grpc/grpc-js');
  const app = initializeApp({ projectId: 'dependency-test' }, 'dependency-test');
  const firestore = getFirestore(app);
  const server = new grpc.Server();
  const method = {
    path: '/dependency.Test/Echo',
    requestStream: false,
    responseStream: false,
    requestSerialize: Buffer.from,
    requestDeserialize: Buffer.from,
    responseSerialize: Buffer.from,
    responseDeserialize: Buffer.from,
  };
  server.addService({ echo: method }, { echo: (call, callback) => callback(null, call.request) });
  let client;
  try {
    const port = await new Promise((resolve, reject) => {
      server.bindAsync('127.0.0.1:0', grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
    client = new grpc.Client(`127.0.0.1:${port}`, grpc.credentials.createInsecure());
    const result = await new Promise((resolve, reject) => {
      client.makeUnaryRequest(method.path, method.requestSerialize, method.responseDeserialize,
        Buffer.from('echo'), { deadline: Date.now() + 5000 }, (error, response) => {
          if (error) reject(error);
          else resolve(response);
        });
    });
    assert.equal(result.toString(), 'echo');
  } finally {
    client?.close();
    server.forceShutdown();
    await terminate(firestore);
    await deleteApp(app);
  }
});

test('Drizzle doubles a quote inside a PostgreSQL identifier', () => {
  const dialect = new PgDialect();
  const result = dialect.sqlToQuery(sql`select ${sql.identifier('embedded"quote')}`);
  assert.equal(result.sql, 'select "embedded""quote"');
  assert.deepEqual(result.params, []);
});

test('Zod rejects an oversized constrained array and preserves form validation', async () => {
  const entries = z.array(z.string()).max(2);
  assert.deepEqual(entries.parse(['a', 'b']), ['a', 'b']);
  const oversized = entries.safeParse(Array(10000).fill(null));
  assert.equal(oversized.success, false);
  assert.deepEqual(oversized.error.issues.map(issue => issue.code), ['too_big']);

  const contacts = pgTable('contacts', { name: text('name').notNull() });
  const form = createInsertSchema(contacts).extend({ fields: z.record(z.string(), z.string()) });
  const resolve = zodResolver(form);
  const options = { fields: {}, shouldUseNativeValidation: false };
  const valid = { name: 'Alice', fields: { nickname: 'A' } };
  assert.deepEqual((await resolve(valid, {}, options)).values, valid);
  assert.ok((await resolve({ name: 7, fields: {} }, {}, options)).errors.name);
});

test('OpenAI chat completion parses the response with an injected transport', async () => {
  const client = new OpenAI({
    apiKey: 'fixture',
    fetch: async (url, request) => {
      assert.ok(String(url).endsWith('/chat/completions'));
      assert.equal(JSON.parse(request.body).messages[0].content, 'ping');
      return Response.json({ choices: [{ message: { content: 'pong' } }] });
    },
  });
  const response = await client.chat.completions.create({
    model: 'fixture',
    messages: [{ role: 'user', content: 'ping' }],
  });
  assert.equal(response.choices[0].message.content, 'pong');
});
