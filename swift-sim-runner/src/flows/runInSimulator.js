const { detectCurrentXcodeProject } = require("../core/projectDetector");

async function runInSimulator() {
  const detection = await detectCurrentXcodeProject();

  if (detection.error) {
    return {
      ok: false,
      level: "warning",
      phase: "detectProject",
      detection,
      message: detection.error,
    };
  }

  return {
    ok: false,
    level: "info",
    phase: "selectScheme",
    detection,
    message: `Project detected: ${detection.selectedContainer.name}. Next step: select scheme.`,
  };
}

module.exports = {
  runInSimulator,
};
