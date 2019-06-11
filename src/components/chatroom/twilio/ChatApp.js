import React, { Component } from "react";
import MessageForm from "./MessageForm";
import MessageList from "./MessageList";
import TwilioChat from "twilio-chat";
// import $ from "jquery";
import axios from "axios";
import { View, StyleSheet, Text } from 'react-native'

const URL = "https://labs13-localchat.herokuapp.com";

export default class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      username: null,
      channel: null
    };
  }

  componentDidMount = () => {
    this.getToken()
      .then(this.createChatClient)
      .then(this.joinGeneralChannel)
      .then(this.configureChannelEvents)
      .catch(error => {
        this.addMessage({ body: `Error: error` });
      });
  };

  getToken = () => {
    return new Promise((resolve, reject) => {
      this.addMessage({ body: "Connecting..." });
      axios
        // .post("http://localhost:5000/api/token")
        // .post('http://127.0.0.1:5000/api/token')
        .post(`${URL}/api/token`)
        .then(res => {
          // console.log(res)
          this.setState({
            username: res.data.identity
          });
          // console.log(res);
          resolve(res.data.jwt);
        })
        .catch(err => console.log(err));
    });
  };

  createChatClient = token => {
    return new Promise((resolve, reject) => {
      // console.log(token);
      resolve(new TwilioChat(token));
    });
  };

  joinGeneralChannel = chatClient => {
    return new Promise((resolve, reject) => {
      chatClient
      .getSubscribedChannels()
      .then(() => {
        chatClient
        .getChannelByUniqueName("general")
        .then(channel => {
          console.log('get subbed channels')
              console.log("HELLO, CLG CHANNEL", channel)
              this.addMessage({ body: "Joining general channel..." });
              this.setState({ channel });

              channel
                .join()
                .then(() => {
                  this.addMessage({
                    body: `Joined general channel as ${this.state.username}`
                  });
                  window.addEventListener("beforeunload", () =>
                    channel.leave()
                  );
                })
                .catch(() => reject(Error("Could not join general channel.")));

              resolve(channel);
            })
            .catch(() => this.createGeneralChannel());
        })
        .catch(() => reject(Error("Could not get channel list.")));
    });
  };

  createGeneralChannel = chatClient => {
    return new Promise((resolve, reject) => {
      console.log("hellooooooo")
      this.addMessage({ body: "Creating general channel..." });
      chatClient
        .createChannel({ uniqueName: "general", friendlyName: "General Chat" })
        .then(() => this.joinGeneralChannel(chatClient))
        .catch((err) => console.log(err)
          );
    }
    )};

  addMessage = message => {
    const messageData = {
      ...message,
      me: message.author === this.state.username
    };
    this.setState({
      messages: [...this.state.messages, messageData]
    });
  };

  handleNewMessage = text => {
    if (this.state.channel) {
      this.state.channel.sendMessage(text);
    }
  };

  configureChannelEvents = channel => {
    channel.on("messageAdded", ({ author, body }) => {
      this.addMessage({ author, body });
    });

    channel.on("memberJoined", member => {
      this.addMessage({ body: `${member.identity} has joined the channel.` });
    });

    channel.on("memberLeft", member => {
      this.addMessage({ body: `${member.identity} has left the channel.` });
    });
    channel.on("typingStarted", member => {
      this.addMessage({ body: `${member.identity} is currently typing.` });
    });
  };

  render() {
    console.log(this.state.channel)
    // alert(this.state.channel)
    console.log(this.state.username)
    return (
      <View className="App">
        <Text>{this.state.username}</Text>
        <MessageList messages={this.state.messages} />
        <MessageForm onMessageSend={this.handleNewMessage} />
      </View>
    );
  }
}




  const styles = StyleSheet.create({
    messageForm: {
      paddingTop: 200
    }  
  })