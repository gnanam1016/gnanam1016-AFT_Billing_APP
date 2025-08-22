import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormsModule, NgForm } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar'; // optional if you have a toolbar
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

interface User {
  name: string;
  dob: string;
  aadhar: string;
  phone: string;
  password: string;
  active: boolean;
}

@Component({
  selector: 'app-user',
  templateUrl: './newuser.html',
  styleUrls: ['./newuser.css'],
  imports:[FormsModule,CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,MatPaginatorModule]
})
export class NewUser implements OnInit {
name = '';
  dob = '';
  aadhar = '';
  phone = '';
  password = '';
  active = true;

  editIndex: number | null = null;

  displayedColumns: string[] = ['name', 'dob', 'aadhar', 'phone', 'active', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) return;

    const user: User = {
      name: this.name,
      dob: this.dob,
      aadhar: this.aadhar,
      phone: this.phone,
      password: this.password,
      active: this.active
    };

    if (this.editIndex !== null) {
      this.dataSource.data[this.editIndex] = user;
      this.editIndex = null;
    } else {
      this.dataSource.data = [...this.dataSource.data, user];
    }

    form.resetForm({ active: true });
  }

  onEdit(user: User, index: number) {
    this.name = user.name;
    this.dob = user.dob;
    this.aadhar = user.aadhar;
    this.phone = user.phone;
    this.password = user.password;
    this.active = user.active;
    this.editIndex = index;
  }

  onDelete(index: number) {
    this.dataSource.data = this.dataSource.data.filter((_, i) => i !== index);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
