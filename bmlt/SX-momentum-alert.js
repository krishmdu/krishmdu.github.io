(function () {
  "use strict";

  /**********************************************************************
   *  SENSEX OPTION MOMENTUM MONITOR
   *  VERSION 1.0 - PART 1
   *
   *  This module:
   *      ✓ Reads SENSEX Spot
   *      ✓ Reads active SENSEX option positions
   *      ✓ Stores last 10 premium values
   *      ✓ Runs every N seconds
   *
   *  No alerting yet.
   **********************************************************************/

  const input = prompt(
    `SENSEX Momentum Monitor

Iterations,Refresh Seconds

Example:
50,5`,
    "50,5",
  );

  if (!input) return;

  const parts = input.split(",");

  const LOOP = parseInt(parts[0]) || 50;
  const REFRESH = (parseInt(parts[1]) || 5) * 1000;

  let iteration = 0;

  /**********************************************************************
   * Premium History
   *
   * Key:
   *      SENSEX 77500 PE
   *
   * Value:
   *      {
   *          history:[...],
   *          highest:0,
   *          lowest:99999
   *      }
   **********************************************************************/

  const premiumDB = {};

  /**********************************************************************
   * Get SENSEX Spot
   **********************************************************************/

  function getSensexSpot() {
    const idx = [...document.querySelectorAll(".item")].find((item) => {
      const n = item.querySelector(".name");

      return n && n.innerText.trim() === "SENSEX";
    });

    if (!idx) return null;

    const lp = idx.querySelector(".last-price");

    if (!lp) return null;

    return parseFloat(lp.innerText.replace(/,/g, ""));
  }

  /**********************************************************************
   * Read Active Positions
   **********************************************************************/

  function readPositions() {
    const list = [];

    document.querySelectorAll("tbody tr").forEach((row) => {
      //-------------------------------------------------------------
      // Ignore Closed Positions
      //-------------------------------------------------------------

      if (row.querySelector(".closed.greyed")) return;

      const ts = row.querySelector(".tradingsymbol");

      if (!ts) return;

      const symbol = ts.innerText.replace(/\s+/g, " ").trim();

      //-------------------------------------------------------------
      // SENSEX Option only
      //-------------------------------------------------------------

      const m = symbol.match(/^SENSEX.*?(\d{5})\s+(PE|CE)$/i);

      if (!m) return;

      //-------------------------------------------------------------
      // LTP
      //-------------------------------------------------------------

      const ltpCell = row.querySelector("td.last-price .span-text-right");

      if (!ltpCell) return;

      const premium = parseFloat(ltpCell.innerText.replace(/,/g, ""));

      list.push({
        symbol,

        strike: parseInt(m[1]),

        type: m[2].toUpperCase(),

        premium,
      });
    });

    return list;
  }

  /**********************************************************************
   * Update Premium Database
   **********************************************************************/

  function updateHistory(positions) {
    positions.forEach((pos) => {
      //---------------------------------------------------------
      // First Time
      //---------------------------------------------------------

      if (!premiumDB[pos.symbol]) {
        premiumDB[pos.symbol] = {
          history: [],

          highest: pos.premium,

          lowest: pos.premium,

          lastPremium: pos.premium,

          lastSeen: new Date(),
        };
      }

      const obj = premiumDB[pos.symbol];

      //---------------------------------------------------------
      // Add Latest Premium
      //---------------------------------------------------------

      obj.history.push(pos.premium);

      //---------------------------------------------------------
      // Keep only last 10 values
      //---------------------------------------------------------

      if (obj.history.length > 10) obj.history.shift();

      //---------------------------------------------------------
      // Highest
      //---------------------------------------------------------

      obj.highest = Math.max(...obj.history);

      //---------------------------------------------------------
      // Lowest
      //---------------------------------------------------------

      obj.lowest = Math.min(...obj.history);

      //---------------------------------------------------------
      // Last Premium
      //---------------------------------------------------------

      obj.lastPremium = pos.premium;

      obj.lastSeen = new Date();
    });
  }

  /**********************************************************************
   * Debug Console
   **********************************************************************/

  function printSummary() {
    console.clear();

    console.log("Iteration", iteration, "/", LOOP);

    console.table(
      Object.entries(premiumDB).map(([k, v]) => ({
        Symbol: k,

        Current: v.lastPremium,

        Highest: v.highest,

        Lowest: v.lowest,

        Samples: v.history.length,

        History: v.history.join(" | "),
      })),
    );
  }

  /**********************************************************************
   * Main Loop
   **********************************************************************/

  function scan() {
    const spot = getSensexSpot();

    if (!spot) {
      alert("SENSEX Spot not found.");

      clearInterval(timer);

      return;
    }

    const positions = readPositions();

    updateHistory(positions);

    iteration++;

    console.log("Spot:", spot, "Positions:", positions.length);

    printSummary();

    if (iteration >= LOOP) {
      clearInterval(timer);

      console.log("Completed.");
    }
  }

  /**********************************************************************
   * Start
   **********************************************************************/

  scan();

  const timer = setInterval(scan, REFRESH);
})();

/**********************************************************************
 * PART 2
 * Premium History
 **********************************************************************/

// Stores premium history for every option
const HISTORY = {};

// Maximum samples to retain
const MAX_HISTORY = 10;

// Read all visible SENSEX option rows
function getOptionRows() {
  return [...document.querySelectorAll(".item")].filter((row) => {
    const name = row.querySelector(".name");

    return name && /^SENSEX.*(PE|CE)$/i.test(name.innerText);
  });
}

// Current premium
function getPremium(row) {
  const lp = row.querySelector(".last-price");

  if (!lp) return null;

  return parseFloat(lp.innerText.replace(/,/g, ""));
}

// Instrument name
function getSymbol(row) {
  return row.querySelector(".name").innerText.replace(/\s+/g, " ").trim();
}

// Save latest premium
function updateHistory() {
  getOptionRows().forEach((row) => {
    const symbol = getSymbol(row);

    const premium = getPremium(row);

    if (isNaN(premium)) return;

    if (!HISTORY[symbol]) HISTORY[symbol] = [];

    HISTORY[symbol].push({
      time: Date.now(),
      premium,
    });

    // retain only recent samples
    if (HISTORY[symbol].length > MAX_HISTORY) HISTORY[symbol].shift();
  });
}

/**********************************************************************
 * PART 3
 * Momentum Calculation
 **********************************************************************/

function analyseMomentum(symbol) {
  const history = HISTORY[symbol];

  if (!history || history.length < 3) return null;

  const latest = history[history.length - 1].premium;

  const previous = history[history.length - 2].premium;

  const oldest = history[0].premium;

  //-------------------------------------------------------
  // Absolute Change
  //-------------------------------------------------------

  const absChange = latest - previous;

  //-------------------------------------------------------
  // Percentage Change
  //-------------------------------------------------------

  const pctChange = previous === 0 ? 0 : (absChange / previous) * 100;

  //-------------------------------------------------------
  // Momentum Score
  //
  // Simple weighted score
  //-------------------------------------------------------

  const score = Math.abs(absChange) * 10 + Math.abs(pctChange);

  //-------------------------------------------------------
  // Highest / Lowest during stored history
  //-------------------------------------------------------

  const premiums = history.map((x) => x.premium);

  const maxPremium = Math.max(...premiums);

  const minPremium = Math.min(...premiums);

  //-------------------------------------------------------
  // Breakout Detection
  //-------------------------------------------------------

  const breakout = latest > maxPremium;

  const breakdown = latest < minPremium;

  //-------------------------------------------------------
  // Return all information
  //-------------------------------------------------------

  return {
    latest,

    previous,

    oldest,

    absChange,

    pctChange,

    score,

    breakout,

    breakdown,

    maxPremium,

    minPremium,
  };
}

/**********************************************************************
 * PART 4
 * Alert Engine
 **********************************************************************/

// remembers the last alert level for every option
const LAST_ALERT = {};

// default thresholds
const ABS_THRESHOLD = 2;
const PCT_THRESHOLD = 20;
const SCORE_THRESHOLD = 30;

function checkMomentum(symbol) {
  const m = analyseMomentum(symbol);

  if (!m) return;

  //---------------------------------------------------
  // Previous history only
  // (exclude latest sample)
  //---------------------------------------------------

  const hist = HISTORY[symbol];

  const previousPremiums = hist.slice(0, hist.length - 1).map((x) => x.premium);

  const previousHigh = Math.max(...previousPremiums);

  const previousLow = Math.min(...previousPremiums);

  const breakout = m.latest > previousHigh;

  const breakdown = m.latest < previousLow;

  //---------------------------------------------------
  // Main Alert Condition
  //---------------------------------------------------

  const momentumHit =
    Math.abs(m.absChange) >= ABS_THRESHOLD &&
    Math.abs(m.pctChange) >= PCT_THRESHOLD &&
    m.score >= SCORE_THRESHOLD;

  const shouldAlert = momentumHit || breakout || breakdown;

  if (!shouldAlert) return;

  //---------------------------------------------------
  // Alert Level
  //---------------------------------------------------

  const level = Math.floor(m.score / 10);

  if (LAST_ALERT[symbol] === level) return;

  LAST_ALERT[symbol] = level;

  //---------------------------------------------------
  // Direction
  //---------------------------------------------------

  const direction = m.absChange >= 0 ? "🚀 UP" : "🔻 DOWN";

  //---------------------------------------------------
  // Breakout Text
  //---------------------------------------------------

  let extra = "";

  if (breakout) extra = "\n📈 New HIGH";

  if (breakdown) extra = "\n📉 New LOW";

  //---------------------------------------------------
  // Beep
  //---------------------------------------------------

  beep(2);

  //---------------------------------------------------
  // Popup
  //---------------------------------------------------

  showMessage(
    `${direction}

${symbol}

Premium : ${m.latest.toFixed(2)}

Δ ${m.absChange.toFixed(2)}
(${m.pctChange.toFixed(1)}%)

Score : ${m.score.toFixed(0)}

${extra}`,
  );
}

/**********************************************************************
 * PART 5
 * Main Monitoring Loop
 **********************************************************************/

function monitorMarket() {
  // Save latest premiums
  updateHistory();

  // Analyse every visible option
  getOptionRows().forEach((row) => {
    const symbol = getSymbol(row);

    checkMomentum(symbol);
  });

  //--------------------------------------------------
  // Cleanup removed symbols
  //--------------------------------------------------

  const liveSymbols = new Set(getOptionRows().map(getSymbol));

  Object.keys(HISTORY).forEach((symbol) => {
    if (!liveSymbols.has(symbol)) {
      delete HISTORY[symbol];

      delete LAST_ALERT[symbol];
    }
  });
}

monitorMarket();

setInterval(monitorMarket, CONFIG.REFRESH_SECONDS * 1000);
