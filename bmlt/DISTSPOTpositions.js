(function () {
  const input = prompt(`Iterations,Refresh Seconds`, "50,10");

  let LOOP = 50;
  let REFRESH = 10;

  if (input) {
    const p = input.split(",");
    LOOP = parseInt(p[0]) || 50;
    REFRESH = parseInt(p[1]) || 10;
  }

  let count = 0;

  function getSpot(indexName) {
    const row = [...document.querySelectorAll(".item")].find((r) => {
      const n = r.querySelector(".name");
      return n && n.innerText.trim() === indexName;
    });

    if (!row) return null;

    const lp = row.querySelector(".last-price");

    if (!lp) return null;

    return parseFloat(lp.innerText.replace(/,/g, ""));
  }

  function updateBadges() {
    const niftySpot = getSpot("NIFTY 50");
    const sensexSpot = getSpot("SENSEX");

    // Remove badges from closed positions (if any exist)
    document
      .querySelectorAll("td.closed.instrument .SpotDiffBadge")
      .forEach((b) => b.remove());

    // ONLY ACTIVE POSITIONS
    document
      .querySelectorAll("td.open.instrument .tradingsymbol")
      .forEach((symbol) => {
        const txt = symbol.innerText.replace(/\s+/g, " ").trim();

        const m = txt.match(/^(NIFTY|SENSEX).*?(\d{5})\s+(CE|PE)$/i);

        if (!m) return;

        const index = m[1].toUpperCase();
        const strike = parseInt(m[2]);
        const type = m[3].toUpperCase();

        let spot = null;

        if (index === "NIFTY") spot = niftySpot;
        else spot = sensexSpot;

        if (!spot) return;

        const diff = Math.round(strike - spot);

        // Instrument cell
        const cell = symbol.closest("td.open.instrument");

        if (!cell) return;

        cell.style.position = "relative";

        let badge = cell.querySelector(".SpotDiffBadge");

        if (!badge) {
          badge = document.createElement("span");

          badge.className = "SpotDiffBadge";

          badge.style.cssText = `
position:absolute;
right:8px;
top:50%;
transform:translateY(-50%);
padding:3px 8px;
font:700 14px Consolas,Arial;
color:#fff;
white-space:nowrap;
user-select:none;
pointer-events:none;
z-index:999;
`;

          cell.appendChild(badge);
        }

        badge.textContent = (diff >= 0 ? "+" : "") + diff;

        if (type === "PE") {
          badge.style.background = "#d32f2f";
          badge.style.borderRadius = "14px";
        } else {
          badge.style.background = "#2e7d32";
          badge.style.borderRadius = "3px";
        }
      });

    count++;

    if (count >= LOOP) {
      clearInterval(timer);

      location.reload();
    }
  }

  updateBadges();

  const timer = setInterval(updateBadges, REFRESH * 1000);
})();
