# ことばガチャ デプロイ手順書

## 概要
- **バックエンド**: EC2 + Kamal + Docker + ghcr.io
- **フロントエンド**: Vercel
- **データベース**: SQLite（EBSボリューム使用）

---

## 前提条件

### 必要なアカウント・ツール
- AWS アカウント
- GitHub アカウント
- Vercel アカウント
- Docker がローカルにインストール済み
- Kamal gem がインストール済み (`gem install kamal`)

### 必要な情報
- ドメイン名（お名前.com等で取得）
- GitHubユーザー名
- Docker Hub または GitHub Container Registry

---

## フェーズ1: 事前準備

### 1. GitHub Personal Access Token (PAT) の作成
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. 権限設定:
   - `read:packages`
   - `write:packages`
   - `delete:packages`
4. トークンをコピーして保存

### 2. ドメインの準備
- ドメインを取得済みの場合: DNS設定でAレコードをEC2のIPアドレスに向ける
- ドメイン未取得の場合: お名前.com等で取得

---

## フェーズ2: バックエンドデプロイ (EC2 + Kamal)

### 1. EC2インスタンスの作成
```bash
# AWS CLIでの作成例（コンソールでも可）
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxxxx \
  --subnet-id subnet-xxxxxxxx
```

**セキュリティグループ設定:**
- SSH (22): 自分のIPアドレスのみ
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0

### 2. EC2インスタンスへDockerインストール
```bash
# EC2にSSH接続
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Dockerインストール
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# 再ログインしてDockerの動作確認
exit
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
docker --version
```

### 3. Kamal設定の更新

#### A. `backend/config/deploy.yml` の更新
```yaml
# 以下の値を実際の値に変更:
- your-github-username → 実際のGitHubユーザー名
- YOUR_EC2_IP_ADDRESS → EC2インスタンスのIPアドレス
- YOUR_DOMAIN.com → 実際のドメイン名
```

#### B. `backend/.kamal/secrets` の設定
```bash
cd backend

# secretsファイルに以下を追加:
KAMAL_REGISTRY_PASSWORD=ghp_xxxxxxxxxxxxxxxxxxxx  # GitHub PAT
RAILS_MASTER_KEY=$(cat config/master.key)
```

#### C. CORS設定の更新
`backend/config/initializers/cors.rb` で:
```ruby
# YOUR_VERCEL_DOMAIN を実際のVercelドメインに変更
# 例: "https://word-gacha-frontend.vercel.app"
```

### 4. Kamalデプロイの実行
```bash
cd backend

# 初回セットアップ
kamal setup

# デプロイ
kamal deploy

# ログ確認
kamal logs
```

---

## フェーズ3: フロントエンドデプロイ (Vercel)

### 1. 環境変数の設定
`frontend/.env.production` で:
```env
VITE_API_BASE_URL=https://YOUR_DOMAIN.com/api
```

### 2. Vercelプロジェクトの作成
```bash
cd frontend

# Vercel CLIインストール (未インストールの場合)
npm i -g vercel

# Vercelにログイン
vercel login

# プロジェクトデプロイ
vercel --prod
```

**または Vercel Web UI使用:**
1. https://vercel.com にアクセス
2. GitHubリポジトリを連携
3. `frontend` ディレクトリを指定
4. 環境変数設定:
   - `VITE_API_BASE_URL`: `https://YOUR_DOMAIN.com/api`

### 3. カスタムドメインの設定（オプション）
Vercel管理画面で独自ドメインを設定可能

---

## フェーズ4: 最終確認と調整

### 1. CORS設定の再確認
バックエンドの CORS 設定でVercelドメインが許可されているか確認:

```ruby
# backend/config/initializers/cors.rb
default_origins = if Rails.env.production?
  ["https://your-actual-vercel-domain.vercel.app"]
else
  ["localhost:5173", "127.0.0.1:5173"]
end
```

必要に応じて環境変数で動的設定:
```bash
# Kamal deploy.yml の env セクション
env:
  clear:
    ALLOWED_ORIGINS: "https://your-vercel-domain.vercel.app"
```

### 2. 動作確認
1. フロントエンドアプリケーションにアクセス
2. センテンス投稿機能のテスト
3. ランダム文章生成機能のテスト
4. 生成文章の保存・共有機能のテスト

### 3. SSL証明書の確認
Kamalは自動でLet's Encryptを設定するため、HTTPSでアクセス可能か確認

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. KamalデプロイでDocker権限エラー
```bash
# EC2で実行
sudo usermod -a -G docker ec2-user
# 再ログイン必要
```

#### 2. CORS エラー
- `backend/config/initializers/cors.rb` でVercelドメインが許可されているか確認
- ブラウザの開発者ツールでエラー詳細を確認

#### 3. 環境変数が反映されない
```bash
# Kamalで環境変数を再デプロイ
kamal env push
kamal deploy
```

#### 4. SQLiteデータが消える
```bash
# Kamal deploy.yml のvolumes設定を確認
volumes:
  - "backend_storage:/rails/storage"
```

---

## メンテナンス・更新手順

### バックエンドの更新
```bash
cd backend
git pull origin main
kamal deploy
```

### フロントエンドの更新
```bash
cd frontend
git push origin main
# Vercelが自動デプロイ
```

### ログ確認
```bash
# バックエンドログ
kamal logs

# フロントエンドログ
# Vercel管理画面で確認
```

---

## セキュリティ考慮事項

1. **EC2セキュリティグループ**: SSH は自分のIPのみ許可
2. **GitHub PAT**: 必要最小限の権限のみ付与
3. **Rails master key**: 絶対に公開リポジトリにコミットしない
4. **定期的な更新**: 依存関係の脆弱性対応

---

## 参考情報

- [Kamal公式ドキュメント](https://kamal-deploy.org/)
- [Vercel公式ドキュメント](https://vercel.com/docs)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)