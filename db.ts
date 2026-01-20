
import { User, Product, Sale, UserRole } from './types';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Organic Coffee Beans (1kg)', category: 'Beverages', price: 24.50, stock: 45, minStock: 10 },
  { id: '2', name: 'Whole Grain Bread', category: 'Bakery', price: 4.25, stock: 12, minStock: 15 },
  { id: '3', name: 'Fresh Milk 1L', category: 'Dairy', price: 1.80, stock: 60, minStock: 20 },
  { id: '4', name: 'Dark Chocolate Bar', category: 'Snacks', price: 3.50, stock: 8, minStock: 10 },
  { id: '5', name: 'Sparkling Water 500ml', category: 'Beverages', price: 1.20, stock: 120, minStock: 50 },
];

const INITIAL_USERS: User[] = [
  { id: 'admin-1', username: 'admin', password: '123456', role: UserRole.ADMIN },
  { id: 'cashier-1', username: 'cashier1', password: 'password', role: UserRole.CASHIER },
];

class Database {
  private products: Product[] = [];
  private sales: Sale[] = [];
  private users: User[] = [];

  constructor() {
    this.load();
    // Always sync users to ensure the requested password change is applied even if localstorage exists
    this.users = INITIAL_USERS;
    if (this.products.length === 0) {
      this.products = INITIAL_PRODUCTS;
      this.save();
    }
  }

  private load() {
    const p = localStorage.getItem('pos_products');
    const s = localStorage.getItem('pos_sales');
    const u = localStorage.getItem('pos_users');
    if (p) this.products = JSON.parse(p);
    if (s) this.sales = JSON.parse(s);
    if (u) this.users = JSON.parse(u);
  }

  private save() {
    localStorage.setItem('pos_products', JSON.stringify(this.products));
    localStorage.setItem('pos_sales', JSON.stringify(this.sales));
    localStorage.setItem('pos_users', JSON.stringify(this.users));
  }

  getProducts(): Product[] { return [...this.products]; }
  
  updateProduct(product: Product) {
    const idx = this.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      this.products[idx] = product;
    } else {
      this.products.push(product);
    }
    this.save();
  }

  deleteProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
    this.save();
  }

  getSales(): Sale[] { return [...this.sales]; }

  recordSale(sale: Sale) {
    // Transactional logic: update stock
    sale.items.forEach(item => {
      const p = this.products.find(prod => prod.id === item.productId);
      if (p) {
        p.stock -= item.quantity;
      }
    });
    this.sales.push(sale);
    this.save();
  }

  getUsers(): User[] { return [...this.users]; }
}

export const db = new Database();
