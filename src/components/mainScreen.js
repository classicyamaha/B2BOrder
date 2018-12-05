import React, {
	Component
} from 'react';
import {
	TouchableOpacity,
	StyleSheet,
	Image,
	Alert,
	ToastAndroid,
	Picker,
	AsyncStorage,
	Keyboard,
} from 'react-native';
import ListShow from './ListShow';
import Order from './Order';
import Autocomplete from 'react-native-autocomplete-input';
import {
	Container,
	Header,
	Title,
	Content,
	Card,
	CardItem,
	Button,
	Item,
	Input,
	Left,
	Right,
	Body,
	Icon,
	Text,
	Subtitle

} from 'native-base';
//import * as firebase from 'firebase';

export default class MainScreen extends Component {

	constructor(props) {

		super(props);

		this.state = {
			isLoading: false,
			text: '',
			selected: false,
			amount: '',
			weight: '',
			rate: '',
			marketrate: '',
			totalAmt: 0,
			comments:'',
			pList: [],
			vList: false,
			orderList: false,
			num: 0,
			allData:[],
			unit:'kgs',
			CommentsList:[],
			bname:'',
			userid:''
		};

	}
	
	componentDidMount(){
		let that = this;
		AsyncStorage.getItem('bname').then((bname)=>{
			that.setState({bname})
		})
		AsyncStorage.getItem('userid').then((userid)=>{
			that.setState({userid})
		})
	}


	getData(){
		
	  fetch('https://rawgit.com/classicyamaha/mbooksdata/master/orderprocuredata.json')
      .then(response => response.json())
      .then((data) => {
        this.setState({allData:data})});

	}
	getCommentsData(){
		
		fetch('https://rawgit.com/classicyamaha/mbooksdata/master/commentsData.json')
		.then(response => response.json())
		.then((data) => {
		  this.setState({CommentsList:data})});
  
	  }

	componentWillMount() {
		
	
		/*this.getauthLevel();*/
		/*if(this.state.authLevel=='admin'){*/
		this.getData();
		this.timer = setInterval(()=> this.getData(), 100000);/*}
		else if(this.state.authLevel=='operator'){
		this.getUserLevelData();
		this.timeruser = setInterval(()=> this.getUserLevelData(), 100000);}*/
		this.getCommentsData();
		
		this.timerComments = setInterval(()=> this.getCommentsData(), 100000);
		
	}
	componentWillUnmount(){
		clearInterval(this.timer);
		clearInterval(this.timerComments);
	}

	addtoList() {
		let key = Math.random().toString(36).substr(2);

		const {
			amount,
			weight,
			selected,
			rate,
			bname,
			comments,
			unit,
			userid,
			totalAmt
		} = this.state;
		var today = new Date();
		var timestamp = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate() + '-' + today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
	
		this.setState((prevState) => {
			prevState.pList.push({
				amount: '1',
				weight: weight,
				selected: selected,
				rate: rate,
				comments:bname,
				uid: key,
				unit:unit,
				marketrate:comments,
				UserID:userid,
				timestamp:timestamp
			});
			return prevState;
		});

		this.setState({
			amount: '',
			weight: '',
			rate: '',
			marketrate: '',
			unit:'kgs'
		});
		ToastAndroid.show('Updated', ToastAndroid.SHORT)
		Keyboard.dismiss();
	}
	deleteListData(rowToDelete, num) {
		let {
			totalAmt
		} = this.state
		this.setState((prevState) => {
			prevState.pList = prevState.pList.filter((dataname) => {
				if (dataname.uid !== rowToDelete) {
					return dataname;
				} else {
					prevState.totalAmt = prevState.totalAmt - 1;
				}
			});
			return prevState;
		});
	}

	showList() {
		return <ListShow/>;
	}

	validator() {
		let {

			weight,
			rate,
			totalAmt

		} = this.state;
		this.setState({totalAmt:totalAmt++});

		if(weight >0){
			rate=parseFloat(1/weight);
			this.setState({
				totalAmt
			});
			console.log(totalAmt)
			this.setState({
					weight,
					rate
				},
				() => this.addtoList());
			
		}else {
			ToastAndroid.show('Error! Fill in required quantity!', ToastAndroid.LONG)
		}
/*
		if (amount == '' && weight != '' && rate != '') {
			let result = parseFloat(weight) * rate;
			result = result.toFixed(2);
			amount = "" + result
		} else if (weight == '' && amount != '' && rate != '') {
			let result = parseFloat(amount) / rate;
			result = result.toFixed(2);
			weight = "" + result
		} else if (rate == '' && amount != '' && weight != '') {
			let result = parseFloat(amount) / weight;
			result = result.toFixed(2);
			rate = "" + result
		} else if (selected == "Bhaada" || selected == "Palledari" || selected == "Jalpan") {
			amount = amount
			weight = ""
			rate = ""
		} else {
			return Alert.alert('Error', 'Please check the data');
		}*/
		
		
		
			
	}
	incrementItem=(action)=>{
		const {weight}=this.state;
		if(action=="add"){
			this.setState(prevState => ({ weight: prevState.weight + 1 }));
		}else if(action=="sub"){
			this.setState(prevState => ({ weight: prevState.weight - 1 }));
		}
	}

	newSession() {
		this.setState({
			pList: []
		});
	}

	renderSelected(item) {
		const {
			amount,
			weight,
			selected,
			rate,
			marketrate,
			comments,
			uid,
			allData,
			unit
		} = this.state;
		if (!!!item) {
			return null;
		}
		item = allData.filter((e) => e.label == item)[0];
	
		return <Card>
			<CardItem cardBody>
				<Image source = {{ uri: item.image }} style={style.cardImage} />
			</CardItem>
			<CardItem>
				<Left>
					<Text style={style.inputTextStyle}>{item.label}</Text>
				</Left>
			</CardItem>
			<CardItem cardBody>
				<Content style={
					{
						padding: 10,
						borderTopWidth: 1,
						borderColor: "#dadada"
					}
				}>
					
					<Item style={{flexDirection:'row'}}>
						<Icon type="MaterialCommunityIcons" name="weight-kilogram" />
						<Input
							onChangeText={weight => this.setState({ weight })}
							value={weight}
							keyboardType="numeric" placeholder="Weight" />
						
						<Item>	
            			<Picker
							  selectedValue={unit}
							  mode='dropdown'
  							style={{ height: 50, width: 150 }}
  							onValueChange={(itemValue, itemIndex) => this.setState({unit: itemValue})}>
  							<Picker.Item label="Kilograms" value="kg" />
  							<Picker.Item label="Dozens" value="dz" />
							<Picker.Item label="Pieces" value="pcs" />

						</Picker>
						
					</Item>
					</Item>
					<Item>
						<Icon type="MaterialIcons" name="comment" />
							<Input
							onChangeText={comments => this.setState({ comments })}
							value={comments}
							placeholder="Remarks" />
					</Item>

				</Content>
			</CardItem>
			
			
			
			<CardItem>
		<Content>
					<Button block info onPress={() => this.validator()}>
						<Text>Add to Order</Text>
					</Button>
				</Content>
				
			</CardItem>
			<CardItem>
			<Content style={
					{
						padding: 10,
						borderTopWidth: 1,
						borderColor: "#dadada"
					}
			}> 
			<Button block danger onPress={()=>this.setState({vList:true})}>
						<Text>Generate Report</Text>
					</Button>
			</Content>
			</CardItem>
		</Card>;
	}
	render() {
		if (this.state.orderList) {
			return <Order back={()=> this.setState({orderList:false})} list={this.state.pList} number={this.state.num} />
		} else if (this.state.vList) {
			return <ListShow 
			authLevel={this.state.authLevel}
			list={this.state.pList} 
			back={()=>this.setState({vList:false})} 
			delete={(rowToDelete,totalAmt)=>this.deleteListData(rowToDelete,totalAmt)} 
			total={this.state.totalAmt}
			newSession={()=>this.setState({pList:[],totalAmt:0})}
			 />;
		} else {

			const {
				text,
				selected,
				allData
			} = this.state;
			let data = [];
			if (text.length) {
				data = allData.filter((e) => e.label.toLowerCase().startsWith(text.toLowerCase())).map((e) => e.label);
			}
			return (
				<Container>
				<Header iosStatusbar="light-content"
androidStatusBarColor='rgba(30, 130, 76, 1)' style={{backgroundColor:"rgba(30, 130, 76, 1)"}}>
				
					<Body>
						<Title>Customer Order</Title>
						<Subtitle>Meri Mandi</Subtitle>
					</Body>
					<Right>
						<Button hasText transparent onPress={this.props.screenProps.onPressLogout}>
							<Text> <Icon style={{color:'white', fontSize:16}} type="Entypo" name="log-out"/> Logout</Text>
						</Button>
					</Right>
				</Header>	
				<Content style={
					{
						padding: 10
					}
				}>
				
					<Autocomplete
						style={{height:45}}
						data={data}
						onChangeText={text => text && this.setState({ text })}
						renderItem={item => (
							<TouchableOpacity onPress={() => this.setState({ text: item, selected: item })}>
								<Text style={style.inputTextStyle}>{item}</Text>
							</TouchableOpacity>
						)}
					/>
					{this.renderSelected(selected)}
				</Content>
				
			</Container>
			);
		}
	}

}
const style = StyleSheet.create({
	listText: {
		fontSize: 14
	},
	timeStampStyle: {
		fontSize: 16
	},
	inputTextStyle: {
		fontSize: 22,

	},
	cardImage: {
		height: 200,
		width: null,
		flex: 1
	}
})
