// Create standalone watermark function
export interface WatermarkOptions {
  logoBase64?: string;
  text?: string;
  opacity?: number; // 0.0 to 1.0
  fontSize?: number; 
  color?: string; // CSS color string
  rotation?: number; // degrees
  repeat?: boolean; // Whether to tile the watermark across the page
}

export const applyWatermark = (doc: any, logoOrOptions: string | WatermarkOptions) => {
  try {
    // Convert string argument to options object
    const options: WatermarkOptions = typeof logoOrOptions === 'string' 
      ? { logoBase64: logoOrOptions, opacity: 0.3 } 
      : { opacity: 0.3, ...logoOrOptions };
    
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    console.log('[Watermark] Starting watermark process with options:', 
      options.text ? { hasText: true, text: options.text.substring(0, 10) + '...' } : 
      { hasLogo: !!options.logoBase64 });
    
    // Calculate logo dimensions (landscape mode)
    const logoWidth = pageWidth * 0.75; // Increased for better visibility
    const logoHeight = logoWidth * 0.75; // Maintain aspect ratio
    
    // Center position
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = (pageHeight - logoHeight) / 2;
    
    // Text watermark function
    const applyTextWatermark = (page: number) => {
      try {
        console.log(`[Watermark] Applying text watermark to page ${page}`);
        
        const text = options.text || 'CONFIDENTIAL';
        const fontSize = options.fontSize || 60; // Default large font size
        const color = options.color || '#888888'; // Default gray color
        const opacity = options.opacity || 0.25; // Default opacity
        const rotation = options.rotation || -45; // Default diagonal rotation
        const repeat = options.repeat || false;
        
        // Parse the color to RGB
        let r = 136, g = 136, b = 136; // Default gray
        if (color.startsWith('#') && color.length >= 7) {
          r = parseInt(color.substring(1, 3), 16);
          g = parseInt(color.substring(3, 5), 16);
          b = parseInt(color.substring(5, 7), 16);
        }
        
        doc.saveGraphicsState();
        doc.setGlobalAlpha(opacity);
        doc.setTextColor(r, g, b);
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "bold");
        
        if (repeat) {
          // Calculate spacing for repeated watermark
          const textWidth = doc.getTextWidth(text);
          const horizontalSpacing = textWidth * 1.5;
          const verticalSpacing = fontSize * 2;
          
          // Calculate rows and columns needed
          const cols = Math.ceil(pageWidth / horizontalSpacing) + 1;
          const rows = Math.ceil(pageHeight / verticalSpacing) + 1;
          
          // Add repeated text watermarks
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const x = col * horizontalSpacing;
              const y = row * verticalSpacing;
              
              doc.saveGraphicsState();
              doc.translate(x, y);
              doc.rotate(rotation);
              doc.text(text, 0, 0);
              doc.restoreGraphicsState();
            }
          }
        } else {
          // Single centered watermark
          doc.saveGraphicsState();
          doc.translate(pageWidth / 2, pageHeight / 2);
          doc.rotate(rotation);
          doc.text(text, 0, 0, { align: 'center' });
          doc.restoreGraphicsState();
        }
        
        doc.restoreGraphicsState();
        return true;
      } catch (err) {
        console.error('[Watermark] Text watermark failed:', err);
        return false;
      }
    };
    
    // Create alternative watermark that should always work
    const createFallbackWatermark = (page) => {
      try {
        console.log(`[Watermark] Creating fallback watermark for page ${page}`);
        
        // Draw colorful background
        doc.setFillColor(247, 148, 62); // Orange color
        doc.setGlobalAlpha(0.3);
        
        // Draw main rectangle
        doc.roundedRect(logoX, logoY, logoWidth, logoHeight, 10, 10, 'F');
        
        // Draw green circle
        doc.setFillColor(75, 181, 92); // Green color
        const circleRadius = logoWidth * 0.2;
        doc.circle(
          logoX + logoWidth * 0.7, 
          logoY + logoHeight * 0.3, 
          circleRadius, 
          'F'
        );
        
        // Add text - both a dollar sign and "MealSync"
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        
        // Dollar sign
        doc.setFontSize(circleRadius * 1.8);
        doc.text("$", logoX + logoWidth * 0.7, logoY + logoHeight * 0.35, { align: 'center' });
        
        // MealSync text
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(logoWidth * 0.15);
        doc.text("MealSync", logoX + logoWidth * 0.5, logoY + logoHeight * 0.6, { align: 'center' });
        
        return true;
      } catch (err) {
        console.error('[Watermark] Fallback watermark failed:', err);
        return false;
      }
    };
    
    let successCount = 0;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      let pageSuccess = false;
      
      // First try text watermark if specified
      if (options.text && !pageSuccess) {
        pageSuccess = applyTextWatermark(i);
        if (pageSuccess) {
          successCount++;
          continue;
        }
      }
      
      // If no logo or text watermark failed, skip the logo attempts
      if (!options.logoBase64) {
        // Try fallback watermark
        pageSuccess = createFallbackWatermark(i);
        if (pageSuccess) {
          console.log(`[Watermark] Fallback watermark succeeded for page ${i}`);
          successCount++;
        }
        continue;
      }
      
      // Method 1: Direct image with high opacity
      if (!pageSuccess) {
        try {
          console.log(`[Watermark] Trying method 1 for page ${i}`);
          doc.saveGraphicsState();
          doc.setGlobalAlpha(options.opacity || 0.3); // Use provided opacity
          
          // Add image directly
          doc.addImage(
            options.logoBase64,
            'PNG',
            logoX,
            logoY,
            logoWidth,
            logoHeight,
            undefined,
            'FAST'
          );
          
          doc.restoreGraphicsState();
          console.log(`[Watermark] Method 1 succeeded for page ${i}`);
          pageSuccess = true;
          successCount++;
        } catch (err) {
          console.error(`[Watermark] Method 1 failed for page ${i}:`, err);
        }
      }
      
      // Method 2: GState approach
      if (!pageSuccess) {
        try {
          console.log(`[Watermark] Trying method 2 for page ${i}`);
          doc.saveGraphicsState();
          const gs = new doc.GState({opacity: options.opacity || 0.35}); // Use provided opacity
          doc.setGState(gs);
          
          // Try with different image format hints
          doc.addImage(
            options.logoBase64,
            'JPEG', // Try JPEG instead of PNG
            logoX,
            logoY,
            logoWidth,
            logoHeight
          );
          
          doc.restoreGraphicsState();
          console.log(`[Watermark] Method 2 succeeded for page ${i}`);
          pageSuccess = true;
          successCount++;
        } catch (err) {
          console.error(`[Watermark] Method 2 failed for page ${i}:`, err);
        }
      }
      
      // Method 3: Base64 parsing
      if (!pageSuccess && options.logoBase64 && options.logoBase64.includes('base64,')) {
        try {
          console.log(`[Watermark] Trying method 3 for page ${i}`);
          const base64Data = options.logoBase64.split('base64,')[1];
          
          doc.saveGraphicsState();
          doc.setGlobalAlpha(options.opacity || 0.3);
          
          // Try with the pure base64 content
          doc.addImage(
            base64Data,
            'PNG',
            logoX,
            logoY,
            logoWidth,
            logoHeight
          );
          
          doc.restoreGraphicsState();
          console.log(`[Watermark] Method 3 succeeded for page ${i}`);
          pageSuccess = true;
          successCount++;
        } catch (err) {
          console.error(`[Watermark] Method 3 failed for page ${i}:`, err);
        }
      }
      
      // Fallback to manually created watermark if all image methods fail
      if (!pageSuccess) {
        pageSuccess = createFallbackWatermark(i);
        if (pageSuccess) {
          console.log(`[Watermark] Fallback watermark succeeded for page ${i}`);
          successCount++;
        }
      }
    }
    
    console.log(`[Watermark] Watermark added to ${successCount} of ${pageCount} pages`);
    return successCount > 0;
  } catch (error) {
    console.error('[Watermark] Master error:', error);
    return false;
  }
}; 