import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Image as ImageIcon } from 'lucide-react';

interface ScreenshotViewerProps {
  screenshotUrl?: string;
  alt?: string;
  maxHeight?: number | string;
  borderRadius?: number | string;
}

/**
 * Robust screenshot viewer component
 * - Displays image if available and valid
 * - Shows placeholder if missing or broken
 * - Never renders broken image icon
 */
export function ScreenshotViewer({
  screenshotUrl,
  alt = 'Step screenshot',
  maxHeight = 420,
  borderRadius = 16,
}: ScreenshotViewerProps) {
  const [imageError, setImageError] = useState(false);

  // If no URL or image failed to load, show placeholder
  if (!screenshotUrl || imageError) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: maxHeight,
          borderRadius: `${borderRadius}px`,
          backgroundColor: '#F3F4F6',
          border: '1px dashed rgba(0, 0, 0, 0.1)',
          padding: '32px 24px',
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
          sx={{ textAlign: 'center', maxWidth: '100%' }}
        >
          <Box
            sx={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ImageIcon size={24} style={{ color: '#6B7280' }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
              }}
            >
              No screenshot available
            </Typography>
            <Typography
              sx={{
                fontSize: '12px',
                color: '#9CA3AF',
                mt: '4px',
              }}
            >
              Screenshot will appear here once captured
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  // Convert BASE64 or handle screenshot data
  let imageSrc = screenshotUrl;
  
  // If the screenshot is BASE64 or raw image data without prefix, add it
  if (typeof screenshotUrl === 'string') {
    if (screenshotUrl.startsWith('data:')) {
      // Already has data URI prefix
      imageSrc = screenshotUrl;
    } else if (screenshotUrl.length > 100 && !screenshotUrl.startsWith('http')) {
      // Likely BASE64 encoded - add the data URI prefix
      imageSrc = `data:image/png;base64,${screenshotUrl}`;
    }
  }

  console.log('[ScreenshotViewer] Rendering image:', { original: screenshotUrl, prepared: imageSrc });

  // Render image with error handling
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: maxHeight,
        borderRadius: `${borderRadius}px`,
        backgroundColor: '#F3F4F6',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '16px',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={alt}
        onError={() => {
          console.warn('[ScreenshotViewer] Image failed to load:', imageSrc);
          setImageError(true);
        }}
        sx={{
          maxHeight: `${typeof maxHeight === 'number' ? maxHeight : maxHeight}px`,
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: '12px',
        }}
      />
    </Box>
  );
}
