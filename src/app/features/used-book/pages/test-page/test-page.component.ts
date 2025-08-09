import { Component } from '@angular/core';
import { BookRowComponent } from "../../components/book-row/book-row.component";

@Component({
  selector: 'app-ub-test-page',
  standalone: true,
  imports: [BookRowComponent],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent {

}
