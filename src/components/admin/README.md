# Admin Components

Admin dashboard components for CampkWeb01.

## ImageUploader

React component for uploading and optimizing images with live preview.

### Features

- ✅ File selection with drag & drop support
- ✅ Client-side validation (type, size)
- ✅ Live preview before upload
- ✅ Automatic optimization with Sharp
- ✅ Responsive variants (400px, 800px, 1920px)
- ✅ Blur placeholder generation
- ✅ Size reduction stats
- ✅ Variant preview after upload
- ✅ URL display for easy copying

### Usage

```tsx
import { ImageUploader } from '@/components/admin/image-uploader';

export function VehicleForm() {
  const [imageUrl, setImageUrl] = useState('');

  const handleUploadSuccess = (data) => {
    // Save the optimized image URL
    setImageUrl(data.original.url);

    // Or save all variants
    setImages({
      original: data.original.url,
      thumbnail: data.variants.thumbnail,
      medium: data.variants.medium,
      large: data.variants.large,
      blurPlaceholder: data.blurDataUrl,
    });
  };

  return (
    <div>
      <ImageUploader
        category="vehicle"
        onUploadSuccess={handleUploadSuccess}
        onUploadError={(error) => alert(error)}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `"vehicle" \| "warehouse" \| "hero" \| "general"` | `"general"` | Image category for optimized processing |
| `onUploadSuccess` | `(data) => void` | - | Called after successful upload |
| `onUploadError` | `(error: string) => void` | - | Called on upload error |

### Upload Response

```typescript
{
  success: true,
  message: "Image optimized successfully (78% size reduction)",
  data: {
    original: {
      url: "/uploads/optimized/image-abc123-original.webp",
      width: 1920,
      height: 1080,
      size: 245000
    },
    variants: {
      thumbnail: "/uploads/optimized/image-abc123-thumb.webp",
      medium: "/uploads/optimized/image-abc123-md.webp",
      large: "/uploads/optimized/image-abc123-lg.webp"
    },
    blurDataUrl: "data:image/webp;base64,UklGRi...",
    metadata: {
      filename: "image-abc123-original.webp",
      format: "webp",
      originalSize: 1120000,
      optimizedSize: 245000,
      reductionPercent: 78,
      altText: "Image description",
      category: "vehicle"
    }
  }
}
```

### Validation Rules

- **File types**: JPEG, PNG, WebP, GIF
- **Max size**: 10MB
- **Max dimensions**: 5000×5000px

### Styling

Component uses Tailwind CSS with your existing design system:
- Border radius: `rounded-2xl`
- Colors: `slate-*` palette
- Spacing: Consistent with Button/Alert components

### Dependencies

- `@/components/ui/button` - Upload button
- `@/components/ui/alert` - Error/success messages
- `/api/upload-local` - Server-side optimization endpoint

### Example Integration

```tsx
// In your admin dashboard
import { ImageUploader } from '@/components/admin/image-uploader';

export function VehicleEditor({ vehicle, onUpdate }) {
  return (
    <form>
      <div className="space-y-4">
        <div>
          <label>Vehicle Title</label>
          <input type="text" name="title" />
        </div>

        <div>
          <label>Vehicle Image</label>
          <ImageUploader
            category="vehicle"
            onUploadSuccess={(data) => {
              onUpdate({
                ...vehicle,
                images: [data.original.url, ...vehicle.images],
              });
            }}
          />
        </div>

        {/* Display current images */}
        {vehicle.images?.map((url, i) => (
          <img key={i} src={url} alt={`Vehicle ${i + 1}`} />
        ))}
      </div>
    </form>
  );
}
```

### Advanced: Multiple Images

```tsx
export function GalleryUploader() {
  const [images, setImages] = useState([]);

  const handleUpload = (data) => {
    setImages([...images, {
      id: Date.now(),
      url: data.original.url,
      thumbnail: data.variants.thumbnail,
      blurPlaceholder: data.blurDataUrl,
    }]);
  };

  return (
    <div>
      <ImageUploader
        category="vehicle"
        onUploadSuccess={handleUpload}
      />

      <div className="grid grid-cols-4 gap-4 mt-4">
        {images.map((img) => (
          <div key={img.id} className="relative">
            <img src={img.thumbnail} alt="" />
            <button onClick={() => deleteImage(img.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Troubleshooting

**"Unauthorized" error**:
- User must be logged in
- Check `campkin_session` cookie exists

**"File too large"**:
- Max 10MB
- Resize image before uploading or increase limit in API route

**Upload never completes**:
- Check `/public/uploads/optimized/` directory exists
- Check disk space available
- Check API route timeout (default 30s)

**Images not displaying**:
- URLs should start with `/uploads/` not `/public/uploads/`
- Ensure Next.js dev server is running
- Check browser console for 404 errors
