function getFavicon(url) {
  const domain = new URL(url).hostname;
  if (domain.includes('youtube')) return chrome.runtime.getURL('icons/youtube.png');
  if (domain.includes('twitch')) return chrome.runtime.getURL('icons/twitch.png'); 
  return chrome.runtime.getURL('icons/icon16.png'); 
}

async function toggleVideo(tab) {
  const [result] = await browser.scripting.executeScript({
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
      return null;
    }
  });
  return result?.result;
}

async function listMediaTabs() {
  const container = document.getElementById('tabList');
  const tabs = await browser.tabs.query({
    url: [
      '*://*.youtube.com/*',
      '*://*.twitch.tv/*',
    ]
  });

  if (!tabs.length) {
    container.textContent = 'No media tabs found.';
    return;
  }

  container.innerHTML = '';
  tabs.forEach(tab => {
    const div = document.createElement('div');
    div.className = 'tab-entry';

    const icon = document.createElement('img');
    icon.className = 'tab-icon';
    icon.src = getFavicon(tab.url);

    const info = document.createElement('div');
    info.className = 'tab-info';
    info.innerHTML = `<div>${tab.title}</div>`; 

    const btnIcon = document.createElement('img');
    btnIcon.src = 'icons/play.png';
    btnIcon.alt = 'Toggle';
    btnIcon.className = 'player-icon';

    div.addEventListener('click', async () => {
      const isPlaying = await toggleVideo(tab);
      if (isPlaying === true) {
        btnIcon.src = 'icons/pause.png';
      } else if (isPlaying === false) {
        btnIcon.src = 'icons/play.png';
      }
    });

    div.appendChild(icon);
    div.appendChild(info);
    div.appendChild(btnIcon);
    container.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup loaded');
  listMediaTabs();
});
