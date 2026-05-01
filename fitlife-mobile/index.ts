import 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';

import App from './App';

/** Native screens + web often show a blank UI; stack falls back to JS navigator. */
if (Platform.OS === 'web') {
  enableScreens(false);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
