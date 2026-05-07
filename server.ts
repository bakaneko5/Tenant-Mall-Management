import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup View Engine (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Format dates in EJS
app.locals.formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

// Format currency in EJS
app.locals.formatCurrency = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.locals.currentPath = '/';
app.use((req, res, next) => {
  app.locals.currentPath = req.path;
  next();
});

// Controllers
import dashboardController from './controllers/dashboardController.js';
import ownersController from './controllers/ownersController.js';
import storesController from './controllers/storesController.js';
import contractsController from './controllers/contractsController.js';
import paymentsController from './controllers/paymentsController.js';

// Routes
app.get('/', dashboardController.index);

app.get('/owners', ownersController.index);
app.get('/owners/create', ownersController.create);
app.post('/owners/store', ownersController.store);
app.get('/owners/edit/:id', ownersController.edit);
app.post('/owners/update/:id', ownersController.update);
app.post('/owners/delete/:id', ownersController.delete);

app.get('/stores', storesController.index);
app.get('/stores/map', storesController.map);
app.get('/stores/create', storesController.create);
app.post('/stores/store', storesController.store);
app.get('/stores/edit/:id', storesController.edit);
app.post('/stores/update/:id', storesController.update);
app.post('/stores/delete/:id', storesController.delete);

app.get('/contracts', contractsController.index);
app.get('/contracts/create', contractsController.create);
app.post('/contracts/store', contractsController.store);

app.get('/payments', paymentsController.index);
app.get('/payments/create/:id', paymentsController.create);
app.post('/payments/store', paymentsController.store);

// Server start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
