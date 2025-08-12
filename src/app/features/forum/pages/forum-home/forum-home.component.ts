import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forum-home',
  standalone: true,
  templateUrl: './forum-home.component.html',
  styleUrls: ['./forum-home.component.css'],
  imports: [RouterLink]   // ← 加這行
})
export class ForumHomeComponent {}
