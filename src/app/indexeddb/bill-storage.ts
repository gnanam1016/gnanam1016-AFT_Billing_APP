import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Bill } from '../quickbill/quickbill';

// Extend Bill with id + date for IndexedDB
export interface StoredBill extends Bill {
  id?: number;   // Auto increment key
  date?: string; // Saved timestamp
}

// Define DB Schema
interface BillingDB extends DBSchema {
  bills: {
    key: number;
    value: StoredBill;
    indexes: { 'by-billNumber': string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private dbPromise: Promise<IDBPDatabase<BillingDB>>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  /** Initialize IndexedDB */
  private async initDB() {
    return openDB<BillingDB>('BillingDB', 2, {
      upgrade(db) {
        // Create bills store if missing
        if (!db.objectStoreNames.contains('bills')) {
          const store = db.createObjectStore('bills', {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('by-billNumber', 'billNumber');
        }
      },
    });
  }

  /** Add new bill */
  async addBill(bill: Bill): Promise<number> {
    const db = await this.dbPromise;

    // Generate bill number automatically if missing
    if (!bill.billNumber) {
      const bills = await db.getAll('bills');
      const nextNumber = bills.length + 1;
      bill.billNumber = 'BILL-' + nextNumber.toString().padStart(5, '0');
    }

    const storedBill: StoredBill = {
      ...bill,
      date: new Date().toISOString(),
    };

    return db.add('bills', storedBill);
  }

  /** Get all bills */
  async getBills(): Promise<StoredBill[]> {
    const db = await this.dbPromise;
    return db.getAll('bills');
  }

  /** Get single bill by ID */
  async getBill(id: number): Promise<StoredBill | undefined> {
    const db = await this.dbPromise;
    return db.get('bills', id);
  }

  /** Update existing bill */
  async updateBill(bill: StoredBill): Promise<void> {
    if (!bill.id) throw new Error('Bill must have an id to update');
    const db = await this.dbPromise;
    await db.put('bills', {
      ...bill,
      date: bill.date ?? new Date().toISOString(),
    });
  }

  /** Delete bill by ID */
  async deleteBill(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('bills', id);
  }

  /** Clear all bills */
  async clearBills(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('bills');
  }
  /** Get next bill number in sequence */
async getNextBillNumber(): Promise<string> {
  const db = await this.dbPromise;
  const bills = await db.getAll('bills');

  if (!bills || bills.length === 0) {
    return 'BILL-00001';
  }

  // Find the highest bill number saved
  const max = bills
    .map(b => parseInt(b.billNumber.replace('BILL-', ''), 10))
    .filter(n => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 0);

  const next = max + 1;
  return 'BILL-' + next.toString().padStart(5, '0');
}

}
