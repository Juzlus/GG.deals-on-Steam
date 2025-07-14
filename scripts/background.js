const version = "1.0";
const type = "firefox";

fetch('https://raw.githubusercontent.com/Juzlus/GG.deals-on-Steam/refs/heads/server/versions.json')
    .then(response => response?.ok ? response.json() : null)
    .then(data => {
        if (!data) return;
        if (data[`version_${type}`] == version) return;
        chrome.notifications.create('updateNotification', {
            title: "GG.deals on Steam",
            message: 'New version available. Click the button below!',
            priority: 1,
            iconUrl: 'https://github.com/Juzlus/GG.deals-on-Steam/blob/server/icons/2048.png?raw=true',
            type: 'basic',
            buttons: [{ title: 'See Release' }, { title: 'Download' }]
        });

        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            if (notificationId != "updateNotification") return;
            if (buttonIndex == 0)
                chrome.tabs.create({url: "https://github.com/Juzlus/GG.deals-on-Steam/releases/latest/"});
            else
                chrome.tabs.create({url: `https://github.com/Juzlus/GG.deals-on-Steam/releases/latest/download/GG.deals_on_Steam_v${data?.version}_${type}.zip`});
        });
    });

function createCustomNotification(message) {
    chrome.notifications.create('429Notification', {
        title: "GG.deals on Steam",
        message: message,
        priority: 1,
        iconUrl: 'https://github.com/Juzlus/GG.deals-on-Steam/blob/server/icons/2048.png?raw=true',
        type: 'basic',
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "fetch")
        fetch(message.url)
            .then(response => {
                if (response?.status == 429)
                    createCustomNotification("You can fetch prices info only for 1000 games per hour. Try again later.");
                else if (response?.status == 400)
                    createCustomNotification("Invalid API key.");
                const headers = {
                    limit: response?.headers?.get('x-ratelimit-limit'),
                    remaining: response?.headers?.get('x-ratelimit-remaining'),
                    reset: response?.headers?.get('x-ratelimit-reset')
                }
                return response?.ok ? [response.text(), headers] : null
            })
            .then(async data=> sendResponse({ success: true, data: await data[0], headers: data[1] }) )
            .catch(error => sendResponse({ success: false, error: error.toString() }));
    else if (message.action == "version")
        return sendResponse({ version: version, type: type });
    else if (message.action == "noApiKey")
        createCustomNotification("You have not entered the GG.deals API key.");
    return true;
});