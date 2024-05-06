import * as vscode from 'vscode';
import registerApiSpider from './commands/apiGenerator/index';
import insertCode from './commands/apiGenerator/insertCode';
import updateCodeTypes from './commands/apiGenerator/updateCodeTypes';
import { registerJSONDataFileWatcher, parseApiData } from './services/codeGen/prepare';
import { registerSelfDefinedTemplate, checkIfSelfDefinedTemplateIsExist } from './services/codeGen/nearGen/fetchGen';
import { ApiAfterAddon } from './config/api';

export function activate(context: vscode.ExtensionContext) {
	const genDisposable = vscode.commands.registerCommand('sm.autoGenApi', insertCode);
	const updateTypesDisposable = vscode.commands.registerCommand('sm.updateGenApiTypes', updateCodeTypes);
	// 解析初始JsonData
	const apiDataWatcher = registerJSONDataFileWatcher();
	// 注册代码自动完成
	const autoCompeletionDisposable = registerApiSpider();
	// 初始化自定义接口模版
	checkIfSelfDefinedTemplateIsExist();
	// 监听自定义接口模版
	const watchSelfTemplater = registerSelfDefinedTemplate();
	vscode.workspace.findFiles(ApiAfterAddon).then((uris) => {
        for (const uri of uris) {
            parseApiData(uri);
        }
    });

	context.subscriptions.push(genDisposable, watchSelfTemplater, autoCompeletionDisposable, updateTypesDisposable, apiDataWatcher);
}

// This method is called when your extension is deactivated
export function deactivate() {

}
