import React from 'react';
import { View, Text, Button, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { ImageBackground } from 'react-native';
import { Bubble, Day, GiftedChat, SystemMessage, InputToolbar} from 'react-native-gifted-chat';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import * as firebase from 'firebase';
import 'firebase/firestore';
//const firebase = require('firebase').default;

// firebase configuration for chat
const firebaseConfig = {
  apiKey: "AIzaSyC61Rk97vdpDrbHHFabJCe6vf9a6zDwl2o",
  authDomain: "task53.firebaseapp.com",
  projectId: "task53",
  storageBucket: "task53.appspot.com",
  messagingSenderId: "954893602213",
  appId: "1:954893602213:web:fd15fd2bb2a0756c5f6c4c",
  measurementId: "G-XHGES0RPST"
};
export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: null,
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
      image: null,
      location: null,
      isConnected: false
    };

    // initialize firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // create a reference to the "messages" collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    this.refMsgsUser = null;
  }

  // save messages to asyncStorage
  async saveMessages() {
    try {
      // convert messages to string to store them, saves messages with setItem method
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (err) {
      console.log(err.message);
    }
  }

  // saves user to asyncStorage: necessary to display message bubbles on the correct side while offline
  async saveUser() {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(this.state.user));
    } catch (err) {
      console.log(err.message);
    }
  }

  // get messages from asyncStorage
  async getMessages() {
    let messages = '';
    try {
      // use getItem method to read messages in storage
      messages = await AsyncStorage.getItem('messages') || [];
      // asyncStorage can only store strings, so messages need to be converted back to objects with JSON.parse
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (err) {
      console.log(err);
    }
  }

  // get user from AsyncStorage
  async getUser() {
    let user = '';
    try {
      user = await AsyncStorage.getItem('user') || [];
      this.setState({
        user: JSON.parse(user)
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  // to delete test messages during development
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  componentDidMount() {
    // set name to the name selected on the start page
    let { name } = this.props.route.params;

    // to find out the user's connection status
    NetInfo.fetch().then(connection => {
      // if user is online, fetch data from server
      if (connection.isConnected) {
        this.setState({
          isConnected: true
        });

        // listen to authentication events
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          // when no user is signed in, create new user by signing in anonymously (a temporary account)
          if (!user) {
            await firebase.auth().signInAnonymously();
          }

          // update user state with currently active user data
          this.setState({
            uid: user.uid,
            messages: [],
            user: {
              _id: user.uid,
              name: name,
              avatar: 'https://placeimg.com/140/140/any'
            }
          });

          // access stored messages of current user
          this.refMsgsUser = firebase
            .firestore()
            .collection('messages')
            .where('uid', '==', this.state.uid);

          // listens for updates in the collection
          this.unsubscribe = this.referenceChatMessages
            .orderBy('createdAt', 'desc')
            .onSnapshot(this.onCollectionUpdate);
        });

        // save messages when online
        this.saveMessages();
        this.saveUser();
      } else {
        this.setState({
          isConnected: false
        });
        // loads messages from asyncStorage
        this.getMessages();
        this.getUser();
      }
    });
  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      // stop listening to authentication
      this.authUnsubscribe();
      // stop listening for changes
      this.unsubscribe();
    }
  }

  // add a new message to the collection
  addMessage() {
    const message = this.state.messages[0];
    // add a new message to the collection
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: this.state.user,
      image: message.image || null,
      location: message.location || null
    });
  }

  // takes snapshot on collection update
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the queryDocumentSnapshot's data
      var data = doc.data();
      // each field within each doc is saved into the messages object
      messages.push({
        _id: data._id,
        text: data.text || '',
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        },
        image: data.image || null,
        location: data.location || null
      });
    });
    // renders messages object in the app
    this.setState({
      messages: messages
    });
    this.saveMessages();
    this.saveUser();
  }

  // function for when user sends a message
  onSend(messages = []) {
    // previousState is a reference to the component's state at the time the change is applied
    this.setState(previousState => ({
      // the message a user has sent gets appended to the state messages so that it can be displayed in the chat
      messages: GiftedChat.append(previousState.messages, messages)
    }), () => {
      this.addMessage();
      this.saveMessages();
      this.saveUser();
    });
  }

  // function for changing speech bubble color
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#60a9d6'
          },
          left: {
            backgroundColor: '#ededed'
          }
        }}
      />
    );
  }

  // render InputToolbar only when user is online
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return (
        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: '#ededed'
          }}
        />
      );
    }
  }

  // change color of date text
  renderDay(props) {
    return (
      <Day
        {...props}
        textStyle={{
          color: '#ededed'
        }}
      />
    );
  }

  renderCustomActions(props) {
    return <CustomActions {...props} />;
  }

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3}}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        />
      );
    }
    return null;
  }

  render() {
    const { bgColor } = this.props.route.params;
    const { user } = this.state;

    return (
      <View style={{ flex: 1, backgroundColor: bgColor ? bgColor : '#fff' }}>
        <GiftedChat
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderDay={this.renderDay}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: user._id,
            name: user.name,
            avatar: user.avatar
          }}
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null }
      </View>
    );
  }
}
