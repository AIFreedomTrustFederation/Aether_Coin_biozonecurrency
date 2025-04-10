import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Book, FileText, Download, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface WhitepaperSection {
  id: string;
  title: string;
  filename: string;
  description: string;
}

interface WhitepaperTOC {
  title: string;
  updated: string;
  sections: WhitepaperSection[];
}

const WhitepaperBrowser: React.FC = () => {
  const [toc, setToc] = useState<WhitepaperTOC | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch TOC on component mount
  useEffect(() => {
    const fetchTOC = async () => {
      try {
        const response = await fetch('/whitepaper/toc.json');
        if (!response.ok) throw new Error('Failed to load whitepaper TOC');
        const data = await response.json();
        setToc(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading whitepaper TOC:', error);
        setLoading(false);
      }
    };

    fetchTOC();
  }, []);

  // Fetch section content when selected
  useEffect(() => {
    if (!selectedSection) return;

    const fetchSectionContent = async () => {
      try {
        setLoading(true);
        const section = toc?.sections.find(s => s.id === selectedSection);
        if (!section) throw new Error('Section not found');

        const response = await fetch(`/whitepaper/${section.filename}`);
        if (!response.ok) throw new Error('Failed to load section content');
        
        const content = await response.text();
        setMarkdownContent(content);
        setLoading(false);
      } catch (error) {
        console.error('Error loading section content:', error);
        setLoading(false);
      }
    };

    fetchSectionContent();
  }, [selectedSection, toc]);

  // Handle back navigation
  const handleBack = () => {
    setSelectedSection(null);
    setMarkdownContent('');
  };

  // Generate PDF download link
  const downloadPDF = () => {
    // This is a placeholder - in production, you would generate a PDF on the server
    // and provide a download link to it
    alert('PDF generation will be implemented in a future release. For now, you can view each section individually.');
  };

  // Selection of a section
  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  if (loading && !toc) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Book className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-medium">Loading whitepaper...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {selectedSection ? (
        <div>
          <div className="mb-8 flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="flex items-center text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Table of Contents
            </button>
            
            <div className="flex gap-4">
              <a 
                href={`/whitepaper/${toc?.sections.find(s => s.id === selectedSection)?.filename}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </div>
          </div>
          
          {loading ? (
            <div className="w-full py-24 flex items-center justify-center">
              <div className="animate-pulse text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-medium">Loading section content...</h3>
              </div>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">{toc?.title}</h1>
            <p className="text-muted-foreground">Last updated: {toc?.updated}</p>
            
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={downloadPDF}
                className="flex items-center text-primary hover:text-primary/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Complete PDF
              </button>
              
              <a 
                href="/whitepaper/complete.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:text-primary/80"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Complete Markdown
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toc?.sections.map((section) => (
              <div 
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <p className="text-muted-foreground mb-4">{section.description}</p>
                <div className="text-primary flex items-center mt-auto">
                  <span>Read section</span>
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhitepaperBrowser;