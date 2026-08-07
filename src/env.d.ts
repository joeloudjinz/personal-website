/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GTAG_MEASUREMENT_ID: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * One-shot binding flags. Component behaviour is bound to `document` once and
 * kept across View Transitions navigations rather than re-bound per instance,
 * so each flag records that its listener already exists. Declared here because
 * bundled component scripts are type-checked; the `is:inline` scripts elsewhere
 * on the site use the same convention without needing a declaration.
 */
interface Window {
  __codeCopyBound?: boolean;
}
