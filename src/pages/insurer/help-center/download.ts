
import jsPDF from 'jspdf';

interface Block {
  id: string;
  type:  'paragraph' | 'image' | 'video' | 'header' | 'pdf' | 'quote' | 'list';
  data: {
    text?: string;
    caption?: string;
    file?: {
      signedUrl?: string;
      contentType: string;
    };
  };
}

interface Topic {
  title: string;
  subTitle?: string;
  createdAt: number;
  content?: {
    blocks: Block[];
  };
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

export const handleDownloadClick = (topic: Topic) => {
        const doc = new jsPDF();
        let y = 10;
    
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Title :', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(topic.title, 25, y);
        y += 10;
    
        if (topic.subTitle) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('Subtitle :', 10, y);
          doc.setFont('helvetica', 'normal');
          doc.text(topic.subTitle, 30, y);
          y += 10;
        }
    
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Date :', 10, y);
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(topic.createdAt), 23, y);
        y += 10;
    
        topic.content?.blocks.forEach((block) => {
          y += 10;
          switch (block.type) {
            case 'header':
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(block.data.text || '', 10, y);
              break;
    
            case 'paragraph':
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(12);
              doc.setTextColor(0, 0, 0);
              doc.text(block.data.text || '', 10, y);
              break;
    
            case 'image':
            case 'video': {
              const label = block.type === 'image' ? 'Image' : 'Video';
              const mediaUrl = block.data.file?.signedUrl;
              if (mediaUrl) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 255);
                const linkText = `${label}: ${block.data.caption || 'View media'}`;
                doc.textWithLink(linkText, 10, y, { url: mediaUrl });
              }
              break;
            }
    
            default:
              if (block.data.file?.contentType === 'application/pdf') {
                const pdfUrl = block.data.file?.signedUrl;
                if (pdfUrl) {
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(12);
                  doc.setTextColor(0, 0, 255);
                  const pdfText = `PDF: ${block.data.caption || 'View PDF'}`;
                  doc.textWithLink(pdfText, 10, y, { url: pdfUrl });
                }
              }
              break;
          }
        });
    
        doc.save(`${topic.title || 'topic'}.pdf`);
      };