const KEYS = {
  selectedContainerPath: 'swiftSimRunner.selectedContainerPath',
  selectedScheme: 'swiftSimRunner.selectedScheme',
  selectedSimulatorUdid: 'swiftSimRunner.selectedSimulatorUdid',
};

function createWorkspaceState(context) {
  return {
    getSelectedContainerPath() {
      return context.workspaceState.get(KEYS.selectedContainerPath, '');
    },

    setSelectedContainerPath(containerPath) {
      return context.workspaceState.update(KEYS.selectedContainerPath, containerPath);
    },

    getSelectedScheme() {
      return context.workspaceState.get(KEYS.selectedScheme, '');
    },

    setSelectedScheme(scheme) {
      return context.workspaceState.update(KEYS.selectedScheme, scheme);
    },

    getSelectedSimulatorUdid() {
      return context.workspaceState.get(KEYS.selectedSimulatorUdid, '');
    },

    setSelectedSimulatorUdid(udid) {
      return context.workspaceState.update(KEYS.selectedSimulatorUdid, udid);
    },
  };
}

module.exports = {
  createWorkspaceState,
};
