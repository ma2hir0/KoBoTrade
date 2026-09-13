(function(){
  const DAILY_KEY="kobotrade_daily_check_date_test_v23";

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
        await reg.showNotification(t,{body:b,tag:"kobotrade-buy-v23",renotify:true});
        return true;
      }
    }catch(e){console.warn("showNotification",e)}
    try{new Notification(t,{body:b,tag:"kobotrade-buy-v23"});return true}catch(e){return false}
  };

  function todayKey(){
    const d=new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }
  function isWeekday(){return true}
  function alreadyCheckedToday(){return localStorage.getItem(DAILY_KEY)===todayKey()}
  function markCheckedToday(){try{localStorage.setItem(DAILY_KEY,todayKey())}catch(e){}}

  window.kobotradeDailyCheckStatus=function(){return {weekday:true,checked:alreadyCheckedToday(),date:todayKey()}};

  let running=false;
  window.kobotradeRunDailyCheck=async function(){
    if(running||alreadyCheckedToday()||!state.rules.notify)return {ran:false,reason:"skip"};
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

  window.kobotradeShowDailyCheckStatus=function(){return alreadyCheckedToday()?"今日のテストチェック済み":"今日のテストチェック未実施"};
})();
