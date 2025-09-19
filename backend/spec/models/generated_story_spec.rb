require 'rails_helper'

RSpec.describe GeneratedStory, type: :model do
  describe 'ファクトリー' do
    it '有効なGeneratedStoryを作成できる' do
      story = create(:generated_story)
      expect(story).to be_persisted
      expect(story.story_text).to eq('昨日の夜 公園で 太郎が りんごを 食べた。そしてお腹が痛くなった。')
      expect(story.share_token).to be_present
      expect(story.share_token.length).to eq(14) # SecureRandom.urlsafe_base64(10)のデフォルト長
    end

    it '異なる文章のGeneratedStoryを作成できる' do
      story = create(:generated_story, :with_different_story)
      expect(story).to be_persisted
      expect(story.story_text).to eq('今朝 学校で 先生が 宿題を 忘れた。そして生徒に怒られた。')
      expect(story.share_token).to be_present
    end

    it '長い文章のGeneratedStoryを作成できる' do
      story = create(:generated_story, :with_long_story)
      expect(story).to be_persisted
      expect(story.story_text).to include('夏休みに')
      expect(story.story_text).to include('新聞にも載ることになった')
      expect(story.share_token).to be_present
    end
  end

  describe 'バリデーション' do
    it 'story_textが存在する場合は有効' do
      valid_story = build(:generated_story)
      expect(valid_story).to be_valid
    end

    it 'story_textがない場合は無効' do
      invalid_story = build(:generated_story, story_text: nil)
      expect(invalid_story).not_to be_valid
      expect(invalid_story.errors[:story_text]).to include("can't be blank")
    end

    it 'story_textが空文字列の場合は無効' do
      invalid_story = build(:generated_story, story_text: '')
      expect(invalid_story).not_to be_valid
      expect(invalid_story.errors[:story_text]).to include("can't be blank")
    end
  end

  describe '共有トークン生成' do
    it '作成時に自動的にshare_tokenが生成される' do
      story = build(:generated_story, share_token: nil)
      expect(story.share_token).to be_nil

      story.save!
      expect(story.share_token).to be_present
      expect(story.share_token).to be_a(String)
      expect(story.share_token.length).to eq(14)
    end

    it '複数のレコードでユニークなshare_tokenが生成される' do
      stories = create_list(:generated_story, 5)
      tokens = stories.map(&:share_token)

      expect(tokens.uniq.length).to eq(5) # 全て異なるトークン
      tokens.each do |token|
        expect(token).to be_present
        expect(token.length).to eq(14)
      end
    end

    it 'share_tokenの一意性が保証される' do
      existing_story = create(:generated_story)

      # コールバックをスキップして直接作成
      duplicate_story = GeneratedStory.new(story_text: "テスト文章")
      duplicate_story.share_token = existing_story.share_token

      expect(duplicate_story).not_to be_valid
      expect(duplicate_story.errors[:share_token]).to include("has already been taken")
    end
  end

  describe 'as_json_with_urlメソッド' do
    let!(:story) { create(:generated_story) }

    it 'as_jsonにshare_urlフィールドが追加される' do
      json = story.as_json_with_url

      expect(json).to include('id', 'story_text', 'share_token', 'created_at', 'updated_at')
      expect(json).to include(:share_url)
      frontend_base_url = ENV['FRONTEND_BASE_URL'] || 'http://localhost:5173'
      expect(json[:share_url]).to eq("#{frontend_base_url}/shared/#{story.share_token}")
    end

    it 'share_urlが正しい形式で生成される' do
      json = story.as_json_with_url
      frontend_base_url = ENV['FRONTEND_BASE_URL'] || 'http://localhost:5173'
      expected_url = "#{frontend_base_url}/shared/#{story.share_token}"

      expect(json[:share_url]).to eq(expected_url)
      expect(json[:share_url]).to match(%r{^#{Regexp.escape(frontend_base_url)}/shared/[a-zA-Z0-9_-]{14}$})
    end

    it '元のas_jsonの内容を保持する' do
      original_json = story.as_json
      extended_json = story.as_json_with_url

      original_json.each do |key, value|
        expect(extended_json[key]).to eq(value)
      end
    end
  end

  describe 'データベース操作' do
    it '複数のstoryを効率的に作成・取得できる' do
      expect {
        create_list(:generated_story, 10)
      }.to change(GeneratedStory, :count).by(10)

      stories = GeneratedStory.all
      expect(stories.count).to eq(10)
      expect(stories.map(&:share_token).uniq.length).to eq(10)
    end

    it 'share_tokenで検索できる' do
      story = create(:generated_story)

      found_story = GeneratedStory.find_by(share_token: story.share_token)
      expect(found_story).to eq(story)
      expect(found_story.story_text).to eq(story.story_text)
    end

    it '存在しないshare_tokenで検索するとnilが返る' do
      non_existent_token = 'nonexistent123'

      found_story = GeneratedStory.find_by(share_token: non_existent_token)
      expect(found_story).to be_nil
    end
  end
end
