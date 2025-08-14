const BEST_IMG_BY_TYPE = {
  channel: ['None', 'providerPremiumSub'],
  provider: ['bob'],
  zone: ['Poster'],
  movie: ['Poster', 'Banner'],
  series: ['Banner'],
  app: ['Poster'],
}

// Preferred aspect ratios for each media type
const BEST_ASPECT_RATIO_BY_TYPE = {
  channel: ['16:9'],
  provider: ['16:9'],
  zone: ['2:3'], // Poster aspect ratio first, then widescreen
  movie: ['16:9'], // Poster aspect ratio first, then widescreen
  series: ['16:9'], // Widescreen first for banners, then poster
  app: ['4:3'], // Apps prefer 4:3 aspect ratio
}

const getPreferredImage = (mediaType, images, userSelectedImageType = null, userSelectedAspectRatio = null, title = null) => {
  // If user has explicitly selected filters, prioritize those
  if ((userSelectedImageType && userSelectedImageType !== "any image type") || 
      (userSelectedAspectRatio && userSelectedAspectRatio !== "any aspect ratio")) {
    let candidateImages = images;

    // Filter by user-selected image type if specified
    if (userSelectedImageType && userSelectedImageType !== "any image type") {
      candidateImages = candidateImages.filter(img => {
        if (userSelectedImageType === "epg") {
          return img.type.indexOf("epg") > -1;
        }
        return img.type === userSelectedImageType;
      });
    } else if (userSelectedAspectRatio && userSelectedAspectRatio !== "any aspect ratio") {
      // If only aspect ratio is selected, still respect preferred image types for the media type
      if (Object.keys(BEST_IMG_BY_TYPE).includes(mediaType)) {
        const preferredTypes = BEST_IMG_BY_TYPE[mediaType];
        candidateImages = candidateImages.filter(img => preferredTypes.includes(img.type));
      }
    }

    // Filter by user-selected aspect ratio if specified
    if (userSelectedAspectRatio && userSelectedAspectRatio !== "any aspect ratio") {
      candidateImages = candidateImages.filter(img => img.aspectRatio === userSelectedAspectRatio);
    }

    if (candidateImages.length > 0) {
      return candidateImages[0].path;
    }
  }  // Fall back to preferred image logic when no specific user selection
  if (Object.keys(BEST_IMG_BY_TYPE).includes(mediaType)) {
    const preferredTypes = BEST_IMG_BY_TYPE[mediaType];
    const preferredAspectRatios = BEST_ASPECT_RATIO_BY_TYPE[mediaType] || [];

    // Special logic for movies: prioritize 16:9 aspect ratio across all types
    if (mediaType === 'movie' && preferredAspectRatios.includes('16:9')) {
      // First try: 16:9 Poster
      const poster16x9 = images.find(img =>
        img.type === 'Poster' && img.aspectRatio === '16:9'
      );
      if (poster16x9) {
        return poster16x9.path;
      }

      // Second try: 16:9 Banner (if no 16:9 poster found)
      const banner16x9 = images.find(img =>
        img.type === 'Banner' && img.aspectRatio === '16:9'
      );
      if (banner16x9) {
        return banner16x9.path;
      }
    }

    // Default logic for other media types or if no 16:9 images found
    // Try to find image that matches both preferred type AND preferred aspect ratio
    for (const preferredType of preferredTypes) {
      for (const preferredAspectRatio of preferredAspectRatios) {
        const perfectMatch = images.find(img =>
          img.type === preferredType && img.aspectRatio === preferredAspectRatio
        );
        if (perfectMatch) {
          return perfectMatch.path;
        }
      }
    }

    // If no perfect match, fall back to preferred type (any aspect ratio)
    const preferredImg = images.find(img => preferredTypes.includes(img.type));
    if (preferredImg) {
      return preferredImg.path;
    }
  }  return images[0]?.path;

}

export default getPreferredImage;