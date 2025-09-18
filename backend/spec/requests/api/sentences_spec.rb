require 'rails_helper'

RSpec.describe "Api::Sentences", type: :request do
  describe "GET /create" do
    it "returns http success" do
      get "/api/sentences/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /random" do
    it "returns http success" do
      get "/api/sentences/random"
      expect(response).to have_http_status(:success)
    end
  end

end
