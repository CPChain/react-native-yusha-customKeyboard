import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Keyboard,
  Platform,
  NativeAppEventEmitter,
  NativeModules,
  TextInput,
  findNodeHandle,
  AppRegistry,
  DeviceInfo,
  AppState
} from 'react-native';
import CustomKeyBoardView from './CustomKeyBoardView';

const { CustomKeyboard } = NativeModules;

const {
  install,
  uninstall,
  insertText,
  backSpace,
  doDelete,
  moveLeft,
  moveRight,
  switchSystemKeyboard,
  clearAll,
} = CustomKeyboard;

export {
  install,
  uninstall,
  insertText,
  backSpace,
  doDelete,
  moveLeft,
  moveRight,
  switchSystemKeyboard,
  clearAll,
};

const keyboardTypeRegistry = {};

export const currentHeight = DeviceInfo.isIPhoneX_deprecated ? 286 : 252;

export function addKeyBoardShowListener(listener) {
  if (Platform.OS === 'android') {
    return NativeAppEventEmitter.addListener('showCustomKeyboard', data => {
      listener(data);
    });
  } else {
    Keyboard.addListener('keyboardDidShow', () => {
      listener();
    });
    return 'keyboardDidShow';
  }
}

export function addKeyBoardHideListener(listener) {
  if (Platform.OS === 'android') {
    return NativeAppEventEmitter.addListener('hideCustomKeyboard', data => {
      listener(data);
    });
  } else {
    Keyboard.addListener('keyboardDidHide', () => {
      listener();
    });
    return 'keyboardDidHide';
  }
}

export function removeKeyBoardListener(subscribtion) {
  if (Platform.OS === 'android') {
    NativeAppEventEmitter.removeSubscription(subscribtion);
  } else {
    Keyboard.removeListener(subscribtion);
  }
}

export function register(type, factory) {
  keyboardTypeRegistry[type] = factory;
}

export function clearFocus(tag) {
  Keyboard.dismiss()
  // console.log(tag)
  // TextInput.props.blur(tag)
  // TextInput.State.blurTextInput(tag);
}

// export function doneCallBack(tag) {
//     TextInput.props.doneCallBack(tag)
// }

class CustomKeyboardContainer extends Component {
  render() {
    const { tag, type } = this.props;

    const factory = keyboardTypeRegistry[type];

    if (!factory) {
      console.warn(`Custom keyboard type ${type} not registered.`);
      return null;
    }
    const Comp = factory();

    return <Comp tag={tag} />;
  }
}

AppRegistry.registerComponent('CustomKeyboard', () => CustomKeyboardContainer);

export class CustomTextInput extends Component {
  static propTypes = {
    ...TextInput.propTypes,
    customKeyboardType: PropTypes.string
  };
  constructor() {
    super(...arguments);
    this.state = { text: this.props.defaultValue || '' };
  }
  componentDidMount() {
    this.installTime = setTimeout(() => {
      if (!this.props.useSystemSafeKeyboard) {
        install(findNodeHandle(this.input), this.props.customKeyboardType);
      }

      if (Platform.OS === 'android') {
        this.showSub = addKeyBoardShowListener(this._showKeyboard);
        this.hideSub = addKeyBoardHideListener(this._hideKeyboard);
      }

      AppState.addEventListener('change', this._handleAppStateChange);
    }, 30);
  }
  componentWillUnmount() {
    this.showSub && removeKeyBoardListener(this.showSub);
    this.hideSub && removeKeyBoardListener(this.hideSub);
    this.installTime && clearTimeout(this.installTime);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      //检查键盘
      if (
        TextInput.State.currentlyFocusedInput ? TextInput.State.currentlyFocusedInput() : TextInput.State.currentlyFocusedField() === findNodeHandle(this.input)
      ) {
        TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput ? TextInput.State.currentlyFocusedInput() : TextInput.State.currentlyFocusedField());
        return true;
      }
    }
  };

  static getDerivedStateFromProps(newProps,state) {
    if (
      newProps.value !== null &&
      newProps.value !== undefined &&
      newProps.value !== state.text
    ) {
      return { text: newProps.value }
    }
    else return null
  }

  // componentWillReceiveProps(newProps) {
  //   if (newProps.customKeyboardType !== this.props.customKeyboardType) {
  //     install(findNodeHandle(this.input), newProps.customKeyboardType);
  //   }
  //   if (
  //     newProps.value !== null &&
  //     newProps.value !== undefined &&
  //     newProps.value !== this.state.text
  //   ) {
  //     this.setState({ text: newProps.value });
  //   }
  // }
  onRef = ref => {
    this.input = ref;
    this.props.textInputRef && this.props.textInputRef(ref);
  };

  _showKeyboard = data => {
    if (data.tag !== findNodeHandle(this.input)) return;
    this.props.onFocus && this.props.onFocus();
  };

  _hideKeyboard = data => {
    if (data.tag !== findNodeHandle(this.input)) return;
    this.props.onBlur && this.props.onBlur();
    if (this.props.onEndEditing) {
      this.props.onEndEditing({ nativeEvent: { text: this.state.text } });
    }
  };

  // 内容改变监听
  _onChangeText = text => {
    this.setState({ text });
    this.props.onChangeText && this.props.onChangeText(text);
  };

  // 点击 安全键盘 Done 的回调
  _doneCallBack = () => {
    this.input.blur()
  };

  render() {
    const { customKeyboardType, secureTextEntry, ...others } = this.props;
    let secureTextEntryOption = secureTextEntry
    if (Platform.OS === 'ios' && this.props.useSystemSafeKeyboard) {
      // TODO iOS 系统安全键盘在模拟上使用 detox 调用时不能正常使用，故先忽略
      secureTextEntryOption = false
    }
    return (
      <TextInput
        {...others}
        ref={this.onRef}
        secureTextEntry={secureTextEntryOption}
        onChangeText={this._onChangeText}
        value={this.state.text}
      />
    );
  }
}

export function keyBoardAPI(keyBoardName) {
  return function (KeyBoardView) {
    class KeyBoard extends Component {
      render() {
        return (
          <CustomKeyBoardView
            insertText={insertText}
            clearFocus={clearFocus}
            clearAll={clearAll}
            backSpace={backSpace}
            // doneCallBack={doneCallBack}
            KeyBoardView={KeyBoardView}
            {...this.props}
          />
        );
      }
    }
    register(keyBoardName, () => KeyBoard);
    return KeyBoard;
  };
}
