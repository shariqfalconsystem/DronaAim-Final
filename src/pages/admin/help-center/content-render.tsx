// src/components/common/ContentRenderer.tsx
import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { FiFile, FiDownload } from 'react-icons/fi';

interface EditorBlock {
  id: string;
  type: string;
  data: any;
}

interface Block {
  id: string;
  type: string;
  data: any;
}

interface EditorContent {
  blocks?: Block[];
  time?: number;
  version?: string;
}

interface ListItem {
  content: string;
  items: ListItem[];
  meta: any;
}

const ContentRenderer: any = ({ content }: any) => {
  if (!content?.blocks || !content.blocks.length) {
    return <Typography variant="body2">No content available</Typography>;
  }

  // Function to create a PDF object URL from the signedUrl if needed
  const createPdfViewer = (pdfUrl: string, fileName: string, stretched?: boolean) => {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: stretched ? '100%' : '800px',
          mx: 'auto',
          position: 'relative',
        }}
      >
        <object
          data={`${pdfUrl}`}
          type="application/pdf"
          width="100%"
          height="500px"
          style={{ border: '1px solid #e0e0e0', borderRadius: '4px', display: 'block' }}
        >
          <Box sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="body1" gutterBottom>
              Unable to display PDF directly in browser.
            </Typography>
            <Button
              variant="contained"
              startIcon={<FiDownload />}
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName || 'document.pdf'}
            >
              Download PDF
            </Button>
          </Box>
        </object>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          {fileName}
        </Typography>
      </Box>
    );
  };

  const renderListItem = (item: ListItem, index: number): JSX.Element => {
    return (
      <li key={index}>
        <div dangerouslySetInnerHTML={{ __html: item.content }} />

        {item.items && item.items.length > 0 && (
          <ul>{item.items.map((nestedItem, nestedIndex) => renderListItem(nestedItem, nestedIndex))}</ul>
        )}
      </li>
    );
  };

  return (
    <Box>
      {content.blocks.map((block: EditorBlock) => {
        switch (block.type) {
          case 'header':
            return (
              <Typography key={block.id} variant="subtitle1" sx={{ fontWeight: 600, color: '#003350', mt: 3, mb: 1 }}>
                {block.data.text}
              </Typography>
            );
          case 'paragraph':
            return (
              <Typography
                key={block.id}
                variant="body2"
                sx={{ mb: 2, color: '#003350' }}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );
          case 'list':
            const listStyle = block?.data?.style === 'ordered' ? 'ol' : 'ul';
            const ListComponent = listStyle as keyof JSX.IntrinsicElements;

            return (
              <Box key={block?.id} sx={{ mb: 2, color: '#003350', fontSize: '0.875rem' }}>
                <ListComponent>
                  {block?.data?.items?.map((item: ListItem, index: number) => renderListItem(item, index))}
                </ListComponent>
              </Box>
            );
          case 'image':
            return (
              <Box key={block.id} sx={{ mb: 2, textAlign: 'center' }}>
                <Box
                  component="img"
                  src={block.data.file?.signedUrl || block.data.file?.url}
                  alt={block.data.caption || 'Image'}
                  sx={{
                    display: 'inline-block',
                    maxWidth: block.data.stretched ? '100%' : '800px',
                    width: '100%',
                    mx: 'auto',
                  }}
                />
                {(block.data.caption || block.data.file?.fileName) && (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    {block.data.caption || block.data.file?.fileName}
                  </Typography>
                )}
              </Box>
            );
          case 'quote':
            return (
              <Box
                key={block.id}
                sx={{
                  borderLeft: '3px solid #e0e0e0',
                  pl: 2,
                  py: 1,
                  mb: 2,
                  fontStyle: 'italic',
                }}
              >
                <Typography variant="body2">{block.data.text}</Typography>
                {block.data.caption && (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                    — {block.data.caption}
                  </Typography>
                )}
              </Box>
            );
          case 'video':
            return (
              <Box key={block.id} sx={{ mb: 3, textAlign: block.data.stretched ? 'initial' : 'center' }}>
                <Box
                  component="video"
                  controls
                  width="100%"
                  sx={{
                    borderRadius: 1,
                    bgcolor: '#000',
                    maxHeight: '400px',
                    width: block.data.stretched ? '100%' : '800px',
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                >
                  <source src={block.data.file?.signedUrl} type={block.data.file?.contentType || 'video/mp4'} />
                  Your browser does not support the video tag.
                </Box>
                {(block.data.caption || block.data.file?.fileName) && (
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    {block.data.caption || block.data.file?.fileName}
                  </Typography>
                )}
              </Box>
            );
          case 'pdf':
            // Enhanced PDF rendering for better compatibility
            return (
              <Box key={block.id} sx={{ mb: 3 }}>
                {block.data.file?.contentType === 'application/pdf' ? (
                  createPdfViewer(
                    block.data.file.signedUrl,
                    block.data.file.fileName || 'document.pdf',
                    block.data.stretched
                  )
                ) : (
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                    component="a"
                    href={block.data.file?.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiFile size={24} style={{ marginRight: '12px', color: '#0077cc' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {block.data.file?.fileName || 'Attachment'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {block.data.file?.contentType}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>
            );
          default:
            // Fallback for unsupported block types
            console.warn(`Unsupported block type: ${block.type}`);
            return null;
        }
      })}
    </Box>
  );
};

export default ContentRenderer;
