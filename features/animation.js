(() => {
  const host = document.querySelector('#team-benefits');
  if (!host) return;
  if (!host.shadowRoot) {
    const template = host.querySelector('template');
    host.attachShadow({mode: 'open'}).append(template.content.cloneNode(true));
    template.remove();
  }
  const root = host.shadowRoot;
// Measure the actual card edges, so connections stay joined across all layouts.
const knowledge=root.querySelector('.knowledge-art');
function drawKnowledge(){
 const origin=knowledge.getBoundingClientRect();
 const rect=el=>{const r=el.getBoundingClientRect();return {x:r.left-origin.left-knowledge.clientLeft,y:r.top-origin.top-knowledge.clientTop,w:r.width,h:r.height}};
 const docs=rect(knowledge.querySelector('.docs')),guide=rect(knowledge.querySelector('.guidance'));
 const cards=[...knowledge.querySelectorAll('.task-card')].map(rect);
 const svg=knowledge.querySelector('.knowledge-wires');
 svg.setAttribute('viewBox',`0 0 ${knowledge.clientWidth} ${knowledge.clientHeight}`);
 const dx=docs.x+docs.w,dy=docs.y+docs.h/2,gx=guide.x;
 const docPath=`M${dx} ${dy}H${gx}`;
 knowledge.querySelector('#documents-wire').setAttribute('d',docPath);
 knowledge.querySelector('#documents-motion').setAttribute('path',docPath);
 const source={x:guide.x+guide.w/2,y:guide.y+guide.h};
 const stacked=matchMedia('(max-width:520px)').matches;
 const busY=(source.y+cards[0].y)/2;
 const busX=stacked?cards[0].x-13:source.x;
 const trunk=`M${source.x} ${source.y}V${busY}`+(stacked?`H${busX}V${cards[cards.length-1].y+cards[cards.length-1].h/2}`:'');
 knowledge.querySelector('#guidance-trunk').setAttribute('d',trunk);
 cards.forEach((card,i)=>{
  const end=stacked?{x:card.x,y:card.y+card.h/2}:{x:card.x+card.w/2,y:card.y};
  const branch=stacked?`M${busX} ${end.y}H${end.x}`:`M${busX} ${busY}H${end.x}V${end.y}`;
  const motion=stacked?`M${source.x} ${source.y}V${busY}H${busX}V${end.y}H${end.x}`:`M${source.x} ${source.y}V${busY}H${end.x}V${end.y}`;
  knowledge.querySelector(`#task-wire-${i}`).setAttribute('d',branch);
  knowledge.querySelector(`#task-motion-${i}`).setAttribute('path',motion);
 });
}
drawKnowledge();
const knowledgeResize=new ResizeObserver(drawKnowledge);
[knowledge,...knowledge.querySelectorAll('.docs,.guidance,.task-card')].forEach(el=>knowledgeResize.observe(el));
document.fonts.ready.then(drawKnowledge);


const surface = root.querySelector('.features-content');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let visible = false;
let step = 0;
const events = [
  'Librarian · New decisions added to company knowledge',
  'Optimiser · Better working guidance proposed for review',
  'Medic · A scoped fault checked and repaired',
  'Concierge · Work connected to the right specialist',
  'Auditor · Operations checked against saved guidance'
];
function stopped() { return paused || !visible || document.hidden; }
function update() {
  surface.classList.toggle('paused', stopped());
  root.querySelectorAll('svg.lines').forEach(svg => stopped() ? svg.pauseAnimations() : svg.unpauseAnimations());
}
reduced.addEventListener('change', () => { paused = reduced.matches; update(); });
document.addEventListener('visibilitychange', update);
new IntersectionObserver(entries => {
  visible = entries.some(entry => entry.isIntersecting);
  update();
}).observe(host);
update();
setInterval(() => {
  if (stopped()) return;
  step = (step + 1) % events.length;
  root.querySelector('#event').textContent = events[step];
}, 3000);
})();
