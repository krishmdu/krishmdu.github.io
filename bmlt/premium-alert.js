/*
=========================================================
SENSEX PREMIUM ALERT
---------------------------------------------------------
Author : Krish
Purpose:
    Alert when any SENSEX option premium crosses a threshold
    for the FIRST time.

Features
--------
✓ Configurable Threshold
✓ Sound Alert
✓ Flash Row continuously while premium > threshold
✓ One-time alert until premium falls below threshold
✓ Lightweight
=========================================================
*/

(function () {

    "use strict";

    /*******************************************************
     * CONFIGURATION
     *******************************************************/

    const THRESHOLD = 10.5;          // <<< CHANGE ONLY THIS VALUE

    const CHECK_INTERVAL = 1000;   // milliseconds

    const FLASH_CLASS = "kkPremiumFlash";

    /*******************************************************
     * CSS
     *******************************************************/

    if (!document.getElementById("kkPremiumStyle")) {

        const style = document.createElement("style");

        style.id = "kkPremiumStyle";

        style.textContent = `
            .${FLASH_CLASS}{
                animation:kkFlash .8s infinite;
            }

            @keyframes kkFlash{
                0%   { background:#ff4d4d; color:white; }
                50%  { background:#fff56b; color:black; }
                100% { background:#ff4d4d; color:white; }
            }
        `;

        document.head.appendChild(style);

    }

    /*******************************************************
     * ALERT SOUND
     *******************************************************/

    function beep() {

        const ctx =
            new (window.AudioContext || window.webkitAudioContext)();

        const osc = ctx.createOscillator();

        const gain = ctx.createGain();

        osc.type = "sine";

        osc.frequency.value = 900;

        osc.connect(gain);

        gain.connect(ctx.destination);

        osc.start();

        gain.gain.exponentialRampToValueAtTime(
            0.00001,
            ctx.currentTime + 0.35
        );

        osc.stop(ctx.currentTime + 0.35);

    }

    /*******************************************************
     * STATE
     *******************************************************/

    const alerted = new Set();

    /*******************************************************
     * MAIN LOOP
     *******************************************************/

    function scan() {

        document.querySelectorAll("tr").forEach(row => {

            const txt = row.innerText;

            if (!txt.includes("SENSEX"))
                return;

            if (!(txt.includes("CE") || txt.includes("PE")))
                return;

            //------------------------------------------------
            // Extract premium
            //------------------------------------------------

            const nums = txt.match(/\d+(\.\d+)?/g);

            if (!nums)
                return;

            const premium = parseFloat(nums[0]);

            const symbol =
                txt.match(/SENSEX\S+/)?.[0] || txt;

            //------------------------------------------------
            // Above Threshold
            //------------------------------------------------

            if (premium >= THRESHOLD) {

                row.classList.add(FLASH_CLASS);

                if (!alerted.has(symbol)) {

                    alerted.add(symbol);

                    beep();

                    console.log(
                        "ALERT:",
                        symbol,
                        premium
                    );

                }

            }

            //------------------------------------------------
            // Back below threshold
            //------------------------------------------------

            else {

                row.classList.remove(FLASH_CLASS);

                alerted.delete(symbol);

            }

        });

    }

    /*******************************************************
     * START
     *******************************************************/

    setInterval(scan, CHECK_INTERVAL);

    console.log(
        "SENSEX Premium Alert Started.",
        "Threshold =", THRESHOLD
    );

})();
