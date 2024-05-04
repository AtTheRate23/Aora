import { Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen 
        name='sign-in'
        options={{
          // title: 'Sign In',
          headerShown: false
        }}
        />
        <Stack.Screen 
        name='sign-up'
        options={{
          // title: 'Sign In',
          headerShown: false
        }}
        />
      </Stack>

      <StatusBar backgroundColor='#161622' style='light'/>
    </>
  )
}

export default AuthLayout