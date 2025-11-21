import { Dataset } from '../types';

const DB_KEY = 'lumina_datasets_v1';

export const db = {
  saveDataset: (dataset: Dataset): void => {
    const existingJson = localStorage.getItem(DB_KEY);
    const existing: Dataset[] = existingJson ? JSON.parse(existingJson) : [];
    // update if exists or push new
    const index = existing.findIndex(d => d.id === dataset.id);
    if (index >= 0) {
      existing[index] = dataset;
    } else {
      existing.push(dataset);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(existing));
  },

  getDatasets: (): Dataset[] => {
    const json = localStorage.getItem(DB_KEY);
    return json ? JSON.parse(json) : [];
  },

  deleteDataset: (id: string): void => {
    const existingJson = localStorage.getItem(DB_KEY);
    if (!existingJson) return;
    const existing: Dataset[] = JSON.parse(existingJson);
    const filtered = existing.filter(d => d.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  },

  // Mock server latency
  simulateLatency: async <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 400));
  }
};