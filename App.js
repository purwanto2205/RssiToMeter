import React, { useState } from 'react'
import { BleManager } from 'react-native-ble-plx'
import { PermissionsAndroid, Platform, Text, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'

const manager = new BleManager()

const App = () => {
  const [btList, setBTList] = useState([])
  const [isScanning, setIsScanning] = useState(false)

  const permissionChecking = () => {
    return new Promise(async(resolve, reject) => {
      try {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        if (Platform.Version < 31) {
          resolve(result === PermissionsAndroid.RESULTS.GRANTED)
        }
        const results = await PermissionsAndroid.requestMultiple(
          [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]
          )
        resolve(
          result === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN] === PermissionsAndroid.RESULTS.GRANTED &&
          result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
          )
      } catch (e) {
        reject(e)
      }
    })
  }

  const onScan = async () => {
    if (isScanning) {
      setIsScanning(false)
      manager.stopDeviceScan()
      return 
    }
    const granted = await permissionChecking()
    setIsScanning(true)
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('[error]:', error)
        setIsScanning(false)
        return
      }
      setBTList(d => d.find((dv) => dv.id === device.id) ? d : d.concat(device))
    })
  }
  return (
    <SafeAreaView style={styles.container}>
      <Text>BT Distance APP</Text>
      <Text>by Purwanto</Text>
      <ScrollView>
      {
        btList.map((bl, blI) => (
          <TouchableOpacity style={styles.btList} key={blI} >
            <Text>{bl.id}</Text>
            <Text>{bl.name}</Text>
          </TouchableOpacity>
        ))
      }
      </ScrollView>
      <Button
        onPress={onScan}
        style={styles.button}
        title={isScanning ? 'STOP' : 'SCAN'} />
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  button: {
    margin: 12
  },
  btList: {
    padding: 10,
  }
})