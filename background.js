chrome.runtime.onInstalled.addListener(() => {
  console.log("Media Tab Controller Installed");
});

chrome.commands.onCommand.addListener((command) => {
  const match = command.match(/^toggleTab(\d)$/);
  if (match) {
    const tabIndex = parseInt(match[1], 10);
    toggleMediaForTab(tabIndex);
  }
});

async function toggleMediaForTab(tabIndex) {
  const tabs = await chrome.tabs.query({
    url: [
      '*://*.youtube.com/*',
      '*://*.twitch.tv/*',
    ]
  });

  if (tabs[tabIndex - 1]) {
    const tab = tabs[tabIndex - 1];
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          const media = document.querySelector('video, audio');
          if (media) {
            if (media.paused) {
              media.play();
              return true;
            } else {
              media.pause();
              return false;
            }
          }

          const playButton = document.querySelector('[data-a-target="player-play-pause-button"]');
          if (playButton) {
            playButton.click();
            return true;
          }

          return null;
        }
      });

      console.log(`Tab ${tabIndex} media toggled. Playing: ${result.result}`);
    } catch (e) {
      console.error("Error toggling media:", e);
    }
  } else {
    console.warn(`No media tab at index ${tabIndex}`);
  }
}
