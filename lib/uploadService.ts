import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const MAX_FILE_SIZE_MB = 5;

export const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (!result.canceled) {
        const asset = result.assets[0];

        // 1. Validate File Type (JPG/PNG)
        const fileExtension = asset.uri.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        if (!allowedExtensions.includes(fileExtension || '')) {
            Alert.alert('Invalid File Type', 'Only JPG and PNG images are allowed.');
            return null;
        }

        // 2. Validate File Size (Simulated for this environment)
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
            Alert.alert('File Too Large', `Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
            return null;
        }

        return asset.uri;
    }

    return null;
};

export const uploadFile = async (uri: string): Promise<string> => {
    // Simulate backend upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For this mock environment, we return the local URI so the picked image actually displays.
    // In a real app, this would be a remote URL from S3/Cloudinary.
    return uri;
};
