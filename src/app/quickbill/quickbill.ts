import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

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
}
