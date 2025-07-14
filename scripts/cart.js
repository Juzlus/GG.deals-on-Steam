function setMainCartGamePrice(apps) {
    document.querySelectorAll(`div.Panel.Focusable div.Panel.Focusable a[href*='/app/']:not(.Focusable)`).forEach(async e => {
        const priceText = e?.parentNode.parentNode.querySelector("span div")
        if (!priceText) return;

        const id = e?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];

        const price = await checkPrice(app);
        if (!price) return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_main_cart_price");
        priceBlock.innerText = price;

        e?.parentElement?.after(priceBlock);
    });
}

function setRecommendationCartGamePrice(apps) {
    document.querySelectorAll(`div.Panel.Focusable div.Panel.Focusable a[href*='/app/'].Focusable`).forEach(async e => {
        const priceText = e?.parentNode.parentNode.parentNode.querySelector(".StoreSalePriceWidgetContainer")
        if (!priceText) return;

        const id = e?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];

        const price = await checkPrice(app);
        if (!price) return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_other_cart_price");
        priceBlock.innerText = price;

        priceText?.parentNode?.parentNode?.parentNode?.parentNode.append(priceBlock);
    });
}

waitForElm('.ImpressionTrackedElement').then(async() => {
    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    if (!activeSubpages.includes("cart")) return;

    if (document.querySelector(".ggdeals_main_cart_price")) return;
    const apps = await getAppIds();
    if (!apps) return;
    setMainCartGamePrice(apps);
    setRecommendationCartGamePrice(apps);
});
