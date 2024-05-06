import * as vscode from 'vscode';
import { findRelationApis } from '../../services/codeGen';
import { TriggerText } from '../../config/api';

export interface ApiCodeBlock {
    api: string;
    models: {
        name: string,
        code: string;
    }[];
    importsCode: string;
    fetchCode: string;
}

export default function registerApiSpider() {
    return vscode.languages.registerInlineCompletionItemProvider({
        pattern: '**/*.{ts,tsx}'
    }, {
        async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const lineText = document.lineAt(position).text.trim();
            if (lineText.startsWith(TriggerText) && lineText !== TriggerText) {
                const fapi = lineText.trim().replace(TriggerText, '');
                try {
                    const respData: ApiCodeBlock[] = findRelationApis(fapi, vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath);
                    const items: vscode.InlineCompletionItem[] = respData.map(item => {
                        const completionItem = new vscode.InlineCompletionItem(item.api);
                        // 可以为每个自动完成项设置详细信息、文档等
                        const content = '\n' + item.fetchCode;
                        completionItem.insertText = '\n' + item.fetchCode;
                        completionItem.filterText = item.api + '$';
                        completionItem.command = {
                            title: '插入代码',
                            command: 'sm.autoGenApi',
                            arguments: [item, position]
                        };
                        completionItem.range = new vscode.Range(position.translate(0, content.length), position);
                        return completionItem;
                    });
                    return { items };
                } catch (err) {
                    console.log(err);
                }
            }
            return { items: [] };
        }
    });
}