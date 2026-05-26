import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Plugin: Build works index.json from individual JSON files
function worksIndexPlugin() {
  return {
    name: 'works-index',
    buildStart() {
      const worksDir = resolve(__dirname, 'public/content/works');
      if (!fs.existsSync(worksDir)) return;
      const files = fs.readdirSync(worksDir).filter(f => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('.') && !f.startsWith('._'));
      const works = files.map(f => JSON.parse(fs.readFileSync(resolve(worksDir, f), 'utf-8')));
      works.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
      fs.writeFileSync(resolve(worksDir, 'index.json'), JSON.stringify(works, null, 2));
      console.log(`[works-index] Generated index.json with ${works.length} works`);
    }
  };
}

export default defineConfig({
  base: '/',
  plugins: [worksIndexPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        works: resolve(__dirname, 'works/index.html'),
        worksDetail: resolve(__dirname, 'works/detail.html'),
      },
    },
  },
});
