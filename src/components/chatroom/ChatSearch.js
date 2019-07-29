import React, { Component } from "react";
import { FlatList } from "react-native";
import ChatroomItem from "./ChatroomItem";


export default class ChatSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatrooms: [],
      location: {
        latitude: 99999,
        longitude: 0,
      },
      orderedChatrooms: [],
      updating: false
    }
  }



  render() {
    return (
    // Filters through the list of chatrooms so the user can search by name
      <FlatList
          data={this.props.chatWithDistance.filter((item) => {
            return item.name.toLowerCase().match(this.props.searchValue.toLowerCase())
            }).sort(function (a, b) {
            return a.distance - b.distance
          })}

          renderItem={info => 
            <ChatroomItem 
              navigation={this.props.navigation} 
              noData={this.props.noData}
              chat={info.item}
              focusedLocation={this.props.focusedLocation}
              user={this.props.user}
            />}
        />
    );
  }
}