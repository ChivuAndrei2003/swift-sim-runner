const vscode = require('vscode');

function createSwiftSimOutputChannel() {
  return vscode.window.createOutputChannel('Swift Sim Runner');
}

function writeDetectionToOutput(output, detection) {
  output.appendLine('');
  output.appendLine(`[detect] ${new Date().toLocaleTimeString()}`);

  if (!detection.workspaceFolder) {
    output.appendLine('[detect] No VS Code workspace folder is open.');
    return;
  }

  output.appendLine(`[detect] Workspace: ${detection.workspaceFolder.fsPath}`);

  if (detection.containers.length === 0) {
    output.appendLine('[detect] No Xcode project or workspace found.');
    return;
  }

  for (const container of detection.containers) {
    const marker = container === detection.selectedContainer ? '*' : '-';
    output.appendLine(`[detect] ${marker} ${container.type}: ${container.fsPath}`);
  }

  output.appendLine(`[detect] Selected: ${detection.selectedContainer.fsPath}`);
}

module.exports = {
  createSwiftSimOutputChannel,
  writeDetectionToOutput,
};
