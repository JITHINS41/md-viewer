type Keywords = Record<string, string[]>;

// Hand-rolled markdown-to-HTML parser (line-based). Intentionally not a
// spec-compliant parser or real syntax highlighter — ported as-is from the
// original vanilla implementation for behavioral parity.
export class MarkdownParser {
  private keywords: Keywords = {
    javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'async', 'await', 'import', 'export', 'default'],
    python: ['def', 'class', 'return', 'if', 'else', 'for', 'while', 'import', 'from', 'async', 'await', 'with', 'try', 'except'],
    java: ['public', 'private', 'class', 'static', 'void', 'int', 'String', 'new', 'return', 'if', 'else', 'for', 'while'],
    html: ['<', '>', 'DOCTYPE', 'html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'class', 'id'],
  };

  private listEndIndex = 0;

  escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  highlightCode(code: string, language: string): string {
    if (!language) return this.escape(code);

    let highlighted = this.escape(code);
    const keywords = this.keywords[language.toLowerCase()] || [];

    highlighted = highlighted.replace(/(['"`])(.*?)(['"`])/g, (_match, quote, content) => {
      return `<span style="color: #7ec699;">${quote}${content}${quote}</span>`;
    });

    highlighted = highlighted.replace(/\/\/(.*?)(?=\n|$)/g, '<span style="color: #999;">\/\/$1</span>');
    highlighted = highlighted.replace(/\/\*(.*?)\*\//gs, '<span style="color: #999;">/*$1*/</span>');

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span style="color: #ff7b72;">${keyword}</span>`);
    });

    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span style="color: #79c0ff;">$1</span>');

    return highlighted;
  }

  parse(markdown: string): string {
    const lines = markdown.split('\n');
    let html = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        html += '';
        i++;
        continue;
      }

      if (trimmed.startsWith('```')) {
        const language = trimmed.slice(3).trim();
        let code = '';
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          code += lines[i] + '\n';
          i++;
        }
        const highlighted = this.highlightCode(code.slice(0, -1), language);
        html += `<pre><code style="display: block; padding: 15px; background: #2d2d2d; border-radius: 5px; color: #f8f8f2; font-family: 'Monaco', 'Courier New', monospace; overflow-x: auto;">${highlighted}</code></pre>`;
        i++;
        continue;
      }

      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        html += '<hr>';
        i++;
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = this.parseInline(headingMatch[2]);
        html += `<h${level}>${content}</h${level}>`;
        i++;
        continue;
      }

      if (trimmed.startsWith('> ')) {
        let quote = '';
        while (i < lines.length && lines[i].trim().startsWith('> ')) {
          quote += lines[i].trim().slice(2) + '\n';
          i++;
        }
        const content = this.parseInline(quote.trim());
        html += `<blockquote>${content}</blockquote>`;
        continue;
      }

      if (trimmed.match(/^[-*+]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        html += this.parseList(lines, i);
        i = this.listEndIndex;
        continue;
      }

      if (trimmed.includes('|')) {
        const tableResult = this.parseTable(lines, i);
        if (tableResult) {
          html += tableResult.html;
          i = tableResult.endIndex;
          continue;
        }
      }

      html += `<p>${this.parseInline(trimmed)}</p>`;
      i++;
    }

    return html;
  }

  parseInline(text: string): string {
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    text = text.replace(/\*\*\*([^\*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

    text = text.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

    return text;
  }

  parseList(lines: string[], startIndex: number): string {
    let html = '';
    let i = startIndex;
    const isOrdered = !!lines[i].trim().match(/^\d+\./);
    const listTag = isOrdered ? 'ol' : 'ul';
    html += `<${listTag}>`;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      if (!trimmed.match(isOrdered ? /^\d+\./ : /^[-*+]\s+/)) {
        break;
      }

      const content = trimmed.replace(isOrdered ? /^\d+\.\s+/ : /^[-*+]\s+/, '');
      html += `<li>${this.parseInline(content)}</li>`;
      i++;
    }

    html += `</${listTag}>`;
    this.listEndIndex = i;
    return html;
  }

  parseTable(lines: string[], startIndex: number): { html: string; endIndex: number } | null {
    const firstLine = lines[startIndex].trim();
    if (!firstLine.includes('|') || startIndex + 1 >= lines.length) {
      return null;
    }

    const separatorLine = lines[startIndex + 1].trim();
    if (!separatorLine.match(/^\|[\s\-:|]+\|$/)) {
      return null;
    }

    let html = '<table>';
    const headers = firstLine.split('|').map((h) => h.trim()).filter((h) => h);
    html += '<tr>' + headers.map((h) => `<th>${this.parseInline(h)}</th>`).join('') + '</tr>';

    let i = startIndex + 2;
    while (i < lines.length && lines[i].trim().includes('|')) {
      const cells = lines[i].trim().split('|').map((c) => c.trim()).filter((c) => c);
      html += '<tr>' + cells.map((c) => `<td>${this.parseInline(c)}</td>`).join('') + '</tr>';
      i++;
    }

    html += '</table>';
    return { html, endIndex: i };
  }
}
