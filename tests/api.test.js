const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Author = require('../src/models/Author');
const Story = require('../src/models/Story');

let mongod;
let ann, bob, s1, s2;

beforeAll(async () => {
  // use TEST_MONGODB_URI to run against an existing MongoDB (collections are wiped!)
  let uri = process.env.TEST_MONGODB_URI;
  if (!uri) {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await Author.deleteMany({});
  await Story.deleteMany({});
  [ann, bob] = await Author.create([{ name: 'Ann' }, { name: 'Bob', bio: 'hi' }]);
  // s1 is co-written; s2 is Bob's alone
  s1 = await Story.create({ title: 'One', authors: [ann._id, bob._id] });
  s2 = await Story.create({ title: 'Two', authors: [bob._id] });
  await Author.updateOne({ _id: ann._id }, { stories: [s1._id] });
  await Author.updateOne({ _id: bob._id }, { stories: [s1._id, s2._id] });
});

describe('models', () => {
  test('Author requires a name', async () => {
    await expect(Author.create({})).rejects.toThrow(/name/);
  });

  test('Story requires a title', async () => {
    await expect(Story.create({})).rejects.toThrow(/title/);
  });

  test('many-to-many: populate in both directions', async () => {
    const story = await Story.findById(s1._id).populate('authors');
    expect(story.authors.map((a) => a.name).sort()).toEqual(['Ann', 'Bob']);
    const author = await Author.findById(bob._id).populate('stories');
    expect(author.stories.map((s) => s.title).sort()).toEqual(['One', 'Two']);
  });
});

describe('authors endpoints', () => {
  test('GET /authors', async () => {
    const res = await request(app).get('/authors');
    expect(res.status).toBe(200);
    expect(res.body.map((a) => a.name).sort()).toEqual(['Ann', 'Bob']);
  });

  test('GET /authors/:id', async () => {
    const res = await request(app).get(`/authors/${bob._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bob');
  });

  test('GET /authors/:id 404 and 400', async () => {
    const missing = new mongoose.Types.ObjectId();
    expect((await request(app).get(`/authors/${missing}`)).status).toBe(404);
    expect((await request(app).get('/authors/nope')).status).toBe(400);
  });

  test('GET /authors/:id/stories', async () => {
    const res = await request(app).get(`/authors/${bob._id}/stories`);
    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.title).sort()).toEqual(['One', 'Two']);
    const ann = await request(app).get(`/authors/${bob._id}/stories`);
    expect(ann.body).toHaveLength(2);
  });

  test('GET /authors/:id/stories only returns that author’s stories', async () => {
    const res = await request(app).get(`/authors/${ann._id}/stories`);
    expect(res.body.map((s) => s.title)).toEqual(['One']);
  });

  test('GET /authors/:id/stories 404 and 400', async () => {
    const missing = new mongoose.Types.ObjectId();
    expect((await request(app).get(`/authors/${missing}/stories`)).status).toBe(404);
    expect((await request(app).get('/authors/nope/stories')).status).toBe(400);
  });
});

describe('stories endpoints', () => {
  test('GET /stories', async () => {
    const res = await request(app).get('/stories');
    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.title).sort()).toEqual(['One', 'Two']);
  });

  test('GET /stories/:id', async () => {
    const res = await request(app).get(`/stories/${s1._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('One');
  });

  test('GET /stories/:id 404 and 400', async () => {
    const missing = new mongoose.Types.ObjectId();
    expect((await request(app).get(`/stories/${missing}`)).status).toBe(404);
    expect((await request(app).get('/stories/nope')).status).toBe(400);
  });

  test('GET /stories/:id/authors', async () => {
    const res = await request(app).get(`/stories/${s1._id}/authors`);
    expect(res.status).toBe(200);
    expect(res.body.map((a) => a.name).sort()).toEqual(['Ann', 'Bob']);
    const one = await request(app).get(`/stories/${s2._id}/authors`);
    expect(one.body.map((a) => a.name)).toEqual(['Bob']);
  });

  test('GET /stories/:id/authors 404 and 400', async () => {
    const missing = new mongoose.Types.ObjectId();
    expect((await request(app).get(`/stories/${missing}/authors`)).status).toBe(404);
    expect((await request(app).get('/stories/nope/authors')).status).toBe(400);
  });
});
