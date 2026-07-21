(function () {

const LOOP = parseInt(prompt("Update every 10 seconds.\nHow many updates?", "20")) || 20;

let count = 0;

function getSensexSpot() {
    const idx = [...document.querySelectorAll(".item")].find(x => {
        const n = x.querySelector(".name");
        return n && n.innerText.trim() === "SENSEX";
    });

    if (!idx) return null;

    const lp = idx.querySelector(".last-price");
    if (!lp) return null;

    return parseFloat(lp.innerText.replace(/,/g, ""));
}

function updateBadges() {

    const spot = getSensexSpot();

    if (!spot)
        return;

    document.querySelectorAll(".item .name").forEach(name => {

        const txt = name.innerText.replace(/\s+/g, " ").trim();

        const m = txt.match(/^SENSEX.*?(\d{5})\s+(PE|CE)$/i);

        if (!m)
            return;

        const strike = parseInt(m[1]);

        const type = m[2].toUpperCase();

        // Strike relative to Spot
        const diff = Math.round(strike - spot);

        const holder = name.parentElement;

        holder.style.position = "relative";

        let badge = holder.querySelector(".sensexDiff");

        if (!badge) {

            badge = document.createElement("span");

            badge.className = "sensexDiff";

            badge.style.cssText = `
position:absolute;
left:100%;
margin-left:6px;
top:50%;
transform:translateY(-50%);
padding:2px 6px;
font:700 11px Consolas,Arial;
color:white;
white-space:nowrap;
box-shadow:0 2px 6px rgba(0,0,0,.35);
cursor:pointer;
user-select:none;
transition:left .20s,right .20s;
z-index:999999;
`;

            holder.appendChild(badge);

            badge.addEventListener("mouseenter", () => {

                badge.style.left = "auto";
                badge.style.right = "100%";
                badge.style.marginRight = "6px";
                badge.style.marginLeft = "0";

            });

            badge.addEventListener("mouseleave", () => {

                badge.style.right = "auto";
                badge.style.left = "100%";
                badge.style.marginLeft = "6px";
                badge.style.marginRight = "0";

            });

        }

        if (type === "PE") {

            badge.style.background = "#d32f2f";
            badge.style.borderRadius = "14px";

        } else {

            badge.style.background = "#2e7d32";
            badge.style.borderRadius = "3px";

        }

        badge.textContent = (diff >= 0 ? "+" : "") + diff;

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
