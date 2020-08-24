import React from 'react';
import './App.css';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import { useEffect } from 'react';
import {
  Card,
  CardText,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';
import _iconUrl from './_iconUrl';

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/v1/messages'
    : 'https://api.guestm.app/api/v1/messages';

function App() {
  const [state, setstate] = useState({
    lat: 51.505,
    lng: -0.09,
    zoom: 2,
    haveUsersLocation: false,
  });

  const [sendingMessage, setsendingMessage] = useState(false);
  const [sentMessage, setsentMessage] = useState(false);
  const [messages, setmessages] = useState([]);

  const [name, setname] = useState('');
  const [message, setmessage] = useState('');

  const position = [state.lat, state.lng];

  const myIcon = L.icon({
    iconUrl: _iconUrl,
    iconSize: [25, 41],
  });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((messages) => {
        setmessages(messages);
      });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setstate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          haveUsersLocation: true,
          zoom: 13,
        });
      },
      () => {
        fetch('https://ipapi.co/json')
          .then((res) => res.json())
          .then((location) => {
            setstate({
              lat: location.latitude,
              lng: location.longitude,
              haveUsersLocation: true,
              zoom: 13,
            });
          });
      }
    );
  }, []);

  const formIsValid = () => {
    const userMessage = {
      name,
      message,
    };
    const validMessage =
      userMessage.name.trim().length > 0 &&
      name.trim().length <= 500 &&
      userMessage.message.trim().length > 0 &&
      userMessage.message.trim().length <= 500;

    return validMessage && state.haveUsersLocation ? true : false;
  };

  const formSubmitted = (e) => {
    e.preventDefault();
    if (formIsValid()) {
      setsendingMessage(true);
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name,
          message,
          latitude: state.lat,
          longitude: state.lng,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          setTimeout(() => {
            setsendingMessage(false);
            setsentMessage(true);
          }, 3000);
        });
    }
  };

  const valueChanged = (e) => {
    const { name, value } = e.target;
    if (name === 'message') {
      setmessage(value);
    } else {
      setname(value);
    }
  };

  return (
    <div className="map">
      <Map className="map" center={position} zoom={state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {state.haveUsersLocation ? (
          <Marker position={position} icon={myIcon}></Marker>
        ) : (
          ''
        )}
        {messages.map((message) => (
          <Marker
            position={[message.latitude, message.longitude]}
            icon={myIcon}
          >
            <Popup>
              <em>{message.name}:</em>
              {message.message}
            </Popup>
          </Marker>
        ))}
      </Map>
      <Card body className="message-form">
        <CardTitle>Welcome to GuestMap</CardTitle>
        <CardText>Leave a message with your location!</CardText>
        <CardText>Thanks for stopping by!</CardText>
        {!sendingMessage && !sentMessage ? (
          <Form onSubmit={formSubmitted}>
            <FormGroup>
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={valueChanged}
                type="name"
                name="name"
                id="name"
                placeholder="Enter your name"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="name">Message</Label>
              <Input
                onChange={valueChanged}
                type="text"
                name="message"
                id="message"
                placeholder="Enter a message"
              />
            </FormGroup>
            <Button type="submit" color="info" disabled={!formIsValid()}>
              Send
            </Button>
          </Form>
        ) : sendingMessage || !state.haveUsersLocation ? (
          <video
            autoPlay
            loop
            src="https://i.giphy.com/media/BCIRKxED2Y2JO/giphy.mp4"
          ></video>
        ) : (
          <CardText>Thanks for submitting a message</CardText>
        )}
      </Card>
    </div>
  );
}

export default App;
