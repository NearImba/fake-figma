import fs from 'fs';
import * as vscode from 'vscode';
import { parse as parseV3 } from './openApiGen/openApi/v3/index';
import { parse as parseV2 } from './openApiGen/openApi/v2/index';
import type { OpenApi } from './openApiGen/openApi/v3/interfaces/OpenApi';
import type { OpenApi as OpenApiV2 } from './openApiGen/openApi/v2/interfaces/OpenApi';
import { addApi, addInterface } from './collections';

async function readJsonFile(filePath: string): Promise<OpenApi | OpenApiV2 | null> {
    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        return jsonData;
    } catch (error) {
        vscode.window.showErrorMessage('Error while parsing swagger json file:' + error);
        return null;
    }
}

export async function parseJsonFile(path: string, dir: string) {
    const jsonData = await readJsonFile(path);
    if (jsonData) {
        const info = (jsonData as OpenApi).openapi || (jsonData as OpenApiV2).swagger;
        const c = info.charAt(0);
        const v = Number.parseInt(c);
        if (v === 2) {
            const { models, services, server } = parseV2(jsonData as OpenApiV2) ;
            services.forEach(ser => {
                addApi(ser.operations || [], dir, server);
            });
            addInterface(models, dir);
        }

        if (v === 3) {
            const { models, services, server } = parseV3(jsonData as OpenApi);
            services.forEach(ser => {
                addApi(ser.operations || [], dir, server);
            });
            addInterface(models, dir);
        }
    }
}