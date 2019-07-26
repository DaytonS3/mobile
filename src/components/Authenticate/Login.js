import React from 'react';
import axios from 'axios';
import {
	View,
	TouchableOpacity,
	Text,
	ActivityIndicator,
	StyleSheet,
	AsyncStorage,
	Image,
	Linking,
	Platform
} from 'react-native';
import SafariView from 'react-native-safari-view';

const URL = 'https://labs13-localchat.herokuapp.com';

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: undefined, // user has not logged in yet
			nickname: '',
			loadingLoginCheck: true,
			gfID: undefined
		};
	}

	// Set up Linking
	componentDidMount = async () => {
		await this.checkForUser();
		// Add event listener to handle OAuthLogin:// URLs
		Linking.addEventListener('url', this.handleOpenURL);
		// Launched from an external URL
		Linking.getInitialURL().then(url => {
			if (url) {
				this.handleOpenURL({ url });
			}
		});
	}

	componentWillUnmount() {
		// Remove event listener
		Linking.removeEventListener('url', this.handleOpenURL);
	}

	async storeUser(user) {
		try {
		   await AsyncStorage.setItem("userData", JSON.stringify(this.state.user));
		} catch (error) {
		  console.log("error storing", error);
		}
	}

	checkForUser = async () => {
		try {
			let userData = await AsyncStorage.getItem("userData");
			let data = JSON.parse(userData);
			console.log('checkforuser', data);
			if (data) {
				this.setState({
					user: {
						id: data.id,
						first_name: data.first_name,
						last_name: data.last_name,
						token: data.token,
						phone_num: data.phone_num,
						email: data.email,
						google_id: data.google_id,
						facebook_id: data.facebook_id
					},
					loadingLoginCheck: false
				})
			} else {
				this.setState({
					loadingLoginCheck: false
				})
			}
		} catch (error) {
			console.log("error check", error);
		}
	}

	handleOpenURL = ({ url }) => {
		// Extract stringified user string out of the URL
		const [ , user_string ] = url.match(/user=([^#]+)/);
		this.setState({
			// Decode the user string and parse it into JSON
			user: JSON.parse(decodeURI(user_string))
		});
		if (Platform.OS === 'ios') {
			SafariView.dismiss();
		}
	};

	// Handle Login with Google button tap
	loginWithGoogle = () =>
		this.openURL('https://labs13-localchat.herokuapp.com/auth/google');

	// Handle Login with Facebook button tap
	loginWithFacebook = () =>
		this.openURL('https://labs13-localchat.herokuapp.com/auth/facebook');


	// Open URL in a browser
	openURL = url => {
		// Code if this is ever to become iOS
		// Use SafariView on iOS
		// if (Platform.OS === 'ios') {
		// 	SafariView.show({
		// 		url: url,
		// 		fromBottom: true
		// 	});
		// } else {
			// Or Linking.openURL on Android
			Linking.openURL(url);
		}
	
	signOut = () => {
		this.setState({
			user: undefined
		});
		AsyncStorage.removeItem('userID');
		sb.disconnect(function() {});
	};

	render() {
		return (
			<View style={styles.container}>
				{this.state.loadingLoginCheck ? 
				<View>
					<ActivityIndicator style={styles.loader} size="large" color="#3EB1D6" />
				</View>
				:
				this.state.user ? (
					// Show user info if already logged in
					this.storeUser()
						&&
					this.props.navigation.navigate('JoinChat', {
						id: this.state.user.id,
						sendbirdId: this.state.gfID
					})
				
					) : (
						
					// Show Please log in message if not
					<View style={styles.content}>
						<Image source={require('./CMLogo.png')} />

						{/* Login buttons */}

						<View style={styles.header}>
							<Text style={styles.headerText}>
								Welcome to chat maps!
							</Text>
						</View>
						<TouchableOpacity
							onPress={this.loginWithGoogle}
							style={styles.btnClickContain}
						>
							<View style={styles.btnContainer}>
								<Image
									source={require('./GLiteLogo.png')}
									style={styles.btnIcon}
								/>
								<Text style={styles.btnText}>
									Sign In with Google
								</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={this.loginWithFacebook}
							style={styles.btnClickContain}
						>
							<View style={styles.btnContainer}>
								<Image
									source={require('./FBLogo.png')}
									style={styles.btnIcon}
								/>
								<Text style={styles.btnText}>
									Sign In with Facebook
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	}
}


const iconStyles = {
	borderRadius: 10,
	iconStyle: { paddingVertical: 5 }
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFF'
	},
	loader: {
		flex: 1,
		marginTop: '50%'
	},
	content: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: '10%'
	},
	header: {
		textAlign: 'center',
		marginTop: '20%',
		marginBottom: '10%'
	},
	headerText: {
		fontSize: 22,
		fontWeight: '600',
		color: '#4A4A4A'
	},

	btnClickContain: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderWidth: 0.75,
		borderRadius: 50,
		padding: 10,
		width: '75%',
		// marginTop: 20,
		marginBottom: 20
	},
	btnContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	btnIcon: {
		height: 25,
		width: 25
	},
	btnText: {
		fontSize: 15,
		fontWeight: '600',
		marginLeft: '15%',
		color: '#4A4A4A'
	}
});
