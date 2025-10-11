    /* ---------- Canvas Topologi dengan performa & penyesuaian jumlah node ---------- */
    const canvas = document.getElementById('network-bg');
    const ctx = canvas.getContext && canvas.getContext('2d');
    let w=0,h=0,nodes=[];
    let NODE_COUNT = (window.innerWidth || 800) < 600 ? 35 : 50;

    function createNode(){ return {x:Math.random()*w,y:Math.random()*h,dx:(Math.random()-0.5)*0.6,dy:(Math.random()-0.5)*0.6}; }

    function adjustNodesToCount(){
      NODE_COUNT = (window.innerWidth || 800) < 600 ? 35 : 50;
      if(nodes.length < NODE_COUNT){
        const toAdd = NODE_COUNT - nodes.length;
        for(let i=0;i<toAdd;i++) nodes.push(createNode());
      } else if(nodes.length > NODE_COUNT){
        nodes.length = NODE_COUNT; // trim extra nodes
      }
    }

    function resizeCanvas(){
      if(!ctx) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      // keep existing nodes inside new bounds and adjust number
      nodes.forEach(n => { n.x = Math.max(0, Math.min(w, n.x)); n.y = Math.max(0, Math.min(h, n.y)); });
      adjustNodesToCount();
      if(nodes.length===0){
        for(let i=0;i<NODE_COUNT;i++) nodes.push(createNode());
      }
    }
    window.addEventListener('resize', resizeCanvas, {passive:true});
    resizeCanvas();

    let hue=200;
    function drawNetwork(){
      if(!ctx) return;
      ctx.clearRect(0,0,w,h);
      hue = (hue + 0.35) % 360;
      const glow = `hsl(${Math.round(hue)},90%,60%)`;
      ctx.globalCompositeOperation='lighter';

      for(const n of nodes){
        n.x += n.dx; n.y += n.dy;
        if(n.x<=0||n.x>=w) n.dx *= -1;
        if(n.y<=0||n.y>=h) n.dy *= -1;
      }

      // connect
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const a=nodes[i], b=nodes[j];
          const d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<140){
            ctx.beginPath();
            ctx.strokeStyle = glow;
            ctx.lineWidth = 1;
            ctx.globalAlpha = Math.max(0.06,1-d/140);
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for(const n of nodes){
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.globalAlpha = 0.95;
        ctx.arc(n.x,n.y,1.8,0,Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation='source-over';
      requestAnimationFrame(drawNetwork);
    }
    requestAnimationFrame(drawNetwork);

    /* ---------- Typing Effect + tombol muncul halus ---------- */
    const typingTarget = document.getElementById('typing-text');
    const lihatProyekBtn = document.getElementById('lihatProyekBtn');
    const text = "Pelajar Teknik Komputer dan Jaringan";
    let ti = 0;
    function typeEffect(){
      if(!typingTarget) return;
      if(ti < text.length){
        typingTarget.textContent += text.charAt(ti);
        ti++;
        setTimeout(typeEffect,72);
      } else {
        typingTarget.classList.add('done');
        if(lihatProyekBtn) setTimeout(()=>lihatProyekBtn.classList.add('show'), 250);
      }
    }
    // use DOMContentLoaded to ensure elements exist
    window.addEventListener('DOMContentLoaded', ()=>setTimeout(typeEffect,1600));

    /* ---------- Accessibility & keyboard for header/profile popup ---------- */
    const profilHeader = document.getElementById('profilHeader');
    const photoPopup = document.getElementById('photoPopup');
    if(profilHeader && photoPopup){
      profilHeader.addEventListener('click', ()=>{ photoPopup.classList.add('visible'); photoPopup.setAttribute('aria-hidden','false'); });
      profilHeader.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); photoPopup.classList.add('visible'); photoPopup.setAttribute('aria-hidden','false'); }});
      // close when clicking overlay
      photoPopup.addEventListener('click', (e)=>{
        if(e.target === photoPopup){
          photoPopup.classList.remove('visible'); photoPopup.setAttribute('aria-hidden','true');
        }
      });
    }

    /* ---------- Navigation & detail management ---------- */
    const beranda = document.getElementById('beranda');
    const proyek = document.getElementById('proyek');
    const backBtn = document.getElementById('backBtn');
    const menuItems = Array.from(document.querySelectorAll('.menu-item'));
    const backMenus = Array.from(document.querySelectorAll('.backMenu'));
    let animating = false;

    function hideAllDetails(){
      document.querySelectorAll('.detail').forEach(d=>{
        d.classList.remove('visible');
        d.style.display = 'none';
        d.querySelectorAll('.card').forEach(c => c.classList.remove('show'));
      });
    }

    function showProyekFromBeranda(){
      if(animating) return; animating=true;
      if(beranda) beranda.style.transition='opacity .45s ease';
      if(beranda) beranda.style.opacity='0';
      setTimeout(()=>{
        if(beranda) beranda.style.display='none';
        if(proyek) proyek.style.display='flex';
        setTimeout(()=>{ if(proyek) proyek.classList.add('visible'); animating=false; },40);
      },420);
    }
    function backToBerandaFromProyek(){
      if(animating) return; animating=true;
      if(proyek) proyek.classList.remove('visible');
      setTimeout(()=>{
        if(proyek) proyek.style.display='none';
        if(beranda) beranda.style.display='flex';
        setTimeout(()=>{ if(beranda) beranda.style.opacity='1'; animating=false; },40);
      },420);
    }
    if(lihatProyekBtn) {
      lihatProyekBtn.addEventListener('click', showProyekFromBeranda);
      // keyboard support on button
      lihatProyekBtn.addEventListener('keydown', e=>{
        if(e.key==='Enter' || e.key===' ') { e.preventDefault(); showProyekFromBeranda(); }
      });
    }
    if(backBtn) backBtn.addEventListener('click', backToBerandaFromProyek);

    menuItems.forEach(btn=>{
      // allow keyboard activation
      btn.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); btn.click(); }});
      btn.addEventListener('click', ()=>{
        if(animating) return; animating=true;
        if(proyek) proyek.classList.remove('visible');
        setTimeout(()=>{
          if(proyek) proyek.style.display='none';
          const target = document.getElementById(btn.dataset.target);
          if(!target){ animating=false; return; }
          hideAllDetails();
          target.style.display='flex';
          const cards = Array.from(target.querySelectorAll('.card'));
          setTimeout(()=>{ target.classList.add('visible'); cards.forEach((c,i)=>setTimeout(()=>c.classList.add('show'), 120*i)); animating=false; }, 50);
        },420);
      });
    });

    backMenus.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(animating) return; animating=true;
        const section = btn.closest('.detail');
        if(!section){ animating=false; return; }
        section.classList.remove('visible');
        setTimeout(()=>{ section.style.display='none'; if(proyek) proyek.style.display='flex'; setTimeout(()=>{ if(proyek) proyek.classList.add('visible'); animating=false; },50); },420);
      });
      // keyboard support
      btn.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); btn.click(); }});
    });

    /* ---------- Protections (scoped and global) ---------- */
    // Prevent right-click on entire page (user requested)
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent dragstart only on images
    document.addEventListener('dragstart', (e)=>{
      const t = e.target;
      if(t && t.tagName === 'IMG') e.preventDefault();
    });

    // Block a small set of shortcuts but only when not typing in inputs / textareas / contentEditable
    window.addEventListener('keydown', (e)=>{
      const t = e.target;
      const tag = t && t.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable);
      if(isEditable) return;
      // F12
      if(e.key === 'F12'){ e.preventDefault(); return; }
      // Ctrl/Cmd + S or U
      if((e.ctrlKey || e.metaKey) && ['s','S','u','U'].includes(e.key)) { e.preventDefault(); return; }
      // Ctrl/Cmd + Shift + I/J/C
      if((e.ctrlKey || e.metaKey) && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)){ e.preventDefault(); return; }
    });

    // Ensure all images non-draggable and non-selectable
    document.querySelectorAll('img').forEach(img => { img.setAttribute('draggable','false'); img.style.userSelect='none'; });

    // Close popup or open detail with ESC
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        if(photoPopup && photoPopup.classList.contains('visible')){ photoPopup.classList.remove('visible'); photoPopup.setAttribute('aria-hidden','true'); }
        const openDetail = document.querySelector('.detail.visible');
        if(openDetail){
          openDetail.classList.remove('visible');
          setTimeout(()=>{ openDetail.style.display='none'; if(proyek) proyek.style.display='flex'; setTimeout(()=>proyek && proyek.classList.add('visible'),40); }, 320);
        }
      }
    });
