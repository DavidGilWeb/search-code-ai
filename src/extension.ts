// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { Console } from 'console';
import * as vscode from 'vscode';
import { GitUtils } from './git-utils';
import {PartialTextEditor, validEditor} from './util/valid-editor';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('search-code-ia.searchCode', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let arrFiles = [];
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			vscode.window.showErrorMessage('No hay ningún editor activo.');
			return;
		}

		const gitUtils = new GitUtils(editor.document.fileName);
	
		const gitLogs = await gitUtils.getGitLog();
		gitLogs.forEach((log) => {
			console.log(log.message);
		});

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		const allFiles = await vscode.workspace.findFiles('**/*.php');
		const sameFile = editor.document.getText().match(new RegExp(selectedText, 'g'));
		for (const file of allFiles) {
			const content = await vscode.workspace.openTextDocument(file);
			const fileWithText = content.getText();

			if (fileWithText.includes(selectedText)) {
				arrFiles.push(file);
			}
		}
		
		if (sameFile && sameFile.length > 1) {
			vscode.window.showWarningMessage('Existe el mismo código más de una vez: ' + selectedText);
		}

		if (arrFiles.length === 0) {
			vscode.window.showWarningMessage('No existe el texto seleccionado.');
		} else {
			vscode.window.showInformationMessage(`El texto seleccionado aparece en ${arrFiles.length} archivos`);
		}

	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }


function commit(){

	const editor = getActiveTextEditor();

	if (!validEditor(editor)) {
		vscode.window.showErrorMessage('Editor no válido');
		return;
	}

	
}

function getActiveTextEditor(){ // getter to obtain the active text editor
	return vscode.window.activeTextEditor;
}
