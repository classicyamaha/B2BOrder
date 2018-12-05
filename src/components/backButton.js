// packages
import {BackHandler} from 'react-native';

/**
 * Attaches an event listener that handles the android-only hardware
 * back button
 * @param  {Function} callback The function to call on click
 */
const handleBackButton = callback => {
  BackHandler.addEventListener('hardwareBackPress', () => {
    callback();
    return true;
  });
};

/**
 * Removes the event listener in order not to add a new one
 * every time the view component re-mounts
 */
const removeBackButtonHandler = () => {
  BackHandler.removeEventListener('hardwareBackPress', () => {});
}

export {handleBackButton, removeBackButtonHandler};