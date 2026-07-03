const DB_NAME = 'aust-question-bank-files';
const DB_VERSION = 1;
const STORE_NAME = 'papers';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open file storage.'));
  });
}

function runStore(mode, runner) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = runner(store);

        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error || new Error('File storage transaction failed.'));
        tx.onabort = () => reject(tx.error || new Error('File storage transaction aborted.'));
      }),
  );
}

export async function saveQuestionPaperFile(paperId, fileData) {
  await runStore('readwrite', (store) => {
    store.put(fileData, paperId);
  });
}

export async function getQuestionPaperFile(paperId) {
  return runStore('readonly', (store) => {
    const request = store.get(paperId);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || '');
      request.onerror = () => reject(request.error || new Error('Could not read stored file.'));
    });
  });
}

export async function deleteQuestionPaperFile(paperId) {
  await runStore('readwrite', (store) => {
    store.delete(paperId);
  });
}
