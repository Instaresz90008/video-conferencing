
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsSearchBoxProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const SettingsSearchBox: React.FC<SettingsSearchBoxProps> = ({
  searchTerm,
  onSearchChange,
  onClear,
  placeholder = "Search settings...",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default SettingsSearchBox;
