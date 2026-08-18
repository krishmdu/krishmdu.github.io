(function () {
  const REFRESH_MS = 5000;

  // Prevent duplicate execution
  if (window.N50IndicativeCloseTimer) {
    clearInterval(window.N50IndicativeCloseTimer);
  }

  let panel = document.getElementById("N50IndicativeClosePanel");

  if (!panel) {
    panel = document.createElement("div");

    panel.id = "N50IndicativeClosePanel";

    panel.style.cssText = `
position:fixed;
top:10px;
left:10px;
background:#1565c0;
color:#fff;
padding:10px 14px;
font:700 16px Consolas,Arial;
border-radius:8px;
box-shadow:0 4px 12px rgba(0,0,0,.35);
z-index:2147483647;
min-width:180px;
text-align:left;
`;

    document.body.appendChild(panel);
  }

  function getIndicativeClose() {
    const wrapper = [...document.querySelectorAll(".item-wrapper")].find(
      (w) => {
        const n = w.querySelector(".name");

        return n && n.innerText.trim() === "NIFTY 50";
      },
    );

    if (!wrapper) {
      console.log("NIFTY wrapper not found");

      return null;
    }

    const label = [...wrapper.querySelectorAll("label")].find(
      (l) => l.innerText.trim().toLowerCase() === "indicative close",
    );

    if (!label) {
      console.log("Indicative Close label not found");

      return null;
    }

    const value = label.parentElement.querySelector(".value");

    if (!value) {
      console.log("Value not found");

      return null;
    }

    console.log("Indicative Close =", value.innerText);

    return value.innerText.trim();
  }
  function updatePanel() {
    const ic = getIndicativeClose();

    panel.innerHTML = `
<div style="font-size:13px;color:#BBDEFB;">
NIFTY 50
</div>

<div style="margin-top:4px;font-size:13px;">
Indicative Close
</div>

<div style="margin-top:3px;font-size:24px;">
${ic || "--"}
</div>

<div style="margin-top:6px;font-size:11px;color:#BBDEFB;">
${new Date().toLocaleTimeString()}
</div>
`;
  }

  updatePanel();

  window.N50IndicativeCloseTimer = setInterval(updatePanel, REFRESH_MS);
})();
