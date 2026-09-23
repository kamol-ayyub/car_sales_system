import { useState } from 'react';

interface CarImagePreviewProps {
  urls: string[];
}

export const CarImagePreview = ({ urls }: CarImagePreviewProps) => {
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(new Set());
  const visibleUrls = urls.filter((url) => !failedUrls.has(url));

  if (visibleUrls.length === 0) {
    return null;
  }

  return (
    <ul className='flex flex-wrap gap-2'>
      {visibleUrls.map((url) => (
        <li key={url}>
          <img
            src={url}
            alt=''
            loading='lazy'
            decoding='async'
            onError={() =>
              setFailedUrls((previous) => new Set(previous).add(url))
            }
            className='size-14 rounded-md border bg-muted/40 object-cover'
          />
        </li>
      ))}
    </ul>
  );
};
