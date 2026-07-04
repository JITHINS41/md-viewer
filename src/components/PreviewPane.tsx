import { forwardRef } from 'react';

interface PreviewPaneProps {
  html: string | null;
  onUploadClick: () => void;
}

export const PreviewPane = forwardRef<HTMLDivElement, PreviewPaneProps>(function PreviewPane(
  { html, onUploadClick },
  ref,
) {
  if (html === null) {
    return (
      <div className="preview-section">
        <div ref={ref} id="output">
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p>Upload a markdown file to get started</p>
            <button type="button" className="upload-btn" onClick={onUploadClick}>
              📂 Choose File
            </button>
            <p style={{ fontSize: '0.9em' }}>or drag &amp; drop a file anywhere on this window</p>
            <p style={{ fontSize: '0.9em' }}>Supported formats: .md, .markdown, .txt</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-section">
      <div ref={ref} id="output" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
});
