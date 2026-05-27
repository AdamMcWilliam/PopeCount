/**
 * AI demo page — odometer rolls to zero, then shows "So far....."
 */
const ODOMETER_DELAY_MS = 1000;
const FOOTNOTE_DELAY_MS = 2700;

function runDemo() {
  const odometer = document.getElementById("odometer");
  const footnote = document.getElementById("truePopeCount");
  if (!odometer) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const showZero = () => {
    odometer.innerHTML = "0";
    odometer.setAttribute("aria-label", "Zero popes so far");
  };

  const showSoFar = () => {
    if (footnote) footnote.textContent = "So far.....";
  };

  if (reducedMotion) {
    showZero();
    showSoFar();
    return;
  }

  setTimeout(showZero, ODOMETER_DELAY_MS);
  setTimeout(showSoFar, FOOTNOTE_DELAY_MS);
}

runDemo();
