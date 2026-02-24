import './video-tool.css';

interface VideoToolData {
  withBorder?: boolean;
  withBackground?: boolean;
  stretched?: boolean;
  file?: {
    url: string;
    docRef: string;
    contentType: string;
    fileName: string;
    extension: string;
    fileCategory: string;
  };
  url?: string;
  docRef?: string;
  extension?: string;
  fileName?: string;
}

interface VideoToolConfig {
  uploader?: {
    uploadByFile: (file: File) => Promise<any>;
  };
}

export default class VideoTool {
  private api: any;
  private readOnly: boolean;
  private block: any;
  private data: VideoToolData;
  private uploader: any;
  private wrapper!: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
  private config: VideoToolConfig;
  private CSS: {
    wrapper: string;
    video: string;
    loading: string;
    error: string;
    notFound: string;
    uploadContainer: string;
    uploadButton: string;
    fileSelect: string;
    fileSelectIcon: string;
  };

  static get isReadOnlySupported(): boolean {
    return true;
  }

  static get toolbox() {
    return {
      title: 'Video',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15 9.5L8 5v9l7-4.5z"/><path d="M2 5h12v10H2V5z" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    };
  }

  constructor({
    api,
    config,
    data,
    block,
    readOnly,
  }: {
    api: any;
    config: VideoToolConfig;
    data: VideoToolData;
    block: any;
    readOnly: boolean;
  }) {
    this.api = api;
    this.readOnly = readOnly;
    this.block = block;

    this.data = {
      withBorder: data.withBorder || false,
      withBackground: data.withBackground || false,
      stretched: data.stretched || false,
      file: data.file || undefined,
    };

    if (!data.file && data.url) {
      this.data.file = {
        url: data.url,
        docRef: data.docRef || '',
        contentType: `video/${data.extension || 'mp4'}`,
        fileName: data.fileName || '',
        extension: data.extension || '',
        fileCategory: 'video',
      };
    }

    this.config = config || {};
    this.uploader = config?.uploader;

    this.CSS = {
      wrapper: 'ce-video',
      video: 'ce-video__content',
      loading: 'ce-video__loading',
      error: 'ce-video__error',
      notFound: 'ce-video__not-found',
      uploadContainer: 'ce-video-tool__upload-container',
      uploadButton: 'ce-video-tool__upload-button',
      fileSelect: 'ce-video-tool__file-select',
      fileSelectIcon: 'ce-video-tool__file-select-icon',
    };
  }

  render(): HTMLElement {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add(this.CSS.wrapper);

    if (this.data.file?.url) {
      this._createVideo(this.data.file.url);
    } else {
      this._showVideoUploader();
    }

    return this.wrapper;
  }

  save(): VideoToolData {
    return {
      withBorder: this.data.withBorder || false,
      withBackground: this.data.withBackground || false,
      stretched: this.data.stretched || false,
      file: this.data.file,
    };
  }

  validate(savedData: VideoToolData): boolean {
    return Boolean(savedData.file?.url);
  }

  renderSettings(): HTMLElement {
    return document.createElement('div');
  }

  private _createVideo(url: string): void {
    const videoContainer = document.createElement('div');
    const video = document.createElement('video');

    videoContainer.classList.add(this.CSS.video);
    video.src = url;
    video.controls = true;
    video.setAttribute('controlsList', 'nodownload');
    video.style.width = '100%';

    this.videoElement = video;
    videoContainer.appendChild(video);
    this.wrapper.appendChild(videoContainer);
  }

  private _showVideoUploader(): void {
    const uploadContainer = document.createElement('div');
    uploadContainer.classList.add(this.CSS.uploadContainer);

    const fileSelector = document.createElement('div');
    fileSelector.classList.add(this.CSS.fileSelect);
    fileSelector.innerHTML = `
      <span class="${this.CSS.fileSelectIcon}">
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 9.5L8 5v9l7-4.5z"/>
          <path d="M2 5h12v10H2V5z" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </span>
      Select a Video
    `;
    fileSelector.addEventListener('click', () => {
      this._uploadVideo();
    });

    uploadContainer.appendChild(fileSelector);

    this.wrapper.appendChild(uploadContainer);
  }

  private _uploadVideo(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/webm,video/ogg,video/quicktime';

    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add(this.CSS.loading);

    input.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;

      if (!target || !target.files || !target.files.length) {
        return;
      }

      const file = target.files[0];

      this.wrapper.innerHTML = '';
      this.wrapper.appendChild(loadingIndicator);

      try {
        const response = await this.uploader.uploadByFile(file);

        if (response.success && response.file) {
          this.data = {
            withBorder: false,
            withBackground: false,
            stretched: false,
            file: {
              url: response.file.url,
              docRef: response.file.docRef,
              contentType: response.file.contentType || `video/${response.file.extension}`,
              fileName: response.file.fileName,
              extension: response.file.extension,
              fileCategory: 'video',
            },
          };

          this.wrapper.innerHTML = '';
          if (this.data.file) {
            this._createVideo(this.data.file.url);
          }
        } else {
          this._handleUploadError(response.error || 'Failed to upload video');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload video';
        this._handleUploadError(errorMessage);
      }
    });

    input.click();
  }

  private _handleUploadError(error: string): void {
    const errorEl = document.createElement('div');
    errorEl.classList.add(this.CSS.error);
    errorEl.textContent = error;

    const retryButton = document.createElement('button');
    retryButton.classList.add(this.CSS.uploadButton);
    retryButton.textContent = 'Try again';
    retryButton.addEventListener('click', () => {
      this.wrapper.innerHTML = '';
      this._showVideoUploader();
    });

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(errorEl);
    this.wrapper.appendChild(retryButton);
  }
}
