(function(){
  window.evaluate=function(h,mutate=true){
    const raw=pct(h);const p=Number.isFinite(raw)?(Math.abs(raw)<0.0001?0:Math.round(raw*100)/100):NaN;const r=state.rules;
    if(!Number.isFinite(p))return{p:NaN,buy:false,msg:"取得単価未設定"};
    if(mutate&&h.lastDecisionPct!==null&&Math.abs(p-h.lastDecisionPct)<0.0001)return{p,buy:!!h.lastDecisionBuy,msg:h.lastDecisionMsg||"待つ"};
    let buy=false,msg="待つ";
    if(p<0){
      if(r.downContinue&&h.downActive&&h.lastDownPurchasePct!==null&&p>=h.lastDownPurchasePct+r.downContinuePct-0.0001){h.downActive=false;h.lastDownPurchasePct=null}
      if(!h.downActive){if((h.prevPct===null||h.prevPct===undefined?Math.abs(p+r.downPct)<=0.0001:h.prevPct>-r.downPct+0.0001&&p<=-r.downPct+0.0001)){buy=true;msg=`−${r.downPct}%到達`;if(r.downContinue){h.downActive=true;h.lastDownPurchasePct=p}}}
      else if(r.downContinue){const next=h.lastDownPurchasePct-r.downContinuePct;if((h.prevPct===null||h.prevPct>next)&&p<=next+0.0001){buy=true;msg=`−${r.downContinuePct}%継続購入`;h.lastDownPurchasePct=p}}
    }else{
      if(r.continue&&h.upActive&&h.lastUpPurchasePct!==null&&p<=h.lastUpPurchasePct-r.continuePct+0.0001){h.upActive=false;h.lastUpPurchasePct=null}
      if(!h.upActive){if((h.prevPct===null||h.prevPct<r.upPct)&&p>=r.upPct-0.0001){buy=true;msg=`＋${r.upPct}%到達`;if(r.continue){h.upActive=true;h.lastUpPurchasePct=p}}}
      else if(r.continue){const next=h.lastUpPurchasePct+r.continuePct;if((h.prevPct===null||h.prevPct<next)&&p>=next-0.0001){buy=true;msg=`＋${r.continuePct}%継続購入`;h.lastUpPurchasePct=p}}
    }
    if(mutate){h.lastDecisionPct=p;h.lastDecisionBuy=buy;h.lastDecisionMsg=msg;h.prevPct=p;save()}
    return{p,buy,msg};
  };
  window.near=function(h,p){if(!Number.isFinite(p))return"取得単価を設定してください";const r=state.rules;if(p<0){if(r.downContinue&&h.downActive&&h.lastDownPurchasePct!==null){const n=h.lastDownPurchasePct-r.downContinuePct;if(p>n)return`−${f(Math.abs(n))}%まであと${f(p-n)}%`}const n=-r.downPct;return p>n?`−${f(r.downPct)}%まであと${f(p-n)}%`:"下落購入条件到達済み"}if(r.continue&&h.upActive&&h.lastUpPurchasePct!==null){const n=h.lastUpPurchasePct+r.continuePct;if(p<n)return`＋${f(n)}%まであと${f(n-p)}%`}return p<r.upPct?`＋${f(r.upPct)}%まであと${f(r.upPct-p)}%`:"上昇購入条件到達済み"};
})();
