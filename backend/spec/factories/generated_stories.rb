FactoryBot.define do
  factory :generated_story do
    story_text { "MyText" }
    share_token { "MyString" }
  end
end
