const request = require('supertest');
const app = require('../app');
const db = require('../database/db');

// Jalankan koneksi database sebelum test dimulai
beforeAll(async () => {
  await db.connect();
});

// Tutup koneksi database setelah semua test selesai
afterAll(async () => {
  await db.end();
});

describe('POST /users', () => {
  it('Harus berhasil menambah user baru jika semua field valid', async () => {
    const newUser = {
      username: 'isrja',
      email: 'iso@example.com',
      password: '123',
      role: 'user'
    };

    const response = await request(app)
      .post('/users')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.email).toBe(newUser.email);
    expect(response.body.role).toBe(newUser.role);
  });

  it('Harus gagal jika ada field yang kosong', async () => {
    const incompleteUser = {
      username: '',
      email: 'a@gmail,co',
      password: '123',
      role: 'user'
    };

    const response = await request(app)
      .post('/users')
      .send(incompleteUser);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Semua field harus diisi');
  });
});
