// =============================================
// Premium Alert
// Author : Krish
// Version: 1.0
// =============================================

(function () {

    if (window.KK_PREMIUM_ALERT_RUNNING) {
        alert("Premium Alert is already running.");
        return;
    }

    window.KK_PREMIUM_ALERT_RUNNING = true;

    const CONFIG = {

        underlying: "SENSEX",

        threshold: 20,

        interval: 1000,

        sound: true

    };

    const alerted = {};

    //-------------------------------------------------
    // Alarm
    //-------------------------------------------------

    function beep() {

        if (!CONFIG.sound)
            return;

        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = 900;
        osc.type = "square";

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.value = 0.20;

        osc.start();

        setTimeout(() => {

            osc.stop();
            ctx.close();

        },300);

    }

    //-------------------------------------------------
    // Flash Style
    //-------------------------------------------------

    if (!document.getElementById("kkPremiumAlertStyle")) {

        const css = document.createElement("style");

        css.id = "kkPremiumAlertStyle";

        css.innerHTML = `

@keyframes kkFlash{

0%{background:#ffe066;}

50%{background:#ff3b30;}

100%{background:#ffe066;}

}

.kkPremiumFlash{

animation:kkFlash .8s infinite !important;

}

`;

        document.head.appendChild(css);

    }

    //-------------------------------------------------

    function scan(){

        document.querySelectorAll("div.instrument").forEach(row=>{

            const txt=row.innerText;

            if(!txt.includes(CONFIG.underlying))
                return;

            const symbolMatch=txt.match(/SENSEX\d+(CE|PE)/);

            if(!symbolMatch)
                return;

            const symbol=symbolMatch[0];

            const nums=txt.match(/\d+(\.\d+)?/g);

            if(!nums)
                return;

            const premium=parseFloat(nums[0]);

            if(isNaN(premium))
                return;

            //--------------------------------------------

            if(premium>=CONFIG.threshold){

                row.classList.add("kkPremiumFlash");

                if(!alerted[symbol]){

                    alerted[symbol]=true;

                    console.log(
                        symbol,
                        "Premium crossed",
                        CONFIG.threshold,
                        premium
                    );

                    beep();

                }

            }
            else{

                alerted[symbol]=false;

                row.classList.remove("kkPremiumFlash");

            }

        });

    }

    setInterval(scan,CONFIG.interval);

    console.log(
        "Premium Alert Started",
        CONFIG
    );

})();
