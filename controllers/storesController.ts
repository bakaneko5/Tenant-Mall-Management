import { Request, Response } from 'express';
import db from '../db.js';

export default {
    map: (req: Request, res: Response) => {
        const lantai = req.query.lantai || 1;
        
        const stores = db.prepare('SELECT * FROM store WHERE lantai = ?').all(lantai) as any[];
        
        const storeMap: Record<string, any> = {};
        stores.forEach(s => {
            storeMap[s.blok] = s;
        });

        const leftBlocks = [];
        const rightBlocks = [];
        for(let i=1; i<=10; i++) leftBlocks.push(`A${i}`);
        for(let i=1; i<=10; i++) rightBlocks.push(`B${i}`);

        res.render('stores/map', { 
            title: `Denah Zonasi - Lantai ${lantai}`, 
            lantai: Number(lantai), 
            storeMap,
            leftBlocks,
            rightBlocks
        });
    },
    index: (req: Request, res: Response) => {
        let query = 'SELECT * FROM store WHERE 1=1';
        const params: any[] = [];

        if (req.query.lantai) {
            query += ' AND lantai = ?';
            params.push(req.query.lantai);
        }
        if (req.query.status) {
            query += ' AND status = ?';
            params.push(req.query.status);
        }

        query += ' ORDER BY id_store DESC';
        const stores = db.prepare(query).all(...params);

        res.render('stores/index', { 
            title: 'Kelola Store', 
            stores,
            filters: {
                lantai: req.query.lantai || '',
                status: req.query.status || '',
            }
        });
    },
    create: (req: Request, res: Response) => {
        res.render('stores/create', { title: 'Tambah Store' });
    },
    store: (req: Request, res: Response) => {
        const { nama_store, kategori, lantai, blok } = req.body;
        const stmt = db.prepare(`
            INSERT INTO store (nama_store, kategori, lantai, blok)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(nama_store, kategori, lantai, blok);
        res.redirect('/stores');
    },
    edit: (req: Request, res: Response) => {
        const store = db.prepare('SELECT * FROM store WHERE id_store = ?').get(req.params.id);
        if (!store) return res.redirect('/stores');
        res.render('stores/edit', { title: 'Edit Store', store });
    },
    update: (req: Request, res: Response) => {
        const { nama_store, kategori, lantai, blok } = req.body;
        db.prepare(`
            UPDATE store SET nama_store = ?, kategori = ?, lantai = ?, blok = ?
            WHERE id_store = ?
        `).run(nama_store, kategori, lantai, blok, req.params.id);
        res.redirect('/stores');
    },
    delete: (req: Request, res: Response) => {
        db.prepare('DELETE FROM store WHERE id_store = ?').run(req.params.id);
        res.redirect('/stores');
    }
}
