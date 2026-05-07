import { Request, Response } from 'express';
import db from '../db.js';

export default {
    index: (req: Request, res: Response) => {
        const owners = db.prepare('SELECT * FROM owner ORDER BY id_owner DESC').all();
        res.render('owners/index', { title: 'Kelola Owner', owners });
    },
    create: (req: Request, res: Response) => {
        res.render('owners/create', { title: 'Tambah Owner' });
    },
    store: (req: Request, res: Response) => {
        const { nama_owner, tipe_owner, alamat, no_telp } = req.body;
        const stmt = db.prepare(`
            INSERT INTO owner (nama_owner, tipe_owner, alamat, no_telp)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(nama_owner, tipe_owner, alamat, no_telp);
        res.redirect('/owners');
    },
    edit: (req: Request, res: Response) => {
        const owner = db.prepare('SELECT * FROM owner WHERE id_owner = ?').get(req.params.id);
        if (!owner) return res.redirect('/owners');
        res.render('owners/edit', { title: 'Edit Owner', owner });
    },
    update: (req: Request, res: Response) => {
        const { nama_owner, tipe_owner, alamat, no_telp } = req.body;
        db.prepare(`
            UPDATE owner SET nama_owner = ?, tipe_owner = ?, alamat = ?, no_telp = ?
            WHERE id_owner = ?
        `).run(nama_owner, tipe_owner, alamat, no_telp, req.params.id);
        res.redirect('/owners');
    },
    delete: (req: Request, res: Response) => {
        db.prepare('DELETE FROM owner WHERE id_owner = ?').run(req.params.id);
        res.redirect('/owners');
    }
}
