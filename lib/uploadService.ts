import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const MAX_FILE_SIZE_MB = 10;

export const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need gallery permissions to upload images.');
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
    });

    if (!result.canceled) {
        return result.assets[0];
    }
    return null;
};

export const captureImageWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera permissions to take photos.');
        return null;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
    });

    if (!result.canceled) {
        return result.assets[0];
    }
    return null;
};

export const pickDocument = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
            copyToCacheDirectory: true
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            if (asset.size && asset.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                Alert.alert('File Too Large', `Files must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
                return null;
            }
            return asset;
        }
    } catch (err) {
        Alert.alert('Error', 'Failed to pick document.');
    }
    return null;
};

export const uploadFile = async (uri: string): Promise<string> => {
    // Simulate backend upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // For this mock environment, we return the local URI.
    return uri;
};
