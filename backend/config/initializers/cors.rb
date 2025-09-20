# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 環境変数から許可オリジンを取得
    # 開発環境: localhost、本番環境: Vercelドメイン
    default_origins = if Rails.env.production?
      ["https://word-gacha.vercel.app"]
    else
      ["localhost:5173", "127.0.0.1:5173"]
    end

    allowed_origins = ENV['ALLOWED_ORIGINS']&.split(',') || default_origins
    origins allowed_origins

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
