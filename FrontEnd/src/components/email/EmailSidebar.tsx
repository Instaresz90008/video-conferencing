
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, Send, Archive, Trash2, Flag, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailSidebarProps {
  selectedFolder: string;
  onFolderChange: (folder: string) => void;
}

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  selectedFolder,
  onFolderChange
}) => {
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 4 },
    { id: 'sent', name: 'Sent', icon: Send, count: 12 },
    { id: 'drafts', name: 'Drafts', icon: Mail, count: 2 },
    { id: 'archive', name: 'Archive', icon: Archive, count: 28 },
    { id: 'spam', name: 'Spam', icon: Flag, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 3 }
  ];

  return (
    <Card className="h-full dark:bg-gray-800/50 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Folders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 p-3">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <div
                key={folder.id}
                onClick={() => onFolderChange(folder.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                  selectedFolder === folder.id && "bg-blue-100 dark:bg-blue-900/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
