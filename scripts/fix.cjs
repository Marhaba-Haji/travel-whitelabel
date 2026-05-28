const fs = require('fs');

let html = fs.readFileSync('C:\\\\Marhaba Ventures\\\\Marhaba DMC\\\\marhabadmc\\\\scripts\\\\input.html', 'utf8');

const tokens = {
  colors: [
    "background", "on-tertiary-fixed", "primary-container", "on-primary", 
    "on-secondary", "primary-fixed-dim", "secondary-fixed", "on-error", 
    "primary-fixed", "on-primary-container", "error", "surface-container-low", 
    "outline", "tertiary-fixed-dim", "surface-variant", "surface", 
    "secondary-fixed-dim", "on-surface-variant", "on-secondary-fixed-variant", 
    "on-error-container", "tertiary", "on-surface", "on-primary-fixed", 
    "surface-tint", "on-secondary-container", "surface-bright", "error-container", 
    "surface-container-high", "on-primary-fixed-variant", "surface-dim", 
    "primary", "inverse-on-surface", "surface-container-highest", "on-background", 
    "secondary", "tertiary-fixed", "surface-container", "on-tertiary", 
    "outline-variant", "inverse-primary", "surface-container-lowest", 
    "on-secondary-fixed", "tertiary-container", "on-tertiary-fixed-variant", 
    "inverse-surface", "on-tertiary-container", "secondary-container"
  ],
  spacing: [
    "stack-md", "section-gap-mobile", "section-gap", "stack-sm", 
    "stack-lg", "container-max", "gutter", "margin-x"
  ],
  fonts: [
    "label-bold", "headline-xl", "headline-md", "body-lg", 
    "headline-lg-mobile", "cta", "headline-lg", "body-md", "headline-md-mobile"
  ]
};

const prefixes = {
  colors: ['bg-', 'text-', 'border-', 'border-t-', 'border-b-', 'border-x-', 'border-y-', 'from-', 'via-', 'to-', 'ring-', 'selection:bg-', 'selection:text-'],
  spacing: ['p-', 'pt-', 'pb-', 'px-', 'py-', 'm-', 'mt-', 'mb-', 'mx-', 'my-', 'gap-', 'space-x-', 'space-y-', 'w-', 'h-', 'max-w-', 'min-h-'],
  fonts: ['font-', 'text-'] // e.g. text-headline-xl
};

for (let type in tokens) {
  for (let token of tokens[type]) {
    for (let prefix of prefixes[type]) {
      const search = prefix + token;
      const replacement = prefix + 'mc-' + token;
      
      html = html.split('"' + search + '"').join('"' + replacement + '"');
      html = html.split('"' + search + ' ').join('"' + replacement + ' ');
      html = html.split(' ' + search + '"').join(' ' + replacement + '"');
      html = html.split(' ' + search + ' ').join(' ' + replacement + ' ');
    }
  }
}

for (let type in tokens) {
  for (let token of tokens[type]) {
    for (let prefix of prefixes[type]) {
      const searchStr = prefix + token;
      const replaceStr = prefix + 'mc-' + token;
      const regex = new RegExp('([\\"\\\\s])(' + searchStr + ')(/[0-9]+)?([\\"\\\\s])', 'g');
      html = html.replace(regex, '$1' + replaceStr + '$3$4');
    }
  }
}

let bodyContent = '';
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
  bodyContent = bodyMatch[1];
}

bodyContent = bodyContent.replace(/class="/g, 'className="');
bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');
bodyContent = bodyContent.replace(/<img([^>]*)>/g, '<img$1 />');
bodyContent = bodyContent.replace(/<br>/g, '<br />');

bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styleString) => {
  const parts = styleString.split(';').filter(p => p.trim() !== '');
  const styleObj = {};
  for (let part of parts) {
    const [key, value] = part.split(':').map(s => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
      styleObj[camelKey] = value;
    }
  }
  return 'style={' + JSON.stringify(styleObj) + '}';
});

bodyContent = bodyContent.replace(/<button([^>]*)>/g, '<button$1 onClick={() => setOpen(true)}>');

fs.writeFileSync('C:\\\\Marhaba Ventures\\\\Marhaba DMC\\\\marhabadmc\\\\scripts\\\\generated.jsx', bodyContent);
console.log('Conversion successful!');
