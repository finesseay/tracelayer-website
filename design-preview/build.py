from pathlib import Path
import re
source=Path('index.html').read_text()
for name in ['before','after']:
 s=source.replace('<head>','<head><base href="../"><meta name="robots" content="noindex,nofollow">',1)
 s=s.replace('href="#','href="design-preview/'+name+'.html#')
 s=re.sub(r'<script[^>]*src="/assets/analytics.js"[^>]*></script>','',s)
 if name=='after':
  changes={
  'Imagine if you could effortlessly<br class="headline-break"> integrate <em>AI agents</em> into your team...':'Work with <em>AI agents</em><br class="headline-break"> from brief to review.',
  '<p>It used to be like this.</p>':'', '<p>The future is now.</p>':'',
  'Your old tools':'Across separate tools','Your new stack':'Together in TraceLayer',
  'Your company,<br>in every agent.':'Give agents your<br>company context.',
  'Your culture, your decisions, the details only your team knows. Capture them in company documents and lasting guidance. Agents read it before each task, then apply it to the work.':'Keep company decisions and working methods in shared guidance. Agents read it before each task.',
  '<div class="detail">Your guidance shapes every task and its result.</div>':'',
  '<div class="detail">From expert methods to everyday collaboration.</div>':'',
  'A platform that<br>keeps giving.':'Keep knowledge and<br>operations in order.',
  'Behind your team, platform agents keep knowledge organised, check the work and repair scoped faults. They learn from what happens and recommend improvements, with guidance changes yours to review.':'Platform agents organise knowledge, check operations and repair scoped faults. You review proposed guidance changes.',
  '<div class="detail">Five roles keeping the work on track.</div>':'',
  'The platform behind<br>the whole operation.':'Models, data and oversight.',
  'Ready when you are.<br>So are our agents.':'Create your workspace.',
  'See it in action.':'Watch a task take shape.',
  'Product news and updates.<br>From our team to yours.':'Product news and updates.'}
  for old,new in changes.items():
   assert old in s,old
   s=s.replace(old,new)
  s=s.replace('<div class="hero-content">','<div class="hero-content">',1)
  # Local styles inside the existing shadow roots preserve the website visual system.
  s=s.replace('<div class="hero-surface orbit-study', '<style>.layout-study .intro h1{max-width:1000px;line-height:1.12}.comparison-heading{margin-bottom:22px}.demo-disclosure{color:#b4bfd2;font-size:12px;line-height:1.5;text-align:center;margin:18px auto 0;max-width:600px}@media(max-width:760px){.layout-study .intro{margin:18px 0 28px}.layout-study .intro h1{font-size:36px;letter-spacing:-1.3px}.comparison .new-stack{order:-2}.comparison .versus{display:none}.comparison .old-stack{margin-top:40px}.new-stack-content .brand-element{display:none}.new-stack-content{display:block}}</style><div class="hero-surface orbit-study',1)
  s=s.replace('\n</div></div></template></section></div>','<p class="demo-disclosure">Illustrative launch project. Named agents are fictional personas, not endorsements by the people shown.</p>\n</div></div></template></section></div>',1)
  s=s.replace('<div class="features-content">','<style>.copy .kicker{display:none}.copy h2{margin-top:0}.copy p{max-width:440px}</style><div class="features-content">',1)
 s=s.replace('<base href="../">', '<base href="../"><script>document.querySelector("base").href=new URL("../",location.href).href;</script>')
 Path('design-preview/'+name+'.html').write_text(s)
