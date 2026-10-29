(() => {
const host=document.querySelector('#orbit-hero');
if(!host.shadowRoot){const template=host.querySelector('template');host.attachShadow({mode:'open'}).append(template.content.cloneNode(true));template.remove();}
const root=host.shadowRoot;
const surface=root.querySelector('.hero-surface');
const stories=[{who:'rebecca',name:'Rebecca',role:'Project Manager',message:'MrBeast on the launch, Spielberg on the story, Jony Ive on design. Everyone has the same brief.',title:'Rebecca brought the team together.',sub:'MrBeast, Spielberg and Jony have your brief.',status:'Brief received',result:'Brief attached · Team assembled',action:'In progress',label:'Brief'},{who:'jony',name:'Jony Ive',role:'Designer',message:'A bold first impression. A quiet palette, confident type, and a launch story that feels ambitious.',title:'Jony shared the creative direction.',sub:'Design attached. The whole team has the context.',status:'Designing',result:'Design direction · Ready to build',action:'Design ready',label:'Design'},{who:'spielberg',name:'Spielberg',role:'Story & direction',message:'Jony’s design and MrBeast’s launch ideas are together in the first version. The story is ready for Elon to explore.',title:'Spielberg shared the first version.',sub:'Website built. The result stays with the task.',status:'Building',result:'Saved website · Version 01',action:'Preview ready',label:'Build'},{who:'rebecca',name:'Rebecca',role:'Project Manager',message:'Elon, your first version is ready. Review the website and leave your feedback right here.',title:'Your launch website is ready to review.',sub:'The brief, design and result. All together.',status:'Review',result:'Saved website · Awaiting your feedback',action:'Review result',label:'Review'}];

const tools = [
  ['Slack', 'slack', '#611f69'], ['Teams', 'microsoftteams', '#6264a7'],
  ['Asana', 'asana', '#ef6575'], ['ClickUp', 'clickup', '#7b68ee'],
  ['Claude', 'anthropic', '#b77555'], ['Codex', 'openai', '#173c36'],
  ['Notion', 'notion', '#171717'], ['Confluence', 'confluence', '#1868db']
];
const $ = selector => root.querySelector(selector);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionPreference.matches;
let step = 0;
let selected = null;
let positions = [];
let rotation = 0;
let rearranged = false;
let activeDrag = null;
let orbitVisible = true;
let timer;
let lastFrame = 0;
const nodes = [];

function orbitPositions() {
  return tools.map((_, i) => {
    const angle = (-112 + i * 45) * Math.PI / 180 + rotation;
    return [50 + 41 * Math.cos(angle), 49 + 37 * Math.sin(angle)];
  });
}

function placeTools() {
  nodes.forEach((node, i) => {
    node.style.left = positions[i][0] + '%';
    node.style.top = positions[i][1] + '%';
    node.classList.toggle('selected', i === selected);
    node.setAttribute('aria-pressed', String(i === selected));
  });
}

function animateOrbit(now) {
  const elapsed = Math.min(now - (lastFrame || now), 50);
  lastFrame = now;
  if (!paused && !rearranged && !activeDrag && selected === null && orbitVisible && !document.hidden) {
    rotation += elapsed * Math.PI * 2 / 150000;
    positions = orbitPositions();
    placeTools();
  }
  requestAnimationFrame(animateOrbit);
}

function resetOrbit() {
  rotation = 0;
  selected = null;
  rearranged = false;
  positions = orbitPositions();
  placeTools();
  $('#orbit-announcement').textContent = 'Orbit arrangement reset.';
}

function setStep(next) {
  step = next;
  const story = stories[next];
  $('#conversation').innerHTML = `<span class="avatar ${story.who}" role="img" aria-label="${story.name}"></span><div><b>${story.name}</b><small>${story.role}</small><p>${story.message}</p></div>`;
  const conversation = $('#conversation');
  conversation.style.animation = 'none';
  void conversation.offsetWidth;
  conversation.style.animation = '';
  $('#status').textContent = story.status;
  $('#result-detail').textContent = story.result;
  $('#result-action').textContent = story.action;
  $('#float-avatar').className = 'avatar ' + story.who;
  $('#float-avatar').setAttribute('aria-label', story.name);
  $('#float-title').textContent = story.title;
  $('#float-subtitle').textContent = story.sub;
  const card = $('.float-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';
}

function restartTimer() {
  clearInterval(timer);
  if (!paused && orbitVisible && !document.hidden) timer = setInterval(() => setStep((step + 1) % stories.length), 6500);
}

function setPaused(value) {
  paused = value;
  surface.classList.toggle('paused', value);
  restartTimer();
}

tools.forEach(([label, asset, color], i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tool';
  button.style.setProperty('--logo', color);
  button.style.setProperty('--mark', `url("${new URL(`hero/assets/${asset}.svg`,document.baseURI).href}")`);
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-describedby', 'orbit-instructions');
  button.innerHTML = `<span class="tool-icon" aria-hidden="true"><span class="tool-mark"></span></span><span class="tool-label" aria-hidden="true">${label}</span>`;
  let drag = null;
  let suppressClick = false;

  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || activeDrag !== null) return;
    const box = $('#visual').getBoundingClientRect();
    drag = {
      x: event.clientX, y: event.clientY, start: [...positions[i]],
      offsetX: positions[i][0] / 100 * box.width - (event.clientX - box.left),
      offsetY: positions[i][1] / 100 * box.height - (event.clientY - box.top),
      moved: false, wasRearranged: rearranged
    };
    activeDrag = i;
    suppressClick = false;
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', event => {
    if (!drag) return;
    if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 5) drag.moved = true;
    if (!drag.moved) return;
    rearranged = true;
    selected = null;
    button.classList.add('dragging');
    const box = $('#visual').getBoundingClientRect();
    positions[i] = [
      Math.max(10, Math.min(90, (event.clientX - box.left + drag.offsetX) / box.width * 100)),
      Math.max(10, Math.min(88, (event.clientY - box.top + drag.offsetY) / box.height * 100))
    ];
    placeTools();
  });

  button.addEventListener('pointerup', () => {
    suppressClick = Boolean(drag?.moved);
    if (drag?.moved) $('#orbit-announcement').textContent = `${label} moved. Use Reset orbit to restore the arrangement.`;
    drag = null;
    activeDrag = null;
    button.classList.remove('dragging');
  });

  const cancelDrag = () => {
    if (!drag) return;
    positions[i] = drag.start;
    rearranged = drag.wasRearranged;
    drag = null;
    activeDrag = null;
    suppressClick = true;
    button.classList.remove('dragging');
    placeTools();
  };
  button.addEventListener('pointercancel', cancelDrag);
  button.addEventListener('lostpointercapture', cancelDrag);

  button.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
    suppressClick = false;
    if (selected === i) {
      selected = null;
      $('#orbit-announcement').textContent = `${label} deselected.`;
    } else if (selected === null) {
      selected = i;
      $('#orbit-announcement').textContent = `${label} selected. Select another tool to swap places.`;
    } else {
      const previous = selected;
      [positions[previous], positions[i]] = [positions[i], positions[previous]];
      selected = null;
      rearranged = true;
      $('#orbit-announcement').textContent = `${tools[previous][0]} and ${label} swapped places.`;
    }
    placeTools();
  });
  button.addEventListener('keydown', event => {
    if (event.key === 'Escape') { selected = null; placeTools(); $('#orbit-announcement').textContent = 'Selection cleared.'; }
  });
  nodes.push(button);
  $('#tool-nodes').append(button);
});

$('#reset-orbit').addEventListener('click', resetOrbit);
document.addEventListener('visibilitychange', restartTimer);
motionPreference.addEventListener('change', event => setPaused(event.matches));
new IntersectionObserver(([entry]) => { orbitVisible = entry.isIntersecting; restartTimer(); }).observe(host);
positions = orbitPositions();
placeTools();
setStep(0);
setPaused(paused);
requestAnimationFrame(animateOrbit);

})();