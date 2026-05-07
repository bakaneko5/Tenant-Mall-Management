import { Request, Response } from 'express';
import db from '../db.js';

export default {
    index: (req: Request, res: Response) => {
        const details = db.prepare(`
            SELECT d.*, k.jenis_kontrak, o.nama_owner, s.nama_store
            FROM detail_kontrak d
            JOIN kontrak_sewa k ON d.id_kontrak = k.id_kontrak
            JOIN owner o ON k.id_owner = o.id_owner
            JOIN store s ON k.id_store = s.id_store
            WHERE d.status = 'Belum Lunas'
            ORDER BY d.tanggal_jatuh_tempo ASC
        `).all();
        
        const history = db.prepare(`
            SELECT p.*, o.nama_owner, s.nama_store, a.nama_admin 
            FROM pembayaran p
            JOIN kontrak_sewa k ON p.id_kontrak = k.id_kontrak
            JOIN owner o ON k.id_owner = o.id_owner
            JOIN store s ON k.id_store = s.id_store
            JOIN admin a ON p.id_admin = a.id_admin
            ORDER BY p.tanggal_bayar DESC, p.id_pembayaran DESC
            LIMIT 50
        `).all();

        res.render('payments/index', { title: 'Validasi Pembayaran', details, history });
    },
    create: (req: Request, res: Response) => {
        const id_detail = req.params.id;
        const detail = db.prepare(`
            SELECT d.*, k.id_kontrak, k.jenis_kontrak, o.nama_owner, s.nama_store 
            FROM detail_kontrak d
            JOIN kontrak_sewa k ON d.id_kontrak = k.id_kontrak
            JOIN owner o ON k.id_owner = o.id_owner
            JOIN store s ON k.id_store = s.id_store
            WHERE d.id_detail = ?
        `).get(id_detail);
        
        if (!detail) return res.redirect('/payments');
        res.render('payments/create', { title: 'Konfirmasi Pembayaran', detail });
    },
    store: (req: Request, res: Response) => {
        const { id_kontrak, id_detail, jumlah_bayar, periode, tanggal_bayar } = req.body;
        
        // Asumsi admin yg login = ID 1
        const id_admin = 1;

        const jenis_pembayaran = periode && periode.includes('Deposit') ? 'Deposit' : 'Sewa Berjalan';
        
        const transaction = db.transaction(() => {
            db.prepare(`
                INSERT INTO pembayaran (id_kontrak, id_admin, tanggal_bayar, jumlah_bayar, jenis_pembayaran)
                VALUES (?, ?, ?, ?, ?)
            `).run(id_kontrak, id_admin, tanggal_bayar, jumlah_bayar, jenis_pembayaran);
            
            db.prepare(`
                UPDATE detail_kontrak SET status = 'Lunas' WHERE id_detail = ?
            `).run(id_detail);
        });
        
        transaction();
        res.redirect('/payments');
    }
}
