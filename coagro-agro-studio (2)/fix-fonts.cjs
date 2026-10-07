const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes("font-['Exo_2']")) {
        fs.writeFileSync(p, content.split("font-['Exo_2']").join("font-exo2"));
        console.log('Updated ' + p);
      }
    }
  });
}
walk('src');
