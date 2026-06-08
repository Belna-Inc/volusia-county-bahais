import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Star } from '../star/star';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Star],
  host: { class: 'block bg-neutral text-neutral-content' },
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
