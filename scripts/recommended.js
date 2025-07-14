async function setMainRecommendedGamePrice(apps) {
    const id = window.location?.href?.match(/\/(app)\/(\d+)/)?.[2];
    const app = apps?.[id];

    const price = await checkPrice(app);
    if (!price) return;

    const priceBlock = document.createElement("a");
    priceBlock.href = app?.url || "#";
    priceBlock.classList.add("ggdeals_main_recommended_price");
    priceBlock.innerText = price;

    document.querySelector(".highlight_description div")?.append(priceBlock);
}

function setRecommendedGamePrice(apps) {
    document.querySelectorAll(".recommendation_area_ctn .similar_grid_item ").forEach(async e => {
        if (["freegames3", "demogames3"]?.includes(e.parentNode.id)) return;
        const id = e?.querySelector('a[href*="store.steampowered.com/app/"]')?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];

        const price = await checkPrice(app);
        if (!price) return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_recommended_price");
        priceBlock.innerText = price;

        e.append(priceBlock);
    });
}

waitForElm('#topselling').then(async() => {
    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    if (!activeSubpages.includes("recommended")) return;

    if (document.querySelector(".ggdeals_recommended_price")) return;
    const apps = await getAppIds();
    if (!apps) return;
    setMainRecommendedGamePrice(apps);
    setRecommendedGamePrice(apps);
});
