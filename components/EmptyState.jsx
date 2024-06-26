import { View, Text, Image } from 'react-native'
import React from 'react'

import { images } from '../constants'
import CustomButton from './CustomButton'
import { router } from 'expo-router'

const EmptyState = ({ title, subtitle, path, btnTitle }) => {
    return (
        <View className="justify-center items-center px-4">
            <Image
                source={images.empty}
                className="h-[250px] w-[270px]"
                resizeMode='contain'
            />
            <Text className="text-xl font-psemibold text-center text-white">
                {title}
            </Text>
            <Text className="text-sm font-pmedium text-gray-100">{subtitle}</Text>

            <CustomButton
                title={btnTitle}
                handlePress={() => router.push(path)}
                containerStyles="w-full my-5"
            />
        </View>
    )
}

export default EmptyState