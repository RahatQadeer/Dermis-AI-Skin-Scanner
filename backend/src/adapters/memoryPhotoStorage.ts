import { randomUUID } from 'node:crypto';

import type { PhotoStorage, StoredPhoto } from './PhotoStorage';

export function createMemoryPhotoStorage(): PhotoStorage & {
  get: (path: string) => StoredPhoto | undefined;
  size: () => number;
} {
  const store = new Map<string, StoredPhoto>();

  return {
    async store(input) {
      const path = `scans/${input.userId}/${randomUUID()}`;
      store.set(path, {
        path,
        bytes: input.bytes,
        contentType: input.contentType,
      });
      return path;
    },
    async delete(path) {
      store.delete(path);
    },
    get(path) {
      return store.get(path);
    },
    size() {
      return store.size;
    },
  };
}
