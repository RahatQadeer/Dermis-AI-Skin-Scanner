export type StoredPhoto = {
  path: string;
  bytes: Uint8Array;
  contentType: string;
};

export type PhotoStorage = {
  store: (input: { userId: string; bytes: Uint8Array; contentType: string }) => Promise<string>;
  delete: (path: string) => Promise<void>;
};
