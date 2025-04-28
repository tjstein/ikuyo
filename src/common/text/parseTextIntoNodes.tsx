import { useMemo } from 'react';
import createUrlRegExp from 'url-regex-safe';

export function useParseTextIntoNodes(text: string): React.ReactNode[] {
  return useMemo(() => {
    return parseTextIntoNodes(text);
  }, [text]);
}

export function parseTextIntoNodes(text: string): React.ReactNode[] {
  const urlRegex = createUrlRegExp({
    localhost: false,
    ipv4: false,
    ipv6: false,
  });

  const receivedText = text || '';
  const matchArray = receivedText.matchAll(urlRegex);

  const parts: Array<React.ReactNode> = [];
  let i = 0;
  for (const match of matchArray) {
    const url = match[0];
    if (url) {
      const partBeforeUrl = receivedText.slice(i, match.index);
      parts.push(partBeforeUrl);
      if (!url.startsWith('http')) {
        parts.push(url);
      } else {
        parts.push(
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>,
        );
      }
      i = match.index + url.length;
    }
  }
  parts.push(receivedText.slice(i, receivedText.length));
  return parts;
}
