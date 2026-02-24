// EditorConfig.tsx
import EditorJS, { ToolConstructable } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import InlineCode from '@editorjs/inline-code';
import Image from '@editorjs/image';
import Attaches from '@editorjs/attaches';
import PDFTool from '../pdf-tool';

export interface EditorInitOptions {
  holder: HTMLDivElement;
  handleFileUpload: (file: File) => Promise<any>;
  handleEditorChange: () => void;
  onReady: () => void;
  VideoTool: any;
}

export function initializeEditorJS({
  holder,
  handleFileUpload,
  handleEditorChange,
  onReady,
  VideoTool,
}: EditorInitOptions): EditorJS {
  return new EditorJS({
    holder: holder,
    tools: {
      header: {
        class: Header as any,
        inlineToolbar: true,
        config: { levels: [2, 3, 4], defaultLevel: 3 },
      },
      paragraph: { class: Paragraph as any, inlineToolbar: true },
      list: { class: List as any, inlineToolbar: true },
      embed: {
        class: Embed as any,
        config: { services: { youtube: true, vimeo: true } },
      },
      quote: { class: Quote as any, inlineToolbar: true },
      inlineCode: { class: InlineCode as any },
      image: {
        class: Image as any,
        config: {
          uploader: {
            uploadByFile: async (file: File) => {
              return handleFileUpload(file);
            },
          },
        },
      },
      video: {
        class: VideoTool as any,
        config: {
          uploader: {
            uploadByFile: async (file: File) => {
              return handleFileUpload(file);
            },
          },
        },
      },
      pdf: {
        class: PDFTool as unknown as ToolConstructable,
        config: {
          uploader: {
            uploadByFile: async (file: File) => {
              return handleFileUpload(file);
            },
          },
          buttonText: 'Upload a PDF',
          errorMessage: 'Upload failed',
        },
      },
    },
    placeholder: 'Type / for all elements',
    onChange: handleEditorChange,
    onReady: onReady,
  });
}
