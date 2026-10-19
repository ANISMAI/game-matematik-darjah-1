import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Keep the imported homepage's reset, theme and utilities inside its own screen.
const scopeDojo = {
  postcssPlugin: 'scope-dojo-homepage',
  OnceExit(root) {
    const file = root.source?.input.file?.replaceAll('\\', '/');
    if (!file?.endsWith('/src/home/dojo.css')) return;
    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
      rule.selectors = [
        ...new Set(
          rule.selectors.map((selector) => {
            if (selector.startsWith('.dojo-home')) return selector;
            if (selector === 'html' || selector === 'body' || selector === ':host' || selector === ':root')
              return '.dojo-home';
            if (selector.includes(':root')) return selector.replaceAll(':root', '.dojo-home');
            return `.dojo-home ${selector}`;
          }),
        ),
      ];
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: { postcss: { plugins: [scopeDojo] } },
});
