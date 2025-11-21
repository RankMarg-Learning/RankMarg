import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "./types";

interface CurriculumBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const CurriculumBreadcrumb = ({ items }: CurriculumBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          {index === items.length - 1 ? (
            <span className="flex items-center gap-2 font-medium text-foreground">
              <item.icon className="w-4 h-4" />
              {item.label}
            </span>
          ) : (
            <a 
              href={item.href}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
};

