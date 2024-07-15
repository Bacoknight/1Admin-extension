// Core functionality of the extension; pings the 1Admin server to update which applications the user is logged into
const ALARM_NAME = 'checkLogins';

console.log('Background script running');

// Initiate the state for the extension. On install, assume the user has no logins
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({ logins: [] });
    }
});

// Add listener for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'LOGINS_DETECTED') {
        chrome.storage.local.get('logins', ({ logins }) => {
            const newLogins = [...new Set([...logins, ...request.logins])];
            chrome.storage.local.set({ logins: newLogins });
        });
    }
});

// Create an alarm to trigger the logins check every minute.
async function createAlarm() {
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if (typeof alarm === 'undefined') {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: 1,
        periodInMinutes: 1440
      });
      refreshLogins();
    }
}

// Function to update the login list stored locally.
async function refreshLogins() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (tab) {
            chrome.tabs.sendMessage(tab.id ?? 0, { type: 'GET_LOGINS' }, (response) => {
                if (response && response.logins) {
                    chrome.storage.local.set({ logins: response.logins });
                }
            });
        }
    });
}

// Set up alarm and trigger login check on alarm event
createAlarm();
chrome.alarms.onAlarm.addListener(async () => {
    await refreshLogins();
});