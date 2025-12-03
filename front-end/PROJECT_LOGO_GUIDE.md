# How to Change the Alaca Project Logo

## Quick Setup

### Step 1: Add Your Logo Image

Place your logo file in the `public` folder:
```
front-end/
└── public/
    └── alaca-logo.png  (or .svg, .jpg, etc.)
```

### Step 2: Update the Image Path

In `src/App.tsx`, the logo is already set to use `/alaca-logo.png`. Just make sure your file name matches:

```typescript
<img 
  src="/alaca-logo.png"  // Change this to your logo filename
  alt="Alaca Logo" 
  className="logo-image"
/>
```

## Logo Image Requirements

- **Recommended size**: 40px - 60px height (width will scale proportionally)
- **Format**: 
  - PNG (with transparent background - recommended)
  - SVG (best for logos, scales perfectly)
  - JPG (if no transparency needed)
- **Aspect ratio**: Square or horizontal logos work best
- **Background**: Transparent backgrounds recommended for better appearance

## Customization Options

### Option 1: Image Only (No Text)

If you want just the logo without "Alaca" text:

In `src/App.tsx`, remove or comment out the text:
```typescript
<div className="logo-container">
  <img src="/alaca-logo.png" alt="Alaca Logo" className="logo-image" />
  {/* <span className="logo-text">Alaca</span> */}
</div>
```

### Option 2: Logo with Text (Current Setup)

Keep both logo image and text (current implementation).

### Option 3: Text Only

Remove the image and keep only text:
```typescript
<div className="logo-container">
  <span className="logo-text">Alaca</span>
</div>
```

### Option 4: Custom Logo Size

In `src/App.css`, modify `.logo-image`:

```css
.logo-image {
  width: 50px;    /* Change width */
  height: 50px;   /* Change height */
  object-fit: contain;
}
```

### Option 5: Logo as Clickable Link

Make the logo clickable to go to home page:

```typescript
<a href="/" className="logo-container">
  <img src="/alaca-logo.png" alt="Alaca Logo" className="logo-image" />
  <span className="logo-text">Alaca</span>
</a>
```

## Examples

### Using SVG Logo (Best Quality)

```typescript
<img src="/alaca-logo.svg" alt="Alaca Logo" className="logo-image" />
```

### Using Different Logo Formats

```typescript
// PNG
<img src="/alaca-logo.png" alt="Alaca Logo" className="logo-image" />

// JPG
<img src="/alaca-logo.jpg" alt="Alaca Logo" className="logo-image" />

// SVG (recommended for logos)
<img src="/alaca-logo.svg" alt="Alaca Logo" className="logo-image" />
```

### Using External Logo URL

```typescript
<img src="https://example.com/alaca-logo.png" alt="Alaca Logo" className="logo-image" />
```

## Current Implementation

The current setup includes:
- ✅ Image logo with fallback to SVG icon
- ✅ Logo text "Alaca" next to the image
- ✅ Responsive sizing
- ✅ Automatic fallback if image fails to load

## Troubleshooting

**Logo not showing?**
1. Check file name matches exactly (case-sensitive)
2. Ensure file is in `public/` folder
3. Check browser console for 404 errors
4. Try using full path: `src="/alaca-logo.png"`

**Logo too big/small?**
- Adjust `width` and `height` in `.logo-image` CSS class

**Logo looks blurry?**
- Use SVG format for best quality
- Or use PNG at 2x resolution (80px for 40px display)

