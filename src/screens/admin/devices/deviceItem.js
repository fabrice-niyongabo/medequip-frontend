import React, {useState} from 'react';
import {Alert, Pressable, Text, View, TouchableOpacity} from 'react-native';
import {flexSpace} from '../../../constants/styles';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import Icon2 from 'react-native-vector-icons/dist/Octicons';
import colors from '../../../constants/colors';
import FullPageLoader from '../../full-page-loader';
import Axios from 'axios';
import {backendUrl} from '../../../constants/app';
import {errorHandler, toastMessage} from '../../../helpers';
import {useDispatch} from 'react-redux';
import {fetchDevices} from '../../../actions/devices';
import {useSelector} from 'react-redux';

function DeviceItem({item, navigation}) {
  const dispatch = useDispatch();
  const {token} = useSelector(state => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const deleteDevice = () => {
    setIsLoading(true);
    Axios.post(backendUrl + '/devices/remove', {token, id: item._id})
      .then(res => {
        setIsLoading(false);
        toastMessage('success', res.data.msg);
        dispatch(fetchDevices());
      })
      .catch(error => {
        setIsLoading(false);
        errorHandler(error);
      });
  };
  const handleDelete = () => {
    Alert.alert(
      'Confirm the process',
      'Do you want to parmanently delete this device? All related data will be removed too.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'confirm',
          onPress: () => {
            deleteDevice();
          },
        },
      ],
      {cancelable: true},
    );
  };
  return (
    <>
      <View
        style={{
          ...flexSpace,
          backgroundColor: colors.WHITE,
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('TroubleShootingCategories', {
              deviceId: item._id,
            });
          }}>
          <Icon name="devices" size={50} color={colors.BLUE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{flex: 1, paddingHorizontal: 10}}
          onPress={() => {
            navigation.navigate('TroubleShootingCategories', {
              deviceId: item._id,
              deviceName: item.name,
            });
          }}>
          <View>
            <Text style={{color: colors.BLACK, fontSize: 20}}>{item.name}</Text>
            <Text>
              Date Created: {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
        <Pressable onPress={() => handleDelete()}>
          <View>
            <Icon2 name="trash" size={30} />
          </View>
        </Pressable>
      </View>
      <FullPageLoader isLoading={isLoading} />
    </>
  );
}

export default DeviceItem;
