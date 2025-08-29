
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, Upload, FileText } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface CodePasteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string, language: string, title?: string) => void;
  maxLines?: number;
}

const POPULAR_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust',
  'html', 'css', 'scss', 'json', 'xml', 'yaml', 'markdown', 'sql', 'shell', 'dockerfile'
];

const CodePasteDialog: React.FC<CodePasteDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  maxLines = 10800 
}) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [title, setTitle] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [useCustomLanguage, setUseCustomLanguage] = useState(false);

  const handleClose = useCallback(() => {
    setCode('');
    setLanguage('javascript');
    setTitle('');
    setCustomLanguage('');
    setUseCustomLanguage(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    const lineCount = code.split('\n').length;
    const finalLanguage = useCustomLanguage ? customLanguage : language;
    
    if (lineCount > maxLines) {
      toast({
        title: "Code too long",
        description: `Maximum ${maxLines} lines allowed. Current: ${lineCount} lines`,
        variant: "destructive",
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Empty code",
        description: "Please enter some code to share",
        variant: "destructive",
      });
      return;
    }

    if (useCustomLanguage && !customLanguage.trim()) {
      toast({
        title: "Language required",
        description: "Please specify a language for your code",
        variant: "destructive",
      });
      return;
    }

    onSubmit(code, finalLanguage, title || undefined);
    handleClose();
    
    toast({
      title: "Code shared",
      description: `${finalLanguage} code snippet shared successfully`,
    });
  }, [code, language, customLanguage, useCustomLanguage, title, maxLines, onSubmit, handleClose]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCode(content);
        setTitle(file.name);
        
        // Auto-detect language from file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
          'js': 'javascript',
          'ts': 'typescript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'cpp',
          'cs': 'csharp',
          'php': 'php',
          'rb': 'ruby',
          'go': 'go',
          'rs': 'rust',
          'html': 'html',
          'css': 'css',
          'scss': 'scss',
          'json': 'json',
          'xml': 'xml',
          'yml': 'yaml',
          'yaml': 'yaml',
          'md': 'markdown',
          'sql': 'sql',
          'sh': 'shell',
          'dockerfile': 'dockerfile'
        };
        
        if (extension && languageMap[extension]) {
          setLanguage(languageMap[extension]);
          setUseCustomLanguage(false);
        }
      }
    };
    reader.readAsText(file);
  }, []);

  const currentLines = code.split('\n').length;
  const finalLanguage = useCustomLanguage ? customLanguage : language;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-blue" />
            Share Code Snippet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 min-h-0">
          {/* Title and Upload */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Title (optional)</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your code snippet a title"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css,.scss,.json,.xml,.yml,.yaml,.md,.sql,.sh,.dockerfile,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Language Selection */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Language</label>
              {!useCustomLanguage ? (
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  placeholder="Enter custom language"
                  className="mt-1"
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setUseCustomLanguage(!useCustomLanguage)}
              className="mb-0"
            >
              {useCustomLanguage ? 'Use Preset' : 'Custom'}
            </Button>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              <Badge variant={currentLines > maxLines ? 'destructive' : 'secondary'}>
                {currentLines} / {maxLines} lines
              </Badge>
            </div>
          </div>
          
          {/* Code Input */}
          <div className="flex-1 min-h-0 flex flex-col">
            <label className="text-sm font-medium text-foreground mb-2">Code</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Paste your ${finalLanguage} code here...`}
              className="flex-1 min-h-[300px] font-mono text-sm resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            {title && (
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" />
                {title}
              </Badge>
            )}
            <Badge variant="outline">
              {finalLanguage}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!code.trim() || currentLines > maxLines}
              className="gap-2"
            >
              <Code className="w-4 h-4" />
              Share Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodePasteDialog;
