export interface CarouselItem {
  id: string;
  type: "notification" | "discount" | "feature";
  title?: string;
  subtitle?: string;
  desktop_image?: string;
  app_image?: string;
  cta_text?: string;
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

export interface InputFieldDef {
  label: string;
  type: "text" | "calendar" | "email" | "number";
  placeholder?: string;
  required?: boolean;
  value?: string;
}

export interface InputItem {
  id: string;
  text: string;
  fields: Record<string, InputFieldDef>;
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
  end?: string;
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
