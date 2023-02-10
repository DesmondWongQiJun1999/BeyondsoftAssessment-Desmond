import LocationOnIcon from '@mui/icons-material/LocationOn';
import AppBar from '@mui/material/AppBar';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { debounce } from '@mui/material/utils';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Geocode from "react-geocode";
import MapPicker from "react-google-map-picker";


//Load map
const GOOGLE_MAPS_API_KEY = 'AIzaSyDp7nr0rk8GTtl2ktKl1banelffk7ImkQs';

function loadScript(src, position, id) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };


export default function Map() {

  //Initialization
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [coordinates, setCoordinates] = useState({
    lat: 0,
    lng: 0
  });


  //Load map
  const loaded = useRef(false);

  if (typeof window !== 'undefined' && !loaded.current) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector('head'),
        'google-maps',
      );
    }

    loaded.current = true;
  }

  Geocode.setApiKey(GOOGLE_MAPS_API_KEY);

  const fetch = useMemo(
    () =>
      debounce((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 400),
    [],
  );


  //Function when button is clicked, moves map to user's inputted address.
  const showLocation = () => {
    if (value) {
      Geocode.fromAddress(value?.description).then(
        (response) => {
          const { lat, lng } = response.results[0].geometry.location;
          setCoordinates({
            lat: lat,
            lng: lng
          })
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }


  //Update autofill selections whenever user have input
  useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === '') {
      setOptions(value ? [value] : searchHistory);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
          setSearchHistory([...searchHistory, value])
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);


  return (
    <>
      <AppBar position="static">
        <Toolbar
          style={{
            display: 'flex',
            justifyContent: "space-between",
            backgroundColor: "orange",
            color: 'black'
          }}
        >
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Beyondsoft ReactJS Assessment

          </Typography>
          <Autocomplete
            style={
              {
                backgroundColor: "white",
                color: 'black'
              }
            }
            id="google-map-demo"
            sx={{ width: 650 }}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : option.description
            }
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText="No locations"
            onChange={(event, newValue) => {
              setOptions(newValue ? [newValue, ...options] : options);
              setValue(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search location" fullWidth />
            )}
            renderOption={(props, option) => {
              return (
                <>
                  <li {...props}>
                    <Grid container alignItems="center">
                      <Grid item sx={{ display: 'flex', width: 44 }}>
                        <LocationOnIcon sx={{ color: 'text.secondary' }} />
                      </Grid>
                      <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                        <Typography variant="body2" color="text.secondary">
                          {option.structured_formatting.secondary_text}
                        </Typography>
                      </Grid>
                    </Grid>
                  </li>
                </>

              );
            }}
          />
          <Button
            style={
              {
                backgroundColor: "white",
                color: 'black'
              }
            }
            onClick={() => {
              showLocation()
            }}
            variant="outlined">Show Location On Map</Button>
        </Toolbar>
      </AppBar>

      <MapPicker
        name={"map"}
        style={{
          height: "100vh"
        }}
        
        defaultLocation={coordinates}
        zoom={18}
        location={coordinates}
        apiKey={GOOGLE_MAPS_API_KEY}
      >
      </MapPicker>
    </>
  );
}
