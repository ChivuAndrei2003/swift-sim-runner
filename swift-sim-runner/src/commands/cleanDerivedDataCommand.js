const vscode = require('vscode');

function registerCleanDerivedDataCommand(context) {
  const disposable = vscode.commands.registerCommand('swift-sim-runner.cleanDerivedData', async () => {
    vscode.window.showInformationMessage('Clean Derived Data is not implemented yet.');
  });

  context.subscriptions.push(disposable);
}

module.exports = {
  registerCleanDerivedDataCommand,
};
