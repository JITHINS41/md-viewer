// Wraps every case-insensitive occurrence of `query` inside `root`'s text
// nodes in a <mark class="search-highlight">, walking only text nodes so the
// existing rendered HTML structure is never disturbed.
export function highlightTextNodes(root: Element, query: string): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  const lowerQuery = query.toLowerCase();
  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue ?? '';
    const lowerText = text.toLowerCase();
    if (!lowerText.includes(lowerQuery)) return;

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let idx: number;
    while ((idx = lowerText.indexOf(lowerQuery, lastIndex)) !== -1) {
      if (idx > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, idx)));
      }
      const mark = document.createElement('mark');
      mark.className = 'search-highlight';
      mark.textContent = text.slice(idx, idx + query.length);
      frag.appendChild(mark);
      lastIndex = idx + query.length;
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  });
}
