# 麻雀成績管理アプリ

麻雀の対局成績を記録・管理するためのWebアプリケーションです。

## 🎯 機能

### 実装済み機能
- ✅ ユーザー登録・ログイン機能
- ✅ ルール設定（ウマオカ計算）
- ✅ 場所登録
- ✅ 成績登録（4人麻雀対応）
- ✅ 成績一覧表示
- ✅ ユーザー全体成績管理
- ✅ 統計・ランキング表示

### 画面一覧
1. **ログイン画面** - ユーザー認証
2. **アカウント登録画面** - 新規ユーザー登録
3. **ダッシュボード** - 概要表示
4. **ルール設定** - ウマオカの設定管理
5. **場所登録** - 対局場所の管理
6. **成績登録** - 新規対局の記録
7. **成績一覧** - 過去の対局履歴
8. **統計画面** - ユーザー別の成績分析とランキング

## 🛠️ 技術スタック

### バックエンド
- **PHP 8.2**
- **Laravel 10**
- **MySQL 8.0**
- **Apache**

### フロントエンド
- **React 18**
- **React Router v6**
- **Axios**

### インフラ
- **Docker & Docker Compose**

## 📋 必要な環境

- Docker
- Docker Compose

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Docker環境の起動

```bash
docker-compose up -d
```

### 3. バックエンドのセットアップ

バックエンドコンテナに入る：

```bash
docker exec -it mahjong_backend bash
```

Laravelの依存関係をインストール：

```bash
composer install
```

環境設定ファイルをコピー：

```bash
cp .env.example .env
```

アプリケーションキーを生成：

```bash
php artisan key:generate
```

データベースのマイグレーション：

```bash
php artisan migrate
```

ストレージディレクトリの権限設定：

```bash
chmod -R 777 storage bootstrap/cache
```

コンテナから抜ける：

```bash
exit
```

### 4. フロントエンドのセットアップ

フロントエンドコンテナに入る：

```bash
docker exec -it mahjong_frontend sh
```

依存関係をインストール：

```bash
npm install
```

コンテナから抜ける：

```bash
exit
```

フロントエンドを起動：

```bash
docker-compose restart frontend
```

### 5. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **MySQL**: localhost:3306

## 📱 使い方

### 1. ユーザー登録

1. http://localhost:3000/register にアクセス
2. 名前、メールアドレス、パスワードを入力して登録

### 2. ルール設定

1. ダッシュボードから「ルール設定」をクリック
2. 以下の項目を設定：
   - ルール名（例：東風戦、半荘戦）
   - 開始点（デフォルト：25000点）
   - 返し点（デフォルト：30000点）
   - ウマ（1位〜4位）
   - オカ

### 3. 場所登録

1. 「場所登録」から新規場所を追加
2. 雀荘名や住所、メモを入力

### 4. 成績登録

1. 「成績登録」をクリック
2. 以下の情報を入力：
   - 使用するルール
   - 対局場所（任意）
   - 対局日時
   - 各プレイヤーの成績（順位・素点）
3. 登録すると自動的にウマオカが計算されます

### 5. 統計の確認

「統計」画面で以下の情報を確認できます：
- 平均スコアランキング
- 各プレイヤーの順位分布
- 1位率、連対率
- 累計スコア

## 🎮 ゲーム登録の計算例

**ルール設定例：**
- 開始点：25000点
- 返し点：30000点
- ウマ：20/10/-10/-20
- オカ：10

**対局結果：**
- 1位：35000点 → スコア = (35000-30000)/1000 + 20 + 10 = **+35.0**
- 2位：30000点 → スコア = (30000-30000)/1000 + 10 = **+10.0**
- 3位：25000点 → スコア = (25000-30000)/1000 + (-10) = **-15.0**
- 4位：10000点 → スコア = (10000-30000)/1000 + (-20) = **-40.0**

## 🗄️ データベース構造

### users テーブル
- ユーザー情報（名前、メール、パスワード）

### rules テーブル
- ルール設定（開始点、返し点、ウマオカ）

### locations テーブル
- 場所情報（名前、住所、メモ）

### games テーブル
- 対局情報（ルール、場所、対局日時）

### game_players テーブル
- プレイヤー別成績（順位、素点、計算後スコア）

## 🔧 トラブルシューティング

### ポートが既に使用されている場合

docker-compose.ymlのポート番号を変更してください：

```yaml
services:
  backend:
    ports:
      - "8080:80"  # 8000 → 8080に変更
  frontend:
    ports:
      - "3001:3000"  # 3000 → 3001に変更
```

### データベース接続エラー

1. データベースコンテナが起動しているか確認：
```bash
docker-compose ps
```

2. バックエンドコンテナを再起動：
```bash
docker-compose restart backend
```

### マイグレーションエラー

データベースをリセット：

```bash
docker exec -it mahjong_backend php artisan migrate:fresh
```

## 📝 開発者向け情報

### APIエンドポイント

#### 認証
- `POST /api/register` - ユーザー登録
- `POST /api/login` - ログイン
- `POST /api/logout` - ログアウト

#### ルール
- `GET /api/rules` - ルール一覧
- `POST /api/rules` - ルール作成
- `PUT /api/rules/{id}` - ルール更新
- `DELETE /api/rules/{id}` - ルール削除

#### 場所
- `GET /api/locations` - 場所一覧
- `POST /api/locations` - 場所作成
- `PUT /api/locations/{id}` - 場所更新
- `DELETE /api/locations/{id}` - 場所削除

#### ゲーム
- `GET /api/games` - ゲーム一覧
- `POST /api/games` - ゲーム作成
- `GET /api/games/{id}` - ゲーム詳細
- `PUT /api/games/{id}` - ゲーム更新
- `DELETE /api/games/{id}` - ゲーム削除

#### 統計
- `GET /api/scores/statistics` - 全体統計
- `GET /api/scores/user/{userId}` - ユーザー別統計
- `GET /api/scores/ranking` - ランキング

## 📄 ライセンス

MIT License

## 👥 貢献

プルリクエストを歓迎します！

## 🙏 謝辞

麻雀を愛するすべてのプレイヤーへ
