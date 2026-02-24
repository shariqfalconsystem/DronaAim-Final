// src/components/common/EditorComponent.tsx
import Attaches from '@editorjs/attaches';
import EditorJS from '@editorjs/editorjs';
import Embed from '@editorjs/embed';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import InlineCode from '@editorjs/inline-code';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import { Box } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import VideoTool from './video-tool';
import PDFTool from './pdf-tool';

interface ToolConstructable {
  new (...args: any[]): any;
}

interface EditorContent {
  blocks: any[];
  time?: number;
  version?: string;
}

interface EditorComponentProps {
  content?: EditorContent;
  readOnly?: boolean;
  onChange?: () => void;
  onReady?: () => void;
  minHeight?: string;
  uploadFileCallback?: (file: File) => Promise<any>;
}

export interface EditorComponentRef {
  save: () => Promise<EditorContent | null>;
  destroy: () => void;
}

// Helper function to transform URL if needed
const transformMediaUrl = (block: any): any => {
  if (!block || !block.data) return block;

  // Handle image blocks
  if (block.type === 'image' && block.data.file) {
    // Prefer signedUrl if available, otherwise use regular url
    if (block.data.file.signedUrl && !block.data.file.url) {
      block.data.file.url = block.data.file.signedUrl;
    }
  }

  // Handle video blocks
  if (block.type === 'video' && block.data.file) {
    if (block.data.file.signedUrl && !block.data.file.url) {
      block.data.file.url = block.data.file.signedUrl;
    }
  }

  // Handle PDF blocks
  if (block.type === 'pdf' && block.data.file) {
    if (block.data.file.signedUrl && !block.data.file.url) {
      block.data.file.url = block.data.file.signedUrl;
    }
  }

  return block;
};

// Prepare content for editor
const prepareContent = (content: EditorContent | undefined): EditorContent | undefined => {
  if (!content || !content.blocks || content.blocks.length === 0) return content;

  // Make a deep copy to avoid mutations
  const preparedContent = JSON.parse(JSON.stringify(content));

  // Transform URLs in blocks
  preparedContent.blocks = preparedContent.blocks.map(transformMediaUrl);

  return preparedContent;
};

const EditorComponent = forwardRef<EditorComponentRef, EditorComponentProps>(
  ({ content, readOnly = false, onChange, onReady, minHeight = '300px', uploadFileCallback }, ref) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const editorInstance = useRef<EditorJS | null>(null);
    const [preparedContent, setPreparedContent] = useState<EditorContent | undefined>(prepareContent(content));

    useEffect(() => {
      // Update prepared content when content changes
      setPreparedContent(prepareContent(content));
    }, [content]);

    useEffect(() => {
      if (editorRef.current && preparedContent) {
        initializeEditor();
      }

      return () => {
        destroyEditor();
      };
    }, [preparedContent, readOnly]);

    const initializeEditor = () => {
      if (editorRef.current && !editorInstance.current) {
        try {
          destroyEditor();

          const editorConfig: any = {
            holder: editorRef.current,
            data: preparedContent,
            readOnly: readOnly,
            onReady: () => {
              console.log('Editor.js is ready');
              if (onReady) onReady();
            },
          };

          const fileUploadHandler = async (file: File) => {
            if (uploadFileCallback) {
              return uploadFileCallback(file);
            }

            console.warn('No uploadFileCallback provided. Using mock file uploader.');
            return {
              success: 1,
              file: {
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                extension: file.name.split('.').pop(),
              },
            };
          };

          if (!readOnly) {
            editorConfig.onChange = onChange;
            editorConfig.tools = {
              header: {
                class: Header as unknown as ToolConstructable,
                inlineToolbar: true,
                config: {
                  levels: [2, 3, 4],
                  defaultLevel: 3,
                },
              },
              paragraph: {
                class: Paragraph as unknown as ToolConstructable,
                inlineToolbar: true,
              },
              list: {
                class: List as unknown as ToolConstructable,
                inlineToolbar: true,
              },
              embed: {
                class: Embed as unknown as ToolConstructable,
                config: {
                  services: {
                    youtube: true,
                    vimeo: true,
                  },
                },
              },
              quote: {
                class: Quote as unknown as ToolConstructable,
                inlineToolbar: true,
              },
              inlineCode: {
                class: InlineCode as unknown as ToolConstructable,
              },
              image: {
                class: Image as unknown as ToolConstructable,
                config: {
                  uploader: {
                    uploadByFile: fileUploadHandler,
                  },
                  captionPlaceholder: 'Image caption',
                  withBorder: true,
                  withBackground: true,
                  stretched: true,
                  // Add a method to handle restoring existing images
                  additionalRequestData: {
                    preserveExistingMedia: true,
                  },
                },
              },
              pdf: {
                class: PDFTool as unknown as ToolConstructable,
                config: {
                  uploader: {
                    uploadByFile: fileUploadHandler,
                  },
                  buttonText: 'Upload a PDF',
                  errorMessage: 'Upload failed',
                },
              },
              video: {
                class: VideoTool as unknown as ToolConstructable,
                config: {
                  uploader: {
                    uploadByFile: fileUploadHandler,
                  },
                },
              },
            };
            editorConfig.placeholder = 'Type / for all elements';
          }

          editorInstance.current = new EditorJS(editorConfig);
        } catch (err) {
          console.error('Failed to initialize Editor.js:', err);
        }
      }
    };

    const destroyEditor = () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };

    // Method to process blocks when saving to preserve media references
    const preserveMediaReferences = (blocks: any[]): any[] => {
      if (!blocks || !Array.isArray(blocks)) return blocks;

      return blocks.map((block) => {
        // For image blocks
        if (block.type === 'image' && block.data?.file) {
          // Make sure to keep signedUrl if it exists
          if (block.data.file.signedUrl) {
            block.data.file = {
              ...block.data.file,
              // Ensure the URL gets saved correctly
              url: block.data.file.url || block.data.file.signedUrl,
            };
          }
        }

        // For video blocks
        if (block.type === 'video' && block.data?.file) {
          if (block.data.file.signedUrl) {
            block.data.file = {
              ...block.data.file,
              url: block.data.file.url || block.data.file.signedUrl,
            };
          }
        }

        // For PDF blocks
        if (block.type === 'pdf' && block.data?.file) {
          if (block.data.file.signedUrl) {
            block.data.file = {
              ...block.data.file,
              url: block.data.file.url || block.data.file.signedUrl,
            };
          }
        }

        return block;
      });
    };

    // Method to get editor content - can be called by parent components
    const save = async (): Promise<EditorContent | null> => {
      if (editorInstance.current) {
        try {
          const savedData = await editorInstance.current.save();

          // Process blocks to preserve media references
          if (savedData && savedData.blocks) {
            savedData.blocks = preserveMediaReferences(savedData.blocks);
          }

          return savedData;
        } catch (err) {
          console.error('Failed to save editor content:', err);
        }
      }
      return null;
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      save,
      destroy: destroyEditor,
    }));

    return (
      <Box
        sx={{
          border: readOnly ? 'none' : '1px solid #eee',
          borderRadius: 1,
          p: readOnly ? 0 : 2,
          mb: 3,
          minHeight: minHeight,
          '& img': {
            maxWidth: '100%',
            borderRadius: 1,
          },
          '& .ce-block__content': {
            maxWidth: '100%',
            margin: '0',
          },
          '& .ce-toolbar__content': {
            maxWidth: '100%',
            margin: '0',
          },
          // Styling for file attachments
          '& .cdx-attaches': {
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #e6e9eb',
          },
          '& .cdx-attaches__file-icon': {
            marginRight: '12px',
          },
          // Styling for video files
          '& .cdx-video': {
            width: '100%',
            borderRadius: '6px',
            overflow: 'hidden',
          },
          // Styling for PDF files
          '& .cdx-pdf': {
            width: '100%',
            borderRadius: '6px',
            border: '1px solid #e6e9eb',
            padding: '12px',
            marginBottom: '15px',
          },
          '& .cdx-pdf__file-info': {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
          },
          '& .cdx-pdf__file-icon': {
            marginRight: '12px',
          },
          '& .cdx-pdf__file-name': {
            fontWeight: 500,
            fontSize: '14px',
            color: '#2d3748',
          },
          '& .cdx-pdf__preview': {
            width: '100%',
            marginBottom: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden',
          },
          '& .cdx-pdf__iframe': {
            width: '100%',
            height: '500px',
            border: 'none',
          },
          '& .cdx-pdf__download-button, & .cdx-pdf__replace-button': {
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#2d3748',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            marginRight: '10px',
            border: 'none',
            '&:hover': {
              backgroundColor: '#cbd5e0',
            },
          },
          '& .cdx-pdf__replace-button': {
            backgroundColor: '#edf2f7',
          },
          // PDF Uploader styles
          '& .cdx-pdf__uploader': {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          },
          '& .cdx-pdf__upload-button': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            backgroundColor: '#4299e1',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            marginBottom: '16px',
            '&:hover': {
              backgroundColor: '#3182ce',
            },
            '& svg': {
              marginRight: '8px',
              fill: 'currentColor',
            },
          },
          '& .cdx-pdf__dropzone': {
            width: '100%',
            minHeight: '200px',
            border: '2px dashed #e2e8f0',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
            cursor: 'pointer',
            marginBottom: '16px',
            '&:hover': {
              borderColor: '#cbd5e0',
              backgroundColor: '#f7fafc',
            },
          },
          '& .cdx-pdf__dropzone--active': {
            borderColor: '#4299e1',
            backgroundColor: '#ebf8ff',
          },
          '& .cdx-pdf__dropzone-text': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#718096',
            '& svg': {
              fill: '#a0aec0',
              marginBottom: '16px',
            },
            '& p': {
              margin: '4px 0',
              fontSize: '14px',
            },
          },
          '& .cdx-pdf__dropzone-hint': {
            fontSize: '12px',
            color: '#a0aec0',
          },
          // Progress bar styles
          '& .cdx-pdf__progress-container': {
            width: '100%',
            marginTop: '16px',
          },
          '& .cdx-pdf__progress-bar': {
            width: '100%',
            height: '10px',
            backgroundColor: '#edf2f7',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '8px',
          },
          '& .cdx-pdf__progress-value': {
            height: '100%',
            backgroundColor: '#4299e1',
            borderRadius: '5px',
            transition: 'width 0.3s ease',
          },
          '& .cdx-pdf__progress-text': {
            fontSize: '12px',
            color: '#718096',
            textAlign: 'center',
          },
        }}
      >
        <div ref={editorRef} style={{ minHeight }}></div>
      </Box>
    );
  }
);

export default EditorComponent;
