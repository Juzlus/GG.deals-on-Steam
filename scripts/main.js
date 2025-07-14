async function waitForElm (selector) {
    return new Promise(resolve => {
        if(document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        };
        const observer = new MutationObserver(mutations => {
            if(document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
};

async function fetchURL(url) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetch", url: url }, async response => {
            await setToStorage('x-ratelimit-limit', response?.headers?.limit);
            await setToStorage('x-ratelimit-remaining', response?.headers?.remaining);
            await setToStorage('x-ratelimit-reset', response?.headers?.reset);
            resolve(response?.success ? response.data : null);
        });
    });
}

async function getLowestPrice(officialStorePrice, keyshopPrice, currency) {
    const priceType = await getFromStorage("priceType", ["official", "keyshop"]);
    const price = priceType?.length == 2
                    ? (parseFloat(officialStorePrice) > parseFloat(keyshopPrice) ? keyshopPrice : officialStorePrice)
                    : priceType?.includes("official") ? officialStorePrice : keyshopPrice;
    return price == null ? "N/A" : `${price} ${currency}`
}

async function checkPrice(app) {
    if (!app?.prices?.currentRetail || (app?.prices?.currentRetail == "0.00" && app?.prices?.historicalRetail == "0.00" && !app?.prices?.currentKeyshops && !app?.prices?.historicalKeyshops))
        return null;
    const price = await getLowestPrice(app?.prices?.currentRetail, app?.prices?.currentKeyshops, app?.prices?.currency);
    if (price == "N/A") return null;
    return price;
}

async function getFromStorage(key, defaultValue) {
    let result = [];
    try {
        result = await new Promise((resolve) => {
                    chrome?.storage?.local?.get([key], (data) => resolve(data));
                });
    } catch {};
    if (!result || result[key] === undefined) {
        await setToStorage(key, defaultValue);
        return defaultValue;
    }
    return result[key];
}

async function setToStorage(key, value) {
    try {
        new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value });
        });
    } catch {};
}

async function removeFromStorage(key) {
    try {
        new Promise((resolve, reject) => {
            chrome.storage.local.remove(key);
        });
    } catch {};
}

function checkDate(timestamp, extra) {
    return parseInt(timestamp) + extra < Date.now().toString().slice(0, -3);
}

async function getAppIds() {
    if ( (checkDate(await getFromStorage("x-ratelimit-reset", 0), 3600))
        || (await getFromStorage("x-ratelimit-remaining") > 40 && checkDate(await getFromStorage("firstUpdate", 0), 3600)) ) {
            await removeFromStorage("lastAppIds");
            await setToStorage("firstUpdate", Date.now().toString().slice(0, -3));
        }

    const lastAppIds = await getFromStorage("lastAppIds", {});
    const appIds = new Set();
    document.querySelectorAll('[href*="store.steampowered.com/app/"]').forEach(e => {
        const id = e.href.match(/\/(app)\/(\d+)/)?.[2];
        if (!Object.hasOwn(lastAppIds, id) && !e?.classList?.contains("ggdeals_used_price"))
            appIds.add(id);
    });
    
    if (appIds.size == 0) {
    console.log("%c[GG.deals on Steam]%c From Storage", "color: blue", "color: purple");
        return lastAppIds;
    }

    const token = await getFromStorage("token", null);
    if (!token) return;

    let data = {};
    const appIdsArray = Array.from(appIds);
    for (let i = 0; i < Math.ceil(appIdsArray.length / 100); i++)
    {
        const chunk = appIdsArray.slice(i * 100, (i + 1) * 100);
        const apps = await fetchURL(`https://api.gg.deals/v1/prices/by-steam-app-id/?ids=${chunk.toString()}&key=${token}&region=${await getFromStorage("region", "us")}`);
        data = {...data, ...JSON.parse(apps)?.data};
    }
    await setToStorage("lastAppIds", {...lastAppIds, ...data});
    console.log(`%c[GG.deals on Steam]%c From Fetch: %c${appIds.size}`, "color: blue", "color: purple", "color: cyan");
    return {...lastAppIds, ...data};
}

async function GetVersion() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "version" }, async response => {
            await setToStorage("type", response.type)
            resolve(response.version);
        });
    });
}

async function createSettingsButton() {
    if(document.querySelector("#ggdeals_settings_btn")) return;
    const button = document.createElement("a");
    button.href = chrome.runtime.getURL("popup.html");
    button.id = "ggdeals_settings_btn";
    button.target = "_blank";
    if (document.querySelector('a.global_action_link[href*="https://store.steampowered.com/login/"]'))
        document.querySelector('a.global_action_link[href*="https://store.steampowered.com/login/"]').before(button);
    else if (document.getElementById("header_notification_area"))
        document.getElementById("header_notification_area").before(button);
    else
        document.getElementById("green_envelope_menu_root").parentNode.parentNode.before(button);

    if (await getFromStorage("token", null) == null) {
        document.documentElement.style.setProperty("--settingAlertBg", "red");
        new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: "noApiKey" });
        });
        return;
    }

    fetch('https://raw.githubusercontent.com/Juzlus/GG.deals-on-Steam/refs/heads/server/versions.json')
        .then(response => response?.ok ? response.json() : null)
        .then(async data => {
            await setToStorage("version", await GetVersion());
            if (!data) return;
            await setToStorage("latestVersion", data[`version_${await getFromStorage("type")}`]);

            if (await getFromStorage("latestVersion", null) != await getFromStorage("version", null))
                document.documentElement.style.setProperty("--settingAlertBg", "orange");
        });
}

async function updateColors() {
    const colors = await getFromStorage("colors", ["#BEEE11", "#a6cc1b", "#344654"])
    document.documentElement.style.setProperty("--priceColor", colors[0] || "#BEEE11");
    document.documentElement.style.setProperty("--hoverPriceColor", colors[1] || "#a6cc1b");
    document.documentElement.style.setProperty("--priceBgColor", colors[2] || "#344654");
}

waitForElm('#global_header').then(async() => {
    createSettingsButton();
    updateColors();
});
