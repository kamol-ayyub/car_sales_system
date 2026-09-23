import { CarIcon } from 'lucide-react';
import { useState } from 'react';

interface CarPhotoGalleryProps {
  images: string[];
  label: string;
}

export const CarPhotoGallery = ({ images, label }: CarPhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className='flex aspect-4/3 w-full items-center justify-center rounded-xl border border-dashed bg-muted/40 lg:h-72'>
        <CarIcon
          role='img'
          aria-label={`No photos available for ${label}`}
          className='size-12 text-muted-foreground'
        />
      </div>
    );
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className='overflow-hidden rounded-xl border bg-muted/40'>
      <img
        src={activeImage}
        alt={`${label} photo ${activeIndex + 1} of ${images.length}`}
        className='aspect-4/3 w-full object-cover lg:h-72'
      />
      {images.length > 1 ? (
        <div className='flex gap-2 overflow-x-auto border-t bg-card p-2'>
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type='button'
              aria-pressed={index === activeIndex}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
              className='shrink-0 rounded-md ring-offset-2 ring-offset-background transition-opacity focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none aria-pressed:ring-2 aria-pressed:ring-primary'
            >
              <img
                src={src}
                alt=''
                loading='lazy'
                decoding='async'
                className='size-14 rounded-md object-cover'
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
