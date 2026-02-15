import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 't',
  standalone: false,
  pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private readonly i18nService = inject(I18nService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly languageSub: Subscription;

  constructor() {
    this.languageSub = this.i18nService.languageChanges$.subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  transform(
    key: string,
    params?: Record<string, string | number | null | undefined>
  ): string {
    return this.i18nService.translate(key, params);
  }

  ngOnDestroy(): void {
    this.languageSub.unsubscribe();
  }
}
