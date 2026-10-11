#!/bin/bash

echo "🚀 Installing Cloudinary dependencies..."
echo ""

# Install expo-image-manipulator
echo "📦 Installing expo-image-manipulator..."
npx expo install expo-image-manipulator

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create a Cloudinary account at https://cloudinary.com"
echo "2. Get your Cloud Name from the dashboard"
echo "3. Create an unsigned upload preset named 'pulse_uploads'"
echo "4. Update pulse-socials-backend/.env with:"
echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
echo "   CLOUDINARY_UPLOAD_PRESET=pulse_uploads"
echo "5. Restart the backend server"
echo ""
echo "📖 See CLOUDINARY_SETUP_GUIDE.md for detailed instructions"
