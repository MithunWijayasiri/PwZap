const setupColorSchemeDetection = (): () => void => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.toggle('dark-mode', prefersDark);
  document.body.classList.toggle('light-mode', !prefersDark);
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    document.body.classList.toggle('dark-mode', e.matches);
    document.body.classList.toggle('light-mode', !e.matches);
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
};

export { setupColorSchemeDetection }; 