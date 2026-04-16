const vscode = require("vscode");
const { detectCurrentXcodeProject } = require("../core/projectDetector");
const { writeDetectionToOutput } = require("../ui/output");

function registerDetectProjectCommand(context, { output, state }) {
  
  const disposable = vscode.commands.registerCommand(
    "swift-sim-runner.detectProject",
    async () => {
      await handleDetectProject({ output, state });
    },
  );

  context.subscriptions.push(disposable);
}

async function handleDetectProject({ output, state }) {
  
  const detection = await detectCurrentXcodeProject({
    selectedContainerPath: state.getSelectedContainerPath(),
  });

  if (detection.error) {
    writeDetectionToOutput(output, detection);
    output.show(true);
    vscode.window.showWarningMessage(detection.error);
    return;
  }

  let selectedContainer = detection.selectedContainer;

  if (detection.containers.length > 1) {
    const selectedItem = await vscode.window.showQuickPick(
      detection.containers.map((container) => ({
        label: container.name,
        description:
          container.type === "workspace" ? ".xcworkspace" : ".xcodeproj",
        detail: container.fsPath,
        container,
      })),
      {
        title: "Select Xcode Project",
        placeHolder: "Choose the Xcode workspace or project to use",
      },
    );

    if (!selectedItem) {
      vscode.window.showInformationMessage(
        "Xcode project selection cancelled.",
      );
      return;
    }

    selectedContainer = selectedItem.container;
  }

  await state.setSelectedContainerPath(selectedContainer.fsPath);

  const finalDetection = {
    ...detection,
    selectedContainer,
  };

  writeDetectionToOutput(output, finalDetection);
  output.show(true);

  vscode.window.showInformationMessage(
    `Detected ${selectedContainer.name} in ${detection.workspaceFolder.name}.`,
  );
}

module.exports = {
  registerDetectProjectCommand,
};
