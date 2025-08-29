
import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file: File;
}

interface AttachmentUploadProps {
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxSizeTotal?: number; // in bytes
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ 
  onAttachmentsChange, 
  maxSizeTotal = 10.8 * 1024 * 1024 // 10.8 MB
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: Attachment[] = [];
    let totalSize = attachments.reduce((sum, att) => sum + att.size, 0);

    Array.from(files).forEach(file => {
      if (totalSize + file.size > maxSizeTotal) {
        toast({
          title: "File too large",
          description: `Total size would exceed 10.8 MB limit`,
          variant: "destructive",
        });
        return;
      }

      const attachment: Attachment = {
        id: Date.now() + Math.random().toString(36),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        file
      };

      newAttachments.push(attachment);
      totalSize += file.size;
    });

    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onAttachmentsChange(updatedAttachments);
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(att => {
      if (att.id === id) {
        URL.revokeObjectURL(att.url);
        return false;
      }
      return true;
    });
    setAttachments(updatedAttachments);
    onAttachmentsChange(updatedAttachments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('text') || type.includes('code')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-2"
        >
          <Paperclip className="w-4 h-4 mr-1" />
          Attach
        </Button>
        {totalSize > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatFileSize(totalSize)} / {formatFileSize(maxSizeTotal)}
          </span>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
              <div className="flex items-center space-x-2 min-w-0">
                {getFileIcon(attachment.type)}
                <div className="min-w-0">
                  <p className="text-sm truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(attachment.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        accept="image/*,.pdf,.doc,.docx,.txt,.json,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift"
      />
    </div>
  );
};

export default AttachmentUpload;
