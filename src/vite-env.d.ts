/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Optional dev prefill for Umrah visa check (passport / name / ISO alpha-3 nationality) */
  readonly VITE_VISA_TEST_PASSPORT?: string;
  readonly VITE_VISA_TEST_FIRST_NAME?: string;
  readonly VITE_VISA_TEST_COUNTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
