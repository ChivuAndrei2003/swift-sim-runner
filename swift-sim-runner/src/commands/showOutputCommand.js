const vscode = require('vscode');

function registerShowOutputCommand(context, { output }) {
  const disposable = vscode.commands.registerCommand('swift-sim-runner.showOutput', () => {
    output.show();
  });

  context.subscriptions.push(disposable);
}

module.exports = {
  registerShowOutputCommand,
};
