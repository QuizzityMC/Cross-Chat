import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    setError('');
    const result = await register(username, email, password, displayName);

    if (result.success) {
      navigation.replace('ChatList');
    } else {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>💬</Text>
          <Text style={styles.title}>Cross-Chat</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#8696a0"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8696a0"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8696a0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#8696a0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111b21',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e9edef',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8696a0',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#202c33',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#e9edef',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00a884',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#8696a0',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  linkBold: {
    color: '#00a884',
    fontWeight: 'bold',
  },
  error: {
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default RegisterScreen;
