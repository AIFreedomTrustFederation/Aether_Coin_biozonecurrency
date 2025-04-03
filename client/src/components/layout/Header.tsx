import React from 'react';

interface HeaderProps {
  heading: string;
  subheading?: string;
  actions?: React.ReactNode;
}

// Main Header component (default export)
const Header = ({ heading, subheading, actions }: HeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {subheading && (
          <p className="text-muted-foreground mt-1">{subheading}</p>
        )}
      </div>
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
};

// For use in our Settings page
export function PageHeader({ heading, subheading, actions }: HeaderProps) {
  return <Header heading={heading} subheading={subheading} actions={actions} />;
}

export default Header;