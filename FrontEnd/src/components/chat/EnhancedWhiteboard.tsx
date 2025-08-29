
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Palette, 
  MousePointer, 
  Pen, 
  Square, 
  Circle, 
  Type, 
  Minus, 
  Eraser,
  Save, 
  Share, 
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Users,
  Grid,
  Eye,
  EyeOff,
  Layers,
  Copy,
  Trash2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Image as ImageIcon,
  Shapes,
  Highlighter,
  Triangle
} from 'lucide-react';
import { chatAPI } from '@/services/chatApi';
import { toast } from '@/hooks/use-toast';

interface DrawingElement {
  id: string;
  type: 'pen' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'text' | 'image' | 'highlight';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  backgroundColor?: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  locked: boolean;
  layer: number;
  style?: 'solid' | 'dashed' | 'dotted';
}

interface WhiteboardProps {
  boardId?: string;
  onSave?: (elements: DrawingElement[]) => void;
  collaborative?: boolean;
}

const DRAWING_TOOLS = [
  { id: 'select', name: 'Select', icon: MousePointer },
  { id: 'pen', name: 'Pen', icon: Pen },
  { id: 'line', name: 'Line', icon: Minus },
  { id: 'rectangle', name: 'Rectangle', icon: Square },
  { id: 'circle', name: 'Circle', icon: Circle },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
  { id: 'text', name: 'Text', icon: Type },
  { id: 'eraser', name: 'Eraser', icon: Eraser },
  { id: 'highlight', name: 'Highlight', icon: Highlighter },
] as const;

const COLOR_PALETTE = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#FFFFFF'
];

const STROKE_STYLES = [
  { id: 'solid', name: 'Solid' },
  { id: 'dashed', name: 'Dashed' },
  { id: 'dotted', name: 'Dotted' },
];

const EnhancedWhiteboard: React.FC<WhiteboardProps> = ({
  boardId,
  onSave,
  collaborative = false
}) => {
  // Drawing state
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('pen');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [strokeStyle, setStrokeStyle] = useState('solid');
  
  // Canvas state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  
  // View state
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(1);
  
  // History
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Collaborative
  const [collaborators, setCollaborators] = useState<string[]>(['You']);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; user: string; color: string }>>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas dimensions
  const canvasWidth = 1920;
  const canvasHeight = 1080;

  // History management
  const addToHistory = useCallback((newElements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  // Drawing functions
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: ((e.clientX - rect.left) * scaleX - pan.x) / (zoom / 100),
      y: ((e.clientY - rect.top) * scaleY - pan.y) / (zoom / 100)
    };
  }, [zoom, pan]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);
    
    if (selectedTool === 'select') return;
    
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: selectedTool as DrawingElement['type'],
      x: pos.x,
      y: pos.y,
      color: selectedTool === 'eraser' ? backgroundColor : selectedColor,
      backgroundColor: selectedTool === 'highlight' ? selectedColor + '40' : undefined,
      strokeWidth: selectedTool === 'highlight' ? strokeWidth * 2 : strokeWidth,
      opacity: opacity / 100,
      rotation: 0,
      locked: false,
      layer: currentLayer,
      style: strokeStyle as DrawingElement['style'],
      points: selectedTool === 'pen' ? [pos] : undefined
    };
    
    setCurrentElement(newElement);
  }, [selectedTool, selectedColor, backgroundColor, strokeWidth, opacity, currentLayer, strokeStyle, getMousePos]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement || selectedTool === 'select') return;
    
    const pos = getMousePos(e);
    
    if (selectedTool === 'pen' && currentElement.points) {
      setCurrentElement({
        ...currentElement,
        points: [...currentElement.points, pos]
      });
    } else {
      setCurrentElement({
        ...currentElement,
        width: pos.x - currentElement.x,
        height: pos.y - currentElement.y
      });
    }
  }, [isDrawing, currentElement, selectedTool, getMousePos]);

  const stopDrawing = useCallback(() => {
    if (currentElement && isDrawing) {
      const newElements = [...elements, currentElement];
      setElements(newElements);
      addToHistory(newElements);
    }
    
    setIsDrawing(false);
    setCurrentElement(null);
    setStartPoint(null);
  }, [currentElement, isDrawing, elements, addToHistory]);

  // Canvas rendering
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.save();
    
    ctx.globalAlpha = element.opacity;
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.backgroundColor || element.color;
    ctx.lineWidth = element.strokeWidth;
    
    // Set line style
    if (element.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (element.style === 'dotted') {
      ctx.setLineDash([2, 2]);
    }
    
    // Apply rotation
    if (element.rotation) {
      ctx.translate(element.x + (element.width || 0) / 2, element.y + (element.height || 0) / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-(element.x + (element.width || 0) / 2), -(element.y + (element.height || 0) / 2));
    }
    
    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + (element.width || 0), element.y + (element.height || 0));
        ctx.stroke();
        break;
        
      case 'rectangle':
        if (element.backgroundColor) {
          ctx.fillRect(element.x, element.y, element.width || 0, element.height || 0);
        }
        ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
        break;
        
      case 'circle':
        const radius = Math.sqrt(Math.pow(element.width || 0, 2) + Math.pow(element.height || 0, 2)) / 2;
        ctx.beginPath();
        ctx.arc(element.x + (element.width || 0) / 2, element.y + (element.height || 0) / 2, radius, 0, 2 * Math.PI);
        if (element.backgroundColor) ctx.fill();
        ctx.stroke();
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(element.x + (element.width || 0) / 2, element.y);
        ctx.lineTo(element.x, element.y + (element.height || 0));
        ctx.lineTo(element.x + (element.width || 0), element.y + (element.height || 0));
        ctx.closePath();
        if (element.backgroundColor) ctx.fill();
        ctx.stroke();
        break;
        
      case 'text':
        ctx.font = `${element.strokeWidth * 8}px Arial`;
        ctx.fillText(element.text || '', element.x, element.y);
        break;
        
      case 'highlight':
        ctx.globalAlpha = 0.3;
        ctx.fillRect(element.x, element.y, element.width || 0, element.height || 0);
        break;
    }
    
    ctx.restore();
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E5E5';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
    
    // Sort elements by layer
    const sortedElements = [...elements, ...(currentElement ? [currentElement] : [])]
      .sort((a, b) => a.layer - b.layer);
    
    // Draw all elements
    sortedElements.forEach(element => {
      drawElement(ctx, element);
    });
    
    // Draw selection handles
    selectedElements.forEach(id => {
      const element = elements.find(e => e.id === id);
      if (element && element.type !== 'pen') {
        ctx.strokeStyle = '#007AFF';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(element.x - 5, element.y - 5, (element.width || 0) + 10, (element.height || 0) + 10);
        ctx.setLineDash([]);
      }
    });
  }, [elements, currentElement, backgroundColor, showGrid, selectedElements, drawElement]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Collaborative cursors simulation
  useEffect(() => {
    if (collaborative) {
      const interval = setInterval(() => {
        setCursors({
          'alice': { 
            x: Math.random() * canvasWidth, 
            y: Math.random() * canvasHeight, 
            user: 'Alice', 
            color: '#3b82f6' 
          },
          'bob': { 
            x: Math.random() * canvasWidth, 
            y: Math.random() * canvasHeight, 
            user: 'Bob', 
            color: '#10b981' 
          }
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [collaborative]);

  // Tool handlers
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const duplicateSelected = () => {
    const newElements = [...elements];
    selectedElements.forEach(id => {
      const element = elements.find(e => e.id === id);
      if (element) {
        const duplicate = {
          ...element,
          id: Date.now().toString() + Math.random(),
          x: element.x + 20,
          y: element.y + 20
        };
        newElements.push(duplicate);
      }
    });
    setElements(newElements);
    addToHistory(newElements);
  };

  const deleteSelected = () => {
    const newElements = elements.filter(e => !selectedElements.includes(e.id));
    setElements(newElements);
    setSelectedElements([]);
    addToHistory(newElements);
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElements([]);
    addToHistory([]);
    toast({
      title: "Canvas cleared",
      description: "All elements have been removed",
    });
  };

  const saveBoard = async () => {
    try {
      // Convert canvas to image
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      await chatAPI.createBoard({
        name: `Whiteboard ${new Date().toLocaleDateString()}`,
        type: 'whiteboard',
        content: { elements, canvasWidth, canvasHeight, backgroundColor },
        collaborators
      });
      
      onSave?.(elements);
      
      toast({
        title: "Board saved",
        description: "Your whiteboard has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving board:', error);
      toast({
        title: "Save failed",
        description: "Could not save the board",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Enhanced Whiteboard</h3>
            {collaborative && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Collaborative
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowLayers(!showLayers)}>
              <Layers className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={saveBoard}>
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1">
            {DRAWING_TOOLS.map((tool) => (
              <Button
                key={tool.id}
                variant={selectedTool === tool.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTool(tool.id)}
                title={tool.name}
              >
                <tool.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Colors */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Color:</span>
            <div className="flex items-center gap-1">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    selectedColor === color ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-6 h-6 rounded border"
              />
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Stroke Width */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Size:</span>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground w-6">{strokeWidth}</span>
          </div>

          {/* Opacity */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Opacity:</span>
            <Slider
              value={[opacity]}
              onValueChange={(value) => setOpacity(value[0])}
              max={100}
              min={10}
              step={10}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground w-8">{opacity}%</span>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex items-center gap-4 mt-3">
          {/* History */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Zoom */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(zoom + 25, 400))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-[50px] text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(zoom - 25, 25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          {/* View Options */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={showGrid ? 'bg-muted' : ''}
          >
            <Grid className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          {/* Selected Actions */}
          {selectedElements.length > 0 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={duplicateSelected}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={clearCanvas}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border cursor-crosshair"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* Collaborative Cursors */}
        {collaborative && Object.entries(cursors).map(([id, cursor]) => (
          <div
            key={id}
            className="absolute pointer-events-none z-10"
            style={{
              left: cursor.x * (zoom / 100),
              top: cursor.y * (zoom / 100),
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: cursor.color }}
            />
            <div
              className="absolute top-5 left-0 px-2 py-1 text-xs text-white rounded whitespace-nowrap shadow-md"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.user}
            </div>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Elements: {elements.length}</span>
          <span>Layer: {currentLayer}</span>
          <span>Zoom: {zoom}%</span>
          {selectedElements.length > 0 && (
            <span>Selected: {selectedElements.length}</span>
          )}
        </div>
        
        {collaborative && (
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>{collaborators.length} online</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedWhiteboard;
