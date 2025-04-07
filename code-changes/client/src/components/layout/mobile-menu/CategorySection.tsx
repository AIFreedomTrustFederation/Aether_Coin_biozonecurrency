import { FC } from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  onClose: () => void;
}

/**
 * Category section component for mobile menu
 * Displays a group of related navigation links
 */
const CategorySection: FC<CategorySectionProps> = ({ title, items, onClose }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-primary">{title}</h3>
      
      <div className="space-y-2 rounded-lg border overflow-hidden">
        {items.map((item, index) => (
          <Link 
            key={index} 
            href={item.href}
          >
            <a 
              className="flex items-center justify-between p-3 hover:bg-primary/5 transition-colors"
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <div className="text-primary">{item.icon}</div>
                )}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;