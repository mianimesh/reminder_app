import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform,TextInput } from 'react-native';
import {Input} from 'react-native-elements'; 
import DateTimePickerModal from "react-native-modal-datetime-picker";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound:true,
    shouldSetBadge: false
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [title,setTitle] = useState('title') ; 
  const [body,setBody] = useState('body') ;  
  const [isDatePickerVisible,setDatePickerVisibility] = useState(false) ; 
  const [seconds,setSeconds] = useState(1) ; 

  const showDatePicker = ()=>{
    setDatePickerVisibility(true) ; 
  }
  const hideDatePicker = ()=>{
    setDatePickerVisibility(false) ; 
  }
  const handleConfirm = (datetime)=>{
    let current = new Date() ; 
    setSeconds((datetime-current)/1000) ; 
    if((datetime-current<0))
      alert('Please Select Correct Date and Time in Future! ')
    hideDatePicker() ; 
  }
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      {/* <Text>Your expo push token: {expoPushToken}</Text> */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        
        <Input label='Reminder Title' value={title} onChangeText={(value)=>setTitle(value)}/>
        <Input label='Reminder Body' value={body} onChangeText={(value)=>setBody(value)}/>
        <Button title='Set Date and Time' onPress={showDatePicker}/>
        <DateTimePickerModal isVisible = {isDatePickerVisible} mode='datetime' onConfirm={handleConfirm} onCancel={hideDatePicker}/>
      </View>
      
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification({title,body,seconds});
          setTitle('');
          setBody('');
          alert('Your notification is Scheduled!');
        }}
      />
    </View>
  );
}

async function schedulePushNotification(props) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: props.title, 
      body: props.body,
      sound:'sound.wav'
    },
    trigger: {
      seconds:props.seconds 
    }
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound:'sound.wav',
    });
  }

  return token;
}