(function () {
    // const LOOP =
    //     parseInt(prompt("Update every 10 seconds.\nHow many updates?", "18")) || 18;

    // const input = prompt(
    //     "Enter: iterations, refresh seconds\nExample: 25, 5",
    //     "40, 10", "Default: 40, 5"
    // ) || "40, 5";

    // const parts = input.split(",");

    // const LOOP = parseInt(parts[0].trim()) || 40;
    // const REFRESH_SECONDS = parseFloat(parts[1]?.trim()) || 5;
    // const REFRESH_MS = REFRESH_SECONDS * 1000;

    const input = prompt(
        "Enter: iterations, refresh seconds\nExample: 40, 5 (Default)"
    ) || "40, 5";

    const parts = input.split(",");

    let LOOP = parseInt(parts[0].trim());
    let REFRESH_SECONDS = parseFloat(parts[1]?.trim());

    if (!Number.isFinite(LOOP) || LOOP < 1) LOOP = 40;
    if (!Number.isFinite(REFRESH_SECONDS) || REFRESH_SECONDS < 1) REFRESH_SECONDS = 5;

    const REFRESH_MS = REFRESH_SECONDS * 1000;

    let count = 0;

    let interactionRect = null;
    let badgesLeft = false;

    function getNIFTYSpot() {
        const idx = [...document.querySelectorAll(".item")].find((x) => {
            const n = x.querySelector(".name");
            return n && n.innerText.replace(/\s+/g, " ").trim() === "NIFTY 50";
        });

        if (!idx) return null;

        const lp = idx.querySelector(".last-price");
        if (!lp) return null;

        return parseFloat(lp.innerText.replace(/,/g, ""));
    }

    function moveAllBadges(toLeft) {
        document.querySelectorAll(".NIFTYDiff").forEach((badge) => {
            if (toLeft) {
                badge.style.left = "-55px";
                badge.style.right = "auto";
                badge.style.marginLeft = "0";
                badge.style.marginRight = "0";
            } else {
                badge.style.left = "100%";
                badge.style.right = "auto";
                badge.style.marginLeft = "8px";
                badge.style.marginRight = "0";
            }
        });
    }

    function updateBadges() {
        const spot = getNIFTYSpot();

        if (!spot) return;

        document.querySelectorAll(".item .name").forEach((name) => {
            const txt = name.innerText.replace(/\s+/g, " ").trim();

            const m = txt.match(/^NIFTY\b.*?(\d{5})\s+(PE|CE)$/i);
            console.log(txt, m);

            if (!m) return;

            const strike = parseInt(m[1]);

            const type = m[2].toUpperCase();

            // Strike relative to Spot
            const diff = Math.round(strike - spot);

            const holder = name.parentElement;

            holder.style.position = "relative";

            let badge = holder.querySelector(".NIFTYDiff");

            if (!badge) {
                badge = document.createElement("span");

                badge.className = "NIFTYDiff";

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
pointer-events:auto;
user-select:none;
transition:left .25s ease,right .25s ease;
z-index:999999;
`;

                holder.appendChild(badge);
                if (!interactionRect) {

                    interactionRect = {

                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0

                    };

                }

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

        const firstBadge = document.querySelector(".NIFTYDiff");

        if (firstBadge) {

            const r = firstBadge.getBoundingClientRect();

            interactionRect = {

                left: r.left - 30,
                right: r.right + 170,
                top: 0,
                bottom: window.innerHeight

            };

        }
        count++;

        if (count >= LOOP) {
            clearInterval(timer);

            location.reload();
        }
    }

    updateBadges();

    document.addEventListener("mousemove", (e) => {

        if (!interactionRect)
            return;

        const inside =

            e.clientX >= interactionRect.left &&
            e.clientX <= interactionRect.right &&
            e.clientY >= interactionRect.top &&
            e.clientY <= interactionRect.bottom;

        if (inside && !badgesLeft) {

            badgesLeft = true;

            moveAllBadges(true);

        }

        if (!inside && badgesLeft) {

            badgesLeft = false;

            moveAllBadges(false);

        }

    });

    const timer = setInterval(updateBadges, REFRESH_MS);
})();
