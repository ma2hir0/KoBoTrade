(function(){
  const DAILY_KEY="kobotrade_daily_check_date_v28";

  async function getRegistration(){
    try{
      if(!("serviceWorker" in navigator))return null;
      const reg=await navigator.serviceWorker.ready;
      return reg||null;
    }catch(e){return null}
  }

  window.kobotradeRequestNotificationPermission=async function(){
    if(!(window.Notification))return{ok:false,state:"unsupported"};
    if(Notification.permission==="granted")return{ok:true,state:"granted"};
    const p=await Notification.requestPermission();
    return{ok:p==="granted",state:p};
  };

  window.kobotradeShowNotification=async function(t,b){
    if(!(window.Notification)||Notification.permission!=="granted")return false;
    try{
      const reg=await getRegistration();
      if(reg&&reg.showNotification){
        await reg.showNotification(t,{body:b,tag:"kobotrade-buy-v28",renotify:true});
        return true;
      }
    }catch(e){console.warn("showNotification",e)}
    try{new Notification(t,{body:b,tag:"kobotrade-buy-v28"});return true}catch(e){return false}
  };

  function todayKey(){
    const d=new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }
  function isWeekday(){const d=new Date().getDay();return d>=1&&d<=5}
  function alreadyCheckedToday(){return localStorage.getItem(DAILY_KEY)===todayKey()}
  function markCheckedToday(){try{localStorage.setItem(DAILY_KEY,todayKey())}catch(e){}}

  window.kobotradeDailyCheckStatus=function(){return {weekday:isWeekday(),checked:alreadyCheckedToday(),date:todayKey()}};

  let running=false;
  window.kobotradeRunDailyCheck=async function(force=false){
    if(running||(!force&&alreadyCheckedToday())||(!force&&!isWeekday())||!state.rules.notify)return {ran:false,reason:!state.rules.notify?"notify_off":(!force&&!isWeekday()?"weekend":(!force&&alreadyCheckedToday()?"already_checked":"skip"))};
    if(!kobotradeV20GetApiKey())return {ran:false,reason:"no_api_key"};
    running=true;
    try{
      if(window.Notification&&Notification.permission==="default"){
        const p=await kobotradeRequestNotificationPermission();
        if(!p.ok)return {ran:false,reason:"notification_permission"};
      }

      const buys=[];let failed=0;
      for(const h of state.holdings){
        try{
          const symbol=h.symbol||kobotradeResolveSymbol(h.name);
          h.symbol=symbol;
          h.current=await kobotradeV20FetchPrice(symbol);
          const e=evaluate(h,true);
          if(e.buy)buys.push({name:h.name,symbol,price:h.current,pct:e.p,msg:e.msg});
        }catch(e){failed++}
      }
      save();markCheckedToday();
      for(const b of buys){
        await kobotradeShowNotification(`KoBoTrade：${b.name} 買う`,`${b.symbol} $${f(b.price)} / ${b.pct>=0?"+":"-"}${f(Math.abs(b.pct))}%\n${b.msg}`);
      }
      if(window.render)window.render();
      return {ran:true,buys:buys.length,failed};
    }finally{running=false}
  };

  window.kobotradeShowDailyCheckStatus=function(){if(!isWeekday())return "土日：チェック対象外";return alreadyCheckedToday()?"今日のチェック済み":"今日のチェック未実施"};
  window.kobotradeResetDailyCheckForTest=function(){try{localStorage.removeItem(DAILY_KEY);return true}catch(e){return false}};
  window.kobotradeNotificationDiagnostics=async function(){
    let sw="unsupported",scope="—";
    try{if("serviceWorker" in navigator){const reg=await navigator.serviceWorker.ready;sw=reg&&reg.active?"active":"registered";scope=reg&&reg.scope||"—"}}catch(e){sw="error"}
    const perm=window.Notification?Notification.permission:"unsupported";
    const api=!!(window.kobotradeV20GetApiKey&&kobotradeV20GetApiKey());
    const tsla=state.holdings.find(h=>(h.symbol||"").toUpperCase()==="TSLA"||String(h.name||"").toLowerCase().includes("tsla"));
    let quote=null,decision=null,error=null;
    if(tsla){try{quote=await kobotradeV20FetchPrice("TSLA");tsla.current=quote;decision=evaluate(tsla,false)}catch(e){error=e&&e.message||String(e)}}
    return {permission:perm,serviceWorker:sw,scope,apiKey:api,holdings:state.holdings.length,tsla:tsla?{current:tsla.current,pct:pct(tsla),decision:decision&&decision.buy?"買う":"待つ",message:decision&&decision.msg,downActive:!!tsla.downActive,lastDownPurchasePct:tsla.lastDownPurchasePct,prevPct:tsla.prevPct}:null,error};
  };

})();
