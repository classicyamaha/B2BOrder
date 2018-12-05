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
	AsyncStorage,
	Alert,
	Modal
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
	FooterTab,
	Footer,
	Badge,
	Subtitle,
	List,
	ListItem
} from 'native-base';
import {
	handleBackButton,
	removeBackButtonHandler
} from './backButton';
//import * as firebase from 'firebase';

const window = Dimensions.get('window');

class DynamicListRow extends Component {

	_defaultHeightValue = 60;
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
		handleBackButton(() => {
			return false
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.remove) {
			this.onRemoving(nextProps.onRemoving);
		} else {
			this.resetHeight()
		}
	}
	componentWillUnmount(){
		removeBackButtonHandler();
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

export default class Order extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			dataSource: new ListView.DataSource({
				rowHasChanged: (row1, row2) => true
			}),
			refreshing: false,
			rowToDelete: null,
			sheet: true,
			orderData: [],
			modalVisible: false,
			modalData: []
		};

	}

	componentDidMount() {

		InteractionManager.runAfterInteractions(() => {
			this._loadData()
		});
	}

	_loadData(refresh) {
		refresh && this.setState({
			refreshing: true
		});
		this.readUserData();
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
	_renderRow(rowData, sectionID, rowID) {

		return (

			<DynamicListRow>
                <View style={styles.rowStyle}>
				
                    <View style={styles.contact}>
						
						<View style={{flexDirection:'column'}}>
                        <Text style={styles.name}>Order ID: {rowData.orderid}</Text>
                        <Text style={styles.phone}>Dated: {rowData.dateCreated}</Text>
						
					</View>		
					<Right><TouchableOpacity onPress={()=>this.getOrderData(rowData)}>
					<Icon style={{fontSize:30, color:'green'}} name="ios-arrow-dropright-circle"/></TouchableOpacity></Right>			
                    </View>
                </View>
            </DynamicListRow>
		);
	}

	getOrderData(rowData) {
		let that = this;
		fetch('http://www.merimandi.co.in:3025/api/test/customerorderdata', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'

				},
				body: '{"orderid":"' + rowData.orderid + '"}'
			}).then(response => response.json())
			.then((data) => {
				that.setState({
					modalVisible: true,
					modalData: data
				})
			});
	}

	readUserData() {
		let that = this;
		AsyncStorage.getItem('userid').then((userid) => {
			fetch('http://www.merimandi.co.in:3025/api/test/orderdata', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'

					},
					body: '{"userid":"' + userid + '"}'
				}).then(response => response.json())
				.then((data) => {
					console.log(data)
					that.dataLoadSuccess({
						data
					});
				});
		});

	}

	render() {
		let that = this;
		return (
			<Container>
				<Header iosStatusbar="light-content"
androidStatusBarColor='rgba(30, 130, 76, 1)' style={{backgroundColor:"rgba(30, 130, 76, 1)"}}>
					<Body>
						
						<Title>Order History</Title>
						<Subtitle>Meri Mandi</Subtitle>
					</Body>
					
				</Header>	
				<Content>
				<ListView
						refreshControl={
							<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this._loadData.bind(this, true)}
							tintColor="#00AEC7"
							title="Loading..."
							titleColor="#00AEC7"
							colors={['#FFF', '#FFF', '#FFF']}
							progressBackgroundColor="#00AEC7"

							/>
						}
						enableEmptySections={true}
						dataSource={this.state.dataSource}
						renderRow={this._renderRow.bind(this)}
					/>
					<Modal visible={this.state.modalVisible}
						animationType='fade' onRequestClose={()=>
							that.setState({modalVisible:false})}>
						<View>
						<Text>Order ID: {this.state.modalData[0] && this.state.modalData[0].orderid}</Text>
						<List dataArray={this.state.modalData}
										renderRow={(item) =>
								<ListItem>
								<View style={{flexDirection:'column'}}>
								<Left>
									<Text style={{fontSize:18, alignContent:'flex-start'}}>{item.product_name}  </Text>
								<Text style={{fontSize:18, alignContent:'flex-start'}}>{item.weight} {item.unit_of_measure}</Text>
								</Left>
								</View>
								</ListItem>
								}></List>
						</View>
					</Modal>
		  </Content>
			</Container>
		);
	}

}

const styles = StyleSheet.create({
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
	},
	subText: {
		paddingHorizontal: 10,
		paddingTop: 2,
		paddingBottom: 2,
		fontSize: 12,
		fontFamily: "sans-serif",

	},
	HeaderText: {
		padding: 10,
		fontWeight: "600",
		fontSize: 22,
		fontFamily: "sans-serif"

	},
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

	rowStylePending: {
		backgroundColor: '#EC644B',
		paddingVertical: 2,
		paddingHorizontal: 5,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		flexDirection: 'row',

	},

	rowStyle: {
		backgroundColor: '#FFF',
		paddingVertical: 2,
		paddingHorizontal: 5,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		flexDirection: 'row',

	},

	rowIcon: {
		width: 30,
		alignSelf: 'flex-start',
		marginHorizontal: 10,
		fontSize: 24
	},

	name: {
		fontWeight: "500",
		color: '#212121',
		fontSize: 20
	},
	phone: {

		color: '#212121',
		fontSize: 16
	},
	contact: {

		flexDirection: 'row',
		width: window.width - 8,
		alignSelf: 'flex-start'
	},

	dateText: {
		fontSize: 10,
		color: '#ccc',
		marginHorizontal: 10
	},
	deleteWrapper: {
		paddingVertical: 5,
		width: 60,
		alignSelf: 'flex-end'
	},
	keepWrapper: {
		paddingVertical: 5,
		width: 60,
		alignSelf: 'center'
	},
	deleteIcon: {
		fontSize: 24,
		color: '#DA281C',
		alignSelf: 'center'
	}
})
