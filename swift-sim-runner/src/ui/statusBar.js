const vscode = require("vscode");

function createRunStatusBarItem() {
  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );

  setStatusBarIdle(item);
  item.command = "swift-sim-runner.runInSimulator";
  item.tooltip = "Run Swift app in iOS Simulator";
  item.show();

  return item;
}


function setStatusBarIdle(item) {
  item.text = "$(play) Run iOS";
}


function setStatusBarBusy(item, label) {
  item.text = `$(sync~spin) ${label}`;
}

module.exports = {
  createRunStatusBarItem,
  setStatusBarBusy,
  setStatusBarIdle,
};
