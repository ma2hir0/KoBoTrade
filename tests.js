(function(){
  function eq(a,b){return JSON.stringify(a)===JSON.stringify(b)}
  window.runTests=function(){const out=[];function t(name,fn){try{out.push({name,ok:!!fn()})}catch(e){out.push({name,ok:false,error:e.message})}}
    t("保存→復元",()=>{const old=JSON.parse(JSON.stringify(state));save();const loaded=JSON.parse(localStorage.getItem("koboState"));return !!loaded&&Array.isArray(loaded.holdings)&&loaded.holdings.length===state.holdings.length&&eq(loaded.rules,state.rules)});
    t("取得単価計算",()=>{const h={avg:100,current:120,shares:2};return pl(h)===40&&Math.round(pct(h))===20});
    t("取得単価未設定",()=>!Number.isFinite(pl({avg:null,current:100,shares:1})));
    t("銘柄コード MSFT",()=>kobotradeResolveSymbol("Microsoft")==="MSFT");
    t("銘柄コード AMZN",()=>kobotradeResolveSymbol("Amazon")==="AMZN");
    t("銘柄コード AAPL",()=>kobotradeResolveSymbol("Apple")==="AAPL");
    t("銘柄コード COST",()=>kobotradeResolveSymbol("Costco")==="COST");
    t("銘柄コード GOOG",()=>kobotradeResolveSymbol("Alphabet")==="GOOG");
    t("銘柄コード MAR",()=>kobotradeResolveSymbol("Marriott")==="MAR");
    t("銘柄コード PM",()=>kobotradeResolveSymbol("Philip Morris")==="PM");
    t("下落−15%判定",()=>{const h={avg:100,current:85,shares:1,downActive:false,lastDownPurchasePct:null,upActive:false,lastUpPurchasePct:null,prevPct:null,lastDecisionPct:null};const x=evaluate(h,false);return x.buy===true});
    t("上昇＋20%判定",()=>{const h={avg:100,current:120,shares:1,downActive:false,lastDownPurchasePct:null,upActive:false,lastUpPurchasePct:null,prevPct:null,lastDecisionPct:null};const x=evaluate(h,false);return x.buy===true});
    t("条件外は待つ",()=>{const h={avg:100,current:110,shares:1,downActive:false,lastDownPurchasePct:null,upActive:false,lastUpPurchasePct:null,prevPct:null,lastDecisionPct:null};return evaluate(h,false).buy===false});
    t("下落継続率設定",()=>state.rules.downContinuePct===5);
    t("上昇継続率設定",()=>state.rules.continuePct===20);
    t("7銘柄管理",()=>state.holdings.length===7);
    t("株価キャッシュTTL",()=>window.kobotradeV20GetQuoteCacheInfo&&typeof window.kobotradeV20GetQuoteCacheInfo("AAPL")==="object");
    t("API Key関数",()=>typeof kobotradeV20SaveApiKey==="function"&&typeof kobotradeV20GetApiKey==="function");
    t("モーダル関数",()=>typeof openModal==="function"&&typeof closeModal==="function");
    return out;
  };
  window.testsView=function(){const r=runTests(),ok=r.filter(x=>x.ok).length;return `<div class="subtitle">自動テスト</div><div class="card"><div class="row"><b>${ok} / ${r.length} OK</b></div>${r.map(x=>`<div class="test-row"><span>${escapeHtml(x.name)}</span><span class="${x.ok?'ok':'ng'}">${x.ok?'OK':'NG'}</span></div>`).join("")}</div><button class="primary" id="rerunTests">テストを再実行</button>`};
})();
