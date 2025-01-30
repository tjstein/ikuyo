import { useEffect } from 'react';

export function DocTitle({ title }: { title: string }) {
  // Something like https://react.dev/reference/react-dom/components/title
  useEffect(() => {
    document.title = title.length > 0 ? `${title} | Ikuyo!` : 'Ikuyo!';
  }, [title]);
  return null;
}
