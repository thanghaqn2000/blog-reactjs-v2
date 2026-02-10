import { adminApi } from "../axios";

export interface AdminSlide {
  id: number;
  heading: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSlidePayload {
  slide: {
    heading: string;
    description: string;
    image_key: string;
  };
}

export interface UpdateSlidePayload {
  slide: {
    heading?: string;
    description?: string;
    image_key?: string;
  };
}

class SlideService {
  async getSlides(): Promise<AdminSlide[]> {
    const response = await adminApi.get("/slides", {
      withCredentials: true,
    });
    return response.data;
  }

  async createSlide(payload: CreateSlidePayload): Promise<AdminSlide> {
    const response = await adminApi.post("/slides", payload, {
      withCredentials: true,
    });
    // BE trả về { message, slide }
    return response.data.slide;
  }

  async updateSlide(id: number, payload: UpdateSlidePayload): Promise<AdminSlide> {
    const response = await adminApi.patch(`/slides/${id}`, payload, {
      withCredentials: true,
    });
    return response.data;
  }

  async deleteSlide(id: number): Promise<void> {
    await adminApi.delete(`/slides/${id}`, { withCredentials: true });
  }

  async reorderSlides(slideIds: number[]): Promise<void> {
    await adminApi.patch(
      "/slides/reorder",
      { slide_ids: slideIds },
      { withCredentials: true }
    );
  }
}

export const slideService = new SlideService();

