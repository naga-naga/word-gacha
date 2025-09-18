FactoryBot.define do
  factory :generated_story do
    story_text { "昨日の夜 公園で 太郎が りんごを 食べた。そしてお腹が痛くなった。" }
    # share_token は before_validation コールバックで自動生成される

    trait :with_different_story do
      story_text { "今朝 学校で 先生が 宿題を 忘れた。そして生徒に怒られた。" }
    end

    trait :with_long_story do
      story_text { "夏休みに 海で 猫が 魚を 釣った。そしてみんなが驚いて、その話は町中の話題となり、ついには新聞にも載ることになった。" }
    end
  end
end
