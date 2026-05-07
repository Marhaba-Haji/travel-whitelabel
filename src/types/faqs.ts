export interface HomeFaq {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HomeFaqFormData {
  question: string;
  answer: string;
  active: boolean;
  display_order: number;
}

export interface CreateHomeFaqInput {
  question: string;
  answer: string;
  active?: boolean;
  display_order?: number;
}

export interface UpdateHomeFaqInput {
  question?: string;
  answer?: string;
  active?: boolean;
  display_order?: number;
}
