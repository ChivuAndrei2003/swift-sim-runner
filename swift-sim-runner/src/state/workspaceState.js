const KEYS = {
  selectedScheme: 'swiftSimRunner.selectedScheme',
  selectedSimulatorUdid: 'swiftSimRunner.selectedSimulatorUdid',
};

function createWorkspaceState(context) {
  return {
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
