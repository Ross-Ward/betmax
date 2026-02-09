import fs from 'fs/promises';
import path from 'path';

const VAULT_DIR = path.join(process.cwd(), 'lib/data/vault');

export class DatasetVault {
    /**
     * Save a dataset to a JSON file.
     */
    static async save(name: string, data: any) {
        try {
            const filePath = path.join(VAULT_DIR, `${name}.json`);
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`[VAULT] Saved dataset: ${name}`);
        } catch (error) {
            console.error(`[VAULT] Save error:`, error);
        }
    }

    /**
     * Load a dataset from a JSON file.
     */
    static async load<T>(name: string): Promise<T | null> {
        try {
            const filePath = path.join(VAULT_DIR, `${name}.json`);
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content) as T;
        } catch (error) {
            console.warn(`[VAULT] Dataset not found: ${name}`);
            return null;
        }
    }

    /**
     * List all available datasets.
     */
    static async list() {
        try {
            const files = await fs.readdir(VAULT_DIR);
            return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
        } catch (e) {
            return [];
        }
    }
}
