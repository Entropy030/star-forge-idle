import re

with open('src/core/state.js', 'r') as f:
    content = f.read()

# 1. Remove Viewport import
content = re.sub(r"import\s*\{\s*Viewport\s*\}\s*from\s*'\.\./ui/viewport\.js';\s*\n", '', content)

# 2. Refactor loadGame Viewport usage
content = re.sub(
r"""      setTimeout\(\(\) => \{
        Viewport\.showToast\(`✨ WELCOME BACK: Universe simulated \$\{timeStr\} of offline cosmic progression!`, "info"\);
      \}, 500\);
    \}
  \} catch \(e\) \{""",
r"""      return { offlineTimeStr: timeStr };
    }
    return { offlineTimeStr: null };
  } catch (e) {""", content)

# 3. Refactor exportSave Viewport usage
content = re.sub(
r"""export const exportSave = function\(\) \{
  saveGame\(\);
  let rawData = localStorage\.getItem\('starForgeSave_v15'\);
  if \(rawData\) \{
    let encoded = btoa\(rawData\);
    navigator\.clipboard\.writeText\(encoded\)\.then\(\(\) => Viewport\.showToast\("Universe encrypted to clipboard!", "success"\)\)
      \.catch\(\(\) => Viewport\.showToast\("Clipboard write permission blocked\.", "warning"\)\);
  \}
\}""",
r"""export const exportSave = function() {
  saveGame();
  let rawData = localStorage.getItem('starForgeSave_v15');
  if (rawData) {
    let encoded = btoa(rawData);
    return navigator.clipboard.writeText(encoded)
      .then(() => ({ success: true, message: "Universe encrypted to clipboard!" }))
      .catch(() => ({ success: false, message: "Clipboard write permission blocked." }));
  }
  return Promise.resolve({ success: false, message: "No save data found." });
}""", content)

# 4. Refactor importSave Viewport usage
content = re.sub(
r"""export const importSave = function\(\) \{
  let input = document\.getElementById\('import-string'\)\.value\.trim\(\);
  if \(\!input\) return;
  try \{
    let decoded = atob\(input\);
    let parsed = JSON\.parse\(decoded\);
    if \(parsed && parsed\.version === SAVE_VERSION\) \{
      let temp = gameState;
      try \{
        gameState = createReactiveState\(deserializeState\(parsed\.gameState\), \(prop\) => \{
          isDirty = true;
        \}\);
        ensureStateShape\(\);
        localStorage\.setItem\('starForgeSave_v15', decoded\);
        location\.reload\(\);
      \} finally \{
        gameState = temp;
      \}
    \} else \{ Viewport\.showToast\("Unsupported timeline formatting configuration\.", "warning"\); \}
  \} catch \(e\) \{ Viewport\.showToast\("Fatal transmission verification corruption\.", "critical"\); \}
\}""",
r"""export const importSave = function(input) {
  if (!input) return { success: false, message: "No input provided." };
  try {
    let decoded = atob(input);
    let parsed = JSON.parse(decoded);
    if (parsed && parsed.version === SAVE_VERSION) {
      let temp = gameState;
      try {
        gameState = createReactiveState(deserializeState(parsed.gameState), (prop) => {
          isDirty = true;
        });
        ensureStateShape();
        localStorage.setItem('starForgeSave_v15', decoded);
        return { success: true };
      } finally {
        gameState = temp;
      }
    } else { return { success: false, message: "Unsupported timeline formatting configuration." }; }
  } catch (e) { return { success: false, message: "Fatal transmission verification corruption." }; }
}""", content)

with open('src/core/state.js', 'w') as f:
    f.write(content)

print("State refactored")
