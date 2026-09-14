# EDH Life Counter

EDH（Commander）用の卓上ライフカウンターWebアプリです。

## 主な機能

- 2〜4人対応
- 初期ライフ40
- ライフ操作は `−5 / −1 / LIFE / +1 / +5`
- ライフ数字・Commander Damage・各種ボタンを表示領域に合わせて自動調整
- 相手統率者ごとのCommander Damage管理
- Commander Damageの増減をライフへ自動反映
- Life 0以下 / Commander Damage 21以上の敗北表示
- ライフ数字長押しで直接入力
- Undo
- 2段階確認の全リセット
- プレイヤー名・カラー変更
- LocalStorageで状態保存
- D6：1個 / 全員ロール
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

manifestの向き指定は `any` です。アプリ側では、横向きはそのまま、縦向きは完成した横長ボード全体を90度回転して表示します。

## レイアウト方針

内部UIは高さ390pxの論理ボードを基準にしています。

- 短辺は表示領域に合わせて拡大縮小
- 長辺は最大844px
- 端末のsafe areaと操作ボタン用に長辺側へガターを確保
- 4人表示は常に2×2の均等分割
- ライフ数字の大きさは値そのものではなく、プレイヤー領域の実幅から決定

## オフライン

Service Workerでアプリ本体・CSS・JavaScript・manifest・アイコンをキャッシュします。一度オンラインで起動した後は、通信できない場所でも起動できます。

## 構成

- `index.html` — ページ構造とツールバー
- `styles.css` — UI・レイアウト・アニメーション
- `layout.js` — viewport / safe area / 縦横表示 / 自動サイズ計算
- `app.js` — 状態管理・ライフ・Commander Damage・設定・ダイス・PWA補助
- `manifest.webmanifest` — PWA設定
- `sw.js` — オフラインキャッシュ
- `icon.svg` — アプリアイコン
- `.github/workflows/pages.yml` — GitHub Pagesデプロイ
- `.nojekyll` — Jekyll処理無効化

## データ

ゲーム状態はブラウザの `localStorage` に保存されます。サーバーや外部DBには送信しません。
