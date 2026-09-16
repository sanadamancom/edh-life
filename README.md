# EDH Life Counter

EDH（Commander）用の卓上ライフカウンターWebアプリです。

このアプリは、特定デッキや特定メカニズム専用の管理機能を増やすのではなく、**どんなEDHデッキでも毎ゲーム使う情報を最短操作で扱う**ことを優先します。背景画像や汎用カウンター管理は持ちません。

## v2 レイアウト

v2は**縦型レイアウトのみ**を使用します。スマホ・タブレットともに4人戦は2×2を基本とし、各プレイヤーを縦長パネルとして構成します。

- ライフを各パネルで最も大きく表示
- `−1 / +1` をライフ下に配置
- Commander Damageをライフ下部に表示
- PartnerはA/BそれぞれのCommander Damageを分離
- 上側プレイヤーは180度回転し、卓の反対側から読める
- Undo / Dice / Reset / Help / Settingsを中央の共有操作列へ配置
- safe area、短いスマホ画面、タブレット幅に合わせて席サイズから自動調整

`layout.js` は端末種別でスマホ/タブレットを分けず、実際の表示領域からスケールを計算します。PWAのmanifestは `portrait-primary` を指定しています。

## 主な機能

- 2〜4人対応 / 初期ライフ40
- ライフ `−1 / +1`
- 複数箇所の同時タッチ
- 相手統率者ごとのCommander Damage管理
- Commander Damage変更をライフへ自動反映
- Commander Damageカードをタップで `+1`
- Commander Damageカード長押しで詳細編集
  - Damage `−1 / +1`
  - Partner時はA/B別Commander Damage
- Commander Damage 21以上 / Life 0以下の敗北表示
- ライフ長押しでプレイヤー設定
  - プレイヤー名
  - プレイヤーカラー
  - 単一統率者 / Partner
- Undo
- 長押しゲームリセット
- D6 1個 / 全員ロール
- D20 / コイン / ランダムプレイヤー
- LocalStorage保存
- PWA / オフライン起動
- Screen Wake Lock / Fullscreen API対応ブラウザをサポート
- iPhone / iPad safe area対応

## 意図的に持たない機能

卓上の物理ダイスやトークンで十分に管理できる、デッキ依存の状態はアプリへ追加しません。

- 毒 / 経験 / 速度などの個別カウンター
- Commander Tax
- Monarch / Initiative
- Energy / Rad / Stormなどの汎用カウンター
- 背景画像設定
- カード検索 / デッキ管理 / 戦績管理

Partnerだけは、Commander DamageをA/Bで分けるために必要なのでアプリ内で管理します。

## 人数別レイアウト

- 4人：2×2
- 3人：上側1人 + 下側2人
- 2人：上下2人

すべて同じv2縦型UI構成を使用します。

## ホーム画面から使う

1. Safariで公開URLを開く
2. 共有ボタンを押す
3. **ホーム画面に追加** を選ぶ
4. `EDH Life` を起動する

## GitHub Pages

公開URL：`https://sanadamancom.github.io/edh-life/`

`.github/workflows/pages.yml` で `main` へのpush時にGitHub Pagesへ自動デプロイします。

## 構成

- `index.html` — ページ構造とアセット読み込み
- `styles.css` — 共通UI・ダイス・モーダル等の基本スタイル
- `v2.css` — v2縦型ゲームレイアウト
- `counters.css` — 長押しUIなど既存モーダル基盤の互換スタイル
- `layout.js` — portrait-only v2のviewport / safe area管理
- `v2-layout.js` — v2用のレスポンシブ・操作レイヤー読込
- `app.js` — 基本状態管理・ライフ・設定・ダイス
- `edh-features.js` — Partner / Commander Damage互換状態
- `multitouch.js` — マルチタッチ入力
- `dice-extra.js` — D20 / コイン / ランダムプレイヤー
- `sw.js` — PWAオフラインキャッシュ

## データ

ゲーム状態はブラウザの `localStorage` に保存されます。サーバーや外部DBには送信しません。

旧バージョンで保存された毒・経験・速度・Commander Tax・Monarch・Initiativeの値は互換性のため読み込み可能なままですが、現在のUI・勝敗判定では使用しません。
