/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Afegir més variables d'entorn aquí si cal
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

