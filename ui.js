(function(){
  function decisionRow(h,i,e){
    const hasA=hasAvg(h), hasC=hasCurrent(h);
    const current=hasC?`$${f(h.current)}`:"—";
    const q=pl(h), r=pct(h);
    const profit=Number.isFinite(q)
      ? `<span class="profit ${q>=0?'positive':'negative'}">${q>=0?'+':'-'}$${f(Math.abs(q))}</span><span class="profit-pct ${r>=0?'positive':'negative'}">${r>=0?'+':''}${f(r)}%</span>`
      : `<span class="profit muted">—</span><span class="profit-pct muted">${hasA?'株価未取得':'取得単価未設定'}</span>`;
    let status,cls;
    if(!hasA){status="未設定";cls="unset"}
    else if(!hasC){status="未取得";cls="unset"}
    else{status=e.buy?"買う":"待つ";cls=e.buy?"buy":"wait"}
    return `<div class="simple-row ${cls}" data-holding="${i}">
      <div class="simple-name">${escapeHtml(h.name)}</div>
      <div class="simple-price"><span class="current-price">${current}</span><span class="profit-line">${profit}</span></div>
      <div class="simple-status ${cls}">${status}</div>
    </div>`;
  }

  function homeView(){
    const items=state.holdings.map((h,i)=>{
      const currentPct=pct(h);
      const sameAsLast=Number.isFinite(currentPct)&&h.lastDecisionPct!==null&&Math.abs(currentPct-Number(h.lastDecisionPct))<0.0001;
      const e=sameAsLast
        ? {p:currentPct,buy:!!h.lastDecisionBuy,msg:h.lastDecisionMsg||"待つ"}
        : evaluate(h,true);
      return {h,i,e};
    });
    return `<div class="home-head"><div class="subtitle">今日の判定</div></div>
      <div class="simple-list">
        <div class="simple-header"><span>銘柄</span><span>株価・損益</span><span>判定</span></div>
        ${items.length?items.map(x=>decisionRow(x.h,x.i,x.e)).join(''):`<div class="empty-card">保有銘柄がありません。<br>「保有銘柄」から追加してください。</div>`}
      </div>`;
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
    document.querySelectorAll(".simple-row[data-holding]").forEach(r=>r.onclick=()=>editHolding(Number(r.dataset.holding)));
    const a=document.getElementById("addHolding");if(a)a.onclick=addHolding;
    if(KoBoTrade.tab==="settings")bindSettings();
    const rt=document.getElementById("rerunTests");if(rt)rt.onclick=render;
  }

  document.getElementById("modalClose").onclick=closeModal;
  document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
  window.render=render;
  render();
})();
