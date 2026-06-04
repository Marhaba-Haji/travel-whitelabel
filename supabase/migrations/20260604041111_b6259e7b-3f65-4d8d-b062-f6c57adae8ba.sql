INSERT INTO public.tracking_scripts (id, name, provider, placement, code, is_enabled, load_strategy, sort_order)
VALUES
(
  gen_random_uuid(),
  'Google Analytics 4',
  'google',
  'head',
  '<script async src="https://www.googletagmanager.com/gtag/js?id=G-R9W5JVYZZW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag(''js'', new Date());
  gtag(''config'', ''G-R9W5JVYZZW'');
</script>',
  true,
  'exclude_admin',
  1
),
(
  gen_random_uuid(),
  'Meta Pixel',
  'facebook',
  'head',
  '<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=''2.0'';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,''script'',''https://connect.facebook.net/en_US/fbevents.js'');
fbq(''init'',''1955006625447985'');
fbq(''track'',''PageView'');
</script>',
  true,
  'exclude_admin',
  2
),
(
  gen_random_uuid(),
  'Meta Pixel Noscript Fallback',
  'facebook',
  'body_start',
  '<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1955006625447985&ev=PageView&noscript=1"/></noscript>',
  true,
  'exclude_admin',
  3
);