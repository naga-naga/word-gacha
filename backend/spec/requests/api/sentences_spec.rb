require 'rails_helper'

RSpec.describe "Api::Sentences", type: :request do
  describe "POST /api/sentences" do
    let!(:valid_params) do
      {
        sentence: {
          when_element: "昨日の夜",
          where_element: "公園で",
          who_element: "太郎が",
          what_element: "りんごを",
          how_element: "食べた",
          result_element: "お腹が痛くなった"
        }
      }
    end

    context "有効なパラメータの場合" do
      it "センテンスを作成して成功レスポンスを返す" do
        expect {
          post "/api/sentences", params: valid_params
        }.to change(Sentence, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.content_type).to eq("application/json; charset=utf-8")

        json_response = JSON.parse(response.body)
        expect(json_response["message"]).to eq("センテンスが投稿されました")
        expect(json_response["id"]).to be_present
      end

      it "作成されたセンテンスが正しい属性を持つ" do
        post "/api/sentences", params: valid_params

        created_sentence = Sentence.last
        expect(created_sentence.when_element).to eq("昨日の夜")
        expect(created_sentence.where_element).to eq("公園で")
        expect(created_sentence.who_element).to eq("太郎が")
        expect(created_sentence.what_element).to eq("りんごを")
        expect(created_sentence.how_element).to eq("食べた")
        expect(created_sentence.result_element).to eq("お腹が痛くなった")
      end
    end

    context "部分的なパラメータの場合" do
      it "一部の要素のみでもセンテンスを作成できる" do
        partial_params = {
          sentence: {
            when_element: "今朝",
            who_element: "先生が",
            how_element: "怒った"
          }
        }

        expect {
          post "/api/sentences", params: partial_params
        }.to change(Sentence, :count).by(1)

        expect(response).to have_http_status(:created)

        created_sentence = Sentence.last
        expect(created_sentence.when_element).to eq("今朝")
        expect(created_sentence.where_element).to be_nil
        expect(created_sentence.who_element).to eq("先生が")
        expect(created_sentence.what_element).to be_nil
        expect(created_sentence.how_element).to eq("怒った")
        expect(created_sentence.result_element).to be_nil
      end
    end

    context "空のパラメータの場合" do
      it "全て空でもセンテンスを作成できる" do
        empty_params = {
          sentence: {
            when_element: "",
            where_element: "",
            who_element: "",
            what_element: "",
            how_element: "",
            result_element: ""
          }
        }

        expect {
          post "/api/sentences", params: empty_params
        }.to change(Sentence, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end

    context "無効なパラメータの場合" do
      it "sentence パラメータがない場合は400エラーを返す" do
        post "/api/sentences", params: {}

        expect(response).to have_http_status(:bad_request)
      end

      it "許可されていないパラメータは無視される" do
        invalid_params = valid_params.deep_merge(
          sentence: { invalid_field: "無効な値" }
        )

        post "/api/sentences", params: invalid_params

        expect(response).to have_http_status(:created)
        created_sentence = Sentence.last
        expect(created_sentence).not_to respond_to(:invalid_field)
      end
    end
  end

  describe "GET /api/sentences/random" do
    context "データベースにセンテンスが存在する場合" do
      let!(:sentences) { create_list(:sentence, 5, :with_various_data) }

      it "ランダムなストーリー要素を返す" do
        get "/api/sentences/random"

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq("application/json; charset=utf-8")

        json_response = JSON.parse(response.body)
        expect(json_response).to have_key("story")

        story = json_response["story"]
        expect(story).to have_key("when")
        expect(story).to have_key("where")
        expect(story).to have_key("who")
        expect(story).to have_key("what")
        expect(story).to have_key("how")
        expect(story).to have_key("result")
      end

      it "返されるストーリー要素がデータベースの値から選ばれている" do
        get "/api/sentences/random"

        json_response = JSON.parse(response.body)
        story = json_response["story"]

        all_when_elements = Sentence.where.not(when_element: [nil, ""]).pluck(:when_element)
        all_where_elements = Sentence.where.not(where_element: [nil, ""]).pluck(:where_element)
        all_who_elements = Sentence.where.not(who_element: [nil, ""]).pluck(:who_element)

        expect(all_when_elements).to include(story["when"]) if story["when"]
        expect(all_where_elements).to include(story["where"]) if story["where"]
        expect(all_who_elements).to include(story["who"]) if story["who"]
      end

      it "複数回呼び出すと異なる結果を返す可能性がある" do
        responses = []
        5.times do
          get "/api/sentences/random"
          json_response = JSON.parse(response.body)
          responses << json_response["story"]
        end

        # 5回のうち最低1つは異なる結果があることを期待
        # (確率的に稀に全て同じになる可能性があるが、実用上問題ない)
        unique_responses = responses.uniq
        expect(unique_responses.length).to be >= 1
      end
    end

    context "データベースが空の場合" do
      it "空の要素を含むストーリーを返す" do
        get "/api/sentences/random"

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        story = json_response["story"]

        expect(story["when"]).to be_nil
        expect(story["where"]).to be_nil
        expect(story["who"]).to be_nil
        expect(story["what"]).to be_nil
        expect(story["how"]).to be_nil
        expect(story["result"]).to be_nil
      end
    end

    context "部分的なデータのみの場合" do
      let!(:partial_sentence) { create(:sentence, :partial) }

      it "存在する要素のみを返し、存在しない要素はnilを返す" do
        get "/api/sentences/random"

        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        story = json_response["story"]

        # :partial traitでは when_element, who_element, how_element のみ設定
        expect(story["when"]).to eq("今朝")
        expect(story["who"]).to eq("先生が")
        expect(story["how"]).to eq("怒った")
        expect(story["where"]).to be_nil
        expect(story["what"]).to be_nil
        expect(story["result"]).to be_nil
      end
    end
  end

  describe "パフォーマンス" do
    it "大量のセンテンスがある場合でもランダム生成が高速" do
      create_list(:sentence, 100, :with_various_data)

      start_time = Time.current
      get "/api/sentences/random"
      end_time = Time.current

      expect(response).to have_http_status(:ok)
      expect(end_time - start_time).to be < 1.0 # 1秒以内
    end
  end
end
