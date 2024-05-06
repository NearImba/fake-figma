import { workspace, Uri } from 'vscode';
import * as fs from 'fs';
import Handlebars from '../openApiGen/utils/handlebarsInstance';
import path from 'path';

const hbsTemplaterMap: { [key: string]: Handlebars.TemplateDelegate | null } = {};

export const TemplateFileName = 'fetch.tpl.hbs';

export function reCompileUserDefinedTpl(content: string): Handlebars.TemplateDelegate {
    return Handlebars.compile(content, {
        strict: true,
        noEscape: true,
        preventIndent: true,
        knownHelpersOnly: true,
        knownHelpers: {
            ifdef: true,
            equals: true,
            notEquals: true,
            containsSpaces: true,
            union: true,
            intersection: true,
            enumerator: true,
            escapeComment: true,
            escapeDescription: true,
            camelCase: true,
            json: true,
        },
    });
}

export function getSelfDefinedHbs(workspaceFolderPath: string): Handlebars.TemplateDelegate | undefined | null {
    return hbsTemplaterMap[workspaceFolderPath];
}

function handleFileChange(uri: Uri) {
    const workspaceFolder = workspace.getWorkspaceFolder(uri);
    const filePath = uri.fsPath;
    const wf = workspaceFolder?.uri.fsPath;
    if (wf) {
        const content = fs.readFileSync(filePath, 'utf-8');
        hbsTemplaterMap[wf] = reCompileUserDefinedTpl(content);
    }
}

function handleFileDelete(uri: Uri) {
    const workspaceFolder = workspace.getWorkspaceFolder(uri);
    const wf = workspaceFolder?.uri.fsPath;
    if (wf) {
        hbsTemplaterMap[wf] = null;  
    }
}

export function checkIfSelfDefinedTemplateIsExist() {
    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders) {
        for (const folder of workspaceFolders) {
            const folderPath = folder.uri.fsPath;
            const selfDefinedTemplatePath = path.join(folderPath, TemplateFileName);
            if (fs.existsSync(selfDefinedTemplatePath) && folderPath) {
                const content = fs.readFileSync(selfDefinedTemplatePath, 'utf-8');
                hbsTemplaterMap[folderPath] = reCompileUserDefinedTpl(content);  
            }
        }
    }
}

export function registerSelfDefinedTemplate() {
    const fileWatcher = workspace.createFileSystemWatcher(`**/${TemplateFileName}`);
    fileWatcher.onDidChange(handleFileChange);
    fileWatcher.onDidCreate(handleFileChange);
    fileWatcher.onDidDelete(handleFileDelete);
    return fileWatcher;
}




