const SETTINGS_KEY = "tabCensorEnabled";
const MASKED_PAGE_TITLE = "🔒 [Protected Tab]";

async function applyTitleMask() {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  const enabled = Boolean(result[SETTINGS_KEY]);

  if (!enabled) {
    return;
  }

  if (!document.title.includes("[Protected]")) {
    document.title = `${MASKED_PAGE_TITLE} ${document.title}`;
  }
}

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && Object.prototype.hasOwnProperty.call(changes, SETTINGS_KEY)) {
    applyTitleMask();
  }
});

applyTitleMask();