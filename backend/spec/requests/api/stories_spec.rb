require 'rails_helper'

RSpec.describe "Api::Stories", type: :request do
  describe "GET /api/stories" do
    context "ストーリーが存在する場合" do
      let!(:stories) { create_list(:generated_story, 3) }

      it "全てのストーリーを作成日時の降順で返す" do
        get "/api/stories"

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq("application/json; charset=utf-8")

        json_response = JSON.parse(response.body)
        expect(json_response).to have_key("stories")
        expect(json_response["stories"].length).to eq(3)

        # 作成日時の降順確認
        returned_stories = json_response["stories"]
        expect(returned_stories.first["id"]).to eq(stories.last.id)
        expect(returned_stories.last["id"]).to eq(stories.first.id)
      end

      it "各ストーリーにshare_urlが含まれている" do
        get "/api/stories"

        json_response = JSON.parse(response.body)
        stories = json_response["stories"]

        frontend_base_url = ENV['FRONTEND_BASE_URL'] || 'http://localhost:5173'
        stories.each do |story|
          expect(story).to have_key("share_url")
          expect(story["share_url"]).to match(%r{^#{Regexp.escape(frontend_base_url)}/shared/[a-zA-Z0-9_-]{14}$})
        end
      end
    end

    context "ストーリーが存在しない場合" do
      it "空の配列を返す" do
        get "/api/stories"

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response["stories"]).to eq([])
      end
    end
  end

  describe "POST /api/stories" do
    let!(:valid_params) do
      {
        story: {
          story_text: "昨日の夜 公園で 太郎が りんごを 食べた。そしてお腹が痛くなった。"
        }
      }
    end

    context "有効なパラメータの場合" do
      it "ストーリーを作成して成功レスポンスを返す" do
        expect {
          post "/api/stories", params: valid_params
        }.to change(GeneratedStory, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.content_type).to eq("application/json; charset=utf-8")

        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to eq("文章が保存されました")
        expect(json_response["story"]).to be_present
        expect(json_response["story"]["share_url"]).to be_present
      end

      it "作成されたストーリーが正しい属性を持つ" do
        post "/api/stories", params: valid_params

        created_story = GeneratedStory.last
        expect(created_story.story_text).to eq("昨日の夜 公園で 太郎が りんごを 食べた。そしてお腹が痛くなった。")
        expect(created_story.share_token).to be_present
        expect(created_story.share_token.length).to eq(14)
      end
    end

    context "無効なパラメータの場合" do
      it "story_textが空の場合は422エラーを返す" do
        invalid_params = {
          story: {
            story_text: ""
          }
        }

        post "/api/stories", params: invalid_params

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response).to have_key("errors")
        expect(json_response["errors"]["story_text"]).to include("can't be blank")
      end

      it "story_textがnilの場合は422エラーを返す" do
        invalid_params = {
          story: {
            story_text: nil
          }
        }

        post "/api/stories", params: invalid_params

        expect(response).to have_http_status(:unprocessable_content)

        json_response = JSON.parse(response.body)
        expect(json_response["errors"]["story_text"]).to include("can't be blank")
      end

      it "story パラメータがない場合は400エラーを返す" do
        post "/api/stories", params: {}

        expect(response).to have_http_status(:bad_request)
      end
    end
  end

  describe "GET /api/stories/:share_token" do
    let!(:story) { create(:generated_story) }

    context "有効なshare_tokenの場合" do
      it "指定されたストーリーを返す" do
        get "/api/stories/#{story.share_token}"

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq("application/json; charset=utf-8")

        json_response = JSON.parse(response.body)
        expect(json_response["story"]["id"]).to eq(story.id)
        expect(json_response["story"]["story_text"]).to eq(story.story_text)
        expect(json_response["story"]["share_url"]).to be_present
      end

      it "share_urlが正しい形式で含まれている" do
        get "/api/stories/#{story.share_token}"

        json_response = JSON.parse(response.body)
        frontend_base_url = ENV['FRONTEND_BASE_URL'] || 'http://localhost:5173'
        expected_url = "#{frontend_base_url}/shared/#{story.share_token}"
        expect(json_response["story"]["share_url"]).to eq(expected_url)
      end
    end

    context "無効なshare_tokenの場合" do
      it "404エラーを返す" do
        get "/api/stories/nonexistent_token"

        expect(response).to have_http_status(:not_found)

        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("文章が見つかりません")
      end
    end
  end

  describe "DELETE /api/stories/:share_token" do
    let!(:story) { create(:generated_story) }

    context "有効なshare_tokenの場合" do
      it "指定されたストーリーを削除する" do
        expect {
          delete "/api/stories/#{story.share_token}"
        }.to change(GeneratedStory, :count).by(-1)

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to eq("保存した文章が削除されました")
      end

      it "削除されたストーリーが存在しないことを確認" do
        delete "/api/stories/#{story.share_token}"

        expect(GeneratedStory.find_by(share_token: story.share_token)).to be_nil
      end
    end

    context "無効なshare_tokenの場合" do
      it "404エラーを返す" do
        delete "/api/stories/nonexistent_token"

        expect(response).to have_http_status(:not_found)

        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("文章が見つかりません")
      end

      it "他のストーリーに影響しない" do
        expect {
          delete "/api/stories/nonexistent_token"
        }.not_to change(GeneratedStory, :count)
      end
    end
  end

  describe "複数ストーリーの動作確認" do
    let!(:stories) { create_list(:generated_story, 5) }

    it "複数のストーリーを作成、取得、削除できる" do
      # 全件取得
      get "/api/stories"
      expect(JSON.parse(response.body)["stories"].length).to eq(5)

      # 個別取得
      first_story = stories.first
      get "/api/stories/#{first_story.share_token}"
      expect(response).to have_http_status(:ok)

      # 削除
      delete "/api/stories/#{first_story.share_token}"
      expect(response).to have_http_status(:ok)

      # 削除後の確認
      get "/api/stories"
      expect(JSON.parse(response.body)["stories"].length).to eq(4)
    end
  end

  describe "パフォーマンス" do
    it "大量のストーリーがある場合でも一覧取得が高速" do
      create_list(:generated_story, 100)

      start_time = Time.current
      get "/api/stories"
      end_time = Time.current

      expect(response).to have_http_status(:ok)
      expect(end_time - start_time).to be < 1.0 # 1秒以内
    end
  end
end
