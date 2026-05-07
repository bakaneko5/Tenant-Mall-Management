import { Request, Response } from 'express';
import db from '../db.js';

export default {
    index: (req: Request, res: Response) => {
        // Architecture Plan
        const architecture = [
            {
                feature: "Dashboard (Statistik)",
                method: "GET",
                path: "/",
                template: "dashboard.ejs",
                controller: "dashboardController.index()",
                description: "Menampilkan statistik total owner, store, kontrak aktif, dsb."
            },
            {
                feature: "Kelola Owner - List",
                method: "GET",
                path: "/owners",
                template: "owners/index.ejs",
                controller: "ownersController.index()",
                description: "Tabel data owner (Individu/Perusahaan)"
            },
            {
                feature: "Kelola Owner - Form Tambah",
                method: "GET",
                path: "/owners/create",
                template: "owners/create.ejs",
                controller: "ownersController.create()",
                description: "Form input owner baru"
            },
            {
                feature: "Kelola Owner - Proses Simpan",
                method: "POST",
                path: "/owners/store",
                template: "(Redirect ke /owners)",
                controller: "ownersController.store()",
                description: "Memproses data submit form owner"
            },
            {
                feature: "Kelola Store - List & Filter",
                method: "GET",
                path: "/stores",
                template: "stores/index.ejs",
                controller: "storesController.index()",
                description: "Tabel data tenant, filter lantai 1-5, status"
            },
            {
                feature: "Kelola Store - Form Tambah",
                method: "GET",
                path: "/stores/create",
                template: "stores/create.ejs",
                controller: "storesController.create()",
                description: "Form input store baru"
            },
            {
                feature: "Kelola Store - Proses Simpan",
                method: "POST",
                path: "/stores/store",
                template: "(Redirect ke /stores)",
                controller: "storesController.store()",
                description: "Menyimpan data tenant baru"
            },
            {
                feature: "Proses Kontrak - Form",
                method: "GET",
                path: "/contracts/create",
                template: "contracts/create.ejs",
                controller: "contractsController.create()",
                description: "Pilih entitas, hitung otomatis deposit (Ajax/Vanilla JS di frontend)"
            },
            {
                feature: "Proses Kontrak - Simpan",
                method: "POST",
                path: "/contracts/store",
                template: "(Redirect ke /contracts)",
                controller: "contractsController.store()",
                description: "Menyimpan kontrak sewa, detail cicilan tagihan bulanan/tahunan"
            },
            {
                feature: "Validasi Pembayaran - List",
                method: "GET",
                path: "/payments",
                template: "payments/index.ejs",
                controller: "paymentsController.index()",
                description: "Melihat riwayat pembayaran dan status."
            },
            {
                feature: "Validasi Pembayaran - Form Bayar",
                method: "GET",
                path: "/payments/create/:id_kontrak",
                template: "payments/create.ejs",
                controller: "paymentsController.create()",
                description: "Form untuk mencatat pembayaran divalidasi admin"
            },
            {
                feature: "Validasi Pembayaran - Simpan",
                method: "POST",
                path: "/payments/store",
                template: "(Redirect ke /payments)",
                controller: "paymentsController.store()",
                description: "Memasukkan data pembayaran (Admin mengesahkan)"
            }
        ];

        // Stats
        const statOwner = db.prepare('SELECT COUNT(*) as count FROM owner').get() as { count: number };
        const statStore = db.prepare('SELECT COUNT(*) as count FROM store').get() as { count: number };

        res.render('dashboard', {
            title: 'Dashboard Arsitektur',
            architecture,
            stats: {
                totalOwners: statOwner.count,
                totalStores: statStore.count
            }
        });
    }
}
