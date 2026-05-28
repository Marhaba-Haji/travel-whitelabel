const fs = require('fs');

const masterclassPath = 'C:\\\\Marhaba Ventures\\\\Marhaba DMC\\\\marhabadmc\\\\src\\\\pages\\\\Masterclass.tsx';
const jsxPath = 'C:\\\\Marhaba Ventures\\\\Marhaba DMC\\\\marhabadmc\\\\scripts\\\\generated.jsx';

const original = fs.readFileSync(masterclassPath, 'utf8');
const jsx = fs.readFileSync(jsxPath, 'utf8');

const returnIndex = original.lastIndexOf('\\n  return (');
if (returnIndex === -1) throw new Error('Return statement not found');

const topPart = original.substring(0, returnIndex);

let dynamicJsx = jsx
  .replace(/₹99/g, '{grossLabel}')
  .replace(/₹1,999/g, '{s.bonuses[0]?.value || "₹1,999"}')
  .replace(/₹2,499/g, '{s.bonuses[1]?.value || "₹2,499"}')
  .replace(/₹4,999/g, '{s.bonuses[2]?.value || "₹4,999"}')
  .replace(/₹9,497/g, '₹{totalBonusValue.toLocaleString("en-IN")}')
  .replace(/Harab Rasheed/g, '{s.host_name}')
  .replace(/<header className="fixed top-0/g, `<SEOHead title={\`\${s.title} — Live Masterclass with \${s.host_name}\`} description={s.subtitle} path="/masterclass" type="website" jsonLd={eventJsonLd as any} keywords={["travel business masterclass", "start travel agency india", "scale travel business", "tourism webinar", s.host_name]} />\n<header className="fixed top-0`);

const finalCode = topPart + 
  `\n  return (
    <div className="mc-design-wrapper bg-mc-background text-mc-on-background font-mc-body-md overflow-x-hidden selection:bg-mc-secondary-fixed selection:text-mc-on-secondary-fixed pt-16 pb-[90px] min-h-screen">
` +
  dynamicJsx +
  `      <RegisterDialog open={open} onOpenChange={setOpen} priceInr={Number(s.price_inr)} isFree={s.is_free} title={s.title} />
    </div>
  );
};

export default Masterclass;
`;

fs.writeFileSync(masterclassPath, finalCode);
console.log('Assembled successfully!');
