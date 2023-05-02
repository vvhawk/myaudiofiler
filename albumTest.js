const request = require('supertest');
const app = require('../app');

describe('Albums API', () => {
  describe('GET /albums', () => {
    it('responds with a list of albums', async () => {
      const res = await request(app).get('/albums');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('albums');
      expect(res.body.albums).toBeInstanceOf(Array);
    });
  });

  describe('POST /albums', () => {
    it('creates a new album', async () => {
      const res = await request(app)
        .post('/albums')
        .field('title', 'Test Album')
        .field('artist', 'Test Artist')
        .field('releaseDate', '2022-05-01')
        .field('length', '60')
        .attach('cover', 'tests/fixtures/cover.jpg');
      expect(res.statusCode).toBe(302);
      expect(res.header.location).toBe('/albums');
    });
  });

  describe('GET /albums/:id', () => {
    it('responds with an album by ID', async () => {
      const albumRes = await request(app).get('/albums');
      const albumId = albumRes.body.albums[0]._id;
      const res = await request(app).get(`/albums/${albumId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('album');
      expect(res.body.album._id).toBe(albumId);
    });
  });

  describe('PUT /albums/:id', () => {
    it('updates an album by ID', async () => {
      const albumRes = await request(app).get('/albums');
      const albumId = albumRes.body.albums[0]._id;
      const res = await request(app)
        .put(`/albums/${albumId}`)
        .field('title', 'Updated Test Album')
        .field('artist', 'Updated Test Artist')
        .field('releaseDate', '2022-05-01')
        .field('length', '120')
        .attach('cover', 'tests/fixtures/cover.jpg');
      expect(res.statusCode).toBe(302);
      expect(res.header.location).toBe(`/albums/${albumId}`);
    });
  });

  describe('DELETE /albums/:id', () => {
    it('deletes an album by ID', async () => {
      const albumRes = await request(app).get('/albums');
      const albumId = albumRes.body.albums[0]._id;
      const res = await request(app).delete(`/albums/${albumId}`);
      expect(res.statusCode).toBe(302);
      expect(res.header.location).toBe('/albums');
    });
  });
});
