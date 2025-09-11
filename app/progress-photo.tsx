import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, Check, RotateCw } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProgressPhotoScreen() {
  const [photos, setPhotos] = useState({
    front: null as string | null,
    side: null as string | null,
    back: null as string | null,
  });

  const pickImage = async (type: 'front' | 'side' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos({ ...photos, [type]: result.assets[0].uri });
    }
  };

  const takePhoto = async (type: 'front' | 'side' | 'back') => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos({ ...photos, [type]: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    // Save photos logic here
    console.log('Saving photos:', photos);
    router.back();
  };

  const PhotoSlot = ({ 
    type, 
    label, 
    photo 
  }: { 
    type: 'front' | 'side' | 'back';
    label: string;
    photo: string | null;
  }) => (
    <View style={styles.photoSlot}>
      <Text style={styles.photoLabel}>{label}</Text>
      {photo ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setPhotos({ ...photos, [type]: null })}
          >
            <RotateCw size={16} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.photoPlaceholder}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => Platform.OS === 'web' ? pickImage(type) : takePhoto(type)}
          >
            <Camera size={32} color="#FFD700" />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage(type)}
          >
            <Text style={styles.uploadButtonText}>Choose from Library</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#001F3F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Photos</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={!photos.front || !photos.side || !photos.back}
        >
          <Check 
            size={24} 
            color={photos.front && photos.side && photos.back ? '#FFD700' : '#E0E0E0'} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</Text>
        </View>

        <Text style={styles.instructions}>
          Take photos in consistent lighting and poses for accurate progress tracking
        </Text>

        <View style={styles.photosGrid}>
          <PhotoSlot type="front" label="Front" photo={photos.front} />
          <PhotoSlot type="side" label="Side" photo={photos.side} />
          <PhotoSlot type="back" label="Back" photo={photos.back} />
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Use the same location and lighting each time</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Wear minimal, form-fitting clothing</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Stand in a relaxed, natural pose</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Take photos at the same time of day</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 30,
    lineHeight: 20,
  },
  photosGrid: {
    paddingHorizontal: 20,
    gap: 20,
  },
  photoSlot: {
    marginBottom: 20,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
  },
  retakeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 31, 63, 0.8)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    aspectRatio: 3/4,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cameraButtonText: {
    fontSize: 14,
    color: '#001F3F',
    marginTop: 8,
    fontWeight: '600',
  },
  uploadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
  },
  tipsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 15,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
});