# セットアップガイド

このドキュメントでは、麻雀成績管理アプリをローカル環境で動作させるための詳細な手順を説明します。

## 前提条件

以下がインストールされていることを確認してください：

- Docker Desktop（Windows/Mac）または Docker Engine + Docker Compose（Linux）
- Git

## セットアップ手順

### ステップ1: Docker環境の確認

Dockerが正常に動作していることを確認：

```bash
docker --version
docker-compose --version
```

### ステップ2: プロジェクトディレクトリに移動

```bash
cd /path/to/mahjong-app
```

### ステップ3: Docker Composeでコンテナを起動

```bash
docker-compose up -d
```

このコマンドで以下のコンテナが起動します：
- `mahjong_db`: MySQLデータベース
- `mahjong_backend`: Laravel バックエンド（PHP + Apache）
- `mahjong_frontend`: React フロントエンド

### ステップ4: バックエンドのセットアップ

#### 4.1 バックエンドコンテナに入る

```bash
docker exec -it mahjong_backend bash
```

#### 4.2 Composerで依存関係をインストール

```bash
composer install
```

#### 4.3 環境設定ファイルを作成

```bash
cp .env.example .env
```

#### 4.4 アプリケーションキーを生成

```bash
php artisan key:generate
```

#### 4.5 データベースマイグレーション

```bash
php artisan migrate
```

#### 4.6 ストレージディレクトリの権限設定

```bash
chmod -R 777 storage bootstrap/cache
```

#### 4.7 コンテナから抜ける

```bash
exit
```

### ステップ5: フロントエンドのセットアップ

#### 5.1 フロントエンドコンテナに入る

```bash
docker exec -it mahjong_frontend sh
```

#### 5.2 npmで依存関係をインストール

```bash
npm install
```

#### 5.3 コンテナから抜ける

```bash
exit
```

#### 5.4 フロントエンドコンテナを再起動

```bash
docker-compose restart frontend
```

### ステップ6: 動作確認

ブラウザで以下のURLにアクセス：

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000

### ステップ7: 初回ユーザー登録

1. http://localhost:3000/register にアクセス
2. ユーザー情報を入力して登録
3. 自動的にログインされ、ダッシュボードが表示されます

## トラブルシューティング

### 問題1: ポートが既に使用されている

**エラーメッセージ:**
```
Error: bind: address already in use
```

**解決方法:**

docker-compose.ymlを編集してポート番号を変更：

```yaml
services:
  backend:
    ports:
      - "8080:80"  # 8000 → 8080に変更
  
  frontend:
    ports:
      - "3001:3000"  # 3000 → 3001に変更
  
  db:
    ports:
      - "3307:3306"  # 3306 → 3307に変更
```

### 問題2: composer installが失敗する

**解決方法:**

PHPのメモリ制限を上げる：

```bash
docker exec -it mahjong_backend bash
php -d memory_limit=-1 /usr/bin/composer install
```

### 問題3: データベース接続エラー

**エラーメッセージ:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**解決方法:**

1. データベースコンテナが起動しているか確認：
```bash
docker-compose ps
```

2. データベースコンテナのログを確認：
```bash
docker-compose logs db
```

3. バックエンドコンテナを再起動：
```bash
docker-compose restart backend
```

### 問題4: npm installが遅い

**解決方法:**

ローカルでnpm installを実行：

```bash
cd frontend
npm install
cd ..
docker-compose restart frontend
```

### 問題5: CORSエラー

フロントエンドからバックエンドAPIへのリクエストがCORSエラーになる場合：

**解決方法:**

backend/config/cors.php を確認：

```php
'allowed_origins' => ['http://localhost:3000'],
```

別のポートを使用している場合は、適切に変更してください。

### 問題6: 権限エラー

Laravelのストレージディレクトリで権限エラーが発生する場合：

```bash
docker exec -it mahjong_backend bash
chmod -R 777 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## データのリセット

開発中にデータベースをリセットしたい場合：

```bash
docker exec -it mahjong_backend php artisan migrate:fresh
```

注意: このコマンドはすべてのデータを削除します。

## コンテナの停止と削除

### コンテナの停止

```bash
docker-compose stop
```

### コンテナの削除

```bash
docker-compose down
```

### コンテナとボリュームの完全削除

```bash
docker-compose down -v
```

注意: このコマンドはデータベースのデータも削除されます。

## 開発時のヒント

### ログの確認

全コンテナのログを確認：
```bash
docker-compose logs -f
```

特定のコンテナのログを確認：
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### データベースに直接接続

```bash
docker exec -it mahjong_db mysql -u mahjong_user -pmahjong_pass mahjong_app
```

### Artisanコマンドの実行

```bash
docker exec -it mahjong_backend php artisan <command>
```

例：
```bash
docker exec -it mahjong_backend php artisan route:list
docker exec -it mahjong_backend php artisan migrate:status
```

## 本番環境へのデプロイ

本番環境にデプロイする際は、以下の点に注意してください：

1. `.env`ファイルで`APP_DEBUG=false`に設定
2. 強力なパスワードとアプリケーションキーを使用
3. HTTPSを有効化
4. データベースの定期的なバックアップ
5. セキュリティアップデートの適用

## サポート

問題が解決しない場合は、GitHubのIssueを作成してください。
