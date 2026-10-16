const SETTINGS_KEY = "tabCensorEnabled";
const MASKED_TITLE = "🔒 [Protected Tab]";
const originalTitles = new Map();

async function readSetting() {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  return Boolean(result[SETTINGS_KEY]);
}

async function updateTabTitle(tabId) {
  const enabled = await readSetting();
  const tab = await browser.tabs.get(tabId).catch(() => null);

  if (!tab || typeof tab.id !== "number") {
    return;
  }

  if (enabled) {
    if (!originalTitles.has(tabId) && tab.title) {
      originalTitles.set(tabId, tab.title);
    }

    if (tab.title !== MASKED_TITLE) {
      await browser.tabs.update(tabId, { title: MASKED_TITLE });
    }
    return;
  }

  const originalTitle = originalTitles.get(tabId);
  if (originalTitle) {
    await browser.tabs.update(tabId, { title: originalTitle });
    originalTitles.delete(tabId);
  }
}

async function syncAllTabs() {
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (typeof tab.id === "number") {
      await updateTabTitle(tab.id);
    }
  }
}

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && Object.prototype.hasOwnProperty.call(changes, SETTINGS_KEY)) {
    syncAllTabs();
  }
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (typeof tabId !== "number" || !changeInfo.title) {
    return;
  }

  const enabled = await readSetting();
  if (!enabled) {
    return;
  }

  if (!originalTitles.has(tabId) && tab.title) {
    originalTitles.set(tabId, tab.title);
  }

  if (tab.title !== MASKED_TITLE) {
    await browser.tabs.update(tabId, { title: MASKED_TITLE });
  }
});

browser.tabs.onActivated.addListener(({ tabId }) => {
  updateTabTitle(tabId);
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggle") {
    browser.storage.local.set({ [SETTINGS_KEY]: Boolean(message.enabled) });
    sendResponse({ ok: true });
  }

  return true;
});

browser.storage.local.get(SETTINGS_KEY).then((result) => {
  if (result[SETTINGS_KEY] === undefined) {
    browser.storage.local.set({ [SETTINGS_KEY]: false });
  }
  syncAllTabs();
});
