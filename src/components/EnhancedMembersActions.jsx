import { View } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { usePermissions } from '../hooks/usePermissions';
import { RoleGuard } from './RoleGuard';

export const EnhancedMembersActions = ({ 
  onInvite, 
  onManageRequests, 
  onExportData,
  pendingRequestsCount = 0 
}) => {
  const { hasPermission } = usePermissions();

  return (
    <View>
      <RoleGuard requiredPermissions={['canInviteMembers']}>
        <Button
          mode="contained"
          icon="account-plus"
          onPress={onInvite}
          style={{ marginBottom: 8 }}
        >
          Invite New Member
        </Button>
      </RoleGuard>

      <RoleGuard requiredPermissions={['canApproveRequests']}>
        <Button
          mode="outlined"
          icon="account-clock"
          onPress={onManageRequests}
          style={{ marginBottom: 8 }}
        >
          Pending Requests ({pendingRequestsCount})
        </Button>
      </RoleGuard>

      <RoleGuard requiredPermissions={['canManageOrganization']}>
        <Divider style={{ marginVertical: 8 }} />
        <Button
          mode="text"
          icon="download"
          onPress={onExportData}
          style={{ marginBottom: 8 }}
        >
          Export Member Data
        </Button>
      </RoleGuard>
    </View>
  );
};