(function () {
    const LOOP =
        parseInt(prompt("Update every 10 seconds.\nHow many updates?", "12")) || 12;

    let count = 0;

    function getNiftySpot() {
        const idx = [...document.querySelectorAll(".item")].find(x => {
            const n = x.querySelector(".name");
            return n && n.innerText.trim() === "NIFTY 50";
        });

        if (!idx) return null;

        const lp = idx.querySelector(".last-price");
        if (!lp) return null;

        return parseFloat(lp.innerText.replace(/,/g, ""));
    }

    function updateBadges() {

        const spot = getNiftySpot();
        if (!spot) return;

        // Remove old badges
        document.querySelectorAll(".SpotDiffBadge").forEach(x => x.remove());

        document.querySelectorAll("td.open.instrument").forEach(td => {

            const symbol = td.querySelector(".tradingsymbol");
            if (!symbol) return;

            const txt = symbol.innerText.replace(/\s+/g, " ").trim();

            const m = txt.match(/^NIFTY.*?(\d{5})\s+(PE|CE)$/i);
            if (!m) return;

            const strike = parseInt(m[1]);
            const type = m[2].toUpperCase();

            const diff = Math.round(strike - spot);

            const badge = document.createElement("span");
            badge.className = "SpotDiffBadge";

            badge.textContent = (diff >= 0 ? "+" : "") + diff;

            badge.style.display = "inline-block";
            badge.style.marginLeft = "8px";
            badge.style.padding = "2px 6px";
            badge.style.font = "700 11px Consolas,Arial";
            badge.style.color = "white";
            badge.style.borderRadius = type === "PE" ? "14px" : "4px";
            badge.style.whiteSpace = "nowrap";
            badge.style.cursor = "default";
            badge.style.verticalAlign = "middle";

            if (type === "PE") {
                badge.style.background = "#d32f2f";
            } else {
                badge.style.background = "#2e7d32";
            }

            symbol.insertAdjacentElement("afterend", badge);
        });

        count++;

        if (count >= LOOP) {
            clearInterval(timer);
            location.reload();
        }
    }

    updateBadges();

    const timer = setInterval(updateBadges, 10000);

})();
