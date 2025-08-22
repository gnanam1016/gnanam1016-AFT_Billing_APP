import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../confirmdialog-component/confirmdialog-component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, filter, of, delay } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';


export interface BillItem {
  itemName: string;
  batchNumber: string;
  quantity: number;
  perQuantityPrice: number;
  discount: number;
  totalAmount: number;
}

export interface Customer {
  name: string;
  mobile: string;
  address: string;
}

export interface BillTotals {
  quantity: number;
  discount: number;
  amount: number;
}

export interface Bill {
  billNumber: string;
  customer: Customer;
  items: BillItem[];
  totals: BillTotals;
  date ?: any; // optional date field
  id?: number; // optional ID for IndexedDB
}

// Fake DB data
const FAKE_ITEMS = [
  'Paracetamol 500mg',
  'Paracetamol 650mg',
  'Amoxicillin 250mg',
  'Cough Syrup',
  'Vitamin C',
  'Pain Relief Gel',
  'Antibiotic Cream'
];

const FAKE_BATCHES = [
  'BATCH-001',
  'BATCH-002',
  'BATCH-003',
  'LOT-2025-A',
  'LOT-2025-B',
  'PKG-777'
];

@Component({
  selector: 'app-billbook',
  templateUrl: './billbook.html',
  styleUrl: './billbook.css',
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,MatSnackBarModule, ReactiveFormsModule,
    MatAutocompleteModule,HttpClientModule
  ],
})
export class Billbook implements AfterViewInit,OnInit{
  
  constructor(private http: HttpClient, private dialog: MatDialog, private snackBar: MatSnackBar) {}

   // Autocomplete controls
  itemNameCtrl = new FormControl('');
  batchNumberCtrl = new FormControl('');

    // Suggestions
  filteredItemNames: string[] = [];
  filteredBatchNumbers: string[] = [];

  private fakeItems = ['Paracetamol', 'Ibuprofen', 'Cetrizine', 'Amoxicillin'];
private fakeBatches = ['B001', 'B002', 'B003', 'B004'];

  ngOnInit(): void {
this.itemNameCtrl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(value => this.searchItems(value || ''))
  ).subscribe(results => this.filteredItemNames = results);

  this.batchNumberCtrl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(value => this.searchBatchNumbers(value || ''))
  ).subscribe(results => this.filteredBatchNumbers = results);
  }

   // Example API calls — replace with your backend endpoints
  private searchItems(query: string) {
    if (!query) return of([]);
  return of(this.fakeItems.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  )).pipe(delay(200));
    // return this.http.get<string[]>(`/api/items?search=${encodeURIComponent(query)}`);
  }

  private searchBatchNumbers(query: string) {
     if (!query) return of([]);
  return of(this.fakeBatches.filter(batch =>
    batch.toLowerCase().includes(query.toLowerCase())
  )).pipe(delay(200));
    // return this.http.get<string[]>(`/api/batches?search=${encodeURIComponent(query)}`);
  }

  // When user selects
  onItemNameSelected(value: string) {
    this.itemForm.itemName = value;
  }

  onBatchNumberSelected(value: string) {
    this.itemForm.batchNumber = value;
  }

  // Table columns
  displayedColumns: string[] = ['itemName', 'batchNumber', 'quantity', 'perQuantityPrice', 'discount', 'totalAmount', 'actions'];
  itemTableColumns: string[] = ['rowNumber', 'itemName', 'batchNumber', 'quantity', 'perQuantityPrice', 'discount', 'totalAmount', 'actions'];
  billColumns: string[] = ['name', 'mobile', 'totalQty', 'discount', 'amount', 'actions'];


  // Data
  dataSource = new MatTableDataSource<BillItem>([]);
  savedBills: Bill[] = [];   // Store saved bills
  billCounter: number = 1;

  // Forms/state
  customerForm: Customer = { name: '', mobile: '', address: '' };
  itemForm: BillItem = { itemName: '', batchNumber: '', quantity: 0, perQuantityPrice: 0, discount: 0, totalAmount: 0 };
  editIndex: number | null = null;       // editing row in items table
  editBillIndex: number | null = null;   // editing which saved bill

  // Material hooks
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Optional: friendlier filtering across a few fields
    this.dataSource.filterPredicate = (data: BillItem, filter: string) => {
      const f = filter.trim().toLowerCase();
      return (
        (data.itemName || '').toLowerCase().includes(f) ||
        (data.batchNumber || '').toLowerCase().includes(f)
      );
    };
  }

  // -----------------------------
  // Items CRUD
  // -----------------------------
  addItem() {
    this.calculateTotal();
    if (this.editIndex !== null) {
      const items = [...this.dataSource.data];
      items[this.editIndex] = { ...this.itemForm };
      this.dataSource.data = items; // trigger update
      this.editIndex = null;
    } else {
      this.dataSource.data = [...this.dataSource.data, { ...this.itemForm }];
    }
    this.itemForm = { itemName: '', batchNumber: '', quantity: 0, perQuantityPrice: 0, discount: 0, totalAmount: 0 };
  }

  editItem(index: number) {
    const item = this.dataSource.data[index];
    this.itemForm = { ...item };
    this.editIndex = index;
  }

  deleteItem(index: number) {
    const items = [...this.dataSource.data];
    items.splice(index, 1);
    this.dataSource.data = items;
    this.itemForm = { itemName: '', batchNumber: '', quantity: 0, perQuantityPrice: 0, discount: 0, totalAmount: 0 };
    this.editIndex = null;
  }

  calculateTotal() {
    const qty = Number(this.itemForm.quantity) || 0;
    const price = Number(this.itemForm.perQuantityPrice) || 0;
    const discount = Number(this.itemForm.discount) || 0;
    let total = qty * price;
    if (discount > 0) total -= discount;
    this.itemForm.totalAmount = total;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = (filterValue || '').trim().toLowerCase();
  }

  // -----------------------------
  // Totals
  // -----------------------------
  getTotalQuantity(): number {
    return this.dataSource.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  getTotalDiscount(): number {
    return this.dataSource.data.reduce((sum, item) => sum + (item.discount || 0), 0);
  }

  getTotalAmount(): number {
    return this.dataSource.data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }

  // -----------------------------
  // Save / Edit Bills
  // -----------------------------
async saveBill() {
  let billNumber = '';

  if (this.editBillIndex !== null) {
    billNumber = this.savedBills[this.editBillIndex].billNumber;
  } else {
    // billNumber = await this.billingService.getNextBillNumber();
  }

  const billData: Bill = {
    billNumber,
    customer: { ...this.customerForm },
    items: this.dataSource.data.map((it: BillItem) => ({ ...it })),
    totals: {
      quantity: this.getTotalQuantity(),
      discount: this.getTotalDiscount(),
      amount: this.getTotalAmount()
    }
  };

  if (this.editBillIndex !== null) {
    // ✅ Keep ID when updating
    const existingBill = {
      ...this.savedBills[this.editBillIndex],
      ...billData,
      id: (this.savedBills[this.editBillIndex] as any).id
    };
    // await this.billingService.updateBill(existingBill);
  } else {
    // ✅ Save new bill and attach ID
    // const id = await this.billingService.addBill(billData);
    // (billData as any).id = id;
  }

  // ✅ Refresh from DB so UI updates properly
  await this.refreshBills();

  alert('Bill saved successfully! Bill Number: ' + billNumber);

  // Reset
  this.customerForm = { name: '', mobile: '', address: '' };
  this.dataSource.data = [];
  this.editBillIndex = null;
}

private async refreshBills() {
  // this.savedBills = await this.billingService.getBills();
} 

  editBill(index: number) {
  const bill = this.savedBills[index];
  this.customerForm = { ...bill.customer };
  this.dataSource.data = bill.items.map(it => ({ ...it }));
  this.editBillIndex = index; // remember which index in UI we’re editing
}


async deleteBill(index: number) {
  const bill = this.savedBills[index];

  // ✅ Open confirmation dialog
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      title: 'Confirm Delete',
      message: `Are you sure you want to delete Bill <b>${bill.billNumber}</b>?`
    }
  });

  dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
    if (confirmed) {
      if ((bill as any).id) {
        // await this.billingService.deleteBill((bill as any).id);
      }

      this.savedBills.splice(index, 1);

      // ✅ Show Material snackbar instead of alert
      this.snackBar.open(`Bill ${bill.billNumber} deleted successfully`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
    }
  });
}

  // -----------------------------
  // Printing / WhatsApp
  // -----------------------------
  printInvoice() {
    let customerSection = '';
    if (this.customerForm.name || this.customerForm.mobile || this.customerForm.address) {
      customerSection = `
        <div style="margin-bottom: 8px; font-size: 13px;">
          ${this.customerForm.name ? `<div><strong>Name:</strong> ${this.customerForm.name}</div>` : ''}
          ${this.customerForm.mobile ? `<div><strong>Mobile:</strong> ${this.customerForm.mobile}</div>` : ''}
          ${this.customerForm.address ? `<div><strong>Address:</strong> ${this.customerForm.address}</div>` : ''}
        </div>
        <hr style="margin: 4px 0;">
      `;
    }
    // Find last bill number
    let billNumber = '';
    if (this.savedBills.length > 0) {
      billNumber = this.savedBills[this.savedBills.length - 1].billNumber;
    }

    const billContent = `
      <div style="font-family: monospace; font-size: 14px; padding: 10px; width: 250px;">
        <h3 style="text-align: center; margin: 0;">POS BILL</h3>
        <div style="text-align: center; font-size: 13px; margin-bottom: 4px;">Bill No: <strong>${billNumber}</strong></div>
        <hr style="margin: 4px 0;">
        ${customerSection}
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
          <thead>
            <tr>
              <th style="text-align: left; width: 40%;">Item</th>
              <th style="text-align: right; width: 15%;">Qty</th>
              <th style="text-align: right; width: 20%;">Price</th>
              <th style="text-align: right; width: 25%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${this.dataSource.data.map((item: BillItem) => `
              <tr>
                <td style="word-wrap: break-word;">${item.itemName}</td>
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">${item.perQuantityPrice.toFixed(2)}</td>
                <td style="text-align: right;">${item.totalAmount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <hr style="margin: 4px 0;">
        <table style="width: 100%; font-weight: bold; table-layout: fixed;">
          <tr>
            <td style="text-align: left;">Total Qty</td>
            <td style="text-align: right;">${this.getTotalQuantity()}</td>
          </tr>
          <tr>
            <td style="text-align: left;">Total Discount</td>
            <td style="text-align: right;">${this.getTotalDiscount().toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: left;">Total Amount</td>
            <td style="text-align: right;">${this.getTotalAmount().toFixed(2)}</td>
          </tr>
        </table>
        <hr style="margin: 4px 0;">
        <p style="text-align: center; margin: 0;">Thank you! Visit Again</p>
      </div>
    `;

    const printWindow = window.open('', '', 'width=300,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>POS Bill</title></head>
          <body onload="window.print(); window.close();">
            ${billContent}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  printPOSBill() {
    let printContents = `
      <h3 style="text-align:center;">POS Receipt</h3>
      <hr>
    `;
    this.dataSource.data.forEach((item: BillItem) => {
      printContents += `
        ${item.itemName} (${item.quantity} x ${item.perQuantityPrice}) = ${item.totalAmount}<br/>
      `;
    });
    printContents += `
      <hr>
      <strong>Total: ${this.getTotalAmount()}</strong>
    `;
    const popupWin = window.open('', '_blank', 'width=300,height=600');
    popupWin!.document.open();
    popupWin!.document.write(`<html><body onload="window.print()">${printContents}</body></html>`);
    popupWin!.document.close();
  }

  sendWhatsApp() {
    let message = `🧾 *POS Bill* \n\n`;

    if (this.customerForm.name || this.customerForm.mobile || this.customerForm.address) {
      message += `👤 *Customer Details* \n`;
      if (this.customerForm.name) message += `Name: ${this.customerForm.name}\n`;
      if (this.customerForm.mobile) message += `Mobile: ${this.customerForm.mobile}\n`;
      if (this.customerForm.address) message += `Address: ${this.customerForm.address}\n`;
      message += `\n`;
    }

    message += `📦 *Items* \n`;
    this.dataSource.data.forEach((item: BillItem, i: number) => {
      message += `${i + 1}. ${item.itemName} - Qty: ${item.quantity}, Price: ${item.perQuantityPrice}, Total: ${item.totalAmount}\n`;
    });

    message += `\n---------------------\n`;
    message += `🔢 Total Qty: ${this.getTotalQuantity()}\n`;
    message += `💸 Discount: ${this.getTotalDiscount()}\n`;
    message += `💰 Total Amount: ${this.getTotalAmount()}\n`;
    message += `---------------------\n`;
    message += `✅ Thank you! Visit Again 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const phone = this.customerForm.mobile ? this.customerForm.mobile : '';
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }
  
}
