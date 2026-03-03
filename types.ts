
export interface SlidePoint {
  id: string;
  icon: string;
  title: string;
}

export interface SlideData {
  id: string;
  header: string;
  highlightedHeader: string;
  subHeader: string;
  points: SlidePoint[];
  footerImage: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  footerLogoText?: string;
  customCss?: string;
  // ألوان الثيم
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface CarouselState {
  slides: SlideData[];
  currentSlideIndex: number;
}
