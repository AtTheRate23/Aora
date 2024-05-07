import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../../components/FormField'
import { Video, ResizeMode } from 'expo-av'
import { icons } from '../../constants'
import CustomButton from '../../components/CustomButton'
import * as DocumentPicker from 'expo-document-picker'
import { router } from 'expo-router'
import { createVideo } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    prompt: '',
    thumbnail: null,
    video: null
  })

  const openPicker = async (selectType) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: selectType === 'image' ?
          ['image/png', 'image/jpg', 'image/jpeg'] :
          ['video/mp4', 'video/gif']
      })

      console.log('res', res)

      if (!res.canceled) {
        if (selectType === 'image') {
          setForm({
            ...form,
            thumbnail: res.assets[0]
          })
        }

        if (selectType === 'video') {
          setForm({
            ...form,
            video: res.assets[0]
          })
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err
      }
    }
  }

  const submit = async () => {
    if (!form.prompt || !form.thumbnail || !form.title || !form.video) {
      return Alert.alert('Please fill all the fields')
    }

    setUploading(true);

    try {
      await createVideo({
        ...form,
        userId: user.$id
      })

      Alert.alert('Succes', "Post uploaded successfully")
      router.push('/home')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setForm({
        title: '',
        prompt: '',
        thumbnail: null,
        video: null
      })

      setUploading(false)
    }
  }

  return (
    <SafeAreaView
      className="bg-primary h-full"
    >
      <ScrollView className="px-4 my-6">
        <Text
          className="text-2xl text-white font-psemibold"
        >
          Upload videos
        </Text>
        <FormField
          title="Video title"
          value={form.title}
          placeholder="Give your video a catch title..."
          handleChangeText={(e) => setForm({
            ...form,
            title: e
          })}
          otherStyles="mt-8"
        />

        <View
          className="mt-7 space-y-2"
        >
          <Text
            className="text-base text-gray-100 font-pmedium"
          >
            Upload video
          </Text>
          <TouchableOpacity
            onPress={() => openPicker('video')}
          >
            {
              form.video ? (
                <Video
                  source={{ uri: form.video.uri }}
                  className="w-full h-64 rounded-2xl"
                  resizeMode={ResizeMode.COVER}
                />
              ) : (
                <View
                  className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center"
                >
                  <View
                    className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center"
                  >
                    <Image
                      source={icons.upload}
                      className="w-1/2 h-1/2"
                      resizeMode='contain'
                    />
                  </View>
                </View>
              )
            }
          </TouchableOpacity>
        </View>

        <View
          className="mt-7 space-y-2"
        >
          <Text
            className="text-base text-gray-100 font-pmedium"
          >
            Thumbnail Image
          </Text>
          <TouchableOpacity
            onPress={() => openPicker('image')}
          >
            {
              form.thumbnail ? (
                <Image
                  source={{ uri: form.thumbnail.uri }}
                  className="w-full h-64 rounded-2xl"
                  resizeMode='cover'
                />
              ) : (
                <View
                  className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2"
                >
                  <Image
                    source={icons.upload}
                    className="w-5 h-5"
                    resizeMode='contain'
                  />
                  <Text
                    className="text-sm text-gray-100 font-pmedium"
                  >
                    Choose a file
                  </Text>
                </View>
              )
            }
          </TouchableOpacity>
        </View>
        <FormField
          title="AI Prompt"
          value={form.prompt}
          placeholder="The prompt you used to create this video"
          handleChangeText={(e) => setForm({
            ...form,
            prompt: e
          })}
          otherStyles="mt-7"
        />

        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Create