// Types for the home.json CDN config

export interface CarouselItem {
  id: string;
  type: "notification" | "discount" | "feature";
  title?: string;       // optional — slide renders without heading if absent
  subtitle?: string;    // optional — slide renders without sub-text if absent
  desktop_image?: string;
  app_image?: string;
  cta_text?: string;    // optional — CTA button hidden if absent
  cta_url: string;
  priority: number;
  target: string[];
  level: number[];
  end: string;
}

export interface CarouselSection {
  type: "carousel";
  enabled: boolean;
  autoplay: boolean;
  items: CarouselItem[];
}

export interface PollOption {
  id: string;
  text: string;
}

export interface PollItem {
  id: string;
  question: string;
  options: PollOption[];
  target: string[];
  level: number[];
  end: string;
}

export interface PollSection {
  type: "poll";
  enabled: boolean;
  items: PollItem[];
  api: string;
}

export interface InputFields {
  application_number?: string;
  date_of_birth?: string;
  security_pin?: string;
  mother_name?: string;
  [key: string]: string | undefined;
}

export interface InputItem {
  id: string;
  text: string;
  fields: InputFields;
  target: string[];
  end: string;
}

export interface InputSection {
  type: "input";
  enabled: boolean;
  items: InputItem[];
  api: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  image: string;
  tag: string;
  target: string[];
  priority?: number;
  end?: string;       // optional — hide article on/after this date
}

export interface ImportantBlogsSection {
  type: "blog_list";
  enabled: boolean;
  title: string;
  items: BlogItem[];
}

export interface HomeConfigSections {
  carousel?: CarouselSection;
  poll?: PollSection;
  input?: InputSection;
  important_blogs?: ImportantBlogsSection;
}

export interface HomeConfig {
  "update-date": string;
  version: string;
  section: HomeConfigSections;
}
