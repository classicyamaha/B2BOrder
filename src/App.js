import React, {
	Component
} from 'react';
import LoginForm from './components/LoginForm';
import { Root } from 'native-base';

export default class App extends Component {
	

	render() {
		return <Root><LoginForm/></Root>;
	}
}

