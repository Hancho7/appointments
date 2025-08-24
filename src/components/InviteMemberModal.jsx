// components/InviteMemberModal.jsx
import { useState } from 'react';
import { Alert } from 'react-native';
import {
    Button,
    Dialog,
    Paragraph,
    Portal,
    TextInput,
    useTheme
} from 'react-native-paper';
import { organizationService } from '../api/organizationService';

export default function InviteMemberModal({ visible, onDismiss, onInviteSent }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      await organizationService.inviteMember({
        email: email,
        message: message || `You've been invited to join our organization!`
      });
      
      Alert.alert('Success', 'Invitation sent successfully!');
      setEmail('');
      setMessage('');
      onInviteSent();
      onDismiss();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      Alert.alert('Error', error.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: theme.colors.background }}>
        <Dialog.Title>Invite Member</Dialog.Title>
        <Dialog.Content>
          <Paragraph style={{ marginBottom: 16 }}>
            Send an invitation to join your organization. The recipient will receive an email with the organization code.
          </Paragraph>
          
          <TextInput
            label="Email Address *"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: 16 }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Personal Message (Optional)"
            value={message}
            onChangeText={setMessage}
            style={{ marginBottom: 16 }}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Add a personal message to your invitation..."
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onPress={handleInvite} 
            loading={isLoading}
            disabled={isLoading}
            mode="contained"
          >
            Send Invitation
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}