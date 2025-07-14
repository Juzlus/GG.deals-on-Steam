function toogleApiKey() {
    const input = document.getElementById("apiKey");
    input.type = input.type == "text" ? "password" : "text";
}

async function updateColors(save) {
    color1 = document.getElementById("primaryColor").value;
    color2 = document.getElementById("secondaryColor").value;
    color3 = document.getElementById("backgroundColor").value;
    if (color1) document.documentElement.style.setProperty("--priceColor", color1);
    if (color2) document.documentElement.style.setProperty("--hoverPriceColor", color2);
    if (color3) document.documentElement.style.setProperty("--priceBgColor", color3);
    if (save)
        await setToStorage("colors", [color1, color2, color3]);
}

async function resetColors() {
    color1 = document.getElementById("primaryColor").value = "#BEEE11";
    color2 = document.getElementById("secondaryColor").value = "#a6cc1b";
    color3 = document.getElementById("backgroundColor").value = "#344654";
    document.documentElement.style.setProperty("--priceColor", color1);
    document.documentElement.style.setProperty("--hoverPriceColor", color2);
    document.documentElement.style.setProperty("--priceBgColor", color3);
    await setToStorage("colors", [color1, color2, color3]);
}

async function updateActiveSubpages() {
    let subpages = [];
    document.querySelectorAll("input[name='activeSubpages']").forEach(e => {
        if (e.checked)
            subpages.push(e.value);
    });
    await setToStorage("activeSubpages", subpages);
}

async function updatePriceType() {
    let priceType = [];
    document.querySelectorAll("input[name='priceType']").forEach(e => {
        if (e.checked)
            priceType.push(e.value);
    });
    await setToStorage("priceType", priceType);
}

async function clearPrices() {
    alert("Storage cleared");
    await removeFromStorage("lastAppIds");
    document.getElementById("priceInStorage").innerText = 0;
}

async function updateRegion() {
    const region = document.getElementById("region").value;
    await setToStorage("region", region);
}

async function updateApiKey() {
    const key = document.getElementById("apiKey").value;
    await setToStorage("token", key);
}

async function init() {
    document.getElementById("apiKey").value = await getFromStorage("token", "");
    document.getElementById("apiKey").onchange = updateApiKey;
    document.getElementById("showApiKey").onclick = toogleApiKey;

    const region = await getFromStorage("region", "us");
    document.querySelector(`option[value='${region}']`).selected = true;
    document.getElementById("region").onchange = updateRegion;

    document.getElementById("priceInStorage").innerText = Object.keys(await getFromStorage("lastAppIds", {}))?.length;
    document.getElementById("clearStorage").onclick = clearPrices;

    document.getElementById("version").innerText = await getFromStorage("version", 0);
    if (await getFromStorage("version", 0) != await getFromStorage("latestVersion", 0))
        document.getElementById("newVersion").style.display = "inline";

    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    document.querySelectorAll("input[name='activeSubpages']").forEach(e => {
        if (activeSubpages.includes(e.value))
            e.checked = true;
        e.onclick = updateActiveSubpages;
    });

    const priceType = await getFromStorage("priceType", ["official", "keyshop"]);
    document.querySelectorAll("input[name='priceType']").forEach(e => {
        if (priceType.includes(e.value))
            e.checked = true;
        e.onclick = updatePriceType;
    });

    let i = 0;
    const colors = await getFromStorage("colors", ["#BEEE11", "#a6cc1b", "#344654"])
    document.querySelectorAll("input[type='color']").forEach(e => {
        e.value = colors[i] || "#000000";
        i++;
        e.addEventListener("input", () => updateColors(false));
        e.addEventListener("change", () => updateColors(true));
    });
    document.getElementById("defaultColors").onclick = resetColors;
    updateColors(false);

    document.getElementById("ratelimit-limit").innerText = await getFromStorage("x-ratelimit-limit", "100");
    document.getElementById("ratelimit-remaining").innerText = await getFromStorage("x-ratelimit-remaining", "0");
    document.getElementById("ratelimit-reset").innerText = new Date(await getFromStorage("x-ratelimit-reset", "0") * 1000).toLocaleString();

    if (window.matchMedia("(max-width: 1000px)").matches) {
        if (document.querySelector("#priceType label:nth-child(1) a:nth-child(3)"))
            document.querySelector("#priceType label:nth-child(1) a:nth-child(3)").innerText = "Steam, Epic Games, Gog, Battle.net, Ubisoft Store, Microsoft Store...";
        if (document.querySelector("#priceType label:nth-child(2) a:nth-child(3)"))
            document.querySelector("#priceType label:nth-child(2) a:nth-child(3)").innerText = "G2A, Instant Gaming, Kinguin, CDKeys.com, GAMIVO, Eneba...";
    };
}

async function getFromStorage(key, defaultValue) {
    const result = await chrome?.storage?.local?.get([key]);
    if (!result) return null;
    if (result[key] === undefined) {
        await chrome.storage.local.set({ [key]: defaultValue });
        return defaultValue;
    }
    return result[key];
}

async function setToStorage(key, value) {
    await chrome.storage.local.set({ [key]: value });
}

async function removeFromStorage(key) {
    await chrome.storage.local.remove(key);
}

window.onload = init;