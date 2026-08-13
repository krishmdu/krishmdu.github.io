(function () {
  "use strict";

  /************************************************************
   * Configuration
   ************************************************************/

  const CONFIG = {
    THRESHOLD: Number(prompt("Alert when premium crosses above:", "12")) || 12,

    SCAN_INTERVAL: 5000,

    FLASH_INTERVAL: 500,
  };
  /************************************************************
   * Internal state
   ************************************************************/

  const alerted = new Set();

  // let flashTimer = null;

  /************************************************************
   * Inject CSS
   ************************************************************/

  const style = document.createElement("style");

  style.textContent = `

.kr-alert-row,
.kr-alert-row .item,
.kr-alert-row .item-info{
    background:#fff59d !important;
}

`;

  document.head.appendChild(style);

  /************************************************************
   * Beep
   ************************************************************/

  function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const osc = ctx.createOscillator();

    osc.frequency.value = 900;

    osc.connect(ctx.destination);

    osc.start();

    osc.stop(ctx.currentTime + 0.25);
  }

  // /************************************************************
  //  * Flash rows
  //  ************************************************************/

  // function startFlash() {
  //   if (flashTimer) return;

  //   flashTimer = setInterval(() => {
  //     document.querySelectorAll(".kr-alert-row").forEach((r) => {
  //       r.style.visibility =
  //         r.style.visibility === "hidden" ? "visible" : "hidden";
  //     });
  //   }, CONFIG.FLASH_INTERVAL);
  // }

  /************************************************************
   * Scan Watchlist
   ************************************************************/

  function scan() {
    // Scan ONLY the Market Watch area
    const watchlist = document.querySelector(".marketwatch-content");

    if (!watchlist) return;

    // Every instrument row in watchlist
    const rows = watchlist.querySelectorAll(".item-wrapper.draggable-item");

    rows.forEach((row) => {
      const info = row.querySelector(".item-info");
      if (!info) return;

      // Instrument name
      const name = info.querySelector(".name")?.innerText.trim() || "";

      // Ignore Spot SENSEX
      // Match only option contracts
      if (!/^SENSEX\s+\d+.*\b(CE|PE)$/i.test(name)) return;

      // Price
      const priceElem = info.querySelector(".last-price");

      if (!priceElem) return;

      const premium = parseFloat(
        priceElem.textContent.replace(/,/g, "").trim(),
      );

      if (isNaN(premium)) return;

      // Highlight while premium >= threshold
      if (premium >= CONFIG.THRESHOLD) {
        row.classList.add("kr-alert-row");

        if (!alerted.has(name)) {
          alerted.add(name);

          console.log("ALERT:", name, premium);

          beep();
        }
      } else {
        row.classList.remove("kr-alert-row");

        alerted.delete(name);
      }
    });
  }
  /************************************************************
   * Start
   ************************************************************/

  console.clear();

  console.log("--------------------------------");

  console.log("SENSEX Premium Alert Started");

  console.log("Threshold :", CONFIG.THRESHOLD);

  console.log("--------------------------------");

  scan();

  setInterval(scan, CONFIG.SCAN_INTERVAL);

  // startFlash();
})();
