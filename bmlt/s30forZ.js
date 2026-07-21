(function () {
  const LOOP =
    parseInt(prompt("Update every 10 seconds.\nHow many updates?", "5")) || 5;

  let count = 0;
  let sensexRows = [];
  let activeSensexRow = -1;

  function getSensexSpot() {
    const idx = [...document.querySelectorAll(".item")].find((x) => {
      const n = x.querySelector(".name");
      return n && n.innerText.trim() === "SENSEX";
    });

    if (!idx) return null;

    const lp = idx.querySelector(".last-price");
    if (!lp) return null;

    return parseFloat(lp.innerText.replace(/,/g, ""));
  }

  function fadeNearbyBadges(centerIndex, range = 1) {

    sensexRows.forEach((row, index) => {

        const badge = row.querySelector(".sensexDiff");

        if (!badge)
            return;

        if (Math.abs(index - centerIndex) <= range) {

            badge.style.opacity = "0.35";

        } else {

            badge.style.opacity = "1";

        }

    });

}

function restoreBadges() {

    document.querySelectorAll(".sensexDiff").forEach((badge) => {

        badge.style.opacity = "1";

    });

}
  function updateBadges() {
    const spot = getSensexSpot();

    if (!spot) return;

    sensexRows = [];

    document.querySelectorAll(".item .name").forEach((name) => {
      const txt = name.innerText.replace(/\s+/g, " ").trim();

      const m = txt.match(/^SENSEX.*?(\d{5})\s+(PE|CE)$/i);

      if (!m) return;

      const strike = parseInt(m[1]);

      const type = m[2].toUpperCase();

      // Strike relative to Spot
      const diff = Math.round(strike - spot);

      const holder = name.parentElement;

      const row = holder.closest(".item");

      if (row) sensexRows.push(row);

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
cursor:default;
pointer-events:none;
user-select:none;
transition:opacity .15s ease;
z-index:999999;
`;

        holder.appendChild(badge);
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

  document.addEventListener("mousemove", (e) => {
    const row = e.target.closest(".item");

    if (!row) {
      if (activeSensexRow !== -1) {
        restoreBadges();

        activeSensexRow = -1;
      }

      return;
    }

    const index = sensexRows.indexOf(row);

    if (index === -1) {
      if (activeSensexRow !== -1) {
        restoreBadges();

        activeSensexRow = -1;
      }

      return;
    }

    if (index === activeSensexRow) return;

    activeSensexRow = index;

    fadeNearbyBadges(index, 1);
  });

  const timer = setInterval(updateBadges, 10000);
})();
