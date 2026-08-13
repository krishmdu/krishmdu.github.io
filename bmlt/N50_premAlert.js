(function () {
  "use strict";

  //==========================================================
  // Check if NIFTY 50 Spot exists in the watchlist
  //==========================================================

  const niftyExists = [
    ...document.querySelectorAll(".marketwatch-content .name"),
  ].some((n) => n.innerText.trim() === "NIFTY 50");

  if (!niftyExists) {
    alert(
      "❌ NIFTY 50 Spot is not available in the Watchlist.\n\n" +
        "Please add NIFTY 50 to the watchlist and run the bookmarklet again.",
    );
    return;
  }

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

  /************************************************************
   * Scan Watchlist
   ************************************************************/
  function scan() {
    const watchlist = document.querySelector(".marketwatch-content");

    if (!watchlist) return;

    const rows = watchlist.querySelectorAll(".item-wrapper.draggable-item");

    rows.forEach((row) => {
      const info = row.querySelector(".item-info");
      if (!info) return;

      const name = info.querySelector(".name")?.innerText.trim() || "";

      // Only NIFTY option contracts
      if (!/^NIFTY\s+\d+.*\b(CE|PE)$/i.test(name)) return;

      const priceElem = info.querySelector(".last-price");
      if (!priceElem) return;

      const premium = parseFloat(
        priceElem.textContent.replace(/,/g, "").trim(),
      );

      if (isNaN(premium)) return;

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
  console.log("NIFTY Premium Alert Started");
  console.log("Threshold :", CONFIG.THRESHOLD);
  console.log("--------------------------------");

  scan();

  setInterval(scan, CONFIG.SCAN_INTERVAL);
})();
