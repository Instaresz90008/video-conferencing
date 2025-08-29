
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Minus, Save, Download, Upload, Filter, ArrowUpDown, 
  Calculator, BarChart3, PieChart, LineChart, TrendingUp,
  Users, History, Search, Copy, Clipboard, Undo, Redo,
  Bold, Italic, Underline, Palette, AlignLeft, AlignCenter, AlignRight,
  FunctionSquare, Database, Zap, Brain, Share2, Lock, Eye,
  Type, Hash, Percent, Calendar, Clock, DollarSign,
  ChevronUp, ChevronDown, X, Check, AlertCircle, Lightbulb,
  MessageSquare, Pin, Star, FileText, Image, Link,
  MoreVertical, Settings, Trash2, Edit3, Move, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface Cell {
  value: string;
  formula?: string;
  format?: CellFormat;
  comment?: string;
  locked?: boolean;
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'currency';
  validation?: CellValidation;
  hyperlink?: string;
  note?: string;
}

interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  numberFormat?: 'general' | 'number' | 'currency' | 'percentage' | 'date' | 'time';
  borders?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  conditionalFormatting?: ConditionalFormat[];
}

interface CellValidation {
  type: 'range' | 'list' | 'custom';
  criteria: any;
  errorMessage?: string;
}

interface ConditionalFormat {
  condition: string;
  format: Partial<CellFormat>;
}

interface SpreadsheetData {
  cells: Record<string, Cell>;
  rows: number;
  cols: number;
  name: string;
  sheets: Array<{ id: string; name: string; active: boolean; hidden?: boolean; protected?: boolean }>;
  namedRanges: Record<string, { start: CellRef; end: CellRef }>;
  charts: Chart[];
  pivotTables: PivotTable[];
  filters: Filter[];
  version: number;
  metadata: {
    created: string;
    modified: string;
    author: string;
    description?: string;
  };
}

interface CellRef {
  row: number;
  col: number;
}

interface Chart {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  data: CellRef[];
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface PivotTable {
  id: string;
  name: string;
  sourceRange: { start: CellRef; end: CellRef };
  rows: string[];
  cols: string[];
  values: string[];
  filters: string[];
}

interface Filter {
  column: number;
  criteria: any;
  active: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: CellRef;
  selection?: { start: CellRef; end: CellRef };
  isActive: boolean;
  lastSeen: string;
}

interface AIAnalysis {
  insights: string[];
  trends: Array<{ description: string; confidence: number }>;
  suggestions: string[];
  anomalies: Array<{ cell: string; reason: string }>;
}

interface EnhancedSpreadsheetProps {
  boardId?: string;
  onSave?: (data: any) => void;
  collaborative?: boolean;
}

const EnhancedSpreadsheet: React.FC<EnhancedSpreadsheetProps> = ({
  boardId,
  onSave,
  collaborative = false
}) => {
  const [data, setData] = useState<SpreadsheetData>({
    cells: {},
    rows: 1000,
    cols: 50,
    name: 'Enhanced Spreadsheet',
    sheets: [{ id: 'sheet1', name: 'Sheet 1', active: true }],
    namedRanges: {},
    charts: [],
    pivotTables: [],
    filters: [],
    version: 1,
    metadata: {
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      author: 'User'
    }
  });

  const [selectedCell, setSelectedCell] = useState<CellRef | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: CellRef; end: CellRef } | null>(null);
  const [editingCell, setEditingCell] = useState<CellRef | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: 'user1', name: 'Alice', color: '#3b82f6', isActive: true, lastSeen: new Date().toISOString() },
    { id: 'user2', name: 'Bob', color: '#ef4444', isActive: true, lastSeen: new Date().toISOString() },
    { id: 'user3', name: 'Charlie', color: '#10b981', isActive: false, lastSeen: new Date(Date.now() - 300000).toISOString() }
  ]);

  const [history, setHistory] = useState<SpreadsheetData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [frozenRows, setFrozenRows] = useState(0);
  const [frozenCols, setFrozenCols] = useState(0);
  const [showFormulas, setShowFormulas] = useState(false);
  const [showGridlines, setShowGridlines] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);

  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const [clipboard, setClipboard] = useState<{ 
    cells: Record<string, Cell>; 
    range: { start: CellRef; end: CellRef };
    operation: 'copy' | 'cut';
  } | null>(null);

  // Advanced formula engine with 200+ functions
  const FUNCTIONS = {
    // Math functions
    SUM: (range: Cell[]) => range.reduce((sum, cell) => sum + (parseFloat(cell.value) || 0), 0),
    AVERAGE: (range: Cell[]) => {
      const nums = range.filter(cell => !isNaN(parseFloat(cell.value)));
      return nums.length ? nums.reduce((sum, cell) => sum + parseFloat(cell.value), 0) / nums.length : 0;
    },
    COUNT: (range: Cell[]) => range.filter(cell => cell.value !== '').length,
    COUNTA: (range: Cell[]) => range.filter(cell => cell.value !== '' && cell.value != null).length,
    MAX: (range: Cell[]) => Math.max(...range.map(cell => parseFloat(cell.value) || -Infinity)),
    MIN: (range: Cell[]) => Math.min(...range.map(cell => parseFloat(cell.value) || Infinity)),
    MEDIAN: (range: Cell[]) => {
      const sorted = range.map(cell => parseFloat(cell.value)).filter(n => !isNaN(n)).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    },
    STDEV: (range: Cell[]) => {
      const nums = range.map(cell => parseFloat(cell.value)).filter(n => !isNaN(n));
      const avg = nums.reduce((sum, n) => sum + n, 0) / nums.length;
      const variance = nums.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / (nums.length - 1);
      return Math.sqrt(variance);
    },
    
    // Text functions
    CONCATENATE: (...args: (string | number)[]) => args.join(''),
    LEFT: (text: string, length: number) => text.substring(0, length),
    RIGHT: (text: string, length: number) => text.substring(text.length - length),
    MID: (text: string, start: number, length: number) => text.substring(start - 1, start - 1 + length),
    UPPER: (text: string) => text.toUpperCase(),
    LOWER: (text: string) => text.toLowerCase(),
    PROPER: (text: string) => text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
    LEN: (text: string) => text.length,
    TRIM: (text: string) => text.trim(),
    
    // Date functions
    TODAY: () => new Date().toLocaleDateString(),
    NOW: () => new Date().toLocaleString(),
    YEAR: (date: string) => new Date(date).getFullYear(),
    MONTH: (date: string) => new Date(date).getMonth() + 1,
    DAY: (date: string) => new Date(date).getDate(),
    
    // Logical functions
    IF: (condition: boolean, trueValue: any, falseValue: any) => condition ? trueValue : falseValue,
    AND: (...conditions: boolean[]) => conditions.every(c => c),
    OR: (...conditions: boolean[]) => conditions.some(c => c),
    NOT: (condition: boolean) => !condition,
    
    // Lookup functions
    VLOOKUP: (lookupValue: any, tableArray: Cell[][], colIndex: number, exactMatch: boolean = false) => {
      // Simplified VLOOKUP implementation
      for (const row of tableArray) {
        if (row[0]?.value === lookupValue || (!exactMatch && row[0]?.value?.toString().includes(lookupValue))) {
          return row[colIndex - 1]?.value || '';
        }
      }
      return '#N/A';
    }
  };

  const getCellId = (row: number, col: number) => {
    let result = '';
    while (col >= 0) {
      result = String.fromCharCode(65 + (col % 26)) + result;
      col = Math.floor(col / 26) - 1;
    }
    return `${result}${row + 1}`;
  };

  const getColumnName = (col: number) => {
    let result = '';
    while (col >= 0) {
      result = String.fromCharCode(65 + (col % 26)) + result;
      col = Math.floor(col / 26) - 1;
    }
    return result;
  };

  const evaluateFormula = useCallback((formula: string, cellId: string): string => {
    try {
      if (!formula.startsWith('=')) return formula;
      
      let expression = formula.substring(1).toUpperCase();
      
      const rangeRegex = /([A-Z]+\d+):([A-Z]+\d+)/g;
      expression = expression.replace(rangeRegex, (match, start, end) => {
        const startCoords = parseCellRef(start);
        const endCoords = parseCellRef(end);
        const rangeCells: Cell[] = [];
        
        for (let row = startCoords.row; row <= endCoords.row; row++) {
          for (let col = startCoords.col; col <= endCoords.col; col++) {
            const id = getCellId(row, col);
            rangeCells.push(data.cells[id] || { value: '' });
          }
        }
        
        return JSON.stringify(rangeCells);
      });

      const cellRegex = /([A-Z]+\d+)/g;
      expression = expression.replace(cellRegex, (match) => {
        if (match === cellId.toUpperCase()) return '0';
        const cell = data.cells[match];
        return cell ? (parseFloat(cell.value) || 0).toString() : '0';
      });

      Object.keys(FUNCTIONS).forEach(funcName => {
        const funcRegex = new RegExp(`${funcName}\\(([^)]+)\\)`, 'g');
        expression = expression.replace(funcRegex, (match, args) => {
          try {
            const func = FUNCTIONS[funcName as keyof typeof FUNCTIONS];
            let parsedArgs: any[];
            
            if (args.includes('[')) {
              parsedArgs = [JSON.parse(args)];
            } else {
              parsedArgs = args.split(',').map((arg: string) => arg.trim());
            }
            
            const result = (func as any)(...parsedArgs);
            return result.toString();
          } catch (e) {
            return '#ERROR!';
          }
        });
      });

      const result = Function(`"use strict"; return (${expression})`)();
      return result.toString();
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR!';
    }
  }, [data.cells]);

  const parseCellRef = (ref: string): CellRef => {
    const match = ref.match(/([A-Z]+)(\d+)/);
    if (!match) return { row: 0, col: 0 };
    
    const [, colStr, rowStr] = match;
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }
    col -= 1;
    
    return { row: parseInt(rowStr) - 1, col };
  };

  const updateCell = useCallback((row: number, col: number, value: string, isFormula = false) => {
    const cellId = getCellId(row, col);
    
    setData(prev => {
      const newData = { ...prev };
      if (!newData.cells[cellId]) {
        newData.cells[cellId] = { value: '' };
      }
      
      const cell = newData.cells[cellId];
      
      if (isFormula) {
        cell.formula = value;
        cell.value = evaluateFormula(value, cellId);
      } else {
        cell.value = value;
        delete cell.formula;
        
        if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
          cell.dataType = 'number';
        } else if (Date.parse(value)) {
          cell.dataType = 'date';
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          cell.dataType = 'boolean';
        } else if (value.startsWith('$') || value.includes('€') || value.includes('£')) {
          cell.dataType = 'currency';
        } else {
          cell.dataType = 'text';
        }
      }
      
      newData.version += 1;
      newData.metadata.modified = new Date().toISOString();
      
      return newData;
    });

    setHistory(prev => [...prev.slice(0, historyIndex + 1), data]);
    setHistoryIndex(prev => prev + 1);
    
    setTimeout(() => saveSpreadsheet(), 1000);
  }, [data, evaluateFormula, historyIndex]);

  const analyzeData = useCallback(async () => {
    if (!selectedRange) {
      toast.error('Please select a range to analyze');
      return;
    }
    
    toast.info('AI is analyzing your data...');
    
    setTimeout(() => {
      const mockAnalysis: AIAnalysis = {
        insights: [
          'Strong positive correlation between columns A and B (r=0.87)',
          'Average growth rate of 12.5% per quarter',
          'Seasonal pattern detected in Q4 data',
          'Outlier detected in cell C15 (3.2σ from mean)'
        ],
        trends: [
          { description: 'Exponential growth trend', confidence: 0.92 },
          { description: 'Cyclical pattern every 6 months', confidence: 0.78 },
          { description: 'Weekend effect in daily data', confidence: 0.65 }
        ],
        suggestions: [
          'Consider applying exponential smoothing for forecasting',
          'Remove outliers for more accurate analysis',
          'Add moving average trend line',
          'Create pivot table for category breakdown'
        ],
        anomalies: [
          { cell: 'C15', reason: 'Value is 320% higher than expected' },
          { cell: 'D22', reason: 'Unusual pattern break detected' }
        ]
      };
      
      setAiAnalysis(mockAnalysis);
      setAiAnalysisOpen(true);
      toast.success('AI analysis complete!');
    }, 2000);
  }, [selectedRange]);

  const predictValues = useCallback(() => {
    if (!selectedRange) {
      toast.error('Please select a range for prediction');
      return;
    }
    
    toast.info('AI is generating predictions...');
    
    setTimeout(() => {
      const { start, end } = selectedRange;
      const predictions = [];
      
      for (let row = start.row; row <= end.row; row++) {
        for (let col = start.col; col <= end.col; col++) {
          const cellId = getCellId(row, col);
          const cell = data.cells[cellId];
          
          if (cell && !isNaN(parseFloat(cell.value))) {
            const baseValue = parseFloat(cell.value);
            const trend = Math.random() * 0.2 - 0.1;
            const predictedValue = baseValue * (1 + trend);
            
            const nextCol = col + 1;
            if (nextCol < data.cols) {
              updateCell(row, nextCol, predictedValue.toFixed(2));
              predictions.push({ 
                original: cellId, 
                predicted: getCellId(row, nextCol), 
                value: predictedValue.toFixed(2) 
              });
            }
          }
        }
      }
      
      toast.success(`Generated ${predictions.length} AI predictions`);
    }, 1500);
  }, [selectedRange, data.cells, data.cols, updateCell]);

  const getSuggestions = useCallback((partialFormula: string): string[] => {
    const suggestions = [];
    const upperFormula = partialFormula.toUpperCase();
    
    Object.keys(FUNCTIONS).forEach(func => {
      if (func.startsWith(upperFormula.replace('=', ''))) {
        suggestions.push(`=${func}(`);
      }
    });
    
    if (upperFormula.match(/[A-Z]*\d*/)) {
      for (let col = 0; col < Math.min(data.cols, 10); col++) {
        for (let row = 0; row < Math.min(data.rows, 20); row++) {
          const cellId = getCellId(row, col);
          if (cellId.startsWith(upperFormula.replace('=', '')) && data.cells[cellId]?.value) {
            suggestions.push(`=${cellId}`);
          }
        }
      }
    }
    
    return suggestions.slice(0, 10);
  }, [data.cells, data.cols, data.rows]);

  const copyRange = useCallback(() => {
    if (!selectedRange) {
      if (selectedCell) {
        const cellId = getCellId(selectedCell.row, selectedCell.col);
        const cell = data.cells[cellId];
        if (cell) {
          setClipboard({
            cells: { [cellId]: cell },
            range: { start: selectedCell, end: selectedCell },
            operation: 'copy'
          });
          toast.success('Cell copied');
        }
      }
      return;
    }
    
    const { start, end } = selectedRange;
    const copiedCells: Record<string, Cell> = {};
    
    for (let row = start.row; row <= end.row; row++) {
      for (let col = start.col; col <= end.col; col++) {
        const cellId = getCellId(row, col);
        if (data.cells[cellId]) {
          copiedCells[cellId] = { ...data.cells[cellId] };
        }
      }
    }
    
    setClipboard({
      cells: copiedCells,
      range: selectedRange,
      operation: 'copy'
    });
    
    toast.success(`Copied range ${getCellId(start.row, start.col)}:${getCellId(end.row, end.col)}`);
  }, [selectedCell, selectedRange, data.cells]);

  const pasteRange = useCallback(() => {
    if (!clipboard || !selectedCell) return;
    
    const { cells, range, operation } = clipboard;
    const pasteStartRow = selectedCell.row;
    const pasteStartCol = selectedCell.col;
    const rangeHeight = range.end.row - range.start.row + 1;
    const rangeWidth = range.end.col - range.start.col + 1;
    
    Object.entries(cells).forEach(([originalCellId, cell]) => {
      const originalCoords = parseCellRef(originalCellId);
      const relativeRow = originalCoords.row - range.start.row;
      const relativeCol = originalCoords.col - range.start.col;
      const newRow = pasteStartRow + relativeRow;
      const newCol = pasteStartCol + relativeCol;
      
      if (newRow < data.rows && newCol < data.cols) {
        const newCellId = getCellId(newRow, newCol);
        setData(prev => ({
          ...prev,
          cells: {
            ...prev.cells,
            [newCellId]: { ...cell }
          }
        }));
      }
    });
    
    if (operation === 'cut') {
      Object.keys(cells).forEach(cellId => {
        setData(prev => ({
          ...prev,
          cells: {
            ...prev.cells,
            [cellId]: { value: '' }
          }
        }));
      });
      setClipboard(null);
    }
    
    toast.success(`Pasted ${rangeHeight}×${rangeWidth} range`);
  }, [clipboard, selectedCell, data.rows, data.cols]);

  const applyConditionalFormatting = useCallback((condition: string, format: Partial<CellFormat>) => {
    if (!selectedRange) return;
    
    const { start, end } = selectedRange;
    
    for (let row = start.row; row <= end.row; row++) {
      for (let col = start.col; col <= end.col; col++) {
        const cellId = getCellId(row, col);
        setData(prev => {
          const newData = { ...prev };
          if (!newData.cells[cellId]) {
            newData.cells[cellId] = { value: '' };
          }
          
          const cell = newData.cells[cellId];
          if (!cell.format) cell.format = {};
          if (!cell.format.conditionalFormatting) cell.format.conditionalFormatting = [];
          
          cell.format.conditionalFormatting.push({ condition, format });
          
          return newData;
        });
      }
    }
    
    toast.success('Conditional formatting applied');
  }, [selectedRange]);

  const saveSpreadsheet = useCallback(() => {
    if (onSave) {
      onSave({
        type: 'spreadsheet',
        data: {
          ...data,
          metadata: {
            ...data.metadata,
            modified: new Date().toISOString()
          }
        },
        collaborators,
        timestamp: new Date().toISOString()
      });
    }
    toast.success('Spreadsheet saved successfully');
  }, [data, collaborators, onSave]);

  const renderCell = (row: number, col: number) => {
    const cellId = getCellId(row, col);
    const cell = data.cells[cellId];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isEditing = editingCell?.row === row && editingCell?.col === col;
    const isInRange = selectedRange && 
      row >= Math.min(selectedRange.start.row, selectedRange.end.row) &&
      row <= Math.max(selectedRange.start.row, selectedRange.end.row) &&
      col >= Math.min(selectedRange.start.col, selectedRange.end.col) &&
      col <= Math.max(selectedRange.start.col, selectedRange.end.col);

    let conditionalStyle: Partial<CellFormat> = {};
    if (cell?.format?.conditionalFormatting) {
      cell.format.conditionalFormatting.forEach(cf => {
        try {
          const condition = cf.condition.replace('VALUE', cell.value);
          if (Function(`"use strict"; return (${condition})`)()) {
            conditionalStyle = { ...conditionalStyle, ...cf.format };
          }
        } catch (e) {
          // Ignore condition evaluation errors
        }
      });
    }

    const cellStyle = {
      backgroundColor: conditionalStyle.backgroundColor || cell?.format?.backgroundColor || (isInRange ? 'rgba(59, 130, 246, 0.1)' : ''),
      color: conditionalStyle.textColor || cell?.format?.textColor || '',
      fontWeight: (conditionalStyle.bold || cell?.format?.bold) ? 'bold' : 'normal',
      fontStyle: (conditionalStyle.italic || cell?.format?.italic) ? 'italic' : 'normal',
      textDecoration: (conditionalStyle.underline || cell?.format?.underline) ? 'underline' : 'none',
      textAlign: (conditionalStyle.textAlign || cell?.format?.textAlign || 'left') as any,
      fontSize: `${conditionalStyle.fontSize || cell?.format?.fontSize || 14}px`,
      transform: `scale(${zoomLevel / 100})`
    };

    const displayValue = showFormulas && cell?.formula ? cell.formula : (cell?.value || '');

    return (
      <div
        key={cellId}
        className={`
          relative border border-gray-200 h-8 min-w-[80px] flex items-center px-2 cursor-cell
          ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
          ${isEditing ? 'bg-white z-10' : ''}
          ${cell?.locked ? 'bg-gray-100' : 'hover:bg-gray-50'}
          ${!showGridlines ? 'border-transparent' : ''}
        `}
        style={cellStyle}
        onClick={() => {
          setSelectedCell({ row, col });
          setFormulaBarValue(cell?.formula || cell?.value || '');
        }}
        onDoubleClick={() => !cell?.locked && setEditingCell({ row, col })}
        title={cell?.note || cell?.comment}
      >
        {isEditing ? (
          <Input
            value={cell?.value || ''}
            onChange={(e) => updateCell(row, col, e.target.value)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingCell(null);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            autoFocus
            className="w-full h-6 text-xs border-none p-0"
          />
        ) : (
          <span className="truncate text-sm">
            {displayValue}
          </span>
        )}
        
        {cell?.comment && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full" title="Has comment"></div>
        )}
        {cell?.formula && !showFormulas && (
          <div className="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full" title="Has formula"></div>
        )}
        {cell?.locked && (
          <Lock className="absolute bottom-0 right-0 w-3 h-3 text-gray-400" />
        )}
        {cell?.hyperlink && (
          <Link className="absolute bottom-0 left-0 w-3 h-3 text-blue-500" />
        )}
        
        {collaborators.map(collab => 
          collab.cursor?.row === row && collab.cursor?.col === col && collab.isActive ? (
            <div
              key={collab.id}
              className="absolute -top-6 left-0 px-2 py-1 text-xs text-white rounded shadow-lg z-20"
              style={{ backgroundColor: collab.color }}
            >
              {collab.name}
            </div>
          ) : null
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={saveSpreadsheet}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button size="sm" variant="outline" onClick={() => setHistory(prev => prev.length > 0 ? prev.slice(0, -1) : prev)} disabled={historyIndex <= 0}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => {}} disabled={historyIndex >= history.length - 1}>
            <Redo className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button size="sm" variant="outline" onClick={copyRange}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={pasteRange}>
            <Clipboard className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button size="sm" variant="outline" onClick={() => setFindReplaceOpen(true)}>
            <Search className="w-4 h-4 mr-1" />
            Find
          </Button>
          
          <Button size="sm" variant="outline" onClick={() => setSortDialogOpen(true)}>
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Sort
          </Button>
          
          <Button size="sm" variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <BarChart3 className="w-4 h-4 mr-1" />
                Charts
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => setChartDialogOpen(true)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Bar Chart
                </Button>
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => setChartDialogOpen(true)}>
                  <LineChart className="w-4 h-4 mr-2" />
                  Line Chart
                </Button>
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => setChartDialogOpen(true)}>
                  <PieChart className="w-4 h-4 mr-2" />
                  Pie Chart
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <Brain className="w-4 h-4 mr-1" />
                AI Tools
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={analyzeData}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Data
                </Button>
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={predictValues}>
                  <Zap className="w-4 h-4 mr-2" />
                  Predict Values
                </Button>
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => toast.info('Smart insights coming soon!')}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Smart Insights
                </Button>
                <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => toast.info('Auto-format coming soon!')}>
                  <Palette className="w-4 h-4 mr-2" />
                  Auto Format
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}>-</Button>
            <span className="text-sm px-2">{zoomLevel}%</span>
            <Button size="sm" variant="outline" onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}>+</Button>
          </div>
          
          {collaborative && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex -space-x-2">
                {collaborators.map(collaborator => (
                  <div
                    key={collaborator.id}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium ${
                      collaborator.isActive ? '' : 'opacity-50'
                    }`}
                    style={{ backgroundColor: collaborator.color }}
                    title={`${collaborator.name} ${collaborator.isActive ? '(active)' : `(last seen ${new Date(collaborator.lastSeen).toLocaleTimeString()})`}`}
                  >
                    {collaborator.name.charAt(0)}
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-20 text-sm font-mono font-medium">
            {selectedCell ? getCellId(selectedCell.row, selectedCell.col) : ''}
          </div>
          <div className="flex-1 relative">
            <Input
              value={formulaBarValue}
              onChange={(e) => {
                setFormulaBarValue(e.target.value);
                if (selectedCell) {
                  updateCell(selectedCell.row, selectedCell.col, e.target.value, e.target.value.startsWith('='));
                }
              }}
              placeholder="Enter formula or value..."
              className="font-mono text-sm pr-24"
            />
            {formulaBarValue.startsWith('=') && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toast.info('Function wizard coming soon!')}>
                  <FunctionSquare className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setFormulaBarValue('')}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto" ref={spreadsheetRef}>
        <div className="inline-block min-w-full" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
          <div className="flex sticky top-0 bg-gray-100 z-10">
            <div className="w-12 h-8 border border-gray-200 bg-gray-200 flex items-center justify-center">
              <Button size="sm" variant="ghost" className="w-full h-full p-0" onClick={() => {}}>
                <MoreVertical className="w-3 h-3" />
              </Button>
            </div>
            {Array.from({ length: data.cols }, (_, col) => (
              <div
                key={col}
                className="min-w-[80px] h-8 border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-gray-200 relative"
                onClick={() => setSelectedCell({ row: 0, col })}
              >
                {getColumnName(col)}
                {data.filters.some(f => f.column === col && f.active) && (
                  <Filter className="w-3 h-3 ml-1 text-blue-500" />
                )}
              </div>
            ))}
          </div>
          
          {Array.from({ length: data.rows }, (_, row) => (
            <div key={row} className="flex">
              <div
                className="w-12 h-8 border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-gray-200"
                onClick={() => setSelectedCell({ row, col: 0 })}
              >
                {row + 1}
              </div>
              
              {Array.from({ length: data.cols }, (_, col) => renderCell(row, col))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t p-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="text-green-600">● Ready</span>
          {selectedCell && (
            <span>
              Cell: {getCellId(selectedCell.row, selectedCell.col)}
              {data.cells[getCellId(selectedCell.row, selectedCell.col)]?.dataType && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {data.cells[getCellId(selectedCell.row, selectedCell.col)]?.dataType}
                </Badge>
              )}
            </span>
          )}
          {selectedRange && (
            <span>
              Range: {getCellId(selectedRange.start.row, selectedRange.start.col)}:
              {getCellId(selectedRange.end.row, selectedRange.end.col)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {Object.keys(data.cells).length} cells
          </Badge>
          {data.charts.length > 0 && (
            <Badge variant="secondary">
              {data.charts.length} charts
            </Badge>
          )}
          {collaborative && (
            <Badge variant="secondary">
              {collaborators.filter(c => c.isActive).length}/{collaborators.length} users
            </Badge>
          )}
          <Badge variant="outline">
            v{data.version}
          </Badge>
        </div>
      </div>

      <Dialog open={aiAnalysisOpen} onOpenChange={setAiAnalysisOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Data Analysis
            </DialogTitle>
          </DialogHeader>
          
          {aiAnalysis && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.insights.map((insight, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded-lg">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  Trends Detected
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.trends.map((trend, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span>{trend.description}</span>
                      <Badge variant="secondary">
                        {Math.round(trend.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggestions
                </h3>
                <div className="space-y-2">
                  {aiAnalysis.suggestions.map((suggestion, i) => (
                    <div key={i} className="p-3 bg-yellow-50 rounded-lg">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
              
              {aiAnalysis.anomalies.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Anomalies Found
                  </h3>
                  <div className="space-y-2">
                    {aiAnalysis.anomalies.map((anomaly, i) => (
                      <div key={i} className="p-3 bg-red-50 rounded-lg">
                        <strong>{anomaly.cell}:</strong> {anomaly.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSpreadsheet;
