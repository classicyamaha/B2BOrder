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
	TouchableOpacity,
	KeyboardAvoidingView,
	ActivityIndicator,
	Alert,
	AsyncStorage,
	ToastAndroid,
	StatusBar,
	Modal
} from 'react-native';
import SignUpUser from './SignUpUser';
import ScreenNavigator from './ScreenNavigator';
		
/*console.disableYellowBox = true;*/
export default class LoginForm extends Component {

		
	
	state = {
		username: '',
		password: '',
		loading: false,
		error: '',
		authUser: null,
		signup:false,
	};
	componentDidMount() {
		let that = this;
		AsyncStorage.getItem('authUser').then((userToken)=>{
			if(userToken){
				fetch('http://www.merimandi.co.in:3025/api/test/user',{
					method: 'GET',
					headers: {
						'x-access-token':userToken
					}
				}).then((response)=>{
					if(response.status==403){
						AsyncStorage.setItem('authUser', null);
						ToastAndroid.show('Invalid Token, Please login again.', ToastAndroid.LONG);
						return false;
					}else if(response.status==500){
						AsyncStorage.setItem('authUser', null);
						ToastAndroid.show('500 Internal Server Error', ToastAndroid.LONG);
						return false;
					}else if(userToken){
						return response.json()
					}
				}).then((response)=>{
					if(response){
						that.setState({authUser:userToken})
					}else{
						that.setState({authUser:null});
					}
				});
			}
		}).catch(console.error);
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
		

	onPressSignIn=()=> {
		const {
			username,
			password
		} = this.state;
		this.setState({
			loading: true
		})
	
		
		let formData = '{"username":"'+username+'","password":"'+password+'"}';
		fetch('http://www.merimandi.co.in:3025/api/auth/signin',{
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: formData
		}).then((response)=>{
			console.log(response);
			if(response.status==200){
				return response.json();
			}else if (response.status==404){
				this.setState({
					loading: false
				})
				ToastAndroid.show('User Not Found!',ToastAndroid.LONG);
				return false;
			}else if (response.status==401){
				this.setState({
					loading: false
				})
				ToastAndroid.show('Invalid Username Or Password!',ToastAndroid.LONG);
				return false;
			}
		}).then((response)=>{
			if(response){
				
				this.setState({loading:false,authUser: response.accessToken});
				AsyncStorage.setItem('authUser', response.accessToken);
				
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
	onPressSignUp(){
		this.setState({signup:true});
	}

	onPressLogout(){
		AsyncStorage.removeItem('authUser').then(()=>this.setState({authUser:null}));
	}

	onSignup(){
		this.setState({signup:false});
	}

	render() {
		if (this.state.loading) {
			return <View style={styles.logoContainer}>
          <ActivityIndicator style={styles.loading} size="large"/>
        </View>
		;
		}
	    if (this.state.authUser) {
			return <MainScreen onPressLogout={this.onPressLogout.bind(this)}/>;
		} else if(this.state.signup){
			return <SignUpUser onSignup={this.onSignup.bind(this)}/>;
		}else {
			return <KeyboardAvoidingView behavior="padding" style={styles.container} enabled>
        <View style={styles.logoContainer}>
		<StatusBar
     backgroundColor="rgba(30, 139, 195, 1)"
     barStyle="light-content"g
   />
        <Image 
        style={styles.logoStyle}
        source={require('../images/logo.png')}/>
        <Text style={styles.TextStyle}>Customer Orders</Text>
        </View>
        <View style={styles.loginContainer}>
              <TextInput placeholder="username"
              placeholderTextColor='#000'
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={()=>this.passwordInput.focus()}
              style={styles.TextInputStyle}
              value={this.state.username}
              onChangeText={username => this.setState({username})}/>
              <TextInput 
              placeholder="password"
              placeholderTextColor='#000'
              secureTextEntry
              ref={(input)=> this.passwordInput=input}
              style={styles.TextInputStyle}
              value={this.state.password}
              onChangeText={password => this.setState({password})}/>
              <TouchableOpacity style={styles.ButtonStyle} onPress={()=> this.onPressSignIn()}>
              <Text style={styles.ButtonTextStyle}>Log In</Text></TouchableOpacity>
			  <TouchableOpacity  onPress={()=> this.onPressSignUp()}><Text style={{fontSize:15,color:'white', fontWeight:'400'}}>New? Sign Up</Text></TouchableOpacity>
			  <Text style={{color:'black', textAlign:'center'}}>Version: 1.1.0, Sanaur Rahman</Text>
            </View>
      </KeyboardAvoidingView>;
		}
	}
}

const styles = StyleSheet.create({
	loading: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center'
	  },
	ButtonTextStyle: {
		textAlign: 'center',
		color: '#FFF',
		fontWeight: '700'
	},
	ButtonStyle: {
		backgroundColor: 'rgba(1, 50, 67, 1)',
		paddingVertical: 15,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 10
	},
	TextInputStyle: {
		height: 40,
		backgroundColor: 'rgba(82, 179, 217, 1)',
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	loginContainer: {
		padding: 20
	},
	container: {
		flex: 1,
		backgroundColor: 'rgba(30, 139, 195, 1)',
	},
	logoContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flexGrow: 1,
		height: 250
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

	}
});
