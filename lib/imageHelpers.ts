import { slugify } from './slugify';

// List of breeds that have specific images
const breedsWithImages = [
  "akita", "basset-hound", "beagle", "border-collie", "boxer", 
  "bulldog-frances", "bulldog-ingles", "chihuahua", "cocker-spaniel", 
  "dachshund", "doberman", "fila-brasileiro", "golden-retriever", 
  "husky-siberiano", "jack-russell-terrier", "labrador-retriever", 
  "lhasa-apso", "maltes", "pinscher", "poodle", "pug", "rottweiler", 
  "shih-tzu", "spitz-alemao", "yorkshire-terrier"
];

export function getBreedImage(breed: string | null): string {
  if (!breed) return '/images/quiz/breed-golden-retriever.webp';
  
  const slug = slugify(breed);
  if (breedsWithImages.includes(slug)) {
    return `/images/quiz/breed-${slug}.webp`;
  }
  
  // Fallback
  return '/images/quiz/breed-golden-retriever.webp';
}

export function getResultBreedImage(breed: string | null): string {
  if (!breed) return '/images/quiz/result-sdr.webp';
  
  const slug = slugify(breed);
  // Check if result image exists (assuming same list + some extras maybe)
  // The user listed result-breed-X.webp.
  // I'll assume if breed-X exists, result-breed-X likely exists or I use sdr.
  if (breedsWithImages.includes(slug)) {
    return `/images/quiz/result-breed-${slug}.webp`;
  }
  
  return '/images/quiz/result-sdr.webp';
}
