const vscode = require("vscode");
const { runInSimulator } = require("../flows/runInSimulator");
const { writeDetectionToOutput } = require("../ui/output");
const { setStatusBarBusy, setStatusBarIdle } = require("../ui/statusBar");

function registerRunInSimulatorCommand(context, { output, state, statusBar }) {
  
  const disposable = vscode.commands.registerCommand(
    "swift-sim-runner.runInSimulator",
    async () => {
      setStatusBarBusy(statusBar, "Detecting project...");

      try {
        const result = await runInSimulator({ state });

        if (result.detection) {
          writeDetectionToOutput(output, result.detection);
        }

        output.show(true);

        if (!result.ok) {
          const showMessage =
            result.level === "warning"
              ? vscode.window.showWarningMessage
              : vscode.window.showInformationMessage;

          showMessage(result.message);
          return;
        }

        vscode.window.showInformationMessage(result.message);
      } catch (error) {
        output.appendLine(
          `[error] ${error instanceof Error ? error.stack : String(error)}`,
        );
        output.show(true);
        vscode.window.showErrorMessage(
          "Swift Sim Runner failed. See output for details.",
        );
      } finally {
        setStatusBarIdle(statusBar);
      }
    },
  );

  context.subscriptions.push(disposable);
}

module.exports = {
  registerRunInSimulatorCommand,
};
