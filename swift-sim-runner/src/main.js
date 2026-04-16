const { registerCleanDerivedDataCommand } = require('./commands/cleanDerivedDataCommand');
const { registerDetectProjectCommand } = require('./commands/detectProjectCommand');
const { registerRunInSimulatorCommand } = require('./commands/runInSimulatorCommand');
const { registerSelectSchemeCommand } = require('./commands/selectSchemeCommand');
const { registerSelectSimulatorCommand } = require('./commands/selectSimulatorCommand');
const { registerShowOutputCommand } = require('./commands/showOutputCommand');
const { createWorkspaceState } = require('./state/workspaceState');
const { createSwiftSimOutputChannel } = require('./ui/output');
const { createRunStatusBarItem } = require('./ui/statusBar');

/**
 * @param {import('vscode').ExtensionContext} context
 */
function activate(context) {
  const output = createSwiftSimOutputChannel();
  const state = createWorkspaceState(context);
  const statusBar = createRunStatusBarItem();

  context.subscriptions.push(output, statusBar);

  const deps = {
    output,
    state,
    statusBar,
  };

  registerDetectProjectCommand(context, deps);
  registerRunInSimulatorCommand(context, deps);
  
  registerSelectSimulatorCommand(context, deps);
  
  registerSelectSchemeCommand(context, deps);
  registerShowOutputCommand(context, deps);
  
  registerCleanDerivedDataCommand(context, deps);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
