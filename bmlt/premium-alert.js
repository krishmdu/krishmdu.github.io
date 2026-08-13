(function () {

    "use strict";

    /************************************************************
     * Configuration
     ************************************************************/

    const CONFIG = {

        THRESHOLD: 6,

        SCAN_INTERVAL: 5000,

        FLASH_INTERVAL: 500

    };


    /************************************************************
     * Internal state
     ************************************************************/

    const alerted = new Set();

    let flashTimer = null;


    /************************************************************
     * Inject CSS
     ************************************************************/

    const style = document.createElement("style");

    style.textContent = `

.kr-alert-row{

    background:#ff3030 !important;

    color:white !important;

}

`;

    document.head.appendChild(style);


    /************************************************************
     * Beep
     ************************************************************/

    function beep(){

        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const osc = ctx.createOscillator();

        osc.frequency.value = 900;

        osc.connect(ctx.destination);

        osc.start();

        osc.stop(ctx.currentTime + 0.25);

    }


    /************************************************************
     * Flash rows
     ************************************************************/

    function startFlash(){

        if(flashTimer) return;

        flashTimer = setInterval(()=>{

            document
                .querySelectorAll(".kr-alert-row")
                .forEach(r=>{

                    r.style.visibility =
                        r.style.visibility==="hidden"
                        ?"visible"
                        :"hidden";

                });

        },CONFIG.FLASH_INTERVAL);

    }


    /************************************************************
     * Scan Watchlist
     ************************************************************/

    function scan(){

        const rows =
            document.querySelectorAll(
                ".marketwatch-content .item-wrapper.draggable-item"
            );

        rows.forEach(row=>{

            const info =
                row.querySelector(".item-info");

            if(!info) return;

            const name =
                info.querySelector(".name")?.innerText.trim() || "";

            if(!name.startsWith("SENSEX"))
                return;

            const txt =
                info.querySelector(".last-price")?.innerText.trim();

            if(!txt) return;

            const premium =
                parseFloat(txt.replace(/,/g,""));

            if(isNaN(premium))
                return;

            if(premium>=CONFIG.THRESHOLD){

                if(!alerted.has(name)){

                    alerted.add(name);

                    console.log(
                        "ALERT:",
                        name,
                        premium
                    );

                    beep();

                }

                row.classList.add("kr-alert-row");

            }
            else{

                alerted.delete(name);

                row.classList.remove("kr-alert-row");

                row.style.visibility="visible";

            }

        });

    }


    /************************************************************
     * Start
     ************************************************************/

    console.clear();

    console.log("--------------------------------");

    console.log("SENSEX Premium Alert Started");

    console.log("Threshold :",CONFIG.THRESHOLD);

    console.log("--------------------------------");

    scan();

    setInterval(scan,CONFIG.SCAN_INTERVAL);

    startFlash();

})();
