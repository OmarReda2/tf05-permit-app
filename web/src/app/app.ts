import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Permits', path: '/permits' },
    { label: 'New Permit', path: '/permits/new' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Admin', path: '/admin' },
    { label: 'Profile', path: '/profile' },
  ];
}
