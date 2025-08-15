import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// Material modules
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

export interface Item {
  itemName: string;
  batchNumber: string;
  quantity: number;
  perQuantityPrice: number;
  discount: number;
  totalAmount: number;
}

@Component({
  selector: 'app-quickbill',
  standalone: true,
  templateUrl: './quickbill.html',
  styleUrls: ['./quickbill.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatAccordion,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ]
})
export class Quickbill implements AfterViewInit {
  displayedColumns: string[] = ['itemName', 'batchNumber', 'quantity', 'perQuantityPrice', 'discount', 'totalAmount', 'actions'];
  dataSource = new MatTableDataSource<Item>([]);

  customerForm = {
    name: '',
    mobile: '',
    address: ''
  };

  itemForm = {
    itemName: '',
    batchNumber: '',
    quantity: 0,
    perQuantityPrice: 0,
    discount: 0,
    totalAmount: 0
  };

  editIndex: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  addItem() {
    this.calculateTotal();
    if (this.editIndex !== null) {
      this.dataSource.data[this.editIndex] = { ...this.itemForm };
      this.editIndex = null;
    } else {
      this.dataSource.data = [...this.dataSource.data, { ...this.itemForm }];
    }
    this.itemForm = { itemName: '', batchNumber: '', quantity: 0, perQuantityPrice: 0, discount: 0, totalAmount: 0 };
    this.dataSource._updateChangeSubscription();
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
    this.dataSource._updateChangeSubscription();
    this.itemForm = { itemName: '', batchNumber: '', quantity: 0, perQuantityPrice: 0, discount: 0, totalAmount: 0 };
    this.editIndex = null;
  }

  calculateTotal() {
    const qty = Number(this.itemForm.quantity) || 0;
    const price = Number(this.itemForm.perQuantityPrice) || 0;
    const discount = Number(this.itemForm.discount) || 0;
    let total = qty * price;
    if (discount > 0) {
      total -= discount;
    }
    this.itemForm.totalAmount = total;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // ✅ Totals
  getTotalQuantity() {
    return this.dataSource.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  getTotalDiscount() {
    return this.dataSource.data.reduce((sum, item) => sum + (item.discount || 0), 0);
  }

  getTotalAmount() {
    return this.dataSource.data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  }

  // ✅ Save Bill
  saveBill() {
    const billData = {
      customer: this.customerForm,
      items: this.dataSource.data,
      totals: {
        quantity: this.getTotalQuantity(),
        discount: this.getTotalDiscount(),
        amount: this.getTotalAmount()
      }
    };
    console.log('Bill saved:', billData);
    alert('Bill saved successfully!');
  }

printInvoice() {
  let billContent = `
    <div style="font-family: monospace; font-size: 14px; padding: 10px; width: 250px;">
      <h3 style="text-align: center; margin: 0;">POS BILL</h3>
      <hr style="margin: 4px 0;">
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
          ${this.dataSource.data.map(item => `
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

  let printWindow = window.open('', '', 'width=300,height=600');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>POS Bill</title>
        </head>
        <body onload="window.print(); window.close();">
          ${billContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}


  // ✅ Print POS bill (compact)
  printPOSBill() {
    let printContents = `
      <h3 style="text-align:center;">POS Receipt</h3>
      <hr>
    `;
    this.dataSource.data.forEach(item => {
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
}
