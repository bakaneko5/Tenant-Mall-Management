import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
        id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_admin TEXT NOT NULL,
        no_telp TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS owner (
        id_owner INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_owner TEXT NOT NULL,
        tipe_owner TEXT CHECK(tipe_owner IN ('Individu', 'Perusahaan')) NOT NULL,
        alamat TEXT NOT NULL,
        no_telp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS store (
        id_store INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_store TEXT NOT NULL,
        kategori TEXT CHECK(kategori IN ('Food Store', 'Retail Store')) NOT NULL,
        lantai INTEGER CHECK(lantai BETWEEN 1 AND 5) NOT NULL,
        blok TEXT NOT NULL,
        status TEXT CHECK(status IN ('Kosong', 'Disewa')) DEFAULT 'Kosong'
    );

    CREATE TABLE IF NOT EXISTS store_bersebelahan (
        id_store INTEGER,
        id_store_sebelah INTEGER,
        PRIMARY KEY (id_store, id_store_sebelah),
        FOREIGN KEY (id_store) REFERENCES store(id_store),
        FOREIGN KEY (id_store_sebelah) REFERENCES store(id_store)
    );

    CREATE TABLE IF NOT EXISTS kontrak_sewa (
        id_kontrak INTEGER PRIMARY KEY AUTOINCREMENT,
        id_owner INTEGER,
        id_store INTEGER,
        tanggal_mulai DATE NOT NULL,
        tanggal_selesai DATE NOT NULL,
        jenis_kontrak TEXT CHECK(jenis_kontrak IN ('Bulanan', 'Tahunan')) NOT NULL,
        harga_sewa REAL NOT NULL,
        deposit REAL NOT NULL,
        FOREIGN KEY (id_owner) REFERENCES owner(id_owner),
        FOREIGN KEY (id_store) REFERENCES store(id_store)
    );

    CREATE TABLE IF NOT EXISTS detail_kontrak (
        id_detail INTEGER PRIMARY KEY AUTOINCREMENT,
        id_kontrak INTEGER,
        periode TEXT NOT NULL,
        tanggal_jatuh_tempo DATE NOT NULL,
        nominal_tagihan REAL NOT NULL,
        status TEXT CHECK(status IN ('Lunas', 'Belum Lunas')) DEFAULT 'Belum Lunas',
        FOREIGN KEY (id_kontrak) REFERENCES kontrak_sewa(id_kontrak)
    );

    CREATE TABLE IF NOT EXISTS pembayaran (
        id_pembayaran INTEGER PRIMARY KEY AUTOINCREMENT,
        id_kontrak INTEGER,
        id_admin INTEGER,
        tanggal_bayar DATE NOT NULL,
        jumlah_bayar REAL NOT NULL,
        jenis_pembayaran TEXT CHECK(jenis_pembayaran IN ('Deposit', 'Sewa Berjalan')) NOT NULL,
        FOREIGN KEY (id_kontrak) REFERENCES kontrak_sewa(id_kontrak),
        FOREIGN KEY (id_admin) REFERENCES admin(id_admin)
    );

    -- Insert Default Admin
    INSERT OR IGNORE INTO admin (id_admin, nama_admin, no_telp, username, password) 
    VALUES (1, 'Super Admin', '08123456789', 'admin', 'admin123');
`);

export default db;
