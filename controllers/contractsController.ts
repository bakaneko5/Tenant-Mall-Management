import { Request, Response } from 'express';
import db from '../db.js';

export default {
    index: (req: Request, res: Response) => {
        const contracts = db.prepare(`
            SELECT k.*, o.nama_owner, s.nama_store, s.blok 
            FROM kontrak_sewa k
            JOIN owner o ON k.id_owner = o.id_owner
            JOIN store s ON k.id_store = s.id_store
            ORDER BY k.id_kontrak DESC
        `).all();
        res.render('contracts/index', { title: 'Kontrak Sewa', contracts });
    },
    create: (req: Request, res: Response) => {
        const owners = db.prepare('SELECT * FROM owner ORDER BY nama_owner ASC').all();
        const stores = db.prepare('SELECT * FROM store WHERE status = \'Kosong\' ORDER BY id_store ASC').all();
        res.render('contracts/create', { title: 'Buat Kontrak Sewa', owners, stores });
    },
    store: (req: Request, res: Response) => {
        const { id_owner, id_store, tanggal_mulai, jenis_kontrak } = req.body;
        const durasi = parseInt(req.body.durasi) || 1;
        
        let harga_sewa = 0;
        let deposit = 0;
        
        const dateSelesai = new Date(tanggal_mulai);
        if (jenis_kontrak === 'Bulanan') {
            harga_sewa = 10000000 * durasi;
            deposit = 5000000 * durasi;
            dateSelesai.setMonth(dateSelesai.getMonth() + durasi);
        } else if (jenis_kontrak === 'Tahunan') {
            harga_sewa = 100000000 * durasi;
            deposit = 25000000 * durasi;
            dateSelesai.setFullYear(dateSelesai.getFullYear() + durasi);
        }
        
        const tanggal_selesai = dateSelesai.toISOString().split('T')[0];

        const insertKontrak = db.prepare(`
            INSERT INTO kontrak_sewa (id_owner, id_store, tanggal_mulai, tanggal_selesai, jenis_kontrak, harga_sewa, deposit)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const updateStore = db.prepare(`UPDATE store SET status = 'Disewa' WHERE id_store = ?`);
        const insertDetail = db.prepare(`
            INSERT INTO detail_kontrak (id_kontrak, periode, tanggal_jatuh_tempo, nominal_tagihan, status)
            VALUES (?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction(() => {
            const result = insertKontrak.run(id_owner, id_store, tanggal_mulai, tanggal_selesai, jenis_kontrak, harga_sewa, deposit);
            const id_kontrak = result.lastInsertRowid;
            
            updateStore.run(id_store);
            
            // Generate tagihan deposit
            insertDetail.run(id_kontrak, 'Deposit Awal', tanggal_mulai, deposit, 'Belum Lunas');
            
            // Generate tagihan pertama
            insertDetail.run(id_kontrak, 'Sewa Periode Pertama', tanggal_mulai, harga_sewa, 'Belum Lunas');
        });

        transaction();
        res.redirect('/contracts');
    }
}
