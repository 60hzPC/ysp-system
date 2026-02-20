# Cloudinary Image Upload Setup 🖼️

## ✅ Why Cloudinary?

- 🆓 **100% Free** - No credit card required!
- ☁️ **25GB Storage** - Free tier
- 📤 **25GB Bandwidth/month** - Free tier
- 🚀 **Fast CDN** - Global delivery
- 🎯 **Easy Setup** - 5 minutes!

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register/free
2. Sign up with email (no credit card needed!)
3. Verify your email
4. Login to dashboard

### Step 2: Get Your Cloud Name

1. In Cloudinary Dashboard
2. Look at the top - you'll see **"Cloud name: xxxxxx"**
3. Copy this cloud name (e.g., "demouser123")

### Step 3: Enable Unsigned Uploads

1. Go to **Settings** (⚙️ icon)
2. Click **Upload** tab
3. Scroll to **Upload presets**
4. Click **Add upload preset**
5. Set these values:
   - **Preset name**: `ysp_projects`
   - **Signing Mode**: Select **"Unsigned"**
   - **Folder**: `ysp-projects` (optional)
6. Click **Save**

### Step 4: Update Your Code

Open `app/dashboard/admin/page.tsx` and find this section:

```typescript
// Cloudinary upload - No API key needed for unsigned uploads!
const cloudName = 'demo'; // Replace with YOUR cloud name
const uploadPreset = 'ml_default'; // Replace with 'ysp_projects'
```

Change to:

```typescript
const cloudName = 'YOUR_CLOUD_NAME'; // e.g., 'demouser123'
const uploadPreset = 'ysp_projects'; // The preset you created
```

### Step 5: Test It!

1. Run your app: `npm run dev`
2. Login as admin
3. Create a project
4. Upload an image
5. Check Cloudinary Dashboard → Media Library
6. Done! 🎉

## 📝 Code Already Configured

The code is **already set up** to work with Cloudinary! Just replace:
- `cloudName` with your cloud name
- `uploadPreset` with your preset name

That's it! No environment variables needed for basic setup.

## 🎯 How It Works

```
Admin uploads → Cloudinary API → Gets URL → Saves to Firestore → Projects page displays
```

**No backend needed!** Direct browser upload to Cloudinary.

## 🔒 Security Note

**Unsigned uploads** are perfect for development and small apps. For production with sensitive content, you might want to use signed uploads (requires backend).

For YSP volunteer projects, unsigned uploads are **perfectly fine** since project images are public anyway!

## 📊 Free Tier Limits

- 🗄️ **Storage**: 25 GB
- 📥 **Bandwidth**: 25 GB/month
- 🖼️ **Transformations**: 25 credits/month
- 📤 **Uploads**: Unlimited!

This is **more than enough** for a volunteer organization!

## 🎨 Optional: Environment Variables (Better Practice)

If you want to keep cloud name in environment variables:

### Update `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ysp_projects
```

### Update code:

```typescript
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
```

## 🆘 Troubleshooting

### "Upload failed"
→ Check your cloud name spelling
→ Make sure upload preset is set to **"Unsigned"**
→ Check browser console for error details

### "Invalid signature"
→ You're using a signed preset, change to unsigned

### "Upload preset not found"
→ Double-check preset name spelling
→ Make sure you created it in Settings → Upload

### Image not showing
→ Check Cloudinary Dashboard → Media Library
→ Verify URL is saved in Firestore
→ Check browser console for CORS errors (shouldn't happen with Cloudinary)

## ✨ Features You Get

- ✅ Drag & drop image upload
- ✅ Image preview before upload
- ✅ Progress bar tracking
- ✅ Automatic image optimization
- ✅ CDN delivery (fast worldwide)
- ✅ Fallback to Unsplash placeholders
- ✅ No credit card required!

## 🎓 Advanced Features (Optional)

Cloudinary can do amazing things:

1. **Auto-resize**: Add `/w_800,h_600,c_fill/` to URL
2. **Auto-format**: Serve WebP to Chrome, JPEG to Safari
3. **Lazy loading**: Load images as user scrolls
4. **Transformations**: Crop, filters, effects
5. **Folders**: Organize by chapter or date

All included in free tier!

## 🔗 Useful Links

- **Dashboard**: https://cloudinary.com/console
- **Documentation**: https://cloudinary.com/documentation
- **Upload Presets**: https://cloudinary.com/documentation/upload_presets
- **Transformations**: https://cloudinary.com/documentation/image_transformations

## 🎯 Summary

1. ✅ Create free Cloudinary account
2. ✅ Get your cloud name
3. ✅ Create unsigned upload preset
4. ✅ Update cloud name in code
5. ✅ Test upload
6. ✅ Enjoy free image hosting!

**No Firebase Storage, no credit card, no problem!** 🚀

---

**Total setup time**: ~5 minutes  
**Cost**: $0 forever (free tier)  
**Credit card**: Not needed!
