export interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number; // 1-5 stars
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialFormData {
  name: string;
  review: string;
  rating: number;
  active: boolean;
  display_order: number;
}

export interface CreateTestimonialInput {
  name: string;
  review: string;
  rating: number;
  active?: boolean;
  display_order?: number;
}

export interface UpdateTestimonialInput {
  name?: string;
  review?: string;
  rating?: number;
  active?: boolean;
  display_order?: number;
}
