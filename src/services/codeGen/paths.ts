import path from 'path';
import fs from 'fs';

export async function findSwaggerJsonPaths(paths: string[]) {
    const jsonPaths: string[] = [];
    async function traverseDirectory(directoryPath: string) {
        try {
            const files = await fs.promises.readdir(directoryPath);
            for (const file of files) {
                const filePath = path.join(directoryPath, file);
                const stats = await fs.promises.stat(filePath);

                if (stats.isDirectory()) {
                    await traverseDirectory(filePath); // 递归遍历子文件夹
                } else {
                    if (filePath.endsWith('.json')) {
                        jsonPaths.push(filePath);
                    }
                }
            }
        } catch (error) {
            console.error(`Error while traversing directory: ${error}`);
        }
    }

    const allTasks: Promise<void>[] = [];
    paths.forEach(spath => {
        allTasks.push(traverseDirectory(spath));
    });
    await Promise.all(allTasks);
    return jsonPaths;
}