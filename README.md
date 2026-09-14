# EDH Life Counter

EDH（Commander）用の卓上ライフカウンターWebアプリです。

## 主な機能

- 2〜4人対応
- 初期ライフ40
- メインの ±1 と、-10 / -5 / +5 / +10
- 相手統率者ごとのCommander Damage管理
- Commander Damageの増減をライフへ自動反映
- 21 Commander Damage / Life 0以下の警告
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
- iPhone横向き向けのdynamic viewport / safe area対応

## GitHub Pages

公開URL：

`https://sanadamancom.github.io/edh-life/`

`.github/workflows/pages.yml` で `main` へのpush時にGitHub Pagesへ自動デプロイする構成です。

GitHubの **Settings → Pages → Build and deployment → Source** は **GitHub Actions** に設定してください。

## iPhoneでアプリとして使う

1. Safariで `https://sanadamancom.github.io/edh-life/` を開く
2. 共有ボタンを押す
3. **ホーム画面に追加** を選ぶ
4. 追加された `EDH Life` アイコンから起動する

ホーム画面から起動すると `standalone` モードになり、通常のSafariのアドレスバーやタブUIなしで利用できます。

manifestでは横向きを指定しています。iOS側の制限により向きが完全固定されない場合がありますが、UIは横向きでの利用を前提に最適化しています。

## オフライン

Service Workerでアプリ本体・manifest・アイコンをキャッシュします。一度オンラインで起動した後は、通信できない場所でも起動可能です。

更新時はナビゲーションだけネットワーク優先にしているため、GitHub Pagesへ新しい版が反映された後に再度開けば更新を取得できます。

## 構成

- `index.html` — アプリ本体
- `manifest.webmanifest` — PWA設定
- `sw.js` — オフラインキャッシュ
- `icon.svg` — アプリアイコン
- `.github/workflows/pages.yml` — GitHub Pagesデプロイ
- `.nojekyll` — Jekyll処理無効化

## データ

ゲーム状態はブラウザの `localStorage` に保存されます。サーバーや外部DBには送信しません。
