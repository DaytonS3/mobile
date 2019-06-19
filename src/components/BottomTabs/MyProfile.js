import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  CheckBox,
  Image,
  TouchableWithoutFeedback,
  AsyncStorage,
  Button
} from "react-native";
import axios from "axios";
import ImagePicker from "react-native-image-picker";
import DismissKeyboard from "dismissKeyboard";
import KeyboardSpacer from "react-native-keyboard-spacer";

const URL = "https://labs13-localchat.herokuapp.com";

export default class MyProfile extends React.Component {
  constructor(props) {
    super(props);
    this.fetchUser();
    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      phonenumber: "",
      anonymous: true,
      user: "",
      user_id: null,
      photo: "https://i.kym-cdn.com/photos/images/newsfeed/001/460/439/32f.jpg"
    };
  }

  static navigationOptions = {
    title: "Edit Profile",
    headerTransparent: true
  };

  fetchUser = async () => {
    const id = this.props.navigation.state.params.id;
    const first = await AsyncStorage.getItem("firstname");
    const last = await AsyncStorage.getItem("lastname");
    const useremail = await AsyncStorage.getItem("email");
    const phonenumber = await AsyncStorage.getItem("phonenumber");
    console.log("users from state:", first, last, useremail, phonenumber, id);
    this.setState({
      firstname: first,
      lastname: last,
      email: useremail,
      phonenumber: phonenumber,
      user_id: id,
      user: {}
    });
  };

  handleChange = (key, value) => {
    console.log("value change:", this.state);

    this.setState({
      ...this.state,
      [key]: value
    });
  };

  anonymousCheck = () => {
    console.log("anonymous:", this.state.anonymous);
    const val = !this.state.anonymous;
    this.setState({ anonymous: val });
  };

  chooseFile = () => {
    const options = {
      title: "Select Photo",
      // customButtons: [{ name: 'gallery', title: 'Choose an Image from your Gallery' }],
      storageOptions: {
        skipBackup: true,
        path: "images"
      }
    };
    ImagePicker.showImagePicker(options, response => {
      console.log("Response = ", response);
      if (response.didCancel) {
        console.log("User canceled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        const source = { uri: response.uri };
        this.setState({
          photo: source
        });
      }
    });
  };

  updateUser = id => {
    axios
      .put(`${URL}/api/users/${id}`)
      .then(res => {
        console.log(res.body);
      })
      .catch(err => {
        console.log(err);
      });
  };

  getUser = id => {
    axios
      .get(`${URL}/api/users/${id}`)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  };

  submit = () => {};

  render() {
    const { photo } = this.state;
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
              uri: photo.uri
              // 'https://i.kym-cdn.com/photos/images/newsfeed/001/460/439/32f.jpg'
            }}
          />
          <Text
            onPress={this.chooseFile.bind(this)}
            style={{
              position: "absolute",
              fontSize: 20,
              marginTop: 95,
              backgroundColor: "rgba(244, 244, 244, 0.5)",
              // backgroundColor: 'red',
              width: 140,
              height: 50,
              // paddingHorizontal: 25,
              // paddingVertical: 10,
              textAlign: "center",
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
              onChangeText={val => this.handleChange("firstname", val)}
              value={this.state.firstname}
              name="firstname"
            />
            <Text style={styles.text}>Phone Number</Text>
            <TextInput
              style={styles.inputBox}
              keyboardType="phone-pad"
              name="phonenumber"
              onChangeText={val => this.handleChange("phonenumber", val)}
              value={this.state.phonenumber}
            />
            <Text style={styles.text}>Anonymous</Text>
            <CheckBox
              value={this.state.anonymous}
              onValueChange={this.anonymousCheck}
            />
          </View>
          {/* <KeyboardSpacer /> */}
          <Button
            style={{ backgroundColor: "#3EB1D6" }}
            title="Save"
            onPress={console.log("BUTTTON PRESSED")}
          />
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
    alignItems: "center"
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
    alignItems: "flex-start"
  },
  text: {
    // marginTop: 10,
    width: 300,
    backgroundColor: "#f4f4f4",
    borderColor: "#f4f4f4",
    paddingHorizontal: 20,
    padding: 10
  },
  inputBox: {
    width: 300,
    borderBottomWidth: 1,
    fontSize: 16
  }
});
