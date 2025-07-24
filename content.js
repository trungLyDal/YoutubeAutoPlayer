(function() {
  const CHECK_INTERVAL_MS = 2000;
  const INACTIVITY_ALERT_MS = 15 * 60 * 1000;
  const INACTIVITY_START_LOG_DELAY_MS = 10 * 1000;

  let lastActivityTime = Date.now(); // This will now track the actual last interaction
  let inactivityStartTime = Date.now(); // NEW: This will track when inactivity *officially* started
  let promptAppearTime = 0;
  let promptDetected = false;

  let inactivityTimer = null;
  let activityMonitorTimer = null;
  let isInactive = false;

  function log(message, ...args) {
    console.log("YouTube NonStop Watcher:", message, ...args);
  }

  function startInactivityAlertTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      const now = Date.now();
      const actualInactivityDurationMinutes = ((now - inactivityStartTime) / (60 * 1000)).toFixed(1); // Use inactivityStartTime here
      
      log(`User unresponsive for ~15 minutes. Actual inactivity: ${actualInactivityDurationMinutes} minutes.`);
      log(`Last recorded activity at: ${new Date(inactivityStartTime).toLocaleTimeString()} (${inactivityStartTime})`); // Use inactivityStartTime here for the "at" log
    }, INACTIVITY_ALERT_MS);
  }

  function resetActivityMonitor() {
    clearTimeout(activityMonitorTimer);

    if (isInactive) {
      const now = Date.now();
      const durationOfInactivityMs = now - inactivityStartTime; // CORRECTED: Use inactivityStartTime
      const durationOfInactivitySeconds = (durationOfInactivityMs / 1000).toFixed(1);

      log(`User activity resumed at: ${new Date(now).toLocaleTimeString()} (${now})`);
      log(`Duration of inactivity: ${durationOfInactivitySeconds} seconds`);
      isInactive = false;
    }

    activityMonitorTimer = setTimeout(() => {
      if (!isInactive) {
        const now = Date.now();
        inactivityStartTime = now; // NEW: Mark the official start of inactivity
        log(`Inactivity started at: ${new Date(now).toLocaleTimeString()} (${now}) (no activity for ${INACTIVITY_START_LOG_DELAY_MS / 1000} seconds)`);
        isInactive = true;
      }
    }, INACTIVITY_START_LOG_DELAY_MS);
  }

  function updateLastActivity() {
    lastActivityTime = Date.now(); // This still tracks the very last interaction for prompt calculation
    
    startInactivityAlertTimer();
    
    resetActivityMonitor();
  }

  document.addEventListener('mousemove', updateLastActivity);
  document.addEventListener('keydown', updateLastActivity);
  document.addEventListener('scroll', updateLastActivity);
  document.addEventListener('mousedown', updateLastActivity);

  startInactivityAlertTimer();
  resetActivityMonitor();

  function clickContinueWatching() {
    const confirmationDialog = document.querySelector('yt-confirm-dialog-renderer'); 
    
    if (confirmationDialog && confirmationDialog.offsetWidth > 0 && confirmationDialog.offsetHeight > 0) {
      if (!promptDetected) {
        promptAppearTime = Date.now();
        promptDetected = true;
        const inactivityDurationMs = promptAppearTime - lastActivityTime; // Still use lastActivityTime for prompt calc
        const inactivityDurationSeconds = (inactivityDurationMs / 1000).toFixed(1);

        log(`--- PROMPT DETECTED ---`);
        log(`Last User Activity Before Prompt Trigger: ${new Date(lastActivityTime).toLocaleTimeString()} (${lastActivityTime})`);
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
        
        // After an automated click, treat it as activity to reset inactivity state and timers
        updateLastActivity(); 

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
  log(`Initial Last User Activity (script load): ${new Date(lastActivityTime).toLocaleTimeString()} (${lastActivityTime})`);

})();