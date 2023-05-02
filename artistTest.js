const request = require('supertest');
const express = require('express');
const app = express();
const router = require('../routes/artists');

// Mocking artist and album models
jest.mock('../models/artist', () => {
  return {
    find: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
  }
});

jest.mock('../models/album', () => {
  return {
    find: jest.fn(),
    exec: jest.fn(),
  }
});

app.use(express.json());
app.use('/artists', router);

describe('Artists Router', () => {

  describe('GET /artists', () => {

    it('should respond with 200 status code', async () => {
      const response = await request(app).get('/artists');
      expect(response.statusCode).toBe(200);
    });

    it('should call find method on Artist model with search options', async () => {
      const response = await request(app).get('/artists?name=test');
      expect(Artist.find).toHaveBeenCalledWith({ name: /test/i });
    });

    it('should render the artists/index view with artists and searchOptions data', async () => {
      Artist.find.mockReturnValueOnce(['artist1', 'artist2']);
      const response = await request(app).get('/artists');
      expect(response.text).toContain('All Artists');
      expect(response.text).toContain('artist1');
      expect(response.text).toContain('artist2');
      expect(response.text).toContain('Search by name');
    });

    it('should redirect to home page if error occurs', async () => {
      Artist.find.mockRejectedValueOnce('error');
      const response = await request(app).get('/artists');
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/');
    });

  });

  describe('GET /artists/new', () => {

    it('should respond with 200 status code', async () => {
      const response = await request(app).get('/artists/new');
      expect(response.statusCode).toBe(200);
    });

    it('should render the artists/new view with empty artist object', async () => {
      const response = await request(app).get('/artists/new');
      expect(response.text).toContain('Create a new artist');
      expect(response.text).toContain('Name');
      expect(response.text).toContain('Save Artist');
    });

  });

  describe('POST /artists', () => {

    const requestBody = { name: 'test artist' };

    it('should call save method on Artist model with request body', async () => {
      const response = await request(app).post('/artists').send(requestBody);
      expect(Artist.save).toHaveBeenCalledWith(requestBody);
    });

    it('should redirect to /artists if artist is saved successfully', async () => {
      Artist.save.mockResolvedValueOnce('new artist');
      const response = await request(app).post('/artists').send(requestBody);
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/artists');
    });

    it('should render the artists/new view with errorMessage if error occurs', async () => {
      Artist.save.mockRejectedValueOnce('error');
      const response = await request(app).post('/artists').send(requestBody);
      expect(response.text).toContain('Create a new artist');
      expect(response.text).toContain('Name');
      expect(response.text).toContain('Save Artist');
      expect(response.text).toContain('Error Creating Artist...');
    });

  });

  describe('GET /artists/:id', () => {

    const artist = { id: 1, name: 'test artist' };

    it('should call findById method on Artist model with the correct id and render artist details', async () => {
        const findByIdSpy = jest.spyOn(Artist, 'findById').mockResolvedValue(artist);
        const findSpy = jest.spyOn(Artist, 'find').mockResolvedValue([artist]);

        const req = { params: { id: 1 } };
        const res = { render: jest.fn() };
    
        await router.get('/:id', async (req, res));
    
        expect(findByIdSpy).toHaveBeenCalledWith(1);
        expect(res.render).toHaveBeenCalledWith('artists/show', { artist: artist, albumsByArtist: [artist] });
    
        findByIdSpy.mockRestore();
        findSpy.mockRestore();
    });
    
    it('should redirect to homepage if an error occurs', async () => {
        const findByIdSpy = jest.spyOn(Artist, 'findById').mockRejectedValueOnce(new Error('Test error'));
        const req = { params: { id: 1 } };
        const res = { redirect: jest.fn() };
    
        await router.get('/:id', async (req, res));
    
        expect(findByIdSpy).toHaveBeenCalledWith(1);
        expect(res.redirect).toHaveBeenCalledWith('/');
    
        findByIdSpy.mockRestore();
    });

});

describe('GET /artists/:id/edit', () => {

    const artist = { id: 1, name: 'test artist' };

it('should call findById method on Artist model with the correct id and render edit artist form', async () => {
    const findByIdSpy = jest.spyOn(Artist, 'findById').mockResolvedValue(artist);
    const req = { params: { id: 1 } };
    const res = { render: jest.fn() };

    await router.get('/:id/edit', async (req, res));

    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(res.render).toHaveBeenCalledWith('artists/edit', { artist: artist });

    findByIdSpy.mockRestore();
});

it('should redirect to /artists if an error occurs', async () => {
    const findByIdSpy = jest.spyOn(Artist, 'findById').mockRejectedValueOnce(new Error('Test error'));
    const req = { params: { id: 1 } };
    const res = { redirect: jest.fn() };

    await router.get('/:id/edit', async (req, res));

    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(res.redirect).toHaveBeenCalledWith('/artists');

    findByIdSpy.mockRestore();
});

});

describe('PUT /artists/:id', () => {

    const artist = { id: 1, name: 'test artist' };

it('should update artist name and redirect to artist details page', async () => {
    const findByIdSpy = jest.spyOn(Artist, 'findById').mockResolvedValue(artist);
    const saveSpy = jest.spyOn(Artist.prototype, 'save').mockResolvedValueOnce(artist);
    const req = { params: { id: 1 }, body: { name: 'updated name' } };
    const res = { redirect: jest.fn() };

    await router.put('/:id', async (req, res));

    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(saveSpy).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(`/artists/${artist.id}`);

    findByIdSpy.mockRestore();
    saveSpy.mockRestore();
});

it('should redirect to homepage if artist not found', async () => {
    const findByIdSpy = jest.spyOn(Artist, 'findById').mockResolvedValue(null);
    const req = { params: { id: 1 }, body: { name: 'updated name' } };
    const res = { redirect: jest.fn() };

    await router.put('/:id', async (req, res));

    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(res.redirect).toHaveBeenCalledWith('/');
});

it('should update the artist and redirect to artist page', async () => {
const artist = { id: 1, name: 'test artist' };
const findByIdAndUpdateSpy = jest.spyOn(Artist, 'findByIdAndUpdate').mockResolvedValue(artist);
const req = { params: { id: 1 }, body: { name: 'updated name' } };
const res = { redirect: jest.fn() };

await router.put('/:id', async (req, res));

expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(1, { name: 'updated name' });
expect(res.redirect).toHaveBeenCalledWith('/artists/1');

});

it('should render the new artist form', async () => {
const req = {};
const res = { render: jest.fn() };

await router.get('/new', async (req, res));

expect(res.render).toHaveBeenCalledWith('artists/new', { artist: new Artist() });

});

it('should render the artist edit form with the correct artist', async () => {
const artist = { id: 1, name: 'test artist' };
const findByIdSpy = jest.spyOn(Artist, 'findById').mockResolvedValue(artist);
const req = { params: { id: 1 } };
const res = { render: jest.fn() };

await router.get('/:id/edit', async (req, res));

expect(findByIdSpy).toHaveBeenCalledWith(1);
expect(res.render).toHaveBeenCalledWith('artists/edit', { artist: artist });

});

it('should delete the artist and redirect to the artists page', async () => {
const artist = { id: 1, name: 'test artist' };
const findByIdAndRemoveSpy = jest.spyOn(Artist, 'findByIdAndRemove').mockResolvedValue(artist);
const req = { params: { id: 1 } };
const res = { redirect: jest.fn() };

await router.delete('/:id', async (req, res));

expect(findByIdAndRemoveSpy).toHaveBeenCalledWith(1);
expect(res.redirect).toHaveBeenCalledWith('/artists');

});
});
});