import * as vscode from 'vscode';
import path from 'path';
import * as fs from 'fs';
import { ApiCodeBlock } from '.';
import { findSrcFolderPath } from './insertCode';
import { findRelationApis } from '../../services/codeGen';

export async function updateCodeTypes(apiBlock: ApiCodeBlock) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const currentFilePath = editor.document.uri.fsPath;
        const srcFolderPath = findSrcFolderPath(currentFilePath);
        if (srcFolderPath) {
            apiBlock.models.forEach(mfile => {
                const txtFilePath = path.join(srcFolderPath, 'interfaces', `${mfile.name}.d.ts`);
                if (fs.existsSync(txtFilePath)) {
                    fs.writeFileSync(txtFilePath, mfile.code);
                }
            });
        }
    }
}

export default async function () {
    const apiPath = await vscode.window.showInputBox({
        prompt: '需要更新的API',
        placeHolder: '请输入需要更新types的API地址',
        validateInput: value => {
            if (!value) {
                return '请输入一个名字或者项目地址';
            } return null;
        }
    });

    if (apiPath) {
        const respData: ApiCodeBlock[] = findRelationApis(apiPath);

        const items: vscode.QuickPickItem[] = respData.map(item => {
            return {
                label: item.api,
                description: item.api
            };
        });

        const selectedOption = await vscode.window.showQuickPick(items, {
            placeHolder: '选择需要更新的API',
        });

        const targetApi = respData.find(item => item.api === selectedOption?.label);

        if (targetApi) {
            updateCodeTypes(targetApi);
        }
    }
}

