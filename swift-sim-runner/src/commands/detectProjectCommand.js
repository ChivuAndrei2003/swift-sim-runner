const vscode = require("vscode");
const { detectCurrentXcodeProject } = require("../core/projectDetector");
const { writeDetectionToOutput } = require("../ui/output");

function registerDetectProjectCommand(context, { output }) {
  
  const disposable = vscode.commands.registerCommand(
    "swift-sim-runner.detectProject",
    async () => {
      await handleDetectProject({ output });
    },
  );

  context.subscriptions.push(disposable);
}

async function handleDetectProject({ output }) {
  
  const detection = await detectCurrentXcodeProject();

  writeDetectionToOutput(output, detection);
  output.show(true);

  if (detection.error) {
    vscode.window.showWarningMessage(detection.error);
    return;
  }
  if (detection.containers.length > 1) {
    
  }

  vscode.window.showInformationMessage(
    `Detected ${detection.selectedContainer.name} in ${detection.workspaceFolder.name}.`,
  );
}

module.exports = {
  registerDetectProjectCommand,
};
