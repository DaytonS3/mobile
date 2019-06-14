import React from 'react';

import {
	View,
	Text,
	TextInput,
	StyleSheet,
	CheckBox,
	Image,
	TouchableWithoutFeedback,
	AsyncStorage
} from 'react-native';
import DismissKeyboard from 'dismissKeyboard';
import KeyboardSpacer from 'react-native-keyboard-spacer';

export default class MyProfile extends React.Component {
	constructor(props) {
		super(props);
		this.fetchUser();
		this.state = {
			firstname: '',
			lastname: '',
			email: '',
			phonenumber: '',
			anonymous: true,
			user: ''
		};
	}
	static navigationOptions = {
		title: 'Edit Profile',
		headerTransparent: true
	};

	fetchUser = async () => {
		const first = await AsyncStorage.getItem('firstname');
		const last = await AsyncStorage.getItem('lastname');
		const useremail = await AsyncStorage.getItem('email');
		const phonenumber = await AsyncStorage.getItem('phonenumber');
		console.log('users from state:', first, last, useremail, phonenumber);
		this.setState({
			firstname: first,
			lastname: last,
			email: useremail,
			phonenumber: phonenumber
		});
	};

	handleChange = (key, value) => {
		console.log('value change:', this.state);

		this.setState({
			...this.state,
			[key]: value
		});
	};

	anonymousCheck = () => {
		console.log('anonymous:', this.state.anonymous);
		const val = !this.state.anonymous;
		this.setState({ anonymous: val });
	};

	render() {
		return (
			<TouchableWithoutFeedback
				onPress={() => {
					DismissKeyboard();
				}}
			>
				<View style={styles.container}>
					<Image
						style={styles.image}
						source={{
							uri:
								'https://i.kym-cdn.com/photos/images/newsfeed/001/460/439/32f.jpg'
						}}
					/>
					<Text
						style={{
							position: 'absolute',
							fontSize: 20,
							marginTop: 95,
							backgroundColor: 'rgba(244, 244, 244, 0.5)',
							// backgroundColor: 'red',
							width: 140,
							height: 50,
							// paddingHorizontal: 25,
							// paddingVertical: 10,
							textAlign: 'center',
							borderBottomLeftRadius: 100,
							borderBottomRightRadius: 100
						}}
					>
						Update
					</Text>
					<View style={styles.display}>
						<Text style={styles.text}>Name</Text>
						<TextInput
							style={styles.inputBox}
							onChangeText={val =>
								this.handleChange('firstname', val)}
							value={this.state.firstname}
							name='firstname'
						/>
						<Text style={styles.text}>Phone Number</Text>
						<TextInput
							style={styles.inputBox}
							keyboardType='phone-pad'
							name='phonenumber'
							onChangeText={val =>
								this.handleChange('phonenumber', val)}
							value={this.state.phonenumber}
						/>
						<Text style={styles.text}>Anonymous</Text>
						<CheckBox
							value={this.state.anonymous}
							onValueChange={this.anonymousCheck}
						/>
					</View>
					{/* <KeyboardSpacer /> */}
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		// flexDirection: 'row',
		top: 75,
		flex: 1,
		// flexDirection: 'row',
		alignItems: 'center'
		// justifyContent: 'center'
	},
	image: {
		width: 150,
		height: 150,
		borderRadius: 100
	},
	display: {
		marginTop: 50,
		marginLeft: 0,
		alignItems: 'flex-start'
	},
	text: {
		// marginTop: 10,
		width: 300,
		backgroundColor: '#f4f4f4',
		borderColor: '#f4f4f4',
		paddingHorizontal: 20,
		padding: 10
	},
	inputBox: {
		width: 300,
		borderBottomWidth: 1,
		fontSize: 16
	}
});
