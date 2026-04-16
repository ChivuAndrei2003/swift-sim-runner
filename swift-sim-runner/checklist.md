# Swift Sim Runner

Swift Sim Runner is a VS Code extension for macOS that runs an iOS Swift app on an iOS Simulator without manually typing the same `xcodebuild` and `simctl` commands in the terminal.

The goal of this project is also educational: build a real VS Code extension step by step, while learning how VS Code APIs, Xcode CLI tools, and iOS Simulator commands fit together.

## MVP Goal

The first useful version should do this:

```text
1. Detect the current VS Code workspace.
2. Find the .xcworkspace or .xcodeproj.
3. Let the user choose an Xcode scheme.
4. Let the user choose an iOS Simulator device.
5. Build the app for that simulator.
6. Locate the generated .app.
7. Install the .app on the simulator.
8. Launch the app.
9. Show useful logs in a VS Code Output Channel.
```

## Current Architecture

```text
src/
  main.js
  commands/
  core/
  flows/
  services/
  state/
  ui/
  utils/
```

### Folder Responsibilities

`src/main.js`

Extension entrypoint. It should stay small. Its job is to create shared objects and register commands.

`src/commands/`

VS Code command handlers. These files talk to VS Code APIs like `showQuickPick`, `showInformationMessage`, and `registerCommand`.

`src/flows/`

High-level orchestration. For example, `runInSimulator.js` should coordinate project detection, scheme selection, simulator selection, build, install, and launch.

`src/services/`

Wrappers around external CLI tools:

```text
xcode.js      -> xcodebuild
simulator.js  -> xcrun simctl
```

`src/core/`

Core logic that should not care much about VS Code UI. Examples: project detection, build settings parsing, app path resolution.

`src/ui/`

Reusable VS Code UI helpers: Output Channel, Status Bar, QuickPick formatting.

`src/state/`

Saved user choices and extension settings. Use `workspaceState` for project-specific choices like selected scheme and selected simulator UDID.

`src/utils/`

Small generic helpers. `runCommand.js` should become the shared process runner.

## Implementation Checklist

### 1. Workspace and Project Detection

- [x] Detect the current VS Code workspace folder.
- [x] Search for `.xcworkspace` and `.xcodeproj`.
- [x] Prefer `.xcworkspace` over `.xcodeproj` when both exist.
- [x] Add `Swift Sim Runner: Detect Project`.
- [] If multiple Xcode containers exist, show a QuickPick and let the user choose one.
- [ ] Save the selected container in `workspaceState`.

Why this matters:

An iOS project can contain both `MyApp.xcodeproj` and `MyApp.xcworkspace`. If CocoaPods or other workspace-based setup is used, building the workspace is usually the correct choice.

Files to work on:

```text
src/core/projectDetector.js
src/commands/detectProjectCommand.js
src/state/workspaceState.js
```

Useful VS Code APIs:

```js
vscode.workspace.workspaceFolders
vscode.workspace.findFiles()
vscode.window.showQuickPick()
```

Cum implementezi:

1. Porneste din `detectProjectCommand.js`, pentru ca aceasta comanda este cea mai simpla de testat manual.
2. Apeleaza `detectCurrentXcodeProject()` din `projectDetector.js`.
3. In `projectDetector.js`, ia workspace-ul curent din `vscode.workspace.workspaceFolders`.
4. Daca exista un fisier deschis in editor, verifica daca acel fisier apartine unui workspace folder si foloseste acel folder.
5. Cauta fisiere cu extensia `.xcworkspace` si `.xcodeproj` folosind `vscode.workspace.findFiles()`.
6. Daca gasesti si workspace si project, alege automat `.xcworkspace`, pentru ca proiectele cu CocoaPods sau alte integrari se construiesc de obicei prin workspace.
7. Scrie rezultatul in Output Channel ca sa poti vedea exact ce a gasit extensia.
8. Dupa ce varianta simpla merge, adauga QuickPick doar pentru cazul in care exista mai multe proiecte Xcode in acelasi folder.
9. Cand userul alege manual un container, salveaza path-ul in `workspaceState`, ca extensia sa-l poata refolosi la urmatorul run.

### 2. Xcode Scheme Selection

- [ ] Implement `services/xcode.js`.
- [ ] Run `xcodebuild -list ... -json`.
- [ ] Parse available schemes.
- [ ] Show schemes in QuickPick.
- [ ] Save selected scheme in `workspaceState`.
- [ ] Reuse saved scheme on the next run.
- [ ] If saved scheme no longer exists, ask the user again.

Why this matters:

The `.xcodeproj` name is not always the app target or runnable scheme. A project can have schemes like `App`, `App Dev`, `App Staging`, and `AppTests`.

Commands:

```bash
xcodebuild -list -project App.xcodeproj -json
xcodebuild -list -workspace MyApp.xcworkspace -json
```

Files to work on:

```text
src/services/xcode.js
src/commands/selectSchemeCommand.js
src/state/workspaceState.js
```

Cum implementezi:

1. In `xcode.js`, creeaza o functie `listSchemes(container)` care primeste containerul detectat.
2. Daca `container.type` este `workspace`, construieste comanda cu `-workspace`.
3. Daca `container.type` este `project`, construieste comanda cu `-project`.
4. Ruleaza `xcodebuild -list ... -json` folosind viitorul helper `runCommand()`.
5. Parseaza JSON-ul intors de Xcode si extrage lista de scheme.
6. In `selectSchemeCommand.js`, transforma fiecare schema intr-un item pentru `vscode.window.showQuickPick()`.
7. Cand userul selecteaza o schema, salveaz-o in `workspaceState`.
8. Inainte sa intrebi userul din nou, verifica daca exista deja o schema salvata.
9. Daca schema salvata nu mai apare in lista curenta, sterge-o sau ignora-o si afiseaza QuickPick din nou.
10. Testeaza manual cu un proiect care are o singura schema, apoi cu unul care are mai multe scheme.

### 3. Simulator Selection

- [ ] Implement `services/simulator.js`.
- [ ] Run `xcrun simctl list devices available -j`.
- [ ] Parse simulator devices.
- [ ] Show devices in QuickPick.
- [ ] Display device name, iOS version, and boot state.
- [ ] Save selected simulator UDID in `workspaceState`.
- [ ] Prefer UDID over simulator name in all commands.

Why this matters:

Simulator names are not unique. A user can have multiple `iPhone 15` simulators with different iOS versions. UDID is the reliable identifier.

Command:

```bash
xcrun simctl list devices available -j
```

Good QuickPick display:

```text
iPhone 16 Pro        iOS 18.5 - Shutdown
iPhone 15            iOS 17.5 - Booted
iPad Pro 13-inch     iOS 18.5 - Shutdown
```

Files to work on:

```text
src/services/simulator.js
src/commands/selectSimulatorCommand.js
src/ui/quickPick.js
src/state/workspaceState.js
```

Cum implementezi:

1. In `simulator.js`, creeaza o functie `listAvailableDevices()`.
2. Ruleaza `xcrun simctl list devices available -j`.
3. Parseaza JSON-ul. Output-ul este grupat pe runtime-uri, deci trebuie sa parcurgi fiecare runtime si lista lui de devices.
4. Pentru fiecare device, pastreaza `name`, `udid`, `state` si versiunea de iOS dedusa din runtime.
5. Creeaza o lista plata de device-uri, nu o structura grupata, ca sa fie mai usor de afisat in QuickPick.
6. Sorteaza lista cu device-urile booted primele, apoi iPhone-urile, apoi iPad-urile, apoi dupa versiunea iOS.
7. In `selectSimulatorCommand.js`, afiseaza lista cu `showQuickPick()`.
8. In itemul de QuickPick, pune numele simulatorului in `label`, versiunea iOS si starea in `description`, iar UDID-ul in `detail`.
9. Cand userul alege simulatorul, salveaza `udid` in `workspaceState`.
10. In toate comenzile `simctl`, foloseste UDID-ul, nu numele device-ului.

### 4. Shared Command Runner

- [ ] Implement `utils/runCommand.js` using `child_process.spawn`.
- [ ] Stream stdout and stderr to the Output Channel.
- [ ] Return exit code, stdout, and stderr.
- [ ] Support commands with arguments as arrays, not one big shell string.
- [ ] Surface readable errors when a command fails.

Why this matters:

`xcodebuild` can output a lot of text. Using `spawn` lets the extension show progress while the command is running.

Prefer this shape:

```js
runCommand('xcodebuild', ['-list', '-project', 'App.xcodeproj', '-json']);
```

Avoid this shape:

```js
runCommand('xcodebuild -list -project App.xcodeproj -json');
```

Files to work on:

```text
src/utils/runCommand.js
src/ui/output.js
```

Cum implementezi:

1. In `runCommand.js`, importa `spawn` din `child_process`.
2. Creeaza o functie `runCommand(command, args, options)`.
3. Porneste procesul cu `spawn(command, args, { cwd, env })`.
4. Asculta `stdout.on('data')` si adauga textul primit intr-un buffer `stdout`.
5. Asculta `stderr.on('data')` si adauga textul primit intr-un buffer `stderr`.
6. Daca primesti un `output` in options, scrie stdout si stderr si in Output Channel.
7. Cand procesul se inchide, rezolva promisiunea cu `{ code, stdout, stderr }`.
8. Daca procesul iese cu exit code diferit de `0`, arunca o eroare sau intoarce un rezultat clar marcat ca failed.
9. Nu executa comenzi ca string complet. Pastreaza comanda si argumentele separate, ca sa eviti probleme de escaping.
10. Testeaza intai cu o comanda simpla, de exemplu `xcodebuild -version`, inainte sa o folosesti pentru build.

### 5. Build Settings Parsing

- [ ] Run `xcodebuild -showBuildSettings -json`.
- [ ] Extract `BUILT_PRODUCTS_DIR`.
- [ ] Extract `FULL_PRODUCT_NAME`.
- [ ] Extract `PRODUCT_BUNDLE_IDENTIFIER`.
- [ ] Build the final `.app` path.

Why this matters:

Do not guess where Xcode placed the `.app`. Ask Xcode through build settings.

Command:

```bash
xcodebuild -showBuildSettings -project App.xcodeproj -scheme App -json
```

Important keys:

```text
BUILT_PRODUCTS_DIR
FULL_PRODUCT_NAME
PRODUCT_BUNDLE_IDENTIFIER
PRODUCT_NAME
WRAPPER_NAME
```

Files to work on:

```text
src/services/xcode.js
src/core/buildSettings.js
src/core/appLocator.js
```

Cum implementezi:

1. In `xcode.js`, adauga o functie `showBuildSettings(container, scheme)`.
2. Construieste argumentele pentru `xcodebuild -showBuildSettings ... -json`.
3. Ruleaza comanda dupa ce ai deja proiectul si schema selectate.
4. Parseaza JSON-ul primit. Xcode intoarce de obicei o lista de obiecte, nu un singur obiect.
5. Alege entry-ul care corespunde schemei/targetului aplicatiei. Pentru MVP poti incepe cu primul entry care are `PRODUCT_BUNDLE_IDENTIFIER`.
6. In `buildSettings.js`, creeaza functii mici care citesc valori precum `BUILT_PRODUCTS_DIR`, `FULL_PRODUCT_NAME` si `PRODUCT_BUNDLE_IDENTIFIER`.
7. In `appLocator.js`, foloseste `BUILT_PRODUCTS_DIR` plus `FULL_PRODUCT_NAME` ca sa obtii path-ul final catre `.app`.
8. Daca lipseste una dintre valori, intoarce o eroare clara, nu incerca sa ghicesti.
9. Afiseaza in Output Channel app path-ul si bundle id-ul detectat, ca sa poti verifica manual.

### 6. Build For Simulator

- [ ] Build using `xcodebuild`.
- [ ] Use `-sdk iphonesimulator`.
- [ ] Use `-destination platform=iOS Simulator,id=<UDID>`.
- [ ] Use a controlled `-derivedDataPath`.
- [ ] Write build output to the Output Channel.
- [ ] Show a clear error when build fails.

Command:

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

Files to work on:

```text
src/services/xcode.js
src/flows/runInSimulator.js
src/state/config.js
```

Cum implementezi:

1. In `config.js`, citeste `swiftSimRunner.derivedDataPath`.
2. In `xcode.js`, creeaza o functie `buildForSimulator({ container, scheme, simulatorUdid, derivedDataPath })`.
3. Construieste argumentele pentru `xcodebuild` in functie de tipul containerului: `-workspace` sau `-project`.
4. Adauga `-configuration Debug`, `-sdk iphonesimulator` si `-destination platform=iOS Simulator,id=<UDID>`.
5. Adauga `-derivedDataPath`, ca build-ul sa fie intr-un loc controlat de extensie.
6. Ruleaza comanda prin `runCommand()`, cu streaming in Output Channel.
7. In `runInSimulator.js`, seteaza statusul la `Building...` inainte de build.
8. Daca build-ul reuseste, continua catre localizarea `.app`.
9. Daca build-ul pica, opreste flow-ul, arata notificare scurta si lasa detaliile in Output Channel.
10. Nu incerca sa instalezi aplicatia daca build-ul a esuat.

### 7. Boot, Install, and Launch

- [ ] Boot the selected simulator.
- [ ] Wait until boot finishes.
- [ ] Open the Simulator app if configured.
- [ ] Install the built `.app`.
- [ ] Launch the app by bundle id.
- [ ] Optionally terminate the app before launching again.

Commands:

```bash
xcrun simctl boot <SIMULATOR_UDID>
xcrun simctl bootstatus <SIMULATOR_UDID> -b
open -a Simulator
xcrun simctl install <SIMULATOR_UDID> /path/to/App.app
xcrun simctl launch <SIMULATOR_UDID> com.example.App
```

Files to work on:

```text
src/services/simulator.js
src/flows/runInSimulator.js
```

Cum implementezi:

1. In `simulator.js`, creeaza functii separate: `bootDevice()`, `waitForBoot()`, `installApp()`, `launchApp()` si optional `terminateApp()`.
2. Pentru boot, ruleaza `xcrun simctl boot <UDID>`.
3. Daca simulatorul este deja booted, nu trata asta ca eroare fatala. Poti continua.
4. Dupa boot, ruleaza `xcrun simctl bootstatus <UDID> -b` ca sa astepti pana cand device-ul este gata.
5. Daca setarea `openSimulatorApp` este true, ruleaza `open -a Simulator`.
6. Instaleaza aplicatia cu `xcrun simctl install <UDID> <appPath>`.
7. Lanseaza aplicatia cu `xcrun simctl launch <UDID> <bundleId>`.
8. Daca `launchWithConsole` este true, foloseste `simctl launch --console`.
9. Scrie fiecare comanda importanta in Output Channel, ca userul sa inteleaga ce face extensia.
10. Daca install sau launch esueaza, afiseaza eroare scurta si pastreaza output-ul complet pentru debugging.

### 8. Complete Run Flow

- [ ] Connect all previous steps in `flows/runInSimulator.js`.
- [ ] Reuse saved scheme and simulator when valid.
- [ ] Ask the user only when required.
- [ ] Update Status Bar text during each phase.
- [ ] Show Output Channel on failures.
- [ ] Keep success messages short.

Suggested phases:

```text
detectProject
selectScheme
selectSimulator
bootSimulator
build
locateApp
install
launch
done
```

Files to work on:

```text
src/flows/runInSimulator.js
src/commands/runInSimulatorCommand.js
src/ui/statusBar.js
src/ui/output.js
```

Cum implementezi:

1. In `runInSimulator.js`, trateaza flow-ul ca o lista de pasi executati in ordine.
2. Primul pas este detectarea proiectului. Daca nu gasesti proiect, opreste flow-ul.
3. Al doilea pas este schema. Daca exista schema valida salvata, foloseste-o. Altfel cere una prin QuickPick.
4. Al treilea pas este simulatorul. Daca exista UDID valid salvat, foloseste-l. Altfel cere unul prin QuickPick.
5. Booteaza simulatorul si asteapta boot-ul complet.
6. Ruleaza build-ul.
7. Citeste build settings si gaseste `.app` path plus bundle id.
8. Instaleaza `.app` pe simulator.
9. Lanseaza aplicatia.
10. Intoarce catre command handler un rezultat simplu: success sau failure, plus un mesaj scurt.
11. Lasa `runInSimulatorCommand.js` sa se ocupe de notificari si status bar, nu flow-ul.
12. Pastreaza Output Channel-ul ca jurnal complet al rularii.

### 9. Settings and State

- [ ] Read extension settings from `vscode.workspace.getConfiguration`.
- [ ] Store selected scheme in `workspaceState`.
- [ ] Store selected simulator UDID in `workspaceState`.
- [ ] Keep workspace choices separate from global settings.

Current settings:

```json
{
  "swiftSimRunner.defaultScheme": "",
  "swiftSimRunner.defaultSimulatorUdid": "",
  "swiftSimRunner.derivedDataPath": ".swift-sim-runner/DerivedData",
  "swiftSimRunner.openSimulatorApp": true,
  "swiftSimRunner.launchWithConsole": false
}
```

Files to work on:

```text
src/state/config.js
src/state/workspaceState.js
```

Cum implementezi:

1. Foloseste `config.js` pentru setari declarate in `package.json`.
2. Citeste setarile cu `vscode.workspace.getConfiguration('swiftSimRunner')`.
3. Foloseste `workspaceState.js` pentru alegeri facute de user in proiectul curent.
4. Salveaza schema aleasa cu `context.workspaceState.update(...)`.
5. Salveaza simulatorul ales tot in `workspaceState`, folosind UDID-ul.
6. La fiecare run, verifica intai setarile explicite din VS Code.
7. Daca nu exista setare explicita, verifica `workspaceState`.
8. Daca nu exista nici acolo, intreaba userul prin QuickPick.
9. Nu scrie automat in `.vscode/settings.json` fara ca userul sa ceara asta.
10. Pastreaza cheia pentru fiecare valoare intr-un singur loc, ca sa nu scrii string-uri duplicate prin proiect.

### 10. UX Polish

- [ ] Add a Status Bar button: `$(play) Run iOS`.
- [ ] Change status while running: `$(sync~spin) Building...`.
- [ ] Add useful Output Channel logs.
- [ ] Avoid noisy notifications.
- [ ] Use notifications only for success, warning, or failure summaries.
- [ ] Add helpful messages when Xcode or Simulator tools are missing.

Files to work on:

```text
src/ui/statusBar.js
src/ui/output.js
src/commands/*
```

Cum implementezi:

1. Pastreaza Status Bar-ul simplu: `Run iOS` cand extensia este idle.
2. Cand flow-ul ruleaza, schimba textul in functie de pas: `Detecting...`, `Building...`, `Launching...`.
3. Foloseste notificari doar pentru lucruri importante: succes, warning sau eroare.
4. Nu pune output mare in notificari. Trimite detaliile in Output Channel.
5. In Output Channel, prefixeaza liniile importante cu faza curenta, de exemplu `[build]` sau `[simulator]`.
6. Cand apare o eroare, mesajul scurt trebuie sa spuna ce a picat si unde se vad detaliile.
7. Pentru QuickPick, foloseste label-uri clare si scurte.
8. Pentru simulator, arata nume, versiune iOS, stare si UDID.
9. Pentru scheme, arata doar numele schemei la inceput. Detalii suplimentare pot veni mai tarziu.
10. Testeaza UX-ul in Extension Development Host dupa fiecare comanda implementata.

### 11. Tests

- [ ] Unit test pure parsing logic first.
- [ ] Test build settings parsing.
- [ ] Test simulator JSON parsing.
- [ ] Test app path resolution.
- [ ] Keep VS Code integration tests for later.

Good first test targets:

```text
src/core/buildSettings.js
src/core/appLocator.js
src/services/simulator.js parser functions
src/services/xcode.js parser functions
```

Why this matters:

You do not need to test Xcode itself. Test your parsing and decision logic.

Cum implementezi:

1. Incepe cu functii pure, pentru ca sunt cel mai usor de testat.
2. Pentru `buildSettings.js`, creeaza obiecte fake care seamana cu output-ul de la Xcode.
3. Testeaza ca `getBuiltAppPath()` intoarce path-ul corect cand exista `BUILT_PRODUCTS_DIR` si `FULL_PRODUCT_NAME`.
4. Testeaza ca functiile intorc string gol sau eroare clara cand lipsesc date.
5. Pentru parserul de simulatoare, salveaza un exemplu mic de JSON de la `simctl` si verifica lista finala de devices.
6. Nu porni Simulatorul real in unit tests.
7. Nu rula `xcodebuild` real in unit tests.
8. Pentru comenzile reale, foloseste testare manuala in Extension Development Host.
9. Dupa ce flow-ul devine stabil, poti adauga teste de integrare VS Code.

## Learning Notes

Start with small vertical slices:

```text
1. Make one command work.
2. Print useful output.
3. Save one user choice.
4. Connect the next CLI command.
5. Repeat.
```

Do not try to build the entire extension in one pass. For this project, the best learning path is to implement one command at a time and verify it manually in the Extension Development Host.

## How To Run While Developing

From this extension project:

```bash
npm install
npm run lint
```

Then open the project in VS Code and press `F5`. In the Extension Development Host window, open an iOS Swift project and run:

```text
Swift Sim Runner: Detect Project
Swift Sim Runner: Run in Simulator
```

At the current stage, `Run in Simulator` only detects the project and stops at the next planned step: scheme selection.
