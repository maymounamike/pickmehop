import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Load security headers on app initialization
    const loadSecurityHeaders = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('security-headers');
        
        if (error) {
          console.warn('Failed to load security headers:', error);
          return;
        }
        
        console.log('Security headers loaded successfully');
        
        // Apply additional client-side security measures
        
        // Disable right-click context menu in production
        if (import.meta.env.PROD) {
          document.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        
        // Disable common dev tools shortcuts in production
        if (import.meta.env.PROD) {
          document.addEventListener('keydown', (e) => {
            if (
              (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
              (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C
              (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
              (e.key === 'F12') // F12
            ) {
              e.preventDefault();
            }
          });
        }
        
      } catch (error) {
        console.warn('Security headers initialization failed:', error);
      }
    };

    loadSecurityHeaders();
  }, []);

  return <>{children}</>;
};