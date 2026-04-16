# Xcode CLI cheatsheet for Swift Sim Runner

Useful commands for running an iOS Swift app on Simulator from VS Code.

For the extension implementation, prefer JSON output and simulator UDIDs where possible.

## Check local Xcode setup

```bash
xcodebuild -version
xcode-select -p
xcrun --find simctl
```

## Find project / workspace / scheme

```bash
xcodebuild -list -project App.xcodeproj
xcodebuild -list -workspace MyApp.xcworkspace
```

JSON output is easier to parse from the extension:

```bash
xcodebuild -list -project App.xcodeproj -json
xcodebuild -list -workspace MyApp.xcworkspace -json
```

## Read build settings

Use this after choosing the project/workspace and scheme. It helps find the app path and bundle id without guessing.

```bash
xcodebuild -showBuildSettings -project App.xcodeproj -scheme App -json
xcodebuild -showBuildSettings -workspace MyApp.xcworkspace -scheme MyApp -json
```

Important values from the output:

```text
BUILT_PRODUCTS_DIR
CONFIGURATION_BUILD_DIR
FULL_PRODUCT_NAME
PRODUCT_BUNDLE_IDENTIFIER
TARGET_BUILD_DIR
WRAPPER_NAME
```

Typical app path:

```text
<BUILT_PRODUCTS_DIR>/<FULL_PRODUCT_NAME>
```

Example:

```text
/path/to/DerivedData/Build/Products/Debug-iphonesimulator/App.app
```

## Simulators and runtimes

Human-readable output:

```bash
xcrun simctl list devices
xcrun simctl list devices available
xcrun simctl list runtimes
xcrun simctl list devicetypes
```

JSON output for extension parsing:

```bash
xcrun simctl list devices available -j
xcrun simctl list devices booted -j
xcrun simctl list runtimes -j
xcrun simctl list devicetypes -j
```

Prefer simulator UDID over name because multiple devices can share the same display name.

## Boot simulator

By name:

```bash
xcrun simctl boot "iPhone 16 Pro"
xcrun simctl bootstatus "iPhone 16 Pro" -b
open -a Simulator
```

By UDID:

```bash
xcrun simctl boot <SIMULATOR_UDID>
xcrun simctl bootstatus <SIMULATOR_UDID> -b
open -a Simulator
```

## Build

Simple build by simulator name:

```bash
xcodebuild -project App.xcodeproj -scheme App -destination 'platform=iOS Simulator,name=iPhone 16 Pro' build
```

Recommended build for the extension:

```bash
xcodebuild \
  -project App.xcodeproj \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=<SIMULATOR_UDID>' \
  -derivedDataPath ./.swift-sim-runner/DerivedData \
  build
```

Workspace variant:

```bash
xcodebuild \
  -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=<SIMULATOR_UDID>' \
  -derivedDataPath ./.swift-sim-runner/DerivedData \
  build
```

## Locate built app

If using `-derivedDataPath ./.swift-sim-runner/DerivedData`, the app is usually under:

```text
./.swift-sim-runner/DerivedData/Build/Products/Debug-iphonesimulator/<AppName>.app
```

Safer option: use `xcodebuild -showBuildSettings -json` and combine:

```text
<BUILT_PRODUCTS_DIR>/<FULL_PRODUCT_NAME>
```

## Install / launch

Install on booted simulator:

```bash
xcrun simctl install booted /path/to/App.app
```

Launch by bundle id:

```bash
xcrun simctl launch booted com.example.App
```

Launch and stream basic console output:

```bash
xcrun simctl launch --console booted com.example.App
```

Terminate before running again:

```bash
xcrun simctl terminate booted com.example.App
```

Uninstall if the app state is broken:

```bash
xcrun simctl uninstall booted com.example.App
```

## App containers

App bundle container:

```bash
xcrun simctl get_app_container booted com.example.App app
```

Data container:

```bash
xcrun simctl get_app_container booted com.example.App data
```

## Logs

Stream logs for a process name:

```bash
xcrun simctl spawn booted log stream --predicate 'process == "App"'
```

Stream logs for a bundle id / subsystem:

```bash
xcrun simctl spawn booted log stream --predicate 'subsystem == "com.example.App"'
```

## Full extension flow

```text
1. Check Xcode:
   xcodebuild -version
   xcode-select -p

2. Detect project/workspace:
   *.xcworkspace preferred over *.xcodeproj when both exist.

3. List schemes:
   xcodebuild -list ... -json

4. List available simulators:
   xcrun simctl list devices available -j

5. Boot selected simulator:
   xcrun simctl boot <SIMULATOR_UDID>
   xcrun simctl bootstatus <SIMULATOR_UDID> -b
   open -a Simulator

6. Build:
   xcodebuild ... -destination 'platform=iOS Simulator,id=<SIMULATOR_UDID>' -derivedDataPath ... build

7. Find .app and bundle id:
   xcodebuild -showBuildSettings ... -json

8. Install:
   xcrun simctl install booted /path/to/App.app

9. Launch:
   xcrun simctl launch booted <PRODUCT_BUNDLE_IDENTIFIER>
```
