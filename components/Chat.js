import React from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";


import {
  View,
  Text,
  Button,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as firebase from 'firebase';
import 'firebase/firestore';




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

  constructor(props) {
    super();
    this.state = {
      messages: [],
      uid: 0,
      loggedInText: 'Logging in...',
      user: {
        _id: '',
        name: '',
      }
    };
    // initializing firebase
    if (!firebase.apps.length) {
    			firebase.initializeApp(firebaseConfig);
    		}

    // reference to firebase messages collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    // this.referenceMessageUser = null;
  }

  componentDidMount() {
    // sets the page title and adds users name to the nav
    // let { name } = this.props.route.params;
    // this.props.navigation.setOptions({ title: name });
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
        return
      }
      // update user state with currently active user data
      this.setState({
        uid: user.uid,
        messages: [],
        user: {
          _id: user.uid,
          name: name,
        },
      });
      // create reference to active user's messages
      this.referenceMessagesUser = firebase
        .firestore()
        .collection('messages')
        .where('uid', '==', this.state.uid);
      this.unsubscribe = this.referenceChatMessages
        .orderBy('createdAt', 'desc')
        .onSnapshot(this.onCollectionUpdate);
    });
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

  // callback function for when user sends a message
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
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

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "purple",
          },
        }}
      />
    );
  }

  render() {
		const { bgColor } = this.props.route.params;
    // let name = this.props.route.params.name;
    // this.props.navigation.setOptions({ title: name });
    return (
      <View style={{
				 	flex: 1,
					backgroundColor: bgColor
				}}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? (
          <KeyboardAvoidingView behavior="height" />
        ) : null}
      </View>
    );
  }
}
