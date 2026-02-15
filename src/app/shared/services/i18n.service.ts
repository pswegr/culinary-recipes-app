import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, computed, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { LanguageCode, translations } from '../i18n/translations';

interface LanguageOption {
  code: LanguageCode;
  labelKey: string;
}

const LANGUAGE_STORAGE_KEY = 'app.language';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly language = signal<LanguageCode>('en');
  private readonly languageChangesSubject = new Subject<LanguageCode>();

  readonly currentLanguage = computed(() => this.language());
  readonly languageChanges$ = this.languageChangesSubject.asObservable();
  readonly supportedLanguages: readonly LanguageOption[] = [
    { code: 'en', labelKey: 'toolbar.language.english' },
    { code: 'pl', labelKey: 'toolbar.language.polish' },
  ];

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const initialLanguage = this.resolveInitialLanguage();
    this.applyLanguage(initialLanguage, false);
  }

  setLanguage(languageCode: string): void {
    const normalized = this.normalizeLanguageCode(languageCode);
    if (!normalized || normalized === this.language()) {
      return;
    }

    this.applyLanguage(normalized);
  }

  translate(
    key: string,
    params?: Record<string, string | number | null | undefined>
  ): string {
    if (!key) {
      return '';
    }

    const selectedLanguage = this.language();
    const value =
      this.resolveKey(selectedLanguage, key) ??
      this.resolveKey('en', key) ??
      key;

    return this.interpolate(value, params);
  }

  private resolveInitialLanguage(): LanguageCode {
    const storedLanguage = this.readStoredLanguage();
    if (storedLanguage) {
      return storedLanguage;
    }

    if (typeof navigator !== 'undefined') {
      for (const languageCode of navigator.languages ?? []) {
        const normalized = this.normalizeLanguageCode(languageCode);
        if (normalized) {
          return normalized;
        }
      }

      const fallback = this.normalizeLanguageCode(navigator.language);
      if (fallback) {
        return fallback;
      }
    }

    return 'en';
  }

  private applyLanguage(languageCode: LanguageCode, emit: boolean = true): void {
    this.language.set(languageCode);
    this.document.documentElement.lang = languageCode;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    }

    if (emit) {
      this.languageChangesSubject.next(languageCode);
    }
  }

  private readStoredLanguage(): LanguageCode | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return this.normalizeLanguageCode(stored);
  }

  private normalizeLanguageCode(languageCode: string | null | undefined): LanguageCode | null {
    if (!languageCode) {
      return null;
    }

    const normalized = languageCode.toLowerCase();
    if (normalized.startsWith('en')) {
      return 'en';
    }

    if (normalized.startsWith('pl')) {
      return 'pl';
    }

    return null;
  }

  private resolveKey(languageCode: LanguageCode, key: string): string | null {
    const parts = key.split('.');
    let current: unknown = translations[languageCode];

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return null;
      }

      current = (current as Record<string, unknown>)[part];
    }

    return typeof current === 'string' ? current : null;
  }

  private interpolate(
    value: string,
    params?: Record<string, string | number | null | undefined>
  ): string {
    if (!params) {
      return value;
    }

    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey: string) => {
      const replacement = params[paramKey];
      return replacement === null || replacement === undefined
        ? ''
        : String(replacement);
    });
  }
}
