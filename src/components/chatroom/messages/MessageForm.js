import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Text,
    Image,
    Button
  } from "react-native";
import SendBird from 'sendbird'
import Config from '../../../config'

var sb = new SendBird({appId: Config.appId });
var ChannelHandler = new sb.ChannelHandler()

export default class MessageForm extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
                message: ''
        }
    }
    
    messageInputHandler = val => {
        this.setState({
                message: val
        })
        
    }

    messageSendHandler = () => {
        this.props.sendMessage(this.state.message)
        this.setState({
                message: ''
        })
    }

    render() {
        console.log(this.state.message)
        return (
            <View>
                <TextInput 
                    onChangeText={this.messageInputHandler}
                />
                <Button title="Send" onPress={this.messageSendHandler}/>
            </View>
        )
    }
}
