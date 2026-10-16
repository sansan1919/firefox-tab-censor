const SETTINGS_KEY = "tabCensorEnabled";
const toggleButton = document.getElementById("toggleBtn");
const statusText = document.getElementById("statusText");

async function renderToggleState() {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  const enabled = Boolean(result[SETTINGS_KEY]);

  toggleButton.textContent = enabled ? "Turn Censor Off" : "Turn Censor On";
  toggleButton.classList.toggle("is-active", enabled);
  statusText.textContent = enabled
    ? "Privacy mode is active."
    : "Privacy mode is off.";
}

toggleButton.addEventListener("click", async () => {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  const enabled = Boolean(result[SETTINGS_KEY]);
  const nextState = !enabled;

  await browser.storage.local.set({ [SETTINGS_KEY]: nextState });
  await browser.runtime.sendMessage({ type: "toggle", enabled: nextState });
  renderToggleState();
});

renderToggleState();