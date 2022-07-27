/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {Text, SafeAreaView, StatusBar, useColorScheme} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
require('./js/RegisterKeyboard');
import * as CustomKeyboard from '@cpchain-tools/react-native-keyboard';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text testID="welcome">welcome</Text>

      <CustomKeyboard.AwareCusKeyBoardScrollView style={{flex: 1}}>
        <CustomKeyboard.CustomTextInput
          customKeyboardType="numberKeyBoard"
          placeholder="numberKeyBoard"
          style={{marginTop: 20}}
        />
        <CustomKeyboard.CustomTextInput
          customKeyboardType="numberKeyBoardWithDot"
          placeholder="numberKeyBoardWithDot"
        />
        <CustomKeyboard.CustomTextInput
          customKeyboardType="safeKeyBoard"
          placeholder="safeKeyBoard"
        />
        <CustomKeyboard.CustomTextInput
          customKeyboardType="testKeyboard"
          placeholder="testKeyboard"
        />

        <CustomKeyboard.CustomTextInput
          useSystemSafeKeyboard={true}
          customKeyboardType="safeKeyBoard"
          placeholder="system Keyboard"
        />
      </CustomKeyboard.AwareCusKeyBoardScrollView>
    </SafeAreaView>
  );
};

export default App;
