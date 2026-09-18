import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elapsedTime',
  pure: false,
  standalone: true
})
export class ElapsedTimePipe implements PipeTransform {
  transform(createdAt: Date | string): string {
    const now = Date.now();
    const normalized = typeof createdAt === 'string' && !createdAt.endsWith('Z') ? createdAt + 'Z' : createdAt;
    const created = new Date(normalized).getTime();
    const elapsed = now - created;
    const minutes = Math.floor(elapsed / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}