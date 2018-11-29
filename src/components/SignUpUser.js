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
    Icon
} from 'react-native';
import {Picker} from 'native-base';
//import * as firebase from 'firebase';
import {BackHandler} from 'react-native';

export default class SignUpUser extends Component {
	state = {
		username: '',
		password: '',
		loading: false,
		error: '',
        authUser: null,
        bname:'',
        CommentsList:[],
        email:'',
        formData:[]
    };
    validate = (text) => {
        console.log(text);
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(reg.test(text) === false)
        {
        
        this.setState({email:text})
        return false;
          }
        else {
          this.setState({email:text})
          console.log("Email is Correct");
        }
        }
	componentDidMount(){
        this.getCommentsData();
		
		this.timerComments = setInterval(()=> this.getCommentsData(), 100000);
		BackHandler.addEventListener('hardwareBackPress', () => {
			this.props.onSignup();
			return true;
		 });

	 }
	 componentWillUnmount(){
		 clearInterval(this.timerComments);
		 BackHandler.removeEventListener('hardwareBackPress', () => {});
	 }
	onPressSignUp(){
        const {
            bname,
            username,
            password,
            email,
        }=this.state;
        let formData = '{"name":"'+bname+'","username":"'+username+'","password":"'+password+'","email":"'+email+'","roles":["user"]}';
            fetch('http://www.merimandi.co.in:3025/api/auth/signup',{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formData
            }).then((response)=>{
                if(response.status==200){
                    ToastAndroid.show('User Registered Successfully!',ToastAndroid.LONG)
                    AsyncStorage.setItem('bname',bname)
                    this.props.onSignup();
                }else if (response.status==400){
                    ToastAndroid.show('Username or Email already taken!',ToastAndroid.LONG)
                }else if (response.status==500){
                    ToastAndroid.show('500: Internal Server Error',ToastAndroid.LONG)
                }
                console.log(response.status);
                console.log(formData);
            }).catch((error) => {
                console.log(error);
            });
        
    }
		
	
	
    getCommentsData(){
		
		fetch('https://rawgit.com/classicyamaha/mbooksdata/master/commentsData.json')
		.then(response => response.json())
		.then((data) => {
		  this.setState({CommentsList:data})});
  
	  }

	render() {
		if (this.state.loading) {
			return <View style={styles.logoContainer}>
          <ActivityIndicator style={styles.loading} size="large"/>
        </View>;
		}
			return <KeyboardAvoidingView behavior="padding" style={styles.container} enabled>
       
		<StatusBar
     backgroundColor="rgba(30, 139, 195, 1)"
     barStyle="light-content"
   />
        
        <View style={styles.loginContainer}>
        <Text style={styles.TextStyle}>Customer Orders</Text>
        <Text style={{fontSize:16, color:'black'}}>Sign Up as Business</Text></View>
        <View style={styles.loginContainer}>
        <Text style={styles.BasicTextStyle}>Username:</Text> 
              <TextInput placeholder="username"
              placeholderTextColor='#000'
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={()=>this.passwordInput.focus()}
              style={styles.TextInputStyle}
              value={this.state.username}
              onChangeText={username => this.setState({username})}/>
              <Text style={styles.BasicTextStyle}>Password:</Text> 
              <TextInput 
              placeholder="password"
              placeholderTextColor='#000'
              secureTextEntry
              ref={(input)=> this.passwordInput=input}
              style={styles.TextInputStyle}
              value={this.state.password}
              onChangeText={password => this.setState({password})}/>
              <Text style={styles.BasicTextStyle}>Email:</Text> 
              <TextInput 
              placeholder="email address"
              placeholderTextColor='#000'
              style={styles.TextInputStyle}
              value={this.state.email}
              onChangeText={(text) => this.validate(text)}/>
              <Text style={styles.BasicTextStyle}>Business Name:</Text> 
              <Picker
								style={{ height: 40, width: "100%" , 
                            backgroundColor:'rgba(82, 179, 217, 1)',
                        marginBottom:20}}
						mode='dropdown'
						placeholder='Business name'
                        selectedValue={this.state.bname}
                        onValueChange={(itemValue, itemIndex) => this.setState({ bname: itemValue })} >
                        {this.state.CommentsList.map((item, key) => {
                        return (<Picker.Item label={item.item} value={item.value} key={key} />)})}
                        </Picker>
              <TouchableOpacity style={styles.ButtonStyle} onPress={()=> this.onPressSignUp()}>
              <Text style={styles.ButtonTextStyle}>Create User</Text></TouchableOpacity>
              
			  </View>
      </KeyboardAvoidingView>;
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
    BasicTextStyle:{
        textAlign: 'left',
        fontSize:18,
		color: '#FFF',
		fontWeight: '400'
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
		color: 'rgba(36, 37, 42, 1)'
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
		height: 150
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
