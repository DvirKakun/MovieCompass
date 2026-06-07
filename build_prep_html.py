#!/usr/bin/env python3
"""Build a self-contained, study-friendly, mobile-first HTML version of INTERVIEW_PREP.md."""
import markdown

SRC = "INTERVIEW_PREP.md"
OUT = "INTERVIEW_PREP.html"

with open(SRC, encoding="utf-8") as f:
    md_text = f.read()

md = markdown.Markdown(
    extensions=["tables", "fenced_code", "toc", "attr_list", "sane_lists"],
    extension_configs={"toc": {"permalink": False}},
)
body_html = md.convert(md_text)
toc_html = md.toc

CSS = r"""
:root{
  --bg:#0f1115; --panel:#161922; --panel2:#1c2030; --text:#e6e8ee; --muted:#9aa3b2;
  --accent:#6ea8fe; --accent2:#7ee787; --border:#262b38; --code:#0b0d12;
  --q:#ffd866; --warn:#ff7b72; --shadow:0 8px 30px rgba(0,0,0,.35);
  --sidebar-w:320px; --topbar-h:54px;
}
[data-theme="light"]{
  --bg:#f6f7f9; --panel:#ffffff; --panel2:#f0f2f6; --text:#1c2128; --muted:#5b6675;
  --accent:#1f6feb; --accent2:#1a7f37; --border:#e1e4e8; --code:#f3f4f7;
  --q:#9a6700; --warn:#cf222e; --shadow:0 6px 24px rgba(0,0,0,.08);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth; -webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--text); overflow-x:hidden;
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
.layout{display:grid; grid-template-columns:var(--sidebar-w) 1fr; min-height:100vh}

/* ---------- Mobile top bar (hidden on desktop) ---------- */
.topbar{display:none}
.hamburger{width:42px; height:42px; border-radius:10px; border:1px solid var(--border);
  background:var(--panel2); color:var(--text); display:flex; align-items:center;
  justify-content:center; font-size:20px; cursor:pointer; flex:0 0 auto}
.backdrop{display:none}

/* ---------- Sidebar ---------- */
aside{
  position:sticky; top:0; height:100vh; overflow:auto; background:var(--panel);
  border-right:1px solid var(--border); padding:20px 16px;
  -webkit-overflow-scrolling:touch;
}
aside h2{font-size:14px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:18px 6px 8px}
.brand{display:flex; align-items:center; gap:10px; font-size:20px; font-weight:800; margin-bottom:6px}
.brand .dot{font-size:22px}
.searchbox{width:100%; padding:11px 12px; border-radius:10px; border:1px solid var(--border);
  background:var(--panel2); color:var(--text); margin:10px 0 8px; outline:none; font-size:16px}
.searchbox:focus{border-color:var(--accent)}
aside nav ul{list-style:none; margin:0; padding-left:10px}
aside nav>ul{padding-left:0}
aside nav a{display:block; color:var(--muted); text-decoration:none; padding:8px 10px;
  border-radius:8px; font-size:14px; border-left:2px solid transparent}
aside nav a:hover{color:var(--text); background:var(--panel2)}
aside nav a.active{color:var(--accent); border-left-color:var(--accent); background:var(--panel2)}
aside nav ul ul a{font-size:13px; color:var(--muted)}
.controls{display:flex; flex-wrap:wrap; gap:6px; margin:10px 0}
.btn{cursor:pointer; border:1px solid var(--border); background:var(--panel2); color:var(--text);
  padding:9px 12px; border-radius:9px; font-size:13px; font-weight:600; flex:1 1 auto; text-align:center}
.btn:hover{border-color:var(--accent); color:var(--accent)}
.btn:active{transform:scale(.97)}

/* ---------- Main ---------- */
main{padding:34px 48px 120px; max-width:1000px; min-width:0}
.progress{position:fixed; top:0; left:var(--sidebar-w); right:0; height:3px; background:transparent; z-index:60}
.progress>i{display:block; height:100%; width:0; background:linear-gradient(90deg,var(--accent),var(--accent2))}
h1{font-size:32px; line-height:1.2; margin:.2em 0 .4em; font-weight:850; overflow-wrap:break-word}
h2{font-size:24px; margin:1.6em 0 .5em; padding-bottom:.3em; border-bottom:2px solid var(--border); scroll-margin-top:70px; overflow-wrap:break-word}
h3{font-size:18px; margin:1.4em 0 .4em; color:var(--accent); scroll-margin-top:70px; overflow-wrap:break-word}
h4{font-size:16px; margin:1.2em 0 .3em; color:var(--accent2)}
a{color:var(--accent); overflow-wrap:break-word}
p,li{color:var(--text); overflow-wrap:break-word}
hr{border:none; border-top:1px solid var(--border); margin:2em 0}
code{background:var(--code); padding:2px 6px; border-radius:6px; font-size:13.5px;
  font-family:"SF Mono",ui-monospace,Menlo,Consolas,monospace; overflow-wrap:break-word}
pre{background:var(--code); border:1px solid var(--border); border-radius:12px; padding:16px;
  overflow:auto; font-size:13px; box-shadow:var(--shadow); -webkit-overflow-scrolling:touch}
pre code{background:none; padding:0; overflow-wrap:normal}
blockquote{margin:.6em 0; padding:12px 16px; border-left:4px solid var(--accent2);
  background:var(--panel); border-radius:0 10px 10px 0}
blockquote p{margin:.3em 0; color:var(--text)}
/* tables get wrapped in .table-wrap by JS for horizontal scroll on small screens */
.table-wrap{overflow-x:auto; -webkit-overflow-scrolling:touch; margin:1em 0; border-radius:10px; box-shadow:var(--shadow)}
table{border-collapse:collapse; width:100%; font-size:14px; min-width:520px}
th,td{border:1px solid var(--border); padding:9px 12px; text-align:left; vertical-align:top}
th{background:var(--panel2); font-weight:700}
tr:nth-child(even) td{background:var(--panel)}

/* ---------- Q&A practice cards ---------- */
.qa{margin:14px 0; border:1px solid var(--border); border-radius:12px; overflow:hidden; background:var(--panel)}
.qa .q{display:flex; gap:10px; align-items:flex-start; padding:14px 16px; cursor:pointer;
  background:linear-gradient(180deg,var(--panel2),var(--panel)); font-weight:700;
  -webkit-tap-highlight-color:transparent; user-select:none}
.qa .q .qicon{flex:0 0 auto}
.qa .q .qtext{flex:1 1 auto}
.qa .q .badge{flex:0 0 auto; font-size:11px; font-weight:700; color:var(--muted);
  border:1px solid var(--border); padding:3px 9px; border-radius:20px; white-space:nowrap}
.qa .q .chev{flex:0 0 auto; transition:transform .25s; color:var(--muted)}
.qa.open .q .chev{transform:rotate(90deg)}
.qa .a{max-height:0; overflow:hidden; transition:max-height .35s ease; padding:0 16px}
.qa.open .a{max-height:3000px; padding:4px 16px 14px}
.hidden{display:none !important}
mark{background:var(--q); color:#000; padding:0 2px; border-radius:3px}
.tip{font-size:13px; color:var(--muted); margin-top:6px}

/* ---------- Mobile ---------- */
@media (max-width:900px){
  .layout{display:block}
  .progress{left:0; top:var(--topbar-h)}

  /* top app bar */
  .topbar{display:flex; align-items:center; gap:12px; position:sticky; top:0; z-index:70;
    height:var(--topbar-h); padding:0 12px; background:var(--panel);
    border-bottom:1px solid var(--border)}
  .topbar .title{font-weight:800; font-size:17px; display:flex; align-items:center; gap:8px}
  .topbar .spacer{flex:1 1 auto}

  /* sidebar becomes an off-canvas drawer */
  aside{position:fixed; top:0; left:0; bottom:0; height:100dvh; width:84vw; max-width:340px;
    z-index:90; transform:translateX(-100%); transition:transform .28s ease;
    box-shadow:var(--shadow); border-right:1px solid var(--border)}
  body.nav-open aside{transform:translateX(0)}
  .backdrop{display:block; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:80;
    opacity:0; pointer-events:none; transition:opacity .28s}
  body.nav-open .backdrop{opacity:1; pointer-events:auto}

  main{padding:18px 16px 90px}
  h1{font-size:26px}
  h2{font-size:21px; scroll-margin-top:64px}
  h3{font-size:17px; scroll-margin-top:64px}
  .qa .q{padding:15px 14px}
  .btn{padding:11px 12px; font-size:14px}
}
@media (max-width:380px){
  main{padding:16px 12px 80px}
  h1{font-size:23px}
}

@media print{
  .topbar,aside,.progress,.controls,.backdrop{display:none}
  .layout{display:block}
  .qa .a{max-height:none !important; padding:4px 16px 14px}
  body{background:#fff; color:#000}
}
"""

JS = r"""
function buildQA(){
  const main = document.querySelector('main');
  const ps = Array.from(main.querySelectorAll('p'));
  ps.forEach(p=>{
    const strong = p.querySelector('strong');
    const txt = (strong?strong.textContent:p.textContent).trim();
    if(!/^Q[:.]/i.test(txt)) return;
    let ans = p.nextElementSibling;
    if(!ans || ans.tagName!=='BLOCKQUOTE') return;
    const card = document.createElement('div');
    card.className='qa';
    const qhead = txt.replace(/^Q[:.]\s*/i,'');
    const q = document.createElement('div');
    q.className='q';
    q.innerHTML = '<span class="qicon">❓</span><span class="qtext">'+qhead+'</span>'+
                  '<span class="badge">reveal</span><span class="chev">▶</span>';
    const a = document.createElement('div');
    a.className='a';
    p.replaceWith(card);
    card.appendChild(q); card.appendChild(a); a.appendChild(ans);
    q.addEventListener('click', ()=>{
      card.classList.toggle('open');
      q.querySelector('.badge').textContent = card.classList.contains('open')?'hide':'reveal';
    });
  });
}

function wrapTables(){
  document.querySelectorAll('main table').forEach(t=>{
    if(t.parentElement.classList.contains('table-wrap')) return;
    const w=document.createElement('div'); w.className='table-wrap';
    t.replaceWith(w); w.appendChild(t);
  });
}

function activeTracking(){
  const links = Array.from(document.querySelectorAll('aside nav a'));
  const map = {};
  links.forEach(l=>{ const id=l.getAttribute('href').slice(1); if(id) map[id]=l; });
  const heads = Array.from(document.querySelectorAll('main h2, main h3')).filter(h=>h.id);
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const l = map[e.target.id]; if(l){ l.classList.add('active');
          l.scrollIntoView({block:'nearest'}); }
      }
    });
  }, {rootMargin:'-12% 0px -78% 0px'});
  heads.forEach(h=>obs.observe(h));
}

function progressBar(){
  const bar = document.querySelector('.progress>i');
  const upd=()=>{ const h=document.body.scrollHeight-window.innerHeight;
    bar.style.width=(h>0?(window.scrollY/h*100):0)+'%'; };
  window.addEventListener('scroll', upd, {passive:true}); upd();
}

function drawer(){
  const open=()=>document.body.classList.add('nav-open');
  const close=()=>document.body.classList.remove('nav-open');
  document.getElementById('hamburger').onclick=open;
  document.getElementById('backdrop').onclick=close;
  // close drawer when a section link is tapped (mobile)
  document.querySelectorAll('aside nav a').forEach(a=>a.addEventListener('click',()=>{
    if(window.matchMedia('(max-width:900px)').matches) close();
  }));
  // Esc closes
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
}

function controls(){
  const reveal=()=>document.querySelectorAll('.qa').forEach(c=>{c.classList.add('open');
    c.querySelector('.badge').textContent='hide';});
  const hide=()=>document.querySelectorAll('.qa').forEach(c=>{c.classList.remove('open');
    c.querySelector('.badge').textContent='reveal';});
  document.querySelectorAll('[data-act=expand]').forEach(b=>b.onclick=reveal);
  document.querySelectorAll('[data-act=collapse]').forEach(b=>b.onclick=hide);

  const setTheme=(t)=>{ document.documentElement.setAttribute('data-theme',t);
    const lbl = t==='light'?'🌙 Dark':'☀️ Light';
    document.querySelectorAll('[data-act=theme]').forEach(b=>b.textContent=lbl); };
  document.querySelectorAll('[data-act=theme]').forEach(b=>b.onclick=()=>{
    const cur=document.documentElement.getAttribute('data-theme');
    setTheme(cur==='light'?'dark':'light');
  });

  const box=document.getElementById('search');
  box.addEventListener('input', ()=>{
    const q=box.value.toLowerCase().trim();
    document.querySelectorAll('aside nav a').forEach(a=>{
      a.parentElement.classList.toggle('hidden', q && !a.textContent.toLowerCase().includes(q));
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  buildQA(); wrapTables(); activeTracking(); progressBar(); drawer(); controls();
});
"""

HTML = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f1115">
<title>MovieCompass — Interview Prep</title>
<style>{CSS}</style>
</head>
<body>
<div class="progress"><i></i></div>

<!-- Mobile top bar -->
<header class="topbar">
  <button class="hamburger" id="hamburger" aria-label="Open menu">☰</button>
  <div class="title"><span>🎬</span> Interview Prep</div>
  <span class="spacer"></span>
  <button class="hamburger" data-act="theme" aria-label="Toggle theme" style="font-size:15px;width:auto;padding:0 10px">☀️ Light</button>
</header>

<div class="backdrop" id="backdrop"></div>

<div class="layout">
  <aside id="sidebar">
    <div class="brand"><span class="dot">🎬</span> MovieCompass</div>
    <div class="tip">Tap a ❓ to reveal the answer.</div>
    <input id="search" class="searchbox" placeholder="Filter sections…" />
    <div class="controls">
      <button class="btn" data-act="expand">Reveal all</button>
      <button class="btn" data-act="collapse">Hide all</button>
      <button class="btn" data-act="theme">☀️ Light</button>
    </div>
    <h2>Contents</h2>
    <nav>{toc_html}</nav>
  </aside>
  <main>
    {body_html}
  </main>
</div>
<script>{JS}</script>
</body>
</html>
"""

with open(OUT, "w", encoding="utf-8") as f:
    f.write(HTML)

print(f"Wrote {OUT} ({len(HTML)} bytes)")
