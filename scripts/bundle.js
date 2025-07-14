async function checkSimilarGame() {
    let morelike = document.querySelectorAll('[class*="buttonNext"]');
    for (let i = 0; i < 8; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 10));
        if (morelike.length > 0)
            morelike[0].click();
    }
}

function setBundleGamePrice(apps) {
    document.querySelectorAll(".tab_item.tablet_list_item").forEach(async e => {
        const id = e?.querySelector('a[href*="store.steampowered.com/app/"]')?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];

        const price = await getLowestPrice(app?.prices?.currentRetail, app?.prices?.currentKeyshops, app?.prices?.currency);
        if (price == "N/A") return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_bundle_price");
        priceBlock.innerText = price;
        priceBlock.style.opacity = e?.classList?.contains("ds_flagged") ? 0.5 : 1;

        e?.append(priceBlock);
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
    });
}

waitForElm('.ImpressionTrackedElement').then(async() => {
    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    if (!activeSubpages.includes("bundle")) return;

    if (document.querySelector(".ggdeals_similar_game_price")) return;
    await checkSimilarGame();
    const apps = await getAppIds();
    if (!apps) return;
    setBundleGamePrice(apps);
    setSimilarGamePrice(apps);
});
