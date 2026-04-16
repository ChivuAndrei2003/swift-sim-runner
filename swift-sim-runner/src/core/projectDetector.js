const path = require('path');
const vscode = require('vscode');

const XCODE_SEARCH_EXCLUDE =
  '**/{.git,node_modules,Pods,DerivedData,.build,build,.swift-sim-runner}/**';

function getCurrentWorkspaceFolder() {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }

  const activeEditorUri = vscode.window.activeTextEditor?.document?.uri;

  if (activeEditorUri) {
    const activeWorkspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditorUri);

    if (activeWorkspaceFolder) {
      return activeWorkspaceFolder;
    }
  }

  return workspaceFolders[0];
}

async function findXcodeContainers(workspaceFolder) {
  const workspaces = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceFolder, '**/*.xcworkspace'),
    XCODE_SEARCH_EXCLUDE,
    20
  );

  const projects = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspaceFolder, '**/*.xcodeproj'),
    XCODE_SEARCH_EXCLUDE,
    20
  );

  return [
    ...workspaces.map((uri) => createContainer('workspace', uri)),
    ...projects.map((uri) => createContainer('project', uri)),
  ].sort(compareContainers);
}

async function detectCurrentXcodeProject(options = {}) {
  const workspaceFolder = getCurrentWorkspaceFolder();

  if (!workspaceFolder) {
    return {
      workspaceFolder: undefined,
      selectedContainer: undefined,
      containers: [],
      error: 'Open a folder or workspace before running Swift Sim Runner.',
    };
  }

  const containers = await findXcodeContainers(workspaceFolder);
  const selectedContainer =
    containers.find((item) => item.fsPath === options.selectedContainerPath) ??
    containers.find((item) => item.type === 'workspace') ??
    containers[0];

  return {
    workspaceFolder: {
      name: workspaceFolder.name,
      fsPath: workspaceFolder.uri.fsPath,
      uri: workspaceFolder.uri,
    },
    selectedContainer,
    containers,
    error: selectedContainer
      ? undefined
      : `No .xcworkspace or .xcodeproj found in ${workspaceFolder.name}.`,
  };
}

function createContainer(type, uri) {
  return {
    type,
    name: path.basename(uri.fsPath),
    fsPath: uri.fsPath,
    uri,
  };
}

function compareContainers(a, b) {
  if (a.type !== b.type) {
    return a.type === 'workspace' ? -1 : 1;
  }

  return a.fsPath.localeCompare(b.fsPath);
}

module.exports = {
  detectCurrentXcodeProject,
  findXcodeContainers,
  getCurrentWorkspaceFolder,
};
