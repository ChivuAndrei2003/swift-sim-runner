const vscode = require('vscode');

function registerSelectSimulatorCommand(context) {
  const disposable = vscode.commands.registerCommand('swift-sim-runner.selectSimulator', async () => {
    vscode.window.showInformationMessage('Select Simulator is not implemented yet.');
  });

  context.subscriptions.push(disposable);
}

module.exports = {
  registerSelectSimulatorCommand,
};
