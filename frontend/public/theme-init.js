(function () {
  try {
    var storedTheme = window.localStorage.getItem('nutracore_theme');
    var shouldUseDark =
      storedTheme === 'dark' ||
      (!storedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (shouldUseDark) {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (_error) {
    // Ignore storage access errors and continue with default light theme.
  }
})();
