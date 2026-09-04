(function(){
  const BASE={holdings:[
    {name:"Microsoft",symbol:"MSFT",shares:8,avg:466,current:498,upActive:false,lastUpPurchasePct:null,downActive:false,lastDownPurchasePct:null,prevPct:null,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""},
    {name:"Amazon",symbol:"AMZN",shares:10,avg:228.82,current:273,upActive:false,lastUpPurchasePct:null,downActive:false,lastDownPurchasePct:null,prevPct:null,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""},
    {name:"Apple",symbol:"AAPL",shares:6,avg:null,current:null,upActive:false,lastUpPurchasePct:null,downActive:false,lastDownPurchasePct:null,prevPct:null,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""},
    {name:"Costco",symbol:"COST",shares:1,avg:null,current:null,upActive:false,lastUpPurchasePct:null,downActive:false,lastDownPurchasePct:null,prevPct:null,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""},
    {name:"Alphabet",symbol:"GOOG",shares:7,avg:null,current:null,upActive:false,lastUpPurchasePct:null,downActive:false,lastDownPurchasePct:null,prevPct:null,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""},
    {name:"Marriott",symbol:"MAR",shares:7,avg:null,current:null,upActive:false,lastUpPurchasePct:null,downActive:false,lastDownPurchasePct:null,prevPct:null,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""},
    {name:"Philip Morris",symbol:"PM",shares:12,avg:null,current:null,upActive:false,lastUpPurchasePct:null,downActive:false,lastDecisionPct:null,lastDecisionBuy:false,lastDecisionMsg:""}
  ],rules:{downPct:15,downContinue:true,downContinuePct:5,upPct:20,continue:true,continuePct:20,notify:true}};
  // repair any legacy/missing field without overwriting user data
  BASE.holdings[6].downActive=false; BASE.holdings[6].lastDownPurchasePct=null;
  const STORAGE="koboState";
  function normalizeHolding(h){
    h.shares=Number(h.shares)||0;
    h.avg=(h.avg===null||h.avg===undefined||h.avg==="")?null:Number(h.avg);
    h.current=(h.current===null||h.current===undefined||h.current==="")?null:Number(h.current);
    h.symbol=h.symbol||window.kobotradeResolveSymbol(h.name);
    h.upActive=!!h.upActive;h.downActive=!!h.downActive;
    h.lastUpPurchasePct=h.lastUpPurchasePct??null;h.lastDownPurchasePct=h.lastDownPurchasePct??null;
    h.prevPct=h.prevPct??null;h.lastDecisionPct=h.lastDecisionPct??null;h.lastDecisionBuy=!!h.lastDecisionBuy;h.lastDecisionMsg=h.lastDecisionMsg||"";
    return h;
  }
  function load(){
    let s=null;try{s=JSON.parse(localStorage.getItem(STORAGE)||"null")}catch(e){}
    if(!s||!Array.isArray(s.holdings))s=JSON.parse(JSON.stringify(BASE));
    s.rules=Object.assign({},BASE.rules,s.rules||{});
    s.holdings=s.holdings.map(normalizeHolding);
    return s;
  }
  window.KoBoTrade={base:BASE,storageKey:STORAGE,state:load(),tab:"home",detailIndex:null};
  window.state=window.KoBoTrade.state;
  window.save=function(){
    try{localStorage.setItem(STORAGE,JSON.stringify(state));return true}catch(e){console.warn("save failed",e);return false}
  };
  window.f=function(x){return Number(x).toFixed(2)};
  window.pct=function(h){const c=Number(h.current),a=Number(h.avg);return Number.isFinite(c)&&Number.isFinite(a)&&a!==0?(c/a-1)*100:NaN};
  window.pl=function(h){const c=Number(h.current),a=Number(h.avg),s=Number(h.shares);return Number.isFinite(c)&&Number.isFinite(a)&&Number.isFinite(s)?(c-a)*s:NaN};
  window.hasAvg=function(h){return Number.isFinite(Number(h.avg))&&Number(h.avg)>0};
  window.hasCurrent=function(h){return Number.isFinite(Number(h.current))};
  window.escapeHtml=function(v){return String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))};
  window.kobotradeResolveSymbol=function(name){const k=String(name||"").trim().toLowerCase();const m={"microsoft":"MSFT","microsoft corporation":"MSFT","amazon":"AMZN","amazon.com":"AMZN","amazon.com, inc.":"AMZN","apple":"AAPL","apple inc.":"AAPL","costco":"COST","costco wholesale":"COST","alphabet":"GOOG","alphabet inc.":"GOOG","google":"GOOG","marriott":"MAR","marriott international":"MAR","philip morris":"PM","philip morris international":"PM"};return m[k]||String(name||"").trim().toUpperCase()};
  window.closeModal=function(){const m=document.getElementById("modal");if(!m)return;m.classList.remove("open");m.setAttribute("aria-hidden","true");KoBoTrade.detailIndex=null;};
  window.openModal=function(html){const m=document.getElementById("modal"),b=document.getElementById("modalBody");b.innerHTML=html;m.classList.add("open");m.setAttribute("aria-hidden","false")};
})();
