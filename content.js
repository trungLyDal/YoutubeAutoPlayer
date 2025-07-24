(function() {
  const CHECK_INTERVAL_MS = 2000; 

  let lastActivityTime = Date.now(); 
  let promptAppearTime = 0;         
  let promptDetected = false;       

  function updateLastActivity() {
    lastActivityTime = Date.now();
  }

  document.addEventListener('mousemove', updateLastActivity);
  document.addEventListener('keydown', updateLastActivity);
  document.addEventListener('scroll', updateLastActivity); 

  // --- Main function to click 'Continue watching' ---
  function clickContinueWatching() {
    const confirmationDialog = document.querySelector('yt-confirm-dialog-renderer'); 
    
    if (confirmationDialog && confirmationDialog.offsetWidth > 0 && confirmationDialog.offsetHeight > 0) {
      // Prompt is visible
      if (!promptDetected) {
        promptAppearTime = Date.now();
        promptDetected = true; 
        const inactivityDurationMs = promptAppearTime - lastActivityTime;
        const inactivityDurationSeconds = (inactivityDurationMs / 1000).toFixed(1);

        console.log(`--- PROMPT DETECTED ---`);
        console.log(`Last User Activity: ${new Date(lastActivityTime).toLocaleTimeString()} (${lastActivityTime})`);
        console.log(`Prompt Appeared Time: ${new Date(promptAppearTime).toLocaleTimeString()} (${promptAppearTime})`);
        console.log(`Inactivity Duration Before Prompt: ${inactivityDurationSeconds} seconds`);
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

        console.log("YouTube NonStop Watcher: Found VISIBLE 'Continue watching' prompt. Clicking it.");
        console.log(`Prevention Time: ${new Date(preventionTime).toLocaleTimeString()} (${preventionTime})`);
        console.log(`Time from Prompt Appearance to Prevention: ${timeToPreventSeconds} seconds`);
        console.log(`-----------------------`);

        continueButton.click();
        
        promptDetected = false; 
        promptAppearTime = 0;

        return true;
      }
    } else {
   
      if (promptDetected) {
        console.log("YouTube NonStop Watcher: Prompt is no longer visible.");
        promptDetected = false;
        promptAppearTime = 0;
      }
    }
    return false;
  }

  setInterval(clickContinueWatching, CHECK_INTERVAL_MS);

  console.log("YouTube NonStop Watcher: Extension loaded and monitoring for 'Are you still watching?' prompt.");
  console.log(`Initial Last User Activity: ${new Date(lastActivityTime).toLocaleTimeString()} (based on script load)`);

})();