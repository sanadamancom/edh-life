# EDH Life Counter

EDH（Commander）用の卓上ライフカウンターWebアプリです。

## v2

v2ではスマホ・タブレットの**縦向きを正式なネイティブレイアウト**として扱います。従来の「横長ボードを90度回転する」方式は縦向きでは使いません。横向きはこれまでのv1レイアウトを維持します。

縦4人戦は2×2を維持し、各プレイヤーを縦長パネルとして構成します。

- ライフをパネル上部〜中央で最も大きく表示
- `−1 / +1`、`−5 / +5` をライフ下の2×2操作パッドへ配置
- Commander Damageはその下に縦リストで配置
- PartnerはA/Bそれぞれの `+1` を維持
- 上側プレイヤーは従来どおり180度回転
- Monarch / Initiativeの8分割ハブは4人の交点へ配置
- Undo / Dice / Reset / Fullscreen / Help / Settingsは縦向きでは下部ツールバーへ移動
- safe area、短い画面、タブレット幅に応じて自動縮小・拡大

## 主な機能

- 2〜4人対応
- 初期ライフ40
- ライフ操作は `−5 / −1 / LIFE / +1 / +5`
- ライフの `±1 / ±5` とCommander Damage `+1` は長押し連続入力、複数箇所の同時タッチにも対応
- ライフ数字・Commander Damage・各種ボタンを表示領域に合わせて自動調整
- 相手統率者ごとのCommander Damage管理
- 通常画面のCommander Damage操作は大きい `+1` のみに絞り、減算は詳細画面で実施
- Commander Damageの増減をライフへ自動反映
- Commander Damageカード本体を長押しすると統率者詳細を表示
  - 単一統率者 / Partner 切り替え
  - Partner時は統率者A/BのCommander Damageを別々に管理
  - 統率者A/BのCommander Taxを別々に管理（2点刻み）
- Commander Taxは0より大きいときだけ通常のCommander Damageカードにも `T+2` などで表示
- Life 0以下 / 各Commander Damage 21以上 / Poison 10以上の敗北判定
- 敗北時は `DEFEATED` の下に敗北理由を表示
- ライフ数字長押しで特殊カウンター画面を開く
  - 毒カウンター
  - 経験カウンター
  - 速度（0〜4）
- Monarch / Initiative は盤面中央の1つの8分割ハブで管理
  - 金の1/8 = Monarch、紫の1/8 = Initiative
  - 4人戦では各プレイヤー方向に2つの1/8を割り当て、両方を保持するとその方向の1/4が埋まる
  - 中央の `♛ / ◆` をタップして移動先選択モードへ
  - プレイヤー領域をタップすると所有者を移動し、現在の所有者を再度選ぶと解除
  - 設定画面から卓状態UIをON/OFF可能。OFF時はMonarch / Initiative状態もクリア
- 特殊カウンターは有効なものだけ通常画面にアイコン付きで表示
- Undo
- リセットは長押し時のみ実行
- 設定画面には従来の2段階確認リセットも残す
- プレイヤー名・カラー変更
- LocalStorageで状態保存
- D6：1個 / 全員ロール
- D20 / コイン / ランダムプレイヤー
- ダイスの転がり演出、D6の目表示、1の目は赤
- 全員ロール時の最高値強調
- ダイス結果は次のタップまで表示
- Screen Wake Lock対応ブラウザでは画面スリープ防止
- Fullscreen API対応ブラウザではフルスクリーン表示
- PWA対応 / オフライン起動
- iPhone / iPadのsafe areaと縦横表示に対応

## GitHub Pages

公開URL：

`https://sanadamancom.github.io/edh-life/`

`.github/workflows/pages.yml` で `main` へのpush時にGitHub Pagesへ自動デプロイします。

GitHubの **Settings → Pages → Build and deployment → Source** は **GitHub Actions** に設定してください。

## ホーム画面から使う

1. Safariで公開URLを開く
2. 共有ボタンを押す
3. **ホーム画面に追加** を選ぶ
4. 追加された `EDH Life` アイコンから起動する

manifestの向き指定は `any` です。横向きでは従来の横長レイアウト、縦向きではv2のネイティブ縦レイアウトを自動選択します。

## レイアウト方針

- 横向き: 既存の844×390論理ボードを基準としたv1レイアウト
- 縦向き: 実際のviewportをそのまま使うv2レイアウト
- 4人表示は縦横とも基本2×2
- 3人表示は上側1人＋下側2人
- 2人表示は上下2人
- 上側プレイヤーは180度回転し、卓の反対側から読める
- 縦向きではライフ→ライフ操作→Commander Damageの情報階層を明確化
- 特殊カウンターは通常操作を圧迫しないよう長押し画面で編集し、通常画面には有効な値だけ表示
- 単一統率者はCommander Damage `+1` を1個、PartnerはA/Bそれぞれに `+1` を表示
- Commander Damageの減算、Partner切り替え、Commander Tax編集はCommander Damageカード長押しの詳細UIへまとめる
- Commander Taxは通常画面では非0時だけ表示する
- Monarch / Initiative はプレイヤー個別UIから切り離し、ON/OFF可能な卓全体の中央8分割ハブとして扱う

## オフライン

Service Workerでアプリ本体・CSS・JavaScript・manifest・アイコンをキャッシュします。一度オンラインで起動した後は、通信できない場所でも起動できます。

## 構成

- `index.html` — ページ構造とツールバー
- `styles.css` — v1基本UI・レイアウト・ダイス等のアニメーション
- `counters.css` — 特殊カウンター・敗北理由・長押しフィードバック・長押しリセット
- `layout.js` — v1 viewport / safe area / 横長論理ボード計算
- `v2.css` — ネイティブ縦向きレイアウト
- `v2-layout.js` — v2 viewport / safe area / スマホ・タブレット自動サイズ計算
- `app.js` — 基本状態管理・ライフ・Commander Damage・特殊カウンター・設定・ダイス・PWA補助
- `edh-features.js` — Partner、Commander Tax、Monarch、InitiativeのEDH固有拡張
- `table-state-hub.js` — Monarch / Initiativeの統合8分割ハブと表示ON/OFF
- `multitouch.js` — マルチタッチと長押し連続入力
- `dice-extra.js` — D20、コイン、ランダムプレイヤーと卓状態ハブのローダー
- `manifest.webmanifest` — PWA設定
- `sw.js` — オフラインキャッシュ
- `icon.svg` — PWAアイコン
- `.github/workflows/pages.yml` — GitHub Pagesデプロイ
- `.nojekyll` — Jekyll処理無効化

## データ

ゲーム状態はブラウザの `localStorage` に保存されます。サーバーや外部DBには送信しません。
