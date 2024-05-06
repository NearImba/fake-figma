import * as vscode from 'vscode';
import path from 'path';
import * as fs from 'fs';
import { ApiCodeBlock } from '.';

export function findSrcFolderPath(filePath: string): string | undefined {
  let currentPath = path.dirname(filePath);
  while (currentPath !== '/') {
    const srcFolderPath = path.join(currentPath, 'src');
    if (fs.existsSync(srcFolderPath) && fs.lstatSync(srcFolderPath).isDirectory()) {
      return srcFolderPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return undefined;
}

export default async function (apiBlock: ApiCodeBlock, pos: vscode.Position, overwrite = false) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const line = pos.line;
    await editor.edit(editBuilder => {
      const lineRange = editor.document.lineAt(line).range;
      editBuilder.delete(lineRange);
    });

    const currentPosition = editor.selection.active;
    const firstLine = editor.document.lineAt(0);
    const insertPosition = new vscode.Position(0, firstLine.firstNonWhitespaceCharacterIndex);
    const codeToInsert = apiBlock.importsCode;

    await editor.edit(editBuilder => {
      editBuilder.insert(insertPosition, codeToInsert);
    });

    const currentFilePath = editor.document.uri.fsPath;
    const srcFolderPath = findSrcFolderPath(currentFilePath);
    if (srcFolderPath) {
      const interfacesFolderPath = path.join(srcFolderPath, 'interfaces');
      if (!fs.existsSync(interfacesFolderPath)) {
        fs.mkdirSync(interfacesFolderPath);
      }
      apiBlock.models.forEach(mfile => {
        const txtFilePath = path.join(srcFolderPath, 'interfaces', `${mfile.name}.d.ts`);
        if (!overwrite && !fs.existsSync(txtFilePath)) {
          fs.writeFileSync(txtFilePath, mfile.code);
        }
      });
    }

    // 将光标移动到原来的位置
    editor.selection = new vscode.Selection(currentPosition, currentPosition);
  }
}