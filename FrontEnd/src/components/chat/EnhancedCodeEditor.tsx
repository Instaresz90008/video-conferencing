
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Code, 
  Play, 
  Save, 
  Share, 
  Download, 
  History, 
  Users, 
  Copy,
  Check,
  GitBranch,
  Eye,
  Settings,
  Search,
  Replace,
  FileText,
  Zap,
  Palette,
  Moon,
  Sun,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Bug,
  Terminal,
  Braces
} from 'lucide-react';
import { chatAPI } from '@/services/chatApi';
import { CodeSnippet } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

interface EnhancedCodeEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  onCodeSave?: (codeSnippet: CodeSnippet) => void;
  collaborative?: boolean;
}

const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'csharp', label: 'C#', icon: '🔵' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
];

const CODE_THEMES = [
  { id: 'default', name: 'Default', bg: 'bg-background', text: 'text-foreground' },
  { id: 'dark', name: 'Dark', bg: 'bg-gray-900', text: 'text-gray-100' },
  { id: 'monokai', name: 'Monokai', bg: 'bg-gray-800', text: 'text-green-400' },
  { id: 'solarized', name: 'Solarized', bg: 'bg-blue-900', text: 'text-yellow-300' },
];

const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  initialCode = '',
  initialLanguage = 'javascript',
  onCodeSave,
  collaborative = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [title, setTitle] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const [versions, setVersions] = useState<CodeSnippet[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>(['You']);
  const [cursors, setCursors] = useState<Record<string, { line: number; column: number; user: string; color: string }>>({});
  
  // Advanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [theme, setTheme] = useState('default');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [linting, setLinting] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [bracketMatching, setBracketMatching] = useState(true);
  
  // History management
  const [history, setHistory] = useState([code]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && code.trim()) {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        // Auto-save logic here
        console.log('Auto-saving code...');
      }, 2000);
    }
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [code, autoSave]);

  // History management
  const addToHistory = useCallback((newCode: string) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newCode];
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCode(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Code analysis and linting
  const analyzeCode = useCallback(() => {
    if (!linting) return;
    
    // Basic syntax checking
    const lines = code.split('\n');
    const newErrors: string[] = [];
    
    lines.forEach((line, index) => {
      // Check for common syntax errors
      if (language === 'javascript' || language === 'typescript') {
        if (line.includes('console.log') && !line.includes(';')) {
          newErrors.push(`Line ${index + 1}: Missing semicolon`);
        }
        if (line.includes('function') && !line.includes('{')) {
          newErrors.push(`Line ${index + 1}: Missing opening brace`);
        }
      }
    });
    
    setErrors(newErrors.join('\n'));
  }, [code, language, linting]);

  useEffect(() => {
    analyzeCode();
  }, [analyzeCode]);

  // Mock collaborative cursors
  useEffect(() => {
    if (collaborative) {
      const interval = setInterval(() => {
        setCursors({
          'user1': { 
            line: Math.floor(Math.random() * 20), 
            column: Math.floor(Math.random() * 80), 
            user: 'Alice', 
            color: '#3b82f6' 
          },
          'user2': { 
            line: Math.floor(Math.random() * 20), 
            column: Math.floor(Math.random() * 80), 
            user: 'Bob', 
            color: '#10b981' 
          }
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [collaborative]);

  // Advanced code execution with error handling
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setErrors('');
    
    try {
      // Simulate compilation/interpretation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock different outputs based on language
      const mockOutputs: Record<string, string> = {
        javascript: `> Executing JavaScript...\n> ${code.includes('console.log') ? 'Hello, World!' : 'Code executed successfully'}\n> Process finished with exit code 0`,
        typescript: `> TypeScript Compiler v5.0\n> Compiling...\n> Hello, World!\n> Compilation successful`,
        python: `Python 3.11.0\n>>> ${code.includes('print') ? 'Hello, World!' : 'Code executed successfully'}\n>>> Process finished`,
        java: `> javac Main.java\n> java Main\nHello, World!\n> Build successful`,
        cpp: `> g++ -o main main.cpp\n> ./main\nHello, World!\n> Execution completed`,
      };
      
      setOutput(mockOutputs[language] || 'Code executed successfully');
      
      // Simulate potential errors
      if (code.includes('error') || code.includes('throw')) {
        setErrors('Runtime Error: Something went wrong in your code');
      }
      
    } catch (error) {
      setErrors('Execution failed: ' + error);
    } finally {
      setIsRunning(false);
    }
    
    toast({
      title: "Code executed",
      description: "Your code has been run successfully",
    });
  };

  // Advanced search and replace
  const performSearch = useCallback(() => {
    if (!searchTerm) return;
    
    const regex = new RegExp(searchTerm, 'gi');
    const matches = code.match(regex);
    
    toast({
      title: "Search complete",
      description: `Found ${matches ? matches.length : 0} matches`,
    });
  }, [code, searchTerm]);

  const performReplace = useCallback(() => {
    if (!searchTerm || !replaceTerm) return;
    
    const newCode = code.replace(new RegExp(searchTerm, 'g'), replaceTerm);
    setCode(newCode);
    addToHistory(newCode);
    
    toast({
      title: "Replace complete",
      description: "Text has been replaced",
    });
  }, [code, searchTerm, replaceTerm, addToHistory]);

  // Code formatting
  const formatCode = useCallback(() => {
    // Basic code formatting
    let formatted = code;
    
    if (language === 'javascript' || language === 'typescript') {
      // Basic JS/TS formatting
      formatted = formatted
        .replace(/;\s*}/g, ';\n}')
        .replace(/{\s*/g, ' {\n  ')
        .replace(/}\s*/g, '\n}');
    }
    
    setCode(formatted);
    addToHistory(formatted);
    
    toast({
      title: "Code formatted",
      description: "Your code has been auto-formatted",
    });
  }, [code, language, addToHistory]);

  const saveCode = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your code snippet",
        variant: "destructive",
      });
      return;
    }

    try {
      const codeSnippet = await chatAPI.saveCodeSnippet({
        title,
        language,
        code,
        author: 'You',
        collaborators
      });
      
      setVersions([codeSnippet, ...versions]);
      onCodeSave?.(codeSnippet);
      
      toast({
        title: "Code saved",
        description: "Your code snippet has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving code:', error);
      toast({
        title: "Save failed",
        description: "Could not save code snippet",
        variant: "destructive",
      });
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Add to history on significant changes
    if (Math.abs(newCode.length - code.length) > 10) {
      addToHistory(newCode);
    }
    
    if (collaborative) {
      // Mock collaborative update
      console.log('Broadcasting code update to collaborators');
    }
  };

  const lineCount = code.split('\n').length;
  const selectedTheme = CODE_THEMES.find(t => t.id === theme) || CODE_THEMES[0];

  return (
    <div className={`flex flex-col h-full border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Enhanced Code Editor</h3>
            {collaborative && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Collaborative
              </Badge>
            )}
            {autoSave && (
              <Badge variant="outline" className="text-xs">
                Auto-save
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className={showSearch ? 'bg-muted' : ''}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editor Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Theme</label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CODE_THEMES.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id}>
                            {theme.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Font Size</label>
                    <Input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min="10"
                      max="24"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-save</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoSave(!autoSave)}
                        className={autoSave ? 'text-primary' : ''}
                      >
                        {autoSave ? 'On' : 'Off'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Linting</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLinting(!linting)}
                        className={linting ? 'text-primary' : ''}
                      >
                        {linting ? 'On' : 'Off'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Word Wrap</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWordWrap(!wordWrap)}
                        className={wordWrap ? 'text-primary' : ''}
                      >
                        {wordWrap ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="flex items-center gap-2 mb-3">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Replace..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={performSearch}>
              <Search className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={performReplace}>
              <Replace className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Input
            placeholder="Code title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.icon}</span>
                    {lang.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <div className="px-4 py-2 border-b bg-muted/20 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        
        <div className="h-4 w-px bg-border mx-2" />
        
        <Button variant="ghost" size="sm" onClick={formatCode}>
          <Braces className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={analyzeCode}>
          <Bug className="w-4 h-4" />
        </Button>
        
        <div className="flex-1" />
        
        <span className="text-xs text-muted-foreground">
          Lines: {lineCount} | Chars: {code.length}
        </span>
      </div>

      <Tabs defaultValue="editor" className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="output">
              <Terminal className="w-4 h-4 mr-1" />
              Output
            </TabsTrigger>
            <TabsTrigger value="errors">
              <Bug className="w-4 h-4 mr-1" />
              Problems
            </TabsTrigger>
            <TabsTrigger value="versions">
              <History className="w-4 h-4 mr-1" />
              Versions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="flex-1 p-0 m-0">
          <div className={`flex flex-1 ${selectedTheme.bg} ${selectedTheme.text}`}>
            {/* Line numbers */}
            {lineNumbers && (
              <div className="w-16 bg-muted/20 border-r p-2 text-xs text-muted-foreground text-right">
                {Array.from({ length: Math.max(lineCount, 30) }, (_, i) => (
                  <div key={i + 1} className="leading-6" style={{ fontSize: `${fontSize}px` }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-full p-4 bg-transparent border-none outline-none resize-none font-mono leading-6"
                placeholder="Start coding something amazing..."
                spellCheck={false}
                style={{ 
                  fontSize: `${fontSize}px`,
                  whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                  overflowWrap: wordWrap ? 'break-word' : 'normal'
                }}
              />
              
              {/* Collaborative cursors */}
              {collaborative && Object.entries(cursors).map(([id, cursor]) => (
                <div
                  key={id}
                  className="absolute w-0.5 h-6 animate-pulse"
                  style={{
                    backgroundColor: cursor.color,
                    top: `${cursor.line * (fontSize * 1.5) + 16}px`,
                    left: `${cursor.column * (fontSize * 0.6) + 16}px`,
                  }}
                >
                  <div
                    className="absolute -top-6 left-0 px-1 py-0.5 text-xs text-white rounded whitespace-nowrap"
                    style={{ backgroundColor: cursor.color }}
                  >
                    {cursor.user}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Minimap */}
            {showMinimap && code.length > 500 && (
              <div className="w-32 bg-muted/10 border-l p-2">
                <div className="text-xs text-muted-foreground mb-2">Minimap</div>
                <div 
                  className="text-xs leading-3 opacity-60 overflow-hidden h-full font-mono"
                  style={{ fontSize: '6px' }}
                >
                  {code}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="output" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {output ? (
                <pre className="text-sm font-mono whitespace-pre-wrap bg-muted/20 p-4 rounded border">
                  {output}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2" />
                  <p>Run your code to see the output here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="errors" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {errors ? (
                <pre className="text-sm font-mono whitespace-pre-wrap bg-red-50 border border-red-200 p-4 rounded text-red-700">
                  {errors}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No problems detected</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="versions" className="flex-1 p-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {versions.length > 0 ? (
                versions.map((version) => (
                  <div key={version.id} className="p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{version.title}</span>
                        <Badge variant="outline" className="text-xs">
                          v{version.version}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      by {version.author}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <History className="w-8 h-8 mx-auto mb-2" />
                  <p>No versions saved yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Enhanced Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Ln {lineCount}, Col {code.length}</span>
            <span>•</span>
            <span>{language}</span>
            <span>•</span>
            <span>UTF-8</span>
            {collaborative && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {collaborators.length} online
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(code)}
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([code], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title || 'code'}.${language === 'javascript' ? 'js' : language}`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={!code.trim()}
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const shareUrl = `${window.location.origin}/code/${Date.now()}`;
                navigator.clipboard.writeText(shareUrl);
                toast({ title: "Share link copied to clipboard" });
              }}
              disabled={!code.trim()}
            >
              <Share className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={runCode}
              disabled={isRunning || !code.trim()}
            >
              <Play className="w-4 h-4 mr-1" />
              {isRunning ? 'Running...' : 'Run'}
            </Button>
            
            <Button
              size="sm"
              onClick={saveCode}
              disabled={!code.trim() || !title.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCodeEditor;
