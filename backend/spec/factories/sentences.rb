FactoryBot.define do
  factory :sentence do
    when_element { "MyText" }
    where_element { "MyText" }
    who_element { "MyText" }
    what_element { "MyText" }
    how_element { "MyText" }
    result_element { "MyText" }
  end
end
