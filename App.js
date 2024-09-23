import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite'

export default function App() {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState([]);
  const inputFocus = useRef(null);

  const db = SQLite.openDatabaseSync('shoppingdb');

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS shoplist (id INTEGER PRIMARY KEY NOT NULL, item TEXT, amount TEXT);
      `);
      updateList();
    } catch (error) {
      console.error('Could not open database', error);
    }
  }

  useEffect(() => { 
    initialize();
    inputFocus.current.focus();
  }, []);

  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from shoplist');
      setItems(list);
    } catch (error) {
      console.error('Could not get items', error);
    }
  }

  const saveItem = async () => {
    try {
      await db.runAsync('INSERT INTO shoplist VALUES (?, ?, ?)', null, item, amount);
      updateList();
      handleClear();
    } catch (error) {
      console.error('Could not add item', error);
    }
  };

  const deleteItem = async (id) => {
    console.log('deleteItem')
    try {
      await db.runAsync('DELETE FROM shoplist WHERE id=?', id);
      updateList();
    }
    catch (error) {
      console.error('Could not delete item', error);
    }
  }

  const handleClear = () => {
    setItem('');
    setAmount('');
    inputFocus.current.focus();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Enter item'
          onChangeText={text => setItem(text)}
          value={item}
          ref={inputFocus}
        />
        <TextInput
          style={styles.input}
          placeholder='Enter amount'
          onChangeText={text => setAmount(text)}
          value={amount}
        />

        <View style={styles.buttonContainer}>
          <Button title='ADD' onPress={saveItem} />
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            <View style={styles.listItemContainer}>
              <Text style={styles.listItem}>{item.item}, </Text>
              <Text style={styles.listItem}>{item.amount}</Text>
              <Text style={styles.deletePress} onPress={() => deleteItem(item.id)}>  Bought</Text>
            </View>
          }
          ListHeaderComponent={<Text style={styles.listHeader}>Shopping List</Text>}
          ListEmptyComponent={<Text style={styles.listEmpty}>No items to get...</Text>}
        />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 18,
    width: 200,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8
  },
  buttonContainer: {
    marginTop: 40,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 10
  },
  listContainer: {
    flex: 3,
  },
  listHeader: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '600',
    color: '#008b8b',
    textShadowColor: '#404040',
    textShadowOffset: { width: 1, height: -1 },
    textShadowRadius: 1,
  },
  listEmpty: {
    fontSize: 15,
    marginTop: 20,
  },
  list: {
    textAlign: 'left',
    marginLeft: 20,
  },
  listItemContainer: {
    flexDirection: 'row',
    fontSize: '25px'
  },
  listItem: {
    fontSize: 19,
  },
  deletePress: {
    color: '#009DCF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
