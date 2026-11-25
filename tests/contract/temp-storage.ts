import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/*
 * Import this BEFORE any module that touches the admin data store.
 *
 * `src/lib/storage.ts` reads MEDIA_STORAGE_DIR once, when it is first loaded.
 * Setting it here — at import time, ahead of the store modules — points them
 * at a throw-away directory, so a test can never open the project's real
 * `storage/` folder.
 */
export const tempStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), "nfm-store-"));
process.env.MEDIA_STORAGE_DIR = tempStorageDir;
