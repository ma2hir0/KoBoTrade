KoBoTrade V2.2

内部設計整理版。
機能を役割ごとのJS部品に分離しています。

core.js        データ管理・保存・共通処理
judgment.js    買う/待つ判定
stock.js       Twelve Data・株価取得・15分キャッシュ
holdings.js    保有銘柄・取得単価・評価損益
settings.js    設定・API Key
notification.js通知
 tests.js      自動テスト
ui.js          画面表示・画面遷移

重要：HTMLファイルを別URL/別保存領域で開き直すとブラウザ保存領域が変わる場合があります。同じホーム画面版を使い続ける前提で利用してください。
