// Force calendar orange styling after DOM loads
document.addEventListener('DOMContentLoaded', function() {
  function forceOrangeCalendar() {
    // Target all possible calendar date elements
    const selectors = [
      'button[aria-selected="true"]',
      '.rdp-day_selected',
      '.rdp-day[aria-selected="true"]',
      '[role="gridcell"][aria-selected="true"]'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element) {
          element.style.setProperty('background-color', 'hsl(17, 93%, 54%)', 'important');
          element.style.setProperty('background', 'hsl(17, 93%, 54%)', 'important');
          element.style.setProperty('color', 'white', 'important');
          element.style.setProperty('border-color', 'hsl(17, 93%, 54%)', 'important');
        }
      });
    });
  }
  
  // Run immediately
  forceOrangeCalendar();
  
  // Run when calendar opens (observe DOM changes)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        forceOrangeCalendar();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});