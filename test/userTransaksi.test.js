const request = require('supertest');
const app = require('../app'); // Pastikan mengarah ke file utama aplikasi (mis. app.js)

describe('Pesanan Online API', () => {
  describe('GET /pesananOnline', () => {
    it('Harus mengembalikan semua pesanan online', async () => {
      const response = await request(app).get('/pesananOnline');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array); // Hasil harus berupa array
    });
  });

  describe('GET /pesananOnline/:id/details', () => {
    it('Harus mengembalikan detail pesanan jika ID valid', async () => {
      const response = await request(app).get('/pesananOnline/1/details');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array); // Hasil berupa array produk
    });

    it('Harus gagal jika ID pesanan tidak ditemukan', async () => {
      const response = await request(app).get('/pesananOnline/999/details');
      expect(response.status).toBe(404);
      expect(response.text).toBe('Pesanan tidak ditemukan');
    });
  });

  describe('PUT /pesananOnline/:id/', () => {
    it('Harus berhasil memperbarui status pesanan dengan ID valid', async () => {
      const response = await request(app)
        .put('/pesananOnline/29')
        .send({ status: 'Selesai' });
      expect(response.status).toBe(200);
      expect(response.text).toBe('Status berhasil diperbarui');
    });

    it('Harus gagal jika status tidak valid', async () => {
      const response = await request(app)
        .put('/pesananOnline/1')
        .send({ status: 'InvalidStatus' });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Status tidak valid');
    });

    it('Harus gagal jika ID pesanan tidak ditemukan', async () => {
      const response = await request(app)
        .put('/pesananOnline/999')
        .send({ status: 'Selesai' });
      expect(response.status).toBe(404);
      expect(response.text).toBe('Pesanan tidak ditemukan');
    });
  });

  describe('DELETE /pesananOnline/:id', () => {
    it('Harus berhasil menghapus pesanan dengan ID valid', async () => {
      const response = await request(app).delete('/pesananOnline/1');
      expect(response.status).toBe(204); // Tidak ada konten
    });

    it('Harus gagal jika ID pesanan tidak ditemukan', async () => {
      const response = await request(app).delete('/pesananOnline/999');
      expect(response.status).toBe(404);
      expect(response.text).toBe('Pesanan tidak ditemukan');
    });
  });

  describe('POST /pesananOnline/add-to-cart', () => {
    it('Harus berhasil menambahkan produk ke keranjang', async () => {
      const product = { id: 1, nama_product: 'Produk A', harga: 10000, kuantitas: 2 };
      const response = await request(app)
        .post('/pesananOnline/add-to-cart')
        .send(product);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("${product.nama_product} berhasil ditambahkan ke keranjang!");
    });
  });

  describe('POST /pesananOnline/checkout', () => {
    it('Harus berhasil memproses checkout jika semua data valid', async () => {
      const checkoutData = {
        alamat: 'Jl. Test 123',
        metode_pembayaran: 'Transfer Bank',
      };
      const response = await request(app)
        .post('/pesananOnline/checkout')
        .send(checkoutData);
      expect(response.status).toBe(200);
      expect(response.text).toBe('Pesanan berhasil diproses');
    });

    it('Harus gagal jika keranjang kosong', async () => {
      const response = await request(app).post('/pesananOnline/checkout').send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe('Keranjang kosong!');
    });

    it('Harus gagal jika alamat tidak diisi', async () => {
      const response = await request(app)
        .post('/pesananOnline/checkout')
        .send({ metode_pembayaran: 'Transfer Bank' });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Alamat pengiriman harus diisi!');
    });
  });
});