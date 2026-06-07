#!/usr/bin/env python3
"""Build a self-contained, study-friendly HTML version of INTERVIEW_PREP.md."""
import re
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
toc_html = md.toc  # generated nested <ul> table of contents

# Drop the document's own hand-written Table of Contents list (the first <ol>/<ul>
# right after the first heading) since we have a live sidebar — keep it simple: leave it.

CSS = r"""
:root{
  --bg:#0f1115; --panel:#161922; --panel2:#1c2030; --text:#e6e8ee; --muted:#9aa3b2;
  --accent:#6ea8fe; --accent2:#7ee787; --border:#262b38; --code:#0b0d12;
  --q:#ffd866; --warn:#ff7b72; --shadow:0 8px 30px rgba(0,0,0,.35);
}
[data-theme="light"]{
  --bg:#f6f7f9; --panel:#ffffff; --panel2:#f0f2f6; --text:#1c2128; --muted:#5b6675;
  --accent:#1f6feb; --accent2:#1a7f37; --border:#e1e4e8; --code:#f3f4f7;
  --q:#9a6700; --warn:#cf222e; --shadow:0 6px 24px rgba(0,0,0,.08);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0; background:var(--bg); color:var(--text);
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
.layout{display:grid; grid-template-columns:320px 1fr; min-height:100vh}
/* Sidebar */
aside{
  position:sticky; top:0; height:100vh; overflow:auto; background:var(--panel);
  border-right:1px solid var(--border); padding:20px 16px;
}
aside h2{font-size:14px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin:18px 6px 8px}
.brand{display:flex; align-items:center; gap:10px; font-size:20px; font-weight:800; margin-bottom:6px}
.brand .dot{font-size:22px}
.searchbox{width:100%; padding:9px 12px; border-radius:10px; border:1px solid var(--border);
  background:var(--panel2); color:var(--text); margin:10px 0 8px; outline:none}
.searchbox:focus{border-color:var(--accent)}
aside nav ul{list-style:none; margin:0; padding-left:10px}
aside nav>ul{padding-left:0}
aside nav a{display:block; color:var(--muted); text-decoration:none; padding:5px 8px;
  border-radius:8px; font-size:14px; border-left:2px solid transparent}
aside nav a:hover{color:var(--text); background:var(--panel2)}
aside nav a.active{color:var(--accent); border-left-color:var(--accent); background:var(--panel2)}
aside nav ul ul a{font-size:13px; color:var(--muted)}
.controls{display:flex; flex-wrap:wrap; gap:6px; margin:10px 0}
.btn{cursor:pointer; border:1px solid var(--border); background:var(--panel2); color:var(--text);
  padding:7px 10px; border-radius:9px; font-size:12.5px; font-weight:600}
.btn:hover{border-color:var(--accent); color:var(--accent)}
.btn.active{background:var(--accent); color:#08111f; border-color:var(--accent)}
/* Main */
main{padding:38px 48px 120px; max-width:1000px}
.progress{position:fixed; top:0; left:320px; right:0; height:3px; background:transparent; z-index:50}
.progress>i{display:block; height:100%; width:0; background:linear-gradient(90deg,var(--accent),var(--accent2))}
h1{font-size:34px; line-height:1.2; margin:.2em 0 .4em; font-weight:850}
h2{font-size:25px; margin:1.6em 0 .5em; padding-bottom:.3em; border-bottom:2px solid var(--border); scroll-margin-top:20px}
h3{font-size:19px; margin:1.4em 0 .4em; color:var(--accent); scroll-margin-top:20px}
h4{font-size:16px; margin:1.2em 0 .3em; color:var(--accent2)}
a{color:var(--accent)}
p,li{color:var(--text)}
hr{border:none; border-top:1px solid var(--border); margin:2em 0}
code{background:var(--code); padding:2px 6px; border-radius:6px; font-size:13.5px;
  font-family:"SF Mono",ui-monospace,Menlo,Consolas,monospace}
pre{background:var(--code); border:1px solid var(--border); border-radius:12px; padding:16px;
  overflow:auto; font-size:13px; box-shadow:var(--shadow)}
pre code{background:none; padding:0}
blockquote{margin:.6em 0; padding:12px 16px; border-left:4px solid var(--accent2);
  background:var(--panel); border-radius:0 10px 10px 0}
blockquote p{margin:.3em 0; color:var(--text)}
table{border-collapse:collapse; width:100%; margin:1em 0; font-size:14px; box-shadow:var(--shadow); border-radius:10px; overflow:hidden}
th,td{border:1px solid var(--border); padding:9px 12px; text-align:left; vertical-align:top}
th{background:var(--panel2); font-weight:700}
tr:nth-child(even) td{background:var(--panel)}
/* Q&A practice cards */
.qa{margin:14px 0; border:1px solid var(--border); border-radius:12px; overflow:hidden; background:var(--panel)}
.qa .q{display:flex; gap:10px; align-items:flex-start; padding:13px 16px; cursor:pointer;
  background:linear-gradient(180deg,var(--panel2),var(--panel)); font-weight:700}
.qa .q . qicon{color:var(--q)}
.qa .q .badge{margin-left:auto; font-size:11px; font-weight:700; color:var(--muted);
  border:1px solid var(--border); padding:2px 8px; border-radius:20px; white-space:nowrap}
.qa .a{max-height:0; overflow:hidden; transition:max-height .3s ease; padding:0 16px}
.qa.open .a{max-height:2000px; padding:4px 16px 14px}
.qa .q .chev{transition:transform .25s; color:var(--muted)}
.qa.open .q .chev{transform:rotate(90deg)}
.hidden{display:none !important}
mark{background:var(--q); color:#000; padding:0 2px; border-radius:3px}
.tip{font-size:13px; color:var(--muted); margin-top:6px}
@media (max-width:900px){
  .layout{grid-template-columns:1fr}
  aside{position:static; height:auto; border-right:none; border-bottom:1px solid var(--border)}
  .progress{left:0}
  main{padding:24px 18px 90px}
}
@media print{
  aside,.progress,.controls{display:none}
  .layout{display:block}
  .qa .a{max-height:none !important; padding:4px 16px 14px}
  body{background:#fff; color:#000}
}
"""

JS = r"""
// Wrap each "Q:" paragraph + following blockquote into a collapsible practice card.
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
    card.appendChild(q);
    card.appendChild(a);
    a.appendChild(ans);
    q.addEventListener('click', ()=>{
      card.classList.toggle('open');
      q.querySelector('.badge').textContent = card.classList.contains('open')?'hide':'reveal';
    });
  });
}

function buildSidebarActiveTracking(){
  const links = Array.from(document.querySelectorAll('aside nav a'));
  const map = {};
  links.forEach(l=>{ const id=l.getAttribute('href').slice(1); if(id) map[id]=l; });
  const heads = Array.from(document.querySelectorAll('main h2, main h3')).filter(h=>h.id);
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const l = map[e.target.id]; if(l) l.classList.add('active');
      }
    });
  }, {rootMargin:'-10% 0px -80% 0px'});
  heads.forEach(h=>obs.observe(h));
}

function progressBar(){
  const bar = document.querySelector('.progress>i');
  const main = document.querySelector('main');
  window.addEventListener('scroll', ()=>{
    const h = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (h>0 ? (window.scrollY/h*100) : 0) + '%';
  });
}

function controls(){
  document.getElementById('expandAll').onclick=()=>{
    document.querySelectorAll('.qa').forEach(c=>{c.classList.add('open');
      c.querySelector('.badge').textContent='hide';});
  };
  document.getElementById('collapseAll').onclick=()=>{
    document.querySelectorAll('.qa').forEach(c=>{c.classList.remove('open');
      c.querySelector('.badge').textContent='reveal';});
  };
  const tbtn=document.getElementById('themeBtn');
  tbtn.onclick=()=>{
    const cur=document.documentElement.getAttribute('data-theme');
    const next=cur==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme',next);
    tbtn.textContent = next==='light'?'🌙 Dark':'☀️ Light';
  };
  // search filter over sidebar + content sections
  const box=document.getElementById('search');
  box.addEventListener('input', ()=>{
    const q=box.value.toLowerCase().trim();
    document.querySelectorAll('aside nav a').forEach(a=>{
      a.parentElement.classList.toggle('hidden', q && !a.textContent.toLowerCase().includes(q));
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  buildQA();
  buildSidebarActiveTracking();
  progressBar();
  controls();
});
"""

HTML = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MovieCompass — Interview Prep</title>
<style>{CSS}</style>
</head>
<body>
<div class="progress"><i></i></div>
<div class="layout">
  <aside>
    <div class="brand"><span class="dot">🎬</span> MovieCompass</div>
    <div class="tip">Interview Prep — click a ❓ to reveal the answer.</div>
    <input id="search" class="searchbox" placeholder="Filter sections…" />
    <div class="controls">
      <button class="btn" id="expandAll">Reveal all</button>
      <button class="btn" id="collapseAll">Hide all</button>
      <button class="btn" id="themeBtn">☀️ Light</button>
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
