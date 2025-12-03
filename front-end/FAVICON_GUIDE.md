# How to Change the Favicon (Browser Tab Icon)

## Quick Setup

### Step 1: Add Your Favicon File

Place your favicon file in the `public` folder:
```
front-end/
└── public/
    └── favicon.ico  (or favicon.png, favicon.svg)
```

### Step 2: Update the HTML

In `index.html`, update the favicon link:

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

## Current Setup

The favicon is currently set to use `/alaca_logo.png`. 

## Favicon Formats

### Option 1: PNG Favicon (Current)
```html
<link rel="icon" type="image/png" href="/alaca_logo.png" />
```

### Option 2: ICO Favicon (Traditional)
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

### Option 3: SVG Favicon (Modern, Scalable)
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

### Option 4: Multiple Formats (Best Compatibility)
```html
<!-- For modern browsers -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<!-- For older browsers -->
<link rel="icon" type="image/png" href="/favicon.png" />
<!-- For Apple devices -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Favicon Requirements

- **Size**: 
  - ICO: 16x16, 32x32, or 48x48 pixels
  - PNG: 32x32 or 64x64 pixels (recommended)
  - SVG: Any size (scales automatically)
- **Format**: ICO, PNG, or SVG
- **Location**: Must be in the `public/` folder
- **Name**: Can be any name, but `favicon.ico` is standard

## Using Your Alaca Logo as Favicon

Since you already have `alaca_logo.png`, you can:

1. **Use it directly** (current setup):
   ```html
   <link rel="icon" type="image/png" href="/alaca_logo.png" />
   ```

2. **Create a smaller version** for better favicon display:
   - Create a 32x32px version of your logo
   - Save it as `favicon.png` in the `public/` folder
   - Update the HTML:
     ```html
     <link rel="icon" type="image/png" href="/favicon.png" />
     ```

## Creating a Favicon

### Online Tools:
- **Favicon.io**: https://favicon.io/ (Free favicon generator)
- **RealFaviconGenerator**: https://realfavicongenerator.net/ (Comprehensive)
- **Favicon Generator**: https://www.favicon-generator.org/

### From Your Logo:
1. Take your `alaca_logo.png`
2. Resize it to 32x32px or 64x64px
3. Save as `favicon.png` or `favicon.ico`
4. Place in `public/` folder
5. Update `index.html`

## Testing

After changing the favicon:
1. Save the file
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Check the browser tab - the icon should update

**Note**: Browsers cache favicons aggressively. You may need to:
- Clear browser cache
- Use incognito/private mode
- Wait a few minutes for cache to expire

## Current Configuration

The favicon is currently set to:
```html
<link rel="icon" type="image/png" href="/alaca_logo.png" />
<link rel="apple-touch-icon" href="/alaca_logo.png" />
```

This uses your Alaca logo as both the browser tab icon and Apple touch icon.

