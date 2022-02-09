import React from "react";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import {  View, Text, Button, Platform, KeyboardAvoidingView} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import  firebase from 'firebase';
import 'firebase/firestore';
import backgroundImg from '../assets/images/bg.png';

export default class Chat extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: 'Logging in...',
      user: {
        _id: '',
        name: '',
      }
    };

const firebaseConfig = {
  apiKey: "AIzaSyC61Rk97vdpDrbHHFabJCe6vf9a6zDwl2o",
  authDomain: "task53.firebaseapp.com",
  projectId: "task53",
  storageBucket: "task53.appspot.com",
  messagingSenderId: "954893602213",
  appId: "1:954893602213:web:fd15fd2bb2a0756c5f6c4c",
  measurementId: "G-XHGES0RPST"
};
    // initializing firebase
    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }

    // reference to firebase messages collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    // this.referenceMessageUser = null;
  }

  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  componentDidMount() {

    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
      } else {
        console.log('offline');
      }
    });

    this.getMessages();
  }


    // stop listening to auth and collection changes
  componentWillUnmount() {
		this.authUnsubscribe();
		this.unsubscribe();
	}

  // stores and adds new messages to database
  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.saveMessages();
    });
  }

  // allows user to see new messages when database updates
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each doc
    querySnapshot.forEach((doc) => {
      // get the docs data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
      messages: messages
    });
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }


  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar
        {...props}
        />
      );
    }
  }


  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#1982FC'
          }
        }}
      />
    )
  }

  render() {
    // pulls background image selection from Start screen
  const { bgColor } = this.props.route.params;

    return (
      <View
      style={{
				 	flex: 1,
					backgroundColor: bgColor
				}}>

              <GiftedChat
                renderBubble={this.renderBubble.bind(this)}
                messages={this.state.messages}
                renderInputToolbar={this.renderInputToolbar.bind(this)}
                onSend={messages => this.onSend(messages)}
                user={{
                  _id: 1,
                }}
              />

        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior='height' /> : null }
      </View>
    );
  }
}
