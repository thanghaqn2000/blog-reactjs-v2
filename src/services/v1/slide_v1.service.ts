import { v1Api } from "../axios";

export interface PublicSlide {
  id: number;
  heading: string;
  description: string;
  image_url: string;
}

class SlideV1Service {
  async getSlides(): Promise<PublicSlide[]> {
    const response = await v1Api.get("/slides");
    return response.data;
  }
}

export const slideV1Service = new SlideV1Service();

