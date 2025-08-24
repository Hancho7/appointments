// src/utils/shareUtils.js
import * as Clipboard from 'expo-clipboard';
import { Alert, Platform, Share } from 'react-native';

/**
 * Share organization code using native share dialog
 */
export const shareOrganizationCode = async (organizationCode, organizationName) => {
  if (!organizationCode) {
    throw new Error('Organization code is required');
  }

  if (!organizationName) {
    organizationName = 'Our Organization';
  }

  try {
    const message = `Join my organization "${organizationName}" on Walk-in Appointment System!\n\nOrganization Code: ${organizationCode}\n\nUse this code to join our organization and start managing appointments together.`;

    const shareOptions = {
      message: message,
      title: `Join ${organizationName} on Walk-in`,
    };

    // Add subject for email sharing on Android
    if (Platform.OS === 'android') {
      shareOptions.subject = `Join ${organizationName} on Walk-in Appointment System`;
    }

    const result = await Share.share(shareOptions);

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('Shared via:', result.activityType);
      } else {
        console.log('Shared successfully');
      }
      return { success: true, result };
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed by user');
      return { success: false, dismissed: true };
    }
    
    return { success: true, result };
  } catch (error) {
    console.error('Error sharing organization code:', error);
    
    // Handle specific error cases
    if (error.message.includes('User did not share')) {
      return { success: false, dismissed: true };
    }
    
    throw new Error('Failed to share organization code. Please try again.');
  }
};

/**
 * Copy text to clipboard with success feedback
 */
export const copyToClipboard = async (text, successMessage = 'Copied to clipboard!') => {
  if (!text) {
    throw new Error('No text provided to copy');
  }

  try {
    await Clipboard.setStringAsync(text);
    
    // Show success alert
    Alert.alert('Success', successMessage, [{ text: 'OK' }]);
    
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    
    // Show error alert
    Alert.alert(
      'Copy Failed', 
      'Failed to copy to clipboard. Please try again.', 
      [{ text: 'OK' }]
    );
    
    return false;
  }
};

/**
 * Enhanced sharing with deep link support (optional feature)
 */
export const shareWithDeepLink = async (organizationCode, organizationName, appUrl) => {
  if (!organizationCode) {
    throw new Error('Organization code is required');
  }

  try {
    const baseMessage = `Join my organization "${organizationName || 'Our Organization'}" on Walk-in Appointment System!\n\nOrganization Code: ${organizationCode}`;
    
    let shareOptions = {
      title: `Join ${organizationName || 'Our Organization'}`,
    };

    if (appUrl) {
      const deepLinkUrl = `${appUrl}/join?code=${organizationCode}`;
      
      if (Platform.OS === 'ios') {
        shareOptions.message = `${baseMessage}\n\n${deepLinkUrl}`;
      } else {
        shareOptions.message = baseMessage;
        shareOptions.url = deepLinkUrl;
      }
    } else {
      shareOptions.message = baseMessage;
    }

    return await Share.share(shareOptions);
  } catch (error) {
    console.error('Error sharing with deep link:', error);
    throw new Error('Failed to share organization code');
  }
};

/**
 * Get clipboard content (useful for pasting organization codes)
 */
export const getClipboardContent = async () => {
  try {
    const clipboardContent = await Clipboard.getStringAsync();
    return clipboardContent;
  } catch (error) {
    console.error('Error reading clipboard:', error);
    return null;
  }
};

/**
 * Validate if a string looks like an organization code
 */
export const isValidOrganizationCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Assuming organization codes are alphanumeric and 6-12 characters
  // Adjust this regex based on your actual code format
  const codeRegex = /^[A-Z0-9]{6,12}$/i;
  return codeRegex.test(code.trim());
};

/**
 * Share organization code with custom message
 */
export const shareOrganizationCodeWithCustomMessage = async (
  organizationCode, 
  organizationName, 
  customMessage
) => {
  if (!organizationCode) {
    throw new Error('Organization code is required');
  }

  try {
    const message = customMessage || 
      `Join my organization "${organizationName || 'Our Organization'}" on Walk-in Appointment System!\n\nOrganization Code: ${organizationCode}`;

    const result = await Share.share({
      message: message,
      title: `Join ${organizationName || 'Our Organization'}`,
    });

    return result;
  } catch (error) {
    console.error('Error sharing with custom message:', error);
    throw new Error('Failed to share organization code');
  }
};

/**
 * Show share options with both copy and share functionality
 */
export const showShareOptions = (organizationCode, organizationName) => {
  if (!organizationCode) {
    Alert.alert('Error', 'Organization code not available');
    return;
  }

  Alert.alert(
    'Share Organization Code',
    `Share the code "${organizationCode}" for ${organizationName || 'your organization'}`,
    [
      {
        text: 'Copy Code',
        onPress: () => copyToClipboard(organizationCode, 'Organization code copied!'),
      },
      {
        text: 'Share',
        onPress: () => shareOrganizationCode(organizationCode, organizationName)
          .catch(error => {
            if (!error.dismissed) {
              Alert.alert('Share Failed', error.message);
            }
          }),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};