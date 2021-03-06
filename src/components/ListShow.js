import React, {
	Component
} from 'react';
import {
	View,
	ListView,
	ListViewDataSource,
	StyleSheet,
	TouchableOpacity,
	InteractionManager,
	RefreshControl,
	Animated,
	Dimensions,
	ToastAndroid,
	Platform,
	Alert,
	TextInput
} from 'react-native';
import {
	Container,
	Header,
	Title,
	Content,
	Button,
	Left,
	Right,
	Body,
	Icon,
	Text,
	List,
	ListItem,
	DatePicker,
	Thumbnail,

} from 'native-base';

import { Dialog } from 'react-native-simple-dialogs';
import {
	handleBackButton,
	removeBackButtonHandler
} from './backButton';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
const window = Dimensions.get('window');

class DynamicListRow extends Component {

	_defaultHeightValue = 58;
	_defaultTransition = 500;

	state = {
		_rowHeight: new Animated.Value(this._defaultHeightValue),
		_rowOpacity: new Animated.Value(0)
	};

	componentDidMount() {
		Animated.timing(this.state._rowOpacity, {
			toValue: 1,
			duration: this._defaultTransition
		}).start()

	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.remove) {
			this.onRemoving(nextProps.onRemoving);
		} else {
			this.resetHeight()
		}
	}

	onRemoving(callback) {
		Animated.timing(this.state._rowHeight, {
			toValue: 0,
			duration: this._defaultTransition
		}).start(callback);
	}

	resetHeight() {
		Animated.timing(this.state._rowHeight, {
			toValue: this._defaultHeightValue,
			duration: 0
		}).start();
	}

	render() {
		return (
			<Animated.View
                style={{height: this.state._rowHeight, opacity: this.state._rowOpacity}}>
                {this.props.children}
            </Animated.View>
		);
	}
}

export default class DynamicList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			}),
			refreshing: false,
			rowToDelete: null,
			sheet: true,
			modalVisible:false,
			rocperson:'',
			contact:'',
			chosenDate: new Date()
			
		};
		this.setDate = this.setDate.bind(this);
	}
	setDate(newDate) {
		this.setState({ chosenDate: newDate });
	  }
	/*getauthLevel(){
			
			
			let authUserID= firebase.auth().currentUser.email	
			  result=this.getUserLevelData(authUserID)
			  if(result=='admin'){
			  this.setState({authLevel:'admin'});
			  }else if(result=='operator'){
			  this.setState({authLevel:'operator'});
			  }s
		}
		getUserLevelData(userID){
			fetch('https://rawgit.com/classicyamaha/mbooksdata/master/userAuthLevel.json')
			.then(response => response.json())
			.then((data) => {
			   for(var i = 0; i <= data.length; i++)
				{
					  if(data[i].email == userID)
						  return data[i].auth
				}
				
		
			});
		}*/
	componentWillUnmount() {
		removeBackButtonHandler();
	}

	componentDidMount() {
		handleBackButton(() => {
			this.props.back();
			return true;
		});

		InteractionManager.runAfterInteractions(() => {
			this._loadData()
		});
	}

	_loadData(refresh) {
		refresh && this.setState({
			refreshing: true
		});

		this.dataLoadSuccess({
			data: this.props.list
		});
	}

	dataLoadSuccess(result) {

		this._data = result.data;

		let ds = this.state.dataSource.cloneWithRows(this._data);

		this.setState({
			loading: false,
			refreshing: false,
			rowToDelete: -1,
			dataSource: ds
		});
		console.log(this._data);

	}
	async createPDF(data) {
		var totalAmount = Math.round(this.props.total, 3);
		var today = new Date();
		var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
		var mytable = "<html><body><h1>Order Report - Dated = " + date + "</h1><table cellpadding=\"5\" cellspacing=\"5\"><thead><td>Item Name</td><td>Item Quantity</td></thead><tbody>";
		for (var i = 0; i < data.length; i++) {
			mytable += "<tr>";
			mytable += "<td>" + data[i].selected + "</td>";
			mytable += "<td>" + data[i].weight + "</td>";

			mytable += "<tr>";
		}
		mytable += "<td></td><td></td><td> Total Items: " + totalAmount + "</td><tr></tbody></table></body></html>";
		let options = {
			html: mytable,
			fileName: 'OrderReport' + date,
			directory: 'docs'
		};

		let pdf = await RNHTMLtoPDF.convert(options)
		ToastAndroid.show('Report saved at:' + pdf.filePath, ToastAndroid.LONG);
	}
	addContactDetails(){
		const {rocperson,contact,chosenDate}=this.state;
		if(rocperson=='' && contact==''){
			ToastAndroid.show('Error! Please fill in all details',ToastAndroid.LONG)
		}else{
		let data=this._data;
		this.setState({modalVisible:false});
		
		data.forEach((v)=>{
			
				v.rocperson=rocperson,
				v.contact=contact,
				v.deliverydate=chosenDate
			
			  });
		this.addData(0);}
	}

	render() {
		if (this.state.sheet) {
			return (

				<Container>
				<Header iosStatusbar="light-content"
androidStatusBarColor='rgba(30, 130, 76, 1)' style={{backgroundColor:"rgba(30, 130, 76, 1)"}}>
					<Left>
						<Button transparent onPress={()=>this.props.back()}>
							<Icon name='arrow-back' />
						</Button>
					</Left>
					<Body>
						<Title>Order List</Title>
					</Body>
         		 <Right />
				</Header>
				<Content style={
					{
						padding: 10
					}
				}>
					<View style={styles.addPanel}>
					<Text style={{paddingBottom:5}}>Following list is editabe, you can use 'Confirm Order' for final submission.</Text>
					<Right><Text style={{paddingBottom:20, fontSize:22}}>Total Item:  {this.props.total}</Text>
				</Right>
						<Button block danger 
							onPress={()=> this.setState({modalVisible:true})} >

							<Text style={styles.addButtonText}>Confirm Order</Text>
						</Button> 
					</View>
					<Dialog visible={this.state.modalVisible}
							onTouchOutside={()=>this.setState({modalVisible:false})}
							title= 'Order Confirmation'
							animationType='slide'	
							onRequestClose={()=>this.setState({modalVisible:false})}>
							<View>
							  <TextInput placeholder="POC Name"
              placeholderTextColor='#000'
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={()=>this.passwordInput.focus()}
              style={styles.TextInputStyle}
              value={this.state.rocperson}
              onChangeText={rocperson => this.setState({rocperson})}/>
              <TextInput 
              placeholder="Phone Number"
			  placeholderTextColor='#000'
			  keyboardType="numeric"
              ref={(input)=> this.passwordInput=input}
              style={styles.TextInputStyle}
              value={this.state.contact}
              onChangeText={contact => this.setState({contact})}/>
			<DatePicker
        
            minimumDate={new Date(2016, 1, 1)}
            maximumDate={new Date(2035, 12, 31)}
            locale={"en"}
            timeZoneOffsetInMinutes={undefined}
            modalTransparent={false}
            animationType={"fade"}
            androidMode={"default"}
            placeHolderText="Select Delivery Date"
            textStyle={{ color: "black" }}
            placeHolderTextStyle={{ color: "#black" }}
            onDateChange={this.setDate}
            />
			  <View style={{alignSelf:'center'}}>
              <Button danger onPress={()=> this.addContactDetails()}>
              <Text style={styles.ButtonTextStyle}>Confirm Order</Text></Button>

				<Text style={{fontSize:10, marginTop:5}}>* Delivery Charge of Rs 29. Conditions Apply </Text>                                                                                                                                                                                                                                                                                                                 
				</View>
				</View>		
			</Dialog>
					<ListView
						style={{height:window.height}}
						refreshControl={
							<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this._loadData.bind(this, true)}
							tintColor="#00AEC7"
							title="Loading..."
							titleColor="#00AEC7"
							colors={['#FFF', '#FFF', '#FFF']}
							progressBackg  roundColor="#00AEC7"

							/>
						}
						enableEmptySections={true}
						dataSource={this.state.dataSource}
						renderRow={this._renderRow.bind(this)}
					/>
				</Content>
				
			</Container>
			);
		} else {

			return (
				<Container>
		<Header iosStatusbar="light-content"
androidStatusBarColor='rgba(30, 130, 76, 1)' style={{backgroundColor:"rgba(30, 130, 76, 1)"}}>
			<Left>
				<Button transparent onPress={()=>this.props.back()}>
					<Icon name='arrow-back' />
				</Button>
			</Left>
			<Body>
				<Title>Order List</Title>
			</Body>
		  <Right />
		</Header>
		<Content style={
			{
				padding: 5
			}
		}>
			<View style={styles.addPanel}>
			<Text style={{paddingBottom:20}}>Your order has reached us, here is your summary</Text> 
			<Text style={{fontSize:30}}>Order Summary</Text>
			</View>
		
			<List dataArray={this._data}
            		renderRow={(item) =>
              <ListItem>
				<Icon style={{paddingRight:10, color:'green'}} name="ios-checkmark-circle-outline" />
				<View style={{flexDirection:'column'}}><Left>
                <Text style={{fontSize:18, alignContent:'flex-start'}}>{item.selected}  </Text>
				<Text style={{fontSize:18, alignContent:'flex-start'}}>{item.weight} {item.unit}</Text>
				</Left>
				</View>
              </ListItem>
            }></List>
			</Content>
			
			</Container>
			);
		}

	}

	_renderRow(rowData, sectionID, rowID) {
		return (
			<DynamicListRow
                remove={rowData.uid === this.state.rowToDelete}
                onRemoving={this._onAfterRemovingElement.bind(this)}
            >
                <View style={styles.rowStyle}>

                    <View style={styles.contact}>
                        <Text style={[styles.name]}>{rowData.selected}</Text>
						<Text style={styles.phone}>Weight : {rowData.weight} {rowData.unit} </Text>
						<View style={{flexDirection:'row'}}>
						<Text style={styles.phone}>Remarks: {rowData.marketrate} </Text>
						</View> 
                    </View>
                    <TouchableOpacity style={styles.deleteWrapper} onPress={() => this._deleteItem(rowData.uid,rowData.totalAmt)}>
                        <Icon type="MaterialIcons" name='delete-forever' style={styles.deleteIcon}/>
                    </TouchableOpacity>
                </View>
            </DynamicListRow>
		);
	}
	addData(buttonIndex) {
		if (buttonIndex == 0) {
			var formData = new FormData();
			formData.append("values", JSON.stringify(this._data))
			fetch('https://script.google.com/macros/s/AKfycbzH1s69Rx0ZgAbZfL2L27s9UH6KJR4oPwDsiq7cmDnAW_57IQKw/exec', {
				mode: 'no-cors',
				method: 'post',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				body: formData
			}).then(function(response) {

				ToastAndroid.show('Updated ', ToastAndroid.SHORT)
			}).catch(console.log);
			
			this.setState({
				sheet: false
			});
			fetch('http://www.merimandi.co.in:3025/api/test/addorder', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({data:this._data})
			}).then((response) => {
				if (response.status == 200) {
					this.props.newSession();
					ToastAndroid.show('Updated!', ToastAndroid.LONG)
				}
			}).catch((error) => {
				console.log(error);
			});
			console.log(JSON.stringify({data:this._data}))
		} else if (buttonIndex == 1) {
			var formData = new FormData();
			formData.append("values", JSON.stringify(this._data))
			fetch('https://script.google.com/macros/s/AKfycbyaudxHGu0wkGqPmQRHkGBEHoTJI6-jAPFtERIihearDxsKCEc/exec', {
				mode: 'no-cors',
				method: 'post',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				body: formData
			}).then(function(response) {

				ToastAndroid.show('Updated' + response, ToastAndroid.SHORT)
			}).catch(console.log);
			this.createPDF(this._data);
			this.setState({
				sheet: false
			});
			this.props.newSession();
		} else if (buttonIndex == 2) {
			var formData = new FormData();
			formData.append("values", JSON.stringify(this._data))
			fetch('https://script.google.com/macros/s/AKfycbz34V4CxmqEiSXwvjB2A3u5Wmv6K0nlbwqcQtFLXHSPFiyRct4H/exec', {
				mode: 'no-cors',
				method: 'post',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				body: formData
			}).then(function(response) {

				ToastAndroid.show('Updated' + response, ToastAndroid.SHORT)
			}).catch(console.log);
			this.createPDF(this._data);
			this.setState({
				sheet: false
			});
			this.props.newSession();
		} else if (buttonIndex == 3) {
			var formData = new FormData();
			formData.append("values", JSON.stringify(this._data))
			fetch('https://script.google.com/macros/s/AKfycbz1nK4pdiVadO8GhOGLy7Z3OQJLzvHP1kd2nc59o4JL5XN9htgy/exec', {
				mode: 'no-cors',
				method: 'post',
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				body: formData
			}).then(function(response) {

				ToastAndroid.show('Updated' + response, ToastAndroid.SHORT)
			}).catch(console.log);
			this.createPDF(this._data);
			this.setState({
				sheet: false
			});
			this.props.newSession();
		}
	}

	componentWillUpdate(nextProps, nextState) {
		if (nextState.rowToDelete !== null) {
			this._data = this._data.filter((item) => {
				if (item.uid !== nextState.rowToDelete) {
					return item;
				}
			});
			this.setState({
				rowToDelete: null,
				dataSource: this.state.dataSource.cloneWithRows(this._data)
			});
		}
	}

	_deleteItem(id, amount) {
		this.setState({
			rowToDelete: id
		});
		this.props.delete(id, amount);
	}

	_onAfterRemovingElement() {}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	noData: {
		color: '#000',
		fontSize: 18,
		alignSelf: 'center',
		top: 200
	},

	addPanel: {
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: '#F9F9F9'
	},
	addButton: {
		backgroundColor: '#0A5498',
		width: 120,
		alignSelf: 'flex-end',
		marginRight: 10,
		padding: 5,
		borderRadius: 5
	},
	addButtonText: {
		color: '#fff',
		alignSelf: 'center'
	},

	rowStyle: {
		backgroundColor: '#FFF',
		paddingVertical: 2,
		paddingHorizontal: 5,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1.5,
		flexDirection: 'row'
	},

	rowIcon: {
		width: 30,
		alignSelf: 'flex-start',
		marginHorizontal: 10,
		fontSize: 24
	},

	name: {
		fontWeight: "600",
		color: '#212121',
		fontSize: 16
	},
	phone: {
		color: '#212121',
		fontSize: 14
	},
	contact: {
		width: window.width - 100,
		alignSelf: 'flex-start'
	},

	dateText: {
		fontSize: 10,
		color: '#ccc',
		marginHorizontal: 10
	},
	deleteWrapper: {
		paddingVertical: 2,
		width: 80,
		alignSelf: 'center'
	},
	deleteIcon: {
		fontSize: 24,
		color: '#DA281C',
		alignSelf: 'center'
	}
});
