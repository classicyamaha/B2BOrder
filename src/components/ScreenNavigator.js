import React, {
	Component
} from 'react';
import {
	StyleSheet,
	Text,
	View
} from 'react-native';
import {
	createBottomTabNavigator
} from 'react-navigation';
import Order from './Order';
import MainScreen from './mainScreen';
import Icon from 'react-native-vector-icons/Ionicons';

export default createBottomTabNavigator({
	MainScreen: {
		screen: MainScreen,
		navigationOptions: {
			tabBarLabel: 'Order Cart',
			tabBarIcon: ({
				tintColor
			}) => (<Icon name='md-cart' 
            color={tintColor} size={24}/>)
		}
	},
	Order: {
		screen: Order,
		navigationOptions: {
			tabBarLabel: 'Order History',
			tabBarIcon: ({
				tintColor
			}) => (<Icon name='ios-globe' 
            color={tintColor} size={24}/>)
		}
	},

}, {
	tabBarOptions: {
		activeTintColor: 'white',
		inactiveTintColor: 'rgba(104, 195, 163, 1)',
		style: {
			backgroundColor: 'rgba(30, 130, 76, 1)',
			borderTopWidth: 0,
			elevation: 5
		}
	}
});
