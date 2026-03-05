import { slugify } from './slugify';

const activityMap: Record<string, string> = {
  "Muito ativo": "alta",
  "Moderadamente ativo": "moderada",
  "Pouca atividade": "leve"
};

export function getIntermediateImage(breed: string | null, activity: string | null): string {
  if (!breed || !activity) return '/images/quiz/intermediate-viralata-moderado.webp';
  
  const breedSlug = slugify(breed);
  const activityKey = activityMap[activity] || 'moderada';
  
  let fileBreed = breedSlug;
  if (breedSlug === 'border-collie') fileBreed = 'border';
  if (breedSlug === 'golden-retriever') fileBreed = 'golden';
  if (breedSlug === 'spitz-alemao') fileBreed = 'spitz';
  if (breedSlug === 'vira-lata-srd') fileBreed = 'viralata';
  
  // Supported breeds for intermediate images based on file list
  const supportedBreeds = ['border', 'golden', 'pinscher', 'shih-tzu', 'spitz', 'viralata', 'yorkshire'];
  
  if (!supportedBreeds.includes(fileBreed)) {
    return '/images/quiz/intermediate-viralata-moderado.webp';
  }

  let suffix = activityKey;
  
  // Fix gender/grammar for specific files
  if (activityKey === 'alta') {
    if (['pinscher', 'viralata'].includes(fileBreed)) suffix = 'alto';
  }
  if (activityKey === 'moderada') {
    if (['golden', 'pinscher', 'spitz', 'viralata', 'yorkshire'].includes(fileBreed)) suffix = 'moderado';
  }

  return `/images/quiz/intermediate-${fileBreed}-${suffix}.webp`;
}
