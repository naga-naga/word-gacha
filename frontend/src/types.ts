export interface SentenceElements {
  when_element?: string;
  where_element?: string;
  who_element?: string;
  what_element?: string;
  how_element?: string;
  result_element?: string;
}

export interface Story {
  when: string | null;
  where: string | null;
  who: string | null;
  what: string | null;
  how: string | null;
  result: string | null;
}

export interface RandomStoryResponse {
  story: Story;
}

export interface CreateSentenceResponse {
  message: string;
  id: number;
}