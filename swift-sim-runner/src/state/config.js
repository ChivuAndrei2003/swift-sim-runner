const vscode = require('vscode');

function getSwiftSimRunnerConfig() {
  const config = vscode.workspace.getConfiguration('swiftSimRunner');

  return {
    defaultScheme: config.get('defaultScheme', ''),
    defaultSimulatorUdid: config.get('defaultSimulatorUdid', ''),
    derivedDataPath: config.get('derivedDataPath', '.swift-sim-runner/DerivedData'),
    openSimulatorApp: config.get('openSimulatorApp', true),
    launchWithConsole: config.get('launchWithConsole', false),
  };
}

module.exports = {
  getSwiftSimRunnerConfig,
};
