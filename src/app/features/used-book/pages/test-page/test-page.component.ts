import { Component } from '@angular/core';
import { BookRowComponent } from "../../components/book-row/book-row.component";
import { TestComponent } from "../../components/test/test.component";
import { CreateUsedBookPageComponent } from "../create-used-book-page/create-used-book-page.component";
import { ImageUploaderComponent } from "../../components/image-uploader/image-uploader.component";

@Component({
  selector: 'app-ub-test-page',
  standalone: true,
  imports: [BookRowComponent, TestComponent, CreateUsedBookPageComponent, ImageUploaderComponent],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent {

}
