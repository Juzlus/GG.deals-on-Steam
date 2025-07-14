async function checkSimilarGame() {
    let morelike = document.querySelectorAll('[class*="buttonNext"]');
    for (let i = 0; i < 8; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 10));
        if (morelike.length > 0)
            morelike[0].click();
        if (morelike.length > 2)
            morelike[2].click();
    }
}

function setDLCPrice(apps) {
    document.querySelectorAll(".game_area_dlc_row").forEach(async e => {
        const id = e?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];
        e.querySelector('.game_area_dlc_price').style.marginRight = "80px";

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_dlc_price");
        priceBlock.innerText = await getLowestPrice(app?.prices?.currentRetail, app?.prices?.currentKeyshops, app?.prices?.currency);
    
        e.prepend(priceBlock);
    });
}

function setSimilarGamePrice(apps) {
    document.querySelectorAll(".ImpressionTrackedElement").forEach(async e => {
        const id = e?.querySelector('a[href*="store.steampowered.com/app/"]')?.href?.match(/\/(app)\/(\d+)/)?.[2];
        if (e?.querySelector(".StoreSalePriceWidgetContainer div")?.innerText == "Free to Play") return;
        const app = apps?.[id];

        const price = await getLowestPrice(app?.prices?.currentRetail, app?.prices?.currentKeyshops, app?.prices?.currency);
        if (price == "N/A") return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_similar_game_price");
        priceBlock.innerText = price;
        priceBlock.style.opacity = window.getComputedStyle(e?.querySelector(".CapsuleBottomBar")).opacity;

        e?.prepend(priceBlock);
        e?.querySelector("._2_KY_e11FV0ftXR2_7TMmP")?.remove();
    });
}

function setPriceHistory(apps) {
    const id = window.location.href.match(/\/(app)\/(\d+)/)?.[2];
    const app = apps?.[id];
    if (!app) return;

    if (!app?.prices?.currentRetail || (app?.prices?.currentRetail == "0.00" && app?.prices?.historicalRetail == "0.00" && !app?.prices?.currentKeyshops && !app?.prices?.historicalKeyshops))
        return;
    const historyBlock = document.createElement("a");
    historyBlock.href = app?.url || "#";
    historyBlock.classList.add("ggdeals_price_history");
    historyBlock.innerHTML = (`<img src="https://github.com/Juzlus/GG.deals-on-Steam/blob/server/icons/ggdeals_logo_white.png?raw=true"></img><div>`
                            + `<p class="ggdeals_current">Current price is <b class="ggdeals_price">${app?.prices?.currentRetail} ${app?.prices?.currency}</b> at Official shops`
                            + (app?.prices?.currentKeyshops ? ` and <b class="ggdeals_price">${app?.prices?.currentKeyshops} ${app?.prices?.currency}</b> at Keyshops` : '')
                            + `</p>`
                            + `<p class="ggdeals_lowest">The lowest price recorded is <a class="ggdeals_price">${app?.prices?.historicalRetail} ${app?.prices?.currency}</a> at Official shops`
                            + (app?.prices?.historicalKeyshops ? ` and <a class="ggdeals_price">${app?.prices?.historicalKeyshops} ${app?.prices?.currency}</a> at Keyshops` : '')
                            + `</p></div>`);

    document?.querySelector("#game_area_purchase")?.prepend(historyBlock);
}

waitForElm('.CapsuleDecorators').then(async() => {
    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    if (!activeSubpages.includes("app")) return;
    
    if (document.querySelector(".ggdeals_similar_game_price")) return;
    await checkSimilarGame();
    const apps = await getAppIds();
    if (!apps) return;
    setDLCPrice(apps);
    setSimilarGamePrice(apps);
    setPriceHistory(apps);
});
