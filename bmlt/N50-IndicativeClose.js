(function () {
  //====================================================
  // Configuration
  //====================================================

  const REFRESH_MS = 5000;

  let expandedOnce = false;

  //====================================================
  // Floating Badge
  //====================================================

  function getBadge() {
    let badge = document.getElementById("NiftyIndicativeCloseBadge");

    if (!badge) {
      badge = document.createElement("div");

      badge.id = "NiftyIndicativeCloseBadge";

      badge.style.cssText = `
position:fixed;
top:10px;
left:10px;
background:#1b1b1b;
color:#00ff66;
padding:8px 14px;
border-radius:6px;
font:700 16px Consolas,Arial;
z-index:2147483647;
box-shadow:0 2px 8px rgba(0,0,0,.4);
`;

      document.body.appendChild(badge);
    }

    return badge;
  }

  //====================================================
  // Find NIFTY 50 row
  //====================================================

  function getNiftyWrapper() {
    return [...document.querySelectorAll(".item-wrapper")].find((w) => {
      const n = w.querySelector(".name");

      return n && n.innerText.trim() === "NIFTY 50";
    });
  }

  //====================================================
  // Expand Market Depth if needed
  //====================================================

  function ensureExpanded(wrapper) {
    // Already expanded?
    if (wrapper.querySelector(".market-depth")) return true;

    // Find the actual Market Depth button
    const btn = wrapper.querySelector('button[aria-label="Market depth"]');

    if (!btn) return false;

    // Click exactly what you click manually
    btn.click();

    return false;
  }

  //====================================================
  // Read Indicative Close
  //====================================================

  function readIndicativeClose(wrapper) {
    const label = [...wrapper.querySelectorAll("label")].find(
      (l) => l.innerText.trim().toLowerCase() === "indicative close",
    );

    if (!label) return null;

    const value = label.parentElement.querySelector(".value");

    if (!value) return null;

    return value.innerText.trim();
  }

  //====================================================
  // Main Update
  //====================================================

  function update() {
    const badge = getBadge();

    const wrapper = getNiftyWrapper();

    if (!wrapper) {
      badge.innerHTML = "NIFTY 50 not found";

      return;
    }

    const expanded = ensureExpanded(wrapper);

    if (!expanded) {
      badge.innerHTML = "Opening NIFTY Market Depth...";

      setTimeout(update, 600);

      return;
    }

    const indicative = readIndicativeClose(wrapper);

    if (!indicative) {
      badge.innerHTML = "Indicative Close : --";

      return;
    }

    badge.innerHTML = `<span style="color:#FFD54F">Indicative Close</span><br>${indicative}`;
  }

  //====================================================
  // Start
  //====================================================

  update();

  setInterval(update, REFRESH_MS);
})();
