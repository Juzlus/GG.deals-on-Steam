function setSearchGamePrice(apps) {
    document.querySelectorAll(`a[data-ds-appid]`).forEach(async e => {
        if (e?.querySelector(".ggdeals_search_price")) return;

        e?.classList.add("ggdeals_used_price");
        const priceText = e?.querySelector(".discount_final_price");
        if (!priceText) return;

        const id = e?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];

        const price = await checkPrice(app);
        if (!price) return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_search_price");
        priceBlock.innerText = price;

        e?.querySelector(".discount_final_price")?.before(priceBlock);
    });
}

let refreshTimer;
async function refreshPrices() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async() => {
        const apps = await getAppIds();
        if (!apps) return;
        setSearchGamePrice(apps);

        const parent2 = document.querySelector('#search_results_loading');
        if(!parent2) return;
        observer.observe(parent2, {
            attributes: true,
            childList: true,
            subtree: false,
        });
    }, 500 );
} 

const observer = new MutationObserver(() => refreshPrices());
const parent = document.querySelector('#search_results');

waitForElm('#search_results').then(async() => {
    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    if (!activeSubpages.includes("search")) return;

    if (!parent) return;
    observer.observe(parent, {
        attributes: true,
        childList: true,
        subtree: false,
    });

    refreshPrices();
});
