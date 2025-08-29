
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid, 
  Code, 
  Palette
} from 'lucide-react';
import { CollaborativeBoard as CollaborativeBoardType } from '@/types/chat';
import EnhancedCodeEditor from './EnhancedCodeEditor';
import EnhancedWhiteboard from './EnhancedWhiteboard';
import EnhancedSpreadsheet from './EnhancedSpreadsheet';

interface CollaborativeBoardProps {
  boardId?: string;
  type: 'code' | 'whiteboard' | 'spreadsheet';
  onSave?: (board: CollaborativeBoardType) => void;
}

const CollaborativeBoard: React.FC<CollaborativeBoardProps> = ({
  boardId,
  type,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'whiteboard' | 'spreadsheet'>(type);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'code' | 'whiteboard' | 'spreadsheet');
  };

  const handleCodeSave = (codeSnippet: any) => {
    const board: CollaborativeBoardType = {
      id: boardId || Date.now().toString(),
      name: codeSnippet.title || 'Collaborative Code',
      type: 'code',
      content: codeSnippet,
      cursors: {},
      lastModified: new Date().toISOString(),
      collaborators: ['You']
    };
    onSave?.(board);
  };

  const handleWhiteboardSave = (elements: any) => {
    const board: CollaborativeBoardType = {
      id: boardId || Date.now().toString(),
      name: 'Collaborative Whiteboard',
      type: 'whiteboard', 
      content: { elements },
      cursors: {},
      lastModified: new Date().toISOString(),
      collaborators: ['You']
    };
    onSave?.(board);
  };

  const handleSpreadsheetSave = (spreadsheetData: any) => {
    const board: CollaborativeBoardType = {
      id: boardId || Date.now().toString(),
      name: 'Collaborative Spreadsheet',
      type: 'spreadsheet',
      content: spreadsheetData,
      cursors: {},
      lastModified: new Date().toISOString(),
      collaborators: ['You']
    };
    onSave?.(board);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <div className="border-b px-4 py-2">
          <TabsList>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="whiteboard" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Whiteboard
            </TabsTrigger>
            <TabsTrigger value="spreadsheet" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Spreadsheet
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="code" className="flex-1 p-0 m-0">
          <EnhancedCodeEditor
            initialCode="// Welcome to the enhanced code editor\nfunction hello() {\n  console.log('Hello, World!');\n}"
            initialLanguage="javascript"
            onCodeSave={handleCodeSave}
            collaborative={true}
          />
        </TabsContent>

        <TabsContent value="whiteboard" className="flex-1 p-0 m-0">
          <EnhancedWhiteboard
            boardId={boardId}
            onSave={handleWhiteboardSave}
            collaborative={true}
          />
        </TabsContent>

        <TabsContent value="spreadsheet" className="flex-1 p-0 m-0">
          <EnhancedSpreadsheet
            boardId={boardId}
            onSave={handleSpreadsheetSave}
            collaborative={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollaborativeBoard;
