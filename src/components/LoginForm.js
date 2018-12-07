import React, {
	Component
} from 'react';
import MainScreen from './mainScreen';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TextInput,
	TouchableOpacity,ImageBackground,
	ActivityIndicator,
	Alert,
	AsyncStorage,
	ToastAndroid,
	StatusBar,
	Dimensions
} from 'react-native';
import {Button} from 'native-base';
import {
	KeyboardAwareScrollView
} from 'react-native-keyboard-aware-scroll-view';
import SignUpUser from './SignUpUser';
import ScreenNavigator from './ScreenNavigator';
import { ProgressDialog } from 'react-native-simple-dialogs';
/*console.disableYellowBox = true;*/
const window = Dimensions.get('window');
export default class LoginForm extends Component {

	state = {
		username: '',
		password: '',
		loading: false,
		error: '',
		authUser: null,
		signup: false,
	};
	componentDidMount() {
		let that = this;

		AsyncStorage.getItem('authUser').then((userToken) => {
			if (userToken) {
				fetch('http://www.merimandi.co.in:3025/api/test/user', {
					method: 'GET',
					headers: {
						'x-access-token': userToken
					}

				}).then((response) => {
					if (response.status == 403) {
						AsyncStorage.setItem('authUser', null);
						ToastAndroid.show('Invalid Token, Please login again.', ToastAndroid.LONG);
						return false;
					} else if (response.status == 500) {
						AsyncStorage.setItem('authUser', null);
						ToastAndroid.show('500 Internal Server Error', ToastAndroid.LONG);
						return false;
					} else if (userToken) {
						return response.json()
					}
				}).then((response) => {
					if (response) {
						console.log(response)
						AsyncStorage.setItem('bname', response.user.name);
						AsyncStorage.setItem('userid', response.user.email);
						that.setState({
							authUser: userToken
						})

					} else {
						that.setState({
							authUser: null
						});
					}
				});
			}
			console.log(userToken)
		}).catch((error) => {
			ToastAndroid.show('Error! Please check your Internet Connection',ToastAndroid.LONG)
		});
	}

	/*		
			//Save user if auth successful
			firebase.auth().onAuthStateChanged(authUser => {
				authUser
					?
					this.setState({
						authUser
					}) :
					this.setState({
						authUser: null
					});
				if (authUser) {
					AsyncStorage.setItem('authUser', JSON.stringify(authUser));
				}
			});*/

	onPressSignIn = () => {
		const {
			username,
			password
		} = this.state;
		this.setState({
			loading: true
		})

		let formData = '{"username":"' + username + '","password":"' + password + '"}';
		fetch('http://www.merimandi.co.in:3025/api/auth/signin', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: formData
		}).then((response) => {
			console.log(response);
			if (response.status == 200) {
				return response.json();
			} else if (response.status == 404) {
				this.setState({
					loading: false
				})
				ToastAndroid.show('User Not Found!', ToastAndroid.LONG);
				return false;
			} else if (response.status == 401) {
				this.setState({
					loading: false
				})
				ToastAndroid.show('Invalid Username Or Password!', ToastAndroid.LONG);
				return false;
			}
		}).then((response) => {
			if (response) {

				this.setState({
					loading: false,
					authUser: response.accessToken
				});
				AsyncStorage.setItem('authUser', response.accessToken);
				AsyncStorage.setItem('bname', response.user.name);
				AsyncStorage.setItem('userid', response.user.email);

			}
		}).catch((error) => {
			console.log(error);
		});

		/*
		firebase.auth().signInWithEmailAndPassword(username, password).then(() => {
			this.setState({
				loading: false
			});
		}).catch((e) => {
			ToastAndroid.show("User not Found, Creating one...")
			console.log(e);
			firebase.auth().createUserWithEmailAndPassword(username, password).then(() => {
				this.setState({
					loading: false
				});
			}).catch((e) => {
				console.log(e);
				this.setState({
					error: 'Authentication Failure',
					loading: false
				});
				Alert.alert('Error', 'Authentication Failure');
			});
		});*/
	}
	onPressSignUp() {
		this.setState({
			signup: true
		});
	}

	onPressLogout() {
		AsyncStorage.removeItem('authUser').then(() => this.setState({
			authUser: null
		}));
	}

	onSignup() {
		this.setState({
			signup: false
		});
	}

	render() {
		/*if (this.state.loading) {
			return <ProgressDialog
			visible={this.state.loading}
			title="Logging you in"
			message="Please, wait..."
		/>;
		}*/
		if (this.state.authUser) {
			return <ScreenNavigator screenProps={{onPressLogout: this.onPressLogout.bind(this)}}/>;
		} else if (this.state.signup) {
			return <SignUpUser onSignup={this.onSignup.bind(this)}/>;
		} else {
			return 	<ImageBackground resizeMode="cover" source={require('../images/bg-image.png')} style={styles.backgroundContainer}>
			<KeyboardAwareScrollView>
        <View style={styles.logoContainer}>
		<StatusBar
     backgroundColor="white"
     barStyle="light-content"
   />
   
        <Image 
        style={styles.logoStyle}
        source={require('../images/logo.png')}/>
        </View>
        <View style={styles.loginContainer}>
              <TextInput placeholder="username"
              placeholderTextColor='#FFF'
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={()=>this.passwordInput.focus()}
              style={styles.TextInputStyle}
              value={this.state.username}
              onChangeText={username => this.setState({username})}/>
              <TextInput 
              placeholder="password"
              placeholderTextColor='#FFF'
              secureTextEntry
              ref={(input)=> this.passwordInput=input}
              style={styles.TextInputStyle}
              value={this.state.password}
              onChangeText={password => this.setState({password})}/>
			  <View style={{alignSelf:'center'}}>
              <Button style={styles.ButtonStyle} onPress={()=> this.onPressSignIn()}>
              <Text style={styles.ButtonTextStyle}>Log In</Text></Button>
			   </View><TouchableOpacity  onPress={()=> this.onPressSignUp()}><Text style={{fontSize:15,color:'rgba(22, 160, 133, 1)', fontWeight:'600'}}>New? Sign Up</Text></TouchableOpacity>
			 </View>
			  {this.state.loading && <ProgressDialog
			visible={this.state.loading}
			title="Logging you in"
			message="Please, wait..."
		/>}
      </KeyboardAwareScrollView>
	  </ImageBackground>;
		}
	}
}

const styles = StyleSheet.create({
	
	ButtonTextStyle: {
		color: '#FFF',
		fontWeight: '700'
	},
	ButtonStyle: {
		justifyContent:'center',
		width:window.width-100,
		backgroundColor: 'rgba(0, 230, 64, 1)',
		paddingVertical: 15,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 10
	},
	TextInputStyle: {
		height: 40,
		backgroundColor: 'rgba(22, 160, 133, 0.6)',
		marginBottom: 20,
		paddingHorizontal: 10,
		borderRadius: 10,
		color: '#FFF'
	},
	loginContainer: {
		paddingTop:15,
		width:window.width-20,
		padding: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.65)',
		borderRadius:10,
		
	},
	container: {
		flex: 1,
		backgroundColor: 'rgba(162, 222, 208, 1)',
		
	},
	logoContainer: {
		
		alignItems: 'center',
		flexGrow: 1,
		height: 250,
		paddingBottom: 25
	},
	logoStyle: {

		justifyContent: 'center',
		alignItems: 'center',
		width: 250,
		height: 250
	},
	TextStyle: {
		fontSize: 25,
		color: 'rgba(1, 50, 67, 1)',

	},
	backgroundContainer: {
		flex: 1,
		flexDirection: 'column',
		height: null,
		width: null,
		justifyContent: 'center',
		alignItems: 'center'
	}
});
