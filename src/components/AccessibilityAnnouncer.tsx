import { useEffect } from "react";

export const AccessibilityAnnouncer = () => {
  useEffect(() => {
    // Create live region for announcements
    if (!document.getElementById('accessibility-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'accessibility-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }

    // Announce page load
    const announce = (message: string) => {
      const announcer = document.getElementById('accessibility-announcer');
      if (announcer) {
        announcer.textContent = message;
        setTimeout(() => {
          announcer.textContent = '';
        }, 1000);
      }
    };

    // Announce when page is ready
    setTimeout(() => {
      announce('Booking form loaded and ready for input');
    }, 1000);

    // Focus management for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip to main content with Alt+M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          announce('Skipped to main content');
        }
      }

      // Skip to form with Alt+F
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          const firstInput = form.querySelector('input, select, textarea') as HTMLElement;
          if (firstInput) {
            firstInput.focus();
            announce('Skipped to booking form');
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Skip links for keyboard navigation */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <a 
          href="#main-content" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Skip to main content
        </a>
      </div>
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 z-50">
        <a 
          href="#booking-form" 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Skip to booking form
        </a>
      </div>
      
      {/* Keyboard shortcut help */}
      <div className="sr-only">
        <h2>Keyboard shortcuts</h2>
        <ul>
          <li>Alt + M: Skip to main content</li>
          <li>Alt + F: Skip to booking form</li>
          <li>Tab: Navigate between form fields</li>
          <li>Enter or Space: Activate buttons and links</li>
        </ul>
      </div>
    </>
  );
};