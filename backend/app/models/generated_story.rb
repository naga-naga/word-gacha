class GeneratedStory < ApplicationRecord
  validates :story_text, presence: true
  validates :share_token, presence: true, uniqueness: true

  before_validation :generate_share_token, on: :create

  def as_json_with_url
    as_json.merge(
      share_url: "http://localhost:5173/shared/#{share_token}"
    )
  end

  private

  def generate_share_token
    loop do
      self.share_token = SecureRandom.urlsafe_base64(10)
      break unless GeneratedStory.exists?(share_token:)
    end
  end
end
