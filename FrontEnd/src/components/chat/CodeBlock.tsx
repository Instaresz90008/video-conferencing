import React, { useState } from 'react';
import { Copy, Check, Code, Download, Expand, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  onPaste?: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'text', 
  title,
  onPaste 
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'code'}.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `Code saved as ${a.download}`,
    });
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      dockerfile: 'dockerfile'
    };
    return extensions[lang] || 'txt';
  };

  const lineCount = code.split('\n').length;
  const isLargeCode = lineCount > 20;
  const displayHeight = isExpanded ? 'max-h-none' : (isLargeCode ? 'max-h-96' : 'max-h-none');

  return (
    <div className="relative bg-muted/20 rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-brand-blue" />
          <Badge variant="secondary" className="text-xs">
            {language}
          </Badge>
          {title && (
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {title}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {lineCount} lines
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {isLargeCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Expand className="w-3 h-3" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2"
            title="Download"
          >
            <Download className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Code Content */}
      <div className={`p-4 overflow-auto ${displayHeight} transition-all duration-300`}>
        <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
      
      {/* Expand/Collapse indicator */}
      {isLargeCode && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default CodeBlock;
