import React, { Component } from 'react'
import {
    View,
    TextInput,
    StyleSheet,
    Picker,  
    Text,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    AsyncStorage
  } from "react-native";
import { connect } from 'react-redux'
import SendBird from 'sendbird';
import axios from 'axios'
import Config from '../../config'
import { updateChatroomList } from '../../store/actions/chatroom'


var sb = new SendBird({ appId: Config.appId });
const URL = "https://labs13-localchat.herokuapp.com/api/chatrooms/"

class CreateChatroom extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             newChatroom: {
                name: '',
                chatroom_url: '',
                description: '',
                img_url: this.randomAvatar(),
                user_id: 1,
                latitude: 99999,
                longitude: 0,
                permanent: true,
                chatroom_type: 'rural city'
             },
             userId: 0,
             sendbirdChatroom: [],
             creatingChat: false
        }
    }

    static navigationOptions = {
        title: 'Create a Chatroom',
      }

    componentDidMount = async () => {
        await this.getGeoLocation()
        const user_id = await AsyncStorage.getItem('userID')
        this.setState({
            userId: user_id
        })
    }
    
    // Retrieves location of user's phone
    getGeoLocation =  async () => {
        if (navigator.geolocation) {
          await navigator.geolocation.getCurrentPosition(position => {
            console.log("Locations Calculated")
            this.setState({
              
              newChatroom: {
                ...this.state.newChatroom,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
          });
        }
      };

    handleNameInput = val => {
        console.log(this.state.newChatroom)
        this.setState({
            newChatroom: {
                ...this.state.newChatroom,
                name: val
            }
        })
    }

    handleDescriptionInput = val => {
        console.log(this.state.newChatroom)
        this.setState({
            ...this.state,
            newChatroom: {
                ...this.state.newChatroom,
                description: val
            }
        })
    }

    randomAvatar = () => {
        let images = 
        ["https://sendbird.com/main/img/cover/cover_01.jpg", 
        "https://sendbird.com/main/img/cover/cover_02.jpg", 
        "https://sendbird.com/main/img/cover/cover_03.jpg", 
        "https://sendbird.com/main/img/cover/cover_04.jpg", 
        "https://sendbird.com/main/img/cover/cover_05.jpg", 
        "https://sendbird.com/main/img/cover/cover_06.jpg", 
        "https://sendbird.com/main/img/cover/cover_07.jpg", 
        "https://sendbird.com/main/img/cover/cover_08.jpg", 
        "https://sendbird.com/main/img/cover/cover_09.jpg"]

        return images[Math.floor(Math.random() * images.length)]
    }




    addChatroom = () => {
        axios
        .post("https://labs13-localchat.herokuapp.com/api/chatrooms/", this.state.newChatroom)
        .then(res => {
            this.props.screenProps.updateJoinChats()
            this.setState({
                ...this.state.newChatroom,
                newChatroom: {
                    name: '',
                    description: '',
                    chatroomURL: '',
                },
                creatingChat: false
            })
            
            Alert.alert(
                'Chatroom Creation Success!',
                'Would you like to view your chatroom?',
                [
                  {
                    text: 'Yes',
                    onPress: () => this.props.navigation.navigate("Chats"),
                  },
                  {text: 'No', onPress: () => console.log('OK Pressed')},
                ],
                {cancelable: false},
              );
            // alert("Chatroom Created Successfully!")
        })
        .catch(err => {
            console.log(".Catch Error", err, err.message)
            // AsyncStorage.removeItem("chaturl")
            this.setState({
                creatingChat: false
            })
            alert("Chatroom creation failure!  Please try again!")
        })
    }

    


    createChatroom = async () => {
        if (this.state.newChatroom.name.length < 1 || this.state.newChatroom.description.length < 1) {
            await alert("Please enter a Name and/or Description!")
        } else {
        this.setState({
            creatingChat: true
        })
        let channel = []
            sb.OpenChannel.createChannel(this.state.newChatroom.name, this.state.newChatroom.img_url, this.state.newChatroom.description, this.state.userId,  (openChannel, error) => {
                if (error) {
                    return console.log(error)
                }
                
                channel = openChannel
                this.setState({
                    ...this.state,
                    newChatroom: {
                        ...this.state.newChatroom,
                        chatroom_url: channel.url 
                    }
                }, () => this.addChatroom())
                // console.log(openChannel, channel, this, this.state.newChatroom)
            })  
    }
}
    
    render() {
        return (
            <View>
                {this.state.creatingChat ? 
                <View>
                    <ActivityIndicator style={styles.loader} size="large" color="#3EB1D6" />
                    <Text style={styles.loaderText}>Creating Chatroom...</Text>
                </View>
                :
                <View>

                <Text style={styles.headerText}>Please Fill Out All Information</Text>
                <Text style={styles.titleText}>Name of Chatroom:</Text>
                <TextInput
                style={styles.textInputs}
                placeholder="Name"
                    value={this.state.newChatroom.name}
                    onChangeText={val => this.handleNameInput(val)}
                    name="name"
                    />
                    <Text style={styles.titleText}>Chatroom Description:</Text>
                    <TextInput
                    style={styles.textInputs}
                    placeholder="Description"
                    value={this.state.newChatroom.description}
                    onChangeText={val => this.handleDescriptionInput(val)}
                    name="description"
                    />
                
                <Text style={styles.titleText}>Please Select a Chatroom Radius:</Text>
                <Picker
                    style={styles.textInputs}
                    selectedValue={this.state.newChatroom.chatroom_type}
                    onValueChange={(itemValue, itemIndex) => {
                        this.setState({
                            newChatroom: {
                                ...this.state.newChatroom,
                                chatroom_type: itemValue
                            }
                        })
                    }}
                    >
                    <Picker.Item label="Rural City (100 mi radius)" value="rural city" />
                    <Picker.Item label="Big City (25 mi radius)" value="big city" />
                    <Picker.Item label="Town (15 mi radius)" value="town" />
                    <Picker.Item label="Beach (2 mi radius)" value="beach" />
                    <Picker.Item label="Stadium (0.5 mi radius)" value="stadium" />
                </Picker>   
                <View styles={styles.buttonContainer}>
                    <TouchableOpacity 
                        onPress={this.createChatroom}
                        style={styles.buttonStyle}
                        >
                        <Text style={styles.buttonText}>Create Chatroom</Text>
                    </TouchableOpacity>
                </View>
            </View>
            }
            </View>
        )
    }
    }

    // const mapStateToProps = ({ state }) => {
    //     updateChatList: state.updateChatList
    // }


export default CreateChatroom
// connect(mapStateToProps { updateChatroomList })(

const styles = StyleSheet.create({
    container: {
        height: '90%'
    },
    headerText: {
        textAlign: 'center',
        fontSize: 18,
        marginTop: 5,
        marginBottom: 5
    },
    loaderText: {
        marginLeft: "5%",
        textAlign: 'center',
        marginTop: "70%",
        fontSize: 18,
        marginTop: 5,
        marginBottom: 5
    },
    textInputs: {
        flexDirection:'row', 
        alignItems: 'center', 
        borderWidth: 1,
         marginHorizontal:20, 
         marginTop:10,
         marginBottom: 15
      },
      titleText: {
        marginLeft: 10,
        marginTop: 14,
        fontSize: 15,
        fontWeight: "600"
      },
    text: {
        fontSize: 20,
        display: 'flex',
        textAlign: "center",
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: "80%"
    },
    buttonStyle: {
        marginTop: 75,
        borderRadius: 50,
        // flexDirection: 'row',
        // justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: '#3EB1D6',
        width: '75%',
        marginLeft: '12.5%',
        padding: 15,
        margin: 'auto'
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center'
    },
  loader: {
      flex: 1,
      marginTop: '50%'
  }
})