(function () {

"use strict";

/************************************************************
 * Configuration
 ************************************************************/

const THRESHOLD = 10;          // <<< CHANGE ONLY THIS
const POLL_INTERVAL = 500;     // milliseconds
const WATCH_ONLY_SENSEX = true;


/************************************************************
 * Internal state
 ************************************************************/

const alerted = new Map();


/************************************************************
 * Inject flashing CSS
 ************************************************************/

const style = document.createElement("style");

style.textContent = `

.kk-premium-alert{

    animation: kkFlash .8s infinite !important;

}

@keyframes kkFlash{

    0%{
        background:#ff4d4d;
    }

    50%{
        background:#fff36b;
    }

    100%{
        background:#ff4d4d;
    }

}

`;

document.head.appendChild(style);


/************************************************************
 * Play sound once
 ************************************************************/

function playAlert(){

    const ctx =
        new (window.AudioContext ||
             window.webkitAudioContext)();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880;

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.value = 0.20;

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.30
    );

    osc.stop(ctx.currentTime + 0.30);

}


/************************************************************
 * Extract premium
 ************************************************************/

function getPremium(row){

    const span =
        row.querySelector(".last-price");

    if(!span)
        return null;

    const value =
        parseFloat(
            span.innerText
                .replace(/,/g,"")
                .trim()
        );

    return isNaN(value)
        ? null
        : value;

}


/************************************************************
 * Instrument name
 ************************************************************/

function getName(row){

    return row.querySelector(".name")
        ?.innerText
        ?.trim() || "";

}


/************************************************************
 * Scan MarketWatch
 ************************************************************/

function scan(){

    const rows =
        document.querySelectorAll(
            ".marketwatch .items .item-wrapper"
        );

    rows.forEach(row=>{

        const id =
            row.dataset.id;

        if(!id)
            return;

        const name =
            getName(row);

        if(WATCH_ONLY_SENSEX){

            if(!name.includes("SENSEX"))
                return;

            if(
                !name.includes("CE") &&
                !name.includes("PE")
            )
                return;

        }

        const premium =
            getPremium(row);

        if(premium==null)
            return;

        const already =
            alerted.get(id) || false;


        //--------------------------------------------------
        // Crossed threshold
        //--------------------------------------------------

        if(premium >= THRESHOLD){

            row.classList.add(
                "kk-premium-alert"
            );

            if(!already){

                alerted.set(id,true);

                console.log(
                    "ALERT",
                    name,
                    premium
                );

                playAlert();

            }

        }

        //--------------------------------------------------
        // Came below threshold
        //--------------------------------------------------

        else{

            row.classList.remove(
                "kk-premium-alert"
            );

            alerted.set(id,false);

        }

    });

}


/************************************************************
 * Start monitor
 ************************************************************/

if(window.__kkPremiumMonitor){

    clearInterval(window.__kkPremiumMonitor);

}

window.__kkPremiumMonitor =
    setInterval(scan,POLL_INTERVAL);

console.clear();

console.log("");

console.log("===================================");

console.log(" Premium Monitor Started");

console.log(" Threshold :",THRESHOLD);

console.log(" Interval  :",POLL_INTERVAL,"ms");

console.log("===================================");

})();
