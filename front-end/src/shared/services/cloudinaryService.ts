export type UploadResult = {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload image to Cloudinary using unsigned upload with upload preset
 * This is the recommended approach for client-side uploads
 *
 * @param file - The image file to upload
 * @param uploadPreset - Optional upload preset name (defaults to env variable)
 * @returns Promise with upload result containing URL or error
 */
export async function uploadImage(file: File, uploadPreset?: string): Promise<UploadResult> {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const preset = uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName) {
      return {
        success: false,
        error: 'Cloudinary cloud name is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in your .env file.'
      }
    }

    if (!preset) {
      return {
        success: false,
        error: 'Cloudinary upload preset is not configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'
      }
    }

    // Create FormData for unsigned upload
    // Note: Only specific parameters are allowed for unsigned uploads
    // Transformations should be configured in the upload preset or applied via URL after upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', preset)
    formData.append('folder', 'alaca/avatars') // Optional: organize uploads in folders

    // Optional: Add tags for better organization
    formData.append('tags', 'avatar,profile')

    // Optional: Add context metadata
    formData.append(
      'context',
      `alt=${encodeURIComponent('User avatar')}|caption=${encodeURIComponent('Profile picture')}`
    )

    // Upload to Cloudinary using unsigned upload endpoint
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error?.message || `Upload failed: ${response.statusText}`
      }
    }

    const data = await response.json()

    // Get the base URL from Cloudinary response
    const baseUrl = data.secure_url || data.url

    if (!baseUrl) {
      return {
        success: false,
        error: 'Upload succeeded but no URL was returned from Cloudinary'
      }
    }

    // Apply transformations via URL if needed
    // This approach works for unsigned uploads - transformations are applied on-the-fly via URL
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    // We can insert transformations before the public_id
    if (data.public_id) {
      // Apply transformations: width 400, height 400, crop fill, gravity face, auto quality, auto format
      const transformations = 'w_400,h_400,c_fill,g_face,q_auto,f_auto'

      // Build transformed URL by inserting transformations into the URL path
      // Original: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{format}
      // Transformed: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/v{version}/{public_id}.{format}
      const urlParts = baseUrl.split('/upload/')
      if (urlParts.length === 2) {
        const transformedUrl = `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`
        return {
          success: true,
          url: transformedUrl
        }
      }
    }

    // Return original URL if transformation insertion failed
    return {
      success: true,
      url: baseUrl
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during upload'
    }
  }
}
