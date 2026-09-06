(function(){
  function decisionCard(h,i,e){
    const hasA=hasAvg(h), hasC=hasCurrent(h);
    const current=hasC?`$${f(h.current)}`:"未取得";
    const q=pl(h), r=pct(h);
    const profit=Number.isFinite(q)
      ? `<span class="metric-value ${q>=0?'positive':'negative'}">${q>=0?'+':'-'}$${f(Math.abs(q))}</span><span class="metric-sub">${r>=0?'+':''}${f(r)}%</span>`
      : `<span class="metric-value muted">${hasA?'—':'未設定'}</span><span class="metric-sub">${hasA?'株価未取得':'取得単価未設定'}</span>`;
    let status, message;
    if(!hasA){
      status="取得単価未設定"; message="詳細画面で取得単価を設定すると評価損益を確認できます";
    }else if(!hasC){
      status="株価未取得"; message="保有銘柄画面から株価を更新してください";
    }else{
      status=e.buy?"買う":"待つ";
      message=e.buy?e.msg:near(h,e.p);
    }
    const cls=e.buy&&hasA&&hasC?"buy":(!hasA||!hasC?"unset":"wait");
    return `<div class="decision-row ${cls}">
      <div class="decision-head"><div><div class="name">${escapeHtml(h.name)}</div><div class="symbol">${escapeHtml(h.symbol||'')}</div></div><div class="status ${cls}">${status}</div></div>
      <div class="decision-metrics">
        <div><div class="metric-label">現在株価</div><div class="metric-value">${current}</div></div>
        <div><div class="metric-label">評価損益</div><div>${profit}</div></div>
        <div><div class="metric-label">保有</div><div class="metric-value">${h.shares}株</div></div>
      </div>
      <div class="decision-message ${cls}">${escapeHtml(message)}</div>
      <button class="row-link" data-holding="${i}">詳細を見る</button>
    </div>`;
  }

  function homeView(){
    const items=state.holdings.map((h,i)=>({h,i,e:evaluate(h,false)}));
    const buy=items.filter(x=>hasAvg(x.h)&&hasCurrent(x.h)&&x.e.buy);
    const wait=items.filter(x=>hasAvg(x.h)&&hasCurrent(x.h)&&!x.e.buy);
    const unset=items.filter(x=>!hasAvg(x.h)||!hasCurrent(x.h));
    const checked=buy.length+wait.length;
    return `<div class="home-head"><div><div class="subtitle">今日の判定</div><div class="home-note">現在株価と買い条件をまとめて確認</div></div><div class="checked-count">${checked}/${items.length}<span>確認済み</span></div></div>
      ${buy.length?`<section class="decision-section"><div class="section-title"><span>買う</span><span class="count buy-count">${buy.length}銘柄</span></div><div class="card decision-card">${buy.map(x=>decisionCard(x.h,x.i,x.e)).join('')}</div></section>`:''}
      ${wait.length?`<section class="decision-section"><div class="section-title"><span>待つ</span><span class="count">${wait.length}銘柄</span></div><div class="card decision-card">${wait.map(x=>decisionCard(x.h,x.i,x.e)).join('')}</div></section>`:''}
      ${unset.length?`<section class="decision-section"><div class="section-title"><span>要設定・未取得</span><span class="count">${unset.length}銘柄</span></div><div class="card decision-card">${unset.map(x=>decisionCard(x.h,x.i,x.e)).join('')}</div></section>`:''}
      ${items.length===0?`<div class="empty-card">保有銘柄がありません。<br>「保有銘柄」から追加してください。</div>`:''}
      <button class="primary" id="updateAllPrices">株価を自動更新</button>`;
  }

  function render(){
    const c=document.getElementById("content");
    if(KoBoTrade.tab==="home")c.innerHTML=homeView();
    else if(KoBoTrade.tab==="holdings")c.innerHTML=holdingsView();
    else if(KoBoTrade.tab==="settings")c.innerHTML=settingsView();
    else c.innerHTML=testsView();
    document.querySelectorAll(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===KoBoTrade.tab));
    bindCurrent();
  }

  function bindCurrent(){
    document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>{KoBoTrade.tab=b.dataset.tab;render()});
    document.querySelectorAll("tr[data-holding]").forEach(r=>r.onclick=()=>editHolding(Number(r.dataset.holding)));
    document.querySelectorAll(".row-link[data-holding]").forEach(b=>b.onclick=()=>editHolding(Number(b.dataset.holding)));
    const u=document.getElementById("updateAllPrices");if(u)u.onclick=kobotradeV20UpdateHoldingsPrices;
    const a=document.getElementById("addHolding");if(a)a.onclick=addHolding;
    if(KoBoTrade.tab==="settings")bindSettings();
    const rt=document.getElementById("rerunTests");if(rt)rt.onclick=render;
  }

  document.getElementById("modalClose").onclick=closeModal;
  document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
  window.render=render;
  render();
})();
