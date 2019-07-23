import React, { Component } from 'react'
import {
    View,
    TextInput,
    StyleSheet,
    Picker,  
    Text,
    Dimensions,
    Button,
    AsyncStorage
  } from "react-native";
import SendBird from 'sendbird';
import axios from 'axios'
import Config from '../../config'

var sb = new SendBird({ appId: Config.appId });

export default class CreateChatroom extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             newChatroom: {
                name: '',
                chatroom_url: '',
                radius: 0,
                description: '',
                img_url: this.randomAvatar(),
                user_id: 1,
                latitude: 99999,
                longitude: 0,
                permanent: true,
                chatroom_type: 'rural city'
             },
             userId: 0,
             sendbirdChatroom: []
        }
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
                longitude: position.coords.longitude,
                latitudeDelta: 0.0122,
                longitudeDelta:
                  (Dimensions.get("window").width /
                    Dimensions.get("window").height) *
                  0.0122
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


    createChatroom = async (e) => {
        let that = this
        if (this.state.newChatroom.name.length < 1 || this.state.newChatroom.description.length < 1) {
            await alert("Please enter a Name and/or Description!")
        } else {
            // debugger
            await sb.OpenChannel.createChannel(that.state.newChatroom.name, that.state.newChatroom.img_url, that.state.newChatroom.description, that.state.userId, function(openChannel, error) {
                if (error) {
                    return alert("Error:", error)
                }

                AsyncStorage.setItem("chaturl", openChannel.url)
                console.log(this)
                console.log("cat", openChannel, that.state.newChatroom, openChannel.url)
            })        
            let chatroomURL = await AsyncStorage.getItem("chaturl")
            await this.setState({
                ...this.state.newChatroom,
                chatroom_url: chatroomURL.toString()
            })
            await axios
                    .post('https://labs13-localchat.herokuapp.com/api/chatrooms/', this.state.newChatroom)
                    .then(res => {
                        AsyncStorage.removeItem("chaturl")
                        this.setState({
                            ...this.state.newChatroom,
                            name: '',
                            description: '',
                            chatroomURL: ''
                        })
                        alert("Chatroom Creation Successful!")
                    })
                    .catch(err => {
                        console.log(err)
                        AsyncStorage.removeItem("chaturl")
                        alert("Chatroom creation failure!  Please try again!")
                    })
        }
    

    render() {
        console.log(this.state.newChatroom)
        return (
            <View>
                {/* <Text style={styles.text}>New Feature Coming Soon!</Text> */}
                <Text>Please Fill Out All Information</Text>
                <TextInput
                    placeholder="Name"
                    value={this.state.newChatroom.name}
                    onChangeText={val => this.handleNameInput(val)}
                    name="name"
                />
                <TextInput
                    placeholder="Description"
                    value={this.state.newChatroom.description}
                    onChangeText={val => this.handleDescriptionInput(val)}
                    name="description"
                />
               
                <Picker
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
                <Button 
                    title="Create Channel" 
                    onPress={e => this.createChatroom(e)}
                />
            </View>
        )
    }
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        display: 'flex',
        textAlign: "center",
        alignItems: 'center',
        justifyContent: 'center'
    }
})