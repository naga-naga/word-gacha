FactoryBot.define do
  factory :sentence do
    when_element { "昨日の夜" }
    where_element { "公園で" }
    who_element { "太郎が" }
    what_element { "りんごを" }
    how_element { "食べた" }
    result_element { "お腹が痛くなった" }

    trait :partial do
      when_element { "今朝" }
      where_element { nil }
      who_element { "先生が" }
      what_element { nil }
      how_element { "怒った" }
      result_element { nil }
    end

    trait :empty do
      when_element { nil }
      where_element { nil }
      who_element { nil }
      what_element { nil }
      how_element { nil }
      result_element { nil }
    end

    trait :with_various_data do
      sequence(:when_element) { |n| ["昨日の夜", "今朝", "夏休みに", "先週"][n % 4] }
      sequence(:where_element) { |n| ["公園で", "学校で", "海で", "家で"][n % 4] }
      sequence(:who_element) { |n| ["太郎が", "先生が", "猫が", "友達が"][n % 4] }
      sequence(:what_element) { |n| ["りんごを", "宿題を", "魚を", "本を"][n % 4] }
      sequence(:how_element) { |n| ["食べた", "忘れた", "釣った", "読んだ"][n % 4] }
      sequence(:result_element) { |n| ["お腹が痛くなった", "怒られた", "みんなが驚いた", "勉強になった"][n % 4] }
    end
  end
end
