import { Component } from '@angular/core';
import { BookRowComponent } from "../../components/book-row/book-row.component";
import { TestComponent } from "../../components/test/test.component";
import { CreateUsedBookPageComponent } from "../create-used-book-page/create-used-book-page.component";

@Component({
  selector: 'app-ub-test-page',
  standalone: true,
  imports: [BookRowComponent, TestComponent, CreateUsedBookPageComponent],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent {

}
