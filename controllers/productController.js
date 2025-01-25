const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const db = require('../database/db'); // Pastikan sudah terkoneksi ke database

module.exports.printAllProducts = (req, res) => {
  // Query database untuk mengambil data produk
  const query = 'SELECT id, nama_product, deskripsi, harga, stok, kategori FROM product';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Terjadi kesalahan pada database');
      return;
    }

    // Membuat dokumen PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const filePath = path.join(__dirname, '../public/pdf/AllProducts.pdf');

    // Buat folder jika belum ada
    const pdfDir = path.join(__dirname, '../public/pdf');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Redirect output PDF ke file
    doc.pipe(fs.createWriteStream(filePath));

    // Header dokumen
    doc.fontSize(18).text('Laporan Produk Warmindo', { align: 'center' });
    doc.moveDown(2);

    // Header tabel
    const tableTop = 100;
    const columnWidths = [50, 100, 150, 80, 50, 80];
    const rowHeight = 30;

    doc.fontSize(12).text('ID', 50, tableTop, { width: columnWidths[0], align: 'left' })
      .text('Nama Produk', 100, tableTop, { width: columnWidths[1], align: 'left' })
      .text('Deskripsi', 200, tableTop, { width: columnWidths[2], align: 'left' })
      .text('Harga', 350, tableTop, { width: columnWidths[3], align: 'right' })
      .text('Stok', 430, tableTop, { width: columnWidths[4], align: 'right' })
      .text('Kategori', 480, tableTop, { width: columnWidths[5], align: 'left' });

    // Garis header tabel
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Baris data
    let y = tableTop + rowHeight;
    results.forEach((product, index) => {
      if (y > 700) {
        // Tambah halaman baru jika penuh
        doc.addPage();
        y = 100; // Reset posisi y
        // Tambahkan header tabel di halaman baru
        doc.fontSize(12).text('ID', 50, y, { width: columnWidths[0], align: 'left' })
          .text('Nama Produk', 100, y, { width: columnWidths[1], align: 'left' })
          .text('Deskripsi', 200, y, { width: columnWidths[2], align: 'left' })
          .text('Harga', 350, y, { width: columnWidths[3], align: 'right' })
          .text('Stok', 430, y, { width: columnWidths[4], align: 'right' })
          .text('Kategori', 480, y, { width: columnWidths[5], align: 'left' });
        doc.moveTo(50, y + 20).lineTo(550, y + 20).stroke();
        y += rowHeight;
      }

      // Data produk
      doc.fontSize(10).text(product.id, 50, y, { width: columnWidths[0], align: 'left' })
        .text(product.nama_product, 100, y, { width: columnWidths[1], align: 'left' })
        .text(product.deskripsi, 200, y, { width: columnWidths[2], align: 'left' })
        .text(product.harga, 350, y, { width: columnWidths[3], align: 'right' })
        .text(product.stok, 430, y, { width: columnWidths[4], align: 'right' })
        .text(product.kategori, 480, y, { width: columnWidths[5], align: 'left' });
      y += rowHeight;
    });

    // Selesai membuat PDF
    doc.end();

    // Kirim file PDF untuk diunduh
    res.download(filePath, 'LaporanProduk.pdf', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Terjadi kesalahan saat mengunduh file');
      }
    });
  });
};
