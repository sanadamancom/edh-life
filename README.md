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

## GitHub Pages

公開URL想定：

`https://sanadamancom.github.io/edh-life/`

`.github/workflows/pages.yml` で `main` へのpush時にGitHub Pagesへデプロイする構成です。

初回だけ、GitHubの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

> 現在このリポジトリはPrivateです。PrivateリポジトリのGitHub Pagesは対応プランが必要です。利用できない場合はリポジトリをPublicに変更してください。

## 構成

- `index.html` — アプリ本体（単一HTML）
- `.github/workflows/pages.yml` — GitHub Pagesデプロイ
- `.nojekyll` — Jekyll処理無効化

## データ

ゲーム状態はブラウザの `localStorage` に保存されます。サーバーや外部DBには送信しません。
