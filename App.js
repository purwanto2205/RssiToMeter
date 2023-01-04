import React, { useState } from 'react'
import { BleManager } from 'react-native-ble-plx'
import { PermissionsAndroid, Platform, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, View, StatusBar, Switch } from 'react-native'

const manager = new BleManager()

const App = () => {
  const [btList, setBTList] = useState([])
  const [hideUntiled, setHideUntitled] = useState(false)
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

  const stopScan = () => {
    setIsScanning(false)
    manager.stopDeviceScan()
  }

  const onScan = async () => {
    if (isScanning) {
      stopScan()
      return 
    }
    const granted = await permissionChecking()
    setIsScanning(true)
    setTimeout(() => {
      stopScan()
    }, 15000)
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('[error]:', error)
        setIsScanning(false)
        return
      }
      setBTList(d => {
        const newD = [...d]
        const idx = newD.findIndex(dv => dv.id === device.id)
        if (idx >=0) {
          newD[idx] = {...device, distance: distanceFormula(device.rssi)}
        } else {
          newD.push({...device, distance: distanceFormula(device.rssi)})
        }
        return newD 
      })
    })
  }

  const distanceFormula = (rssi) => {
    // 10 ^ ((Measured Power -RSSI)/(10 * N))
    const power = -69
    const distance = Math.pow(10, (power - rssi) / (10 * 3)).toFixed(2)
    return distance 
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#FFFFFF'} />
      <View style={styles.header}>
        <Text style={styles.appTitle}>BT Distance</Text>
        <View style={styles.row}>
          <Text style={styles.appFounder}>by Purwanto</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.hideUntiled}>Hide untitled</Text>
          <Switch style={{marginLeft: 5}} value={hideUntiled} onChange={() => setHideUntitled(v => !v)} />
        </View>
        </View>
      </View>
      <ScrollView>
      {
        btList
        .sort((a, b) => a.distance - b.distance)
        .filter(f => hideUntiled ? f.localName : true)
        .map((bl, blI) => (
          <TouchableOpacity style={[styles.btList, {
            borderLeftColor: bl.name ? '#19AD64' : '#AFB9C5'
          }]} key={blI} >
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.numbering}>{blI + 1}</Text>
              <View>
                <Text style={styles.btTitle}>{bl.name??'untitled'}</Text>
                <Text style={styles.btId}>{bl.id}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.distance}>{bl.distance} m</Text>
            </View>
          </TouchableOpacity>
        ))
      }
      </ScrollView>
      <TouchableOpacity
        onPress={onScan}
        style={styles.button}>
        <Text style={{color: 'white'}}>
          {isScanning ? 'STOP' : 'SCAN'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F5'
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginBottom: 10,
  },
  appTitle: {color: '#4C5A69', fontWeight: 'bold', fontSize: 25},
  appFounder: {color: '#4C5A69'},
  button: {
    margin: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FE4F8A'
  },
  btList: {
    padding: 10,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderLeftWidth: 5,
    borderLeftColor: '#19AD64',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  distance: {
    fontSize: 12,
    color: '#4C5A69'
  },
  hideUntiled: {
    fontSize: 12,
    color: '#4C5A69',
  },
  numbering: {
    fontSize: 25,
    marginRight: 15,
    fontWeight: 'bold',
    color: '#AFB8C3',
  },
  btId: {
    fontSize: 10,
    color: '#AFB8C3',
  },
  btTitle: {
    fontSize: 14,
    color: '#4C5A69',
    fontWeight: 'bold',
  }
})