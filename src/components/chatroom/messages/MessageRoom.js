import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    Image,
    Button,
    AsyncStorage
  } from "react-native";
import SendBird from 'sendbird'
import Config from '../../../config'
import MessageForm from './MessageForm'
import MessageView from './MessageView'

var sb = new SendBird({appId: Config.appId });
var ChannelHandler = new sb.ChannelHandler()
const params = new sb.UserMessageParams();



export default class MessageRoom extends Component {
    constructor(props) {
        super(props)
        this.fetchUser()
    
        this.state = {
             chatroomInfo: [],
             showChat: false,
             channelInfo: [],
             messages: [],
             fetchedOld: false,
             fetched: false,
             loading: true,
             channel: [],
             userID: '',
             arrMessage: []
        }
        
    }

    componentDidMount() {
        let chatInfo = this.props.navigation.getParam("user")
        this.setState({
            chatroomInfo: chatInfo
        })
        sb.OpenChannel.getChannel(this.state.chatroomInfo.chatroom_url, (channel, error) => {
            if (error) {
                return;
            }
            this.setState({
                channel: channel
            })
        })
        // AppState.addEventListener('change', this.handleAppStateChange);
        this.getChannel();
        
    }

    fetchUser = async () => {
        const user_id = await AsyncStorage.getItem('userID')
        // console.log(first, last, useremail);
        this.setState({
            userID: user_id
        })
    }

    

    getChannel = () => {
        if (sb == null) return setTimeout(() => {
            this.getChannel()
        }, 1000)
        const channel = sb.OpenChannel.getChannel(this.state.chatroomInfo.chatroom_url, (channel, error) => {
            if (error) {
                setTimeout(() => {
                    return this.getChannel()
                }, 1000)
            } else {
                this.handleMounting(channel, error)
            }
        })
    }

    handleMounting = (channel, error) => {
        console.log("channel in handlemounting", channel)
        // channel.markAsRead();
        var messageQuery = channel.createPreviousMessageListQuery()
        messageQuery.load(20, true, (messageList, error) => {
            channel.messageList = messageList
            this.setState({ messages: messageList, channel, error, messageQuery, fetchedOld: true, loading: false, fetched: true, })
        })
        console.log("Hello from get Mounting")
        var ChannelHandler = new sb.ChannelHandler();
        ChannelHandler.onMessageReceived = (channel, message) => {
            console.log(channel)
            if (channel.url == this.state.channel.url) {
                var messages = [message];
                this.setState({
                    messages: messages.concat(this.state.messages)
                });
                this.state.lastMessage = message;
                // if (this.state.channel.channelType == 'open') {
                //     this.state.channel.markAsRead();
                // }
            }
        }
        sb.addChannelHandler('MessageView', ChannelHandler);
    }

    joinChannel = () => {
        sb.connect(this.state.userID, (user, error) => {
            if (error) {
                console.log("Error", error)
            } else {
                console.log("Joining Channel", user)
            }
        })
        sb.OpenChannel.getChannel(this.state.chatroomInfo.chatroom_url, (channel, error) => {
            if (error) {
              return ("top", console.log(error))
            }
    
            channel.enter(function(response, error) {
              console.log("Welcome to the Channel", channel)
            
              if (error) {
                }
            });
        });
        this.setState({
            showChat: !this.state.showChat
        })

        ChannelHandler.onMessageReceived()
    }


    componentWillUnmount() {
        // sb.disconnect(function(){
        //     // A current user is discconected from SendBird server.
        //     console.log("Disconnecting from Sendbird")
        // });
    }
    


    sendMessage = message => {
        console.log("Message", message)
        sb.OpenChannel.getChannel(this.state.chatroomInfo.chatroom_url, (channel, error) => {
            if (error) {
                return;
            }
        
            // Successfully fetched the channel.
            console.log(channel);
            channel.sendUserMessage(message, (message, error) => {
                if (error) {
                    return;
                }
                this.setState({
                    channel: channel
                })
                
                console.log(message);
            });
            });
    }
    

    render() {
        console.log(this.state.messages, "Messages State")
        // console.log("Userinfo", this.state.chatroomInfo)
        // console.log(this.state.userID)
        console.log(this.state.arrMessage)
        return (
            <View>
                {this.state.showChat ? 
                    <View>
                        <MessageView chatroomInfo={this.state.chatroomInfo} messages={this.state.messages} /> 
                        <MessageForm sendMessage={this.sendMessage} />
                    </View>
                    :
                    <View>
                        <Button 
                        title={`Join the ${this.state.chatroomInfo.name} Channel`}      onPress={this.joinChannel} />
                    </View>
                }
            </View>
        )
    }
}
