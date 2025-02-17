import React from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as TaskManager from 'expo-task-manager';
import { AppLoading } from 'expo';
import { StatusBar } from 'react-native';
import AppNavigator from './screens';
import { LOCATION_TASK, getBackgroundUpdates } from './tasks';
import { Emergencies } from './api';
import { AuthHelpers } from './helpers';

const Root = () => {
	const [fontsLoaded, setFontsLoaded] = React.useState(false);
	const [loggedIn, setLoggedIn] = React.useState(false);

	const preload = async () => {
		const status = await AuthHelpers.checkAuthStatus();
		setLoggedIn(!!status);
	};

	React.useEffect(() => {
		loadAssets();
		loadFonts();
		preload();
		getBackgroundUpdates();
		StatusBar.setBarStyle('light-content');
	}, []);

	const loadFonts = async () => {
		await Font.loadAsync({
			'Rubik Regular': require('../assets/fonts/Rubik-Regular.ttf'),
			'Rubik Medium': require('../assets/fonts/Rubik-Medium.ttf'),
			'Rubik Bold': require('../assets/fonts/Rubik-Bold.ttf')
		});
		setFontsLoaded(true);
	};

	const loadAssets = () => {
		const images = [
			require('../assets/Notify.png'),
			require('../assets/Help_Others.png'),
			require('../assets/Security.png')
		];
		images.map(image => Asset.fromModule(image).downloadAsync());
	};

	if (!fontsLoaded) return <AppLoading />;
	return <AppNavigator {...{ loggedIn }} />;
};

TaskManager.defineTask(LOCATION_TASK, ({ data, error }: any) => {
	if (error) console.log(error);
	if (data) {
		const { locations } = data;
		const {
			coords: { longitude, latitude }
		} = locations[0] as { coords: EmergencyCoordinates };
		// This might not be optimal - We're expending the users mobile data in the background.
		Emergencies.managePushNotifications({ longitude, latitude });
	}
});

export default Root;
