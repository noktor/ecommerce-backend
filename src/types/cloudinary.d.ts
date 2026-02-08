/**
 * Type declarations for the cloudinary package so TypeScript/ts-node resolve it
 * in all environments (local pnpm, Docker, etc.).
 */
declare module 'cloudinary' {
  export function config(options: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  }): void;

  export const v2: {
    config: (options: {
      cloud_name: string;
      api_key: string;
      api_secret: string;
    }) => void;
    uploader: {
      upload: (
        source: string,
        options?: Record<string, unknown>
      ) => Promise<{ secure_url: string; public_id: string }>;
      destroy: (publicId: string) => Promise<unknown>;
    };
  };
}
