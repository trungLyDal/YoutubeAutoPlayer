(function() {
  const CHECK_INTERVAL_MS = 2000; 
  const INACTIVITY_ALERT_MS = 15 * 60 * 1000; 

  let lastActivityTime = Date.now(); 
  let promptAppearTime = 0;       
  let promptDetected = false;      
  let inactivityTimer = null;       

  // --- Helper for consistent logging ---
  function log(message, ...args) {
    console.log("YouTube NonStop Watcher:", message, ...args);
  }

  // --- Function to start/reset the inactivity timer ---
  function startInactivityTimer() {
    clearTimeout(inactivityTimer); // Clear any existing timer
    inactivityTimer = setTimeout(() => {
      const now = Date.now();
      const actualInactivityDurationMs = now - lastActivityTime;
      const actualInactivityDurationMinutes = (actualInactivityDurationMs / (60 * 1000)).toFixed(1);
      
      log(`User unresponsive for ~15 minutes. Actual inactivity: ${actualInactivityDurationMinutes} minutes.`);
      log(`Last recorded activity at: ${new Date(lastActivityTime).toLocaleTimeString()}`);
      

    }, INACTIVITY_ALERT_MS);
  }

  // --- Functions to update lastActivityTime and reset inactivity timer ---
  function updateLastActivity() {
    const previousActivityTime = lastActivityTime;
    lastActivityTime = Date.now();
    startInactivityTimer(); // Reset the 15-minute timer on every activity


  }

  // Add event listeners for mouse and keyboard activity
  document.addEventListener('mousemove', updateLastActivity);
  document.addEventListener('keydown', updateLastActivity);
  document.addEventListener('scroll', updateLastActivity);

  // Initialize the inactivity timer when the script loads
  startInactivityTimer();

  // --- Main function to click 'Continue watching' ---
  function clickContinueWatching() {
    const confirmationDialog = document.querySelector('yt-confirm-dialog-renderer'); 
    
    if (confirmationDialog && confirmationDialog.offsetWidth > 0 && confirmationDialog.offsetHeight > 0) {
      // Prompt is visible
      if (!promptDetected) {
        promptAppearTime = Date.now();
        promptDetected = true; // Set flag to true so we only log this once per prompt appearance
        const inactivityDurationMs = promptAppearTime - lastActivityTime;
        const inactivityDurationSeconds = (inactivityDurationMs / 1000).toFixed(1);

        log(`--- PROMPT DETECTED ---`);
        log(`Last User Activity: ${new Date(lastActivityTime).toLocaleTimeString()} (${lastActivityTime})`);
        log(`Prompt Appeared Time: ${new Date(promptAppearTime).toLocaleTimeString()} (${promptAppearTime})`);
        log(`Inactivity Duration Before Prompt: ${inactivityDurationSeconds} seconds`);
      }

      let continueButton = confirmationDialog.querySelector('yt-button-renderer a.yt-button-renderer');
      
      if (!continueButton) {
        const buttons = confirmationDialog.querySelectorAll('button');
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          if (button.textContent.includes('Yes') || button.textContent.includes('Continue watching')) {
            continueButton = button;
            break;
          }
        }
      }

      if (continueButton) {
        const preventionTime = Date.now();
        const timeToPreventMs = preventionTime - promptAppearTime;
        const timeToPreventSeconds = (timeToPreventMs / 1000).toFixed(1);

        log("Found VISIBLE 'Continue watching' prompt. Clicking it.");
        log(`Prevention Time: ${new Date(preventionTime).toLocaleTimeString()} (${preventionTime})`);
        log(`Time from Prompt Appearance to Prevention: ${timeToPreventSeconds} seconds`);
        log(`-----------------------`);

        continueButton.click();
        
        promptDetected = false; 
        promptAppearTime = 0;
    
        startInactivityTimer(); 

        return true;
      }
    } else {
      if (promptDetected) {
        log("Prompt is no longer visible.");
        promptDetected = false;
        promptAppearTime = 0;
      }
    }
    return false;
  }

  setInterval(clickContinueWatching, CHECK_INTERVAL_MS);

  log("Extension loaded and monitoring for 'Are you still watching?' prompt.");
  log(`Initial Last User Activity: ${new Date(lastActivityTime).toLocaleTimeString()} (based on script load)`);

})();