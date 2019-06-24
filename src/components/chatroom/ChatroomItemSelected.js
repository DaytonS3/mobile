import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Button,
  Modal,
  Dimensions,
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import React, { Component } from "react";
import axios from 'axios'
import SendBird from 'sendbird'
import Config from '../../config'
import { getDistance } from "geolib";

var sb = new SendBird({appId: Config.appId });

const URL = 'https://labs13-localchat.herokuapp.com';


export default class ChatroomItemSelected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: {
        longitude: 0,
        latitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      chatroom: [],
      user: [],
      distance: 0
    }
  }

  componentDidMount() {
    axios.get(`${URL}/api/chatrooms/${this.props.chat.id}`)
      .then(res => {
        console.log('data',res.data)
        this.setState({
          location: {
            longitude: res.data.coordinate[0].longitude,
            latitude: res.data.coordinate[0].latitude,
            latitudeDelta: 0.0122,
            longitudeDelta:
              (Dimensions.get("window").width / Dimensions.get("window").height) *
              0.0122
          },
          chatroom: res.data
        })
        // console.log('location', this.state.location)
      })
      .catch(err => console.log(err))

      this.getDistanceFromChat()
    }
  
    getDistanceFromChat = () => {
      let distance = getDistance(
        { latitude: this.state.location.latitude, longitude: this.state.location.longitude },
        { latitude: this.props.focusedLocation.latitude, longitude: this.props.focusedLocation.longitude }
        )
      if (this.state.location.latitude === 0 ) {
        return setTimeout(() => {
          this.getDistanceFromChat()
        }, 1000)
      } else {
        this.setState({
          distance: distance
        })
          console.log("distance", distance)
        }
    }

  joinChannel = () => {
    if (this.state.chatroom.chatroom_type === "worldwide" && this.state.distance >= 0) {
      this.props.navigation.navigate('Chatroom', {
        user: this.state.chatroom
      })
    } else if (this.state.chatroom.chatroom_type === "big city" && this.state.distance <= 80000) {
      this.props.navigation.navigate('Chatroom', {
        user: this.state.chatroom
      })
    } else if (this.state.chatroom.chatroom_type === "stadium" && this.state.distance <= 800) {
      this.props.navigation.navigate('Chatroom', {
        user: this.state.chatroom
      })
    } else {
      alert(`You aren't in or near ${this.state.chatroom.name}!`)
    }
  // this.props.navigation.navigate('Chatroom', {
  //   user: this.state.chatroom
  // })
  }


  render() {
    // console.log('props', this.props)
    // console.log('focusedlocation', this.props.focusedLocation)
    // console.log('location', this.state.location)
    console.log('chatroom', this.state.chatroom)
    return (
      <View>
        <View>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={this.state.location}
            // annotations={markers}
          >
            <Marker
              coordinate={{
                latitude: this.state.location.latitude,
                longitude: this.state.location.longitude
              }}
            />
          </MapView> 
          {/* <Marker coordinate={markers} /> */}
        </View>
        <View style={styles.joinContainer}>
          <TouchableOpacity style={styles.join} onPress={this.joinChannel}>
            <View>              
              <Text style={styles.joinText}>JOIN CHAT</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>{this.props.chat.name}</Text>
            <Text style={{color:'#3EB1D6'}}>{this.props.chat.total_users} Members</Text>
          </View>
          <View>
            <View style={styles.dropdownText}>
              <Icon name='circle' color='#A8A7A3'/><Text style={{marginLeft:5}}>Chatroom created {this.props.chat.created_at}</Text>
            </View>
            <View style={styles.dropdownText}>
              <Icon name='map-marker' color='#A8A7A3'/><Text style={{marginLeft:5}}>{this.props.chat.description}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    height: 200
  },
  joinContainer: {
    margin: 20
  },
  join: {
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#3EB1D6',
    padding: 15,
  },
  joinText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center'
  },
  dropdownContainer: {
    marginHorizontal:20, 
    marginBottom:10
  },
  dropdownHeader: {
    justifyContent:'space-between', 
    flexDirection: 'row', 
    marginVertical: 10
  },
  dropdownTitle: {
    fontSize: 15, 
    fontWeight:'600', 
    color:'#4A4A4A'
  },
  dropdownText: {
    flexDirection: 'row', 
    alignItems:'center', 
    marginVertical: 5
  },
});
