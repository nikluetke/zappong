(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let up = false, down = false, started = false;
  let score = 0;

  const paddle = {x:10,y:H/2-36,w:10,h:72,vy:0};
  const ai = {x:W-20,y:H/2-36,w:10,h:72};
  const ball = {x:W/2,y:H/2,r:8,vx:200,vy:120};

  let last = null;

  function resetBall() {
    ball.x = W/2; ball.y = H/2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 200;
    ball.vy = (Math.random()-0.5) * 240;
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    // center line
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i=10;i<H;i+=30) ctx.fillRect(W/2-1,i,2,18);

    // paddles
    ctx.fillStyle = '#00e4a8';
    ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.fillStyle = '#00b3d9';
    ctx.fillRect(ai.x,ai.y,ai.w,ai.h);

    // ball
    ctx.beginPath(); ctx.fillStyle='#fff'; ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();

    // HUD
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='20px Inter, system-ui'; ctx.fillText('Score: '+score, 14, 26);
  }

  function update(dt) {
    // player
    const speed = 260;
    if (up) paddle.y -= speed*dt; if (down) paddle.y += speed*dt;
    paddle.y = Math.max(0, Math.min(H-paddle.h, paddle.y));

    // AI simple
    const center = ai.y + ai.h/2;
    if (center < ball.y - 10) ai.y += 180*dt; else if (center > ball.y + 10) ai.y -= 180*dt;
    ai.y = Math.max(0, Math.min(H-ai.h, ai.y));

    // ball movement
    ball.x += ball.vx*dt; ball.y += ball.vy*dt;
    if (ball.y - ball.r < 0 || ball.y + ball.r > H) ball.vy *= -1;

    // collisions - robust overlap resolution to prevent tunneling
    if (ball.x - ball.r < paddle.x + paddle.w && ball.y > paddle.y && ball.y < paddle.y + paddle.h) {
      // place ball outside paddle and reflect — behave like AI collision (send to the right)
      ball.x = paddle.x + paddle.w + ball.r;
      // tweak vertical velocity based on hit position for nicer rebounds
      const rel = (ball.y - (paddle.y + paddle.h/2)) / (paddle.h/2); // -1 .. 1
      ball.vy += rel * 180;
      ball.vx = Math.abs(ball.vx) * 1.05; // ensure positive (to the right)
      score++;
    }
    if (ball.x + ball.r > ai.x && ball.y > ai.y && ball.y < ai.y + ai.h) {
      ball.x = ai.x - ball.r;
      const relA = (ball.y - (ai.y + ai.h/2)) / (ai.h/2);
      ball.vy += relA * 120;
      ball.vx = -Math.abs(ball.vx) * 1.02; // ensure negative (to the left)
    }

    // scoring
    if (ball.x < 0) {
      // ai scores -> game over
      endGame();
    }
    if (ball.x > W) {
      // player scores small reward
      score += 2; resetBall();
    }
  }

  function endGame() {
    started = false; saveScore(score); document.getElementById('playBtn').textContent = 'Play again';
  }

  function loop(t) {
    if (!last) last = t; const dt = Math.min(0.05, (t-last)/1000); last = t;
    if (started) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function saveScore(s){
    try{
      const key = 'zapclaw_pong_scores_v1';
      const list = JSON.parse(localStorage.getItem(key)||'[]');
      list.push({score:s,ts:Date.now()});
      list.sort((a,b)=>b.score-a.score);
      while(list.length>10) list.pop();
      localStorage.setItem(key, JSON.stringify(list));
      // refresh modal list if open
      renderScores();
    }catch(e){console.warn(e)}
  }

  function renderScores(){
    const key = 'zapclaw_pong_scores_v1';
    const list = JSON.parse(localStorage.getItem(key)||'[]');
    const ol = document.getElementById('scoresList'); ol.innerHTML='';
    if(list.length===0) ol.innerHTML='<li><em>No scores yet — play!</em></li>';
    list.forEach(it=>{ const li=document.createElement('li'); li.textContent = it.score+' — '+new Date(it.ts).toLocaleString(); ol.appendChild(li)});
  }

  // input
  window.addEventListener('keydown', e=>{
    if (['ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();
    if (e.code==='ArrowUp') up=true;
    if (e.code==='ArrowDown') down=true;
    if (e.code==='Space') { if(!started){started=true; score=0; resetBall(); document.getElementById('playBtn').textContent='Playing...'} }
  }, false);
  window.addEventListener('keyup', e=>{ if (['ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault(); if (e.code==='ArrowUp') up=false; if (e.code==='ArrowDown') down=false }, false);

  // touch for mobile: simple two zones
  canvas.addEventListener('touchstart', e=>{ e.preventDefault(); const x = e.touches[0].clientX; if (x < window.innerWidth/2) { up=true } else { down=true } started=true; score=0; resetBall(); document.getElementById('playBtn').textContent='Playing...' }, {passive:false});
  canvas.addEventListener('touchend', e=>{ e.preventDefault(); up=false; down=false }, {passive:false});

  // improve collision robustness: prevent ball tunneling by resolving overlap

  // buttons
  document.getElementById('playBtn').addEventListener('click', ()=>{ if(!started){started=true; score=0; resetBall(); document.getElementById('playBtn').textContent='Playing...'} });
  document.getElementById('scoresBtn').addEventListener('click', ()=>{ document.getElementById('scoresModal').classList.remove('hidden'); renderScores(); });
  document.getElementById('closeScores').addEventListener('click', ()=>{ document.getElementById('scoresModal').classList.add('hidden') });
  document.getElementById('resetScores').addEventListener('click', ()=>{ localStorage.removeItem('zapclaw_pong_scores_v1'); renderScores(); });

  // init
  renderScores(); requestAnimationFrame(loop);
})();