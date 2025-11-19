import * as fs from 'fs';

export class FileSystemHelper {
    ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    writeFileSync(filePath: string, content: string): void {
        fs.writeFileSync(filePath, content);
    }

    readFileSync(filePath: string): string {
        return fs.readFileSync(filePath, 'utf8');
    }

    existsSync(filePath: string): boolean {
        return fs.existsSync(filePath);
    }
}