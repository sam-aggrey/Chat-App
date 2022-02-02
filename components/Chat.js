// import React, { Component } from 'react';
// import {
// 	View,
// 	Text,
// 	StyleSheet,
// 	ImageBackground,
//
// } from 'react-native';
//
//
// export default class Chat extends Component {
// 	constructor() {
// 		super();
// 		this.state = {
// 			messages: [],
// 		};
// 	}
//
// 	componentDidMount() {
// 		this.setState({
// 			messages: [
// 				{
// 					_id: 1,
// 					text: `Hello ${this.props.route.params.name}`,
// 					createdAt: new Date(),
// 					user: {
// 						_id: 2,
// 						name: 'React Natvie',
// 						avatar: 'https://placeimg.com/140/140/any',
// 					},
// 				},
// 				{
// 					_id: 2,
// 					text: `${this.props.route.params.name} joined the chat. `,
// 					createdAt: new Date(),
// 					system: true,
// 				},
// 			],
// 		});
// 	}
//
// 	onSend(messages = []) {
// 		this.setState(previousState => ({
// 			messages: GiftedChat.append(previousState.messages, messages),
// 		}));
// 	}
//
// 	renderBubble(props) {
// 		return (
// 			<Bubble
// 				{...props}
// 				wrapperStyle={{
// 					right: {
// 						backgroundColor: '#dbb35a',
// 					},
// 					left: {
// 						backgroundColor: 'white',
// 					},
// 				}}
// 			/>
// 		);
// 	}
//
// 	renderSystemMessage(props) {
// 		return <SystemMessage {...props} textStyle={{ color: '#736357' }} />;
// 	}
//
// 	renderDay(props) {
// 		return (
// 			<Day
// 				{...props}
// 				textStyle={{
// 					color: '#fff',
// 					backgroundColor: '#9e938c',
// 					borderRadius: 15,
// 					padding: 10,
// 				}}
// 			/>
// 		);
// 	}
//
// 	render() {
// 		let name = this.props.route.params.name;
// 		this.props.navigation.setOptions({ title: name });
//
// 		let bgColor = this.props.route.params.bgColor;
//
// 		return (
// 			<View style={styles.container}>
// 				<View
// 					style={{
// 						backgroundColor: bgColor,
// 						width: '100%',
// 						height: '100%',
// 					}}
// 				>
//
// 					{Platform.OS === 'android' ? (
// 						<KeyboardAvoidingView behavior="height" />
// 					) : null}
// 				</View>
// 			</View>
// 		);
// 	}
// }
//
// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		flexDirection: 'column',
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 	},
// 	giftedChat: {
// 		color: '#000',
// 	},
// });

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class Chat extends React.Component {
  render() {
    //entered name state from Start screen gets displayed in status bar at the top of the app
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name});

    const { bgColor } = this.props.route.params;

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: bgColor,

        }}>
        <Text style={styles.red}>This will display your chat!</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
	red: {

	fontWeight:'bold',
	 fontSize:26
 },
})
