# EDH Life Counter

EDH（Commander）用の卓上ライフカウンターWebアプリです。

## v2 レイアウト

v2ではスマホ・タブレットの**縦向きを正式なネイティブレイアウト**として扱います。従来の「完成した横長ボードを90度回転する」方式は縦向きでは使いません。横向きは従来のv1レイアウトを維持します。

縦4人戦は2×2を維持し、各プレイヤーを縦長パネルとして構成します。

- ライフを各パネルで最も大きく表示
- `−1 / +1`、`−5 / +5` をライフ下の2×2操作パッドへ配置
- Commander Damageはその下に縦リストで配置
- PartnerはA/Bそれぞれの `+1` を表示
- 上側プレイヤーは180度回転し、卓の反対側から読める
- Monarch / Initiativeの8分割ハブはプレイヤー4区画の交点へ配置
- Undo / Dice / Reset / Fullscreen / Help / Settingsは縦向きでは下部ツールバーへ移動
- safe area、短いスマホ画面、タブレット幅に合わせて自動調整

`layout.js` が最初から画面向きを判定し、縦ならv2、横ならv1だけを計算します。縦表示のために一度横画面を生成して回転する処理はありません。

## 主な機能

- 2〜4人対応 / 初期ライフ40
- ライフ `−5 / −1 / +1 / +5`
- ライフ操作とCommander Damage `+1` の長押し連続入力
- 複数箇所の同時タッチ
- 相手統率者ごとのCommander Damage管理
- Commander Damage変更をライフへ自動反映
- Commander Damageカード長押しで詳細編集
  - Damage `−1 / +1`
  - 単一統率者 / Partner切り替え
  - A/B別Commander Damage
  - A/B別Commander Tax（2点刻み）
- Commander Taxは非0時だけ通常画面へ `T+2` などで表示
- Life 0以下 / Commander Damage 21以上 / Poison 10以上の敗北判定
- ライフ長押しで毒・経験・速度を編集
- Monarch / Initiative統合8分割ハブ
  - 金の1/8 = Monarch
  - 紫の1/8 = Initiative
  - 4人戦では各プレイヤー方向に2つの1/8を割り当てる
  - `♛ / ◆` を選択後、移動先プレイヤーをタップ
  - 現所有者を再度選ぶと解除
  - 設定からON/OFF可能。OFF時は両状態をクリア
- Undo / 長押しリセット
- プレイヤー名・カラー変更
- LocalStorage保存
- D6 1個 / 全員ロール
- D20 / コイン / ランダムプレイヤー
- PWA / オフライン起動
- Screen Wake Lock / Fullscreen API対応ブラウザをサポート
- iPhone / iPad safe area対応

## 人数別レイアウト

- 4人：2×2
- 3人：上側1人 + 下側2人
- 2人：上下2人

横向きでは844×390の論理ボードを基準とした従来レイアウトを使います。縦向きでは実際のviewportをそのまま使用し、端末サイズに応じてライフ、操作ボタン、Commander Damage、ツールバーを個別にスケールします。

## ホーム画面から使う

1. Safariで公開URLを開く
2. 共有ボタンを押す
3. **ホーム画面に追加** を選ぶ
4. `EDH Life` を起動する

manifestの向き指定は `any` です。端末の実際の向きに合わせてv1/v2を自動選択します。

## GitHub Pages

公開URL：`https://sanadamancom.github.io/edh-life/`

`.github/workflows/pages.yml` で `main` へのpush時にGitHub Pagesへ自動デプロイします。

## 構成

- `index.html` — ページ構造とアセット読み込み
- `styles.css` — v1基本UI・横向きレイアウト・ダイス
- `v2.css` — ネイティブ縦向きv2レイアウト
- `counters.css` — 特殊カウンター・敗北・長押しUI
- `layout.js` — viewport / safe area / 縦v2・横v1のレイアウト計算
- `v2-layout.js` — v2移行時の互換用no-opローダー
- `app.js` — 基本状態管理・ライフ・設定・ダイス
- `edh-features.js` — Partner / Commander Tax / Monarch / Initiative
- `table-state-hub.js` — Monarch / Initiative統合8分割ハブ
- `multitouch.js` — マルチタッチと長押し連続入力
- `dice-extra.js` — D20 / コイン / ランダムプレイヤー
- `sw.js` — PWAオフラインキャッシュ

## データ

ゲーム状態はブラウザの `localStorage` に保存されます。サーバーや外部DBには送信しません。
