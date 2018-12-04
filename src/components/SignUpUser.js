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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
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
        formData:[],
        obname:''
    };
    validate = () => {
        const {
            username,
            password,
            email,
            bname,
            obname
        }= this.state
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(reg.test(email) === false && username=='' && password=='' && bname=='' && email=='')
        {
        ToastAndroid.show('Error Please fill in all details OR check email id', ToastAndroid.LONG)
        return false;
          }
        else {
            this.setState({email,username,password,bname,obname})
            this.addBname();
            this.onPressSignUp();
            return true;
        }
        }
        addBname=()=>{
            
            const {
                obname,
            }=this.state;
            if(obname){
            console.log(obname)
            let id = Math.floor(1000 + Math.random() * 9000);
            let formData
            formData = '{"item":"'+obname+'","value":"'+obname+'","id":"'+id+'"}';
            fetch('http://www.merimandi.co.in:3025/api/test/addbname',{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formData
            }).then((response)=>{
                if(response.status==200){
                    AsyncStorage.setItem('bname',obname)
                }
            }).catch((error) => {
                console.log(error);
            });}
            
        }
	componentDidMount(){
        this.getCommentsData();
		
		/*this.timerComments = setInterval(()=> this.getCommentsData(), 100000);*/
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
            obname,
            bname,
            username,
            password,
            email,
        }=this.state;
        let formData
        if(obname==''){
             formData = '{"name":"'+bname+'","username":"'+username+'","password":"'+password+'","email":"'+email+'","roles":["user"]}';
    }else{
        formData = '{"name":"'+obname+'","username":"'+username+'","password":"'+password+'","email":"'+email+'","roles":["user"]}';

    }
            fetch('http://www.merimandi.co.in:3025/api/auth/signup',{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formData
            }).then((response)=>{
                console.log(formData)
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
		fetch('http://www.merimandi.co.in:3025/api/test/bname',{
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
            .then((data) => {
                let field='item';
                
               data.sort((a, b) => (a[field] || "").toString().localeCompare((b[field] || "").toString()));
              
              this.setState({CommentsList:data})
            });
        
    } 

    
		
  
	  

	render() {
		if (this.state.loading) {
			return <View style={styles.logoContainer}>
          <ActivityIndicator style={styles.loading} size="large"/>
        </View>;
		}
			return <KeyboardAwareScrollView behavior="padding" style={styles.container}>
       
		<StatusBar
     backgroundColor="rgba(42, 187, 155, 1)"
     barStyle="light-content"
   />
        
        <View style={styles.loginContainer}>
        <Text style={styles.TextStyle}>MeriMandi Orders</Text>
        <Text style={{fontSize:16, color:'black'}}>Sign Up as Business</Text></View>
        <View style={styles.loginContainer}>
        <Text style={styles.BasicTextStyle}>Username:</Text> 
              <TextInput placeholder="username"
              placeholderTextColor='#FFF'
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={()=>this.emailInput.focus()}
              style={styles.TextInputStyle}
              value={this.state.username}
              onChangeText={username => this.setState({username})}/>
              <Text style={styles.BasicTextStyle}>Email:</Text> 
              <TextInput 
              placeholder="email address"
              placeholderTextColor='#FFF'
              style={styles.TextInputStyle}
              value={this.state.email}
              ref={(input)=> this.emailInput=input}
              onSubmitEditing={()=>this.passwordInput.focus()}
              onChangeText={email => this.setState({email})}/>
              <Text style={styles.BasicTextStyle}>Password:</Text> 
              <TextInput 
              placeholder="password"
              placeholderTextColor='#FFF'
              secureTextEntry
              ref={(input)=> this.passwordInput=input}
              style={styles.TextInputStyle}
              value={this.state.password}
              onChangeText={password => this.setState({password})}/>
              
              <Text style={styles.BasicTextStyle}>Business Name:</Text> 
              <Picker
					    style={{ height: 40, width: "100%" , 
                        backgroundColor:'rgba(22, 160, 133, 1)',
                        marginBottom:20, color:'#FFF', borderRadius:8}}
						mode='dropdown'
                        placeholder='Business name'
                        placeholderTextColor='#FFF'
                        selectedValue={this.state.bname}
                        onValueChange={(itemValue, itemIndex) => this.setState({ bname: itemValue })} >
                        {this.state.CommentsList.map((item, key) => {
                        return (<Picker.Item label={item.item} value={item.value} key={key} />)})}
                        </Picker>
                       {this.state.bname =='Other' && <TextInput 
              placeholder="Others please specify"
              placeholderTextColor='#FFF'
              style={styles.TextInputStyle}
              value={this.state.obname}
              onChangeText={obname => this.setState({obname})}/> }
                         
                        
            <View style={{justifyContent:'flex-end'}}>
              <TouchableOpacity style={styles.ButtonStyle} onPress={()=> this.validate()}>
              <Text style={styles.ButtonTextStyle}>Register</Text></TouchableOpacity>
              
			  </View>
              </View>
      </KeyboardAwareScrollView>;
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
		color: '#000',
		fontWeight: '400'
    },
	ButtonTextStyle: {
		textAlign: 'center',
		color: '#FFF',
		fontWeight: '700'
	},
	ButtonStyle: {
		backgroundColor: 'rgba(4, 147, 114, 1)',
		paddingVertical: 15,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 10
	},
	TextInputStyle: {
		height: 40,
		backgroundColor: 'rgba(22, 160, 133, 1)',
		marginBottom: 20,
		paddingHorizontal: 10,
        color: '#FFF',
        borderRadius:8
	},
	loginContainer: {
		padding: 20
	},
	container: {
		flex: 1,
		backgroundColor: 'rgba(42, 187, 155, 1)',
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
