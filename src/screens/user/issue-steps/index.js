import React, {useState, useEffect} from 'react';
import {
  Dimensions,
  Image,
  View,
  Text,
  ScrollView,
  Button,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {ALERT_TYPE, Dialog, Root, Toast} from 'react-native-alert-notification';
import {useSelector} from 'react-redux';
import app from '../../../constants/app';
import colors from '../../../constants/colors';
import {commonInput, flexCenter, flexSpace} from '../../../constants/styles';
import {errorHandler, toastMessage} from '../../../helpers';
import Modal from 'react-native-modal';
import Axios from 'axios';
const {width} = Dimensions.get('window');
function IssueSteps({navigation, route}) {
  const {db} = useSelector(state => state.db);
  const {token} = useSelector(state => state.user);
  const {deviceId, issueId} = route.params;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(null);
  const [issueSteps, setIssueSteps] = useState([]);
  const [stepItems, setStepItems] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [description, setDescription] = useState('');
  const [deviceModal, setDeviceModal] = useState('');
  const [isSubmittingTicket, setIsSubmittingTecket] = useState(false);

  useEffect(() => {
    const steps = db
      .find(item => item._id == deviceId)
      ?.troubleshootingSteps.filter(
        item => item.deviceId == deviceId && item.issueId == issueId,
      );
    if (steps && steps.length > 0) {
      setIssueSteps(steps);
    }
  }, [deviceId, issueId]);

  useEffect(() => {
    if (issueSteps.length > 0 && issueSteps[currentStepIndex]) {
      setCurrentStep(issueSteps[currentStepIndex]);
      setStepItems(
        db
          .find(item => item._id == deviceId)
          ?.stepItems.filter(
            item => item.stepId == issueSteps[currentStepIndex]._id,
          ),
      );
    }
  }, [currentStepIndex, issueSteps]);

  const handleNext = () => {
    if (currentStepIndex < issueSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      toastMessage('success', 'Switched to previous step');
    } else {
      setShowTicketModal(true);
    }
  };

  const handleSubmit = () => {
    if (description.trim() === '' || deviceModal.trim() === '') {
      toastMessage('error', 'All fields are required to submit a ticket');
    } else {
      setIsSubmittingTecket(true);
      Axios.post(app.backendUrl + '/tickets/', {
        description,
        deviceModal,
        token,
        deviceId,
        issueId,
      })
        .then(res => {
          setIsSubmittingTecket(false);
          setDeviceModal('');
          setDescription('');
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: res.data.msg,
            button: 'close',
            onHide: () => navigation.navigate('Home'),
          });
        })
        .catch(error => {
          console.log(JSON.stringify(error.response));
          errorHandler(error);
          setIsSubmittingTecket(false);
        });
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.BACKGROUND_COLOR}}>
      {/* header */}
      <View
        style={{
          minHeight: 180,
          borderBottomRightRadius: 50,
          position: 'relative',
        }}>
        <Image
          source={require('../../../../assets/bg.jpg')}
          style={{width, height: 180, borderBottomRightRadius: 50}}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            width,
            height: '100%',
            borderBottomRightRadius: 50,
            paddingHorizontal: 10,
            paddingVertical: 30,
          }}>
          <View style={{position: 'relative', height: '100%', marginTop: 30}}>
            <View style={{bottom: 0, position: 'absolute', paddingBottom: 10}}>
              <Text
                style={{
                  color: colors.WHITE,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                {db.length > 0 && db.find(item => item._id == deviceId)?.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.BLACK,
                  fontSize: 20,
                  fontWeight: '600',
                }}>
                {db.length > 0 &&
                  db
                    .find(item => item._id == deviceId)
                    ?.deviceIssues.find(item => item._id == issueId)?.title}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {/* header */}
      <ScrollView>
        <View style={{padding: 10}}>
          {currentStep !== null && (
            <View>
              <View style={{...flexSpace, alignItems: 'flex-start'}}>
                <Text
                  style={{
                    color: colors.BLACK,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: 25,
                  }}>
                  {currentStep.title}
                </Text>
                <Text
                  style={{
                    color: colors.BLACK,
                  }}>
                  {currentStepIndex + 1}/{issueSteps.length}
                </Text>
              </View>
              {stepItems.map((item, index) => (
                <View key={index} style={{marginVertical: 5}}>
                  {item.type == 'text' && (
                    <Text style={{color: colors.BLACK}}>{item.value}</Text>
                  )}
                  {item.type == 'image' && (
                    <Image
                      source={{uri: app.imageUrl + item.value}}
                      style={{
                        width: '100%',
                        height: undefined,
                        aspectRatio: 1,
                        marginVertical: 10,
                      }}
                    />
                  )}
                </View>
              ))}
              <View style={{...flexCenter, paddingVertical: 15}}>
                <Text
                  style={{color: colors.RED, marginBottom: 10, fontSize: 18}}>
                  Is the problem solved?
                </Text>
                <View style={{...flexCenter, flexDirection: 'row'}}>
                  <Button title="YES" color="green" />
                  {currentStepIndex > 0 && (
                    <View style={{marginLeft: 10}}>
                      <Button
                        title="Prev Step"
                        onPress={() =>
                          setCurrentStepIndex(currentStepIndex - 1)
                        }
                      />
                    </View>
                  )}
                  <View style={{marginLeft: 10}}>
                    <Button
                      title="Not yet, Next Step"
                      onPress={() => handleNext()}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationOutTiming={700}
        isVisible={showTicketModal}
        style={{padding: 0, margin: 0}}>
        <View
          style={{
            flex: 1,
            position: 'relative',
          }}>
          <Pressable
            onPress={() => {
              setShowTicketModal(false);
            }}>
            <View style={{height: '100%'}}></View>
          </Pressable>
          <View style={{position: 'absolute', bottom: 0, width}}>
            <View
              style={{
                backgroundColor: colors.WHITE,
                paddingHorizontal: 10,
                paddingVertical: 20,
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
              }}>
              <View
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                }}>
                <View>
                  <Text style={{color: colors.RED, fontSize: 25}}>
                    Sorry for the inconvenience!
                  </Text>
                  <Text>
                    You have reached out the end of our troubleshooting steps
                    regarding this issue. If the steps mentioned didn't help you
                    to reach to the final solution expected, You can raise a
                    ticket by entering your ticket description in the textfield
                    below. We will check your ticket and keep finding solutions
                    for the scanario and keep you updated.
                  </Text>
                  <View>
                    <TextInput
                      style={{
                        ...commonInput,
                        textAlignVertical: 'top',
                        maxHeight: 100,
                      }}
                      placeholder="Enter description here"
                      multiline={true}
                      numberOfLines={4}
                      value={description}
                      onChangeText={text => setDescription(text)}
                    />
                    <TextInput
                      style={{...commonInput}}
                      placeholder="Enter Device Model"
                      value={deviceModal}
                      onChangeText={text => setDeviceModal(text)}
                    />
                    {isSubmittingTicket ? (
                      <ActivityIndicator
                        color={colors.BLUE}
                        size={50}
                        style={{marginTop: 10}}
                      />
                    ) : (
                      <View
                        style={{
                          ...flexCenter,
                          flexDirection: 'row',
                          marginTop: 10,
                        }}>
                        <Button
                          title="Close"
                          color={colors.RED}
                          onPress={() => setShowTicketModal(false)}
                        />
                        <View style={{marginLeft: 10}}>
                          <Button
                            title="Submit Ticket"
                            onPress={() => handleSubmit()}
                          />
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Root theme="light" />
    </View>
  );
}

export default IssueSteps;
