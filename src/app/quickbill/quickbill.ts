import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { BillingService } from '../indexeddb/bill-storage';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirmdialog-component/confirmdialog-component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

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
  date?: any; // optional date field
  id?: number; // optional ID for IndexedDB
}

@Component({
  selector: 'app-quickbill',
  standalone: true,
  templateUrl: './quickbill.html',
  styleUrls: ['./quickbill.css'],
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
    MatCardModule, MatSnackBarModule
  ],
})
export class Quickbill implements AfterViewInit, OnInit {
  constructor(private billingService: BillingService, private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    //  this.billingService.getBills();
    this.refreshBills();
    if (this.savedBills.length > 0) {
      // Extract last bill number and set counter
      const lastBill = this.savedBills[this.savedBills.length - 1];
      const lastNumber = parseInt(lastBill.billNumber.replace('BILL-', ''), 10);
      this.billCounter = lastNumber + 1;
    } else {
      this.billCounter = 1;
    }
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
      billNumber = await this.billingService.getNextBillNumber();
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
      await this.billingService.updateBill(existingBill);
    } else {
      // ✅ Save new bill and attach ID
      const id = await this.billingService.addBill(billData);
      (billData as any).id = id;
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
    this.savedBills = await this.billingService.getBills();
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
          await this.billingService.deleteBill((bill as any).id);
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

  private loadBillsFromStorage(): void {
    const data = localStorage.getItem('savedBills');
    this.savedBills = data ? JSON.parse(data) : [];
  }

  private saveBillsToStorage(): void {
    localStorage.setItem('savedBills', JSON.stringify(this.savedBills));
  }

   // 🔹 Print function
  // 🔹 Print function
printPDF(format: 'A4' | 'A5' | 'LETTER' | 'POS80' | 'POS58') {
  const bill = this.savedBills[0];

  // Map custom sizes
  const pageSizeMap: any = {
    A4: 'A4',
    A5: 'A5',
    LETTER: 'LETTER',
    POS80: { width: 226.77, height: 'auto' }, // ~80mm
    POS58: { width: 165.35, height: 'auto' }  // ~58mm
  };

  const docDefinition: any = {
    pageSize: pageSizeMap[format],
    pageMargins: format.startsWith('POS') ? [10, 10, 10, 10] : [40, 60, 40, 60],
    content: [
      { text: 'INVOICE', style: 'header' },
      { text: `Bill No: ${bill.billNumber}`, style: 'subHeader' },
      { text: `Date: ${bill.date || new Date().toLocaleDateString()}`, margin: [0, 0, 0, 10] },

      // Customer
      {
        style: 'customerInfo',
        table: {
          widths: ['auto', '*'],
          body: [
            ['Customer Name:', bill.customer.name],
            ['Mobile:', bill.customer.mobile],
            ['Address:', bill.customer.address || '']
          ]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 20]
      },

      // Items Table
      {
        style: 'itemsTable',
        table: {
          headerRows: 1,
          widths: format.startsWith('POS')
            ? ['*', 'auto', 'auto']  // POS = narrower
            : ['*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: format.startsWith('POS')
            ? [
                ['Item', 'Qty', 'Total'],
                ...bill.items.map((item: BillItem) => [
                  item.itemName,
                  item.quantity,
                  item.totalAmount
                ])
              ]
            : [
                ['Item', 'Batch', 'Qty', 'Price', 'Discount', 'Total'],
                ...bill.items.map((item: BillItem) => [
                  item.itemName,
                  item.batchNumber,
                  item.quantity,
                  item.perQuantityPrice,
                  item.discount,
                  item.totalAmount
                ])
              ]
        }
      },

      // Totals
      {
        style: 'totals',
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Quantity', bill.totals.quantity],
            ['Total Discount', bill.totals.discount.toFixed(2)],
            ['Grand Total', bill.totals.amount.toFixed(2)]
          ]
        },
        margin: [0, 20, 0, 0]
      }
    ],
    styles: {
      header: { fontSize: format.startsWith('POS') ? 12 : 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
      subHeader: { fontSize: format.startsWith('POS') ? 8 : 12, bold: true, margin: [0, 0, 0, 5] },
      customerInfo: { margin: [0, 5, 0, 5] },
      itemsTable: { margin: [0, 5, 0, 5] },
      totals: { bold: true }
    }
  };

  pdfMake.createPdf(docDefinition).open();
}

}
