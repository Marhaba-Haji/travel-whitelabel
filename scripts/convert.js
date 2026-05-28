const fs = require('fs');

let newHtml = fs.readFileSync('C:\\\\Marhaba Ventures\\\\Marhaba DMC\\\\marhabadmc\\\\scripts\\\\input.html', 'utf8');

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
  colors: ['bg-', 'text-', 'border-', 'border-t-', 'from-', 'via-', 'to-', 'ring-'],
  spacing: ['p-', 'pt-', 'pb-', 'px-', 'py-', 'm-', 'mt-', 'mb-', 'mx-', 'my-', 'gap-', 'space-x-', 'space-y-', 'w-', 'h-', 'max-w-', 'min-h-', 'gap-'],
  fonts: ['font-', 'text-']
};

for (const type of ['colors', 'spacing', 'fonts']) {
  for (const token of tokens[type]) {
    for (const prefix of prefixes[type]) {
      const regex = new RegExp("(?<=\\\\s|\\"|'|`)" + prefix + token + "(?=\\\\s|\\"|'|`|-|/|$)", "g");
      newHtml = newHtml.replace(regex, prefix + "mc-" + token);
    }
  }
}

newHtml = newHtml.replace(/class=/g, 'className=')
                 .replace(/<!--.*?-->/g, '')
                 .replace(/<img(.*?)>/g, '<img$1 />')
                 .replace(/<link(.*?)>/g, '<link$1 />')
                 .replace(/<meta(.*?)>/g, '<meta$1 />')
                 .replace(/<br>/g, '<br />')
                 .replace(/style="([^"]*)"/g, function(match, p1) {
                   var obj = p1.split(';').filter(Boolean).map(function(s) {
                     var kv = s.split(':').map(function(str) { return str.trim(); });
                     var key = kv[0].replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
                     return '"' + key + '": "' + kv[1] + '"';
                   }).join(', ');
                   return "style={{" + obj + "}}";
                 });

var bodyMatch = newHtml.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/);
var jsxContent = bodyMatch ? bodyMatch[1] : '';

jsxContent = jsxContent.replace(/<button([^>]*)>([\\s\\S]*?)<\\/button>/g, function(match, attrs, content) {
  return "<button" + attrs + " onClick={() => setOpen(true)}>" + content + "</button>";
});

fs.writeFileSync('C:\\\\Marhaba Ventures\\\\Marhaba DMC\\\\marhabadmc\\\\scripts\\\\generated_jsx.txt', jsxContent);
console.log("Done");
