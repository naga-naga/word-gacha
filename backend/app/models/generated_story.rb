class GeneratedStory < ApplicationRecord
  validates :story_text, presence: true
  validates :share_token, presence: true, uniqueness: true

  before_validation :generate_share_token, on: :create

  def as_json_with_url
    frontend_base_url = ENV['FRONTEND_BASE_URL'] || 'http://localhost:5173'
    as_json.merge(
      share_url: "#{frontend_base_url}/shared/#{share_token}"
    )
  end

  private

  def generate_share_token
    return if share_token.present?

    loop do
      self.share_token = SecureRandom.urlsafe_base64(10)
      break unless GeneratedStory.exists?(share_token:)
    end
  end
end
