
function setWishlistGamePrice(apps) {
    document.querySelectorAll('div[data-index]').forEach(async e => {
        const button = e?.querySelector('[class*="Focusable"] span');
        if (!button || e.querySelector(".ggdeals_wishlist_price")) return;

        const id = e?.querySelector('a[href*="store.steampowered.com/app/"]')?.href?.match(/\/(app)\/(\d+)/)?.[2];
        const app = apps?.[id];

        const price = await checkPrice(app);
        if (!price) return;

        const priceBlock = document.createElement("a");
        priceBlock.href = app?.url || "#";
        priceBlock.classList.add("ggdeals_wishlist_price");
        priceBlock.innerText = price;

        e?.querySelector('[class*="Focusable"] span')?.parentElement?.after(priceBlock);
        e?.querySelector('[class*="Focusable"] span')?.parentElement?.parentElement?.parentElement?.classList.add("ggdeals_wishlist_priceBox");
    });
}

let refreshTimer;
async function refreshPrices() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(async() => {
        document.querySelectorAll(".ggdeals_wishlist_price").forEach(e => e.remove());
        const apps = await getAppIds();
        if (!apps) return;
        setWishlistGamePrice(apps);
    }, 800 );
}

const observer = new MutationObserver((mutantions) => {
    refreshPrices();
});

const observer2 = new MutationObserver((mutantions) => {
    refreshPrices();
    const itemsPanel = document.querySelector("section > div:last-of-type > div:last-of-type div");
    const itemsPanel2 = document.querySelector("section > div:last-of-type > div:last-of-type div div");
    if (itemsPanel)
        observer.observe(itemsPanel, {
            attributes: true,
            childList: true,
            subtree: false,
        });
    if (itemsPanel2)
        observer.observe(itemsPanel2, {
            attributes: true,
            childList: true,
            subtree: false,
        });
});


waitForElm("section > div:last-of-type > div:last-of-type div div").then(async() => {
    const activeSubpages = await getFromStorage("activeSubpages", ["app", "wishlist", "bundle", "cart", "search", "recommended"]);
    if (!activeSubpages.includes("wishlist")) return;

    refreshPrices();
    setTimeout(async() => {
        if (document.querySelector("section > div:last-of-type"))
            observer2.observe(document.querySelector("section > div:last-of-type"), {
                attributes: true,
                childList: true,
                subtree: false,
            });

        if (document.querySelector("section > div:last-of-type > div:last-of-type div"))
            observer.observe(document.querySelector("section > div:last-of-type > div:last-of-type div"), {
                attributes: true,
                childList: true,
                subtree: false,
            });

        if (document.querySelector("section > div:last-of-type > div:last-of-type div div"))
            observer.observe(document.querySelector("section > div:last-of-type > div:last-of-type div div"), {
                attributes: true,
                childList: true,
                subtree: false,
            });
    }, 300 );
});
