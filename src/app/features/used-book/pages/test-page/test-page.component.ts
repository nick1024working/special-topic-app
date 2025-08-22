import { Component } from '@angular/core';
import { ImageUploaderComponent } from "../../components/image-uploader/image-uploader.component";
import { TestModaComponentComponent } from "../../components/test-moda-component/test-moda-component.component";

@Component({
  selector: 'app-ub-test-page',
  standalone: true,
  imports: [ImageUploaderComponent, TestModaComponentComponent],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent {

}
