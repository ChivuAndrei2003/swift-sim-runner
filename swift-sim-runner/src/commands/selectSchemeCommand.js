const vscode = require('vscode');

function registerSelectSchemeCommand(context) {
  const disposable = vscode.commands.registerCommand('swift-sim-runner.selectScheme', async () => {
    vscode.window.showInformationMessage('Select Scheme is not implemented yet.');
  });

  context.subscriptions.push(disposable);
}

module.exports = {
  registerSelectSchemeCommand,
};
