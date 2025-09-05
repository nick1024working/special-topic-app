import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-wrap',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-wrap.component.html',
  styleUrls: ['./header-wrap.component.css']
})
export class HeaderWrapComponent {}
