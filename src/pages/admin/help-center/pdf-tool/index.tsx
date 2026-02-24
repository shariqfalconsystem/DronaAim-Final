// src/components/common/pdf-tool.ts
import Attaches from '@editorjs/attaches';

interface UploadResponse {
  success: number;
  file: {
    url?: string;
    signedUrl?: string;
    name?: string;
    size?: number;
    extension?: string;
    fileCategory?: string;
    [key: string]: any;
  };
  error?: string;
}

interface PDFToolData {
  file?: {
    url?: string;
    signedUrl?: string;
    name?: string;
    fileName?: string;
    size?: number;
    extension?: string;
    fileCategory?: string;
    [key: string]: any;
  };
}

interface PDFToolConfig {
  uploader?: {
    uploadByFile: (file: File) => Promise<UploadResponse>;
  };
  [key: string]: any;
}

interface PDFToolAPI {
  notifier: {
    show: (options: { message: string; style: string }) => void;
  };
  [key: string]: any;
}

interface PDFToolNodes {
  wrapper: HTMLElement | null;
  selectButton: HTMLElement | null;
  fileInfo: HTMLElement | null;
  preview: HTMLElement | null;
}

export default class PDFTool extends Attaches {
  data: PDFToolData;
  api: PDFToolAPI;
  config: PDFToolConfig;
  nodes: PDFToolNodes;
  uploadingProgress: number;

  static get toolbox() {
    return {
      title: 'PDF',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }

  constructor({ data, api, config }: { data: PDFToolData; api: PDFToolAPI; config: PDFToolConfig }) {
    super({ data, api, config });
    this.data = data || {};
    this.api = api;
    this.config = config || {};
    this.nodes = {
      wrapper: null,
      selectButton: null,
      fileInfo: null,
      preview: null,
    };
    this.uploadingProgress = 0;
  }

  render(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('cdx-pdf');
    this.nodes.wrapper = container;

    if (this.data && this.data.file && this.data.file.url) {
      this.renderFilePreview(container);
    } else {
      this.renderSelector(container);
    }

    return container;
  }

  renderFilePreview(container: HTMLElement): void {
    // Clear container first
    container.innerHTML = '';

    // Create file info container
    const fileInfo = document.createElement('div');
    fileInfo.classList.add('cdx-pdf__file-info');
    this.nodes.fileInfo = fileInfo;

    // Create icon
    const icon = document.createElement('div');
    icon.classList.add('cdx-pdf__file-icon');
    icon.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#E2574C" d="M21.6,0H2.4C1.08,0,0,1.08,0,2.4v19.2C0,22.92,1.08,24,2.4,24h19.2c1.32,0,2.4-1.08,2.4-2.4V2.4C24,1.08,22.92,0,21.6,0z"/><path fill="#FFFFFF" d="M7.432,15.427c0.182,0,0.323,0.020,0.44,0.062v1.108c-0.102,0.052-0.296,0.078-0.575,0.078c-0.226,0-0.404-0.058-0.533-0.175c-0.13-0.117-0.195-0.292-0.195-0.525c0-0.229,0.069-0.408,0.207-0.535C6.913,15.316,7.132,15.427,7.432,15.427z"/><path fill="#FFFFFF" d="M12.195,15.447c0.175,0,0.312,0.022,0.412,0.068v1.12c-0.115,0.052-0.27,0.078-0.47,0.078c-0.36,0-0.54-0.183-0.54-0.548C11.599,15.7,11.797,15.447,12.195,15.447z"/><path fill="#FFFFFF" d="M14.652,15.427c0.173,0,0.309,0.023,0.407,0.07v1.108c-0.111,0.051-0.261,0.078-0.453,0.078c-0.364,0-0.547-0.183-0.547-0.548C14.058,15.689,14.256,15.427,14.652,15.427z"/><path fill="#FFFFFF" d="M16.12,19.833h-9V4.167h9v3.049h3.047v12.617H16.12V19.833z M7.573,17.545c-0.31-0.288-0.466-0.683-0.466-1.182c0-0.51,0.172-0.917,0.516-1.225c0.343-0.308,0.807-0.461,1.389-0.461c0.206,0,0.396,0.016,0.568,0.045c0.173,0.03,0.375,0.084,0.608,0.161c0.025,0.585,0.066,0.979,0.123,1.342h-0.727c-0.045-0.38-0.122-0.572-0.233-0.572c-0.397,0-0.595,0.211-0.595,0.631c0,0.404,0.245,0.605,0.736,0.605c0.043,0,0.087-0.003,0.128-0.008c0.042-0.006,0.081-0.013,0.117-0.022v-0.303h-0.349V16.22h1.109v1.27c-0.097,0.054-0.22,0.104-0.369,0.146c-0.285,0.082-0.57,0.123-0.853,0.123C8.289,17.759,7.882,17.688,7.573,17.545z M11.948,17.78c-0.387,0-0.696-0.117-0.93-0.35c-0.232-0.234-0.349-0.548-0.349-0.946c0-0.477,0.156-0.861,0.469-1.151c0.312-0.29,0.717-0.441,1.215-0.441c0.171,0,0.337,0.019,0.499,0.056c0.16,0.037,0.293,0.077,0.396,0.119v1.476c0,0.31-0.118,0.563-0.353,0.759c-0.234,0.195-0.548,0.293-0.944,0.293c-0.075,0-0.155-0.006-0.24-0.019c-0.085-0.013-0.153-0.025-0.204-0.039v-0.431c0.051,0.018,0.118,0.033,0.199,0.047c0.081,0.015,0.155,0.022,0.223,0.022c0.212,0,0.376-0.047,0.489-0.143c0.114-0.094,0.171-0.224,0.171-0.391v-0.249c-0.048,0.011-0.09,0.02-0.128,0.025s-0.084,0.008-0.14,0.008C12.095,16.425,11.964,16.395,11.948,17.78z M16.145,17.78c-0.385,0-0.695-0.117-0.93-0.35c-0.232-0.234-0.349-0.548-0.349-0.946c0-0.477,0.156-0.861,0.469-1.151c0.312-0.29,0.717-0.44,1.212-0.44c0.168,0,0.334,0.018,0.497,0.054c0.163,0.037,0.296,0.077,0.401,0.119v1.476c0,0.31-0.118,0.563-0.353,0.759c-0.235,0.195-0.548,0.293-0.944,0.293c-0.075,0-0.155-0.006-0.24-0.019c-0.085-0.013-0.153-0.025-0.204-0.039v-0.431c0.051,0.018,0.117,0.033,0.199,0.047c0.082,0.015,0.155,0.022,0.222,0.022c0.212,0,0.375-0.047,0.489-0.143c0.114-0.094,0.171-0.224,0.171-0.391v-0.249c-0.047,0.011-0.09,0.02-0.128,0.025c-0.038,0.006-0.083,0.008-0.14,0.008C16.291,16.425,16.16,16.395,16.145,17.78z"/></svg>';

    // Create file name
    const fileName = document.createElement('div');
    fileName.classList.add('cdx-pdf__file-name');
    fileName.textContent = this.data.file?.fileName || 'PDF document';

    // Append icon and file name to file info
    fileInfo.appendChild(icon);
    fileInfo.appendChild(fileName);
    container.appendChild(fileInfo);

    // Create PDF preview container with iframe for viewing the PDF
    const previewContainer = document.createElement('div');
    previewContainer.classList.add('cdx-pdf__preview');
    this.nodes.preview = previewContainer;

    const pdfPreview = document.createElement('iframe');
    pdfPreview.classList.add('cdx-pdf__iframe');
    pdfPreview.src = this.data.file?.url || '';
    pdfPreview.setAttribute('width', '100%');
    pdfPreview.setAttribute('height', '500px');
    pdfPreview.setAttribute('frameborder', '0');
    pdfPreview.setAttribute('title', 'PDF Preview');

    previewContainer.appendChild(pdfPreview);
    container.appendChild(previewContainer);

    // Add "Replace PDF" button
    const replaceButton = document.createElement('button');
    replaceButton.classList.add('cdx-pdf__replace-button');
    replaceButton.textContent = 'Replace PDF';
    replaceButton.addEventListener('click', () => {
      this.renderSelector(container);
    });

    container.appendChild(replaceButton);
  }

  renderSelector(container: HTMLElement): void {
    // Clear container first
    container.innerHTML = '';

    // Create selector container with centered content
    const selectorContainer = document.createElement('div');
    selectorContainer.classList.add('cdx-pdf__selector');
    selectorContainer.style.display = 'flex';
    selectorContainer.style.flexDirection = 'column';
    selectorContainer.style.alignItems = 'center';
    selectorContainer.style.justifyContent = 'center';
    selectorContainer.style.padding = '30px';
    selectorContainer.style.border = '1px dashed #ccc';
    selectorContainer.style.borderRadius = '8px';
    selectorContainer.style.textAlign = 'center';
    selectorContainer.style.backgroundColor = '#fafafa';

    // Create select button
    const selectButton = document.createElement('div');
    selectButton.classList.add('cdx-pdf__select-button');
    selectButton.style.display = 'flex';
    selectButton.style.alignItems = 'center';
    selectButton.style.justifyContent = 'center';
    selectButton.style.cursor = 'pointer';
    selectButton.style.color = '#666';
    selectButton.style.fontSize = '14px';
    selectButton.style.gap = '8px';
    this.nodes.selectButton = selectButton;

    // Add icon
    const iconSvg = document.createElement('div');
    iconSvg.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
    `;

    // Add text
    const selectText = document.createElement('span');
    selectText.textContent = 'Select a PDF';

    selectButton.appendChild(iconSvg);
    selectButton.appendChild(selectText);

    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,application/pdf';
    fileInput.style.display = 'none';

    // When selectButton is clicked, trigger fileInput
    selectButton.addEventListener('click', () => {
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;

      if (!target.files || !target.files[0]) {
        return;
      }

      const file = target.files[0];

      if (file.type !== 'application/pdf') {
        this.api.notifier.show({
          message: 'Only PDF files are allowed',
          style: 'error',
        });
        return;
      }

      this.uploadFile(file);
    });

    // Add progress container (hidden initially)
    const progressContainer = document.createElement('div');
    progressContainer.classList.add('cdx-pdf__progress-container');
    progressContainer.style.display = 'none';
    progressContainer.style.width = '100%';
    progressContainer.style.marginTop = '20px';

    const progressBar = document.createElement('div');
    progressBar.classList.add('cdx-pdf__progress-bar');
    progressBar.style.width = '100%';
    progressBar.style.height = '8px';
    progressBar.style.backgroundColor = '#eee';
    progressBar.style.borderRadius = '4px';
    progressBar.style.overflow = 'hidden';

    const progressValue = document.createElement('div');
    progressValue.classList.add('cdx-pdf__progress-value');
    progressValue.style.width = '0%';
    progressValue.style.height = '100%';
    progressValue.style.backgroundColor = '#4299e1';
    progressValue.style.borderRadius = '4px';
    progressValue.style.transition = 'width 0.3s ease';

    const progressText = document.createElement('div');
    progressText.classList.add('cdx-pdf__progress-text');
    progressText.style.fontSize = '12px';
    progressText.style.color = '#666';
    progressText.style.marginTop = '6px';
    progressText.style.textAlign = 'center';
    progressText.textContent = 'Uploading... 0%';

    progressBar.appendChild(progressValue);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);

    selectorContainer.appendChild(selectButton);
    selectorContainer.appendChild(fileInput);
    selectorContainer.appendChild(progressContainer);
    container.appendChild(selectorContainer);
  }

  uploadFile(file: File): void {
    // Show progress
    const selectorContainer = this.nodes.wrapper?.querySelector('.cdx-pdf__selector');
    const selectButton = this.nodes.wrapper?.querySelector('.cdx-pdf__select-button');
    const progressContainer = this.nodes.wrapper?.querySelector('.cdx-pdf__progress-container');
    const progressValue = this.nodes.wrapper?.querySelector('.cdx-pdf__progress-value') as HTMLElement;
    const progressText = this.nodes.wrapper?.querySelector('.cdx-pdf__progress-text') as HTMLElement;

    if (progressContainer) {
      (progressContainer as HTMLElement).style.display = 'block';
    }

    // Hide the select button during upload
    if (selectButton) {
      (selectButton as HTMLElement).style.display = 'none';
    }

    // Simulate progress updates (in a real app, you would use the actual upload progress)
    this.uploadingProgress = 0;
    const progressInterval = setInterval(() => {
      if (this.uploadingProgress < 90) {
        this.uploadingProgress += 10;
        if (progressValue) {
          progressValue.style.width = `${this.uploadingProgress}%`;
        }
        if (progressText) {
          progressText.textContent = `Uploading... ${this.uploadingProgress}%`;
        }
      }
    }, 300);

    // Use the uploader from config
    if (this.config.uploader && typeof this.config.uploader.uploadByFile === 'function') {
      this.config.uploader
        .uploadByFile(file)
        .then((response) => {
          clearInterval(progressInterval);

          if (progressValue) {
            progressValue.style.width = '100%';
          }
          if (progressText) {
            progressText.textContent = 'Upload complete!';
          }

          setTimeout(() => {
            if (response.success && response.file) {
              // Store the uploaded file data
              this.data = {
                file: {
                  ...response.file,
                  fileCategory: 'pdf',
                },
              };

              // Render the PDF preview
              if (this.nodes.wrapper) {
                this.renderFilePreview(this.nodes.wrapper);
              }
            } else {
              this.api.notifier.show({
                message: response.error || 'Upload failed',
                style: 'error',
              });
              if (this.nodes.wrapper) {
                this.renderSelector(this.nodes.wrapper);
              }
            }
          }, 500);
        })
        .catch((error) => {
          clearInterval(progressInterval);
          console.error('Error uploading PDF:', error);
          this.api.notifier.show({
            message: 'Upload failed',
            style: 'error',
          });
          if (this.nodes.wrapper) {
            this.renderSelector(this.nodes.wrapper);
          }
        });
    } else {
      clearInterval(progressInterval);
      console.warn('No uploader provided in the config');
      this.api.notifier.show({
        message: 'Upload configuration is missing',
        style: 'error',
      });
      if (this.nodes.wrapper) {
        this.renderSelector(this.nodes.wrapper);
      }
    }
  }

  save(blockContent: HTMLElement): PDFToolData {
    // If we have data, return it
    if (this.data && this.data.file) {
      return this.data;
    }

    // Otherwise, try to use the parent class's save method
    const parent = super.save(blockContent) as PDFToolData;

    // Mark this as a PDF type for special handling
    if (parent && parent.file) {
      parent.file.fileCategory = 'pdf';
    }

    return parent;
  }

  // Support for pasting URLs that are PDFs
  onPaste(event: ClipboardEvent): PDFToolData | void {
    const result = super.onPaste(event) as PDFToolData | void;

    if (result && result.file) {
      result.file.fileCategory = 'pdf';
    }

    return result;
  }

  // Add CSS styles specific to the PDF tool
  static get pasteConfig() {
    return {
      patterns: {
        file: /https?:\/\/\S+\.pdf$/i,
      },
    };
  }

  static get CSS() {
    return {
      baseClass: 'cdx-pdf',
      fileInfo: 'cdx-pdf__file-info',
      fileIcon: 'cdx-pdf__file-icon',
      fileName: 'cdx-pdf__file-name',
      preview: 'cdx-pdf__preview',
      iframe: 'cdx-pdf__iframe',
      replaceButton: 'cdx-pdf__replace-button',
      selector: 'cdx-pdf__selector',
      selectButton: 'cdx-pdf__select-button',
      progressContainer: 'cdx-pdf__progress-container',
      progressBar: 'cdx-pdf__progress-bar',
      progressValue: 'cdx-pdf__progress-value',
      progressText: 'cdx-pdf__progress-text',
    };
  }
}
