function getBuildSetting(buildSettings, key) {
  return buildSettings?.buildSettings?.[key] ?? buildSettings?.[key] ?? '';
}

function getBuiltAppPath(buildSettings) {
  const builtProductsDir = getBuildSetting(buildSettings, 'BUILT_PRODUCTS_DIR');
  const fullProductName = getBuildSetting(buildSettings, 'FULL_PRODUCT_NAME');

  if (!builtProductsDir || !fullProductName) {
    return '';
  }

  return `${builtProductsDir}/${fullProductName}`;
}

function getBundleIdentifier(buildSettings) {
  return getBuildSetting(buildSettings, 'PRODUCT_BUNDLE_IDENTIFIER');
}

module.exports = {
  getBuildSetting,
  getBuiltAppPath,
  getBundleIdentifier,
};
