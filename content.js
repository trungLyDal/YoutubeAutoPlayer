(function() {
  const CHECK_INTERVAL_MS = 2000; 

  function clickContinueWatching() {
    const confirmationDialog = document.querySelector('yt-confirm-dialog-renderer'); 
    

    if (confirmationDialog && confirmationDialog.offsetWidth > 0 && confirmationDialog.offsetHeight > 0) {
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
        console.log("YouTube NonStop Watcher: Found VISIBLE 'Continue watching' prompt. Clicking it.");
        continueButton.click();
        return true;
      }
    }
    return false;
  }

  setInterval(clickContinueWatching, CHECK_INTERVAL_MS);

  console.log("YouTube NonStop Watcher: Extension loaded and monitoring for 'Are you still watching?' prompt.");
})();