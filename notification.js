(function(){
  const DAILY_KEY="kobotrade_daily_check_date";

  window.kobotradeRequestNotificationPermission=async function(){
    if(!(window.Notification))return{ok:false,state:"unsupported"};
    if(Notification.permission==="granted")return{ok:true,state:"granted"};
    const p=await Notification.requestPermission();
    return{ok:p==="granted",state:p};
  };

  window.kobotradeShowNotification=function(t,b){
    if(!(window.Notification)||Notification.permission!=="granted")return false;
    try{
      new Notification(t,{body:b,tag:"kobotrade-buy"});
      return true;
    }catch(e){return false}
  };

  function todayKey(){
    const d=new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }
  function isWeekday(){const n=new Date().getDay();return n>=1&&n<=5}
  function alreadyCheckedToday(){return localStorage.getItem(DAILY_KEY)===todayKey()}
  function markCheckedToday(){try{localStorage.setItem(DAILY_KEY,todayKey())}catch(e){}}

  window.kobotradeDailyCheckStatus=function(){
    return {weekday:isWeekday(),checked:alreadyCheckedToday(),date:todayKey()};
  };

  let running=false;
  window.kobotradeRunDailyCheck=async function(){
    if(running||!isWeekday()||alreadyCheckedToday()||!state.rules.notify)return {ran:false,reason:"skip"};
    if(!kobotradeV20GetApiKey())return {ran:false,reason:"no_api_key"};
    running=true;
    try{
      if(window.Notification&&Notification.permission==="default"){
        const p=await kobotradeRequestNotificationPermission();
        if(!p.ok)return {ran:false,reason:"notification_permission"};
      }

      const buys=[];
      let failed=0;
      for(const h of state.holdings){
        try{
          const symbol=h.symbol||kobotradeResolveSymbol(h.name);
          h.symbol=symbol;
          h.current=await kobotradeV20FetchPrice(symbol);
          const e=evaluate(h,true);
          if(e.buy)buys.push({name:h.name,symbol,price:h.current,pct:e.p,msg:e.msg});
        }catch(e){failed++}
      }

      save();
      markCheckedToday();

      for(const b of buys){
        kobotradeShowNotification(
          `KoBoTrade：${b.name} 買う`,
          `${b.symbol} $${f(b.price)} / ${b.pct>=0?"+":"-"}${f(Math.abs(b.pct))}%\n${b.msg}`
        );
      }
      if(window.render)window.render();
      return {ran:true,buys:buys.length,failed};
    }finally{running=false}
  };

  window.kobotradeShowDailyCheckStatus=function(){
    const s=kobotradeDailyCheckStatus();
    if(!s.weekday)return "土日のため日次チェック対象外";
    return s.checked?"今日の日次チェック済み":"今日の日次チェック未実施";
  };
})();
